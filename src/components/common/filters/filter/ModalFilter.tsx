import React, { useCallback, useEffect, useMemo } from "react";
import Modal from "../../../utils/Modal";
import SortSelect from "./sections/SortSelect";
import PriceRange from "./sections/PriceRange";
import CommercialTypeFilter from "./sections/CommercialTypeFilter";
import PromotionToggle from "./sections/PromotionToggle";
import ColorPicker from "./sections/ColorPicker";
import AudienceChips from "./sections/AudienceChips";
import GroupChips from "./sections/GroupChips";
import Footer from "./sections/Footer";
import { FilterQueryType, Categorie } from "@/src/types/filtros";
import { useFiltersData } from "./hooks/useFiltersData";
import { useCascadingGroups } from "./hooks/useCascadingGroups";

export interface ModalFilterProps {
  open: boolean;
  onClose: () => void;
  query: FilterQueryType;
  onChange: (patch: Partial<FilterQueryType>) => void;
  count: number;
  onSubmit?: () => void;
  store?: number;
  storeView?: boolean;
  availableCommercialTypes?: string[];
}

export default function ModalFilter({
  open,
  onClose,
  query,
  onChange,
  count,
  onSubmit,
  store,
  storeView,
  availableCommercialTypes,
}: ModalFilterProps) {
  const { loading, allGroups, pblcAlvo } = useFiltersData(open);
  const {
    localGroups,
    appendRelatedGroup,
    removeRelatedOf,
    resetFirstGroup,
    syncFromSelectedIds,
  } =
    useCascadingGroups(allGroups);

  const categoriesById = useMemo(
    () =>
      new Map(
        allGroups.flatMap((group) => group.categories.map((category) => [category.id, category] as const))
      ),
    [allGroups]
  );

  const collectDescendantIds = useCallback(
    (element: Categorie) => {
      const collected = new Set<number>();
      const queue = [...(element.element_related_id ?? [])];

      while (queue.length) {
        const currentId = queue.shift();

        if (!currentId || collected.has(currentId)) {
          continue;
        }

        collected.add(currentId);

        const currentCategory = categoriesById.get(currentId);
        const nextIds = currentCategory?.element_related_id ?? [];

        for (const nextId of nextIds) {
          if (!collected.has(nextId)) {
            queue.push(nextId);
          }
        }
      }

      return collected;
    },
    [categoriesById]
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    syncFromSelectedIds(query.categories);
  }, [open, query.categories, syncFromSelectedIds]);

  const onClickCategorie = useCallback(
    (element: Categorie) => {
      const isSelected = query.categories.includes(element.id);

      const updated = isSelected
        ? query.categories.filter((id) => !new Set([element.id, ...collectDescendantIds(element)]).has(id))
        : [...query.categories, element.id];

      onChange({ categories: updated });

      if (isSelected) {
        removeRelatedOf(element, updated);
      } else {
        appendRelatedGroup(element, updated);
      }
    },
    [query.categories, onChange, appendRelatedGroup, collectDescendantIds, removeRelatedOf]
  );

  if (!open) return null;

  return (
    <Modal
      storeView={storeView}
      title={`Filtros${loading ? " (carregando…)" : ""}`}
      status={open}
      close={onClose}
      footer={
        <Footer
          count={count}
          onSubmit={onSubmit}
          onClear={() => {
            onChange({
              categories: [],
              colors: [],
              range: 1000,
              order: "desc",
              comercialTypes: [],
              saleOnly: false,
            });
            resetFirstGroup();
          }}
        />
      }
    >
      <SortSelect
        order={query.order}
        onChange={(order) => onChange({ order })}
      />
      <PriceRange
        value={query.range}
        onChange={(range) => onChange({ range })}
      />
      <PromotionToggle
        checked={query.saleOnly}
        onChange={(saleOnly) => onChange({ saleOnly })}
      />
      <CommercialTypeFilter
        value={query.comercialTypes}
        onChange={(comercialTypes) => onChange({ comercialTypes })}
        availableTypes={availableCommercialTypes}
      />
      <ColorPicker
        value={query.colors}
        onChange={(colors) => onChange({ colors })}
      />
      <AudienceChips
        groups={pblcAlvo}
        selectedIds={query.categories}
        onClick={onClickCategorie}
      />
      <GroupChips
        groups={localGroups}
        selectedIds={query.categories}
        onClick={onClickCategorie}
      />
    </Modal>
  );
}
