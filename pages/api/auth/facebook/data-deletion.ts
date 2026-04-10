import type { NextApiRequest, NextApiResponse } from "next";

import {
  createFacebookDataDeletionRequest,
  parseFacebookSignedRequest,
} from "@/src/server/facebook-data-deletion";
import { getFacebookProviderConfig } from "@/src/server/social-auth-config";

function getAppUrl() {
  return String(
    process.env.NEXTAUTH_URL ?? process.env.APP_URL ?? "http://localhost:3000",
  ).replace(/\/+$/, "");
}

function readSignedRequest(req: NextApiRequest) {
  if (typeof req.body === "string") {
    return new URLSearchParams(req.body).get("signed_request") ?? "";
  }

  if (req.body instanceof URLSearchParams) {
    return req.body.get("signed_request") ?? "";
  }

  return String(req.body?.signed_request ?? req.query?.signed_request ?? "").trim();
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === "GET") {
    return res.status(200).json({
      response: true,
      message: "facebook_data_deletion_callback_ready",
    });
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({
      response: false,
      message: "method_not_allowed",
    });
  }

  const facebook = getFacebookProviderConfig();

  if (!facebook.clientSecret) {
    return res.status(503).json({
      response: false,
      message: "facebook_app_secret_not_configured",
    });
  }

  const signedRequest = readSignedRequest(req);

  if (!signedRequest) {
    return res.status(400).json({
      response: false,
      message: "signed_request_required",
    });
  }

  try {
    const payload = parseFacebookSignedRequest(
      signedRequest,
      facebook.clientSecret,
    );
    const record = createFacebookDataDeletionRequest(payload.user_id ?? null);
    const appUrl = getAppUrl();

    return res.status(200).json({
      url: `${appUrl}/exclusao-de-dados/status/${record.code}`,
      confirmation_code: record.code,
    });
  } catch (error) {
    return res.status(400).json({
      response: false,
      message:
        error instanceof Error ? error.message : "signed_request_invalid",
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
