import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { serializeParam } from "../helper";

const token = Cookies.get("fiestou.authtoken");

const getPublicBaseUrl = () =>
  process.env.NEXT_PUBLIC_BASE_URL ?? process.env.BASE_URL ?? "";

const getInternalBaseUrl = () =>
  process.env.INTERNAL_BASE_URL ?? process.env.BASE_URL ?? "";

const apiBaseURL =
  typeof window === "undefined" ? getInternalBaseUrl() : getPublicBaseUrl();

export const api = axios.create({
  baseURL: apiBaseURL,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  },
});

if (token) {
  api.defaults.headers["Authorization"] = `Bearer ${token}`;
}

interface ApiRequestType {
  method?: string;
  url: string;
  data?: any;
  opts?: Object;
  noAppPrefix?: boolean; // << NOVO
}


type HttpMethod = "get" | "post" | "put" | "patch" | "delete";

class Api {
  static request<T>(arg0: { method: string; url: string; }) {
    throw new Error("Method not implemented.");
  }
  constructor() { }

  async connect({ method = "get", url, data, opts }: ApiRequestType, ctx?: any) {
    return await new Promise((resolve, reject) => {
      if (!!ctx?.req) {
        const authtoken = !!ctx?.req.cookies
          ? ctx.req.cookies["fiestou.authtoken"]
          : token;

        if (!!authtoken) {
          api.defaults.headers["Authorization"] = `Bearer ${authtoken}`;
        }
      }

      if (method === "get" && !!data && Object.keys(data).length > 0) {
        const queryString = Object.keys(data)
          .map((key) => serializeParam(key, data[key]))
          .join("&");
        url = `${url}?${queryString}`;
        data = {};
      }

      const validMethods: HttpMethod[] = ["get", "post", "put", "patch", "delete"];
      const requestMethod = validMethods.includes(method.toLowerCase() as HttpMethod)
        ? (method.toLowerCase() as HttpMethod)
        : "get";
      

      api[requestMethod](url, data ?? {}, opts ?? {})
        .then((response: AxiosResponse) => {
          resolve(response.data);
        })
        .catch((error: any) => {
          const normalizedError = () => {
            if (error?.response) {
              const { status, data, headers } = error.response;
              return {
                status,
                data,
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
          };

          resolve(normalizedError());
        });
    });
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
      const queryString = new URLSearchParams(data).toString();
      url = `${url}?${queryString}`;
      data = {};
    }

    const validMethods: HttpMethod[] = ["get", "post", "put", "patch", "delete"];
    const requestMethod = validMethods.includes(method.toLowerCase() as HttpMethod)
      ? (method.toLowerCase() as HttpMethod)
      : "get";

    return await axios[requestMethod](`/api${url}`, data, opts ?? {})
      .then((response: AxiosResponse) => response.data)
      .catch((error: any) => {
        return null;
      });
  }

  async trigger({ url, data, opts, method = "post" }: ApiRequestType, ctx?: any) {
    const appUrl = process.env.APP_URL ?? getPublicBaseUrl();
    url = `${appUrl}${url}`;
    return this.connect({ method, url, data, opts }, ctx);
  }

  async request<T>({ method = "get", url, data, opts }: ApiRequestType, ctx?: any): Promise<T> {
    const baseUrl = typeof window === "undefined" ? getInternalBaseUrl() : getPublicBaseUrl();
    url = `${baseUrl}/api/${url}`;
    return await this.connect({ method, url, data, opts }, ctx) as Promise<T>;
  }

  async content({ url, method = "get" }: any, ctx?: any) {
    const baseUrl = typeof window === "undefined" ? getInternalBaseUrl() : getPublicBaseUrl();
    url = `${baseUrl}/api/content/${url}`;
    return await this.connect({ method, url }, ctx);
  }

  async call<T>({ method = "post", url, data, opts }: ApiRequestType, ctx?: any): Promise<T> {
    const baseUrl = typeof window === "undefined" ? getInternalBaseUrl() : getPublicBaseUrl();
    url = `${baseUrl}/api/${url}`;
    data = { graphs: data };
    return this.connect({ method, url, data, opts }, ctx) as Promise<T>;
  }

  async bridge<T>({ method = "get", url, data, opts }: ApiRequestType, ctx?: any): Promise<T> {
    const apiRest = typeof window === "undefined"
      ? process.env.INTERNAL_API_REST ?? process.env.API_REST ?? ""
      : process.env.NEXT_PUBLIC_API_REST ?? process.env.API_REST ?? "";

    url = `${apiRest}${url}`;
    return this.connect({ method, url, data, opts }, ctx) as Promise<T>;
  }

  async graph({ method = "post", url, data, opts }: ApiRequestType, ctx?: any) {
    const apiRest = typeof window === "undefined"
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
    const apiRest = typeof window === "undefined"
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
