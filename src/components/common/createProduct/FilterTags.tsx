// components/.../FilterTags.tsx
import { useEffect, useMemo, useState } from "react";
import Api from "@/src/services/api";
import Img from "@/src/components/utils/ImgBase";
import { Label, Button } from "@/src/components/ui/form";
import { Categorie, Group } from "@/src/types/filtros";
import { useCascadingGroups } from "../filters/filter/hooks/useCascadingGroups";


interface FilterTagsProps {
  status: boolean;
  onFilter?: (categorie: Categorie[]) => void;
  onClose?: () => void;
  groups?: Group[]; // novo
  clickedElements: Categorie[];
  maxSelected?: number; // novo
}

export default function FilterTags({
  status,
  onFilter,
  groups,
  onClose,
  clickedElements,
  maxSelected = 6,
}: FilterTagsProps) {
  const api = new Api();
  const [allGroups, setAllGroups] = useState<Group[]>(groups ?? []);
  const [activeElements, setActiveElements] = useState<number[]>([]);

  const { localGroups, appendRelatedGroup, removeRelatedOf, resetFirstGroup, expandFromSelection } =
    useCascadingGroups(allGroups);

  useEffect(() => {
    if (groups && groups.length) {
      setAllGroups(groups);
    }
  }, [groups]);
  
  // Sincroniza seleção externa
  useEffect(() => {
    const selectedIds = clickedElements.map((el) => el.id);
    setActiveElements(selectedIds);
  }, [clickedElements]);

  // Carrega grupos ao abrir

  // Assim que allGroups + seleção externa estiverem prontos, abre a hierarquia
  useEffect(() => {
    if (!allGroups.length) return;
    if (!clickedElements.length) return;
    // garante primeiro grupo + expansão coerente com a seleção existente
    resetFirstGroup();
    expandFromSelection(clickedElements.map(c => c.id));
  }, [allGroups, clickedElements, resetFirstGroup, expandFromSelection]);

  const onToggleElement = (element: Categorie) => {
    const isActive = activeElements.includes(element.id);
    if (isActive) {
      // desmarcar
      const newSelected = activeElements.filter((id) => id !== element.id);
      setActiveElements(newSelected);
      removeRelatedOf(element, newSelected);
      if (newSelected.length === 0) resetFirstGroup();
      return;
    }

    // marcar (respeitando limite)
    if (activeElements.length >= maxSelected) {
      // opcional: mostrar toast/feedback visual
      return;
    }
    const newSelected = [...activeElements, element.id];
    setActiveElements(newSelected);
    appendRelatedGroup(element);
  };

  const selectedElementsFull = useMemo(() => {
    const dict = new Map<number, Categorie>();
    allGroups.forEach((g) => g.categories.forEach((c) => dict.set(c.id, c)));
    return activeElements.map((id) => dict.get(id)).filter((x): x is Categorie => !!x);
  }, [activeElements, allGroups]);

  if (!status) return null;

  return (
    <div className="static left-0 top-full mt-2 z-50 w-full">
      <div className="bg-white rounded shadow-lg border p-4">
        {localGroups.map((group) => (
          <div key={group.id} className="pb-6">
            <Label>{group.name}</Label>
            <div className="flex -mx-4 px-4 md:grid relative overflow-x-auto scrollbar-hide">
              <div className="flex md:flex-wrap gap-2">
                {group.categories.map((element) => {
                  const isChecked = activeElements.includes(element.id);
                  const isDisabled =
                    !isChecked && activeElements.length >= maxSelected;

                  return (
                    <button
                      type="button"
                      key={element.id}
                      disabled={isDisabled}
                      className={`border cursor-pointer ease relative rounded p-2 ${isChecked
                          ? "border-zinc-800 hover:border-zinc-500"
                          : "hover:border-zinc-300"
                        } ${isDisabled ? "opacity-60 cursor-not-allowed" : ""}`}
                      onClick={() => onToggleElement(element)}
                    >
                      <div className="px-3 md:px-1 flex items-center gap-2">
                        {!!element.icon && (
                          <Img
                            src={element.icon}
                            className="h-[20px] w-[20px] object-contain"
                          />
                        )}
                        <div className="h-[20px] whitespace-nowrap text-sm md:text-base flex items-center">
                          {element.name}
                        </div>
                        {isChecked && (
                          <input
                            type="checkbox"
                            name="elemento[]"
                            value={element.id}
                            defaultChecked={true}
                            className="absolute opacity-0 z-[-1]"
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        <div className="flex justify-between pt-4">
          <Button type="button" onClick={onClose}>
            Fechar
          </Button>
          <Button
            type="button"
            onClick={() => onFilter?.(selectedElementsFull)}
          >
            Adicionar Categorias
          </Button>
        </div>
      </div>
    </div>
  );
}
