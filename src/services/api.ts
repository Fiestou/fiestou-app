import axios, { AxiosResponse } from "axios";
import Cookies from "js-cookie";
import { serializeParam } from "../helper";

const token = Cookies.get("fiestou.authtoken");

export const api = axios.create({
  baseURL: process.env.BASE_URL,
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
          if (error.response && [400, 401, 418].includes(error.response.status)) {
            reject(error.response);
          }
          resolve(error.response);
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
        console.log(error);
        return null;
      });
  }

  async trigger({ url, data, opts, method = "post" }: ApiRequestType, ctx?: any) {
    url = `${process.env.APP_URL}${url}`;
    return this.connect({ method, url, data, opts }, ctx);
  }

  async request<T>({ method = "get", url, data, opts }: ApiRequestType, ctx?: any): Promise<T> {
    url = `${process.env.BASE_URL}/api/${url}`;
    return await this.connect({ method, url, data, opts }, ctx) as Promise<T>;
  }

  async content({ url, method = "get" }: any, ctx?: any) {
    url = `${process.env.BASE_URL}/api/content/${url}`;
    return await this.connect({ method, url }, ctx);
  }

  async call<T>({ method = "post", url, data, opts }: ApiRequestType, ctx?: any): Promise<T> {
    url = `${process.env.BASE_URL}/api/${url}`;
    data = { graphs: data };
    return this.connect({ method, url, data, opts }, ctx) as Promise<T>;
  }

  async bridge<T>({ method = "get", url, data, opts, noAppPrefix = false }: ApiRequestType, ctx?: any): Promise<T> {
    // Se vier url absoluta (http/https), respeita como está
    if (/^https?:\/\//i.test(url)) {
      return this.connect({ method, url, data, opts }, ctx) as Promise<T>;
    }

    // Se começar com "/api", considera base BASE_URL (sem app/)
    if (url.startsWith("/api/")) {
      const full = `${process.env.BASE_URL}${url}`;
      return this.connect({ method, url: full, data, opts }, ctx) as Promise<T>;
    }

    // Se pediram explicitamente para NÃO usar o prefixo "app/"
    if (noAppPrefix) {
      const path = url.replace(/^\/+/, ""); // remove "/" inicial se houver
      const full = `${process.env.BASE_URL}/api/${path}`;
      return this.connect({ method, url: full, data, opts }, ctx) as Promise<T>;
    }

    // Comportamento padrão (mantém suas rotas app/)
    const full = `${process.env.API_REST}${url}`;
    return this.connect({ method, url: full, data, opts }, ctx) as Promise<T>;
  }

  async graph({ method = "post", url, data, opts }: ApiRequestType, ctx?: any) {
    url = `${process.env.API_REST}${url}`;
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
    url = `${process.env.API_REST}${url}`;
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