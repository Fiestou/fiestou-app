import { moneyFormat } from "@/src/helper";
import { RelationType } from "@/src/models/relation";
import { StoreType } from "./store";

export interface AttributeType {
  id: string;
  title: string;
  selectType: string;
  limit?: number;
  priceType: string;
  variations: Array<any>;
}

export interface ProductType {
  id: number;
  store: number | string | StoreType;
  title: string;
  slug?: string;
  subtitle: string;
  description?: string;
  parent?: Array<StoreType>;
  childs?: Array<any>;
  gallery?: Array<any>;
  code?: string;
  sku?: string;
  price: number;
  rate?: number;
  priceSale?: number;
  quantityType?: string | "manage";
  quantity?: number | string;
  availability?: number;
  unavailable?: Array<any>;
  weight?: string;
  length?: string;
  width?: string;
  height?: string;
  attributes?: Array<AttributeType>;
  tags?: string;
  category?: Array<any>;
  color?: string | "sem cor";
  combinations?: Array<RelationType>;
  suggestions?: string;
  fragility?: string;
  vehicle?: string;
  freeTax?: string;
  comercialType?: string;
  schedulingPeriod?: string;
  schedulingTax?: number;
  schedulingDiscount?: number;
  assembly?: string;
  status?: string | number | boolean;
  updated_at?: string;
}

export interface VariationProductOrderType {
  title: string;
  id: string;
  quantity?: number;
  price?: string | number;
}

export interface AttributeProductOrderType {
  id: string;
  variations: Array<VariationProductOrderType>;
}

export interface ProductOrderType {
  product: any;
  attributes: Array<AttributeProductOrderType>;
  quantity: number;
  details?: Object | any;
  total: number;
}

export interface RateType {
  rate: number;
  user: {
    id: number | string;
    name: string;
    image: string;
  };
  product: any;
  comment?: string;
}

export interface PriceStringType {
  price: string;
  priceLow: string;
  priceHigh: string;
  priceFromFor: boolean;
}

export const getPrice = (product: any) => {
  let priceHigh: number = product?.price;
  let priceLow: number = product?.priceSale;

  return {
    price: moneyFormat(priceLow ?? priceHigh),
    priceLow: moneyFormat(priceLow) ?? "",
    priceHigh: moneyFormat(priceHigh),
    priceFromFor: !product?.attributes,
  } as PriceStringType;
};

export interface PriceNumberType {
  price: number;
  priceLow: number;
  priceHigh: number;
  priceFromFor: boolean;
}

export const getPriceValue = (product: any) => {
  let priceHigh = Number(product?.price);
  let priceLow = Number(product?.priceSale);

  return {
    price: !!priceLow ? priceLow : priceHigh,
    priceLow: priceLow ?? 0,
    priceHigh: priceHigh,
    priceFromFor: !product?.attributes,
  } as PriceNumberType;
};

export interface CommentType {
  user: {
    name: string;
  };
  text: string;
  rate: number;
}
