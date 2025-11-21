// tipos "básicos" usados pelo backend (formatRecipient)
export interface AddressType {
  id?: number;
  recipient_id?: number;
  type?: string;
  partner_document?: string | null;
  street?: string | null;
  complementary?: string | null;
  street_number?: string | null;
  neighborhood?: string | null;
  city?: string;
  state?: string;
  zip_code?: string | null;
  reference_point?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface BankAccountTypeRecipient {
  title?: string | null;
  holder_name?: string | null;
  holder_type?: string | null;
  holder_document?: string | null;
  bank?: string | null;
  branch_number?: string | null;
  branch_check_digit?: string | null;
  account_number?: string | null;
  account_check_digit?: string | null;
  type?: string | null;
  code?: string | null;
  value?: string | null;
  metadata?: any;
  bankAccount?: any;
  status?: string | null;
  updated_at?: string | null;
  created_at?: string | null;
}

export interface PhoneType {
  id?: number;
  recipient_id?: number;
  type?: string;
  partner_document?: string | null;
  area_code?: string;
  number?: string;
  created_at?: string;
  updated_at?: string;
}

/**
 * Shape que o backend devolve (formatRecipient)
 * e que você usa nas telas de edição (GroupConfig*).
 */
export interface RecipientType {
  recipient: any;
  id: number;
  store_id: number;
  partner_id: number | string | null;
  code: string | null;
  type_enum: string;
  type: "individual" | "company";
  name: string;
  email: string;
  document: string;
  company_name: string | null;
  trading_name: string | null;
  annual_revenue: string | null;        // API manda string
  birth_date: string;
  monthly_income: string | null;        // API manda string
  professional_occupation: string | null;

  created_at?: string;
  updated_at?: string;

  address?: AddressType;
  phone?: PhoneType;
  bank?: BankAccountTypeRecipient;

  addresses?: AddressType[];
  phones?: PhoneType[];

  config?: any;
  configs?: any;
  partners?: any[];
  bank_account?: BankAccountTypeRecipient;
}

/* ============================================================
 * TIPOS DO FORM (MODAL)
 * ============================================================
 */

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

/**
 * Shape usado no formulário do modal
 */
export interface RecipientEntity {
  id?: number;
  type_enum: "PF" | "PJ";
  email: string;
  document: string;
  name: string;
  company_name?: string | null;
  trading_name?: string | null;
  annual_revenue: number | null;           // <- número no form
  birth_date: string;
  monthly_income: number | null;           // <- número no form
  professional_occupation: string;
  type: string;
  addresses: RecipientAddress[];
  phones: RecipientPhone[];
  partners: RecipientPartner[];
  configs: RecipientConfig;
  bank_account: RecipientBankAccount;      // <- SEM "?"
}

export interface RecipientStatusResponse {
  completed: boolean;
  recipient?: RecipientType | null;
}

/** update (telas de edição) */
export interface UpdateRecipientResponse {
  response: boolean;
  data: RecipientType;
}

/** create (modal de cadastro) */
export interface CreateRecipientResponse {
  response: boolean;
  message: string;
  data?: RecipientType | null;
}
