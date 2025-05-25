import { AddressType } from "./address";
import { AttributeType, ProductOrderType } from "./product";
import { UserType } from "./user";

export interface BalanceType {
  cash: 0;
  payments: 0;
  promises: 0;
  orders: 0;
}

export interface ItemOrderType {
  id: number;
  slug?: string;
  title: string;
  description?: string;
  details?: any;
  store?: any;
  attributes?: Array<AttributeType>;
  tags?: string;
  fragility?: string;
  vehicle?: string;
  freeTax?: string;
  comercialType?: string;
  schedulingPeriod?: string;
  schedulingTax?: string;
  deliveryStatus:
    | "pending"
    | "processing"
    | "sent"
    | "received"
    | "returned"
    | "canceled"
    | "waitingWithdrawal"
    | "collect"
    | "transiting";
}

export interface OrderType {
  id?: string;
  hash?: string;
  user?: UserType;
  order?: number | string;
  store?: number | string;
  deliveryStatus: string;
  deliverySchedule: string;
  deliveryTo: string;
  deliveryPrice: number;
  total: number;
  platformCommission: number | string;
  notificate?: Array<any>;
  listItems: Array<ProductOrderType>;
  deliveryAddress?: AddressType;
  metadata?: any;
  status: number; // -2: canceled | -1: processing | 0: open | 1: paid
  created_at?: string;
  freights: {
    zipcode: string;
    productsIds: number[];
  };
  products: Array<{
    id: number;
    store: {
      id: number;
      companyName: string;
      slug: string;
      title: string;
      cover: number | null;
      profile: number | null;
    };
    title: string;
    slug: string;
    sku: string | null;
    code: string | null;
    subtitle: string;
    description: string | null;
    gallery: string | null;
    price: number;
    priceSale: number;
    quantityType: string | null;
    quantity: number;
    availability: number | null;
    unavailable: any | null;
    weight: string | null;
    length: string | null;
    width: string | null;
    height: string | null;
    attributes: string;
    tags: string | null;
    category: string | null;
    color: string | null;
    combinations: any | null;
    suggestions: string | null;
    fragility: string | null;
    vehicle: string | null;
    freeTax: string;
    comercialType: string;
    schedulingPeriod: string | null;
    schedulingTax: string | null;
    schedulingDiscount: string;
    assembly: string;
    rate: number | null;
    status: number;
    created_at: string;
    updated_at: string;
    product_delivery_fee: any | null;
    is_product_delivery_fee_active: number;
  }>;
}

export interface OrderTypeResponse extends Omit<OrderType, "freights"> {
  freights_orders_price: Array<{
    id: number;
    order_id: number;
    store_id: number;
    price: string;
    created_at: string;
    updated_at: string;
  }>;
}
