"use client";

import Icon from "@/src/icons/fontAwesome/FIcon";
import { ProductType } from "@/src/models/product";

interface ProductDimensionsProps {
  product: ProductType;
}

export default function ProductDimensions({ product }: ProductDimensionsProps) {
  const dimensions = [
    {
      key: "weight",
      label: "Peso",
      unit: "kg",
      icon: "fa-weight",
      value: product?.weight,
    },
    {
      key: "length",
      label: "Comp",
      unit: "cm",
      icon: "fa-ruler",
      value: product?.length,
    },
    {
      key: "width",
      label: "Larg",
      unit: "cm",
      icon: "fa-ruler-horizontal",
      value: product?.width,
    },
    {
      key: "height",
      label: "Alt",
      unit: "cm",
      icon: "fa-ruler-vertical",
      value: product?.height,
    },
  ].filter((dim) => !!dim.value);

  if (!dimensions.length) return null;

  return (
    <div className="border-t pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
      {dimensions.map((dim) => (
        <div
          key={dim.key}
          className="border flex flex-col rounded p-4 transition hover:shadow-sm hover:border-zinc-300"
        >
          <div className="text-xl text-zinc-900">
            <Icon icon={dim.icon} />
          </div>
          <div className="pt-4">
            {dim.label}:{" "}
            <span className="font-bold text-zinc-900">
              {dim.value}
              {dim.unit}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
