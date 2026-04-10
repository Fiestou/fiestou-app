import type { NextApiRequest, NextApiResponse } from "next";

import { isMasterRequest, resolveAuthUser } from "@/src/server/api-route-auth";
import {
  clearFacebookAuthConfig,
  getFacebookAuthAdminState,
  writeFacebookAuthConfig,
} from "@/src/server/social-auth-config";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (!(await isMasterRequest(req))) {
    return res.status(403).json({
      response: false,
      message: "forbidden",
    });
  }

  if (req.method === "GET") {
    return res.status(200).json({
      response: true,
      data: {
        facebook: getFacebookAuthAdminState(),
      },
    });
  }

  if (req.method === "PUT") {
    const user = await resolveAuthUser(req);
    const payload = req.body?.facebook ?? req.body ?? {};

    const enabled =
      payload.enabled === true ||
      payload.enabled === "true" ||
      payload.enabled === 1 ||
      payload.enabled === "1";

    const clientId = String(payload.clientId ?? "").trim();
    const clientSecret = String(payload.clientSecret ?? "").trim();

    const next = writeFacebookAuthConfig({
      enabled,
      clientId,
      clientSecret,
      updatedBy:
        user?.email || user?.id
          ? String(user?.email ?? user?.id)
          : undefined,
    });

    return res.status(200).json({
      response: true,
      message: "Configuração do Facebook atualizada.",
      data: {
        facebook: getFacebookAuthAdminState(),
        saved: {
          enabled: next.facebook.enabled,
          clientId: next.facebook.clientId,
        },
      },
    });
  }

  if (req.method === "DELETE") {
    const user = await resolveAuthUser(req);

    clearFacebookAuthConfig(
      user?.email || user?.id ? String(user?.email ?? user?.id) : undefined,
    );

    return res.status(200).json({
      response: true,
      message: "Configuração do Facebook removida.",
      data: {
        facebook: getFacebookAuthAdminState(),
      },
    });
  }

  res.setHeader("Allow", "GET, PUT, DELETE");
  return res.status(405).json({
    response: false,
    message: "method_not_allowed",
  });
}
