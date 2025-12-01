// src/models/order.ts
// Tipagens oficiais e modernas para o novo modelo de pedidos

import { UserType } from "./user";
import { AddressType } from "./address";
import { ProductOrderType } from "./product";

/**
 * Addons de um item do pedido
 * Baseado na tabela order_item_addons
 */
export interface OrderItemAddonType {
  id: number;
  order_item_id: number;
  addon_id: number | null;
  name: string;
  quantity: number;
  unit_price: number;
  total: number;
  metadata?: any;
  created_at?: string;
  updated_at?: string;
}

/**
 * Item do pedido (novo modelo)
 * Baseado na tabela order_items
 *
 * Agora o backend envia:
 * - quantity, unit_price, total
 * - metadata já decodado (quando existir)
 * - product normalizado (ProductOrderType)
 * - addons opcional
 */
export interface OrderItemType {
  id: number;
  order_id: number;
  product_id: number;

  name: string;
  description?: string | null;

  quantity: number;
  unit_price: number;
  total: number;

  /**
   * metadata contém o antigo raw_item (para pedidos antigos), por exemplo:
   * {
   *   raw_item: {
   *     details: {
   *       dateStart: string;
   *       dateEnd: string;
   *       days: number;
   *       deliveryZipCode: string;
   *       deliveryFee: number;
   *       ...
   *     },
   *     quantity: number;
   *     unit_price: number;
   *     total: number;
   *   }
   * }
   */
  metadata?: any;

  /**
   * Produto carregado via eager loading (items.product)
   * Normalizado no backend (gallery, store, category, etc.)
   */
  product: ProductOrderType;

  /**
   * Addons do item (quando existirem)
   */
  addons?: OrderItemAddonType[];

  created_at?: string;
  updated_at?: string;
}

/**
 * Bloco de pagamento retornado pelo backend
 * (derivado de order.metadata transformado)
 */
export interface OrderPaymentBlock {
  payment_method: "credit_card" | "pix" | "boleto" | null;
  installments?: number | null;
  amount_total: number | string;
  status?: string | null;
  transaction_type?: string | null;
  pdf?: string | null;
  url?: string | null;
}

/**
 * Bloco de entrega retornado pelo backend
 */
export interface OrderDeliveryBlock {
  status: string; // ex: "pending"
  address?: AddressType | null;
  schedule?: string | null; // ex: "Tarde - 14:00"
  deliveryTo: string; // ex: "Estarei para receber"
  /**
   * No backend a entrega pode vir já formatada (string "207,79")
   * ou como número. Deixamos flexível aqui.
   */
  price: string | number;
}

/**
 * Informações do parceiro (dono da loja) associadas ao pedido
 */
export interface OrderPartnerBlock {
  name: string;
  email: string;
  storeId: number | null;
}

/**
 * Pedido completo (ordem)
 * Baseado no novo formato de resposta do backend
 *
 * Agora:
 * - a fonte oficial de itens é `items`
 * - cada item já vem com `product` normalizado
 * - blocos dedicados para payment / delivery / partner
 */
export interface OrderType {
  freights_orders_price: any;
  listItems: any;
  metadata: any;
  delivery_status: string;
  user: null;
  delivery_schedule: any;
  delivery_address: any;
  subtotal: number;
  delivery_price: number | undefined;
  id: number;
  status: number;
  total: number;
  createdAt: string;

  customer: {
    id: number;
    name: string;
    email: string;
    phone: string;
    createdAt: string;
  };

  partner: {
    name: string;
    email: string;
  };

  store: {
    recipient_id: string;
    id: number;
    slug: string;
    title: string;
    companyName: string | null;
    cover: any;
    profile: any;
  };

  payment: {
    method: "credit_card" | "pix" | "boleto" | null;
    installments: number | null;
    amountTotal: number;
    status: string | null;
    transactionType: string | null;
    pdf: string | null;
    url: string | null;
  };

  delivery: {
    status: string;
    schedule: string;
    to: string;                     // << usado no OrderDetailsCard
    price: number;
    priceLabel: string;             // "xx,xx"
    address: AddressType;
  };

  items: Array<{
    id: number;
    productId: number;
    name: string;
    description: string | null;
    quantity: number;
    unitPrice: number;
    total: number;
    metadata: any;
    addons: any[];
  }>;

  products: Array<ProductOrderType>;
}


/**
 * Quando queremos receber a order com a relação freights_orders_price
 * (caso o backend continue enviando essa lista).
 *
 * Como agora o backend já envia `user` acoplado em OrderType,
 * essa interface vira mais um "wrapper de legacy".
 */
export interface OrderTypeResponse extends OrderType {
  listItems?: any;
  freights_orders_price?: Array<{
    id: number;
    order_id: number;
    store_id: number;
    price: string;
    created_at: string;
    updated_at: string;
  }>;
}

/**
 * Tipos auxiliares para fluxo de pagamento (payload de requisição),
 * independentes do formato do OrderType retornado pelo backend.
 */

export interface CardType {
  number: string | number;
  holder_name: string;
  exp_month: string | number;
  exp_year: string | number;
  cvv: string | number;
  holder_document: string;
}

export interface PixType {
  status: boolean;
  expires_in: number;
  code?: string;
  qrcode?: string;
  time?: string;
}

/**
 * Payload que você envia para a API de pagamento
 * (crédito, pix, boleto)
 */
export interface PaymentType {
  payment_method: "credit_card" | "pix" | "boleto";
  credit_card?: {
    card: CardType;
    operation_type: string;
    installments: number;
    statement_descriptor: string;
  };
  pix?: PixType;
}
