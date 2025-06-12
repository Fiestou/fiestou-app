import Icon from "@/src/icons/fontAwesome/FIcon";
import { Button, Label } from "../../ui/form";
import { useEffect, useState } from "react";
import FilterTags from "./FilterTags";
import Img from "@/src/components/utils/ImgBase";

// Defina o tipo Element se não existir
interface Element {
  id: number;
  name: string;
  onChange?: (elements: number[]) => void;
  icon?: string;
  title?: string;
}

export default function CategorieCreateProdutct({ onChange }: { onChange?: (ids: number[]) => void }) {
  const [selectedElements, setSelectedElements] = useState<Element[]>([]);
  const [filterActive, setFilterActive] = useState(false);

  // Sempre que selectedElements mudar, dispara o onChange com os IDs
  useEffect(() => {
    const ids = selectedElements.map(el => el.id);
    onChange?.(ids);
  }, [selectedElements]);

  return (
    <div>
      <div>
        <div className="flex items-center">
          <Label>Categoria</Label>
          <div className="text-xs pt-1 pl-2">(máx 6 categorias)</div>
        </div>
        <div className="relative">
          <div className="w-full form-control pr-28 b-2 b-black p-3 cursor-not-allowed">
            {selectedElements.length > 0 ? (
              <div className="flex flex-wrap gap-1 pt-1">
                {selectedElements.map((item) => (
                  <div
                    className="bg-zinc-100 border border-zinc-300 px-4 py-2 rounded-md items-center flex gap-3"
                    key={item.id}
                  >
                    {item.icon && (
                      <Img
                        src={item.icon}
                        className="h-[20px] w-[20px] object-contain"
                        alt={item.name}
                      />
                    )}
                    <span className="text-sm md:text-base">
                      {item.title || item.name}
                    </span>
                    <div
                      onClick={() => {
                        const updated = selectedElements.filter((el) => el.id !== item.id);
                        setSelectedElements(updated);
                      }}
                      className="cursor-pointer hover:text-zinc-900"
                    >
                      <Icon icon="fa-times" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-zinc-400 text-sm pt-1">Selecione a categoria</div>
            )}
          </div>
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <Button
              onClick={() => setFilterActive(true)}
              type="button"
              style="btn-link"
              className="px-4"
            >
              Selecione a Categoria
            </Button>
          </div>
        </div>
      </div>
      <FilterTags
        status={filterActive}
        onClose={() => setFilterActive(false)}
        onFilter={(elements: Element[]) => {
          setSelectedElements(elements.slice(0, 6));
          setFilterActive(false);
        }}
        clickedElements={selectedElements}
      />

    </div>
  );
}
