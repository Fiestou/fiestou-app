// hooks/useCascadingGroups.ts
import { useEffect, useState, useCallback } from "react";
import { Categorie } from "@/src/types/filtros";
import { Group } from "./useFiltersData";

function buildVisibleGroups(allGroups: Group[], selectedIds: number[]) {
  if (!allGroups?.length) {
    return [];
  }

  const visibleGroups = new Map<number, Group>();
  visibleGroups.set(allGroups[0].id, allGroups[0]);

  const categoriesById = new Map(
    allGroups.flatMap((group) => group.categories.map((category) => [category.id, category] as const))
  );

  for (const selectedId of selectedIds) {
    const selectedCategory = categoriesById.get(selectedId);
    const relatedIds = selectedCategory?.element_related_id ?? [];

    if (!relatedIds.length) {
      continue;
    }

    const categoriesByGroup = new Map<number, Categorie[]>();

    for (const relatedId of relatedIds) {
      const relatedCategory = categoriesById.get(relatedId);

      if (!relatedCategory?.group_id) {
        continue;
      }

      const current = categoriesByGroup.get(relatedCategory.group_id) ?? [];
      current.push(relatedCategory);
      categoriesByGroup.set(relatedCategory.group_id, current);
    }

    for (const [groupId, categories] of categoriesByGroup.entries()) {
      const sourceGroup = allGroups.find((group) => group.id === groupId);

      if (!sourceGroup) {
        continue;
      }

      const previous = visibleGroups.get(groupId);

      if (!previous) {
        visibleGroups.set(groupId, {
          ...sourceGroup,
          categories,
        });
        continue;
      }

      const merged = [
        ...previous.categories,
        ...categories.filter(
          (category) => !previous.categories.some((existing) => existing.id === category.id)
        ),
      ];

      visibleGroups.set(groupId, {
        ...previous,
        categories: merged,
      });
    }
  }

  return allGroups.filter((group) => visibleGroups.has(group.id)).map((group) => visibleGroups.get(group.id)!);
}

export function useCascadingGroups(allGroups: Group[]) {
  const [localGroups, setLocalGroups] = useState<Group[]>([]);

  // Sempre começa exibindo só o primeiro grupo
  useEffect(() => {
    setLocalGroups(buildVisibleGroups(allGroups, []));
  }, [allGroups]);

  const syncFromSelectedIds = useCallback((selectedIds: number[]) => {
    setLocalGroups(buildVisibleGroups(allGroups, selectedIds));
  }, [allGroups]);

  const appendRelatedGroup = useCallback((_clicked: Categorie, selectedIds: number[]) => {
    syncFromSelectedIds(selectedIds);
  }, [syncFromSelectedIds]);

  const removeRelatedOf = useCallback((_clicked: Categorie, keptSelectedIds: number[]) => {
    syncFromSelectedIds(keptSelectedIds);
  }, [syncFromSelectedIds]);

  const resetFirstGroup = useCallback(() => {
    syncFromSelectedIds([]);
  }, [syncFromSelectedIds]);

  const expandFromSelection = useCallback((selectedIds: number[]) => {
    syncFromSelectedIds(selectedIds);
  }, [syncFromSelectedIds]);

  return {
    localGroups,
    appendRelatedGroup,
    removeRelatedOf,
    resetFirstGroup,
    expandFromSelection,
    syncFromSelectedIds,
  };
}
