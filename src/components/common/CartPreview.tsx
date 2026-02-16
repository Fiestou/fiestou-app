import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { Button } from "../ui/form";
import Api from "@/src/services/api";
import CartItem from "./cart-preview/CartItem";
import CartSummary from "./cart-preview/CartSummary";
import { moneyFormat } from "@/src/helper";
import {
  buildMinimumOrderSummary,
  extractCartProductIds,
  getCartFromCookies,
  hydrateCartProducts,
  removeCartAt,
} from "@/src/services/cart";

interface CartPreviewProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export interface CartPreviewHandle {
  requestClose: () => void;
}

const ANIMATION_MS = 320;
const ANIMATION_EASE = "cubic-bezier(0.16, 1, 0.3, 1)";

const CartPreview = forwardRef<CartPreviewHandle, CartPreviewProps>(
  function CartPreview({ isMobile = false, onClose }: CartPreviewProps, ref) {
  const [open, setOpen] = useState(false);
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const loadTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasRequestedLoad = useRef(false);

  const requestClose = useCallback(() => {
    if (!onClose) return;

    setOpen(false);
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => {
      onClose();
    }, ANIMATION_MS);
  }, [onClose]);

  useEffect(() => {
    return () => {
      if (loadTimer.current) clearTimeout(loadTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isMobile]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") requestClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [requestClose]);

  useEffect(() => {
    // anima entrada (depois do mount)
    let raf1 = 0;
    let raf2 = 0;

    raf1 = requestAnimationFrame(() => {
      // Double raf to make sure the "closed" classes paint before we transition in.
      raf2 = requestAnimationFrame(() => setOpen(true));
    });

    return () => {
      if (raf1) cancelAnimationFrame(raf1);
      if (raf2) cancelAnimationFrame(raf2);
    };
  }, []);

  useEffect(() => {
    // Defer cart hydration/fetch until after the open animation starts.
    // This avoids jank on mobile devices during the first frames.
    if (!open) return;
    if (hasRequestedLoad.current) return;
    hasRequestedLoad.current = true;

    setLoading(true);
    loadTimer.current = setTimeout(() => {
      loadTimer.current = null;
      loadCart();
    }, ANIMATION_MS);
  }, [open]);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  useImperativeHandle(ref, () => ({ requestClose }), [requestClose]);

  useEffect(() => {
    if (isMobile) return;

    const handleMouseDown = (e: MouseEvent) => {
      const target = e.target as Node | null;
      if (!target || !panelRef.current) return;
      if (panelRef.current.contains(target)) return;
      requestClose();
    };

    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isMobile, requestClose]);

  const loadCart = async () => {
    setLoading(true);

    const cartData = getCartFromCookies();

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
    removeCartAt(index);
    setCart((prev) => prev.filter((_, key) => key !== index));
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

  const transitionStyle = {
    transitionDuration: `${ANIMATION_MS}ms`,
    transitionTimingFunction: ANIMATION_EASE,
    transitionProperty: isMobile ? "transform" : "transform, opacity",
  } as const;

  return (
    <>
      {isMobile && (
        <div
          style={transitionStyle}
          className={`fixed inset-0 bg-black/40 z-40 transition-opacity ${
            open ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          onClick={requestClose}
        />
      )}

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        style={transitionStyle}
        className={`fixed bg-white flex flex-col z-50 transform-gpu transition-[transform,opacity] will-change-[transform,opacity] ${
          isMobile
            ? "inset-x-0 bottom-0 w-full max-h-[85svh] rounded-t-2xl shadow-xl"
            : "top-16 right-0 pt-2 w-96 h-[80vh] rounded-bl-2xl shadow-2xl"
        } ${
          open
            ? isMobile
              ? "translate-y-0"
              : "translate-x-0 opacity-100"
            : isMobile
              ? "translate-y-[100svh] pointer-events-none"
              : "translate-x-full opacity-0 pointer-events-none"
        }`}
      >
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
            onClick={requestClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100"
          >
            <Icon icon="fa-times" className="text-zinc-600" />
          </button>
        </div>

        {loading ? (
          <div className="p-4 space-y-3 animate-pulse">
            <div className="h-4 w-3/5 bg-zinc-200 rounded-md mx-auto" />
            <div className="h-16 bg-zinc-100 rounded-lg" />
            <div className="h-16 bg-zinc-100 rounded-lg" />
            <div className="h-20 bg-zinc-100 rounded-lg" />
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
});

export default CartPreview;
