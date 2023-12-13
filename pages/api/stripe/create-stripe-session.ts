import { clean, moneyFormat } from "@/src/helper";
import { OrderType } from "@/src/models/order";
import { ProductOrderType } from "@/src/models/product";
import type { NextApiRequest, NextApiResponse } from "next";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const order: OrderType = req.body;

  if (!!order?.listItems?.length) {
    const redirectURL = `${process.env.APP_URL}/dashboard/pedidos/${order.id}/`;

    let transformedItem: Array<any> = [];
    let handleMetadata: string = "";
    let metadata: any = {
      fornecedores: [],
    };

    order?.listItems.map((item: ProductOrderType, key: any) => {
      metadata.fornecedores[item.product.store.slug] = {
        loja: item.product.store.title,
        produtos: "",
      };
    });

    order?.listItems
      .filter((item: any) => !!item?.product)
      .map((item: ProductOrderType, key: any) => {
        metadata.fornecedores[item.product.store.slug].produtos += `${
          item.product.title
        } x ${item.quantity}: R$ ${moneyFormat(item.total)}`;

        transformedItem.push({
          price_data: {
            currency: "brl",
            product_data: { name: item.product.title },
            unit_amount: item.total * 100,
          },
          // description: "--",
          quantity: item.quantity,
        });
      });

    Object.values(metadata.fornecedores).map((item: any, key: any) => {
      handleMetadata += `
        ${item.loja} -----
        ${item.produtos}

      `;
    });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card", "boleto"],
      line_items: transformedItem,
      mode: "payment",
      metadata: {
        taxaServiço: order.platformCommission,
        nota: JSON.stringify(handleMetadata),
      },
      success_url: `${redirectURL}/`,
      cancel_url: `${redirectURL}/`,
    });

    res.json({ session: session });
  }
}
