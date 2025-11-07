export type RecipientTypeEnum = "PF" | "PJ";

export type RecipientContactType = "Recipient" | "Partner";

export interface RecipientAddress {
  id?: number;
  type: RecipientContactType;
  partner_document?: string;
  street: string;
  complementary?: string;
  street_number: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
  reference_point?: string;
}

export interface RecipientPhone {
  id?: number;
  type: RecipientContactType;
  partner_document?: string;
  area_code: string;
  number: string;
}

export interface RecipientPartner {
  id?: number;
  name: string;
  email?: string;
  document: string;
  birth_date?: string;
  monthly_income?: number | null;
  professional_occupation?: string;
  self_declared_legal_representative?: boolean;
}

export interface RecipientConfig {
  transfer_enabled: boolean;
  transfer_interval?: string | null;
  transfer_day?: number | null;
  anticipation_enabled: boolean;
  anticipation_type?: "full" | "1025" | null;
  anticipation_volume_percentage?: string | null;
  anticipation_days?: string | null;
  anticipation_delay?: string | null;
}

export interface RecipientBankAccount {
  id?: number;
  bank: string;
  branch_number: string;
  branch_check_digit?: string;
  account_number: string;
  account_check_digit: string;
  holder_name: string;
  holder_type: "individual" | "company";
  holder_document: string;
  type: "checking" | "savings";
}

export interface RecipientEntity {
  id?: number;
  partner_id?: string | null;
  code?: string | null;
  type_enum: RecipientTypeEnum;
  email: string;
  document: string;
  type?: string | null;
  company_name?: string | null;
  trading_name?: string | null;
  annual_revenue?: number | null;
  name: string;
  birth_date?: string | null;
  monthly_income?: number | null;
  professional_occupation?: string | null;
  addresses: RecipientAddress[];
  phones: RecipientPhone[];
  partners: RecipientPartner[];
  configs: RecipientConfig;
  config?: RecipientConfig | null;
  bank_account?: RecipientBankAccount | null;
}

export interface RecipientStatusResponse {
  completed: boolean;
  recipient?: RecipientEntity | null;
}
