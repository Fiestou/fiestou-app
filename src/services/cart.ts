import Cookies from "js-cookie";
import { CartType } from "@/src/models/cart";
import { getImage, findDates } from "@/src/helper";
import Api from "@/src/services/api";

const CART_COOKIE_KEY = "fiestou.cart";
const CART_COOKIE_EXPIRY = 7;
const AUTH_TOKEN_KEY = "fiestou.authtoken";
const CART_CHANGE_EVENT = "fiestou:cart:change";
const CART_BROADCAST_KEY = "fiestou:cart:broadcast";

export type CartChangeReason =
  | "save"
  | "clear"
  | "add"
  | "remove"
  | "quantity"
  | "external";

export type CartChangeDetail = {
  cart: CartType[];
  reason: CartChangeReason;
  updatedAt: number;
};

function emitCartChange(cart: CartType[], reason: CartChangeReason): void {
  if (typeof window === "undefined") return;

  const detail: CartChangeDetail = {
    cart,
    reason,
    updatedAt: Date.now(),
  };

  window.dispatchEvent(
    new CustomEvent<CartChangeDetail>(CART_CHANGE_EVENT, { detail }),
  );

  try {
    window.localStorage.setItem(
      CART_BROADCAST_KEY,
      JSON.stringify({ updatedAt: detail.updatedAt, reason }),
    );
  } catch {
    // Ignora falhas de storage (private mode, quota, etc).
  }
}

export function subscribeToCartChanges(
  callback: (cart: CartType[], detail: CartChangeDetail) => void,
): () => void {
  if (typeof window === "undefined") return () => {};

  const handleEvent = (event: Event) => {
    const customEvent = event as CustomEvent<CartChangeDetail>;
    const detail = customEvent.detail;
    const nextCart = Array.isArray(detail?.cart) ? detail.cart : getCartFromCookies();

    callback(nextCart, {
      cart: nextCart,
      reason: detail?.reason ?? "external",
      updatedAt: detail?.updatedAt ?? Date.now(),
    });
  };

  const handleStorage = (event: StorageEvent) => {
    if (event.key !== CART_BROADCAST_KEY) return;
    const nextCart = getCartFromCookies();
    callback(nextCart, {
      cart: nextCart,
      reason: "external",
      updatedAt: Date.now(),
    });
  };

  window.addEventListener(CART_CHANGE_EVENT, handleEvent as EventListener);
  window.addEventListener("storage", handleStorage);

  return () => {
    window.removeEventListener(CART_CHANGE_EVENT, handleEvent as EventListener);
    window.removeEventListener("storage", handleStorage);
  };
}

function isUserLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!Cookies.get(AUTH_TOKEN_KEY);
}

function syncCartToApi(cart: CartType[]): void {
  if (!isUserLoggedIn()) return;
  const api = new Api();
  api.bridge({ method: "post", url: "cart", data: { items: cart } }).catch(() => {});
}

function clearCartFromApi(converted = false): void {
  if (!isUserLoggedIn()) return;
  const api = new Api();
  api.bridge({ method: "delete", url: "cart", data: { converted } }).catch(() => {});
}

export function markCartConverted(): void {
  clearCartFromApi(true);
}

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

