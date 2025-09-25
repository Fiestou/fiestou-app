"use client";

import React, { useState } from "react";
import { Label } from "@/src/components/ui/form";
import { Button } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Colors from "@/src/components/ui/form/ColorsUI";
import { handleTags as handleTagsUtil } from "@/src/helper";

interface ProductType {
  colors?: string[];
  tags?: string;
}

interface ProductFeaturesProps {
  data: ProductType;
  handleData: (updated: Partial<ProductType>) => void;
}

export const ProductFeatures: React.FC<ProductFeaturesProps> = ({
  data,
  handleData,
}) => {
  const [colors, setColors] = useState<string[]>(data?.colors ?? []);
  const [tags, setTags] = useState<string>("");

  // Atualiza cores
  const handleColorsChange = (newColors: string[]) => {
    setColors(newColors);
    handleData({ colors: newColors });
  };

  // Adiciona ou remove tags
  const handleAddTag = () => {
    const updatedTags = handleTagsUtil(data?.tags ?? "", tags);
    handleData({ tags: updatedTags });
    setTags("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const updatedTags = handleTagsUtil(
      data?.tags?.replace(tagToRemove, "") ?? "",
      ""
    );
    handleData({ tags: updatedTags });
  };

  const tagList = (data?.tags?.split(",").filter(Boolean) ?? []).slice(0, 6);

  return (
    <div className="border-t pt-4 pb-2">
      <h4 className="text-2xl text-zinc-900 pb-6">Características</h4>

      <div className="grid gap-8">
        {/* Cores */}
        <div>
          <Label>Cor</Label>
          <Colors value={colors} onChange={handleColorsChange} />
          <div className="text-sm text-zinc-400 whitespace-nowrap">
            {colors.filter(Boolean).length} de 3
          </div>
        </div>

        {/* Tags */}
        <div>
          <div className="flex items-center">
            <Label>Adicionar Tag</Label>
            <div className="text-xs pt-1 pl-2">(máx 6 tags)</div>
          </div>

          <div className="relative">
            <div className="w-full">
              <input
                type="text"
                name="tags"
                value={tags ?? ""}
                onChange={(e) => setTags(e.target.value)}
                placeholder="Exemplo: Fazenda, Desenho animado, Galinha"
                className="form-control pr-28"
              />
            </div>

            <div className="absolute right-0 top-1/2 -translate-y-1/2">
              <Button
                type="button"
                style="btn-link"
                className="px-4"
                onClick={handleAddTag}
              >
                confirmar
              </Button>
            </div>
          </div>

          {/* Lista de tags */}
          {tagList.length > 0 && (
            <div className="flex flex-wrap gap-1 pt-1">
              {tagList.map((item, key) => (
                <div
                  key={key}
                  className="bg-zinc-100 border border-zinc-300 px-4 py-2 rounded-md items-center flex gap-3"
                >
                  <span className="text-sm md:text-base">{item}</span>
                  <div
                    onClick={() => handleRemoveTag(item)}
                    className="cursor-pointer hover:text-zinc-900"
                  >
                    <Icon icon="fa-times" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
