import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";

type RedirectResult = {
  redirect: {
    destination: string;
    permanent: false;
  };
};

export function buildAccessRedirect(destination = "/acesso"): RedirectResult {
  return {
    redirect: {
      destination,
      permanent: false,
    },
  };
}

export function hasAuthTokenCookie(ctx: any): boolean {
  return !!ctx?.req?.cookies?.["fiestou.authtoken"];
}

export function isCustomerUser(user: Pick<UserType, "type"> | null | undefined) {
  const type = String(user?.type ?? "").toLowerCase();
  return type === "client" || type === "user";
}

export function buildRoleRedirect(user: Pick<UserType, "type"> | null | undefined) {
  const type = String(user?.type ?? "").toLowerCase();

  if (type === "master") {
    return buildAccessRedirect("/admin");
  }

  if (type === "partner") {
    return buildAccessRedirect("/painel");
  }

  if (type === "delivery") {
    return buildAccessRedirect("/entregador");
  }

  return buildAccessRedirect("/dashboard");
}

export async function resolveAuthenticatedPageUser(
  ctx: any,
): Promise<UserType | null> {
  if (!hasAuthTokenCookie(ctx)) {
    return null;
  }

  const api = new Api();
  const request: any = await api.bridge(
    {
      method: "get",
      url: "users/get",
    },
    ctx,
  );

  if (!request?.response || !request?.data?.id) {
    return null;
  }

  return request.data as UserType;
}
