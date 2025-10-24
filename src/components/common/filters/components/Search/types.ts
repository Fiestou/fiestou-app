import { RefObject } from "react";

export type SearchHeaderProps = {
  count: number;
  stick: boolean;
  filterAreaRef: RefObject<HTMLDivElement>;
  busca?: string;
  onOpenFilters: () => void;
  onSearch: (value: string) => void;
};