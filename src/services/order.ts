// src/services/order.ts
import Api from "@/src/services/api";

const api = new Api();

/**
 * Tipagens básicas (ajusta conforme o backend for evoluindo)
 */
export interface Order {
  id: number;
  user: number;
  store: number | null;
  total: number;
  subtotal?: number;
  deliveryPrice?: number;
  platformCommission?: number;
  paying?: number;
  status: number;
  created_at: string;
  updated_at: string;
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
