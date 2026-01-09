import Api from "@/src/services/api";

// Tipos
export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  re_password: string;
  person?: "client" | "partner";
  recaptcha_token?: string;
}

export interface RegisterResponse {
  response: boolean;
  message?: string;
  error?: string;
}

export interface PreRegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  person?: "client" | "partner";
}

export interface CheckEmailResponse {
  response: boolean;
  user?: { email: string; name: string };
  redirect?: string;
}

// Registra novo cliente
export async function registerClient(
  api: Api,
  data: RegisterData
): Promise<RegisterResponse> {
  try {
    const phoneClean = data.phone.replace(/\D/g, "");

    const response = await api.bridge<RegisterResponse>({
      method: "post",
      url: "auth/register",
      data: {
        ...data,
        phone: phoneClean,
        type: data.type ?? "client",
      },
    });

    return response;
  } catch (error: any) {
    return {
      response: false,
      error: error?.message || "Erro ao cadastrar",
    };
  }
}

// Pré-registro (para lojistas)
export async function preRegister(
  api: Api,
  data: PreRegisterData
): Promise<RegisterResponse> {
  try {
    const phoneClean = data.phone.replace(/\D/g, "");

    const response = await api.bridge<RegisterResponse>({
      method: "post",
      url: "auth/pre-register",
      data: {
        ...data,
        phone: phoneClean,
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

// Verifica se email existe
export async function checkEmail(
  api: Api,
  email: string
): Promise<CheckEmailResponse> {
  try {
    const response = await api.bridge<CheckEmailResponse>({
      method: "post",
      url: "auth/checkin",
      data: { ref: email },
    });

    return response;
  } catch {
    return { response: false };
  }
}

// Recuperação de senha
export async function recoveryPassword(
  api: Api,
  email: string,
  recaptchaToken: string
): Promise<RegisterResponse> {
  try {
    const response = await api.bridge<RegisterResponse>({
      method: "post",
      url: "auth/recovery",
      data: { email, recaptcha_token: recaptchaToken },
    });

    return response;
  } catch (error: any) {
    return {
      response: false,
      error: error?.message || "Erro ao recuperar senha",
    };
  }
}
