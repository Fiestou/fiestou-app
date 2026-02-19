import { OrderType } from "@/src/models/order";
import { CartType } from "@/src/models/cart";
import Api from "@/src/services/api";

export async function fetchOrderById(api?: Api, orderId?: number | string): Promise<OrderType | null> {
  try {
    const client = api ?? new Api();
    const req: any = await client.bridge({
      method: "get",
      url: `order/${orderId}`,
    });

    const orderData = req?.data?.order ?? req?.order ?? req?.data?.data ?? req?.data ?? null;

    if (!orderData) return null;

    let parsedMetadata = orderData.metadata;
    if (typeof parsedMetadata === 'string') {
      try {
        parsedMetadata = JSON.parse(parsedMetadata);
      } catch (e) {
        parsedMetadata = {};
      }
    }

    const rawSchedule = orderData.deliverySchedule ?? orderData.delivery?.schedule ?? orderData.delivery_schedule;
    let scheduleDate: string | null = null;
    let scheduleDisplay: string | null = null;

    if (rawSchedule && typeof rawSchedule === 'object') {
      scheduleDate = rawSchedule.date ?? null;
      const parts = [rawSchedule.period, rawSchedule.time].filter(Boolean);
      scheduleDisplay = parts.length > 0 ? parts.join(' - ') : null;
    } else if (typeof rawSchedule === 'string') {
      scheduleDisplay = rawSchedule;
    }

    const normalizedOrder: any = {
      ...orderData,
      id: orderData.id ?? orderData.mainOrderId,
      user: orderData.customer ?? orderData.user,
      delivery: {
        to: orderData.delivery?.to ?? orderData.deliveryTo ?? orderData.delivery_to,
        schedule: orderData.delivery?.schedule ?? {
          date: scheduleDate || '',
          period: '',
          time: scheduleDisplay || ''
        },
        scheduleDate: scheduleDate,
        price: orderData.delivery?.price ?? orderData.deliveryTotal ?? orderData.deliveryPrice ?? orderData.delivery_price,
        address: orderData.delivery?.address ?? orderData.deliveryAddress ?? orderData.delivery_address,
        status: orderData.delivery?.status ?? orderData.deliveryStatus ?? orderData.delivery_status,
      },
      items: orderData.items ?? orderData.listItems ?? [],
      listItems: orderData.items ?? orderData.listItems ?? [],
      products: orderData.products ?? orderData.productsData ?? [],
      total: orderData.total,
      subtotal: orderData.subtotal,
      deliveryTotal: orderData.deliveryTotal,
      status: orderData.status,
      delivery_status: orderData.deliveryStatus ?? orderData.delivery_status,
      metadata: {
        ...(parsedMetadata ?? {}),
        ...(orderData.payment ?? {}),
        scheduleStart: scheduleDate ?? parsedMetadata?.scheduleStart ?? orderData.payment?.scheduleStart,
        scheduleEnd: scheduleDate ?? parsedMetadata?.scheduleEnd ?? orderData.payment?.scheduleEnd,
      },
      store: orderData.store,
      stores: orderData.stores,
      createdAt: orderData.createdAt ?? orderData.created_at,
    };

    return normalizedOrder as OrderType;
  } catch (err) {
    console.error("fetchOrderById error:", err);
    return null;
  }
}

const api = new Api();

function parseObject(value: any): Record<string, any> {
  if (!value) return {};
  if (Array.isArray(value)) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        return {};
      }
      return parsed;
    } catch {
      return {};
    }
  }
  if (typeof value === "object" && !Array.isArray(value)) {
    return value;
  }
  return {};
}

function parseArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

export function normalizeOrderEntity(raw: any): Order {
  const metadata = parseObject(raw?.metadata);
  const payment = parseObject(raw?.payment);
  const delivery = parseObject(raw?.delivery);
  const listItems = parseArray(raw?.listItems);
  const items = parseArray(raw?.items);
  const customer = raw?.customer ?? raw?.user ?? null;
  const user = raw?.user ?? raw?.customer ?? null;

  return {
    ...(raw ?? {}),
    customer,
    user,
    delivery,
    listItems: listItems.length ? listItems : items,
    items: items.length ? items : listItems,
    deliverySchedule:
      raw?.deliverySchedule ?? delivery?.schedule ?? raw?.delivery_schedule ?? null,
    createdAt: raw?.createdAt ?? raw?.created_at ?? null,
    created_at: raw?.created_at ?? raw?.createdAt ?? null,
    metadata: {
      ...metadata,
      ...payment,
    },
  } as Order;
}

function resolveRawOrderItem(item: any): Record<string, any> {
  const metadata = parseObject(item?.metadata);
  const rawItem = parseObject(metadata?.raw_item);
  if (Object.keys(rawItem).length > 0) {
    return rawItem;
  }
  return typeof item === "object" && !Array.isArray(item) ? item : {};
}

function toPositiveNumber(value: any, fallback = 0): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return parsed > 0 ? parsed : fallback;
}

export interface BuildCartItemsFromOrderResult {
  items: CartType[];
  skipped: number;
}

