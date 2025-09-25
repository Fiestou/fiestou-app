"use client";

import React from "react";
import { Label } from "@/src/components/ui/form"; // ajuste o caminho se necessário
import { realMoneyNumber } from "@/src/helper"; // ajuste o caminho conforme onde essa função está

interface ProductType {
  price?: number | string;
  priceSale?: number | string;
}

interface ProductPriceProps {
  data: ProductType;
  handleData: (updated: Partial<ProductType>) => void;
}

export const ProductPrice: React.FC<ProductPriceProps> = ({ data, handleData }) => {
  return (
    <div className="border-t pt-4 pb-2">
      <h4 className="text-2xl text-zinc-900 mb-2">Preço</h4>

      <div className="grid gap-2">
        <div className="grid gap-2 grid-cols-2">
          
          {/* Preço de venda/aluguel */}
          <div className="form-group">
            <Label>Preço de venda/aluguel</Label>
            <input
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleData({ price: realMoneyNumber(e.target.value) })
              }
              value={
                data?.price ? realMoneyNumber(data?.price) : ""
              }
              required
              type="text"
              className="form-control"
              name="preco_venda"
              placeholder="0.00"
            />
          </div>

          {/* Preço promocional */}
          <div className="form-group">
            <Label>Preço promocional</Label>
            <input
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleData({ priceSale: realMoneyNumber(e.target.value) })
              }
              value={
                data?.priceSale ? realMoneyNumber(data?.priceSale) : ""
              }
              type="text"
              className="form-control"
              name="preco_promo"
              placeholder="0.00"
            />
          </div>

        </div>
      </div>
    </div>
  );
};
