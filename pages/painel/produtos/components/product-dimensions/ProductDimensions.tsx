import React from "react";
import { decimalNumber } from "@/src/helper";

interface ProductType {
  weight?: number | string;
  length?: number | string;
  width?: number | string;
  height?: number | string;
}

interface ProductDimensionsProps {
  data: ProductType;
  handleData: (updated: Partial<ProductType>) => void;
}

function DimensionInput({
  label,
  value,
  unit,
  placeholder,
  onChange,
}: {
  label: string;
  value: any;
  unit: string;
  placeholder: string;
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1.5">{label} <span className="ml-1 text-[10px] font-normal text-zinc-400">opcional</span></label>
      <div className="relative">
        <input
          type="text"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 pr-10 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400 font-medium">
          {unit}
        </span>
      </div>
    </div>
  );
}

const ProductDimensions: React.FC<ProductDimensionsProps> = ({
  data,
  handleData,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <DimensionInput
        label="Peso"
        value={data?.weight}
        unit="kg"
        placeholder="0.00"
        onChange={(v) => handleData({ weight: v })}
      />
      <DimensionInput
        label="Comprimento"
        value={data?.length}
        unit="cm"
        placeholder="0.00"
        onChange={(v) => handleData({ length: decimalNumber(v) })}
      />
      <DimensionInput
        label="Largura"
        value={data?.width}
        unit="cm"
        placeholder="0.00"
        onChange={(v) => handleData({ width: decimalNumber(v) })}
      />
      <DimensionInput
        label="Altura"
        value={data?.height}
        unit="cm"
        placeholder="0.00"
        onChange={(v) => handleData({ height: decimalNumber(v) })}
      />
    </div>
  );
};

export default ProductDimensions;
