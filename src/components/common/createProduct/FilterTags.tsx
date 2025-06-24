import { useEffect, useState } from "react";
import Api from "@/src/services/api";
import Img from "@/src/components/utils/ImgBase";
import { Label, Button } from "@/src/components/ui/form";
import { categorie } from "@/src/store/filter";

interface Categorie {
    id: number;
    name: string;
    icon?: string;
    element_related_id?: number[];
}

interface Group {
    id: number;
    name: string;
    categories: Categorie[];
}

interface FilterTagsProps {
    status: boolean;
    onFilter?: (categorie: Categorie[]) => void;
    onClose?: () => void;
    clickedElements: Categorie[];

}

export default function FilterTags({
    status,
    onFilter,
    onClose,
    clickedElements,
}: FilterTagsProps) {
    const api = new Api();
    const [allGroups, setAllGroups] = useState<Group[]>([]);
    const [displayedGroups, setDisplayedGroups] = useState<Group[]>([]);
    const [activeElements, setActiveElements] = useState<number[]>([]);

    useEffect(() => {
        const selectedIds = clickedElements.map((el) => el.id);
        setActiveElements((prevActive) =>
            prevActive.filter((id) => selectedIds.includes(id)).length === selectedIds.length
                ? selectedIds
                : selectedIds
        );
    }, [clickedElements]);
    
    useEffect(() => {
        if (!status) return;
        const getFilterData = async () => {
            const request: any = await api.request({
                method: "get",
                url: "group/list",
            });
            if (Array.isArray(request.data)) {
                setAllGroups(request.data);
                setDisplayedGroups(request.data);
            }
        };
        getFilterData();
    }, [status]);

    const handleElementClick = (categorie: Categorie) => {
        const isChecked = activeElements.includes(categorie.id);

        if (isChecked) {
            setActiveElements(activeElements.filter((id) => id !== categorie.id));
        } else {
            setActiveElements([...activeElements, categorie.id]);
        }
    };

    if (!status) return null;

    return (
        <div className="static left-0 top-full mt-2 z-50 w-full">
            <div className="bg-white rounded shadow-lg border p-4">
                {displayedGroups.map((group) => (
                    <div key={group.id} className="pb-6">
                        <Label>{group.name}</Label>
                        <div className="flex -mx-4 px-4 md:grid relative overflow-x-auto scrollbar-hide">
                            <div className="flex md:flex-wrap gap-2">
                                {group.categories.map((element) => (
                                    <div
                                        key={element.id}
                                        className={`border cursor-pointer ease relative rounded p-2 ${activeElements.includes(element.id)
                                            ? "border-zinc-800 hover:border-zinc-500"
                                            : "hover:border-zinc-300"
                                            }`}
                                        onClick={() => handleElementClick(element)}
                                    >
                                        <div className="px-3 md:px-1 flex items-center gap-2">
                                            {!!element.icon && (
                                                <Img
                                                    src={element.icon}
                                                    className={`h-[20px] w-[20px] object-contain`}
                                                />
                                            )}
                                            <div className="h-[20px] whitespace-nowrap text-sm md:text-base flex items-center">
                                                {element.name}
                                            </div>
                                            {activeElements.includes(element.id) && (
                                                <input
                                                    type="checkbox"
                                                    name="elemento[]"
                                                    value={element.id}
                                                    defaultChecked={true}
                                                    className="absolute opacity-0 z-[-1]"
                                                />
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
                <div className="flex justify-between pt-4">
                    <Button type="button" onClick={onClose}>
                        Fechar
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            // Busca os objetos completos dos elementos selecionados
                            const selectedElements = displayedGroups
                                .flatMap(group => group.categories)
                                .filter(element => activeElements.includes(element.id));
                            onFilter?.(selectedElements);
                        }}
                    >
                        Adicionar Categorias
                    </Button>
                </div>
            </div>
        </div>
    );
};