export interface AddressType {
  zipCode: string;
  street?: string;
  number: number | string;
  neighborhood?: string;
  complement?: string;
  city?: string;
  state?: string;
  country?: string;
  main?: boolean;
}
