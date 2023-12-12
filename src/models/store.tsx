import { AddressType } from "./address";
import { ProductType } from "./product";
import { RelationType } from "./relation";

export interface DayType {
  day: string;
  working?: boolean | string;
  open?: string;
  close?: string;
}

export interface StoreType extends AddressType {
  id?: number;
  title?: string;
  slug?: string;
  document: string;
  description?: string;
  cover?: Object | any;
  profile?: Object | any;
  openClose?: Array<DayType>;
  segment?: string | number;
  companyName?: string;
  hasDelivery?: boolean;
  products?: Array<ProductType>;
}

export interface StoreCategoryType {
  id?: any;
  title: string;
  slug?: string;
  image?: any;
}
