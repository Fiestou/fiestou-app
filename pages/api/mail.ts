import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { isMasterRequest } from "@/src/server/api-route-auth";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const allowed = await isMasterRequest(req);
  if (!allowed) {
    return res.status(403).json({ response: false, message: "forbidden" });
  }

  let post = req.body;

  try {
    const internalBridge =
      process.env.INTERNAL_MAIL_BRIDGE_SECRET ??
      process.env.INTERNAL_AUTH_BRIDGE_SECRET ??
      process.env.TOKEN ??
      "";
    const authToken = req.cookies["fiestou.authtoken"] ?? "";

    axios
      .post(process.env.BASE_URL + "/api/mail-send", post, {
        headers: {
          "X-Fiestou-Mail-Bridge": internalBridge,
          ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
        },
      })
      .then(({ data }) => {
        if (data.response) {
          res.status(200).json({
            response: data.response,
          });
        } else {
          res.status(500).json({
            response: data.response,
          });
        }
      })
      .catch(({ response }) => {
        res.status(500).json({
          response: response,
        });
      });
  } catch (err) {

  }
}
