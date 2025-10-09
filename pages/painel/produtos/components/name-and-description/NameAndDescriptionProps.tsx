"use client";

import React from "react";
import { slugfy } from "@/src/helper";

interface ProductType {
  title?: string;
  slug?: string;
  subtitle?: string;
  description?: string;
  category?: (string | number)[];
}

interface NameAndDescriptionProps {
  data: ProductType;
  handleData: (updated: Partial<ProductType>) => void;
}

export const NameAndDescription: React.FC<NameAndDescriptionProps> = ({
  data,
  handleData,
}) => {
  return (
    <div className="border-t pt-4 pb-2">
      <h4 className="text-2xl text-zinc-900 mb-2">Nome e descrição</h4>

      <div className="grid gap-2">
        {/* Título e Slug */}
        <div className="form-group">
          <label className="block text-sm font-medium mb-1">Título</label>
          <input
            type="text"
            name="title"
            onChange={(e) => handleData({ title: e.target.value })}
            value={data.title ?? ""}
            required
            placeholder="Digite o nome do produto"
            className="form-control"
          />

          <input
            type="text"
            name="slug"
            onChange={(e) => handleData({ slug: slugfy(e.target.value) })}
            value={slugfy(data.slug ?? data.title ?? "")}
            required
            placeholder="Configure a slug para o link"
            className="mt-2 text-sm p-2 rounded-md bg-zinc-100 border-0 w-full"
          />
        </div>

        {/* Subtítulo */}
        <div className="form-group">
          <label className="block text-sm font-medium mb-1">Subtítulo</label>
          <input
            type="text"
            name="subtitle"
            onChange={(e) => handleData({ subtitle: e.target.value })}
            value={data.subtitle ?? ""}
            required
            placeholder="Digite o subtítulo do produto"
            className="form-control"
          />
        </div>

        {/* Descrição */}
        <div className="form-group">
          <label className="block text-sm font-medium mb-1">Descrição</label>
          <textarea
            name="description"
            onChange={(e) => handleData({ description: e.target.value })}
            value={data.description ?? ""}
            required
            placeholder="Adicione a descrição detalhada do produto"
            className="w-full p-2 border rounded-md resize-y min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
};
export default NameAndDescription;