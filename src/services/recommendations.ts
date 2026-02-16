import Cookies from "js-cookie";
import Api from "@/src/services/api";

const VISITOR_COOKIE = "fiestou.visitor_id";
const VISITOR_STORAGE = "fiestou.visitor_id";

export type InterestEventType =
  | "view"
  | "cart_add"
  | "favorite_add"
  | "favorite_remove";

type TrackInterestPayload = {
  productId: number;
  storeId?: number | null;
  event?: InterestEventType;
  source?: string;
  metadata?: Record<string, any>;
};

type RecommendationRequest = {
  productId: number;
  limit?: number;
  exclude?: number[];
};

const sanitizeVisitorId = (value: string) =>
  value.replace(/[^a-zA-Z0-9:_\-.]/g, "").slice(0, 120);

const generateVisitorId = () => {
  if (typeof window !== "undefined" && window.crypto?.randomUUID) {
    return sanitizeVisitorId(window.crypto.randomUUID());
  }

  return sanitizeVisitorId(
    `guest-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
  );
};

export const getOrCreateVisitorId = () => {
  if (typeof window === "undefined") return "";

  const fromCookie = Cookies.get(VISITOR_COOKIE) ?? "";
  const fromStorage = window.localStorage.getItem(VISITOR_STORAGE) ?? "";
  let visitorId = sanitizeVisitorId(fromCookie || fromStorage);

  if (!visitorId) {
    visitorId = generateVisitorId();
  }

  if (visitorId) {
    Cookies.set(VISITOR_COOKIE, visitorId, {
      expires: 365,
      sameSite: "Lax",
    });
    window.localStorage.setItem(VISITOR_STORAGE, visitorId);
  }

  return visitorId;
};

export const trackProductInterest = async ({
  productId,
  storeId,
  event = "view",
  source = "public",
  metadata = {},
}: TrackInterestPayload) => {
  if (!productId || typeof window === "undefined") return;

  const api = new Api();
  const visitorId = getOrCreateVisitorId();

  const payload = {
    product_id: productId,
    store_id: storeId ?? null,
    event,
    source,
    path: window.location.pathname,
    visitor_id: visitorId || null,
    metadata: {
      ...(metadata ?? {}),
      referrer: document.referrer || "",
    },
  };

  try {
    await api.request({
      method: "post",
      url: "request/product-interest",
      data: payload,
    });
  } catch (error) {
    // Telemetria de recomendação não pode quebrar fluxo principal.
  }
};

export const getAutomaticRecommendations = async ({
  productId,
  limit = 10,
  exclude = [],
}: RecommendationRequest) => {
  const api = new Api();
  const visitorId =
    typeof window !== "undefined" ? getOrCreateVisitorId() : undefined;

  try {
    const response: any = await api.request({
      method: "get",
      url: "request/product-recommendations",
      data: {
        product_id: productId,
        limit,
        exclude,
        visitor_id: visitorId,
      },
    });

    return response;
  } catch (error) {
    return {
      response: false,
      data: [],
      meta: null,
    };
  }
};

