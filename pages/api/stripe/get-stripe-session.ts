import type { NextApiRequest, NextApiResponse } from "next";
import { isAuthenticatedRequest } from "@/src/server/api-route-auth";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const allowed = await isAuthenticatedRequest(req);
  if (!allowed) {
    return res.status(403).json({ response: false, message: "forbidden" });
  }

  const session_id: string = req.body.session;

  const session = await stripe.checkout.sessions.retrieve(session_id);

  res.json({ data: session });
}
