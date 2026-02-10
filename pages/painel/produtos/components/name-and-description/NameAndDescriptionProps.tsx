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
  const titleLen = (data?.title || "").length;
  const descLen = (data?.description || "").length;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          Título do produto <span className="ml-1.5 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">obrigatório</span>
        </label>
        <input
          type="text"
          onChange={(e) => handleData({ title: e.target.value })}
          value={data?.title ?? ""}
          required
          placeholder="Ex: Kit Decoração Frozen"
          className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
        />
        <div className="flex items-center justify-between mt-1.5">
          <div className="text-xs text-zinc-400">
            fiestou.com.br/produtos/<span className="text-zinc-600">{slugfy(data?.slug ?? data?.title ?? "")  || "..."}</span>
          </div>
          <span className={`text-xs ${titleLen > 80 ? "text-red-400" : "text-zinc-400"}`}>
            {titleLen}/80
          </span>
        </div>
        <input
          type="hidden"
          name="slug"
          value={slugfy(data?.slug ?? data?.title ?? "")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">Subtítulo <span className="ml-1 text-[10px] font-normal text-zinc-400">opcional</span></label>
        <input
          type="text"
          onChange={(e) => handleData({ subtitle: e.target.value })}
          value={data?.subtitle ?? ""}
          placeholder="Uma frase curta que descreve o produto"
          className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-zinc-700 mb-1.5">
          Descrição <span className="ml-1.5 text-[10px] font-semibold text-red-600 bg-red-50 border border-red-200 px-1.5 py-0.5 rounded">obrigatório</span>
        </label>
        <textarea
          onChange={(e) => handleData({ description: e.target.value })}
          value={data?.description ?? ""}
          required
          placeholder="Descreva o produto em detalhes: o que inclui, tamanhos, materiais..."
          className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition-all resize-y min-h-[120px]"
          rows={4}
        />
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${descLen > 500 ? "text-amber-500" : "text-zinc-400"}`}>
            {descLen} caracteres
          </span>
        </div>
      </div>
    </div>
  );
};

export default NameAndDescription;
