import React from "react";
import { ProductType } from "@/src/models/product";

interface TransportSectionProps {
  data: ProductType;
  handleData: (value: Partial<ProductType>) => void;
  realMoneyNumber: (value: string) => string;
}

function SelectField({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: any;
  options: { name: string; value: string }[];
  onChange: (val: string) => void;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-zinc-700 mb-1.5">{label} <span className="ml-1 text-[10px] font-normal text-zinc-400">opcional</span></label>
      <select
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all appearance-none"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>{opt.name}</option>
        ))}
      </select>
    </div>
  );
}

const TransportSection: React.FC<TransportSectionProps> = ({
  data,
  handleData,
  realMoneyNumber,
}) => {
  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <SelectField
          label="Tipo de entrega"
          value={data?.delivery_type ?? "delivery"}
          options={[
            { name: "Entrega", value: "delivery" },
            { name: "Retirada na loja", value: "pickup" },
            { name: "Ambos", value: "both" },
          ]}
          onChange={(v) => handleData({ delivery_type: v as any })}
        />

        <SelectField
          label="Produto frágil?"
          value={data?.fragility ?? "yes"}
          options={[
            { name: "Sim", value: "yes" },
            { name: "Não", value: "no" },
          ]}
          onChange={(v) => handleData({ fragility: v })}
        />

        <SelectField
          label="Veículo de transporte"
          value={data?.vehicle ?? ""}
          options={[
            { name: "Moto", value: "motorbike" },
            { name: "Carro", value: "car" },
            { name: "Caminhonete", value: "pickup" },
            { name: "Caminhão", value: "truck" },
          ]}
          onChange={(v) => handleData({ vehicle: v })}
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-1.5">Valor por KM rodado <span className="ml-1 text-[10px] font-normal text-zinc-400">opcional</span></label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-zinc-400 font-medium">R$</span>
            <input
              value={data?.freeTax ? data.freeTax : ""}
              type="text"
              onChange={(e) => handleData({ freeTax: realMoneyNumber(e.target.value) })}
              placeholder="0,00"
              className="w-full pl-10 pr-3 py-2.5 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
            />
          </div>
        </div>

        <SelectField
          label="Montagem"
          value={data?.assembly ?? ""}
          options={[
            { name: "Fornecer montagem", value: "on" },
            { name: "Não fornecer", value: "off" },
          ]}
          onChange={(v) => handleData({ assembly: v })}
        />
      </div>
    </div>
  );
};

export default TransportSection;
