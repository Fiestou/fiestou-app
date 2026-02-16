import Link from "next/link";
import Image from "next/image";
import Api from "@/src/services/api";
import { OrderType } from "@/src/models/order";
import {
  getExtenseData,
  moneyFormat,
  getOrderDeliveryInfo,
  getImage,
} from "@/src/helper";
import { Select } from "@/src/components/ui/form";
import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { deliveryTypes } from "@/src/models/delivery";
import { OrderStatusBadge } from "@/src/components/order";
import {
  ArrowLeft,
  Send,
  Truck,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  User,
  Package,
  Store,
  Download,
  Archive,
  ExternalLink,
} from "lucide-react";
import { PainelLayout, Badge } from "@/src/components/painel";

type AdditionalExtra = {
  title: string;
  quantity: number;
  price: number;
  total: number;
};

type SelectedAttributeVariation = {
  id: string;
  title: string;
  value?: string;
  quantity: number;
  price: number;
  imageUrl?: string | null;
};

type SelectedAttribute = {
  id: string;
  title: string;
  selectType?: string;
  variations: SelectedAttributeVariation[];
};

type RenderableOrderItem = {
  id: string;
  productId: number;
  title: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  additionalExtra: AdditionalExtra[];
  details?: any;
  description?: string | null;
  gallery?: any;
  selectedAttributes?: SelectedAttribute[];
  store?: any;
  orderId?: number;
};

type StoreGroup = {
  storeId: number;
  storeName: string;
  storeSlug?: string;
  store: any;
  items: RenderableOrderItem[];
  subtotal: number;
  freight: number;
  total: number;
};

function safeParseJSON(value: any, fallback: any = {}) {
  if (!value) return fallback;
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
}

function toNumber(value: any): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return 0;

    let normalized = raw
      .replace(/\s+/g, "")
      .replace(/^R\$/i, "")
      .replace(/[^\d,.-]/g, "");

    const hasComma = normalized.includes(",");
    const hasDot = normalized.includes(".");

    if (hasComma && hasDot) {
      const lastComma = normalized.lastIndexOf(",");
      const lastDot = normalized.lastIndexOf(".");

      if (lastComma > lastDot) {
        normalized = normalized.replace(/\./g, "").replace(",", ".");
      } else {
        normalized = normalized.replace(/,/g, "");
      }
    } else if (hasComma) {
      normalized = normalized.replace(/\./g, "").replace(",", ".");
    } else if (hasDot) {
      if (/^\d{1,3}(\.\d{3})+$/.test(normalized)) {
        normalized = normalized.replace(/\./g, "");
      }
      const parts = normalized.split(".");
      if (parts.length > 2) {
        normalized = `${parts.slice(0, -1).join("")}.${parts[parts.length - 1]}`;
      }
    }

    const parsed = Number(normalized);
    if (Number.isFinite(parsed)) return parsed;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function sanitizeFileName(value: string, fallback = "imagem-cliente"): string {
  const cleaned = (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);

  return cleaned || fallback;
}

function isImageLikeValue(value: any): value is string {
  if (typeof value !== "string") return false;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return false;
  return (
    normalized.startsWith("http://") ||
    normalized.startsWith("https://") ||
    normalized.startsWith("/") ||
    normalized.startsWith("data:image")
  );
}

function resolveVariationImageUrl(variation: any, gallery: any[] = []): string | null {
  const variationValue = typeof variation?.value === "string" ? variation.value.trim() : "";
  if (isImageLikeValue(variationValue)) {
    return variationValue;
  }

  const rawImage = variation?.image;
  if (!rawImage) return null;

  if (typeof rawImage === "string" || typeof rawImage === "number") {
    const numericId = Number(rawImage);
    if (Number.isFinite(numericId) && numericId > 0) {
      const media = Array.isArray(gallery)
        ? gallery.find((entry: any) => Number(entry?.id) === numericId)
        : null;
      return (
        getImage(media, "default") ||
        getImage(media, "lg") ||
        getImage(media, "thumb") ||
        null
      );
    }

    if (typeof rawImage === "string" && isImageLikeValue(rawImage)) {
      return rawImage;
    }

    return null;
  }

  if (typeof rawImage === "object") {
    return (
      getImage(rawImage, "default") ||
      getImage(rawImage, "lg") ||
      getImage(rawImage, "thumb") ||
      null
    );
  }

  return null;
}

