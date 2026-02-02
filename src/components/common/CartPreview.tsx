import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { Button } from "../ui/form";
import { GetCart, RemoveToCart } from "../pages/carrinho";
import Api from "@/src/services/api";
import CartItem from "./cart-preview/CartItem";
import CartSummary from "./cart-preview/CartSummary";
import { moneyFormat } from "@/src/helper";
import {
  buildMinimumOrderSummary,
  extractCartProductIds,
  hydrateCartProducts,
} from "@/src/services/cart";

interface CartPreviewProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function CartPreview({
  isMobile = false,
  onClose,
}: CartPreviewProps) {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const loadCart = async () => {
    setLoading(true);

    const cartData = GetCart();

    if (!cartData.length) {
      setCart([]);
      setLoading(false);
      return;
    }

    try {
      const api = new Api();
      const productIds = extractCartProductIds(cartData);

      const response: any = await api.request({
        method: "get",
        url: "request/products",
        data: { whereIn: productIds },
      });

      const products = response?.data ?? [];
      setCart(hydrateCartProducts(cartData, products));
    } catch {
      setCart(cartData);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = (index: number) => {
    RemoveToCart(index);
    loadCart();
  };

  const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);

  const totalValue = cart.reduce(
    (acc, item) => acc + (Number(item.total) || 0),
    0,
  );

  const totalDeliveryFee = cart.reduce((acc, item) => {
    const fee = Number(item?.details?.deliveryFee);
    return Number.isFinite(fee) && fee > 0 ? acc + fee : acc;
  }, 0);

  const minimumOrderSummary = useMemo(() => {
    return buildMinimumOrderSummary(cart);
  }, [cart]);

  const hasMinimumPending = minimumOrderSummary.some(
    (s) => s.enabled && s.minimumValue > 0 && s.missing > 0,
  );

  return (
    <>
      <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      <div className="fixed top-16 right-0 pt-2 w-96 h-[80vh] bg-white flex flex-col shadow-lg z-50 rounded-bl-2xl">
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <h4 className="font-bold text-zinc-900 text-lg">
            {loading
              ? "Carregando..."
              : cart.length === 0
                ? "Carrinho vazio"
                : `${totalItems} ${totalItems === 1 ? "item" : "itens"} no carrinho `}
            <Icon
              icon="fa-shopping-cart"
              className="text-base lg:text-lg mr-2"
            />
          </h4>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100"
          >
            <Icon icon="fa-times" className="text-zinc-600" />
          </button>
        </div>

        {loading ? (
          <div>
            <p className="text-zinc-500 text-center py-8">Carregando...</p>
          </div>
        ) : cart.length === 0 ? (
          <div>
            <p className="text-zinc-500 text-center py-8">Carrinho vazio!</p>
            <div className="w-3/4 flex text-center items-center justify-center mx-auto">
              <Link href="/produtos" onClick={onClose}>
                <Button className="w-full mt-2">Ver produtos</Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto">
              {cart.map((item: any, index: number) => (
                <CartItem
                  key={index}
                  item={item}
                  index={index}
                  onRemove={handleRemove}
                  size={isMobile ? "small" : "medium"}
                />
              ))}
            </div>
            <div className="p-4 bg-zinc-50 border-t border-zinc-200 rounded-bl-[10px]">
              {minimumOrderSummary.length > 0 && (
                <div className="mb-3 p-3 rounded-lg border bg-white">
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-zinc-900 text-sm">
                      Pedido mínimo
                    </p>
                  </div>

                  <div className="mt-2 grid gap-2">
                    {minimumOrderSummary.map((s) => {
                      if (!s.enabled || s.minimumValue <= 0) {
                        return (
                          <div
                            key={s.storeId}
                            className="text-xs text-zinc-600"
                          >
                            <span className="font-semibold text-zinc-900">
                              {s.storeTitle}
                            </span>
                            : sem pedido mínimo
                          </div>
                        );
                      }

                      const ok = s.missing === 0;

                      return (
                        <div key={s.storeId} className="text-xs">
                          <div className="flex justify-between gap-3">
                            <span className="font-semibold text-zinc-900">
                              {s.storeTitle}
                            </span>
                            <span className="text-zinc-600 whitespace-nowrap">
                              Mín: R$ {moneyFormat(s.minimumValue)}
                            </span>
                          </div>

                          <div className="flex justify-between gap-3 mt-1">
                            <span className="text-zinc-600">
                              Subtotal: R$ {moneyFormat(s.subtotal)}
                            </span>

                            {ok ? (
                              <span className="font-bold text-green-600">
                                Atingido
                              </span>
                            ) : (
                              <span className="font-bold text-amber-600">
                                Falta R$ {moneyFormat(s.missing)}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {hasMinimumPending && (
                    <p className="mt-2 text-[11px] text-zinc-500">
                      Alguns itens ainda não atingiram o mínimo da loja.
                    </p>
                  )}
                </div>
              )}

              <CartSummary
                cart={cart}
                totalValue={totalValue}
                totalDeliveryFee={totalDeliveryFee}
                isMobile={isMobile}
              />

              <Link href="/carrinho" onClick={onClose}>
                <Button className="w-full mt-2">
                  <Icon
                    icon="fa-shopping-cart"
                    className="text-base lg:text-lg mr-2"
                  />
                  Ver carrinho completo
                </Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
