"use client";

import React from "react";
import { Label, Select } from "@/src/components/ui/form";
import { justNumber } from "@/src/helper";
import { ProductType } from "@/src/models/product";

interface ProductStockProps {
  data: ProductType;
  handleData: (updated: Partial<ProductType>) => void;
}

export const ProductStock: React.FC<ProductStockProps> = ({ data, handleData }) => {
  // SKU (somente números e até 9 dígitos)
  const handleSkuChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ""); // só números
    if (value.length > 9) value = value.slice(0, 9); // corta se passar de 9
    handleData({ sku: value });
  };

  // Disponibilidade (1 a 31 dias)
  const handleAvailabilityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = Number(e.target.value);
    if (isNaN(value)) value = 1;
    if (value > 31) value = 31;
    if (value < 1) value = 1;
    handleData({ availability: value });
  };

  // Quantidade (0 a 9999)
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = Number(justNumber(e.target.value)); // converte para number
    if (isNaN(value)) value = 0;
    if (value > 9999) value = 9999;
    if (value < 0) value = 0;
    handleData({ quantity: value });
  };

  return (
    <div className="border-t pt-4 pb-2">
      <h4 className="text-2xl text-zinc-900 mb-2">Estoque</h4>

      <div className="grid gap-2">
        {/* SKU e Disponibilidade */}
        <div className="flex gap-2">
          <div className="w-full grid gap-2 sm:grid-cols-2">
            {/* SKU */}
            <div className="form-group">
              <div className="flex items-center">
                <Label>SKU</Label>
                <span className="pl-2 text-xs">(até 9 dígitos)</span>
              </div>
              <input
                onChange={handleSkuChange}
                value={data?.sku ?? ""}
                type="text"
                name="sku"
                placeholder="#0000"
                className="form-control"
                maxLength={9}
              />
            </div>

            {/* Disponibilidade */}
            <div className="form-group">
              <div className="flex items-center">
                <Label>Disponibilidade</Label>
                <span className="pl-2 text-xs">(1 a 31 dias)</span>
              </div>
              <input
                onChange={handleAvailabilityChange}
                value={data?.availability ?? 1}
                min={1}
                max={31}
                type="number"
                name="disponibilidade"
                placeholder="Em dias"
                className="form-control"
              />
            </div>
          </div>
        </div>

        {/* Quantidade */}
        <div className="form-group">
          <Label>Quantidade</Label>
          <div className="grid md:flex gap-3">
            {/* Tipo de quantidade */}
            <div className="w-full">
              <Select
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  handleData({ quantityType: e.target.value as "manage" | "ondemand" | "" })
                }
                value={data?.quantityType ?? "manage"}
                name="quantidade_tipo"
                options={[
                  { name: "Selecione...", value: "" },
                  { name: "Gerenciar estoque", value: "manage" },
                  { name: "Sob demanda", value: "ondemand" },
                ]}
              />
            </div>

            {/* Campo de quantidade (se for "manage") */}
            {(!data?.quantityType || data?.quantityType === "manage") && (
              <div className="w-full">
                <input
                  onChange={handleQuantityChange}
                  value={data?.quantity ?? ""}
                  min={0}
                  max={9999}
                  className="form-control text-center"
                  type="number"
                  name="quantidade"
                  placeholder="Digite a quantidade (máx. 9999)"
                  required
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
