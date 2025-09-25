"use client";

import React from "react";
import { Label } from "@/src/components/ui/form";
import { Select } from "@/src/components/ui/form";
import Options from "@/src/components/ui/form/OptionsUI";

interface ProductType {
  combinations?: any[];
  suggestions?: string;
}

interface ProductBundleProps {
  data: ProductType;
  handleData: (updated: Partial<ProductType>) => void;
  productsFind: any[];
  SearchProducts: (search: string) => Promise<any[]>;
}

export const ProductBundle: React.FC<ProductBundleProps> = ({
  data,
  handleData,
  productsFind,
  SearchProducts,
}) => {
  return (
    <div className="border-t pt-4 pb-2">
      <h4 className="text-2xl text-zinc-900 pb-6">Venda combinada</h4>

      <div className="grid gap-8">
        {/* Combinações */}
        <div>
          <Label>Combinações</Label>
          <Options
            name="tipo_produto"
            value={data?.combinations ?? []}
            onSearch={SearchProducts}
            list={productsFind}
            onChange={(emit: any) => handleData({ combinations: emit })}
          />
        </div>

        {/* Sugestões */}
        <div>
          <Label>Mostrar produtos relacionados?</Label>
          <Select
            name="sugestoes"
            value={data?.suggestions ?? "yes"}
            options={[
              { name: "Sim", value: "yes" },
              { name: "Não", value: "no" },
            ]}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleData({ suggestions: e.target.value as "yes" | "no" })
            }
          />
        </div>
      </div>
    </div>
  );
};
