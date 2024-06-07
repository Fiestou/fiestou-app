// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import Api from "@/src/services/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const api = new Api();

  const post = req.body;

  const { data }: any = await api.bridge({
    method: "post",
    url: post.action,
    data: post,
  });

  res.status(200).json({ data });
}
