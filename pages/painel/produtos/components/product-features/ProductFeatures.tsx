"use client";

import React, { useState, useEffect } from "react";
import { Label, Button } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Colors from "@/src/components/ui/form/ColorsUI";
import { handleTags as handleTagsUtil } from "@/src/helper";

interface ProductType {
  color?: string;
  tags?: string;
}

interface ProductFeaturesProps {
  data?: ProductType;
  handleData?: (updated: Partial<ProductType>) => void;
}

const ProductFeatures: React.FC<ProductFeaturesProps> = ({
  data = {},
  handleData = () => {},
}) => {
  const [colors, setColors] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState<string>("");

  useEffect(() => {
    setColors(data?.color ? data.color.split("|") : []);
  }, [data?.color]);

  const handleColorsChange = (newColors: string[]) => {
    setColors(newColors);
    handleData({ color: newColors.join("|") });
  };

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const updatedTags = handleTagsUtil(data?.tags ?? "", tagInput.trim());
    handleData({ tags: updatedTags });
    setTagInput("");
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const tagsArray =
      data?.tags?.split(",").map((t) => t.trim()).filter(Boolean) ?? [];
    const updatedTags = tagsArray
      .filter((tag) => tag !== tagToRemove)
      .join(",");
    handleData({ tags: updatedTags });
  };

  const tagList =
    data?.tags?.split(",").map((t) => t.trim()).filter(Boolean).slice(0, 6) ??
    [];

  return (
    <div>
      <div className="grid gap-8">
        <div>
          <Label>Cor <span className="ml-1 text-[10px] font-normal text-zinc-400">opcional</span></Label>
          <Colors value={colors} onChange={handleColorsChange} maxSelect={3} />
          <div className="mt-2 text-sm text-zinc-400">
            {colors?.length} de 3
          </div>
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <Label>Adicionar Tag <span className="ml-1 text-[10px] font-normal text-zinc-400">opcional</span></Label>
            <div className="text-xs text-zinc-500">(máx. 6 tags)</div>
          </div>

          <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              type="text"
              name="tags"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Exemplo: Fazenda, Desenho animado, Galinha"
              className="form-control w-full"
            />
            <Button
              type="button"
              style="btn-link"
              className="justify-center self-start px-0 py-1 text-sm sm:self-auto sm:px-4"
              onClick={handleAddTag}
            >
              Confirmar
            </Button>
          </div>

          {tagList.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-2">
              {tagList.map((item, key) => (
                <div
                  key={key}
                  className="bg-zinc-100 border border-zinc-300 px-3 py-2 rounded-lg flex items-center gap-2"
                >
                  <span className="text-sm leading-snug">{item}</span>
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
