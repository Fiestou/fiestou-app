import Cookies from "js-cookie";
import { CartType } from "@/src/models/cart";
import { getImage, findDates } from "@/src/helper";
import Api from "@/src/services/api";

const CART_COOKIE_KEY = "fiestou.cart";
const CART_COOKIE_EXPIRY = 7;

// Tipos
export type DeliverySummaryEntry = {
  key: string;
  price: number;
  storeId: number | null;
  storeName: string;
  storeSlug?: string;
  storeLogoUrl?: string | null;
};

export type DeliverySummary = {
  total: number;
  zipCodes: string[];
  entries: DeliverySummaryEntry[];
};

export type CartResume = {
  subtotal: number;
  total: number;
  delivery: number;
  deliveryZipCodes: string[];
  deliveryEntries: DeliverySummaryEntry[];
  startDate: Date | null;
  endDate: Date | null;
};

// Operações de cookie
export function getCartFromCookies(): CartType[] {
  if (typeof window === "undefined") return [];
  try {
    const cookie = Cookies.get(CART_COOKIE_KEY);
    return cookie ? JSON.parse(cookie) : [];
  } catch {
    return [];
  }
}

export function saveCartToCookies(cart: CartType[]): void {
  if (typeof window === "undefined") return;
  Cookies.set(CART_COOKIE_KEY, JSON.stringify(cart), { expires: CART_COOKIE_EXPIRY });
}

export function clearCartCookies(): void {
  if (typeof window === "undefined") return;
  Cookies.remove(CART_COOKIE_KEY);
}

// Agrupa fretes por loja
export function collectDeliverySummary(items: CartType[]): DeliverySummary {
  const entriesMap = new Map<string, DeliverySummaryEntry>();
  const zipCodes = new Set<string>();
  let total = 0;

  items.forEach((item) => {
    const feeValue = Number(item?.details?.deliveryFee);
    if (!Number.isFinite(feeValue) || feeValue < 0) return;

    const storeData = item?.product?.store ?? {};
    const rawStoreId = item?.details?.deliveryStoreId ?? storeData?.id ?? storeData;
    const storeId = Number(rawStoreId);
    const hasNumericStoreId = Number.isFinite(storeId);
    const entryKey = hasNumericStoreId ? `store-${storeId}` : `item-${item?.product?.id ?? Math.random()}`;

    if (!entriesMap.has(entryKey)) {
      let storeLogoUrl: string | null = null;
      if (storeData?.profile && typeof storeData.profile === "object") {
        storeLogoUrl = getImage(storeData.profile, "thumb") || getImage(storeData.profile, "sm") || getImage(storeData.profile);
      }

      entriesMap.set(entryKey, {
        key: entryKey,
        price: feeValue,
        storeId: hasNumericStoreId ? storeId : null,
        storeName: storeData?.companyName ?? storeData?.title ?? "Loja parceira",
        storeSlug: storeData?.slug,
        storeLogoUrl,
      });
      total += feeValue;
    }

    const rawZip = item?.details?.deliveryZipCode ?? item?.details?.deliveryZipCodeFormatted;
    if (rawZip) {
      const sanitizedZip = rawZip.toString().replace(/\D/g, "");
      if (sanitizedZip.length >= 5) zipCodes.add(sanitizedZip);
    }
  });

  return { total, zipCodes: Array.from(zipCodes), entries: Array.from(entriesMap.values()) };
}

export function calculateCartResume(items: CartType[]): CartResume {
  const dates = items.map((item) => item.details?.dateStart);
  const subtotal = items.reduce((acc, item) => acc + Number(item.total ?? 0), 0);
  const delivery = collectDeliverySummary(items);
  const dateRange = findDates(dates);

  return {
    subtotal,
    total: subtotal + delivery.total,
    delivery: delivery.total,
    deliveryZipCodes: delivery.zipCodes,
    deliveryEntries: delivery.entries,
    startDate: dateRange.minDate,
    endDate: dateRange.maxDate,
  };
}

export function calculateAddonsTotal(items: CartType[]): number {
  let total = 0;
  items.forEach((item: any) => {
    if (item.attributes && Array.isArray(item.attributes)) {
      item.attributes.forEach((attr: any) => {
        (attr.variations || []).forEach((v: any) => {
          if (v.quantity > 0 && v.price) {
            total += Number(v.price) * (v.quantity || 1) * (item.quantity || 1);
          }
        });
      });
    }
  });
  return total;
}

export function removeCartItem(cart: CartType[], index: number): CartType[] {
  return cart.filter((_, i) => i !== index);
}

export function extractDeliveryFees(items: CartType[]): { price: number; store_id: number }[] {
  return items
    .map((item) => {
      const fee = Number(item?.details?.deliveryFee);
      const storeSource = item?.details?.deliveryStoreId ??
        (typeof item?.product?.store === "object" ? (item?.product?.store as any)?.id : item?.product?.store);
      const storeId = Number(storeSource);
      if (!Number.isFinite(fee) || !Number.isFinite(storeId)) return null;
      return { price: fee, store_id: storeId };
    })
    .filter((item): item is { price: number; store_id: number } => !!item);
}

export function normalizeDeliveryItems(items: { price: number; store_id: number }[]): { price: number; store_id: number }[] {
  const map = new Map<number, { price: number; store_id: number }>();
  items.forEach((item) => {
    const storeId = Number(item?.store_id);
    const price = Number(item?.price);
    if (Number.isFinite(storeId) && Number.isFinite(price)) {
      map.set(storeId, { price, store_id: storeId });
    }
  });
  return Array.from(map.values());
}

export function extractCartDeliveryZip(items: CartType[]): string {
  const item = items.find((i) => i?.details?.deliveryZipCode || i?.details?.deliveryZipCodeFormatted);
  if (!item) return "";
  const raw = item.details?.deliveryZipCode ?? item.details?.deliveryZipCodeFormatted ?? "";
  const sanitized = raw.toString().replace(/\D/g, "");
  return sanitized.length === 8 ? sanitized : "";
}

export function updateCartItemQuantity(cart: CartType[], index: number, quantity: number): CartType[] {
  if (quantity <= 0) return removeCartItem(cart, index);
  return cart.map((item, i) => (i === index ? { ...item, quantity } : item));
}

// Abstração de storage para futura migração cookie -> banco
export interface CartStorage {
  get(): Promise<CartType[]>;
  set(cart: CartType[]): Promise<void>;
  clear(): Promise<void>;
}

export const cookieCartStorage: CartStorage = {
  async get() { return getCartFromCookies(); },
  async set(cart) { saveCartToCookies(cart); },
  async clear() { clearCartCookies(); },
};

export const createApiCartStorage = (api: Api): CartStorage => ({
  async get() {
    try {
      const res: any = await api.bridge({ method: "get", url: "cart" });
      return res?.data?.items ?? res?.data ?? [];
    } catch { return []; }
  },
  async set(cart) {
    await api.bridge({ method: "post", url: "cart", data: { items: cart } });
  },
  async clear() {
    await api.bridge({ method: "delete", url: "cart" });
  },
});

// Para migrar para BD: trocar por createApiCartStorage(new Api())
export const cartStorage = cookieCartStorage;
