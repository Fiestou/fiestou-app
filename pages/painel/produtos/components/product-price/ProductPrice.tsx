"use client";

import React from "react";
import { Label } from "@/src/components/ui/form";

interface ProductType {
  price?: number;
  priceSale?: number;
}

interface ProductPriceProps {
  data: ProductType;
  handleData: (updated: Partial<ProductType>) => void;
}

export const ProductPrice: React.FC<ProductPriceProps> = ({ data, handleData }) => {
  const formatCurrency = (value?: number) => {
    if (value == null || isNaN(value)) return "";
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const parseCurrency = (value: string) => {
    const numeric = parseFloat(value.replace(/\D/g, "")) / 100;
    return isNaN(numeric) ? 0 : numeric;
  };

  return (
    <div className="border-t pt-4 pb-2">
      <h4 className="text-2xl text-zinc-900 mb-2">Preço</h4>

      <div className="grid gap-2 grid-cols-2">
        {/* Preço de venda/aluguel */}
        <div className="form-group">
          <Label>Preço de venda/aluguel</Label>
          <input
            onChange={(e) => handleData({ price: parseCurrency(e.target.value) })}
            value={formatCurrency(data?.price)}
            required
            type="text"
            className="form-control"
            name="preco_venda"
            placeholder="R$ 0,00"
          />
        </div>

        {/* Preço promocional */}
        <div className="form-group">
          <Label>Preço promocional</Label>
          <input
            onChange={(e) => handleData({ priceSale: parseCurrency(e.target.value) })}
            value={formatCurrency(data?.priceSale)}
            type="text"
            className="form-control"
            name="preco_promo"
            placeholder="R$ 0,00"
          />
        </div>
      </div>
    </div>
  );
};
