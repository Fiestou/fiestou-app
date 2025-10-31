export interface DetailsCartType {
  dateEnd?: string;
  dateStart?: string;
  days?: number;
  schedulingDiscount?: string;
  deliveryFee?: number;
  deliveryZipCode?: string;
  deliveryZipCodeFormatted?: string;
  deliveryStoreId?: number;
}

export interface CartType {
  attributes?: any;
  details?: DetailsCartType;
  product: any;
  quantity: number;
  total: number;
}
