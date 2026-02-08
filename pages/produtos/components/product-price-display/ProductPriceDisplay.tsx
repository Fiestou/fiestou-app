"use client";

import { ProductType, getPrice, getPriceValue } from "@/src/models/product";
import { formatMoney } from "@/src/components/utils/Currency";

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
