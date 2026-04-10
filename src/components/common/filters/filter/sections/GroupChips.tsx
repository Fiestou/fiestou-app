import Img from "../../../../utils/ImgBase";
import { Label } from "../../../../ui/form";
import { Group } from "../hooks/useFiltersData";
import { Categorie } from "@/src/types/filtros";

export default function GroupChips({
  groups, selectedIds, onClick,
}: { groups: Group[]; selectedIds: number[]; onClick: (c: Categorie) => void; }) {
  return (
    <>
      {(groups ?? []).map((group) => (
        <div key={group.id} className="pb-6">
          <Label>{group.name}</Label>
          <div className="pt-1">
            <div className="grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-4">
              {group.categories.map((el) => (
                <button
                  type="button"
                  key={el.id}
                  className={`border cursor-pointer ease relative rounded
                    ${selectedIds.includes(el.id) ? "border-zinc-800 hover:border-zinc-500" : "hover:border-zinc-300"}
                    flex min-h-[92px] w-full min-w-0 items-center justify-center p-2.5 text-center transition-colors md:min-h-[96px] md:p-3 md:text-left`}
                  onClick={() => onClick(el)}
                >
                  <div
                    className="flex min-w-0 flex-col items-center justify-center gap-2 text-center md:flex-row md:items-start md:justify-start md:gap-3 md:text-left"
                  >
                    {el.icon && (
                      <Img
                        src={el.icon}
                        className={`object-contain ${
                          group.id === groups[0]?.id
                            ? "h-[40px] w-[40px] shrink-0 md:h-[38px] md:w-[38px]"
                            : "h-[34px] w-[34px] shrink-0 md:h-[26px] md:w-[26px]"
                        }`}
                      />
                    )}
                    <div
                      className={`min-w-0 whitespace-normal break-words [overflow-wrap:anywhere] text-center text-[13px] leading-4 md:text-left md:text-sm md:leading-5 ${
                        group.id === groups[0]?.id
                          ? "font-medium"
                          : "font-normal"
                      }`}
                    >
                      {el.name}
                    </div>
                    {selectedIds.includes(el.id) && (
                      <input type="checkbox" name="categoria[]" value={el.name} defaultChecked className="absolute opacity-0 z-[-1]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
