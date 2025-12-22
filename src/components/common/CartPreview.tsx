import { useEffect, useState } from "react";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { Button } from "../ui/form";
import { GetCart, RemoveToCart } from "../pages/carrinho";
import Api from "@/src/services/api";
import CartItem from "./cart-preview/CartItem";
import CartSummary from "./cart-preview/CartSummary";

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

  /* -------------------- Effects -------------------- */

  useEffect(() => {
    loadCart();
  }, []);

  // Bloqueia scroll quando drawer aberto
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // Fecha com ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) onClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  /* -------------------- Data -------------------- */

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
      const productIds = cartData.map((item: any) => item.product);

      const response: any = await api.request({
        method: "get",
        url: "request/products",
        data: { whereIn: productIds },
      });

      const products = response?.data ?? [];

      const enrichedCart = cartData.map((item: any) => ({
        ...item,
        product: products.find((p: any) => p.id === item.product) || null,
      }));

      setCart(enrichedCart);
    } catch (err) {
      console.error("Erro ao carregar carrinho:", err);
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
    0
  );

  const totalDeliveryFee = cart.reduce((acc, item) => {
    const fee = Number(item?.details?.deliveryFee);
    return Number.isFinite(fee) && fee > 0 ? acc + fee : acc;
  }, 0);

  /* -------------------- Render -------------------- */

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/40 z-[100]" onClick={onClose} />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 h-full w-full max-w-[400px] bg-white z-[101]
        rounded-tl-2xl rounded-bl-2xl shadow-2xl border-l border-zinc-200 flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-zinc-200">
          <h4 className="font-bold text-zinc-900 text-lg">
            {loading
              ? "Carregando..."
              : cart.length === 0
              ? "Carrinho vazio"
              : `${totalItems} ${
                  totalItems === 1 ? "item" : "itens"
                } no carrinho`}
          </h4>

          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100"
          >
            <Icon icon="fa-times" className="text-zinc-600" />
          </button>
        </div>

        {/* Content */}
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
            {/* Items */}
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

            {/* Footer */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-200">
              <CartSummary
                cart={cart}
                totalValue={totalValue}
                totalDeliveryFee={totalDeliveryFee}
                isMobile={isMobile}
              />

              <Link href="/carrinho" onClick={onClose}>
                <Button className="w-full mt-2">Ver carrinho completo</Button>
              </Link>
            </div>
          </>
        )}
      </div>
    </>
  );
}
