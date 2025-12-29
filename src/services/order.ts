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

    // Mapeia a nova estrutura para o formato esperado pelos componentes
    const normalizedOrder: any = {
      ...orderData,
      id: orderData.id ?? orderData.mainOrderId,
      // Customer pode vir como objeto ou precisa ser mapeado
      user: orderData.customer ?? orderData.user,
      // Delivery data
      delivery: orderData.delivery ?? {
        to: orderData.deliveryTo,
        schedule: orderData.deliverySchedule,
        price: orderData.deliveryTotal ?? orderData.deliveryPrice,
        address: orderData.deliveryAddress,
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
      // Metadata
      metadata: orderData.payment ?? orderData.metadata,
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
