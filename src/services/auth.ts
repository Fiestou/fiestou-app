import Api from "@/src/services/api";

// Tipos
export interface RegisterData {
  name: string;
  email: string;
  phone?: string;
  password: string;
  re_password: string;
  type?: "client" | "partner";
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
  type?: "client" | "partner";
  person?: "client" | "partner";
}

export interface CheckEmailResponse {
  response: boolean;
  exists?: boolean;
  redirect?: string;
  message?: string;
}

function normalizeBridgeResponse(response: any, fallbackMessage: string): RegisterResponse {
  if (!response?.error) {
    return response;
  }

  return {
    response: false,
    message: response?.data?.message || fallbackMessage,
    error: response?.data?.message || fallbackMessage,
  };
}

function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

function getPublicBridgeBase() {
  const explicitBase = String(
    process.env.NEXT_PUBLIC_API_REST ?? process.env.API_REST ?? "",
  ).trim();

  if (explicitBase) {
    return trimTrailingSlash(explicitBase);
  }

  if (typeof window === "undefined") {
    return "";
  }

  if (window.location.hostname === "teste.fiestou.com.br") {
    return "https://testeapi.fiestou.com.br/api/app";
  }

  if (
    window.location.hostname === "fiestou.com.br" ||
    window.location.hostname === "www.fiestou.com.br"
  ) {
    return "https://api.fiestou.com.br/api/app";
  }

  return `${window.location.origin}/api/app`;
}

// Registra novo cliente
export async function registerClient(
  api: Api,
  data: RegisterData
): Promise<RegisterResponse> {
  try {
    const phoneClean = (data.phone ?? "").replace(/\D/g, "");
    const payload = {
      ...data,
      type: data.type ?? "client",
      ...(phoneClean ? { phone: phoneClean } : {}),
    };

    if (typeof window !== "undefined") {
      const response = await fetch(`${getPublicBridgeBase()}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json().catch(() => null);

      if (responseData?.response) {
        return responseData;
      }

      return {
        response: false,
        message: responseData?.message || "Erro ao cadastrar",
        error: responseData?.message || "Erro ao cadastrar",
      };
    }

    const response = await api.bridge<RegisterResponse>({
      method: "post",
      url: "auth/register",
      data: payload,
    });

    return normalizeBridgeResponse(response, "Erro ao cadastrar");
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

    return normalizeBridgeResponse(response, "Erro no pré-registro");
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
      method: "get",
      url: "auth/emailvalidate",
      data: { email },
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

    return normalizeBridgeResponse(response, "Erro ao recuperar senha");
  } catch (error: any) {
    return {
      response: false,
      error: error?.message || "Erro ao recuperar senha",
    };
  }
}
