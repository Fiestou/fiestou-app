import type { NextApiRequest, NextApiResponse } from "next";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session_id: string = req.body.session;

  const session = await stripe.checkout.sessions.retrieve(session_id);

  res.json({ data: session });
}
