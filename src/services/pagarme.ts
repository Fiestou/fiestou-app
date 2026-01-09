import axios from "axios";
import { convertToCents, phoneAreaCode, phoneJustNumber } from "../helper";
import { OrderType, PaymentType } from "@/src/models/order";
import { ProductOrderType } from "../models/product";
import Api from "./api";
import { AddressType } from "../models/address";

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

  async createOrder(
    order: OrderType,
    payment: PaymentType,
    address: AddressType
  ) {
    const api = new Api();

    const handleDocument: any =
      payment.payment_method == "credit_card"
        ? payment.credit_card?.card.holder_document
        : (order.user as any)?.cpf ?? (order.user as any)?.document;

    const customer: any = {
      address: {
        country: "BR",
        state: address?.state,
        city: address?.city,
        zip_code: address?.zipCode,
        line_1: address?.street,
        line_2: address?.number,
      },
      name: order.user?.name,
      type: "individual",
      email: order.user?.email,
      document: handleDocument,
      code: order.user?.id,
      gender: (order.user as any)?.gender,
      birthdate: (order.user as any)?.date,
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
          state: (order.delivery?.address || order.delivery_address)?.state,
          city: (order.delivery?.address || order.delivery_address)?.city,
          zip_code: (order.delivery?.address || order.delivery_address)?.zipCode,
          line_1: (order.delivery?.address || order.delivery_address)?.street,
          line_2: (order.delivery?.address || order.delivery_address)?.number,
        },
        amount: convertToCents(order?.delivery?.price ?? order?.delivery_price ?? 0),
        description: "delivery",
        recipient_name: order.user?.name,
        recipient_phone: order.user?.phone,
      },
      items: order.listItems.map((item: ProductOrderType) => {
        return {
          amount: convertToCents(item.total),
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
          method: 'post',
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
