"use client";

import React from "react";
import { Label } from "@/src/components/ui/form";
import Options from "@/src/components/ui/form/OptionsUI";
import { RelationType } from "@/src/models/relation";

interface ProductType {
  combinations?: RelationType[];
  suggestions?: boolean; // ✅ sempre true agora
  attrs?: Record<string, any>;
}

interface ProductBundleProps {
  data: ProductType;
  handleData: (updated: Partial<ProductType>) => void;
  productsFind: RelationType[];
  SearchProducts: (search: string) => Promise<RelationType[]>;
}

const ProductBundle: React.FC<ProductBundleProps> = ({
  data,
  handleData,
  productsFind,
  SearchProducts,
}) => {
  // Garante que sempre seja true
  React.useEffect(() => {
    if (data.suggestions !== true) {
      handleData({ suggestions: true });
    }
  }, [data.suggestions, handleData]);

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
            onChange={(emit: RelationType[]) => {
              handleData({ combinations: emit });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default ProductBundle;
