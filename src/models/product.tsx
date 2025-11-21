import { moneyFormat } from "@/src/helper";

export interface RelationType {
  id: string | number;
}

export interface StoreType {
  id: number | string;
  name: string;
  slug?: string;
  companyName?: string;
}

export interface ImageType {
  id?: number;
  url: string;
  alt?: string;
}

export interface StoreType {
  id: number | string;
  name: string;
  slug?: string;
}

export interface VariationType {
  id: string | number;
  title: string;
  price?: number;
  image?: ImageType | string;
  priceSale?: number;
}

export interface RelationType {
  id: string | number;
  name?: string;
  title: string;
}

export interface AttributeType {
  id: string;
  title: string;
  selectType: string;
  limit?: number;
  priceType: string;
  image?: string | number;
  variations: VariationType[];
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
  weight?: string | number;
  length?: string | number;
  width?: string | number;
  height?: string | number;
  attributes?: Array<AttributeType>;
  tags?: string;
  category?: (string | number)[];
  color?: string | "sem cor";
  combinations?: Array<RelationType>;
  suggestions?: any;
  fragility?: string;
  vehicle?: string;
  freeTax?: string;
  comercialType?: string | "aluguel" | "venda";
  unavailableDates?: string[];
  schedulingPeriod?: string;
  schedulingTax?: number;
  schedulingDiscount?: number;
  assembly?: string;
  status?: string | number | boolean;
  updated_at?: string;
  priceHigh?: number;
  priceLow?: number;
  medias?: Array<any>;
  name?: string;
}

export interface VariationProductOrderType {
  id: string;
  title: string;
  quantity?: number;
  price?: string | number;
}

export interface AttributeProductOrderType {
  id: string;
  variations: Array<VariationProductOrderType>;
}

export interface ProductOrderType {
  product: any;
  attributes: any;
  quantity: number;
  details?: Object | any;
  /** preço unitário enviado ao backend para cálculo por item */
  unit_price?: number;
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
  let priceHigh: number = parseFloat(product?.price);
  let priceLow: number = parseFloat(product?.priceSale);

  return {
    price: moneyFormat(
      priceLow > 0 && priceLow < priceHigh ? priceLow : priceHigh
    ),
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
