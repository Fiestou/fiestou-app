import { Button, Label } from "../../../../ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { FilterQueryType } from "@/src/types/filtros";

export default function SortSelect({
  order, onChange,
}: { order: FilterQueryType["order"]; onChange: (v: FilterQueryType["order"]) => void; }) {
  return (
    <div className="pb-6">
      <Label>Ordenar por</Label>
      <div className="relative">
        <Button type="button" style="btn-outline-light" className="font-normal w-full justify-start flex px-3 md:px-5 h-full">
          <Icon icon={order === "desc" ? "fa-sort-amount-down" : "fa-sort-amount-up"} className="text-zinc-900 text-xl md:text-base" />
          <div className="hidden md:block whitespace-nowrap">
            {order === "desc" ? "Mais recente" : "Mais antigo"}
          </div>
        </Button>
        <select
          name="ordem"
          value={order}
          className="opacity-0 absolute h-full w-full top-0 left-0"
          onChange={(e) => onChange(e.target.value as "asc" | "desc")}
        >
          <option value="desc">Mais recente</option>
          <option value="asc">Mais antigo</option>
        </select>
      </div>
    </div>
  );
}
