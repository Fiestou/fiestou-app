import { useEffect, useState } from "react";
import { Button } from "../ui/form";
import Link from "next/link";
import { GetCart, RemoveToCart } from "../pages/carrinho";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Api from "@/src/services/api";
import CartItem from "./cart-preview/CartItem";
import CartSummary from "./cart-preview/CartSummary";

interface CartPreviewProps {
  isMobile?: boolean;
  onClose?: () => void;
}

export default function CartPreview({ isMobile = false, onClose }: CartPreviewProps) {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCart();
  }, []);

  // Bloqueia scroll do body no mobile quando modal está aberto
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "auto";
      };
    }
  }, [isMobile]);

  // Fecha com tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const loadCart = async () => {
    setLoading(true);
    const cartData = GetCart();

    if (cartData.length === 0) {
      setCart([]);
      setLoading(false);
      return;
    }

    try {
      const api = new Api();
      const productIds = cartData.map((item: any) => item.product);

      const request: any = await api.request({
        method: "get",
        url: "request/products",
        data: {
          whereIn: productIds,
        },
      });

      const products = request?.data ?? [];

      const enrichedCart = cartData.map((item: any) => {
        const product = products.find((p: any) => p.id === item.product);
        return {
          ...item,
          product: product || null,
        };
      });

      setCart(enrichedCart);
    } catch (error) {
      console.error("Erro ao carregar produtos do carrinho:", error);
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
  const totalValue = cart.reduce((acc, item) => acc + (Number(item.total) || 0), 0);

  const totalDeliveryFee = cart.reduce((acc, item) => {
    const feeValue = Number(item?.details?.deliveryFee);
    if (Number.isFinite(feeValue) && feeValue > 0) {
      return acc + feeValue;
    }
    return acc;
  }, 0);

  // Mobile: Modal fullscreen
  if (isMobile) {
    return (
      <>
        <div
          className="fixed inset-0 bg-black/50 z-[100]"
          onClick={onClose}
        />

        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[101] max-h-[80vh] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-200">
            <h4 className="font-bold text-zinc-900 text-lg">
              {loading ? "Carregando..." : cart.length === 0 ? "Carrinho vazio" : `${totalItems} ${totalItems === 1 ? "item" : "itens"} no carrinho`}
            </h4>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100"
            >
              <Icon icon="fa-times" className="text-zinc-600" />
            </button>
          </div>

          {loading ? (
            <p className="text-zinc-500 text-center py-8">Carregando...</p>
          ) : cart.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">Carrinho vazio</p>
          ) : (
            <>
              {/* Lista de produtos */}
              <div className="flex-1 overflow-y-auto">
                {cart.map((item: any, index: number) => (
                  <CartItem
                    key={index}
                    item={item}
                    index={index}
                    onRemove={handleRemove}
                    size="small"
                  />
                ))}
              </div>

              {/* Footer */}
              <div className="p-4 bg-zinc-50 border-t border-zinc-200">
                <CartSummary
                  cart={cart}
                  totalValue={totalValue}
                  totalDeliveryFee={totalDeliveryFee}
                  isMobile={true}
                />

                <Link href="/carrinho" onClick={onClose}>
                  <Button className="w-full">Ver carrinho completo</Button>
                </Link>
              </div>
            </>
          )}
        </div>
      </>
    );
  }

  // Desktop: Dropdown
  if (loading) {
    return (
      <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-zinc-200 p-4 z-50">
        <p className="text-zinc-500 text-center py-8">Carregando...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-zinc-200 p-4 z-50">
        <p className="text-zinc-500 text-center py-8">Carrinho vazio</p>
      </div>
    );
  }

  return (
    <div className="absolute top-full right-0 pt-2 w-96 z-50">
      <div className="bg-white rounded-lg shadow-xl border border-zinc-200 overflow-hidden">
        <div className="p-4 border-b border-zinc-200">
          <h4 className="font-bold text-zinc-900">
            {totalItems} {totalItems === 1 ? "item" : "itens"} no carrinho
          </h4>
        </div>

        <div className="max-h-96 overflow-y-auto">
          {cart.slice(0, 3).map((item: any, index: number) => (
            <CartItem
              key={index}
              item={item}
              index={index}
              onRemove={handleRemove}
              size="medium"
            />
          ))}

          {cart.length > 3 && (
            <div className="p-3 text-center text-sm text-zinc-500">
              + {cart.length - 3} {cart.length - 3 === 1 ? "outro item" : "outros itens"}
            </div>
          )}
        </div>

        <div className="p-4 bg-zinc-50 border-t border-zinc-200">
          <CartSummary
            cart={cart}
            totalValue={totalValue}
            totalDeliveryFee={totalDeliveryFee}
          />

          <Link href="/carrinho">
            <Button className="w-full">Ver carrinho completo</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