export function buildCartItemsFromOrder(order: any): BuildCartItemsFromOrderResult {
  const sourceItemsRaw = parseArray(order?.listItems);
  const sourceItems = sourceItemsRaw.length
    ? sourceItemsRaw
    : parseArray(order?.items);

  const items: CartType[] = [];
  let skipped = 0;

  sourceItems.forEach((sourceItem) => {
    const rawItem = resolveRawOrderItem(sourceItem);
    const productObj =
      parseObject(rawItem?.product).id
        ? parseObject(rawItem?.product)
        : parseObject(sourceItem?.product);

    const productId = Number(
      rawItem?.product_id ??
      rawItem?.productId ??
      sourceItem?.product_id ??
      sourceItem?.productId ??
      productObj?.id
    );

    if (!Number.isFinite(productId) || productId <= 0) {
      skipped += 1;
      return;
    }

    const quantity = toPositiveNumber(
      rawItem?.quantity ?? sourceItem?.quantity,
      1
    );
    const unitPrice = Number(
      rawItem?.unit_price ??
      rawItem?.unitPrice ??
      sourceItem?.unit_price ??
      sourceItem?.unitPrice ??
      productObj?.priceSale ??
      productObj?.price ??
      0
    );
    const rawTotal = Number(rawItem?.total ?? sourceItem?.total);
    const total =
      Number.isFinite(rawTotal) && rawTotal > 0
        ? rawTotal
        : Math.max(0, unitPrice) * quantity;

    const attributesSource = parseArray(rawItem?.attributes);
    const attributes = attributesSource.length
      ? attributesSource
      : parseArray(sourceItem?.attributes);

    const details = {
      ...parseObject(sourceItem?.details),
      ...parseObject(rawItem?.details),
    } as Record<string, any>;

    if (details?.dateStart) details.dateStart = String(details.dateStart);
    if (details?.dateEnd) details.dateEnd = String(details.dateEnd);

    items.push({
      product: productId,
      attributes,
      quantity,
      details,
      total,
    });
  });

  return { items, skipped };
}

export interface OrderCustomer {
  id: number;
  name: string;
  email: string;
  phone?: string;
}

export interface OrderStore {
  id: number;
  slug?: string;
  title?: string;
  companyName?: string;
  partnerName?: string;
  partnerEmail?: string;
  orderTotal?: number;
  orderId?: number;
}

export interface Order {
  id: number;
  groupHash?: string;
  mainOrderId?: number;
  orderIds?: number[];
  ordersCount?: number;
  user: number | OrderCustomer;
  customer?: OrderCustomer;
  store: number | null;
  stores?: OrderStore[];
  total: number;
  subtotal?: number;
  deliveryTotal?: number;
  deliveryPrice?: number;
  platformCommission?: number;
  paying?: number;
  status: number | string;
  statusText?: string;
  deliveryStatus?: string;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface OrderChartParams {
  start: string; // "YYYY-MM-DD"
  end: string;   // "YYYY-MM-DD"
}

export interface RegisterOrderPayload {
  deliveryAddress: any;
  listItems: any[];
  freights: {
    zipcode: string;
    productsIds: number[];
  };
  platformCommission?: number;
  deliverySchedule?: string;
  deliveryStatus?: string;
  deliveryTo?: string;
}

export async function getOrdersByCustomer(customerId: number): Promise<Order[]> {
  const response = await api.bridge<any>({
    method: "post",
    url: "orders/customer-list",
    data: {
      customer: customerId,
    },
  });

  if (response.data?.data) {
    return (Array.isArray(response.data.data) ? response.data.data : []).map(
      normalizeOrderEntity
    );
  }

  return (Array.isArray(response.data) ? response.data : []).map(
    normalizeOrderEntity
  );
}

export interface OrderFilters {
  status?: string;
  search?: string;
  date_from?: string;
  date_to?: string;
  price_min?: string;
  price_max?: string;
}

export async function getMyOrders(filters?: OrderFilters): Promise<Order[]> {
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([k, v]) => {
      if (v) params.append(k, v);
    });
  }
  const qs = params.toString();

  const response = await api.bridge<any>({
    method: "get",
    url: `orders/list${qs ? `?${qs}` : ""}`,
  });

  const source = response.data?.data ?? response.data;
  const list = Array.isArray(source) ? source : [];
  return list.map(normalizeOrderEntity);
}

export async function getOrderById(id: number): Promise<Order> {
  const response = await api.bridge<any>({
    method: "post",
    url: "orders/get",
    data: { id },
  });

  const source = response.data?.data ?? response.data;
  return normalizeOrderEntity(source);
}

export async function getOrdersForChart(params: OrderChartParams): Promise<Order[]> {
  const response = await api.bridge<any>({
    method: "post",
    url: "orders/chart",
    data: params,
  });

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.data ?? [];
}

export interface DashboardStatsResponse {
  statusCounts: {
    paid: number;
    pending: number;
    canceled: number;
    other: number;
  };
  ordersCount: number;
  totalRevenue: number;
  avgTicket: number;
  recentOrders: Array<{
    id: number;
    created_at: string;
    total: number;
    status: number;
    statusText: string;
    customer: { name: string; email: string } | null;
    metadata: any;
  }>;
  period: string;
}

export async function getDashboardStats(period: string = '30'): Promise<DashboardStatsResponse | null> {
  try {
    const response = await api.bridge<any>({
      method: "get",
      url: `orders/dashboard-stats?period=${period}`,
    });
    const data = response.data?.data ?? response.data ?? null;
    if (!data) {
      return null;
    }

    const recentOrders = Array.isArray(data?.recentOrders)
      ? data.recentOrders.map(normalizeOrderEntity)
      : [];

    return {
      ...data,
      recentOrders,
    } as DashboardStatsResponse;
  } catch {
    return null;
  }
}

export async function registerOrder(payload: RegisterOrderPayload) {
  const response = await api.bridge<any>({
    method: "post",
    url: "orders/register",
    data: payload,
  });

  return response.data;
}

export async function setOrderProcessing(id: number) {
  const response = await api.bridge<any>({
    method: "post",
    url: "orders/processing",
    data: { id },
  });

  return response.data;
}

export async function registerOrderMeta(id: number, metadata: any) {
  const response = await api.bridge<any>({
    method: "post",
    url: "orders/register-meta",
    data: {
      id,
      metadata,
    },
  });

  return response.data;
}
