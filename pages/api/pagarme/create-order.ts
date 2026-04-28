import { clean, moneyFormat } from "@/src/helper";
import { OrderType } from "@/src/models/order";
import { ProductOrderType } from "@/src/models/product";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthenticatedRequest } from "@/src/server/api-route-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const allowed = await isAuthenticatedRequest(req);
  if (!allowed) {
    return res.status(403).json({ response: false, message: "forbidden" });
  }

  const { payment } = req.body;

  const headers = {
    accept: "application/json",
    "content-type": "application/json",
    authorization: `Basic ${Buffer.from(
      `${process.env.PAGARME_SECRET_KEY}:`
    ).toString("base64")}`,
  };

  try {
    const response = await axios.post(
      `${process.env.PAGARME_API}/orders`,
      payment,
      { headers }
    );

    res.status(200).json({ response: true, data: response.data });
  } catch (error: any) {
    console.error(error.response.data);
    res
      .status(error.response?.status || 500)
      .json({ response: false, data: error });
  }
}
