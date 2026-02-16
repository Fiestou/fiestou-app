import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  CreditCard,
  MapPin,
  Package,
  Store,
  User,
  CalendarClock,
  Receipt,
  ExternalLink,
} from "lucide-react";
import Template from "@/src/template";
import Api from "@/src/services/api";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import { getImage, moneyFormat } from "@/src/helper";

interface DeliveryAddress {
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  complement?: string;
}

interface ProductData {
  id: number;
  title: string;
  gallery?: any[];
  store?: {
    id: number;
    title?: string;
    companyName?: string;
  };
}

interface OrderItemAddon {
  id: number;
  name: string;
  quantity: number;
  price: number;
  total: number;
}

interface OrderItemData {
  id: number;
  orderId: number;
  productId: number;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  total: number;
  metadata?: any;
  addons?: OrderItemAddon[];
  store?: {
    id: number;
    slug?: string;
    title?: string;
    companyName?: string;
  };
}

interface StoreData {
  id: number;
  slug?: string;
  title?: string;
  companyName?: string;
  cover?: any;
  profile?: any;
  orderTotal?: number;
  orderId?: number;
  partnerName?: string;
  partnerEmail?: string;
  partnerPhone?: string;
}

interface OrderBreakdown {
  id: number;
  status: number;
  deliveryStatus?: string;
  subtotal: number;
  deliveryPrice: number;
  total: number;
  createdAt?: string;
  store?: StoreData;
  metadata?: any;
  payment?: {
    method?: string;
    methodCode?: string;
    methodLabel?: string;
    status?: string;
    transactionType?: string;
    installments?: number;
    amountTotal?: number;
    url?: string;
    pdf?: string;
    line?: string;
    paidAt?: string;
  };
}

interface OrderData {
  id: number;
  groupHash?: string;
  status: number;
  subtotal: number;
  deliveryTotal: number;
  total: number;
  createdAt: string;
  customer?: {
    id: number;
    name: string;
    email: string;
    phone?: string;
    createdAt?: string;
  };
  partner?: {
    name: string;
    email: string;
  };
  store?: StoreData | null;
  stores?: StoreData[];
  metadata?: any;
  payment?: {
    method?: string;
    methodCode?: string;
    methodLabel?: string;
    installments?: number;
    amountTotal?: number;
    status?: string;
    transactionType?: string;
    pdf?: string;
    url?: string;
    line?: string;
  };
  delivery?: {
    status?: string;
    schedule?: {
      date?: string;
      period?: string;
      time?: string;
    } | null;
    to?: string;
    price?: number;
    priceLabel?: string;
    address?: DeliveryAddress | string | null;
  };
  items?: OrderItemData[];
  products?: ProductData[];
  orders?: OrderBreakdown[];
  ordersCount?: number;
}

interface ApiResponse {
  order?: OrderData;
  data?: {
    order?: OrderData;
  } | OrderData;
}

function normalizeAddress(value: any): DeliveryAddress {
  if (!value) return {};

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return typeof parsed === "object" && parsed ? parsed : {};
    } catch {
      return {};
    }
  }

  if (typeof value === "object") {
    return value;
  }

  return {};
}

function normalizeMetadata(value: any): any {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  return value;
}

function getPaymentMethodLabel(method?: string | null): string {
  if (!method) return "Não informado";
  if (method === "credit_card") return "Cartão de crédito";
  if (method === "pix") return "PIX";
  if (method === "boleto") return "Boleto bancário";
  return method;
}

function getPaymentStatusLabel(status?: string | null): string {
  if (!status) return "Pendente";
  if (status === "paid" || status === "approved") return "Pago";
  if (status === "processing") return "Processando";
  if (status === "canceled" || status === "expired") return "Cancelado";
  if (status === "failed") return "Falhou";
  if (status === "pending") return "Pendente";
  return status;
}

function getPaymentStatusClass(status?: string | null): string {
  if (status === "paid" || status === "approved") return "bg-green-100 text-green-700";
  if (status === "processing") return "bg-blue-100 text-blue-700";
  if (status === "canceled" || status === "expired" || status === "failed") {
    return "bg-red-100 text-red-700";
  }
  return "bg-amber-100 text-amber-700";
}

function getOrderStatusLabel(status?: number): string {
  if (status === 1) return "Pago";
  if (status === -2) return "Cancelado";
  if (status === -1) return "Processando";
  return "Pendente";
}

