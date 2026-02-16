import {
  addToCart,
  getCartFromCookies,
  removeCartAt,
} from "@/src/services/cart";

export function GetCart() {
  return getCartFromCookies();
}

export function AddToCart(order: Object): boolean {
  try {
    return addToCart(order as any);
  } catch (error) {
    console.error("Erro ao adicionar ao carrinho:", error);
    return false;
  }
}

export function RemoveToCart(key: any) {
  const index = Number(key);
  if (!Number.isFinite(index)) return false;
  return removeCartAt(index);
}
