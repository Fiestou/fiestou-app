import React from "react";
import { formatCurrency } from "@/src/components/utils/Currency";

interface ProductType {
  price?: number;
  priceSale?: number;
}

interface ProductPriceProps {
  data: ProductType;
  handleData: (updated: Partial<ProductType>) => void;
}

const ProductPrice: React.FC<ProductPriceProps> = ({ data, handleData }) => {
  const parseCurrency = (value: string) => {
    const numeric = parseFloat(value.replace(/\D/g, "")) / 100;
    return isNaN(numeric) ? 0 : numeric;
  };

  const hasSale = data?.priceSale && data.priceSale > 0;
  const discount = hasSale && data?.price
    ? Math.round((1 - (data.priceSale! / data.price)) * 100)
    : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Preço de venda/aluguel <span className="ml-1.5 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">obrigatório</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 font-medium">R$</span>
            <input
              onChange={(e) => handleData({ price: parseCurrency(e.target.value) })}
              value={formatCurrency(data?.price)}
              required
              type="text"
              placeholder="0,00"
              className="w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Preço promocional <span className="ml-1 text-[10px] font-normal text-zinc-400">opcional</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 font-medium">R$</span>
            <input
              onChange={(e) => handleData({ priceSale: parseCurrency(e.target.value) })}
              value={formatCurrency(data?.priceSale)}
              type="text"
              placeholder="0,00"
              className="w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
            />
          </div>
          {hasSale && discount > 0 && (
            <span className="text-xs text-emerald-600 mt-1 inline-block">
              {discount}% de desconto
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductPrice;
