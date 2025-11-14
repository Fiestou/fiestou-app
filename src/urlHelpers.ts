import { ProductType } from "./models/product";
import { StoreType } from "./models/store";

export function slugify(text: string): string {
  if (!text) return "";

  return text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/--+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

// Formato: /produtos/{store-slug}/{product-slug}-{id}
export function getProductUrl(product: ProductType, store?: StoreType): string {
  if (!product || !product.id) {
    console.warn("getProductUrl: produto inválido", product);
    return "/produtos";
  }

  const storeData = store || product.store;
  const storeSlug = (typeof storeData === 'object' && storeData?.slug) ? storeData.slug : "loja";
  const productSlug = product.slug || slugify(product.title || "produto");

  return `/produtos/${storeSlug}/${productSlug}-${product.id}`;
}

// Formato: /{store-slug}-{id}
export function getStoreUrl(store: StoreType): string {
  if (!store || !store.id) {
    console.warn("getStoreUrl: loja inválida", store);
    return "/";
  }

  const storeSlug = store.slug || slugify(store.title || "loja");
  return `/${storeSlug}-${store.id}`;
}

export function extractIdFromSlug(slug: string): number | null {
  if (!slug) return null;

  const match = slug.match(/-(\d+)$/);
  return match ? parseInt(match[1], 10) : null;
}

// So por questão de segurança vou manter isso 
export function getProductUrlLegacy(productId: number | string): string {
  return `/produtos/${productId}`;
}

export function getStoreUrlLegacy(storeSlug: string): string {
  return `/${storeSlug}`;
}
