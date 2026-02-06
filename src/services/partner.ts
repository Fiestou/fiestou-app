import Api from "@/src/services/api";

// Tipos
export interface PartnerStoreData {
  // Dados pessoais
  name: string;
  email: string;
  phone: string;
  password: string;
  personType: "pf" | "pj";
  document: string;
  birth_date?: string;

  // Dados da loja
  companyName: string;
  razaoSocial?: string;
  hasDelivery: boolean;
  segment?: string;
  segmentId?: string | number;

  // Endereço
  street: string;
  number: string;
  neighborhood: string;
  complement: string;
  city: string;
  state: string;
  zipcode: string;
  referencePoint?: string;
}

export interface PartnerRegisterResponse {
  response: boolean;
  error?: string;
  message?: string;
}

// Pré-registro de parceiro
export async function preRegisterPartner(
  api: Api,
  data: { name: string; email: string; phone: string; password: string }
): Promise<PartnerRegisterResponse> {
  try {
    const phoneClean = data.phone.replace(/\D/g, "");

    const response = await api.bridge<PartnerRegisterResponse>({
      method: "post",
      url: "auth/pre-register",
      data: {
        name: data.name,
        email: data.email.toLowerCase().trim(),
        phone: phoneClean,
        password: data.password,
        type: "partner",
      },
    });

    return response;
  } catch (error: any) {
    return {
      response: false,
      error: error?.message || "Erro no pré-registro",
    };
  }
}

// Registro completo de parceiro (loja)
export async function completePartnerRegister(
  api: Api,
  data: PartnerStoreData
): Promise<PartnerRegisterResponse> {
  try {
    const phoneClean = data.phone.replace(/\D/g, "");
    const zipcodeClean = data.zipcode.replace(/\D/g, "");

    // Aplica "Não Preenchido" para campos vazios
    const addrFallback = (v?: string) => (v && v.trim() ? v : "Não Preenchido");

    const payload = {
      // Usuário
      name: data.name,
      email: data.email.toLowerCase().trim(),
      phone: phoneClean,
      password: data.password,
      personType: data.personType,

      // Loja
      document: data.document.replace(/\D/g, ""),
      companyName: data.companyName || data.name,
      hasDelivery: data.hasDelivery,
      birth_date: data.birth_date,
      segment: data.segment,
      segmentId: data.segmentId,
      razaoSocial: data.razaoSocial,

      // Endereço
      street: addrFallback(data.street),
      number: addrFallback(data.number),
      neighborhood: addrFallback(data.neighborhood),
      complement: addrFallback(data.complement),
      state: addrFallback(data.state),
      city: addrFallback(data.city),
      zipcode: zipcodeClean || "Não Preenchido",
      referencePoint: addrFallback(data.referencePoint),
    };

    const response = await api.bridge<PartnerRegisterResponse>({
      method: "post",
      url: "stores/completeregister",
      data: payload,
    });

    return response;
  } catch (error: any) {
    return {
      response: false,
      error: error?.message || "Erro ao completar cadastro",
    };
  }
}

// Busca dados para pré-registro
export async function getPreRegisterData(api: Api, hash: string) {
  try {
    const response = await api.bridge<{
      response: boolean;
      categories?: { id: number; name: string; icon?: string }[];
      preUser?: { email: string; name: string };
    }>({
      method: "get",
      url: `auth/pre-register/${hash}`,
    });

    return response;
  } catch {
    return { response: false };
  }
}