function extractSelectedAttributes(rawAttributes: any, gallery: any[] = []): SelectedAttribute[] {
  const attributes = Array.isArray(rawAttributes) ? rawAttributes : [];

  return attributes
    .map((attribute: any, attrIndex: number) => {
      const selectType = String(attribute?.selectType || "").toLowerCase();
      const attributeTitle = String(attribute?.title || attribute?.name || `Personalização ${attrIndex + 1}`);
      const variations = Array.isArray(attribute?.variations) ? attribute.variations : [];

      const normalizedVariations: SelectedAttributeVariation[] = variations
        .map((variation: any, variationIndex: number) => {
          const rawValue =
            typeof variation?.value === "string" ? variation.value.trim() : "";
          const imageUrl = resolveVariationImageUrl(variation, gallery);
          const titleFromVariation =
            typeof variation?.title === "string" ? variation.title.trim() : "";
          const fallbackTitle = rawValue && !imageUrl ? rawValue : `Opção ${variationIndex + 1}`;

          return {
            id: String(variation?.id || `${attribute?.id || "attr"}-${variationIndex}`),
            title: titleFromVariation || fallbackTitle,
            value: rawValue || undefined,
            quantity: Math.max(1, toNumber(variation?.quantity || 1)),
            price: toNumber(variation?.price),
            imageUrl,
          };
        })
        .filter((variation: SelectedAttributeVariation) => {
          const hasRelevantValue =
            !!variation.imageUrl ||
            !!variation.value ||
            variation.price > 0 ||
            variation.quantity > 0;
          if (!hasRelevantValue) return false;

          if (selectType === "text" || selectType === "image") return true;

          return !!variation.imageUrl || (!!variation.value && variation.value !== variation.title);
        });

      return {
        id: String(attribute?.id || `attribute-${attrIndex}`),
        title: attributeTitle,
        selectType,
        variations: normalizedVariations,
      };
    })
    .filter((attribute: SelectedAttribute) => attribute.variations.length > 0);
}

function buildDownloadUrl(imageUrl: string, suggestedName: string, asZip = false): string {
  const params = new URLSearchParams({
    url: imageUrl,
    filename: sanitizeFileName(suggestedName),
    zip: asZip ? "1" : "0",
  });
  return `/api/orders/image-download?${params.toString()}`;
}

function formatDateTime(value?: string | null) {
  if (!value) return "Não informado";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("pt-BR");
}

function getPaymentMethodCode(order: any): string {
  return String(
    order?.metadata?.payment_method ||
      order?.metadata?.transaction_type ||
      order?.payment?.method ||
      ""
  ).toLowerCase();
}

function getPaymentMethodLabel(order: any): string {
  if (order?.metadata?.payment_method_display) {
    return order.metadata.payment_method_display;
  }

  const method = getPaymentMethodCode(order);

  if (method === "credit_card") return "Cartão de crédito";
  if (method === "pix") return "PIX";
  if (method === "boleto") return "Boleto bancário";
  return method ? method : "Não informado";
}

function getPaymentStatusCode(order: any): string {
  return String(
    order?.metadata?.payment_status ||
      order?.payment?.status ||
      (order?.status === 1 ? "paid" : "pending")
  ).toLowerCase();
}

function getPaymentStatusLabel(status: string): string {
  if (status === "paid" || status === "approved") return "Pago";
  if (status === "processing") return "Processando";
  if (status === "failed") return "Falhou";
  if (status === "canceled" || status === "expired") return "Cancelado";
  if (status === "pending") return "Pendente";
  return status || "Pendente";
}

function getPaymentStatusVariant(status: string): "success" | "warning" | "danger" | "info" | "neutral" {
  if (status === "paid" || status === "approved") return "success";
  if (status === "processing") return "info";
  if (status === "failed" || status === "canceled" || status === "expired") return "danger";
  if (status === "pending") return "warning";
  return "neutral";
}

