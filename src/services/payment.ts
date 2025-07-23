// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import axios from "axios";
import { OrderType } from "@/src/models/order";
import { loadStripe } from "@stripe/stripe-js";

import Cookies from "js-cookie";

const token = Cookies.get("fiestou.authtoken");

export const api = axios.create({});

if (token) {
  api.defaults.headers["Authorization"] = `Bearer ${token}`;
}

const appUrl = `${process.env.APP_URL}`;

class Payment {
  constructor() {}

  async request(data?: OrderType, ctx?: any) {
    return await new Promise((resolve, reject) => {
      api
        .post("/api/checkout", data ?? {})
        .then((data: any) => {
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

  async createSession(data: OrderType, ctx?: any) {
    return await api
      .post("/api/stripe/create-stripe-session", data)
      .then(({ data }: any) => data)
  }

  async getSession(session: string, ctx?: any) {
    if (!!ctx?.req) {
      const authtoken = !!ctx?.req.cookies
        ? ctx.req.cookies["fiestou.authtoken"]
        : token;

      if (!!authtoken) {
        api.defaults.headers["Authorization"] = `Bearer ${authtoken}`;
      }
    }

    return await api
      .post("/api/stripe/get-stripe-session", { session: session })
      .then(({ data }: any) => data)
  }
}

export default Payment;
