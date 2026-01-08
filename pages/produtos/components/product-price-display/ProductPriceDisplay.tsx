"use client";

import { ProductType, getPrice, getPriceValue } from "@/src/models/product";

interface ProductPriceDisplayProps {
  product: ProductType;
}

export default function ProductPriceDisplay({
  product,
}: ProductPriceDisplayProps) {
  const price = getPrice(product);
  const priceValue = getPriceValue(product).price;

  const finalPrice =
    !!product?.schedulingTax && product?.schedulingTax > priceValue
      ? product?.schedulingTax
      : priceValue;

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
    <div className="w-fit md:text-right leading-tight md:pt-0">
      <div className="whitespace-nowrap">
        {price.priceFromFor && !!price.priceLow ? (
          <div className="text-sm">
            de
            <span className="line-through mx-1">
              R$ {formatMoney(price.priceHigh)}
            </span>
            por
          </div>
        ) : (
          <div className="text-sm">a partir de:</div>
        )}

        <h3 className="font-bold text-2xl lg:text-3xl text-zinc-800">
          R${formatMoney(finalPrice)}
        </h3>
      </div>
    </div>
  );
}
