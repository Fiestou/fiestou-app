import { moneyFormat } from "@/src/helper";

export interface StoreType {
  id: number | string;
  name: string;
  slug?: string;
  companyName?: string;
  store: StoreType | null;
}

export interface ImageType {
  id?: number;
  url: string;
  alt?: string;
}

export interface RelationType {
  id: string | number;
  name?: string;
  title?: string;
}

export interface VariationType {
  id?: string | number;
  title: string;
  price?: number;
  image?: ImageType | string;
  priceSale?: number;
  variation?: any;
  selected?: boolean;
  data?: any;
  canAddToCart?: boolean;
}

export interface AttributeType {
  id: string;
  title: string;
  selectType: string;
  limit?: number;
  priceType: string;
  image?: string | number;
  variations: VariationType[];
  parsed?: any;
  attributes?: Array<AttributeType>;
  required?: boolean;
  imageID?: string | number;
  data?: any;
}

export interface ProductType {
  requiresDate: any;
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
  comercialType?: string | "aluguel" | "venda" | "comestivel" | "servicos";
  unavailableDates?: string[];
  schedulingPeriod?: number | null;
  schedulingTax?: number;
  schedulingDiscount?: number | null;
  assembly?: string;
  delivery_type?: 'delivery' | 'pickup' | 'both';
  status?: string | number | boolean;
  updated_at?: string;
  priceHigh?: number;
  priceLow?: number;
  medias?: Array<any>;
  name?: string;
  data: any;
  comments?: Array<any>;
  productParam?: any;
  ProductType?: any;
  schedulingEnabled?: boolean;
  product?: any;
}

export interface VariationProductOrderType {
  id: string;
  title: string;
  quantity?: number;
  price?: string | number;
  value?: string;
  canAddToCart?: boolean;

}

export interface AttributeProductOrderType {
  id: string;
  title?: string;
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
  deliveryFee?: number;
  schedulingPeriod?: number | null;
  schedulingTax?: number;
  schedulingDiscount?: number | null;
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

export const getPrice = (product: any): PriceStringType => {
  const priceHigh = parseFloat(product?.price);
  const priceLow = parseFloat(product?.priceSale);

  return {
    price: moneyFormat(
      priceLow > 0 && priceLow < priceHigh ? priceLow : priceHigh
    ),
    priceLow: moneyFormat(priceLow) ?? "",
    priceHigh: moneyFormat(priceHigh),
    priceFromFor: !product?.attributes,
  };
};

export interface PriceNumberType {
  price: number;
  priceLow: number;
  priceHigh: number;
  priceFromFor: boolean;
}

export const getPriceValue = (product: any): PriceNumberType => {
  const priceHigh = Number(product?.price);
  const priceLow = Number(product?.priceSale);

  return {
    price: !!priceLow ? priceLow : priceHigh,
    priceLow: priceLow ?? 0,
    priceHigh,
    priceFromFor: !product?.attributes,
  };
};

export interface CommentType {
  id: number | string;
  user: {
    name: string;
  };
  text: string;
  rate: number;
  rating: number;
  description: string;
  comment: string;
}
