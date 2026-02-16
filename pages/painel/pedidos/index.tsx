import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useCallback, useRef, useMemo } from "react";
import { useRouter } from "next/router";
import { ShoppingBag, Eye, SlidersHorizontal, Store } from "lucide-react";
import { getExtenseData, moneyFormat, getImage } from "@/src/helper";
import { OrderStatusBadge } from "@/src/components/order";
import { getMyOrders, OrderFilters } from "@/src/services/order";
import Api from "@/src/services/api";
import {
  PainelLayout,
  PageHeader,
  DataTable,
  EmptyState,
  SearchInput,
  FilterDropdown,
} from "@/src/components/painel";
import type { Column } from "@/src/components/painel";

const STATUS_OPTIONS = [
  { label: "Em aberto", value: "0" },
  { label: "Pago", value: "1" },
  { label: "Cancelado", value: "-1" },
];

const QUICK_FILTER_META = {
  "pending-confirmation": {
    label: "A confirmar",
    description: "Pedidos sem confirmação de pagamento",
  },
  "deliveries-today": {
    label: "Entregas de hoje",
    description: "Pedidos com agenda para hoje",
  },
  delayed: {
    label: "Atrasados",
    description: "Pedidos com data vencida e não entregues",
  },
} as const;

type QuickFilterKey = keyof typeof QUICK_FILTER_META;

type ProductPreview = {
  key: string;
  title: string;
  image: string;
  quantity: number;
};

function getProductPreviews(
  row: any,
  resolvedGalleryByProductId: Record<number, any[]>
): ProductPreview[] {
  const previews: ProductPreview[] = [];
  const seen = new Set<string>();
  const fromListItems = Array.isArray(row?.listItems) ? row.listItems : [];
  const fromItems = Array.isArray(row?.items) ? row.items : [];
  const source = fromListItems.length > 0 ? fromListItems : fromItems;

  for (const item of source) {
    const productId = Number(
      item?.product?.id ?? item?.productId ?? item?.product_id ?? 0
    );
    const productTitle = item?.product?.title ?? item?.name ?? "Produto";
    const quantity = Number(item?.quantity || item?.product?.quantity || 1);
    let productGallery = item?.product?.gallery ?? [];

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

    if (seen.has(key)) continue;
    seen.add(key);

    previews.push({
      key,
      title: productTitle,
      image: productImage,
      quantity: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
    });

    if (previews.length >= 3) break;
  }

  return previews;
}

function getStoreData(row: any): { name: string; count: number } {
  const stores = Array.isArray(row?.stores)
    ? row.stores
    : row?.store
      ? [row.store]
      : [];

  if (!stores.length) {
    return { name: "Loja não identificada", count: 0 };
  }

  const mainStore = stores[0];
  const name = mainStore?.companyName || mainStore?.title || "Loja";
  return { name, count: stores.length };
}

function toYmd(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeDateToYmd(value: any): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return null;

    const brMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (brMatch) {
      const [, day, month, year] = brMatch;
      return `${year}-${month}-${day}`;
    }

    const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    }
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return toYmd(parsed);
}

function getOrderDeliveryDateYmd(order: any): string | null {
  return (
    normalizeDateToYmd(order?.delivery?.schedule?.date) ||
    normalizeDateToYmd(order?.deliverySchedule?.date) ||
    normalizeDateToYmd(order?.metadata?.scheduleStart) ||
    normalizeDateToYmd(order?.metadata?.scheduleEnd) ||
    null
  );
}

function getOrderDeliveryStatus(order: any): string {
  return String(
    order?.deliveryStatus || order?.delivery_status || order?.delivery?.status || ""
  ).toLowerCase();
}

function isOrderCanceled(order: any): boolean {
  const paymentStatus = String(order?.metadata?.payment_status || "").toLowerCase();
  const metadataStatus = String(order?.metadata?.status || "").toLowerCase();
  const status = Number(order?.status);
  return (
    status === -1 ||
    status === -2 ||
    metadataStatus === "expired" ||
    paymentStatus === "expired" ||
    paymentStatus === "canceled" ||
    paymentStatus === "failed"
  );
}

function isOrderPaid(order: any): boolean {
  const paymentStatus = String(order?.metadata?.payment_status || "").toLowerCase();
  return (
    Number(order?.status) === 1 ||
    !!order?.metadata?.paid_at ||
    paymentStatus === "paid" ||
    paymentStatus === "approved"
  );
}

function isOrderDelivered(order: any): boolean {
  const deliveryStatus = getOrderDeliveryStatus(order);
  return [
    "delivered",
    "delivered_to_customer",
    "completed",
    "concluded",
    "entregue",
    "concluido",
    "concluído",
  ].includes(deliveryStatus);
}

function isQuickFilter(value: string): value is QuickFilterKey {
  return Object.prototype.hasOwnProperty.call(QUICK_FILTER_META, value);
}

