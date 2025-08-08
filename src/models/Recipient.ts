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
  title?: string; // Nome do titular
  bank?: string;
  branch_number?: string;
  branch_check_digit?: string;
  account_number?: string;
  account_check_digit?: string;
}


interface UpdateRecipientResponse {
  success: boolean;
  message: string;
  recipient: RecipientType;
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

export interface RecipientType {
  id: number;
  partner_id: number | null;
  code: string | null;
  type_enum: string;
  email: string;
  document: string;
  type: "individual" | "company";
  company_name: string | null;
  trading_name: string | null;
  annual_revenue: string | null;
  name: string;
  birth_date: string;
  monthly_income: string | null;
  professional_occupation: string | null;
  store_id: number;
  created_at: string;
  updated_at: string;
  addresses: AddressType[];
  phones: PhoneType[];
  config: any;
  partners: any[];
}