export function getCartFromCookies(): CartType[] {
  if (typeof window === "undefined") return [];
  try {
    const cookie = Cookies.get(CART_COOKIE_KEY);
    const parsed = cookie ? JSON.parse(cookie) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function getCartCookieRaw(): string {
  if (typeof window === "undefined") return "";
  return Cookies.get(CART_COOKIE_KEY) ?? "";
}

export function saveCartToCookies(
  cart: CartType[],
  reason: CartChangeReason = "save",
): void {
  if (typeof window === "undefined") return;

  const optimizedCart = cart.map((item) => {
    const productId = typeof item.product === "object" ? item.product?.id : item.product;

    return {
      product: productId,
      attributes: item.attributes,
      quantity: item.quantity,
      details: item.details,
      total: item.total,
    };
  });

  if (!optimizedCart.length) {
    clearCartCookies();
    return;
  }

  const serialized = JSON.stringify(optimizedCart);
  Cookies.set(CART_COOKIE_KEY, serialized, { expires: CART_COOKIE_EXPIRY });

  syncCartToApi(optimizedCart);
  emitCartChange(optimizedCart, reason);
}

export function clearCartCookies(
  options: { syncApi?: boolean; reason?: CartChangeReason } = {},
): void {
  if (typeof window === "undefined") return;
  const { syncApi = true, reason = "clear" } = options;

  Cookies.remove(CART_COOKIE_KEY);

  if (syncApi) {
    clearCartFromApi();
  }

  emitCartChange([], reason);
}

export function setCart(cart: CartType[]): CartType[] {
  if (!Array.isArray(cart) || cart.length === 0) {
    clearCartCookies();
    return [];
  }

  saveCartToCookies(cart);
  return getCartFromCookies();
}

export function addToCart(item: CartType): boolean {
  try {
    const current = getCartFromCookies();
    const next = current.concat(item);
    saveCartToCookies(next, "add");
    return true;
  } catch {
    return false;
  }
}

export function removeCartAt(index: number): CartType[] {
  const current = getCartFromCookies();
  const next = removeCartItem(current, index);

  if (!next.length) {
    clearCartCookies();
    return [];
  }

  saveCartToCookies(next, "remove");
  return next;
}

export function setCartItemQuantity(index: number, quantity: number): CartType[] {
  const current = getCartFromCookies();
  const next = updateCartItemQuantity(current, index, quantity);

  if (!next.length) {
    clearCartCookies();
    return [];
  }

  saveCartToCookies(next, "quantity");
  return next;
}

export function collectDeliverySummary(items: CartType[]): DeliverySummary {
  const entriesMap = new Map<string, DeliverySummaryEntry>();
  const zipCodes = new Set<string>();
  let total = 0;

  items.forEach((item) => {
    const feeValue = Number(item?.details?.deliveryFee);
    if (!Number.isFinite(feeValue) || feeValue < 0) return;

    const storeData = item?.product?.store ?? {};
    const rawStoreId =
      item?.details?.deliveryStoreId ?? storeData?.id ?? storeData;
    const storeId = Number(rawStoreId);
    const hasNumericStoreId = Number.isFinite(storeId);
    const entryKey = hasNumericStoreId
      ? `store-${storeId}`
      : `item-${item?.product?.id ?? Math.random()}`;

    if (!entriesMap.has(entryKey)) {
      let storeLogoUrl: string | null = null;
      if (storeData?.profile && typeof storeData.profile === "object") {
        storeLogoUrl =
          getImage(storeData.profile, "thumb") ||
          getImage(storeData.profile, "sm") ||
          getImage(storeData.profile);
      }

      entriesMap.set(entryKey, {
        key: entryKey,
        price: feeValue,
        storeId: hasNumericStoreId ? storeId : null,
        storeName:
          storeData?.companyName ?? storeData?.title ?? "Loja parceira",
        storeSlug: storeData?.slug,
        storeLogoUrl,
      });
      total += feeValue;
    }

    const rawZip =
      item?.details?.deliveryZipCode ?? item?.details?.deliveryZipCodeFormatted;
    if (rawZip) {
      const sanitizedZip = rawZip.toString().replace(/\D/g, "");
      if (sanitizedZip.length >= 5) zipCodes.add(sanitizedZip);
    }
  });

  return {
    total,
    zipCodes: Array.from(zipCodes),
    entries: Array.from(entriesMap.values()),
  };
}

export function calculateCartResume(items: CartType[]): CartResume {
  const dates = items.map((item) => item.details?.dateStart);
  const subtotal = items.reduce(
    (acc, item) => acc + Number(item.total ?? 0),
    0,
  );
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

export type StoreMinimumSummary = {
  storeId: number;
  storeTitle: string;
  enabled: boolean;
  minimumValue: number;
  subtotal: number;
  missing: number;
};

export function buildMinimumOrderSummary(items: CartType[]): StoreMinimumSummary[] {
  const map = new Map<number, StoreMinimumSummary>();

  for (const item of items) {
    const store: any = item?.product?.store;
    if (!store?.id) continue;

    const enabled = !!store?.minimum_order?.enabled;
    const minimumValue = Number(store?.minimum_order?.value ?? 0);

    if (!map.has(store.id)) {
      map.set(store.id, {
        storeId: store.id,
        storeTitle: store.title ?? store.companyName ?? "Loja",
        enabled,
        minimumValue,
        subtotal: 0,
        missing: 0,
      });
    }

    const current = map.get(store.id)!;
    current.subtotal += Number(item.total ?? 0);
    current.enabled = current.enabled || enabled;
    current.minimumValue = Math.max(current.minimumValue, minimumValue);
  }

  return Array.from(map.values()).map((s) => {
    if (!s.enabled || s.minimumValue <= 0) return { ...s, missing: 0 };
    return { ...s, missing: Math.max(0, s.minimumValue - s.subtotal) };
  });
}

export function extractCartProductIds(items: any[]): number[] {
  return items
    .map((item: any) => {
      const prod = item?.product;
      return typeof prod === 'object' ? prod?.id : prod;
    })
    .filter((id: any) => id != null)
    .map(Number);
}

export function hydrateCartProducts(cartItems: any[], products: any[]): any[] {
  return cartItems.map((item: any) => {
    const productId = typeof item.product === 'object' ? item.product?.id : item.product;
    const fullProduct = products.find((p: any) => p.id == productId);
    return fullProduct ? { ...item, product: fullProduct } : item;
  });
}

export function extractDeliveryFees(items: CartType[]): { price: number; store_id: number }[] {
  const result = items
    .map((item) => {
      const fee = Number(item?.details?.deliveryFee);
      const storeSource =
        item?.details?.deliveryStoreId ??
        (typeof item?.product?.store === "object"
          ? (item?.product?.store as any)?.id
          : item?.product?.store);
      const storeId = Number(storeSource);

      if (!Number.isFinite(fee) || !Number.isFinite(storeId)) return null;
      return { price: fee, store_id: storeId };
    })
    .filter((item): item is { price: number; store_id: number } => !!item);

  return result;
}

export function normalizeDeliveryItems(
  items: { price: number; store_id: number }[],
): { price: number; store_id: number }[] {
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
  const item = items.find(
    (i) => i?.details?.deliveryZipCode || i?.details?.deliveryZipCodeFormatted,
  );
  if (!item) return "";
  const raw =
    item.details?.deliveryZipCode ??
    item.details?.deliveryZipCodeFormatted ??
    "";
  const sanitized = raw.toString().replace(/\D/g, "");
  return sanitized.length === 8 ? sanitized : "";
}

export function updateCartItemQuantity(
  cart: CartType[],
  index: number,
  quantity: number,
): CartType[] {
  if (quantity <= 0) return removeCartItem(cart, index);
  return cart.map((item, i) => (i === index ? { ...item, quantity } : item));
}

export interface CartStorage {
  get(): Promise<CartType[]>;
  set(cart: CartType[]): Promise<void>;
  clear(): Promise<void>;
}

export const cookieCartStorage: CartStorage = {
  async get() {
    return getCartFromCookies();
  },
  async set(cart) {
    saveCartToCookies(cart);
  },
  async clear() {
    clearCartCookies();
  },
};

export const createApiCartStorage = (api: Api): CartStorage => ({
  async get() {
    try {
      const res: any = await api.bridge({ method: "get", url: "cart" });
      return res?.data?.items ?? res?.data ?? [];
    } catch {
      return [];
    }
  },
  async set(cart) {
    await api.bridge({ method: "post", url: "cart", data: { items: cart } });
  },
  async clear() {
    await api.bridge({ method: "delete", url: "cart" });
  },
});

export const cartStorage = cookieCartStorage;
