import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { serializeParam } from "../helper";

const getPublicBaseUrl = () =>
  process.env.NEXT_PUBLIC_BASE_URL ?? process.env.BASE_URL ?? "";

const getInternalBaseUrl = () =>
  process.env.INTERNAL_BASE_URL ?? process.env.BASE_URL ?? "";

const apiBaseURL =
  typeof window === "undefined" ? getInternalBaseUrl() : getPublicBaseUrl();

export const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 15000,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  },
});

// Função para obter token atual (lê dinamicamente do cookie)
const getAuthToken = () => Cookies.get("fiestou.authtoken");

// Função para limpar sessão e redirecionar (APENAS quando token realmente expirou)
const handleSessionExpired = () => {
  if (typeof window !== "undefined") {
    const isProtectedRoute =
      window.location.pathname.includes("/dashboard") ||
      window.location.pathname.includes("/painel");

    const isAuthPage =
      window.location.pathname.includes("/acesso") ||
      window.location.pathname.includes("/logout") ||
      window.location.pathname.includes("/cadastre-se");

    // Só redireciona se estava em rota protegida e não está em página de auth
    if (isProtectedRoute && !isAuthPage) {
      Cookies.remove("fiestou.authtoken");
      Cookies.remove("fiestou.user");
      window.location.href = "/acesso?expired=1";
    }
  }
};

// Interceptador de REQUEST - adiciona token atualizado em cada requisição
api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptador de RESPONSE - detecta sessão expirada (401/403)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const hadToken = !!getAuthToken();
    const errorMessage = error?.response?.data?.message || "";

    // Só trata como sessão expirada se:
    // 1. Status é 401 (Unauthorized)
    // 2. Tinha um token (estava logado)
    // 3. Mensagem indica token expirado/inválido
    const isTokenError =
      status === 401 &&
      hadToken &&
      (errorMessage.toLowerCase().includes("token") ||
       errorMessage.toLowerCase().includes("unauthenticated") ||
       errorMessage.toLowerCase().includes("expired") ||
       errorMessage === "");

    if (isTokenError) {
      handleSessionExpired();
    }

    return Promise.reject(error);
  }
);

interface ApiRequestType {
  method?: string;
  url: string;
  data?: any;
  opts?: Object;
  noAppPrefix?: boolean; // << NOVO
}

const trimSlashes = (s: string) => s.replace(/\/+$/, '');
const trimLeftSlashes = (s: string) => s.replace(/^\/+/, '');
const shouldIncludeQueryValue = (value: any) =>
  value !== undefined && value !== null;

type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

class Api {
  static request<T>(arg0: { method: string; url: string }) {
    throw new Error("Method not implemented.");
  }
  constructor() {}

  async connect(
    { method = "get", url, data, opts }: ApiRequestType,
    ctx?: any
  ) {
    const requestHeaders: Record<string, any> = { ...((opts as any)?.headers ?? {}) };
    if (!!ctx?.req) {
      const authtoken = !!ctx?.req.cookies
        ? ctx.req.cookies["fiestou.authtoken"]
        : getAuthToken();
      if (!!authtoken) {
        requestHeaders["Authorization"] = `Bearer ${authtoken}`;
      }
    }

    if (method === "get" && !!data && Object.keys(data).length > 0) {
      const queryString = Object.keys(data)
        .filter((key) => shouldIncludeQueryValue(data[key]))
        .map((key) => serializeParam(key, data[key]))
        .join("&");
      if (queryString) {
        url = `${url}?${queryString}`;
      }
      data = {};
    }

    const validMethods: HttpMethod[] = ["get", "post", "put", "patch", "delete"];
    const requestMethod = validMethods.includes(method.toLowerCase() as HttpMethod)
      ? (method.toLowerCase() as HttpMethod)
      : "get";

    const requestConfig: any = {
      ...(opts ?? {}),
      url,
      method: requestMethod,
      headers: requestHeaders,
    };

    if (requestMethod !== "get" && requestMethod !== "delete") {
      requestConfig.data = data ?? {};
    } else if (requestMethod === "delete" && data && Object.keys(data).length > 0) {
      requestConfig.data = data;
    }

    try {
      const response: AxiosResponse = await api.request(requestConfig);
      return response.data;
    } catch (error: any) {
      if (error?.response) {
        const { status, data: responseData, headers } = error.response;
        return {
          status,
          data: responseData,
          headers,
          error: true,
          message: error.message ?? null,
        };
      }

      if (error?.request) {
        return {
          status: 503,
          data: null,
          error: true,
          message: error.message ?? "Request failed",
        };
      }

      return {
        status: 500,
        data: null,
        error: true,
        message: error?.message ?? "Unknown error",
      };
    }
  }