export default function Pedido() {
  const api = useMemo(() => new Api(), []);
  const router = useRouter();

  const [order, setOrder] = useState({} as OrderType);
  const [resolvedGalleryByProductId, setResolvedGalleryByProductId] = useState<Record<number, any[]>>({});
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [form, setForm] = useState({ loading: false });
  const [deliveryStatus, setDeliveryStatus] = useState<string>("pending");
  const rawOrderItems = (order as any)?.items;
  const orderProducts = useMemo(
    () => (Array.isArray(order?.products) ? order.products : []),
    [order?.products]
  );
  const orderItems = useMemo(
    () => (Array.isArray(rawOrderItems) ? rawOrderItems : []),
    [rawOrderItems]
  );

  const normalizeOrderData = (orderData: any): OrderType => {
    const rawItems = Array.isArray(orderData?.items) ? orderData.items : [];

    let listItems: any[] = [];
    if (Array.isArray(orderData?.listItems)) {
      listItems = orderData.listItems;
    } else if (typeof orderData?.listItems === "string") {
      listItems = safeParseJSON(orderData.listItems, []);
    } else if (Array.isArray(orderData?.items)) {
      listItems = orderData.items;
    }

    const parsedMetadata = safeParseJSON(orderData?.metadata, {});
    const mergedMetadata = {
      ...(parsedMetadata ?? {}),
      ...(orderData?.payment ?? {}),
    };

    const productsFromPayload = Array.isArray(orderData?.products)
      ? orderData.products
      : Array.isArray(orderData?.productsData)
        ? orderData.productsData
        : [];

    const productMap = new Map<number, any>();

    for (const product of productsFromPayload) {
      const productId = Number(product?.id || 0);
      if (!productId) continue;
      productMap.set(productId, product);
    }

    for (const item of rawItems) {
      const product = item?.product;
      const productId = Number(product?.id || item?.productId || item?.product_id || 0);
      if (!productId || !product) continue;
      if (!productMap.has(productId)) {
        productMap.set(productId, product);
      }
    }

    const normalizedProducts = Array.from(productMap.values());

    return {
      ...orderData,
      id: orderData?.id ?? orderData?.mainOrderId,
      user: orderData?.customer ?? orderData?.user,
      products: normalizedProducts,
      items: rawItems,
      listItems,
      delivery: {
        to: orderData?.delivery?.to ?? orderData?.deliveryTo ?? orderData?.delivery_to,
        schedule: orderData?.delivery?.schedule ?? orderData?.deliverySchedule,
        price:
          orderData?.delivery?.price ??
          orderData?.deliveryTotal ??
          orderData?.deliveryPrice ??
          orderData?.delivery_price,
        address:
          orderData?.delivery?.address ?? orderData?.deliveryAddress ?? orderData?.delivery_address,
        status:
          orderData?.delivery?.status ?? orderData?.deliveryStatus ?? orderData?.delivery_status,
      },
      delivery_status: orderData?.deliveryStatus ?? orderData?.delivery_status,
      total: toNumber(orderData?.total),
      subtotal: toNumber(orderData?.subtotal),
      delivery_price: toNumber(orderData?.deliveryPrice ?? orderData?.delivery_price),
      metadata: mergedMetadata,
      createdAt: orderData?.createdAt ?? orderData?.created_at,
      freights_orders_price: Array.isArray(orderData?.freights_orders_price)
        ? orderData.freights_orders_price
        : [],
      store: orderData?.store,
      stores: Array.isArray(orderData?.stores) ? orderData.stores : [],
    } as OrderType;
  };

  useEffect(() => {
    if (!router.isReady) return;
    const idRaw = router.query.id ?? router.query[0];
    const id = Number(idRaw);
    if (!id) return;

    (async () => {
      setLoadingOrder(true);
      try {
        const request: any = await api.bridge({
          method: "post",
          url: "orders/get",
          data: { id },
        });

        const orderData = request?.data?.data ?? request?.data ?? request;

        if (!orderData) {
          setOrder({} as OrderType);
          return;
        }

        const normalizedOrder = normalizeOrderData(orderData);
        setOrder(normalizedOrder);
        setDeliveryStatus(normalizedOrder.delivery_status ?? "pending");
        setResolvedGalleryByProductId({});
      } catch {
        setOrder({} as OrderType);
      } finally {
        setLoadingOrder(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query]);

  useEffect(() => {
    let active = true;

    const resolveMissingGalleries = async () => {
      if (!order?.id) return;

      const productIds = new Set<number>();

      for (const product of orderProducts as any[]) {
        const productId = Number(product?.id || 0);
        if (!productId) continue;
        if (resolvedGalleryByProductId[productId]?.length) continue;
        if (getImage(product?.gallery, "thumb")) continue;
        productIds.add(productId);
      }

      for (const item of orderItems) {
        const productId = Number(item?.productId || item?.product_id || item?.product?.id || 0);
        if (!productId) continue;
        if (resolvedGalleryByProductId[productId]?.length) continue;
        productIds.add(productId);
      }

      if (!productIds.size) return;

      const responses = await Promise.allSettled(
        Array.from(productIds).map(async (productId) => {
          const response: any = await api.request({
            method: "get",
            url: "request/product",
            data: { id: productId },
          });

          return {
            productId,
            gallery: Array.isArray(response?.data?.gallery) ? response.data.gallery : [],
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
  }, [api, order?.id, orderItems, orderProducts, resolvedGalleryByProductId]);

  const groupedItemsByStore = useMemo<StoreGroup[]>(() => {
    const groups = new Map<number, StoreGroup>();
    const products = Array.isArray(order?.products) ? order.products : [];
    const rawItems = Array.isArray((order as any)?.items) ? (order as any).items : [];
    const listItems = Array.isArray(order?.listItems) ? order.listItems : [];

    const productsById = new Map<number, any>();
    for (const product of products as any[]) {
      const productId = Number(product?.id || 0);
      if (!productId) continue;
      productsById.set(productId, product);
    }

    const getFreightByStore = (storeId: number) => {
      const freightRaw = Array.isArray(order?.freights_orders_price)
        ? order.freights_orders_price.find((freight: any) => Number(freight?.store_id) === Number(storeId))?.price
        : 0;
      return toNumber(freightRaw);
    };

    const ensureGroup = (store: any) => {
      const storeId = Number(store?.id || 0);
      const safeStoreId = Number.isFinite(storeId) ? storeId : 0;
      const storeName =
        store?.companyName ||
        store?.title ||
        (safeStoreId > 0 ? `Loja #${safeStoreId}` : "Loja não identificada");

      if (!groups.has(safeStoreId)) {
        groups.set(safeStoreId, {
          storeId: safeStoreId,
          storeName,
          storeSlug: store?.slug || undefined,
          store,
          items: [],
          subtotal: 0,
          freight: getFreightByStore(safeStoreId),
          total: 0,
        });
      }

      return groups.get(safeStoreId)!;
    };

    if (rawItems.length > 0) {
      rawItems.forEach((item: any, idx: number) => {
        const productId = Number(item?.productId || item?.product_id || item?.product?.id || 0);
        const product = item?.product || productsById.get(productId) || {};
        const store = item?.store || product?.store || order?.store || {};

        const quantity = Math.max(1, toNumber(item?.quantity));
        const unitPrice = toNumber(item?.unitPrice ?? item?.unit_price ?? item?.price ?? product?.price);
        const lineTotal = toNumber(item?.total ?? quantity * unitPrice);

        let productGallery = product?.gallery || [];
        if (
          !getImage(productGallery, "thumb") &&
          productId > 0 &&
          Array.isArray(resolvedGalleryByProductId[productId]) &&
          resolvedGalleryByProductId[productId].length > 0
        ) {
          productGallery = resolvedGalleryByProductId[productId];
        }

        const extras: AdditionalExtra[] = (Array.isArray(item?.addons) ? item.addons : []).map((addon: any) => {
          const extraQty = Math.max(1, toNumber(addon?.quantity));
          const extraUnitPrice = toNumber(addon?.unit_price ?? addon?.price);
          const extraTotal = toNumber(addon?.total ?? extraQty * extraUnitPrice);

          return {
            title: addon?.name || "Adicional",
            quantity: extraQty,
            price: extraUnitPrice,
            total: extraTotal,
          };
        });

        const rawMetadata = safeParseJSON(item?.metadata, {});
        const rawItemMetadata = safeParseJSON(rawMetadata?.raw_item, {});
        const details = rawMetadata?.details || rawItemMetadata?.details || {};
        const selectedAttributes = extractSelectedAttributes(
          rawItemMetadata?.attributes || [],
          productGallery
        );

        const group = ensureGroup(store);

        const normalizedItem: RenderableOrderItem = {
          id: String(item?.id || `item-${productId}-${idx}`),
          orderId: toNumber(item?.orderId || item?.order_id),
          productId,
          title: item?.name || product?.title || "Produto",
          quantity,
          unitPrice,
          lineTotal,
          additionalExtra: extras,
          details,
          description: item?.description || null,
          gallery: productGallery,
          selectedAttributes,
          store,
        };

        group.items.push(normalizedItem);
        group.subtotal += lineTotal;
      });
    } else {
      (products || []).forEach((productItem: any, idx: number) => {
        const productId = Number(productItem?.id || 0);
        const listItem = listItems.find(
          (item: any) => Number(item?.product?.id || item?.product_id || item?.id) === productId
        );

        const store = productItem?.store || order?.store || {};
        const quantity = Math.max(
          1,
          toNumber(
            listItem?.quantity ||
              listItem?.product?.quantity ||
              listItem?.metadata?.quantity ||
              listItem?.raw_item?.quantity ||
              1
          )
        );

        const unitPrice = toNumber(listItem?.unit_price ?? listItem?.price ?? productItem?.price);

        const attributes = Array.isArray(listItem?.attributes) ? listItem.attributes : [];

        const additionalExtra: AdditionalExtra[] = [];

        attributes.forEach((attribute: any) => {
          const productAttributes = safeParseJSON(productItem?.attributes, []);
          const attributeTitle = productAttributes.find((entry: any) => entry?.id === attribute?.id)?.title ||
            attribute?.title ||
            "Adicional";

          (attribute?.variations || []).forEach((variation: any) => {
            const extraQty = Math.max(1, toNumber(variation?.quantity || 1));
            const extraPrice = toNumber(variation?.price);

            additionalExtra.push({
              title: attributeTitle,
              quantity: extraQty,
              price: extraPrice,
              total: extraQty * extraPrice,
            });
          });
        });

        const extrasTotal = additionalExtra.reduce((sum, extra) => sum + extra.total, 0);
        const lineTotal = quantity * unitPrice + extrasTotal;

        let productGallery = productItem?.gallery || [];
        if (
          !getImage(productGallery, "thumb") &&
          productId > 0 &&
          Array.isArray(resolvedGalleryByProductId[productId]) &&
          resolvedGalleryByProductId[productId].length > 0
        ) {
          productGallery = resolvedGalleryByProductId[productId];
        }

        const selectedAttributes = extractSelectedAttributes(attributes, productGallery);
        const details = listItem?.details || listItem?.raw_item?.details || {};

        const group = ensureGroup(store);

        const normalizedItem: RenderableOrderItem = {
          id: String(productId || `legacy-${idx}`),
          orderId: toNumber(listItem?.orderId || listItem?.order_id),
          productId,
          title: productItem?.title || listItem?.name || "Produto",
          quantity,
          unitPrice,
          lineTotal,
          additionalExtra,
          details,
          description: listItem?.description || null,
          gallery: productGallery,
          selectedAttributes,
          store,
        };

        group.items.push(normalizedItem);
        group.subtotal += lineTotal;
      });
    }

    const list = Array.from(groups.values());

    if (list.length === 1 && list[0].freight <= 0) {
      list[0].freight = toNumber(order?.delivery?.price || order?.delivery_price);
    }

    list.forEach((group) => {
      group.total = group.subtotal + group.freight;
    });

    return list;
  }, [order, resolvedGalleryByProductId]);

  const totalItems = useMemo(
    () => groupedItemsByStore.reduce((sum, group) => sum + group.items.length, 0),
    [groupedItemsByStore]
  );

  const totalQuantity = useMemo(
    () => groupedItemsByStore.reduce((sum, group) => sum + group.items.reduce((acc, item) => acc + item.quantity, 0), 0),
    [groupedItemsByStore]
  );

  const subtotalByGroups = useMemo(
    () => groupedItemsByStore.reduce((sum, group) => sum + group.subtotal, 0),
    [groupedItemsByStore]
  );

  const freightByGroups = useMemo(
    () => groupedItemsByStore.reduce((sum, group) => sum + group.freight, 0),
    [groupedItemsByStore]
  );

  const notifyDelivery = async (e: any) => {
    e.preventDefault();
    if (!order?.id) return;
    setForm({ loading: true });

    const request: any = await api.bridge({
      method: "post",
      url: "orders/update-delivery-status",
      data: { id: order.id, delivery_status: deliveryStatus },
    });

    if (request?.response) {
      const returnedOrder = request?.data?.data ?? request?.data ?? null;
      if (returnedOrder && returnedOrder.id) {
        const normalizedOrder = normalizeOrderData(returnedOrder);
        setOrder(normalizedOrder);
      } else {
        setOrder({ ...order, delivery_status: deliveryStatus } as any);
      }
      alert("Status atualizado e notificação enviada ao cliente.");
    } else {
      alert(request?.message || "Erro ao atualizar status do pedido.");
    }

    setForm({ loading: false });
  };

  const currentDeliveryType = deliveryTypes.find((d) => d.value === deliveryStatus);
  const displayOrderId = order?.id || Number(router.query.id ?? router.query[0] ?? 0) || "";

  const paymentMethod = getPaymentMethodCode(order);
  const paymentMethodLabel = getPaymentMethodLabel(order);
  const paymentStatusCode = getPaymentStatusCode(order);
  const paymentStatusLabel = getPaymentStatusLabel(paymentStatusCode);
  const paymentStatusVariant = getPaymentStatusVariant(paymentStatusCode);
  const paymentInstallments = toNumber(order?.metadata?.installments || (order as any)?.payment?.installments || 0);
  const paymentUrl = order?.metadata?.url || (order as any)?.payment?.url || null;
  const paymentPdf = order?.metadata?.pdf || (order as any)?.payment?.pdf || null;
  const paymentLine = order?.metadata?.line || (order as any)?.payment?.line || null;
  const paidAt = order?.metadata?.paid_at || (order as any)?.payment?.paid_at || null;

  const deliveryInfo = getOrderDeliveryInfo(order as any);

  return (
    <PainelLayout>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/painel/pedidos"
          className="p-2 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-600"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900">Pedido #{displayOrderId}</h1>
          <OrderStatusBadge
            status={order.status}
            metadataStatus={order.metadata?.status}
            paymentStatus={order.metadata?.payment_status}
            paidAt={order.metadata?.paid_at}
            statusText={order.statusText}
          />
          {(order as any)?.groupHash && (
            <Badge variant="neutral">Grupo {(order as any).groupHash}</Badge>
          )}
        </div>
      </div>

      {loadingOrder ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-8 flex items-center justify-center gap-3 text-zinc-500">
          <div className="w-5 h-5 border-2 border-zinc-300 border-t-yellow-400 rounded-full animate-spin" />
          Carregando pedido...
        </div>
      ) : !order?.id ? (
        <div className="bg-white rounded-xl border border-zinc-200 p-8 text-sm text-zinc-500">
          Pedido não encontrado ou indisponível no momento.
        </div>
      ) : (
        <>
      <div className="grid gap-4 md:grid-cols-3 mb-5">
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Itens</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">{totalItems}</p>
          <p className="text-xs text-zinc-500">{totalQuantity} unidade(s)</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Subtotal</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">R$ {moneyFormat(subtotalByGroups || order.subtotal || 0)}</p>
          <p className="text-xs text-zinc-500">Sem frete</p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-xl p-4">
          <p className="text-xs uppercase tracking-wide text-zinc-500">Total</p>
          <p className="mt-1 text-2xl font-bold text-zinc-900">R$ {moneyFormat(order.total || subtotalByGroups + freightByGroups)}</p>
          <p className="text-xs text-zinc-500">Pedido criado em {getExtenseData(order.createdAt)}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <div className="flex items-center gap-2 mb-1">
              <Package size={18} className="text-zinc-400" />
              <h2 className="text-lg font-semibold text-zinc-900">Itens do pedido</h2>
            </div>
            <p className="text-sm text-zinc-500 mb-6">Organizado por loja</p>

            {groupedItemsByStore.length > 0 ? (
              groupedItemsByStore.map((group) => (
                <div key={`store-group-${group.storeId}`} className="mb-6 last:mb-0 border border-zinc-200 rounded-xl p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-100 pb-3 mb-4">
                    <div>
                      <div className="font-semibold text-zinc-900 text-base flex items-center gap-2">
                        <Store size={16} className="text-yellow-500" />
                        {group.storeName}
                      </div>
                      {!!group.storeSlug && (
                        <p className="text-xs text-zinc-500 mt-1">/{group.storeSlug}</p>
                      )}
                    </div>
                    <Badge variant="neutral">{group.items.length} item(ns)</Badge>
                  </div>

                  <div className="space-y-4">
                    {group.items.map((item) => {
                      const imageUrl = getImage(item.gallery, "thumb");

                      return (
                        <div key={item.id} className="border border-zinc-100 rounded-lg p-3">
                          <div className="flex items-start gap-3">
                            <div className="w-16 h-16 rounded-lg overflow-hidden border border-zinc-200 bg-zinc-100 flex-shrink-0 flex items-center justify-center">
                              {imageUrl ? (
                                <Image
                                  src={imageUrl}
                                  alt={item.title}
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
                                  <p className="font-medium text-zinc-900 truncate">{item.title}</p>
                                  <p className="text-xs text-zinc-500 mt-0.5">{item.quantity} x R$ {moneyFormat(item.unitPrice)}</p>
                                  {Number(item.orderId || 0) > 0 && (
                                    <p className="text-[11px] text-zinc-400 mt-1">Pedido da loja #{item.orderId}</p>
                                  )}
                                </div>
                                <div className="text-right text-sm">
                                  <p className="font-semibold text-zinc-900">R$ {moneyFormat(item.lineTotal)}</p>
                                </div>
                              </div>

                              {(item.details?.dateStart || item.details?.dateEnd || item.details?.days) && (
                                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-zinc-600">
                                  <Calendar size={12} />
                                  {item.details?.dateStart && <span>Início: {item.details.dateStart}</span>}
                                  {item.details?.dateEnd && <span>Fim: {item.details.dateEnd}</span>}
                                  {!!item.details?.days && <span>{item.details.days} dia(s)</span>}
                                </div>
                              )}

                              {!!item.description && (
                                <p className="text-xs text-zinc-600 mt-2">{item.description}</p>
                              )}

                              {item.additionalExtra.length > 0 && (
                                <div className="mt-3 pt-3 border-t border-dashed border-zinc-200 space-y-1">
                                  <p className="text-xs font-semibold text-zinc-600">Adicionais</p>
                                  {item.additionalExtra.map((extra, extraKey) => (
                                    <div key={`${item.id}-extra-${extraKey}`} className="flex items-center justify-between text-xs text-zinc-600">
                                      <span>{extra.quantity} x {extra.title}</span>
                                      <span>R$ {moneyFormat(extra.total || extra.price)}</span>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {(item.selectedAttributes?.length || 0) > 0 && (
                                <div className="mt-3 pt-3 border-t border-dashed border-zinc-200 space-y-2">
                                  <p className="text-xs font-semibold text-zinc-600">
                                    Personalizações enviadas pelo cliente
                                  </p>

                                  {item.selectedAttributes?.map((attribute) => (
                                    <div key={`${item.id}-attribute-${attribute.id}`} className="space-y-1.5">
                                      <p className="text-xs font-medium text-zinc-600">
                                        {attribute.title}
                                      </p>

                                      {attribute.variations.map((variation, variationKey) => {
                                        const imageUrl =
                                          variation.imageUrl ||
                                          (isImageLikeValue(variation.value) ? variation.value : null);
                                        const variationLabel = variation.value && !imageUrl
                                          ? variation.value
                                          : variation.title;

                                        const baseName = `${item.title}-${attribute.title}-${variation.title || `imagem-${variationKey + 1}`}`;
                                        const downloadUrl = imageUrl
                                          ? buildDownloadUrl(imageUrl, baseName, false)
                                          : null;
                                        const zipUrl = imageUrl
                                          ? buildDownloadUrl(imageUrl, `${baseName}-zip`, true)
                                          : null;

                                        return (
                                          <div
                                            key={`${item.id}-attribute-${attribute.id}-variation-${variation.id}-${variationKey}`}
                                            className="rounded-lg border border-zinc-200 bg-zinc-50 p-2.5"
                                          >
                                            <div className="text-xs text-zinc-700">
                                              {variation.quantity > 1 && (
                                                <span className="font-medium">{variation.quantity}x </span>
                                              )}
                                              <span>{variationLabel || "Personalização"}</span>
                                              {variation.price > 0 && (
                                                <span className="ml-1 text-zinc-500">
                                                  (+R$ {moneyFormat(variation.price)})
                                                </span>
                                              )}
                                            </div>

                                            {!!imageUrl && (
                                              <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <img
                                                  src={imageUrl}
                                                  alt={variationLabel || "Imagem enviada pelo cliente"}
                                                  className="h-16 w-16 rounded-md border border-zinc-200 object-cover bg-white"
                                                />

                                                {!!downloadUrl && (
                                                  <a
                                                    href={downloadUrl}
                                                    className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-2.5 py-1.5 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                                                    rel="noreferrer"
                                                  >
                                                    <Download size={12} />
                                                    Baixar
                                                  </a>
                                                )}

                                                {!!zipUrl && (
                                                  <a
                                                    href={zipUrl}
                                                    className="inline-flex items-center gap-1.5 rounded-md border border-zinc-300 px-2.5 py-1.5 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100 transition-colors"
                                                    rel="noreferrer"
                                                  >
                                                    <Archive size={12} />
                                                    ZIP
                                                  </a>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="border-t border-zinc-100 pt-3 mt-4 space-y-1.5">
                    <div className="flex justify-between text-sm text-zinc-600">
                      <span>Subtotal de itens</span>
                      <span>R$ {moneyFormat(group.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-zinc-600">
                      <span>Frete</span>
                      <span>R$ {moneyFormat(group.freight)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-zinc-900">
                      <span>Total da loja</span>
                      <span>R$ {moneyFormat(group.total)}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-zinc-500 text-sm">Nenhum item encontrado neste pedido.</p>
            )}

            <div className="border-t-2 border-zinc-200 pt-4 mt-4 space-y-2">
              <div className="flex justify-between text-sm text-zinc-600">
                <span>Subtotal</span>
                <span>R$ {moneyFormat(subtotalByGroups || order.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between text-sm text-zinc-600">
                <span>Frete</span>
                <span>R$ {moneyFormat(freightByGroups || order.delivery?.price || order.delivery_price || 0)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xl font-bold text-zinc-900">Total</span>
                <span className="text-xl font-bold text-zinc-900">R$ {moneyFormat(order.total || subtotalByGroups + freightByGroups)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-zinc-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <User size={16} className="text-zinc-400" />
              <h3 className="font-semibold text-zinc-900">Dados do cliente</h3>
            </div>
            <div className="text-sm text-zinc-600 space-y-1">
              <div className="font-medium text-zinc-900">{(order as any).user?.name || "Não informado"}</div>
              <div>{(order as any).user?.email || "E-mail não informado"}</div>
              <div>{(order as any).user?.phone || "Telefone não informado"}</div>
              {(order as any).user?.cpf && <div>CPF: {(order as any).user?.cpf}</div>}
              {(order as any).user?.id && (
                <div className="text-xs text-zinc-500 pt-1">Cliente ID: {(order as any).user.id}</div>
              )}
            </div>
          </div>

          {!!order.metadata && (
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={16} className="text-zinc-400" />
                <h3 className="font-semibold text-zinc-900">Pagamento</h3>
              </div>

              <div className="text-sm space-y-3">
                <div>
                  <p className="font-medium text-zinc-900">
                    {paymentMethodLabel}
                    {paymentMethod === "credit_card" && paymentInstallments > 1 && (
                      <span> em {paymentInstallments}x</span>
                    )}
                  </p>
                  <div className="mt-2">
                    <Badge variant={paymentStatusVariant} dot>
                      {paymentStatusLabel}
                    </Badge>
                  </div>
                </div>

                {paidAt && (
                  <p className="text-xs text-zinc-500">Pago em {formatDateTime(paidAt)}</p>
                )}

                {(paymentUrl || paymentPdf) && (
                  <div className="pt-2 border-t border-zinc-100 space-y-1">
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
                        Abrir boleto (PDF) <ExternalLink size={12} />
                      </a>
                    )}
                    {!!paymentLine && (
                      <p className="text-xs text-zinc-500 break-all">Linha digitável: {paymentLine}</p>
                    )}
                  </div>
                )}

                {(() => {
                  const splits = order.metadata?.split || order.metadata?.splits || [];
                  const storeRecipients = splits.filter((s: any) => s.recipient?.type !== "company");
                  if (storeRecipients.length === 0) return null;

                  return (
                    <div className="text-xs text-zinc-500 pt-2 border-t border-zinc-100">
                      <p className="font-medium text-zinc-700 mb-1">
                        Recebedor{storeRecipients.length > 1 ? "es" : ""}
                      </p>
                      {storeRecipients.map((s: any, idx: number) => (
                        <p key={`recipient-${idx}`}>
                          {s.recipient?.name || "N/A"} <span className="text-zinc-400">({s.recipient?.id || "-"})</span>
                        </p>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-zinc-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-zinc-400" />
                <h3 className="font-semibold text-zinc-900">Entrega</h3>
              </div>
              {toNumber(order?.delivery?.price) > 0 ? (
                <Badge variant="neutral">R$ {moneyFormat(order.delivery?.price || 0)}</Badge>
              ) : (
                <Badge variant="success">Gratuita</Badge>
              )}
            </div>

            <div className="text-sm space-y-3">
              {deliveryInfo?.to && (
                <div className="flex items-center gap-2 text-zinc-600">
                  <Truck size={14} className="text-zinc-400" />
                  {deliveryInfo.to}
                </div>
              )}
              {(deliveryInfo?.date || deliveryInfo?.time) && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  {deliveryInfo?.date && (
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-amber-600" />
                      <span className="font-medium text-amber-800">{deliveryInfo.date}</span>
                    </div>
                  )}
                  {deliveryInfo?.time && (
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={14} className="text-amber-600" />
                      <span className="text-amber-700">{deliveryInfo.time}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-dashed border-zinc-200">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                <MapPin size={12} />
                Endereço de entrega
              </div>
              <div className="text-sm text-zinc-600 space-y-0.5">
                <div>
                  {order?.delivery?.address?.street || "Rua não informada"}
                  {order?.delivery?.address?.number ? `, ${order.delivery.address.number}` : ""}
                  {order?.delivery?.address?.neighborhood ? ` - ${order.delivery.address.neighborhood}` : ""}
                </div>
                <div>
                  CEP: {order?.delivery?.address?.zipCode || "Não informado"}
                  {order?.delivery?.address?.complement && ` - ${order.delivery.address.complement}`}
                </div>
                <div>
                  {order?.delivery?.address?.city || "Cidade não informada"}
                  {order?.delivery?.address?.state ? ` | ${order.delivery.address.state}` : ""}
                </div>
              </div>
            </div>
          </div>

          {groupedItemsByStore.length > 1 && (
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Store size={16} className="text-zinc-400" />
                <h3 className="font-semibold text-zinc-900">Resumo por loja</h3>
              </div>
              <div className="space-y-2 text-sm">
                {groupedItemsByStore.map((group) => (
                  <div
                    key={`summary-store-${group.storeId}`}
                    className="flex items-center justify-between border border-zinc-100 rounded-lg px-3 py-2"
                  >
                    <div>
                      <p className="font-medium text-zinc-900">{group.storeName}</p>
                      <p className="text-xs text-zinc-500">{group.items.length} item(ns)</p>
                    </div>
                    <p className="font-semibold text-zinc-900">R$ {moneyFormat(group.total)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-zinc-200 p-5">
            <h3 className="font-semibold text-zinc-900 mb-3">Status de processo</h3>
            <form onSubmit={notifyDelivery} className="space-y-3">
              <Select
                name="status_entrega"
                onChange={(e: any) => setDeliveryStatus(e.target.value)}
                value={deliveryStatus ?? "pending"}
                options={deliveryTypes}
              />
              {currentDeliveryType && (
                <p className="text-xs text-zinc-400">{currentDeliveryType.description}</p>
              )}
              <button
                type="submit"
                disabled={form.loading}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                <Send size={14} />
                {form.loading ? "Enviando..." : "Atualizar e notificar"}
              </button>
            </form>
          </div>
        </div>
      </div>
        </>
      )}
    </PainelLayout>
  );
}
