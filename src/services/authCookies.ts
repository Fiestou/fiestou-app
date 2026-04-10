import Cookies from "js-cookie";

const AUTH_TOKEN_KEY = "fiestou.authtoken";
const AUTH_USER_KEY = "fiestou.user";
const AUTH_STORE_KEY = "fiestou.store";
const AUTH_REGION_KEY = "fiestou.region";

const shouldUseSecureCookies = () => {
  if (typeof window !== "undefined") {
    return window.location.protocol === "https:";
  }

  const appUrl = String(process.env.APP_URL ?? process.env.NEXTAUTH_URL ?? "").trim();
  return appUrl.startsWith("https://");
};

export const buildAuthCookieOptions = (days = 14) => ({
  expires: days,
  path: "/",
  sameSite: "Lax" as const,
  secure: shouldUseSecureCookies(),
});

const sanitizeUserCookieValue = (user: any) => {
  if (!user || typeof user !== "object") {
    return user;
  }

  const sanitized = { ...user };
  delete sanitized.password;
  delete sanitized.remember;

  return sanitized;
};

export const readAuthToken = () => Cookies.get(AUTH_TOKEN_KEY);

export const readUserCookie = () => {
  const raw = Cookies.get(AUTH_USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const readStoreCookie = () => Cookies.get(AUTH_STORE_KEY) ?? "";

export const setAuthTokenCookie = (token: string, days = 14) => {
  Cookies.set(AUTH_TOKEN_KEY, token, buildAuthCookieOptions(days));
};

export const setUserCookie = (user: any, days = 14) => {
  Cookies.set(
    AUTH_USER_KEY,
    JSON.stringify(sanitizeUserCookieValue(user)),
    buildAuthCookieOptions(days)
  );
};

export const setStoreCookie = (store: string | number, days = 14) => {
  Cookies.set(AUTH_STORE_KEY, String(store), buildAuthCookieOptions(days));
};

export const setRegionCookie = (region: any, days = 14) => {
  Cookies.set(AUTH_REGION_KEY, JSON.stringify(region), buildAuthCookieOptions(days));
};

export const clearAuthCookies = () => {
  Cookies.remove(AUTH_TOKEN_KEY, { path: "/" });
  Cookies.remove(AUTH_USER_KEY, { path: "/" });
  Cookies.remove(AUTH_STORE_KEY, { path: "/" });
  Cookies.remove(AUTH_REGION_KEY, { path: "/" });
};
