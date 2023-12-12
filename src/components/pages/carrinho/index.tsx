import Cookies from "js-cookie";

const expires = { expires: 7 };

export function AddToCart(order: Object) {
  if (!Cookies.get("fiestou.cart")) {
    Cookies.set("fiestou.cart", JSON.stringify([]), expires);
  }

  let cookie: any = Cookies.get("fiestou.cart");
  let cart: any = JSON.parse(cookie);

  cart.push(order);

  if (Cookies.set("fiestou.cart", JSON.stringify(cart), expires)) {
    return cart;
  }

  return false;
}

export function removeToCart(key: any) {
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
