"use client";

import { Button } from "@/src/components/ui/form";
import { useEffect } from "react";

interface BottomCartProps {
  productToCart: { total: number } | null;
  inCart: boolean;
  isMobile: boolean;
}

export default function BottomCart({
  productToCart,
  inCart,
  isMobile,
}: BottomCartProps) {
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
          <Button type="submit">Adicionar</Button>
        ) : (
          <Button href="/carrinho" className="whitespace-nowrap">
            Acessar carrinho
          </Button>
        )}
      </div>
    </div>
  );
}
