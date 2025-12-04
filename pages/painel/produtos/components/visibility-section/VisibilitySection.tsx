"use client";

import React from "react";
import { Label } from "@/src/components/ui/form";
import { Select } from "@/src/components/ui/form";
import { ProductType } from "@/src/models/product";

interface VisibilitySectionProps {
  data: ProductType;
  handleData: (updated: Partial<ProductType>) => void;
}

const VisibilitySection: React.FC<VisibilitySectionProps> = ({
  data,
  handleData,
}) => {
  return (
    <div className="border-t pt-2 pb-2">
      <div className="grid gap-2">
        <div className="form-group">
          <Label>Exibir na minha loja</Label>
          <Select
            name="status"
            value={data?.status ?? 1}
            options={[
              { name: "Sim", value: 1 },
              { name: "Não", value: -1 },
            ]}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
              const value = Number(e.target.value);
              handleData({ status: value });
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VisibilitySection;