function matchesQuickFilter(order: any, quickFilter: QuickFilterKey, todayYmd: string): boolean {
  if (isOrderCanceled(order)) return false;

  const deliveryDateYmd = getOrderDeliveryDateYmd(order);
  const paid = isOrderPaid(order);
  const delivered = isOrderDelivered(order);

  if (quickFilter === "pending-confirmation") {
    return !paid;
  }

  if (quickFilter === "deliveries-today") {
    return deliveryDateYmd === todayYmd && !delivered;
  }

  if (quickFilter === "delayed") {
    return !!deliveryDateYmd && deliveryDateYmd < todayYmd && !delivered;
  }

  return true;
}

export default function Pedidos() {
  const router = useRouter();
  const [orders, setOrders] = useState<Array<any>>([]);
  const [resolvedGalleryByProductId, setResolvedGalleryByProductId] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [quickFilter, setQuickFilter] = useState<QuickFilterKey | "">("");
  const [showFilters, setShowFilters] = useState(false);

  const debounceRef = useRef<any>(null);

  const fetchOrders = useCallback(async (filters: OrderFilters = {}) => {
    setLoading(true);
    try {
      const data = await getMyOrders(filters);
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  useEffect(() => {
    let active = true;

    const resolveMissingGalleries = async () => {
      const productIds = new Set<number>();

      for (const order of orders) {
        const listItems = Array.isArray(order?.listItems)
          ? order.listItems
          : Array.isArray(order?.items)
            ? order.items
            : [];

        for (const item of listItems) {
          const productId = Number(
            item?.product?.id ?? item?.productId ?? item?.product_id ?? 0
          );
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
  }, [orders, resolvedGalleryByProductId]);

  useEffect(() => {
    if (!router.isReady) return;
    const rawQuick = Array.isArray(router.query.quick)
      ? router.query.quick[0]
      : router.query.quick;

    if (typeof rawQuick === "string" && isQuickFilter(rawQuick)) {
      setQuickFilter(rawQuick);
      return;
    }

    setQuickFilter("");
  }, [router.isReady, router.query.quick]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const filters: OrderFilters = {};
      if (statusFilter) filters.status = statusFilter;
      if (search) filters.search = search;
      if (dateFrom) filters.date_from = dateFrom;
      if (dateTo) filters.date_to = dateTo;
      if (priceMin) filters.price_min = priceMin;
      if (priceMax) filters.price_max = priceMax;
      fetchOrders(filters);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [fetchOrders, search, statusFilter, dateFrom, dateTo, priceMin, priceMax]);

  const activeFilterCount = [statusFilter, dateFrom, dateTo, priceMin, priceMax].filter(Boolean).length;
  const quickFilterMeta = quickFilter ? QUICK_FILTER_META[quickFilter] : null;

  const visibleOrders = useMemo(() => {
    if (!quickFilter) return orders;
    const todayYmd = toYmd(new Date());
    return orders.filter((order) => matchesQuickFilter(order, quickFilter, todayYmd));
  }, [orders, quickFilter]);

  const clearFilters = () => {
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setPriceMin("");
    setPriceMax("");
    setSearch("");
  };

  const clearQuickFilter = useCallback(() => {
    if (!router.isReady) {
      setQuickFilter("");
      return;
    }

    const nextQuery = { ...router.query };
    delete nextQuery.quick;
    router
      .replace({ pathname: router.pathname, query: nextQuery }, undefined, { shallow: true })
      .catch(() => undefined);
    setQuickFilter("");
  }, [router]);

  const getPaymentMethodLabel = (row: any) => {
    const rawMethod =
      row?.metadata?.payment_method ??
      row?.metadata?.transaction_type ??
      row?.payment?.method ??
      null;

    if (row?.metadata?.payment_method_display) {
      return row.metadata.payment_method_display;
    }

    const methodMap: Record<string, string> = {
      credit_card: "Cartão de crédito",
      pix: "PIX",
      boleto: "Boleto bancário",
    };

    return rawMethod ? (methodMap[rawMethod] || rawMethod) : "Não informado";
  };

  const columns: Column<any>[] = [
    {
      key: "id",
      label: "Pedido",
      sortable: true,
      className: "w-24",
      render: (row) => (
        <span className="font-medium text-zinc-900">
          #{row.mainOrderId || row.id}
          {row.ordersCount > 1 && (
            <span className="text-xs text-zinc-400 ml-1">(+{row.ordersCount - 1})</span>
          )}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Data",
      sortable: true,
      render: (row) => (
        <span className="text-sm text-zinc-600">
          {getExtenseData(row.createdAt || row.created_at)}
        </span>
      ),
    },
    {
      key: "customer",
      label: "Cliente",
      render: (row) => {
        const name = row.customer?.name || row.user?.name;
        const email = row.customer?.email || row.user?.email;
        return (
          <div>
            <p className="font-medium text-zinc-900 truncate max-w-[180px]">{name}</p>
            {email && <p className="text-xs text-zinc-400 truncate max-w-[180px]">{email}</p>}
          </div>
        );
      },
    },
    {
      key: "items",
      label: "Itens",
      className: "min-w-[220px]",
      render: (row) => {
        const previews = getProductPreviews(row, resolvedGalleryByProductId);
        const listItems = Array.isArray(row?.listItems)
          ? row.listItems
          : Array.isArray(row?.items)
            ? row.items
            : [];
        const totalItems = listItems.length || previews.length;

        if (!previews.length) {
          return (
            <div className="text-xs text-zinc-500">
              <p>Sem prévia disponível</p>
              {totalItems > 0 && <p>{totalItems} item(ns)</p>}
            </div>
          );
        }

        return (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {previews.map((preview, idx) => (
                <div
                  key={preview.key}
                  className="w-9 h-9 rounded-md overflow-hidden border border-white bg-zinc-100"
                  title={`${preview.quantity}x ${preview.title}`}
                  style={{ zIndex: 10 - idx }}
                >
                  {preview.image ? (
                    <Image
                      src={preview.image}
                      alt={preview.title}
                      width={36}
                      height={36}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-[9px] text-zinc-500">
                      IMG
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-zinc-700 font-medium truncate">
                {previews[0]?.title}
                {previews.length > 1 && ` +${previews.length - 1}`}
              </p>
              <p className="text-[11px] text-zinc-500">
                {totalItems} item(ns)
              </p>
            </div>
          </div>
        );
      },
    },
    {
      key: "store",
      label: "Loja",
      className: "min-w-[180px]",
      render: (row) => {
        const store = getStoreData(row);
        return (
          <div className="text-sm text-zinc-700">
            <div className="flex items-center gap-1.5 font-medium text-zinc-900">
              <Store size={13} className="text-zinc-400" />
              <span className="truncate max-w-[160px]">{store.name}</span>
            </div>
            {store.count > 1 && (
              <p className="text-[11px] text-zinc-500">
                +{store.count - 1} loja(s)
              </p>
            )}
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
        <span className="font-semibold text-zinc-900">R$ {moneyFormat(row.total)}</span>
      ),
    },
    {
      key: "payment_method",
      label: "Pagamento",
      className: "w-52",
      render: (row) => {
        const methodLabel = getPaymentMethodLabel(row);
        const methodCode = String(
          row?.metadata?.payment_method ??
          row?.metadata?.transaction_type ??
          row?.payment?.method ??
          ""
        ).toLowerCase();
        const installments = Number(row?.metadata?.installments || 0);
        const isCard = methodCode === "credit_card";

        return (
          <div className="text-sm text-zinc-700">
            <div className="font-medium text-zinc-900">
              {methodLabel}
            </div>
            {isCard && installments > 1 && (
              <div className="text-xs text-zinc-400">
                {installments}x
              </div>
            )}
          </div>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      className: "w-36",
      render: (row) => (
        <OrderStatusBadge
          status={row.status}
          metadataStatus={row.metadata?.status}
          paymentStatus={row.metadata?.payment_status}
          paidAt={row.metadata?.paid_at}
          statusText={row.statusText}
        />
      ),
    },
    {
      key: "actions",
      label: "Ações",
      className: "w-28",
      render: (row) => (
        <Link
          href={`/painel/pedidos/${row.mainOrderId || row.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
        >
          <Eye size={14} />
          Detalhes
        </Link>
      ),
    },
  ];

  return (
    <PainelLayout>
      <PageHeader
        title="Pedidos"
        description="Acompanhe os pedidos da sua loja"
      />

      <div className="bg-white rounded-xl border border-zinc-200 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4">
          <SearchInput
            placeholder="Buscar por pedido, cliente..."
            value={search}
            onChange={setSearch}
            className="w-full sm:w-72"
          />
          <FilterDropdown
            label="Status"
            options={STATUS_OPTIONS}
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              showFilters || activeFilterCount > 0
                ? "border-yellow-400 bg-yellow-50 text-zinc-900"
                : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
            }`}
          >
            <SlidersHorizontal size={15} />
            Filtros
            {activeFilterCount > 0 && (
              <span className="bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {showFilters && (
          <div className="px-4 pb-4 border-t border-zinc-100 pt-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Data início</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Data fim</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Preço mínimo</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">R$</span>
                  <input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder="0"
                    min={0}
                    className="w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Preço máximo</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">R$</span>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder="0"
                    min={0}
                    className="w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {quickFilterMeta && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Filtro rápido ativo: {quickFilterMeta.label}
            </p>
            <p className="text-xs text-amber-700">
              {quickFilterMeta.description} • {visibleOrders.length} pedido(s) encontrado(s)
            </p>
          </div>
          <button
            type="button"
            onClick={clearQuickFilter}
            className="text-xs font-medium text-amber-800 hover:text-amber-950"
          >
            Remover filtro rápido
          </button>
        </div>
      )}

      {!loading && visibleOrders.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200">
          <EmptyState
            icon={<ShoppingBag size={32} />}
            title="Nenhum pedido encontrado"
            description={
              search || activeFilterCount > 0 || !!quickFilter
                ? "Tente ajustar os filtros ou a busca"
                : "Quando seus clientes fizerem pedidos, eles vão aparecer aqui"
            }
          />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={visibleOrders}
          keyField="id"
          pageSize={15}
          loading={loading}
          emptyMessage="Nenhum pedido encontrado"
        />
      )}
    </PainelLayout>
  );
}
