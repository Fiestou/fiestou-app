"use client";

import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Button, Label } from "../../ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import FilterTags from "./FilterTags";
import { Categorie, Group } from "@/src/types/filtros";
import Api from "@/src/services/api";

type Props = {
  value?: number[];
  onChange?: (ids: number[]) => void;
  max?: number;
  label?: string;
};

function CategorieCreateProdutct({
  value,
  onChange,
  max = 6,
  label = "Categoria",
}: Props) {
  const [selectedElements, setSelectedElements] = useState<Categorie[]>([]);
  const [filterActive, setFilterActive] = useState(false);
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const api = useMemo(() => new Api(), []);

  // ===== 1) Buscar grupos (nome/ícone) uma vez =====
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const request: any = await api.request({ method: "get", url: "group/list" });
        if (!mounted) return;
        if (Array.isArray(request?.data)) {
          const groups: Group[] = request.data.map((g: any) => ({
            id: g.id,
            name: g.name,
            categories: (g.categories || []).map((c: any) => ({
              id: Number(c.id),
              name: c.name,
              icon: c.icon,
              element_related_id: c.element_related_id || [],
              group_id: g.id,
            })),
          }));
          setAllGroups(groups);
        }
      } catch (err) {
        console.error("Erro ao buscar group/list:", err);
      }
    })();
    return () => { mounted = false; };
  }, [api]);

  // Dicionário id->categoria (para hidratar rapidinho)
  const categoryDict = useMemo(() => {
    const map = new Map<number, Categorie>();
    for (const g of allGroups) for (const c of g.categories) map.set(Number(c.id), c);
    return map;
  }, [allGroups]);

  // Mantém o selectedElements atual em ref para comparar sem travar deps
  const selectedRef = useRef<Categorie[]>([]);
  useEffect(() => { selectedRef.current = selectedElements; }, [selectedElements]);

  // ===== 2) Hidratar a partir de value + groups =====
  useEffect(() => {
    const ids = (Array.isArray(value) ? value : [])
      .filter((id) => Number.isFinite(id as number))
      .slice(0, max)
      .map((n) => Number(n));

    const hydrated: Categorie[] = ids.map((id) => {
      const curr = selectedRef.current.find((e) => Number(e.id) === id);
      const meta = categoryDict.get(id);
      // meta por cima para garantir name/icon; preserva outros campos do curr
      return meta ? { ...curr, ...meta } : curr ?? ({ id } as Categorie);
    });

    // 🔴 AQUI ESTAVA O PROBLEMA: antes comparava só IDs.
    // Agora atualiza se mudou tamanho, ID **ou** name/icon.
    const curr = selectedRef.current;
    const shouldUpdate =
      curr.length !== hydrated.length ||
      hydrated.some((e, i) => {
        const s = curr[i];
        return !s || s.id !== e.id || s.name !== e.name || s.icon !== e.icon;
      });

    if (shouldUpdate) setSelectedElements(hydrated);
  }, [value, max, categoryDict]);

  // ===== 3) Emite pro pai quando mudar manualmente =====
  const selectedIds = useMemo(
    () => selectedElements.map((e) => Number(e.id)).filter(Number.isFinite),
    [selectedElements]
  );

  const emitIfChanged = useCallback((next: Categorie[]) => {
    const ids = next.map((e) => Number(e.id)).filter(Number.isFinite);
    if (ids.join("|") !== selectedIds.join("|")) onChange?.(ids);
  }, [onChange, selectedIds]);

  const handleRemove = useCallback((id: number) => {
    setSelectedElements((prev) => {
      const next = prev.filter((e) => Number(e.id) !== id);
      emitIfChanged(next);
      return next;
    });
  }, [emitIfChanged]);

  const handleFilter = useCallback((elements: Categorie[]) => {
    const limited = elements.slice(0, max);
    const curr = selectedRef.current;
    const shouldUpdate =
      curr.length !== limited.length ||
      limited.some((e, i) => {
        const s = curr[i];
        return !s || s.id !== e.id || s.name !== e.name || s.icon !== e.icon;
      });

    if (shouldUpdate) {
      setSelectedElements(limited);
      emitIfChanged(limited);
    }
    setFilterActive(false);
  }, [emitIfChanged, max]);

  return (
    <div>
      <div className="flex items-center">
        <Label>{label}</Label>
        <div className="text-xs pt-1 pl-2">(máx {max} categorias)</div>
      </div>

      <div className="relative">
        <div className="w-full form-control pr-28 border-2 border-zinc-200 p-3">
          {selectedElements.length ? (
            <div className="flex flex-wrap gap-1 pt-1">
              {selectedElements.map((item) => (
                <div key={item.id} className="bg-zinc-100 border border-zinc-300 px-4 py-2 rounded-md items-center flex gap-3">
                  {item.icon && (
                    <img
                      src={String(item.icon)}
                      className="h-[20px] w-[20px] object-contain"
                      alt={String(item.name ?? item.id)}
                    />
                  )}
                  <span className="text-sm md:text-base">
                    {item.name ?? item.title ?? item.id}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemove(Number(item.id))}
                    className="hover:text-zinc-900"
                    aria-label={`Remover ${item.name ?? item.title ?? item.id}`}
                    title="Remover"
                  >
                    <Icon icon="fa-times" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-zinc-400 text-sm pt-1">Selecione a categoria</div>
          )}
        </div>

        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <Button type="button" style="btn-link" className="px-4" onClick={() => setFilterActive(true)}>
            Selecione a Categoria
          </Button>
        </div>
      </div>

      <FilterTags
        groups={allGroups}
        status={filterActive}
        maxSelected={max}
        onClose={() => setFilterActive(false)}
        clickedElements={selectedElements}
        onFilter={handleFilter}
      />
    </div>
  );
}

export default React.memo(CategorieCreateProdutct);
