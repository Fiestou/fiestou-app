import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import { Eye, RefreshCw, Search } from "lucide-react";
import Template from "@/src/template";
import Api from "@/src/services/api";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import { DataTable } from "@/src/components/painel";
import type { Column } from "@/src/components/painel";
import { getImage, moneyFormat } from "@/src/helper";

interface OrderStore {
  id: number;
  slug?: string;
  title?: string;
  companyName?: string;
  partnerName?: string;
  partnerEmail?: string;
  orderTotal?: number;
  orderId?: number;
  cover?: any;
  profile?: any;
}

interface OrderCustomer {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

interface OrderListItem {
  id?: number;
  product?: {
    id?: number;
    title?: string;
    gallery?: any;
  };
  product_id?: number;
  name?: string;
}

interface OrderData {
  groupHash?: string;
  mainOrderId: number;
  orderIds: number[];
  ordersCount: number;
  total: number;
  status: string | number;
  statusText: string;
  deliveryStatus: string;
  createdAt: string;
  customer: OrderCustomer;
  stores: OrderStore[];
  deliveryAddress?: any;
  metadata?: any;
  listItems?: OrderListItem[];
}

interface OrderPageProps {
  initialOrders: OrderData[];
  timestamp: number;
}

interface ApiResponse {
  data?: OrderData[];
}

type NormalizedStatus = "paid" | "processing" | "pending" | "failed" | "canceled";

type ProductPreview = {
  key: string;
  title: string;
  image: string;
};

const STATUS_LABELS: Record<NormalizedStatus, string> = {
  paid: "Pago",
  processing: "Processando",
  pending: "Pendente",
  failed: "Falhou",
  canceled: "Cancelado",
};

function normalizeOrderStatus(order: OrderData): NormalizedStatus {
  const paymentStatus = String(order?.metadata?.payment_status || "").toLowerCase();
  const statusText = String(order?.statusText || "").toLowerCase();

  if (
    order.status === 1 ||
    paymentStatus === "paid" ||
    paymentStatus === "approved" ||
    statusText.includes("pago")
  ) {
    return "paid";
  }

  if (paymentStatus === "processing" || statusText.includes("process")) {
    return "processing";
  }

  if (
    paymentStatus === "failed" ||
    statusText.includes("falhou") ||
    statusText.includes("negado")
  ) {
    return "failed";
  }

  if (
    paymentStatus === "canceled" ||
    paymentStatus === "expired" ||
    order.status === -2 ||
    statusText.includes("cancel")
  ) {
    return "canceled";
  }

  return "pending";
}

function getPaymentMethodCode(order: OrderData): string {
  return String(order?.metadata?.payment_method || order?.metadata?.transaction_type || "").toLowerCase();
}

function getPaymentMethodLabel(order: OrderData): string {
  if (order?.metadata?.payment_method_display) {
    return order.metadata.payment_method_display;
  }

  const method = getPaymentMethodCode(order);
  if (!method) return "Não informado";
  if (method === "credit_card") return "Cartão de crédito";
  if (method === "pix") return "PIX";
  if (method === "boleto") return "Boleto bancário";
  return method;
}

function getProductPreviews(
  order: OrderData,
  resolvedGalleryByProductId: Record<number, any[]>
): ProductPreview[] {
  const previews: ProductPreview[] = [];
  const seen = new Set<string>();

  for (const item of order.listItems || []) {
    const productId = Number((item?.product?.id ?? item?.product_id) || 0);
    const productTitle = item?.product?.title || item?.name || "Produto";
    let productGallery = item?.product?.gallery;

    if (
      !getImage(productGallery, "thumb") &&
      productId > 0 &&
      Array.isArray(resolvedGalleryByProductId[productId]) &&
      resolvedGalleryByProductId[productId].length > 0
    ) {
      productGallery = resolvedGalleryByProductId[productId];
    }

    const productImage = getImage(productGallery, "thumb");
    const key = `${productId || "no-id"}-${productTitle}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    previews.push({
      key,
      title: productTitle,
      image: productImage,
    });

    if (previews.length >= 4) {
      break;
    }
  }

  return previews;
}

export default function AdminOrdersPage({ initialOrders, timestamp }: OrderPageProps) {
  const router = useRouter();
  const [orders, setOrders] = useState<OrderData[]>(Array.isArray(initialOrders) ? initialOrders : []);
  const [resolvedGalleryByProductId, setResolvedGalleryByProductId] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(!initialOrders?.length);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [paymentFilter, setPaymentFilter] = useState<string>("all");

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);

    try {
      const api = new Api();
      const response = (await api.bridge({
        method: "get",
        url: "orders/list",
      })) as ApiResponse;

      if (Array.isArray(response?.data)) {
        setOrders(response.data);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Erro ao buscar pedidos no admin", err);
      setError("Não foi possível carregar os pedidos agora.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (Array.isArray(initialOrders) && initialOrders.length > 0) {
      setOrders(initialOrders);
      setLoading(false);
      setError(null);
    } else {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timestamp]);

  useEffect(() => {
    let active = true;

    const resolveMissingGalleries = async () => {
      const productIds = new Set<number>();

      for (const order of orders) {
        for (const item of order.listItems || []) {
          const productId = Number((item?.product?.id ?? item?.product_id) || 0);
          if (!productId) continue;
          if (resolvedGalleryByProductId[productId]?.length) continue;
          if (getImage(item?.product?.gallery, "thumb")) continue;

          productIds.add(productId);
        }
      }

      if (!productIds.size) return;

      const api = new Api();
      const responses = await Promise.allSettled(
        Array.from(productIds).map(async (productId) => {
          const response: any = await api.request({
            method: "get",
            url: "request/product",
            data: { id: productId },
          });

          return {
            productId,
            gallery: Array.isArray(response?.data?.gallery)
              ? response.data.gallery
              : [],
          };
        })
      );

      if (!active) return;

      setResolvedGalleryByProductId((prev) => {
        const next = { ...prev };
        let changed = false;

        for (const result of responses) {
          if (result.status !== "fulfilled") continue;
          if (!result.value.gallery.length) continue;
          if (next[result.value.productId]?.length) continue;

          next[result.value.productId] = result.value.gallery;
          changed = true;
        }

        return changed ? next : prev;
      });
    };

    resolveMissingGalleries();

    return () => {
      active = false;
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const normalizedStatus = normalizeOrderStatus(order);
      const paymentCode = getPaymentMethodCode(order);
      const normalizedSearch = search.trim().toLowerCase();

      if (statusFilter !== "all" && normalizedStatus !== statusFilter) {
        return false;
      }

      if (paymentFilter !== "all") {
        if (paymentFilter === "unknown" && paymentCode) {
          return false;
        }
        if (paymentFilter !== "unknown" && paymentCode !== paymentFilter) {
          return false;
        }
      }

      if (!normalizedSearch) {
        return true;
      }

      const storesText = (order.stores || [])
        .map((store) => `${store.companyName || ""} ${store.title || ""} ${store.partnerName || ""} ${store.partnerEmail || ""}`)
        .join(" ")
        .toLowerCase();

      const productsText = (order.listItems || [])
        .map((item) => `${item?.product?.title || ""} ${item?.name || ""}`)
        .join(" ")
        .toLowerCase();

      const customerText = `${order.customer?.name || ""} ${order.customer?.email || ""} ${order.customer?.phone || ""}`.toLowerCase();

      return (
        String(order.mainOrderId).includes(normalizedSearch) ||
        String(order.groupHash || "").toLowerCase().includes(normalizedSearch) ||
        customerText.includes(normalizedSearch) ||
        storesText.includes(normalizedSearch) ||
        productsText.includes(normalizedSearch)
      );
    });
  }, [orders, search, statusFilter, paymentFilter]);

  const stats = useMemo(() => {
    const paid = orders.filter((order) => normalizeOrderStatus(order) === "paid").length;
    const pending = orders.filter((order) => normalizeOrderStatus(order) === "pending").length;
    const multiStore = orders.filter((order) => (order.ordersCount || 0) > 1).length;

    return {
      total: orders.length,
      paid,
      pending,
      multiStore,
    };
  }, [orders]);

  const columns: Column<OrderData>[] = useMemo(() => {
    return [
      {
        key: "mainOrderId",
        label: "Pedido",
        sortable: true,
        className: "w-32",
        render: (row) => (
          <div>
            <p className="font-semibold text-zinc-900">#{row.mainOrderId}</p>
            {row.ordersCount > 1 && (
              <p className="text-xs text-zinc-500">{row.ordersCount} lojas no grupo</p>
            )}
          </div>
        ),
      },
      {
        key: "customer",
        label: "Cliente",
        render: (row) => (
          <div className="min-w-[12rem]">
            <p className="font-medium text-zinc-900 truncate">{row.customer?.name || "N/A"}</p>
            <p className="text-xs text-zinc-500 truncate">{row.customer?.email || "N/A"}</p>
            {!!row.customer?.phone && <p className="text-xs text-zinc-400">{row.customer.phone}</p>}
          </div>
        ),
      },
      {
        key: "stores",
        label: "Lojas",
        render: (row) => {
          const stores = row.stores || [];
          if (stores.length === 0) {
            return <span className="text-zinc-400 text-sm">Sem loja vinculada</span>;
          }

          return (
            <div className="space-y-2 min-w-[15rem]">
              {stores.slice(0, 2).map((store) => {
                const storeAvatar = getImage(store.profile || store.cover, "thumb");
                const storeName = store.companyName || store.title || "Loja";

                return (
                  <div key={`${row.mainOrderId}-${store.id}`} className="flex items-center gap-2">
                    {storeAvatar ? (
                      <Image
                        src={storeAvatar}
                        alt={storeName}
                        width={32}
                        height={32}
                        unoptimized
                        className="w-8 h-8 rounded-full object-cover border border-zinc-200"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-xs font-semibold text-zinc-500">
                        {storeName.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-zinc-800 truncate">{storeName}</p>
                      <p className="text-xs text-zinc-500 truncate">{store.partnerName || "Parceiro não informado"}</p>
                    </div>
                  </div>
                );
              })}
              {stores.length > 2 && (
                <p className="text-xs text-zinc-400">+{stores.length - 2} loja(s)</p>
              )}
            </div>
          );
        },
      },
      {
        key: "listItems",
        label: "Produtos",
        render: (row) => {
          const previews = getProductPreviews(row, resolvedGalleryByProductId);

          if (!previews.length) {
            return <span className="text-zinc-400 text-sm">Sem itens</span>;
          }

          return (
            <div className="space-y-2 min-w-[16rem]">
              <div className="flex items-center gap-2">
                {previews.slice(0, 3).map((item) => (
                  <div
                    key={item.key}
                    className="w-10 h-10 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 flex items-center justify-center"
                    title={item.title}
                  >
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.title}
                        width={40}
                        height={40}
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-[10px] text-zinc-500">SEM IMG</span>
                    )}
                  </div>
                ))}
              </div>
              <p className="text-xs text-zinc-500 truncate" title={previews[0]?.title}>
                {previews[0]?.title || "Produto"}
                {(row.listItems?.length || 0) > 1 ? ` +${(row.listItems?.length || 0) - 1} item(ns)` : ""}
              </p>
            </div>
          );
        },
      },
      {
        key: "metadata",
        label: "Pagamento",
        render: (row) => {
          const methodLabel = getPaymentMethodLabel(row);
          const normalizedStatus = normalizeOrderStatus(row);
          const installments = Number(row?.metadata?.installments || 0);
          const isCard = getPaymentMethodCode(row) === "credit_card";

          return (
            <div>
              <p className="font-medium text-zinc-800">{methodLabel}</p>
              {isCard && installments > 1 && (
                <p className="text-xs text-zinc-500">{installments}x</p>
              )}
              <p
                className={`text-xs mt-1 font-medium ${
                  normalizedStatus === "paid"
                    ? "text-green-600"
                    : normalizedStatus === "failed" || normalizedStatus === "canceled"
                    ? "text-red-600"
                    : "text-amber-600"
                }`}
              >
                {STATUS_LABELS[normalizedStatus]}
              </p>
            </div>
          );
        },
      },
      {
        key: "total",
        label: "Total",
        sortable: true,
        className: "w-32",
        render: (row) => (
          <span className="font-semibold text-zinc-900">R$ {moneyFormat(Number(row.total || 0))}</span>
        ),
      },
      {
        key: "createdAt",
        label: "Data",
        sortable: true,
        className: "w-40",
        render: (row) => (
          <span className="text-sm text-zinc-600">
            {new Date(row.createdAt).toLocaleDateString("pt-BR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </span>
        ),
      },
      {
        key: "actions",
        label: "Ações",
        className: "w-28",
        render: (row) => (
          <Link
            href={`/admin/pedidos/${row.mainOrderId}`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 bg-white text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <Eye size={14} />
            Ver
          </Link>
        ),
      },
    ];
  }, [resolvedGalleryByProductId]);

  return (
    <Template
      header={{
        template: "admin",
        position: "solid",
      }}
    >
      <section>
        <div className="container-medium pt-10" style={{ maxWidth: "110rem" }}>
          <Breadcrumbs
            links={[
              { url: "/admin", name: "Admin" },
              { url: "/admin/pedidos", name: "Pedidos" },
            ]}
          />

          <div className="mt-6 flex flex-col gap-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-title font-bold text-3xl text-zinc-900">Pedidos</h1>
                <p className="text-sm text-zinc-500 mt-1">Visão completa de pedidos, lojas e pagamentos</p>
              </div>

              <button
                type="button"
                onClick={() => router.replace(`/admin/pedidos?t=${Date.now()}`)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-zinc-200 text-sm font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
              >
                <RefreshCw size={14} />
                Atualizar
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <div className="bg-white border border-zinc-200 rounded-xl p-4">
                <p className="text-xs text-zinc-500">Total de pedidos</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-4">
                <p className="text-xs text-zinc-500">Pagos</p>
                <p className="text-2xl font-bold text-green-600 mt-1">{stats.paid}</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-4">
                <p className="text-xs text-zinc-500">Pendentes</p>
                <p className="text-2xl font-bold text-amber-600 mt-1">{stats.pending}</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-4">
                <p className="text-xs text-zinc-500">Multiloja</p>
                <p className="text-2xl font-bold text-blue-600 mt-1">{stats.multiStore}</p>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-xl p-4">
              <div className="flex flex-col lg:flex-row gap-3">
                <div className="relative flex-1">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar por pedido, cliente, loja ou produto"
                    className="w-full h-11 pl-10 pr-3 rounded-lg border border-zinc-200 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none text-sm"
                  />
                </div>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="h-11 px-3 rounded-lg border border-zinc-200 text-sm text-zinc-700 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                >
                  <option value="all">Todos os status</option>
                  <option value="paid">Pagos</option>
                  <option value="pending">Pendentes</option>
                  <option value="processing">Processando</option>
                  <option value="failed">Falhos</option>
                  <option value="canceled">Cancelados</option>
                </select>

                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="h-11 px-3 rounded-lg border border-zinc-200 text-sm text-zinc-700 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                >
                  <option value="all">Todos pagamentos</option>
                  <option value="credit_card">Cartão de crédito</option>
                  <option value="pix">PIX</option>
                  <option value="boleto">Boleto</option>
                  <option value="unknown">Não informado</option>
                </select>

                <button
                  type="button"
                  onClick={fetchOrders}
                  className="h-11 px-4 rounded-lg bg-zinc-900 text-white text-sm font-medium hover:bg-zinc-800 transition-colors"
                >
                  Recarregar lista
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-5 pb-12">
        <div className="container-medium" style={{ maxWidth: "110rem" }}>
          {error ? (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-center">
              <p>{error}</p>
              <button
                type="button"
                onClick={fetchOrders}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-800 text-sm font-medium transition-colors"
              >
                <RefreshCw size={14} />
                Tentar novamente
              </button>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={filteredOrders}
              keyField="mainOrderId"
              pageSize={12}
              loading={loading}
              emptyMessage="Nenhum pedido encontrado"
            />
          )}
        </div>
      </section>
    </Template>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  const api = new Api();

  try {
    const request = (await api.bridge({
      method: "get",
      url: "orders/list",
    })) as ApiResponse;

    return {
      props: {
        initialOrders: Array.isArray(request?.data) ? request.data : [],
        timestamp: Date.now(),
      },
    };
  } catch (error) {
    console.error("Erro ao buscar pedidos no getServerSideProps", error);

    return {
      props: {
        initialOrders: [],
        timestamp: Date.now(),
      },
    };
  }
};
