import Img from "../../../../utils/ImgBase";
import { Label } from "../../../../ui/form";
import { Categorie } from "@/src/types/filtros";
import { Group } from "../hooks/useFiltersData";

export default function AudienceChips({
  groups,
  selectedIds,
  onClick,
}: {
  groups: Group[];
  selectedIds: number[];
  onClick: (c: Categorie) => void;
}) {
  const list = groups[0]?.categories ?? [];
  return (
    <div className="pb-6">
      <Label>Público-Alvo</Label>
      <div className="grid grid-cols-2 gap-2 pt-1 pb-2 md:grid-cols-3 xl:grid-cols-4">
        {list.map((c) => (
          <button
            type="button"
            key={c.id}
            className={`border cursor-pointer ease relative rounded
              ${
                selectedIds.includes(c.id)
                  ? "border-zinc-800 hover:border-zinc-500"
                  : "hover:border-zinc-300"
              }
              flex min-h-[92px] w-full min-w-0 items-center justify-center p-2.5 text-center transition-colors md:min-h-[96px] md:p-3 md:text-left`}
            onClick={() => onClick(c)}
          >
            <div className="flex min-w-0 flex-col items-center justify-center gap-2 text-center md:flex-row md:items-start md:justify-start md:gap-3 md:text-left">
              {c.icon && (
                <Img
                  src={c.icon}
                  className="h-[40px] w-[40px] shrink-0 object-contain md:h-[38px] md:w-[38px]"
                />
              )}
              <div className="min-w-0 whitespace-normal break-words text-center text-[13px] font-medium leading-4 [overflow-wrap:anywhere] md:text-left md:text-sm md:leading-5">
                {c.name}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
