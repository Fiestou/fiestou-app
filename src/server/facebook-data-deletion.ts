import crypto from "crypto";
import fs from "fs";
import path from "path";

type FacebookDeletionPayload = {
  algorithm?: string;
  user_id?: string;
  issued_at?: number;
};

export type FacebookDeletionRecord = {
  code: string;
  source: "facebook";
  facebookUserId: string | null;
  receivedAt: string;
  status: "received";
};

const RUNTIME_DIR = path.join(process.cwd(), ".runtime");
const STORAGE_FILE = path.join(
  RUNTIME_DIR,
  "facebook-data-deletion-requests.json",
);

function ensureRuntimeDir() {
  fs.mkdirSync(RUNTIME_DIR, { recursive: true });
}

function decodeBase64Url(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
  return Buffer.from(`${normalized}${padding}`, "base64");
}

function encodeBase64Url(input: Buffer | string) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function readRecords(): FacebookDeletionRecord[] {
  if (!fs.existsSync(STORAGE_FILE)) {
    return [];
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(STORAGE_FILE, "utf8"));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeRecords(records: FacebookDeletionRecord[]) {
  ensureRuntimeDir();
  fs.writeFileSync(STORAGE_FILE, JSON.stringify(records, null, 2), "utf8");
  fs.chmodSync(STORAGE_FILE, 0o600);
}

export function parseFacebookSignedRequest(
  signedRequest: string,
  appSecret: string,
): FacebookDeletionPayload {
  const [encodedSignature, encodedPayload] = String(signedRequest).split(".", 2);

  if (!encodedSignature || !encodedPayload) {
    throw new Error("signed_request_invalid");
  }

  const signature = decodeBase64Url(encodedSignature);
  const expected = crypto
    .createHmac("sha256", appSecret)
    .update(encodedPayload)
    .digest();

  if (!crypto.timingSafeEqual(signature, expected)) {
    throw new Error("signed_request_signature_invalid");
  }

  const payload = JSON.parse(decodeBase64Url(encodedPayload).toString("utf8"));

  if ((payload?.algorithm ?? "").toUpperCase() !== "HMAC-SHA256") {
    throw new Error("signed_request_algorithm_invalid");
  }

  return payload;
}

export function createFacebookDataDeletionRequest(
  facebookUserId?: string | null,
) {
  const record: FacebookDeletionRecord = {
    code: encodeBase64Url(crypto.randomBytes(18)),
    source: "facebook",
    facebookUserId: facebookUserId ? String(facebookUserId) : null,
    receivedAt: new Date().toISOString(),
    status: "received",
  };

  const next = [record, ...readRecords()].slice(0, 500);
  writeRecords(next);

  return record;
}

export function findFacebookDataDeletionRequest(code: string) {
  return readRecords().find((record) => record.code === code) ?? null;
}
