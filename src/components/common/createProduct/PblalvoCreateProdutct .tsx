import Icon from "@/src/icons/fontAwesome/FIcon";
import { Button, Label } from "../../ui/form";
import { useEffect, useMemo, useState } from "react";
import FilterTags from "./FilterTags";
import Img from "@/src/components/utils/ImgBase";
import { Categorie } from "@/src/types/filtros";
import FilterTagsPblAlvo from "./FilterTagsPblAlvo";


const MAX = 1;

export default function PblalvoCreateProdutct ({
  onChange,
}: {
  onChange?: (ids: number[]) => void;
}) {
  const [selectedElements, setSelectedElements] = useState<Categorie[]>([]);
  const [filterActive, setFilterActive] = useState(false);

  const selectedIds = useMemo(
    () => selectedElements.map((el) => el.id),
    [selectedElements]
  );

  useEffect(() => {
    onChange?.(selectedIds);
  }, [selectedIds, onChange]);

  const handleRemove = (id: number) => {
    setSelectedElements((prev) => prev.filter((el) => el.id !== id));
  };

  const mergeUnique = (incoming: Categorie[]) => {
    const byId = new Map<number, Categorie>();
    [...selectedElements, ...incoming].forEach((el) => byId.set(el.id, el));
    return Array.from(byId.values());
  };

  return (
    <div>
      <div>
        <div className="flex items-center">
          <Label>Publico Alvo</Label>
          <div className="text-xs pt-1 pl-2">(máx {MAX} publico alvo)</div>
        </div>

        <div className="relative">
          <div className="w-full form-control pr-28 border-2 border-zinc-200 p-3">
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
                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="cursor-pointer hover:text-zinc-900"
                      aria-label={`Remover ${item.title || item.name}`}
                      title="Remover"
                    >
                      <Icon icon="fa-times" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-zinc-400 text-sm pt-1">
                        Selecione o publico alvo
              </div>
            )}
          </div>

          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <Button
              onClick={() => setFilterActive(true)}
              type="button"
              style="btn-link"
              className="px-4"
              aria-haspopup="dialog"
              aria-expanded={filterActive}
            >
              Selecione o publico alvo
            </Button>
          </div>
        </div>
      </div>

      <FilterTagsPblAlvo
        status={filterActive}
        maxSelected={MAX}
        onClose={() => setFilterActive(false)}
        clickedElements={selectedElements} // pré-seleção abre hierarquia
        onFilter={(elements) => {
          const merged = mergeUnique(elements).slice(0, MAX);
          setSelectedElements(merged);
          setFilterActive(false);
        }}
      />
    </div>
  );
}
