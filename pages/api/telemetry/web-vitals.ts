import type { NextApiRequest, NextApiResponse } from "next";

const METRIC_THRESHOLDS: Record<string, number> = {
  CLS: 0.1,
  FCP: 1800,
  INP: 200,
  LCP: 2500,
  TTFB: 800,
};

const ALLOWED_METRICS = new Set(Object.keys(METRIC_THRESHOLDS));

function parseBody(body: unknown): Record<string, any> | null {
  if (!body) return null;
  if (typeof body === "object") return body as Record<string, any>;

  if (typeof body === "string") {
    try {
      return JSON.parse(body) as Record<string, any>;
    } catch {
      return null;
    }
  }

  return null;
}

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).end();
    return;
  }

  const payload = parseBody(req.body);
  if (!payload) {
    res.status(204).end();
    return;
  }

  const name = String(payload.name ?? "");
  if (!ALLOWED_METRICS.has(name)) {
    res.status(204).end();
    return;
  }

  const value = Number(payload.value);
  if (!Number.isFinite(value)) {
    res.status(204).end();
    return;
  }

  const sampleRate = Number(
    process.env.WEB_VITALS_SAMPLE_RATE ??
      (process.env.NODE_ENV === "production" ? "0.2" : "1"),
  );

  if (Math.random() > Math.max(0, Math.min(1, sampleRate))) {
    res.status(204).end();
    return;
  }

  const threshold = METRIC_THRESHOLDS[name] ?? 0;
  if (value >= threshold) {
    console.warn("[web-vitals]", {
      name,
      value,
      page: payload.page ?? null,
      href: payload.href ?? null,
      id: payload.id ?? null,
      label: payload.label ?? null,
      userAgent: req.headers["user-agent"] ?? null,
    });
  }

  res.status(204).end();
}
