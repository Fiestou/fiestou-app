import { OrderType } from "../models/order";
import { deliveryTypes } from "../models/delivery";
import { moneyFormat } from "../helper";
import { CartType } from "../models/cart";

export interface ContentType {
  subject: string;
  html: string;
}

const MailSend = async (data: any) => {
  const request: any = await fetch(process.env.BASE_URL + "/api/mail-send", {
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
    .catch((error) => console.log("error", error));

  return request;
};

export const RegisterUserMail = async (user: any, content: ContentType) => {
  let html = `${content.html}<p><a href="${process.env.BASE_URL}/api/user-active?token=${user.hash}" style="display: inline-block;font-weight:600;color:black;background-color:#ffda4a;padding: 1rem 1.5rem;">Validar email</a></p>`;
  html = html.replace(/\{user_name\}/g, user.name);

  const data = {
    email: user.email,
    subject: content.subject,
    content: html,
  };

  const handleMailSend = await MailSend(data);

  console.log("RegisterUserMail: ", handleMailSend);
};

export const RegisterOrderMail = async (
  order: OrderType,
  products: Array<CartType>,
  content: ContentType
) => {
  let address: any = order.deliveryAddress;
  address = `${address.street}, ${address.number}, ${address.neighborhood} - ${
    address.zipCode
  } | ${address.city}, ${address.state} - ${address.country} ${
    !!address.complement ? " - " + address.complement : ""
  }`;

  let table = "<table style='width: 100%'>";

  products.map((item: any, key: any) => {
    table += `<tr>
                <td>${item.quantity} x <b>${item.product.title}</b></td>
                <td>...................</td>
                <td> R$ ${moneyFormat(item.total)}</td>
              </tr>`;
  });

  table += `<tr><td></td><td><b>Total:</b></td><td><b>R$ ${moneyFormat(
    order.total
  )}</b></td></tr>`;
  table += "</table>";

  table += `<br/><p style="font-weight: normal;text-align:left;"><b>Endereço:</b> ${address}</p>`;

  const user = order.user;

  let html = `${content.html}`.replace(/\{user_name\}/g, user.name);
  html = `${html}`.replace(/\{items_order\}/g, table);
  html = `${html}`.replace(/\{order_code\}/g, `#${order.id}`);

  const data = {
    email: user.email,
    subject: content.subject,
    content: html,
  };

  const handleMailSend = await MailSend(data);

  console.log("RegisterOrderMail: ", handleMailSend);
};

export const CompleteOrderMail = async (
  order: OrderType,
  content: ContentType
) => {
  const user = order.user;

  let html = `${content.html}`.replace(/\{user_name\}/g, user.name);
  html = `${html}`.replace(/\{order_code\}/g, `#${order.id}`);

  const data = {
    email: user.email,
    subject: content.subject,
    content: html,
  };

  const handleMailSend = await MailSend(data);

  console.log("CompleteOrderMail: ", handleMailSend);
};

export const PartnerNewOrderMail = async (
  order: OrderType,
  notificate: Array<any>,
  content: ContentType
) => {
  notificate.map(async (store: any) => {
    let html = `${content.html}`.replace(/\{partner_name\}/g, store.name);
    html = `${html}`.replace(/\{order_code\}/g, `#${order.id}`);

    const data = {
      email: store.email,
      subject: content.subject,
      content: html,
    };

    const handleMailSend = await MailSend(data);

    console.log("PartnerNewOrderMail: ", handleMailSend);
  });
};

export const ChangeDeliveryStatusMail = async (
  order: OrderType,
  content: ContentType
) => {
  const user = order.user;

  let status: any = {};

  deliveryTypes.map((item: any) => {
    if (item.value == order.deliveryStatus) {
      status = item;
    }
  });

  let html = `${content.html}`.replace(/\{user_name\}/g, user.name);
  html = `${html}`.replace(/\{status_delivery\}/g, status?.name);
  html = `${html}`.replace(/\{order_code\}/g, `#${order.id}`);

  const data = {
    email: user.email,
    subject: content.subject,
    content: html,
  };

  const handleMailSend = MailSend(data);

  console.log("ChangeDeliveryStatusMail: ", handleMailSend);
};
