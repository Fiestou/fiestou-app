import { BankAccountType } from "./user";

export interface WithdrawType {
  id?: number;
  code: string;
  value: number;
  bankAccount: string | BankAccountType;
  metadata?: any;
  status?: number;
  created_at?: string;
  updated_at?: string;
}
