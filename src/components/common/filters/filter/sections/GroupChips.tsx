import Img from "../../../../utils/ImgBase";
import { Label } from "../../../../ui/form";
import { Group } from "../hooks/useFiltersData";
import { Categorie } from "@/src/types/filtros";

export default function GroupChips({
  groups, selectedIds, onClick,
}: { groups: Group[]; selectedIds: number[]; onClick: (c: Categorie) => void; }) {
  return (
    <>
      {(groups ?? []).map((group, idx0) => (
        <div key={group.id} className="pb-6">
          <Label>{group.name}</Label>
          <div className="flex -mx-4 px-4 md:grid relative overflow-x-auto scrollbar-hide">
            <div className={`flex md:flex-wrap gap-2 ${group.id === groups[0]?.id ? "space-x-2" : ""}`}>
              {group.categories.map((el) => (
                <div
                  key={el.id}
                  className={`border cursor-pointer ease relative rounded
                    ${selectedIds.includes(el.id) ? "border-zinc-800 hover:border-zinc-500" : "hover:border-zinc-300"}
                    flex flex-col items-center p-2 w-auto`}
                  onClick={() => onClick(el)}
                >
                  <div className={`flex items-center gap-2 ${group.id === groups[0]?.id ? "flex-col" : "flex-row whitespace-nowrap"}`}>
                    {el.icon && (
                      <Img
                        src={el.icon}
                        className={`object-contain ${group.id === groups[0]?.id ? "h-[40px] w-[40px]" : "h-[20px] w-[20px] flex-shrink-0"}`}
                      />
                    )}
                    <div className={`text-sm md:text-base ${group.id === groups[0]?.id ? "text-center font-medium" : "font-normal whitespace-nowrap"}`}>
                      {el.name}
                    </div>
                    {selectedIds.includes(el.id) && (
                      <input type="checkbox" name="categoria[]" value={el.name} defaultChecked className="absolute opacity-0 z-[-1]" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
