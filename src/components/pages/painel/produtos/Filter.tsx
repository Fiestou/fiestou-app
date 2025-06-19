import Api from "@/src/services/api";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { filterRepeatRemove, getImage, moneyFormat } from "@/src/helper";
import React from "react";
import { Button, Label } from "@/src/components/ui/form";
import Colors from "@/src/components/ui/form/ColorsUI";
import Img from "@/src/components/utils/ImgBase";
import { FilterQueryType } from "@/src/components/common/Filter";
import { GroupsResponse } from "@/src/types/filtros/response";

interface FilterPainelType {
    status: boolean;
    onFilter: Function;
    onClose: Function;
}

interface Categorie {
    id: number;
    name: string;
    icon?: string;
    description?: string;
    active: number;
    created_at: string;
    updated_at: string;
    group_id: number;
    element_related_id?: number[];
}

interface Group {
    id: number;
    name: string;
    description?: string;
    active: number;
    segment: number;
    created_at: string;
    updated_at: string;
    categories: Categorie[];
}

const initQuery: FilterQueryType = {
    categories: [],
    colors: [],
    range: 1000,
    order: "desc",
};

export default function Filter(attrs: FilterPainelType) {
    const api = new Api();
    const router = useRouter();
    const [pblcAlvo, setPblcAlvo] = useState<Group[]>([]);
    const [query, setQuery] = useState<FilterQueryType>(initQuery);
    const [allGroups, setAllGroups] = useState<Group[]>([]);
    const [displayedGroups, setDisplayedGroups] = useState<Group[]>([]);
    const [activeElements, setActiveElements] = useState<number[]>([]);

    const handleQueryValues = (value: any) => {
        setQuery({ ...query, ...value });
    };
    
    const getGrouptargetadc = async () => {
        const api = new Api();
        try {
            const request = await api.request<GroupsResponse>({
                method: "get",
                url: "app/group/targetadc",
            });
            if (request) {
                setPblcAlvo(
                    request.data.map((group: any) => ({
                        segment: 0, // or provide a suitable default or mapping
                        ...group,
                    }))
                );
            }
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
    };

    const emitSearch = () => {
        const elementNames = displayedGroups
            .flatMap(group => group.categories)
            .filter(el => activeElements.includes(el.id))
            .map(el => el.name);

        !!attrs.onFilter && attrs.onFilter({ ...query, elements: elementNames });
    };

    const handleElementClick = (categorie: Categorie) => {
        const isChecked = activeElements.includes(categorie.id);

        if (isChecked) {
            setActiveElements(activeElements.filter((id) => id !== categorie.id));
            removeRelatedGroups(categorie);
        } else {
            setActiveElements([...activeElements, categorie.id]);
            filterRelatedGroups(categorie);
        }
    };

    const filterRelatedGroups = (clickedElement: Categorie) => {
        if (!clickedElement.element_related_id || clickedElement.element_related_id.length === 0) {
            return;
        }

        const relatedElementIds = clickedElement.element_related_id;
        const newDisplayedGroups = [...displayedGroups];
        const displayedGroupIds = newDisplayedGroups.map(g => g.id);

        allGroups.forEach(group => {
            const shouldDisplay = group.categories.some(el => relatedElementIds.includes(el.id) && !activeElements.includes(el.id));
            if (shouldDisplay && !displayedGroupIds.includes(group.id)) {
                newDisplayedGroups.push(group);
            }
        });

        setDisplayedGroups(newDisplayedGroups);
    };

    const removeRelatedGroups = (clickedElement: Categorie) => {
      const relatedElementIds = clickedElement.element_related_id;

      const updatedDisplayedGroups = displayedGroups.filter(group => {
          const hasActiveElementInGroup = group.categories.some(el => activeElements.includes(el.id) && el.id !== clickedElement.id);
          const isOriginalFirstGroup = allGroups[0]?.id === group.id;
          const isRelatedToDeselected = group.categories.some(el => relatedElementIds?.includes(el.id));
          const isCurrentlyRelatedToActive = allGroups.some(g => g.id === group.id && g.categories.some(e => activeElements.includes(e.id) && e.element_related_id?.includes(clickedElement.id)));

            return hasActiveElementInGroup || isOriginalFirstGroup || !isRelatedToDeselected || isCurrentlyRelatedToActive;
        });

        setDisplayedGroups(updatedDisplayedGroups);

        if (activeElements.length === 0) {
            setDisplayedGroups([allGroups[0]]);
        }
    };

    const getFilterData = async () => {
        const request: any = await api.request({
            method: "get",
            url: "group/list",
        });
        if (!!request.response && Array.isArray(request.data)) {
            setAllGroups(request.data);
            setDisplayedGroups([request.data[0]]);
        }
    };

    useEffect(() => {
        getFilterData();
        getGrouptargetadc();
    }, []);

    return attrs.status ? (
        <div className="fixed inset-0 w-full h-full z-[50] overflow-auto">
            <div
                onClick={() => !!attrs?.onClose && attrs.onClose()}
                className="fixed inset-0 w-full h-full bg-zinc-950/40"
            ></div>
            <div className="fixed w-full top-0 left-0 flex gap-4">
                <div className="w-full flex justify-end">
                    <button
                        type="button"
                        className="text-white text-xl px-4 py-3"
                        onClick={() => !!attrs?.onClose && attrs.onClose()}
                    >
                        <Icon icon="fa-times" />
                    </button>
                </div>
                <div className="w-full max-w-[32rem]"></div>
            </div>
            <div className="relative max-w-[32rem] ml-auto bg-white flex flex-col min-h-full p-4 md:p-6">
                <div className="w-full flex items-start border-b mb-5">
                    <h4 className="text-xl text-zinc-900 w-full pb-2">Filtros</h4>
                </div>

                <div>
                    <div className="pb-6">
                        <Label>Ordenar por</Label>
                        <div className="relative">
                            <Button
                                type="button"
                                style="btn-outline-light"
                                className="font-normal w-full justify-start flex px-3 md:px-5 h-full"
                            >
                                <Icon
                                    icon={
                                        query.order == "desc"
                                            ? "fa-sort-amount-down"
                                            : "fa-sort-amount-up"
                                    }
                                    className="text-zinc-900 text-xl md:text-base"
                                />
                                <div className="hidden md:block whitespace-nowrap">
                                    {query.order == "desc" ? "Mais recente" : "Mais antigo"}
                                </div>
                            </Button>
                            <select
                                name="ordem"
                                value={query.order ?? "desc"}
                                className="opacity-0 absolute h-full w-full top-0 left-0"
                                onChange={(e: any) =>
                                    handleQueryValues({ order: e.target.value })
                                }
                            >
                                {[
                                    {
                                        name: "Mais recente",
                                        value: "desc",
                                    },
                                    {
                                        name: "Mais antigo",
                                        value: "asc",
                                    },
                                ].map((item: any, key: any) => (
                                    <option value={item.value} key={key}>
                                        {item.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="pb-6">
                        <Label>Faixa de preço</Label>
                        <div className="grid gap-2 py-1">
                            <div className="text-sm">
                                Exibir produtos até R$ {moneyFormat(query.range)}
                            </div>
                            <div className="">
                                <div className="flex text-sm justify-between">
                                    <span>R$ {moneyFormat(10)}</span>
                                    <span>R$ {moneyFormat(1000)}</span>
                                </div>
                                <div className="range-control">
                                    <input
                                        value={query.range ?? 1000}
                                        min="10"
                                        max="1000"
                                        step="10"
                                        type="range"
                                        name="range"
                                        className="w-full"
                                        onChange={(e: any) =>
                                            handleQueryValues({ range: e.target.value })
                                        }
                                    />
                                    <span
                                        style={{
                                            width: `${(100 * query.range) / 1000}%`,
                                        }}
                                    ></span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pb-6">
                        <Label>Cores</Label>
                        <div className="flex gap-1 pt-1 pb-2">
                            <Colors
                                name="cores"
                                value={query.colors}
                                onChange={(value: any) => handleQueryValues({ colors: value })}
                            />
                        </div>
                    </div>
                </div>
                <div className="pb-6">
                    <Label>Público-Alvo</Label>
                    <div className="flex gap-2 pt-1 pb-2">
                        {(pblcAlvo[0]?.categories ?? []).map((element) => {
                            const isSelected = activeElements.includes(element.id);
                            return (
                                <div
                                    key={element.id}
                                    className={`
                                        border cursor-pointer ease relative rounded
                                        ${isSelected
                                            ? "border-black"
                                            : "border-zinc-300 hover:border-zinc-500"
                                        }
                                        flex flex-col items-center p-2 w-auto
                                    `}
                                    onClick={() => { handleElementClick(element) }}
                                >
                                    {element.icon && (
                                        <Img
                                            src={element.icon}
                                            className="object-contain h-[40px] w-[40px]"
                                        />
                                    )}
                                    <div className="text-sm md:text-base text-center font-medium">
                                        {element.name}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
                <div>
                    {displayedGroups.map((group) => (
                        <div key={group.id} className="pb-6">
                            <Label>{group.name}</Label>
                            <div className="flex -mx-4 px-4 md:grid relative overflow-x-auto scrollbar-hide">
                                <div className="flex md:flex-wrap gap-2">
                                    {group.categories.map((categorie) => (
                                        <div
                                            key={categorie.id}
                                            className={`border cursor-pointer ease relative rounded p-2 ${
                                                activeElements.includes(categorie.id)
                                                    ? "border-zinc-800 hover:border-zinc-500"
                                                    : "hover:border-zinc-300"
                                            }`}
                                            onClick={() => handleElementClick(categorie)}
                                        >
                                            <div className="px-3 md:px-1 flex items-center gap-2">
                                                {!!categorie.icon && (
                                                    <Img
                                                        src={categorie.icon}
                                                        className={`h-[20px] w-[20px] object-contain`}
                                                    />
                                                )}
                                                <div className="h-[20px] whitespace-nowrap text-sm md:text-base flex items-center">
                                                    {categorie.name}
                                                </div>
                                                {activeElements.includes(categorie.id) && (
                                                    <input
                                                        type="checkbox"
                                                        name="elemento[]"
                                                        value={categorie.id}
                                                        defaultChecked={true}
                                                        className="absolute opacity-0 z-[-1]"
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
            {/* esse filtro dinamico */}
                        </div>
                    ))}
                </div>

                <div className="flex relative justify-between items-center pt-4 w-full bg-white">
                    <Button
                        type="button"
                        onClick={() => setQuery(initQuery)}
                        className="text-sm"
                        style="btn-link"
                    >
                        Limpar filtro
                    </Button>

                    <Button type="button" onClick={() => emitSearch()}>
                        Ver resultados
                    </Button>
                </div>
            </div>
            <style global jsx>{`
                body,
                html {
                    overflow: hidden;
                }
            `}</style>
        </div>
    ) : (
        <></>
    );
}