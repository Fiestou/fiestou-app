"use client";

import React, { useState } from "react";
import { Label, Button } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Colors from "@/src/components/ui/form/ColorsUI";
import { handleTags as handleTagsUtil } from "@/src/helper";

interface ProductType {
  color?: string;
  tags?: string;
}

interface ProductFeaturesProps {
  data: ProductType;
  handleData: (updated: Partial<ProductType>) => void;
}

const ProductFeatures: React.FC<ProductFeaturesProps> = ({
  data,
  handleData,
}) => {
  const [colors, setColors] = useState<string[]>(
    data.color ? data.color.split("|") : []
  );
  const [tagInput, setTagInput] = useState<string>("");

  // Atualiza cores
  const handleColorsChange = (newColors: string[]) => {
    setColors(newColors);
    handleData({ color: newColors.join("|") }); // 👈 volta a ser string
  };

  // Adiciona uma nova tag
  const handleAddTag = () => {
    if (!tagInput.trim()) return;

    const updatedTags = handleTagsUtil(data?.tags ?? "", tagInput.trim());
    handleData({ tags: updatedTags });
    setTagInput("");
  };

  // Remove tag existente
  const handleRemoveTag = (tagToRemove: string) => {
    const tagsArray = data?.tags?.split(",").map(t => t.trim()).filter(Boolean) ?? [];
    const updatedTags = tagsArray.filter(tag => tag !== tagToRemove).join(",");
    handleData({ tags: updatedTags });
  };

  // Lista de tags limitadas a 6
  const tagList = (data?.tags?.split(",").map(t => t.trim()).filter(Boolean) ?? []).slice(0, 6);

  return (
    <div className="border-t pt-4 pb-2">
      <h4 className="text-2xl text-zinc-900 pb-6">Características</h4>

      <div className="grid gap-8">
        {/* Cores */}
        <div>
          <Label>Cor</Label>
          <Colors value={colors} onChange={handleColorsChange} maxSelect={3} />
          <div className="text-sm text-zinc-400 whitespace-nowrap">
            {colors.length} de 3
          </div>
        </div>

        {/* Tags */}
        <div>
          <div className="flex items-center">
            <Label>Adicionar Tag</Label>
            <div className="text-xs pt-1 pl-2">(máx 6 tags)</div>
          </div>

          <div className="relative">
            <input
              type="text"
              name="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Exemplo: Fazenda, Desenho animado, Galinha"
              className="form-control pr-28 w-full"
            />
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
                  className="bg-zinc-100 border border-zinc-300 px-4 py-2 rounded-md flex items-center gap-3"
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
export default ProductFeatures;