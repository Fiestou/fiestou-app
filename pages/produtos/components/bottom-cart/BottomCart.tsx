"use client";

import { Button } from "@/src/components/ui/form";
import { useEffect } from "react";
import { useRouter } from "next/navigation"; // <‑ import do router

interface BottomCartProps {
  productToCart: { total: number } | null;
  inCart: boolean;
  isMobile: boolean;
  canAddToCart: boolean;
  disabled?: boolean;
}

export default function BottomCart({
  productToCart,
  inCart,
  isMobile,
  canAddToCart,
}: BottomCartProps) {
  const router = useRouter(); // <‑ hook do router

  // Ajusta padding do html quando mobile
  useEffect(() => {
    if (isMobile) {
      document.documentElement.style.paddingBottom = "6rem";
    } else {
      document.documentElement.style.paddingBottom = "0rem";
    }
    return () => {
      document.documentElement.style.paddingBottom = "0rem";
    };
  }, [isMobile]);

  if (productToCart?.total == null || isNaN(productToCart.total)) return null;

  const formatMoney = (value: any): string => {
    const num =
      typeof value === "string"
        ? parseFloat(value.replace(/\./g, "").replace(",", "."))
        : Number(value);
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  // Função simples para redirecionar
  const handleAddClick = () => {
    router.push("/produtos?openCart=1");
  };

  return (
    <div className="bg-white drop-shadow-2xl md:drop-shadow-none fixed z-[20] md:-mx-4 md:relative w-full md:w-auto left-0 bottom-0 flex justify-between">
      <div className="leading-tight self-center w-full px-4">
        <div className="text-sm text-zinc-900">Total:</div>
        <div className="font-bold text-zinc-900 text-lg whitespace-nowrap">
          R$ {formatMoney(productToCart.total)}
        </div>
      </div>

      <div className="text-center p-4">
        {!inCart ? (
          <Button
            type="submit"
            disabled={!canAddToCart}
            className={
              canAddToCart
                ? "bg-yellow-400 hover:bg-yellow-500 cursor-pointer"
                : "bg-zinc-300 text-zinc-600 cursor-not-allowed pointer-events-none"
            }
          >
            Adicionar
          </Button>
        ) : (
          <Button href="/carrinho" className="whitespace-nowrap">
            Acessar carrinho
          </Button>
        )}
      </div>
    </div>
  );
}
