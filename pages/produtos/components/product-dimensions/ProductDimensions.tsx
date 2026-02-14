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
    <div className="border rounded-lg p-3">
      <div className="grid grid-cols-2 gap-2 text-sm">
        {dimensions.map((dim) => (
          <div key={dim.key} className="flex items-center gap-2">
            <Icon icon={dim.icon} className="text-cyan-600 text-xs flex-shrink-0" />
            <span className="text-zinc-600">
              {dim.label}: <span className="font-medium text-zinc-900">{dim.value}{dim.unit}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
