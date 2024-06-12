import axios from "axios";
import Cookies from "js-cookie";
import { phoneAreaCode, phoneJustNumber } from "../helper";
import { OrderType } from "@/src/models/order";
import { ProductOrderType } from "../models/product";
import { PaymentType } from "@/pages/dashboard/pedidos/pagamento/[id]";
import Api from "./api";

class Pagarme {
  constructor() {}

  async request(url: string, data?: any, ctx?: any) {
    const request = await axios
      .post(`/api/pagarme${url}`, data ?? {})
      .then(({ data }: any) => data)
      .catch((response: any) => response);

    return request;
  }

  async cancelOrder(order: OrderType) {
    return await this.request("/cancel-order", { order: order });
  }

  async createOrder(order: OrderType, payment: PaymentType) {
    const api = new Api();

    const customer: any = {
      address: {
        country: "BR",
        state: order.deliveryAddress?.state,
        city: order.deliveryAddress?.city,
        zip_code: order.deliveryAddress?.zipCode,
        line_1: order.deliveryAddress?.street,
        line_2: order.deliveryAddress?.number,
      },
      name: order.user?.name,
      type: "individual",
      email: order.user?.email,
      code: order.user?.id,
      gender: order.user?.gender,
      birthdate: order.user?.date,
      metadata: {
        orderID: order.id,
      },
    };

    if (!!order.user?.phone) {
      customer["phones"] = {
        mobile_phone: {
          country_code: "55",
          area_code: phoneAreaCode(order.user?.phone),
          number: phoneJustNumber(order.user?.phone),
        },
      };
    }

    const data: any = {
      customer: customer,
      shipping: {
        address: {
          country: "BR",
          state: order.deliveryAddress?.state,
          city: order.deliveryAddress?.city,
          zip_code: order.deliveryAddress?.zipCode,
          line_1: order.deliveryAddress?.street,
          line_2: order.deliveryAddress?.number,
        },
        amount: 0,
        description: "delivery",
        recipient_name: order.user?.name,
        recipient_phone: order.user?.phone,
      },
      items: order.listItems.map((item: ProductOrderType) => {
        return {
          amount: item.total * 100,
          description: item.product.title,
          quantity: item.quantity,
          code: item.product.id,
        };
      }),
      payments: [payment],
    };

    try {
      const request = await this.request("/create-order", { payment: data });

      if (!!request.response) {
        await api.bridge({
          url: "orders/processing",
          data: {
            id: order.id,
          },
        });
      }

      return request;
    } catch (error) {
      return { response: false, data: error };
    }
  }
}

export default Pagarme;
