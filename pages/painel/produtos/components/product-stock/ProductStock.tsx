"use client";

import React from "react";
import { Label } from "@/src/components/ui/form"; // ajuste o caminho se necessário
import { Select } from "@/src/components/ui/form"; // ajuste o caminho se necessário
import { justNumber } from "@/src/helper"; // ajuste o caminho se necessário
import { ProductType } from "@/src/models/product";

interface ProductStockProps {
  data: ProductType;
  handleData: (updated: Partial<ProductType>) => void;
}

export const ProductStock: React.FC<ProductStockProps> = ({ data, handleData }) => {
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
                <span className="pl-2 text-xs">(código do produto)</span>
              </div>
              <input
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleData({ availability: Number(e.target.value) })
                }
                value={data?.sku ?? ""}
                type="text"
                name="sku"
                placeholder="#0000"
                className="form-control"
              />
            </div>

            {/* Disponibilidade */}
            <div className="form-group">
              <div className="flex items-center">
                <Label>Disponibilidade</Label>
                <span className="pl-2 text-xs">(em dias)</span>
              </div>
              <input
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleData({ quantity: Number(e.target.value) })
                }
                value={data?.availability ?? 1}
                min={1}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    handleData({ quantity: justNumber(e.target.value) })
                  }
                  value={justNumber(data?.quantity) ?? ""}
                  min={0}
                  className="form-control text-center"
                  type="number"
                  name="quantidade"
                  placeholder="Digite a quantidade"
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
