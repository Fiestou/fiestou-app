import type { NextApiRequest } from "next";

type AuthUser = {
  id?: number;
  type?: string;
  email?: string;
};

const trimSlashes = (value: string) => value.replace(/\/+$/, "");

const getApiBase = () =>
  trimSlashes(
    String(
      process.env.INTERNAL_API_REST ??
        process.env.API_REST ??
        process.env.BASE_URL ??
        "",
    ).trim(),
  );

export async function resolveAuthUser(
  req: NextApiRequest,
): Promise<AuthUser | null> {
  const token = req.cookies["fiestou.authtoken"];
  const apiBase = getApiBase();

  if (!token || !apiBase) {
    return null;
  }

  try {
    const response = await fetch(`${apiBase}/me`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      return null;
    }

    return (await response.json()) as AuthUser;
  } catch {
    return null;
  }
}

export async function isMasterRequest(req: NextApiRequest) {
  const user = await resolveAuthUser(req);
  return user?.type === "master";
}

export async function isAuthenticatedRequest(req: NextApiRequest) {
  const user = await resolveAuthUser(req);
  return !!user?.id;
}
