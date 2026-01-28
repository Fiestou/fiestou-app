import Cookies from "js-cookie";

const expires = { expires: 7 };

export function GetCart() {
  if (!!Cookies.get("fiestou.cart")) {
    let cookie: any = Cookies.get("fiestou.cart");
    let cart: any = JSON.parse(cookie);

    return cart;
  }

  return [];
}

export function AddToCart(order: Object): boolean {
  try {
    if (!Cookies.get("fiestou.cart")) {
      Cookies.set("fiestou.cart", JSON.stringify([]), expires);
    }

    const cookie = Cookies.get("fiestou.cart");
    const cart = cookie ? JSON.parse(cookie) : [];

    cart.push(order);

    Cookies.set("fiestou.cart", JSON.stringify(cart), expires);

    return true;
  } catch (error) {
    console.error("Erro ao adicionar ao carrinho:", error);
    return false;
  }
}

export function RemoveToCart(key: any) {
  if (!Cookies.get("fiestou.cart")) {
    Cookies.set("fiestou.cart", JSON.stringify([]), expires);
  }

  let cookie = Cookies.get("fiestou.cart") ?? JSON.stringify([]);
  let cart = JSON.parse(cookie);

  cart = cart.filter((item: any, index: number) => index != key);

  if (Cookies.set("fiestou.cart", JSON.stringify(cart), expires)) {
    return cart;
  }

  return false;
}
