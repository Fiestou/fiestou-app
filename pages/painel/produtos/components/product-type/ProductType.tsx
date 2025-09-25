"use client";

import React from "react";
import { Label } from "@/src/components/ui/form";
import { Select } from "@/src/components/ui/form";
import { justNumber } from "@/src/helper";

interface ProductType {
  comercialType?: string;
  schedulingPeriod?: string;
  schedulingDiscount?: string | number;
}

interface ProductCommercialTypeProps {
  data: ProductType;
  handleData: (updated: Partial<ProductType>) => void;
}

const schedulingPeriod = [
  {
    value: "day",
    name: "por dia",
  },
  {
    value: "night",
    name: "por noite",
  },
  {
    value: "hour",
    name: "por hora",
  },
];

export const ProductCommercialType: React.FC<ProductCommercialTypeProps> = ({
  data,
  handleData,
}) => {
  return (
    <div className="flex gap-2 items-start">
      {/* Tipo comercial */}
      <div className="w-full">
        <Label>Tipo comercial</Label>
        <Select
          name="tipo_comercial"
          onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
            handleData({ comercialType: e.target.value })
          }
          value={data.comercialType || ""}
          options={[
            { value: "", name: "Selecione..." },
            { value: "selling", name: "Venda" },
            { value: "renting", name: "Aluguel" },
          ]}
        />
      </div>

      {/* Se for aluguel, mostra campos extras */}
      {data.comercialType === "renting" && (
        <>
          <div className="w-full">
            <Label>Tempo</Label>
            <Select
              name="periodo"
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleData({ schedulingPeriod: e.target.value })
              }
              value={data?.schedulingPeriod || ""}
              options={schedulingPeriod}
              required
            />
          </div>

          <div className="w-full">
            <Label>
              Desconto
              <small className="font-medium pl-2">(em %)</small>
            </Label>
            <input
              name="desconto_aluguel"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleData({ schedulingDiscount: justNumber(e.target.value) })
              }
              value={data?.schedulingDiscount ?? ""}
              type="text"
              placeholder="Ex: 10%"
              required
              className="form-control"
            />
          </div>
        </>
      )}
    </div>
  );
};
