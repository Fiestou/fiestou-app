import {
  RecipientAddress,
  RecipientBankAccount,
  RecipientConfig,
  RecipientEntity,
  RecipientPartner,
  RecipientPhone,
  RecipientTypeEnum,
} from "@/src/models/Recipient";

// Factories
export const createAddress = (): RecipientAddress => ({
  type: "Recipient",
  street: "",
  street_number: "",
  neighborhood: "",
  city: "",
  state: "",
  zip_code: "",
  complementary: "",
  reference_point: "",
  partner_document: "",
});

export const createPhone = (): RecipientPhone => ({
  type: "Recipient",
  area_code: "",
  number: "",
  partner_document: "",
});

export const createPartner = (): RecipientPartner => ({
  name: "",
  email: "",
  document: "",
  birth_date: "",
  monthly_income: null,
  professional_occupation: "",
  self_declared_legal_representative: false,
});

export const createConfig = (): RecipientConfig => ({
  transfer_enabled: true,
  transfer_interval: "semanal",
  transfer_day: 5,
  anticipation_enabled: false,
  anticipation_type: null,
  anticipation_volume_percentage: "",
  anticipation_days: "",
  anticipation_delay: "",
});

export const createBankAccount = (): RecipientBankAccount => ({
  bank: "",
  branch_number: "",
  branch_check_digit: "",
  account_number: "",
  account_check_digit: "",
  holder_name: "",
  holder_type: "individual",
  holder_document: "",
  type: "checking",
});

export const buildInitialForm = (): RecipientEntity => ({
  type_enum: "PJ",
  email: "",
  document: "",
  name: "",
  company_name: "",
  trading_name: "",
  annual_revenue: null,
  birth_date: "",
  monthly_income: null,
  professional_occupation: "",
  type: "",
  addresses: [createAddress()],
  phones: [createPhone()],
  partners: [],
  configs: createConfig(),
  bank_account: createBankAccount(),
});

// Configuração dos steps
export const STEPS = [
  { id: "type", label: "Como você recebe" },
  { id: "identity", label: "Dados do cadastro" },
  { id: "contact", label: "Contato e endereço" },
  { id: "bank", label: "Conta para receber" },
  { id: "partners", label: "Sócios da empresa", only: "PJ" as RecipientTypeEnum },
] as const;

export type Step = (typeof STEPS)[number];
export type StepId = Step["id"];

// Validação de cada step
export function validateStep(stepId: StepId, formData: RecipientEntity): string | null {
  if (stepId === "type" && !formData.type_enum) {
    return "Escolha como a sua loja vai receber.";
  }

  if (stepId === "identity") {
    if (!formData.email || !formData.document) return "Preencha e-mail e CPF ou CNPJ.";
    if (formData.type_enum === "PF") {
      if (!formData.name || !formData.birth_date) return "Preencha nome e data de nascimento.";
    } else {
      if (!formData.company_name || !formData.trading_name || !formData.name) {
        return "Preencha razão social, nome fantasia e quem responde pela loja.";
      }
      if (!formData.annual_revenue) {
        return "Informe o faturamento anual da empresa para continuar.";
      }
    }
  }

  if (stepId === "contact") {
    const invalidAddr = formData.addresses.some(
      (a) => !a.street.trim() || !a.street_number.trim() || !a.neighborhood.trim() || !a.city.trim() || !a.state.trim() || !a.zip_code.trim()
    );
    if (invalidAddr) return "Preencha todo o endereço.";

    const invalidPhone = formData.phones.some((p) => !p.area_code.trim() || !p.number.trim());
    if (invalidPhone) return "Informe DDD e telefone.";
  }

  if (stepId === "bank") {
    if (!formData.bank_account) return "Preencha a conta que vai receber.";
    const b = formData.bank_account;
    if (!b.bank.trim() || !b.branch_number.trim() || !b.account_number.trim() || !b.account_check_digit.trim() || !b.holder_name.trim() || !b.holder_document.trim()) {
      return "Preencha banco, agência, conta e titular.";
    }
  }

  if (stepId === "partners" && formData.type_enum === "PJ") {
    if (!formData.partners || !formData.partners.length) return "Adicione pelo menos um sócio.";
    if (formData.partners.some((p) => !p.name.trim() || !p.document.trim())) {
      return "Preencha nome e CPF de todos os sócios.";
    }
  }

  return null;
}

// Opções de bancos
export const BANK_OPTIONS = [
  { value: "", name: "Selecione o banco" },
  { value: "001", name: "001 - Banco do Brasil" },
  { value: "033", name: "033 - Santander" },
  { value: "104", name: "104 - Caixa" },
  { value: "237", name: "237 - Bradesco" },
  { value: "341", name: "341 - Itaú" },
  { value: "260", name: "260 - Nubank" },
  { value: "077", name: "077 - Inter" },
  { value: "212", name: "212 - Original" },
  { value: "336", name: "336 - C6" },
  { value: "290", name: "290 - Pagseguro" },
  { value: "323", name: "323 - Mercado Pago" },
];
