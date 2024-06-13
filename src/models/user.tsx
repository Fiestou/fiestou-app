import { AddressType } from "./address";

export interface BankAccountType {
  title: string;
  agence?: string;
  accountNumber: string;
  bank?: string;
  operation?: string;
}

export interface UserType {
  id?: string | number;
  hash?: string;
  name: string;
  email: string;
  date?: string;
  type?: string;
  person?: string;
  status?: number;
  gender?: "male" | "female" | "other";
  phone?: string;
  phoneSecondary?: string;
  rg?: string;
  issuer?: string;
  cpf?: string;
  document?: string;
  profile?: any;
  favorites?: Array<number>;
  bankAccounts?: Array<BankAccountType>;
  address?: Array<AddressType>;
  created_at?: string;
}
