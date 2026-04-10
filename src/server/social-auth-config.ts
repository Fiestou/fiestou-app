import fs from "fs";
import path from "path";

export type FacebookAuthConfig = {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
  updatedAt?: string;
  updatedBy?: string;
};

type SocialAuthConfig = {
  facebook: FacebookAuthConfig;
};

const RUNTIME_DIR = path.join(process.cwd(), ".runtime");
const STORAGE_FILE = path.join(RUNTIME_DIR, "social-auth.json");

const parseBoolean = (value: unknown) =>
  value === true || value === "true" || value === 1 || value === "1";

function getAppUrl() {
  return String(
    process.env.NEXTAUTH_URL ??
      process.env.APP_URL ??
      "http://localhost:3000",
  ).replace(/\/+$/, "");
}

function getDefaultConfig(): SocialAuthConfig {
  return {
    facebook: {
      enabled: parseBoolean(process.env.ENABLE_FACEBOOK_AUTH),
      clientId: String(process.env.FACEBOOK_CLIENT_ID ?? "").trim(),
      clientSecret: String(process.env.FACEBOOK_CLIENT_SECRET ?? "").trim(),
    },
  };
}

function ensureRuntimeDir() {
  fs.mkdirSync(RUNTIME_DIR, { recursive: true });
}

function readStoredConfig(): Partial<SocialAuthConfig> {
  if (!fs.existsSync(STORAGE_FILE)) {
    return {};
  }

  try {
    return JSON.parse(fs.readFileSync(STORAGE_FILE, "utf8"));
  } catch {
    return {};
  }
}

export function readSocialAuthConfig(): SocialAuthConfig {
  const defaults = getDefaultConfig();
  const stored = readStoredConfig();
  const facebookStored = stored.facebook ?? {};

  return {
    facebook: {
      ...defaults.facebook,
      ...facebookStored,
      enabled: parseBoolean(facebookStored.enabled ?? defaults.facebook.enabled),
      clientId: String(facebookStored.clientId ?? defaults.facebook.clientId ?? "").trim(),
      clientSecret: String(
        facebookStored.clientSecret ?? defaults.facebook.clientSecret ?? "",
      ).trim(),
    },
  };
}

export function writeFacebookAuthConfig(input: {
  enabled: boolean;
  clientId: string;
  clientSecret?: string;
  updatedBy?: string;
}) {
  const current = readSocialAuthConfig();
  const next: SocialAuthConfig = {
    facebook: {
      ...current.facebook,
      enabled: !!input.enabled,
      clientId: String(input.clientId ?? "").trim(),
      clientSecret:
        input.clientSecret && input.clientSecret.trim().length > 0
          ? input.clientSecret.trim()
          : current.facebook.clientSecret,
      updatedAt: new Date().toISOString(),
      updatedBy: input.updatedBy,
    },
  };

  ensureRuntimeDir();
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(next, null, 2), "utf8");
  fs.chmodSync(STORAGE_FILE, 0o600);

  return next;
}

export function clearFacebookAuthConfig(updatedBy?: string) {
  const next: SocialAuthConfig = {
    facebook: {
      enabled: false,
      clientId: "",
      clientSecret: "",
      updatedAt: new Date().toISOString(),
      updatedBy,
    },
  };

  ensureRuntimeDir();
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(next, null, 2), "utf8");
  fs.chmodSync(STORAGE_FILE, 0o600);

  return next;
}

export function getFacebookAuthAdminState() {
  const config = readSocialAuthConfig().facebook;
  const appUrl = getAppUrl();

  return {
    enabled: config.enabled,
    clientId: config.clientId,
    clientSecretConfigured: config.clientSecret.length > 0,
    providerConfigured: config.clientId.length > 0 && config.clientSecret.length > 0,
    callbackUrl: `${appUrl}/api/auth/callback/facebook`,
    signinUrl: `${appUrl}/api/auth/signin/facebook`,
    dataDeletionCallbackUrl: `${appUrl}/api/auth/facebook/data-deletion`,
    dataDeletionInstructionsUrl: `${appUrl}/exclusao-de-dados`,
    appDomains: [new URL(appUrl).hostname],
    updatedAt: config.updatedAt ?? null,
    updatedBy: config.updatedBy ?? null,
  };
}

export function getFacebookProviderConfig() {
  const config = readSocialAuthConfig().facebook;
  const configured = config.clientId.length > 0 && config.clientSecret.length > 0;

  return {
    enabled: config.enabled && configured,
    configured,
    clientId: config.clientId,
    clientSecret: config.clientSecret,
  };
}
