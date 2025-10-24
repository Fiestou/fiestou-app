import { OrderType } from "../models/order";
import { deliveryTypes } from "../models/delivery";
import { moneyFormat } from "../helper";
import { CartType } from "../models/cart";

export interface MessageType {
  subject: string;
  message: string;
}

const SendSMS = async (data: any) => {
  const request: any = await fetch(process.env.BASE_URL + "/api/sms-send", {
    method: "POST",
    redirect: "follow",
    headers: {
      Accept: "application/json, text/plain, */*",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.text())
    .then((result) => result)

  return request;
};

export const RegisterUserSMS = async (user: any, content: MessageType) => {
  let message = `${content.message} \n\n ${process.env.BASE_URL}/api/user-active?token=${user.hash}`;
  message = message.replace(/\{user_name\}/g, user.name);

  const data = {
    phone: user?.phone,
    subject: content.subject,
    content: message,
  };

  const handleSendSMS = await SendSMS(data);
};

export const RegisterOrderSMS = async (
  order: OrderType,
  products: Array<CartType>,
  content: MessageType
) => {
  const user: any = order?.user ?? {};

  if (!!user?.phone) {
    let address: any = order.deliveryAddress;
    address = `${address.street}, ${address.number}, ${address.neighborhood
      } - ${address.zipCode}\n${address.city}, ${address.state} - ${address.country
      } ${!!address.complement ? "\n" + address.complement : ""}`;

    let messageDetails = "";

    products.forEach((item: any) => {
      messageDetails += `${item.quantity} x ${item.product.title
        } - R$ ${moneyFormat(item.total)}\n`;
    });

    messageDetails += `\nTotal: R$ ${moneyFormat(order.total)}\n`;
    messageDetails += `\nEndereço: ${address}`;

    let message = `${content.message}`.replace(/\{user_name\}/g, user.name);
    message = `${message}`.replace(/\{items_order\}/g, messageDetails);
    message = `${message}`.replace(/\{order_code\}/g, `#${order.id}`);

    const data = {
      phone: user?.phone,
      subject: content.subject,
      content: message,
    };

    const handleSendSMS = await SendSMS(data);
  }
};

export const CompleteOrderSMS = async (
  order: OrderType,
  content: MessageType
) => {
  const user: any = order?.user ?? {};

  if (!!user?.phone) {
    let message = `${content.message}`.replace(/\{user_name\}/g, user.name);
    message = `${message}`.replace(/\{order_code\}/g, `#${order.id}`);

    const data = {
      phone: user?.phone,
      subject: content.subject,
      content: message,
    };

    const handleSendSMS = await SendSMS(data);

  }

};

export const PartnerNewOrderSMS = async (
  order: OrderType,
  notificate: Array<any>,
  content: MessageType
) => {
  notificate
    .filter((store: any) => !!store?.phone)
    .map(async (store: any) => {
      let message = `${content.message}`.replace(
        /\{partner_name\}/g,
        store.name
      );

      message = `${message}`.replace(/\{order_code\}/g, `#${order.id}`);

      const data = {
        phone: store?.phone,
        subject: content.subject,
        content: message,
      };

      const handleSendSMS = await SendSMS(data);
    });
};

export const ChangeDeliveryStatusSMS = async (
  order: OrderType,
  content: MessageType
) => {
  const user: any = order?.user ?? {};

  if (!!user?.phone) {
    let status: any = {};

    deliveryTypes.map((item: any) => {
      if (item.value == order.deliveryStatus) {
        status = item;
      }
    });

    let message = `${content.message}`.replace(/\{user_name\}/g, user.name);
    message = `${message}`.replace(/\{status_delivery\}/g, status?.name);
    message = `${message}`.replace(/\{order_code\}/g, `#${order.id}`);

    const data = {
      phone: user?.phone,
      subject: content.subject,
      content: message,
    };

    const handleSendSMS = SendSMS(data);
  }
};