export default function AdminOrderDetailsPage() {
  const router = useRouter();
  const { id } = router.query;
  const [order, setOrder] = useState<OrderData | null>(null);
  const [resolvedGalleryByProductId, setResolvedGalleryByProductId] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(true);

  const fetchOrder = async () => {
    if (!id) return;

    setLoading(true);
    setResolvedGalleryByProductId({});

    try {
      const api = new Api();
      const response = (await api.bridge({
        method: "get",
        url: `order/${id}`,
      })) as ApiResponse;

      const payload = (response?.order ||
        (response?.data as any)?.order ||
        response?.data) as OrderData | undefined;

      if (!payload) {
        setOrder(null);
        return;
      }

      const normalizedOrder: OrderData = {
        ...payload,
        metadata: normalizeMetadata(payload.metadata),
        delivery: {
          ...payload.delivery,
          address: normalizeAddress(payload.delivery?.address),
        },
        items: Array.isArray(payload.items) ? payload.items : [],
        products: Array.isArray(payload.products) ? payload.products : [],
        stores: Array.isArray(payload.stores) ? payload.stores : [],
        orders: Array.isArray(payload.orders) ? payload.orders : [],
      };

      setOrder(normalizedOrder);
    } catch (error) {
      console.error("Erro ao buscar pedido do admin", error);
      setOrder(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  useEffect(() => {
    let active = true;

    const resolveMissingGalleries = async () => {
      if (!order?.id) return;

      const productIds = new Set<number>();

      for (const product of order.products || []) {
        const productId = Number(product?.id || 0);
        if (!productId) continue;
        if (resolvedGalleryByProductId[productId]?.length) continue;
        if (getImage(product?.gallery, "thumb")) continue;
        productIds.add(productId);
      }

      for (const item of order.items || []) {
        const productId = Number(item?.productId || 0);
        if (!productId) continue;
        if (resolvedGalleryByProductId[productId]?.length) continue;
        productIds.add(productId);
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
  }, [order?.id, order?.products]);

  const productsById = useMemo(() => {
    const map = new Map<number, ProductData>();
    for (const product of order?.products || []) {
      map.set(product.id, product);
    }
    return map;
  }, [order?.products]);

  const groupedItemsByStore = useMemo(() => {
    const grouped = new Map<string, { store: StoreData | null; items: OrderItemData[] }>();

    for (const item of order?.items || []) {
      const storeId = item?.store?.id;
      const key = String(storeId || "no-store");
      if (!grouped.has(key)) {
        grouped.set(key, {
          store: (item.store as StoreData) || null,
          items: [],
        });
      }
      grouped.get(key)!.items.push(item);
    }

    return Array.from(grouped.values());
  }, [order?.items]);

  const paymentMethod =
    order?.payment?.method ||
    order?.payment?.methodCode ||
    order?.metadata?.payment_method ||
    order?.metadata?.transaction_type ||
    null;

  const paymentStatus =
    order?.payment?.status ||
    order?.metadata?.payment_status ||
    (order?.status === 1 ? "paid" : "pending");

  const paidAt = order?.metadata?.paid_at || null;
  const paymentUrl = order?.payment?.url || order?.metadata?.url || null;
  const paymentPdf = order?.payment?.pdf || order?.metadata?.pdf || null;
  const paymentLine = order?.payment?.line || order?.metadata?.line || null;

  const deliveryAddress = normalizeAddress(order?.delivery?.address);
  const deliveryZipCode = deliveryAddress.zipCode || (deliveryAddress as any).zip_code || "";
  const deliveryState = deliveryAddress.state || (deliveryAddress as any).uf || "";
  const deliveryStreet = deliveryAddress.street || (deliveryAddress as any).line_1 || "";
  const deliveryCity = deliveryAddress.city || "";

  return (
    <Template
      header={{
        template: "admin",
        position: "solid",
      }}
    >
      <section>
        <div className="container-medium pt-8" style={{ maxWidth: "110rem" }}>
          <Breadcrumbs
            links={[
              { url: "/admin", name: "Admin" },
              { url: "/admin/pedidos", name: "Pedidos" },
              { url: `/admin/pedidos/${id}`, name: `#${id}` },
            ]}
          />
        </div>
      </section>

      <section>
        <div className="container-medium py-6" style={{ maxWidth: "110rem" }}>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/pedidos"
                className="w-10 h-10 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-100 transition-colors"
              >
                <ArrowLeft size={18} />
              </Link>
              <div>
                <h1 className="font-title font-bold text-3xl text-zinc-900">
                  Pedido #{id}
                </h1>
                {!!order?.groupHash && (
                  <p className="text-xs text-zinc-500 mt-1">Grupo: {order.groupHash}</p>
                )}
              </div>
            </div>

            {!!order && (
              <div className="text-right">
                <p className="text-sm text-zinc-500">Total do pedido</p>
                <p className="text-3xl font-bold text-zinc-900">R$ {moneyFormat(order.total || 0)}</p>
              </div>
            )}
          </div>

          {loading ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-10 flex items-center justify-center gap-3 text-zinc-500">
              <div className="w-5 h-5 border-2 border-zinc-300 border-t-zinc-500 rounded-full animate-spin" />
              Carregando pedido...
            </div>
          ) : !order ? (
            <div className="bg-white border border-zinc-200 rounded-xl p-10 text-center text-zinc-500">
              Pedido não encontrado.
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="bg-white border border-zinc-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <User size={16} className="text-zinc-400" />
                    <h3 className="font-semibold text-zinc-900">Cliente</h3>
                  </div>
                  <div className="space-y-1 text-sm text-zinc-700">
                    <p className="font-medium text-zinc-900">{order.customer?.name || "N/A"}</p>
                    <p>{order.customer?.email || "N/A"}</p>
                    <p>{order.customer?.phone || "Telefone não informado"}</p>
                    {order.customer?.createdAt && (
                      <p className="text-xs text-zinc-500 pt-1">
                        Cliente desde {new Date(order.customer.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <CreditCard size={16} className="text-zinc-400" />
                    <h3 className="font-semibold text-zinc-900">Pagamento</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium text-zinc-900">
                      {order?.payment?.methodLabel || getPaymentMethodLabel(paymentMethod)}
                      {paymentMethod === "credit_card" && order?.payment?.installments ? ` em ${order.payment.installments}x` : ""}
                    </p>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getPaymentStatusClass(paymentStatus)}`}>
                      {getPaymentStatusLabel(paymentStatus)}
                    </span>
                    {!!order?.payment?.transactionType && (
                      <p className="text-zinc-600">Transação: {order.payment.transactionType}</p>
                    )}
                    {!!paidAt && (
                      <p className="text-zinc-600">
                        Pago em {new Date(paidAt).toLocaleString("pt-BR")}
                      </p>
                    )}
                    <p className="text-zinc-600">Status do pedido: {getOrderStatusLabel(order.status)}</p>

                    {(paymentUrl || paymentPdf) && (
                      <div className="pt-2 space-y-1">
                        {!!paymentUrl && (
                          <a
                            href={paymentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            Abrir link de pagamento <ExternalLink size={12} />
                          </a>
                        )}
                        {!!paymentPdf && (
                          <a
                            href={paymentPdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                          >
                            Abrir boleto PDF <ExternalLink size={12} />
                          </a>
                        )}
                        {!!paymentLine && (
                          <p className="text-xs text-zinc-500 break-all">Linha digitável: {paymentLine}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-zinc-200 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={16} className="text-zinc-400" />
                    <h3 className="font-semibold text-zinc-900">Entrega</h3>
                  </div>
                  <div className="space-y-1 text-sm text-zinc-700">
                    <p>
                      <span className="text-zinc-500">Tipo:</span> {order.delivery?.to || "Não informado"}
                    </p>
                    <p>
                      <span className="text-zinc-500">Status:</span> {order.delivery?.status || "Não informado"}
                    </p>
                    <p>
                      <span className="text-zinc-500">Frete:</span>{" "}
                      {typeof order.delivery?.price === "number"
                        ? `R$ ${moneyFormat(order.delivery.price)}`
                        : order.delivery?.priceLabel || "Não informado"}
                    </p>
                    {!!order.delivery?.schedule?.date && (
                      <p>
                        <span className="text-zinc-500">Data:</span> {order.delivery.schedule.date}
                      </p>
                    )}
                    {!!order.delivery?.schedule?.period && (
                      <p>
                        <span className="text-zinc-500">Período:</span> {order.delivery.schedule.period}
                      </p>
                    )}
                    {!!order.delivery?.schedule?.time && (
                      <p>
                        <span className="text-zinc-500">Horário:</span> {order.delivery.schedule.time}
                      </p>
                    )}
                    {(deliveryStreet || deliveryCity) && (
                      <div className="pt-2 text-xs text-zinc-600">
                        <p>
                          {deliveryStreet}
                          {deliveryAddress.number ? `, ${deliveryAddress.number}` : ""}
                          {deliveryAddress.neighborhood ? ` - ${deliveryAddress.neighborhood}` : ""}
                        </p>
                        <p>
                          {deliveryCity}
                          {deliveryState ? `/${deliveryState}` : ""}
                          {deliveryZipCode ? ` - CEP ${deliveryZipCode}` : ""}
                        </p>
                        {!!deliveryAddress.complement && <p>Complemento: {deliveryAddress.complement}</p>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {(order.stores || []).length > 0 && (
                <div className="bg-white border border-zinc-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Store size={17} className="text-zinc-400" />
                    <h3 className="text-lg font-semibold text-zinc-900">Lojas envolvidas</h3>
                  </div>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {(order.stores || []).map((store) => {
                      const logo = getImage(store.profile || store.cover, "thumb");
                      const storeName = store.companyName || store.title || "Loja";

                      return (
                        <div key={`store-${store.id}`} className="border border-zinc-200 rounded-xl p-4">
                          <div className="flex items-center gap-3 mb-3">
                            {logo ? (
                              <Image
                                src={logo}
                                alt={storeName}
                                width={48}
                                height={48}
                                unoptimized
                                className="w-12 h-12 rounded-full object-cover border border-zinc-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-sm font-bold text-zinc-500">
                                {storeName.slice(0, 1).toUpperCase()}
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="font-semibold text-zinc-900 truncate">{storeName}</p>
                              {!!store.slug && <p className="text-xs text-zinc-500 truncate">/{store.slug}</p>}
                            </div>
                          </div>

                          <div className="space-y-1 text-sm text-zinc-600">
                            <p>
                              <span className="text-zinc-500">Parceiro:</span> {store.partnerName || "Não informado"}
                            </p>
                            <p>
                              <span className="text-zinc-500">E-mail:</span> {store.partnerEmail || "Não informado"}
                            </p>
                            {!!store.partnerPhone && (
                              <p>
                                <span className="text-zinc-500">Telefone:</span> {store.partnerPhone}
                              </p>
                            )}
                            {!!store.orderTotal && (
                              <p>
                                <span className="text-zinc-500">Total da loja:</span> R$ {moneyFormat(store.orderTotal)}
                              </p>
                            )}
                            {!!store.orderId && (
                              <p>
                                <span className="text-zinc-500">Pedido da loja:</span> #{store.orderId}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {(order.orders || []).length > 0 && (
                <div className="bg-white border border-zinc-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Receipt size={17} className="text-zinc-400" />
                    <h3 className="text-lg font-semibold text-zinc-900">Resumo por pedido da loja</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left border-b border-zinc-200">
                          <th className="py-2 pr-3 text-zinc-500 font-semibold">Pedido</th>
                          <th className="py-2 pr-3 text-zinc-500 font-semibold">Loja</th>
                          <th className="py-2 pr-3 text-zinc-500 font-semibold">Pagamento</th>
                          <th className="py-2 pr-3 text-zinc-500 font-semibold">Status</th>
                          <th className="py-2 pr-3 text-zinc-500 font-semibold">Total</th>
                          <th className="py-2 pr-0 text-zinc-500 font-semibold">Data</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(order.orders || []).map((o) => (
                          <tr key={`order-breakdown-${o.id}`} className="border-b border-zinc-100">
                            <td className="py-3 pr-3 font-medium text-zinc-800">#{o.id}</td>
                            <td className="py-3 pr-3 text-zinc-700">{o.store?.companyName || o.store?.title || "N/A"}</td>
                            <td className="py-3 pr-3 text-zinc-700">
                              {o.payment?.methodLabel || getPaymentMethodLabel(o.payment?.method || o.metadata?.payment_method)}
                              {!!o.payment?.installments &&
                                (o.payment?.method === "credit_card" ||
                                  o.payment?.methodCode === "credit_card") &&
                                ` (${o.payment.installments}x)`}
                            </td>
                            <td className="py-3 pr-3">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${getPaymentStatusClass(o.payment?.status || o.metadata?.payment_status)}`}>
                                {getPaymentStatusLabel(o.payment?.status || o.metadata?.payment_status)}
                              </span>
                            </td>
                            <td className="py-3 pr-3 font-medium text-zinc-800">R$ {moneyFormat(o.total || 0)}</td>
                            <td className="py-3 pr-0 text-zinc-600">
                              {o.createdAt ? new Date(o.createdAt).toLocaleString("pt-BR") : "-"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="bg-white border border-zinc-200 rounded-xl p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Package size={17} className="text-zinc-400" />
                  <h3 className="text-lg font-semibold text-zinc-900">Itens do pedido</h3>
                </div>

                {groupedItemsByStore.length === 0 ? (
                  <p className="text-sm text-zinc-500">Nenhum item encontrado para este pedido.</p>
                ) : (
                  <div className="space-y-6">
                    {groupedItemsByStore.map((group, groupIndex) => {
                      const storeLabel =
                        group.store?.companyName || group.store?.title || `Loja ${groupIndex + 1}`;

                      return (
                        <div key={`store-items-${groupIndex}`} className="border border-zinc-200 rounded-xl p-4">
                          <div className="flex items-center justify-between gap-3 pb-3 border-b border-zinc-100 mb-4">
                            <div>
                              <p className="font-semibold text-zinc-900">{storeLabel}</p>
                              {!!group.store?.id && (
                                <p className="text-xs text-zinc-500">Store ID: {group.store.id}</p>
                              )}
                            </div>
                            <span className="text-xs text-zinc-500">{group.items.length} item(ns)</span>
                          </div>

                          <div className="space-y-4">
                            {group.items.map((item) => {
                              const product = productsById.get(Number(item.productId));
                              const productTitle = product?.title || item.name || "Produto";
                              let productGallery = product?.gallery;

                              if (
                                !getImage(productGallery, "thumb") &&
                                product?.id &&
                                Array.isArray(resolvedGalleryByProductId[product.id]) &&
                                resolvedGalleryByProductId[product.id].length > 0
                              ) {
                                productGallery = resolvedGalleryByProductId[product.id];
                              }

                              const imageUrl = getImage(productGallery, "thumb");

                              const details = item.metadata?.details || item.metadata?.raw_item?.details || {};

                              return (
                                <div key={`item-${item.id}`} className="border border-zinc-100 rounded-lg p-3">
                                  <div className="flex items-start gap-3">
                                    <div className="w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 flex-shrink-0 flex items-center justify-center">
                                      {imageUrl ? (
                                        <Image
                                          src={imageUrl}
                                          alt={productTitle}
                                          width={64}
                                          height={64}
                                          unoptimized
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <span className="text-[10px] text-zinc-500">SEM IMG</span>
                                      )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between gap-4">
                                        <div>
                                          <p className="font-medium text-zinc-900 truncate">{productTitle}</p>
                                          <p className="text-xs text-zinc-500 mt-0.5">Pedido da loja #{item.orderId}</p>
                                        </div>
                                        <div className="text-right text-sm">
                                          <p className="font-semibold text-zinc-900">R$ {moneyFormat(item.total || 0)}</p>
                                          <p className="text-xs text-zinc-500">{item.quantity} x R$ {moneyFormat(item.unitPrice || 0)}</p>
                                        </div>
                                      </div>

                                      {(details?.dateStart || details?.dateEnd || details?.days) && (
                                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                                          <CalendarClock size={12} />
                                          {details?.dateStart && <span>Início: {details.dateStart}</span>}
                                          {details?.dateEnd && <span>Fim: {details.dateEnd}</span>}
                                          {!!details?.days && <span>{details.days} dia(s)</span>}
                                        </div>
                                      )}

                                      {!!item.description && (
                                        <p className="text-xs text-zinc-600 mt-2">{item.description}</p>
                                      )}

                                      {!!item.addons?.length && (
                                        <div className="mt-3 pt-3 border-t border-dashed border-zinc-200">
                                          <p className="text-xs font-semibold text-zinc-600 mb-1">Adicionais</p>
                                          <div className="space-y-1">
                                            {item.addons.map((addon) => (
                                              <div key={`addon-${addon.id}`} className="flex justify-between text-xs text-zinc-600">
                                                <span>
                                                  {addon.quantity} x {addon.name}
                                                </span>
                                                <span>R$ {moneyFormat(addon.total || addon.price || 0)}</span>
                                              </div>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
    </Template>
  );
}
