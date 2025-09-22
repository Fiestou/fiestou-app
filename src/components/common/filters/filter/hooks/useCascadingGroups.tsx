// hooks/useCascadingGroups.ts
import { useEffect, useState, useCallback } from "react";
import { Categorie } from "@/src/types/filtros";
import { Group } from "./useFiltersData";

export function useCascadingGroups(allGroups: Group[]) {
  const [localGroups, setLocalGroups] = useState<Group[]>([]);

  // Sempre começa exibindo só o primeiro grupo
  useEffect(() => {
    setLocalGroups(allGroups?.length ? [allGroups[0]] : []);
  }, [allGroups]);

  const appendRelatedGroup = useCallback((clicked: Categorie) => {
    if (!clicked.element_related_id?.length) return;

    const relatedEl = allGroups
      .flatMap(g => g.categories)
      .find(el => clicked.element_related_id!.includes(el.id));

    const relatedGroup = allGroups.find(g => g.id === relatedEl?.group_id);
    if (!relatedGroup) return;

    const filtered = relatedGroup.categories
      .filter(el => clicked.element_related_id!.includes(el.id));

    const filteredGroup: Group = { ...relatedGroup, categories: filtered };

    setLocalGroups(prev => {
      const idxPrev = prev.findIndex(g => g.id === relatedGroup.id);
      if (idxPrev !== -1) {
        const up = [...prev];
        up[idxPrev].categories = [
          ...up[idxPrev].categories,
          ...filtered.filter(el => !up[idxPrev].categories.some(e => e.id === el.id)),
        ];
        return up;
      }

      const up = [...prev];
      const idxAll = allGroups.findIndex(g => g.id === relatedGroup.id);
      let insertAt = up.length;
      for (let i = 0; i < up.length; i++) {
        const gi = allGroups.findIndex(g => g.id === up[i].id);
        if (gi > idxAll) { insertAt = i; break; }
      }
      up.splice(insertAt, 0, filteredGroup);
      return up;
    });
  }, [allGroups]);

  const removeRelatedOf = useCallback((clicked: Categorie, keptSelectedIds: number[]) => {
    if (!clicked.element_related_id?.length) return;

    const otherRelIds = allGroups
      .flatMap(g => g.categories)
      .filter(el => keptSelectedIds.includes(el.id))
      .flatMap(el => el.element_related_id || []);

    setLocalGroups(prev => prev
      .map(g => ({
        ...g,
        categories: g.categories.filter(el =>
          !clicked.element_related_id!.includes(el.id) || otherRelIds.includes(el.id)
        ),
      }))
      .filter(g => g.categories.length > 0)
    );
  }, [allGroups]);

  const resetFirstGroup = useCallback(() => {
    setLocalGroups(allGroups?.length ? [allGroups[0]] : []);
  }, [allGroups]);

  // ✅ NOVO: expande a hierarquia com base numa seleção prévia (ex.: edição)
  const expandFromSelection = useCallback((selectedIds: number[]) => {
    if (!selectedIds?.length) return;
    const selectedCats = allGroups
      .flatMap(g => g.categories)
      .filter(c => selectedIds.includes(c.id));

    // chama o mesmo fluxo de clique para cada selecionado
    selectedCats.forEach(c => appendRelatedGroup(c));
  }, [allGroups, appendRelatedGroup]);

  return {
    localGroups,
    appendRelatedGroup,
    removeRelatedOf,
    resetFirstGroup,
    expandFromSelection, // <- aqui estava faltando
  };
}
