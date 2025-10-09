"use client";

import React from "react";
import { Label } from "@/src/components/ui/form";
import { decimalNumber } from "@/src/helper";

interface ProductType {
  weight?: number | string;
  length?: number | string;
  width?: number | string;
  height?: number | string;
}

interface ProductDimensionsProps {
  data: ProductType;
  handleData: (updated: Partial<ProductType>) => void;
}

export const ProductDimensions: React.FC<ProductDimensionsProps> = ({
  data,
  handleData,
}) => {
  return (
    <div className="border-t pt-4 pb-2">
      <h4 className="text-2xl text-zinc-900 mb-2">Peso e dimensões</h4>
      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
        {/* Peso */}
        <div className="form-group">
          <Label>Peso</Label>
          <input
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleData({ weight: e.target.value })
            }
            value={data?.weight ?? ""}
            type="text"
            name="peso"
            placeholder="0.00 (kg)"
            className="form-control"
          />
        </div>

        {/* Comprimento */}
        <div className="form-group">
          <Label>Comprimento</Label>
          <input
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleData({ length: decimalNumber(e.target.value) })
            }
            value={data?.length ?? ""}
            type="text"
            name="comprimento"
            placeholder="0.00 (m)"
            className="form-control"
          />
        </div>

        {/* Largura */}
        <div className="form-group">
          <Label>Largura</Label>
          <input
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleData({ width: decimalNumber(e.target.value) })
            }
            value={data?.width ?? ""}
            type="text"
            name="largura"
            placeholder="0.00 (m)"
            className="form-control"
          />
        </div>

        {/* Altura */}
        <div className="form-group">
          <Label>Altura</Label>
          <input
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              handleData({ height: decimalNumber(e.target.value) })
            }
            value={data?.height ?? ""}
            type="text"
            name="altura"
            placeholder="0.00 (m)"
            className="form-control"
          />
        </div>
      </div>
    </div>
  );
};
