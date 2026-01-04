import { OrderType } from "@/src/models/order";
import Api from "@/src/services/api";

/**
 * Fetch order by id (or groupHash) using the bridge API and return a normalized OrderType or null
 * Now supports the new grouped order structure from Yuri's backend updates
 */
export async function fetchOrderById(api?: Api, orderId?: number | string): Promise<OrderType | null> {
  try {
    const client = api ?? new Api();
    const req: any = await client.bridge({
      method: "get",
      url: `order/${orderId}`,
    });

    // Nova estrutura: { order: { ... } } ou formato antigo
    const orderData = req?.data?.order ?? req?.order ?? req?.data?.data ?? req?.data ?? null;

    if (!orderData) return null;

    // Parse metadata se vier como string JSON
    let parsedMetadata = orderData.metadata;
    if (typeof parsedMetadata === 'string') {
      try {
        parsedMetadata = JSON.parse(parsedMetadata);
      } catch (e) {
        parsedMetadata = {};
      }
    }

    // Parse deliverySchedule - novo formato do Yuri: { date, period, time }
    const rawSchedule = orderData.deliverySchedule ?? orderData.delivery?.schedule ?? orderData.delivery_schedule;
    let scheduleDate: string | null = null;
    let scheduleDisplay: string | null = null;

    if (rawSchedule && typeof rawSchedule === 'object') {
      // Novo formato estruturado: { date: "2025-01-10", period: "Manhã", time: "09:00 - 12:00" }
      scheduleDate = rawSchedule.date ?? null;
      const parts = [rawSchedule.period, rawSchedule.time].filter(Boolean);
      scheduleDisplay = parts.length > 0 ? parts.join(' - ') : null;
    } else if (typeof rawSchedule === 'string') {
      // Formato legado: string simples como "Manha - 09:00 as 12:00"
      scheduleDisplay = rawSchedule;
    }

    // Mapeia a nova estrutura para o formato esperado pelos componentes
    const normalizedOrder: any = {
      ...orderData,
      id: orderData.id ?? orderData.mainOrderId,
      // Customer pode vir como objeto ou precisa ser mapeado
      user: orderData.customer ?? orderData.user,
      // Delivery data (suporta snake_case e camelCase, mescla com campos legados)
      delivery: {
        to: orderData.delivery?.to ?? orderData.deliveryTo ?? orderData.delivery_to,
        schedule: scheduleDisplay,
        scheduleDate: scheduleDate,
        price: orderData.delivery?.price ?? orderData.deliveryTotal ?? orderData.deliveryPrice ?? orderData.delivery_price,
        address: orderData.delivery?.address ?? orderData.deliveryAddress ?? orderData.delivery_address,
        status: orderData.delivery?.status ?? orderData.deliveryStatus ?? orderData.delivery_status,
      },
      // Items - API do Yuri retorna listItems, frontend espera items
      items: orderData.items ?? orderData.listItems ?? [],
      listItems: orderData.items ?? orderData.listItems ?? [],
      // Products
      products: orderData.products ?? orderData.productsData ?? [],
      // Totals
      total: orderData.total,
      subtotal: orderData.subtotal,
      deliveryTotal: orderData.deliveryTotal,
      // Status
      status: orderData.status,
      delivery_status: orderData.deliveryStatus ?? orderData.delivery_status,
      // Metadata (mescla payment com metadata original)
      metadata: {
        ...(parsedMetadata ?? {}),
        ...(orderData.payment ?? {}),
        // scheduleStart agora vem do deliverySchedule.date
        scheduleStart: scheduleDate ?? parsedMetadata?.scheduleStart ?? orderData.payment?.scheduleStart,
        scheduleEnd: scheduleDate ?? parsedMetadata?.scheduleEnd ?? orderData.payment?.scheduleEnd,
      },
      // Store info
      store: orderData.store,
      stores: orderData.stores,
      // Created at
      createdAt: orderData.createdAt ?? orderData.created_at,
    };

    return normalizedOrder as OrderType;
  } catch (err) {
    console.error("fetchOrderById error:", err);
    return null;
  }
}

const api = new Api();
/**
 * Tipagens básicas (ajusta conforme o backend for evoluindo)
 * Atualizado para suportar a nova estrutura de pedidos agrupados (multi-loja)
 */
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
  // qualquer coisa extra
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

/**
 * Lista orders do cliente (painel do usuário, por customer)
 */
export async function getOrdersByCustomer(customerId: number): Promise<Order[]> {
  const response = await api.bridge<any>({
    method: "post",
    url: "orders/customer-list",
    data: {
      customer: customerId,
    },
  });

  // se tua API retorna { response, data }
  if (response.data?.data) {
    return response.data.data;
  }

  // se retorna array direto
  return response.data;
}

/**
 * Lista orders do usuário logado (Get/List padrão da API)
 */
export async function getMyOrders(): Promise<Order[]> {
  const response = await api.bridge<any>({
    method: "get",
    url: "orders/list",
  });

  if (response.data?.data) {
    return response.data.data;
  }

  return response.data;
}

/**
 * Busca detalhe de uma order por ID (Get / getOrderById)
 */
export async function getOrderById(id: number): Promise<Order> {
  const response = await api.bridge<any>({
    method: "post",
    url: "orders/get",
    data: { id },
  });

  if (response.data?.data) {
    return response.data.data;
  }

  return response.data;
}

/**
 * Endpoint específico pro gráfico (orders por período)
 */
export async function getOrdersForChart(params: OrderChartParams): Promise<Order[]> {
  const response = await api.bridge<any>({
    method: "post",
    url: "orders/chart",
    data: params,
  });

  // se back devolver array direto
  if (Array.isArray(response.data)) {
    return response.data;
  }

  // se for { response, data }
  return response.data.data ?? [];
}

/**
 * Cria orders (multi-loja) – Register
 */
export async function registerOrder(payload: RegisterOrderPayload) {
  const response = await api.bridge<any>({
    method: "post",
    url: "orders/register",
    data: payload,
  });

  return response.data;
}

/**
 * Marca order como "processing"
 */
export async function setOrderProcessing(id: number) {
  const response = await api.bridge<any>({
    method: "post",
    url: "orders/processing",
    data: { id },
  });

  return response.data;
}

/**
 * Atualiza metadata de pagamento da order
 */
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
