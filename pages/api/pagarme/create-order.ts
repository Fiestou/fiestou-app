import { clean, moneyFormat } from "@/src/helper";
import { OrderType } from "@/src/models/order";
import { ProductOrderType } from "@/src/models/product";
import axios from "axios";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { payment } = req.body;

  const headers = {
    accept: "application/json",
    "content-type": "application/json",
    authorization: "Basic c2tfYWI5NWM4ZTY5MWNlNGIyM2I4OGI5MGExOTc0NDg3MDQ6",
  };

  try {
    const response = await axios.post(
      `${process.env.PAGARME_API}/orders`,
      payment,
      { headers }
    );

    console.log(response);

    res.status(200).json({ response: true, data: response.data });
  } catch (error: any) {
    console.error(error.response.data);
    res
      .status(error.response?.status || 500)
      .json({ response: false, data: error });
  }
}