  async internal({
    url,
    method = "get",
    data,
    opts,
  }: {
    url: string;
    data: any;
    method?: string;
    opts?: any;
  }) {
    if (method === "get" && !!data && Object.keys(data).length > 0) {
      const filtered = Object.entries(data).reduce((acc: Record<string, any>, [key, value]) => {
        if (shouldIncludeQueryValue(value)) {
          acc[key] = value;
        }
        return acc;
      }, {});
      const queryString = new URLSearchParams(filtered).toString();
      if (queryString) {
        url = `${url}?${queryString}`;
      }
      data = {};
    }

    const validMethods: HttpMethod[] = [
      "get",
      "post",
      "put",
      "patch",
      "delete",
    ];
    const requestMethod = validMethods.includes(
      method.toLowerCase() as HttpMethod
    )
      ? (method.toLowerCase() as HttpMethod)
      : "get";

    return await axios[requestMethod](`/api${url}`, data, opts ?? {})
      .then((response: AxiosResponse) => response.data)
      .catch((error: any) => {
        return null;
      });
  }

  async trigger(
    { url, data, opts, method = "post" }: ApiRequestType,
    ctx?: any
  ) {
    const appUrl = process.env.APP_URL ?? getPublicBaseUrl();
    url = `${appUrl}${url}`;
    return this.connect({ method, url, data, opts }, ctx);
  }

  async request<T>(
    { method = "get", url, data, opts }: ApiRequestType,
    ctx?: any
  ): Promise<T> {
    const baseUrl =
      typeof window === "undefined" ? getInternalBaseUrl() : getPublicBaseUrl();
    url = `${baseUrl}/api/${url}`;
    return (await this.connect({ method, url, data, opts }, ctx)) as Promise<T>;
  }

  async content({ url, method = "get" }: any, ctx?: any) {
    const baseUrl =
      typeof window === "undefined" ? getInternalBaseUrl() : getPublicBaseUrl();
    url = `${baseUrl}/api/content/${url}`;
    return await this.connect({ method, url }, ctx);
  }

  async call<T>(
    { method = "post", url, data, opts }: ApiRequestType,
    ctx?: any
  ): Promise<T> {
    const baseUrl =
      typeof window === "undefined" ? getInternalBaseUrl() : getPublicBaseUrl();
    url = `${baseUrl}/api/${url}`;
    data = { graphs: data };
    return this.connect({ method, url, data, opts }, ctx) as Promise<T>;
  }

  async bridge<T>(
    { method = "get", url, data, opts, noAppPrefix = false }: ApiRequestType,
    ctx?: any
  ): Promise<T> {
    const apiRest = typeof window === "undefined"
      ? process.env.INTERNAL_API_REST ?? process.env.API_REST ?? ""
      : process.env.NEXT_PUBLIC_API_REST ?? process.env.API_REST ?? "";

    // se pediram "sem /app", tira o /app do fim da base
    const base = noAppPrefix
      ? apiRest.replace(/\/app\/?$/i, "/")
      : apiRest;

    // monta URL final sem barras duplicadas
    const fullUrl = `${trimSlashes(base)}/${trimLeftSlashes(url)}`;

    return this.connect({ method, url: fullUrl, data, opts }, ctx) as Promise<T>;
  }

  async graph({ method = "post", url, data, opts }: ApiRequestType, ctx?: any) {
    const apiRest =
      typeof window === "undefined"
        ? process.env.INTERNAL_API_REST ?? process.env.API_REST ?? ""
        : process.env.NEXT_PUBLIC_API_REST ?? process.env.API_REST ?? "";

    url = `${apiRest}${url}`;
    data = { graphs: data };
    return this.connect({ method, url, data, opts }, ctx);
  }

  async media(data: {
    index: any;
    dir: any;
    method?: string;
    app?: any;
    medias: Array<any>;
    overwrite?: Object;
  }) {
    let url = "";
    let requestMethod = "post";

    if (data?.method == "upload") {
      url = `app/files/upload-base64`;
    }

    if (data?.method == "remove") {
      url = `app/files/remove-medias`;
      requestMethod = "delete";
    }

    return this.request({ method: requestMethod, url, data });
  }

  async auth({ method = "post", url, data, opts }: ApiRequestType, ctx?: any) {
    const apiRest =
      typeof window === "undefined"
        ? process.env.INTERNAL_API_REST ?? process.env.API_REST ?? ""
        : process.env.NEXT_PUBLIC_API_REST ?? process.env.API_REST ?? "";

    url = `${apiRest}${url}`;
    return this.connect({ method, url, data, opts }, ctx);
  }
}

export default Api;

export const defaultQuery = [
  {
    model: "page as HeaderFooter",
    filter: [
      {
        key: "slug",
        value: "menu",
        compare: "=",
      },
    ],
  },
  {
    model: "page as DataSeo",
    filter: [
      {
        key: "slug",
        value: "seo",
        compare: "=",
      },
    ],
  },
  {
    model: "page as Scripts",
    filter: [
      {
        key: "slug",
        value: "scripts",
        compare: "=",
      },
    ],
  },
];

// Aqui está tipado como 'any' temporariamente, pois ainda vamos enterder melhor o que deve retornar
export async function getHomeStatus(): Promise<any> {
  try {
    const api = new Api();
    const response: any = await api.content({
      method: "get",
      url: `home`,
    });

    // If connect returned a normalized error object
    if (response?.error) {
      return { completed: false, recipient: null };
    }

    return response?.data ?? {};
  } catch (error) {
    console.error("Erro ao retornar itens da home:", error);
    return { completed: false, recipient: null };
  }
}
