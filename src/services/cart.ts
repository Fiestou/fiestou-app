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
    const parsed = cookie ? JSON.parse(cookie) : [];
    console.log('📂 Lendo carrinho do cookie:', parsed);
    return parsed;
  } catch {
    return [];
  }
}

export function saveCartToCookies(cart: CartType[]): void {
  if (typeof window === "undefined") return;
  
  // Otimiza o carrinho para reduzir o tamanho no cookie
  const optimizedCart = cart.map((item) => {
    // Remove campos desnecessários do produto para economizar espaço
    const optimizedProduct = item.product ? {
      id: item.product.id,
      title: item.product.title,
      slug: item.product.slug,
      price: item.product.price,
      priceSale: item.product.priceSale,
      // Mantém apenas a primeira imagem da galeria
      gallery: item.product.gallery?.length ? [item.product.gallery[0]] : [],
      // Store otimizado - apenas o essencial
      store: typeof item.product.store === 'object' ? {
        id: item.product.store.id,
        companyName: item.product.store.companyName,
        slug: item.product.store.slug,
        title: item.product.store.title,
      } : item.product.store,
      comercialType: item.product.comercialType,
      schedulingTax: item.product.schedulingTax,
      schedulingDiscount: item.product.schedulingDiscount,
      schedulingPeriod: item.product.schedulingPeriod,
    } : item.product;

    return {
      product: optimizedProduct,
      attributes: item.attributes,
      quantity: item.quantity,
      details: item.details,
      total: item.total,
    };
  });

  console.log('💾 Salvando carrinho otimizado no cookie');
  console.log('💾 Item[0] details:', JSON.stringify(optimizedCart[0]?.details, null, 2));
  console.log('💾 Item[1] details:', JSON.stringify(optimizedCart[1]?.details, null, 2));
  
  const serialized = JSON.stringify(optimizedCart);
  console.log(`💾 Tamanho do cookie: ${serialized.length} bytes`);
  
  Cookies.set(CART_COOKIE_KEY, serialized, { expires: CART_COOKIE_EXPIRY });
  
  // Verifica imediatamente o que foi salvo
  const verification = Cookies.get(CART_COOKIE_KEY);
  if (verification) {
    const parsed = JSON.parse(verification);
    console.log('✅ VERIFICAÇÃO - Cookie salvo com sucesso');
    console.log('✅ Item[0] details:', JSON.stringify(parsed[0]?.details, null, 2));
    console.log('✅ Item[1] details:', JSON.stringify(parsed[1]?.details, null, 2));
  } else {
    console.error('❌ ERRO: Cookie não foi salvo!');
  }
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
  console.log('🚚 extractDeliveryFees - items recebidos:', items);
  const result = items
    .map((item, index) => {
      const fee = Number(item?.details?.deliveryFee);
      const storeSource = item?.details?.deliveryStoreId ??
        (typeof item?.product?.store === "object" ? (item?.product?.store as any)?.id : item?.product?.store);
      const storeId = Number(storeSource);
      
      console.log(`🚚 extractDeliveryFees - item[${index}]:`, {
        productId: item?.product?.id,
        storeName: typeof item?.product?.store === 'object' ? item?.product?.store?.companyName : null,
        fee,
        storeId,
        hasValidFee: Number.isFinite(fee),
        hasValidStoreId: Number.isFinite(storeId),
        details: item?.details
      });
      
      if (!Number.isFinite(fee) || !Number.isFinite(storeId)) return null;
      return { price: fee, store_id: storeId };
    })
    .filter((item): item is { price: number; store_id: number } => !!item);
    
  console.log('🚚 extractDeliveryFees - fees extraídos:', result);

  return result;
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
