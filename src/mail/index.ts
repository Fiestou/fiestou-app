import { OrderType } from "../models/order";
import { deliveryTypes } from "../models/delivery";
import { getImage, moneyFormat } from "../helper";
import { CartType } from "../models/cart";
import { deliveryToName } from "@/pages/checkout/index_";

export interface ContentType {
  subject: string;
  image: string;
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
  const image = !!getImage(content?.image, "lg")
    ? `<img src="${getImage(
        content?.image,
        "lg"
      )}" style="width:100%;height:auto;" />`
    : "";

  let html = `${content.html}<p><a href="${process.env.BASE_URL}/api/user-active?token=${user.hash}" style="border-radius: 6px;text-decoration: none;display: inline-block;font-weight:600;color:black;background-color:#ffda4a;padding: .85rem 1.25rem;">Validar email</a></p>`;
  html = html.replace(/\{user_name\}/g, user.name);
  html = `${image}<div style="padding: 24px 48px 32px;">${html}</div>`;

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
  const image = !!getImage(content?.image, "lg")
    ? `<img src="${getImage(
        content?.image,
        "lg"
      )}" style="width:100%;height:auto;" />`
    : "";

  let address: any = order.deliveryAddress;
  address = `Local: ${address.street}, ${address.number}, ${
    address.neighborhood
  } - ${address.zipCode} | ${address.city}, ${address.state} - ${
    address.country
  } ${
    !!address.complement ? "<br/>Complemento: " + address.complement + "" : ""
  }`;

  let table = "<table style='width: 100%;border-collapse: collapse;'>";

  products.map((item: any, key: any) => {
    table += `<tr ${key % 2 != 0 ? "style='background-color: #f7f7f7;'" : ""}>
                <td align="left" style="padding: 4px">${item.quantity} x <b>${
      item.product.title
    }</b></td>
                <td align="right" style="padding: 4px"></td>
                <td align="right" style="padding: 4px"> R$ ${moneyFormat(
                  item.total
                )}</td>
              </tr>`;
  });

  table += `<tr><td></td><td align="right"><b>Total:</b></td><td align="right"><b>R$ ${moneyFormat(
    order.total
  )}</b></td></tr>`;
  table += "</table>";

  table += `<br/><p style="font-weight: normal;text-align:left;"><b>ENTREGA</b><br/> ${
    deliveryToName[order.deliveryTo]
  }, às ${order.deliverySchedule} <br/>${address}</p>`;

  const user = order.user;

  let html = `${content.html}`.replace(/\{user_name\}/g, user.name);
  html = `${html}`.replace(/\{items_order\}/g, table);
  html = `${html}`.replace(/\{order_code\}/g, `#${order.id}`);

  html = `${html}<br/><br/><p style="text-align: center;">Acompanhe o status do pedido</p><br/><p style="text-align: center;"><a href="${process.env.APP_URL}/dashboard/pedidos/${order.id}" style="text-decoration: none;display: inline-block;font-weight:600;color:black;background-color:#ffda4a;border-radius: 6px;padding: .85rem 1.25rem;">Acompanhar </a></p>`;

  html = `${image}<div style="padding: 24px 48px 32px;">${html}</div>`;

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
  const image = !!getImage(content?.image, "lg")
    ? `<img src="${getImage(
        content?.image,
        "lg"
      )}" style="width:100%;height:auto;" />`
    : "";

  const user = order.user;

  let html = `${content.html}`.replace(/\{user_name\}/g, user.name);
  html = `${html}`.replace(/\{order_code\}/g, `#${order.id}`);
  html = `${image}<div style="padding: 24px 48px 32px;">${html}</div>`;

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
  const image = !!getImage(content?.image, "lg")
    ? `<img src="${getImage(
        content?.image,
        "lg"
      )}" style="width:100%;height:auto;" />`
    : "";

  notificate.map(async (store: any) => {
    let html = `${content.html}`.replace(/\{partner_name\}/g, store.name);
    html = `${html}`.replace(/\{order_code\}/g, `#${order.id}`);
    html = `${image}<div style="padding: 24px 48px 32px;">${html}</div>`;

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
  const image = !!getImage(content?.image, "lg")
    ? `<img src="${getImage(
        content?.image,
        "lg"
      )}" style="width:100%;height:auto;" />`
    : "";

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
  html = `${image}<div style="padding: 24px 48px 32px;">${html}</div>`;

  const data = {
    email: user.email,
    subject: content.subject,
    content: html,
  };

  const handleMailSend = MailSend(data);

  console.log("ChangeDeliveryStatusMail: ", handleMailSend);
};
