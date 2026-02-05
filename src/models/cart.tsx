export interface DetailsCartType {
  dateStart?: Date | string;
  dateEnd?: Date | string;
  days?: number;
  schedulingDiscount?: string;
  deliveryFee?: number;
  deliveryZipCode?: string;
  deliveryZipCodeFormatted?: string;
  deliveryStoreId?: number;
  deliverySelection?: 'delivery' | 'pickup';
}

export interface CartType {
  attributes?: any;
  details?: DetailsCartType;
  product: any;
  quantity: number;
  total: number;
}
