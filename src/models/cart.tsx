export interface DetailsCartType {
  dateEnd?: string;
  dateStart?: string;
  days?: number;
  schedulingDiscount?: string;
}

export interface CartType {
  attributes?: any;
  details?: DetailsCartType;
  product: any;
  quantity: number;
  total: number;
}
