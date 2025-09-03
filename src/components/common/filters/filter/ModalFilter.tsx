import React, { useCallback } from "react";
import Modal from "../../../utils/Modal";
import SortSelect from "./sections/SortSelect";
import PriceRange from "./sections/PriceRange";
import ColorPicker from "./sections/ColorPicker";
import AudienceChips from "./sections/AudienceChips";
import GroupChips from "./sections/GroupChips";
import Footer from "./sections/Footer";
import { FilterQueryType, Categorie } from "@/src/types/filtros";
import { useFiltersData } from "./hooks/useFiltersData";
import { useCascadingGroups } from "./hooks/useCascadingGroups";
import { StoreType } from "@/src/models/product";

export interface ModalFilterProps {
  open: boolean;
  onClose: () => void;
  query: FilterQueryType;
  onChange: (patch: Partial<FilterQueryType>) => void;
  count: number;
  onSubmit?: () => void;
  store?: StoreType;   
  storeView?: boolean;
}

export default function ModalFilter({ open, onClose, query, onChange, count, onSubmit, store,storeView }: ModalFilterProps) {
  const { loading, allGroups, pblcAlvo } = useFiltersData(open);
  const { localGroups, appendRelatedGroup, removeRelatedOf, resetFirstGroup } = useCascadingGroups(allGroups);
  

  const onClickCategorie = useCallback((element: Categorie) => {
    const isSelected = query.categories.includes(element.id);
    const updated = isSelected
      ? query.categories.filter((id) => id !== element.id)
      : [...query.categories, element.id]
    onChange({ categories: updated });
    if (isSelected) removeRelatedOf(element, updated);
    else appendRelatedGroup(element);
  }, [query.categories, onChange, appendRelatedGroup, removeRelatedOf]);

  if (!open) return null;

  return (
    <Modal storeView={storeView} title={`Filtros${loading ? " (carregando…)" : ""}`} status={open} close={onClose} className="bg-red-400">
      <SortSelect order={query.order} onChange={(order) => onChange({ order })} />
      <PriceRange value={query.range} onChange={(range) => onChange({ range })} />
      <ColorPicker value={query.colors} onChange={(colors) => onChange({ colors })} />
      <AudienceChips groups={pblcAlvo} selectedIds={query.categories} onClick={onClickCategorie} />
      <GroupChips groups={localGroups} selectedIds={query.categories} onClick={onClickCategorie} />
      <Footer
        count={count}
        onSubmit={onSubmit}
        onClear={() => { onChange({ categories: [], colors: [], range: 1000, order: "desc" }); resetFirstGroup(); }}
      />
    </Modal>
  );
}
