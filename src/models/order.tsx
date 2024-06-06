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
  total: number;
  platformCommission: number | string;
  notificate?: Array<any>;
  listItems: Array<ProductOrderType>;
  deliveryAddress?: AddressType;
  metadata?: any;
  status: number; // -2: canceled | -1: processing | 0: open | 1: paid
  created_at?: string;
}
