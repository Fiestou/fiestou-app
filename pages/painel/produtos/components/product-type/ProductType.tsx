import React from "react";
import { Clock, Tag, UtensilsCrossed, Briefcase } from "lucide-react";

interface ProductType {
  comercialType?: string;
  schedulingPeriod?: number | null;
  schedulingDiscount?: number | null;
}

interface ProductCommercialTypeProps {
  data?: ProductType;
  handleData?: (updated: Partial<ProductType>) => void;
}

const commercialTypes = [
  {
    value: "aluguel",
    label: "Aluguel",
    desc: "Produto alugado por periodo",
    icon: Clock,
    color: "blue",
  },
  {
    value: "venda",
    label: "Venda",
    desc: "Produto vendido definitivamente",
    icon: Tag,
    color: "emerald",
  },
  {
    value: "comestivel",
    label: "Comestivel",
    desc: "Alimentos e bebidas",
    icon: UtensilsCrossed,
    color: "amber",
  },
  {
    value: "servicos",
    label: "Servicos",
    desc: "Prestacao de servico",
    icon: Briefcase,
    color: "purple",
  },
];

const schedulingPeriodOptions = [
  { value: 1, name: "Por dia" },
  { value: 2, name: "Por noite" },
  { value: 3, name: "Por hora" },
];

const colorMap: Record<string, { border: string; bg: string }> = {
  blue: { border: "border-blue-400", bg: "bg-blue-50" },
  emerald: { border: "border-emerald-400", bg: "bg-emerald-50" },
  amber: { border: "border-amber-400", bg: "bg-amber-50" },
  purple: { border: "border-purple-400", bg: "bg-purple-50" },
};

const showScheduling = (type?: string) => type === "aluguel" || type === "servicos";

const ProductCommercialType: React.FC<ProductCommercialTypeProps> = ({
  data = {},
  handleData = () => {},
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          Tipo comercial <span className="ml-1.5 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">obrigatório</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {commercialTypes.map((t) => {
            const selected = data?.comercialType === t.value;
            const c = colorMap[t.color];
            const Icon = t.icon;
            return (
              <button
                key={t.value}
                type="button"
                onClick={() => {
                  const updates: Partial<ProductType> = { comercialType: t.value };
                  if (!showScheduling(t.value)) {
                    updates.schedulingPeriod = null;
                    updates.schedulingDiscount = null;
                  }
                  handleData(updates);
                }}
                className={`px-3 py-3 rounded-lg border text-sm text-left transition-all ${
                  selected
                    ? `${c.border} ${c.bg} text-zinc-900`
                    : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
                }`}
              >
                <Icon size={18} className={`mb-1.5 ${selected ? "text-zinc-700" : "text-zinc-400"}`} />
                <div className="font-medium">{t.label}</div>
                <div className="text-xs text-zinc-400 mt-0.5">{t.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {showScheduling(data?.comercialType) && (
        <div className="grid sm:grid-cols-2 gap-4 p-4 bg-zinc-50 rounded-lg border border-zinc-100">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">Periodo de aluguel <span className="ml-1 text-[10px] font-normal text-zinc-400">opcional</span></label>
            <select
              value={data?.schedulingPeriod ?? ""}
              onChange={(e) => handleData({
                schedulingPeriod: e.target.value === "" ? null : Number(e.target.value),
              })}
              className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
            >
              <option value="">Selecione...</option>
              {schedulingPeriodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Desconto <span className="text-xs text-zinc-400 font-normal">(%)</span> <span className="ml-1 text-[10px] font-normal text-zinc-400">opcional</span>
            </label>
            <div className="relative">
              <input
                value={data?.schedulingDiscount ?? ""}
                onChange={(e) => handleData({
                  schedulingDiscount: e.target.value === "" ? null : Number(e.target.value),
                })}
                type="number"
                placeholder="0"
                min={0}
                max={100}
                className="w-full px-3 py-2.5 pr-8 border border-zinc-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCommercialType;
