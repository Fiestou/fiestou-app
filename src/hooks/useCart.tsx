import { useState } from "react";
import { ProductType } from "@/src/models/product";

export function useCart(product: ProductType) {
  const [productToCart, setProductToCart] = useState<any>({});
  const [inCart, setInCart] = useState(false);

  const sendToCart = () => {
    console.log("Enviando para o carrinho:", product);
  };

  const updateOrder = (item: any, attribute: any) => {
    console.log("Atualizando pedido:", item, attribute);
  };

  const handleQuantity = (n: number) => {
    setProductToCart((prev: any) => ({
      ...prev,
      quantity: Math.max(1, (prev?.quantity || 1) + n),
    }));
  };

  return { productToCart, inCart, sendToCart, updateOrder, handleQuantity };
}
