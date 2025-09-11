import Img from "../../../../utils/ImgBase";
import { Label } from "../../../../ui/form";
import { Categorie } from "@/src/types/filtros";
import { Group } from "../hooks/useFiltersData";

export default function AudienceChips({
  groups, selectedIds, onClick,
}: { groups: Group[]; selectedIds: number[]; onClick: (c: Categorie) => void; }) {
  const list = groups[0]?.categories ?? [];
  return (
    <div className="pb-6">
      <Label>Público-Alvo</Label>
      <div className="flex gap-2 pt-1 pb-2">
        {list.map((c) => (
          <div
            key={c.id}
            className={`border cursor-pointer ease relative rounded
              ${selectedIds.includes(c.id) ? "border-zinc-800 hover:border-zinc-500" : "hover:border-zinc-300"}
              flex flex-col items-center p-2 w-auto`}
            onClick={() => onClick(c)}
          >
            {c.icon && <Img src={c.icon} className="object-contain h-[40px] w-[40px]" />}
            <div className="text-sm md:text-base text-center font-medium">{c.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
