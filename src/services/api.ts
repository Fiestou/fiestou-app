// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
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

// api.interceptors.request.use((config) => {
//   console.log(config);
//   return config;
// });

interface ApiRequestType {
  method?: string;
  url: string;
  data?: any;
  opts?: Object;
}

class Api {
  constructor() {}

  async connect({ method, url, data, opts }: ApiRequestType, ctx?: any) {
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

      api[method == "get" ? "get" : "post"](url, data ?? {}, opts ?? {})
        .then(({ data }: any) => {
          resolve(data);
        })
        .catch((response: any) => {
          if ([400, 401, 418].indexOf(response.status) > -1) {
            reject(response);
          }
          resolve(response);
        });
    });
  }

  async internal({
    url,
    method,
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

    return await axios[method == "get" ? "get" : "post"](
      `/api${url}`,
      data,
      opts ?? {}
    )
      .then(({ data }: any) => data)
      .catch((error) => {
        console.log(error);
        return null;
      });
  }

  async trigger({ url, data, opts }: ApiRequestType, ctx?: any) {
    url = `${process.env.APP_URL}${url}`;
    return this.connect({ url, data, opts }, ctx);
  }

  async request({ method, url, data, opts }: ApiRequestType, ctx?: any) {
    url = `${process.env.BASE_URL}/api/${url}`;
    return await this.connect({ method, url, data, opts }, ctx);
  }

  async content({ url }: any, ctx?: any) {
    url = `${process.env.BASE_URL}/api/content/${url}`;
    return await this.connect({ method: "get", url }, ctx);
  }

  async call({ method, url, data, opts }: ApiRequestType, ctx?: any) {
    url = `${process.env.BASE_URL}/api/${url}`;
    data = { graphs: data };
    return this.connect({ method, url, data, opts }, ctx);
  }

  async bridge<T>({ method, url, data, opts }: ApiRequestType, ctx?: any): Promise<T> {
    url = `${process.env.API_REST}${url}`;
    return this.connect({ method, url, data, opts }, ctx) as Promise<T>;
  }

  async graph({ method, url, data, opts }: ApiRequestType, ctx?: any) {
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

    if (data?.method == "upload") {
      url = `app/files/upload-base64`;
    }

    if (data?.method == "remove") {
      url = `app/files/remove-medias`;
    }

    return this.request({ url, data });
  }

  async auth({ method, url, data, opts }: ApiRequestType, ctx?: any) {
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
