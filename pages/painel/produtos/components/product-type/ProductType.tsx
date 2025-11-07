"use client";

import React from "react";
import { Label, Select } from "@/src/components/ui/form";

interface ProductType {
  comercialType?: string;
  schedulingPeriod?: number | null;
  schedulingDiscount?: number | null;
}

interface ProductCommercialTypeProps {
  data?: ProductType;
  handleData?: (updated: Partial<ProductType>) => void;
}

const schedulingPeriodOptions = [
  { value: 1, name: "Por dia" },
  { value: 2, name: "Por noite" },
  { value: 3, name: "Por hora" },
];

const ProductCommercialType: React.FC<ProductCommercialTypeProps> = ({
  data = {},
  handleData = () => {},
}) => {
  const handleComercialTypeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    if (value !== "aluguel") {
      handleData({
        comercialType: value,
        schedulingPeriod: null,
        schedulingDiscount: null,
      });
    } else {
      handleData({ comercialType: value });
    }
  };

  const handlePeriodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value === "" ? null : Number(e.target.value);
    handleData({ schedulingPeriod: value });
  };

  const handleDiscountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const numberValue = value === "" ? null : Number(value);
    handleData({ schedulingDiscount: numberValue });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Tipo comercial */}
      <div className="w-full">
        <Label>Tipo comercial</Label>
        <Select
          name="tipo_comercial"
          onChange={handleComercialTypeChange}
          value={data?.comercialType || ""}
          options={[
            { value: "", name: "Selecione..." },
            { value: "venda", name: "Venda" },
            { value: "aluguel", name: "Aluguel" },
          ]}
          required
        />
      </div>

      {/* Campos adicionais se for aluguel */}
      {data?.comercialType === "aluguel" && (
        <div className="flex gap-4">
          {/* Período */}
          <div className="w-full">
            <Label>Período de aluguel</Label>
            <Select
              name="periodo"
              onChange={handlePeriodChange}
              value={data?.schedulingPeriod ?? ""}
              options={[
                { value: "", name: "Selecione o período..." },
                ...schedulingPeriodOptions,
              ]}
            />
          </div>

          {/* Desconto */}
          <div className="w-full">
            <Label>
              Desconto <small className="font-medium pl-2">(em %)</small>
            </Label>
            <input
              name="desconto_aluguel"
              onChange={handleDiscountChange}
              value={data?.schedulingDiscount ?? ""}
              type="number"
              placeholder="Ex: 10"
              className="form-control"
              min={0}
              max={100}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductCommercialType;
