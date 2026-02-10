import React from "react";
import { justNumber } from "@/src/helper";
import { ProductType } from "@/src/models/product";

interface ProductStockProps {
  data: ProductType;
  handleData: (updated: Partial<ProductType>) => void;
}

const ProductStock: React.FC<ProductStockProps> = ({ data, handleData }) => {
  const handleSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value.length > 9) value = value.slice(0, 9);
    handleData({ sku: value });
  };

  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = Number(e.target.value);
    if (isNaN(value)) value = 1;
    if (value > 31) value = 31;
    if (value < 1) value = 1;
    handleData({ availability: value });
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = Number(justNumber(e.target.value));
    if (isNaN(value)) value = 0;
    if (value > 9999) value = 9999;
    if (value < 0) value = 0;
    handleData({ quantity: value });
  };

  const isManaged = !data?.quantityType || data?.quantityType === "manage";

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            SKU <span className="text-xs text-zinc-400 font-normal">(código interno)</span> <span className="ml-1 text-[10px] font-normal text-zinc-400">opcional</span>
          </label>
          <input
            onChange={handleSkuChange}
            value={data?.sku ?? ""}
            type="text"
            placeholder="Ex: 001234"
            className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
            maxLength={9}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Disponibilidade <span className="text-xs text-zinc-400 font-normal">(dias de antecedência)</span> <span className="ml-1 text-[10px] font-normal text-zinc-400">opcional</span>
          </label>
          <div className="relative">
            <input
              onChange={handleAvailabilityChange}
              value={data?.availability ?? 1}
              min={1}
              max={31}
              type="number"
              placeholder="1"
              className="w-full px-3 py-2.5 pr-12 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">dias</span>
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Controle de estoque <span className="ml-1.5 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">obrigatório</span></label>
        <div className="grid sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleData({ quantityType: "manage" })}
            className={`px-4 py-3 rounded-lg border text-sm text-left transition-all ${
              isManaged
                ? "border-yellow-400 bg-yellow-50 text-zinc-900"
                : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
            }`}
          >
            <div className="font-medium">Gerenciar estoque</div>
            <div className="text-xs text-zinc-400 mt-0.5">Definir quantidade manualmente</div>
          </button>
          <button
            type="button"
            onClick={() => handleData({ quantityType: "ondemand" })}
            className={`px-4 py-3 rounded-lg border text-sm text-left transition-all ${
              data?.quantityType === "ondemand"
                ? "border-yellow-400 bg-yellow-50 text-zinc-900"
                : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
            }`}
          >
            <div className="font-medium">Sob demanda</div>
            <div className="text-xs text-zinc-400 mt-0.5">Sempre disponível</div>
          </button>
        </div>
      </div>

      {isManaged && (
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">
            Quantidade em estoque <span className="ml-1.5 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">obrigatório</span>
          </label>
          <input
            onChange={handleQuantityChange}
            value={data?.quantity ?? ""}
            min={0}
            max={9999}
            type="number"
            placeholder="0"
            required
            className="w-full sm:w-48 px-3 py-2.5 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
          />
        </div>
      )}
    </div>
  );
};

export default ProductStock;
