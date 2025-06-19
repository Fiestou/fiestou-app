import { useRouter } from "next/router";
import { use, useEffect, useRef, useState } from "react";

import Icon from "@/src/icons/fontAwesome/FIcon";
import { moneyFormat } from "@/src/helper";

import React from "react";

import { Group, useGroup } from "@/src/store/filter";
import { GroupsResponse } from "@/src/types/filtros/response";
import Api from "@/src/services/api";
import { Button, Label } from "@/src/components/ui/form";
import Modal from "@/src/components/utils/Modal";
import Colors from "@/src/components/ui/form/ColorsUI";
import Img from "@/src/components/utils/ImgBase";
import { FilterQueryType } from "@/src/types/filtros/request";
import { StoreType } from "@/src/models/store";

export interface categories {
    id: number
    name: string
    icon: string
    checked?: boolean
    description?: string
    groupName?: string
    active?: number
    created_at?: string
    updated_at?: string
    group_id?: number,
    element_related_id?: number[]
}
export interface FilterProps {
    store?: StoreType;
    returnData?: (dataProducts: FilterQueryType) => void;
}

export default function FilterStore({ returnData,store }: FilterProps) {
    const router = useRouter();
    const [busca, setBusca] = useState<string>("");
    const [query, setQuery] = useState<FilterQueryType>({
        categories: [],
        colors: [],
        range: 1000,
        order: "desc",
    });

    const handleQueryValues = (value: Partial<FilterQueryType>) => {
        setQuery({ ...query, ...value });
    };

    const startQueryHandle = () => {
        const routerQuery = router.query as {
            categorias?: string | string[];
            "categoria[]"?: string | string[];
            cores?: string | string[];
            range?: string;
            ordem?: string;
        };

        const handleQuery: Partial<FilterQueryType> = {
            categories: [],
        };

        if (routerQuery?.cores?.length) {
            handleQuery["colors"] =
                typeof routerQuery.cores === "string"
                    ? [routerQuery.cores]
                    : routerQuery.cores;
        }

        if (routerQuery?.range) {
            handleQuery["range"] = parseInt(routerQuery.range, 10);
        }

        if (routerQuery?.ordem) {
            handleQuery["order"] = routerQuery.ordem;
        }

        setQuery({ ...query, ...handleQuery });
    };

    const [count, setCount] = useState<number>(0);

    useEffect(() => {
        let handle = 0;
        handle += query.categories.length;
        handle += query.colors.length;
        handle += query.range < 1000 ? 1 : 0;
        handle += query.order !== "desc" ? 1 : 0;

        setCount(handle);
    }, [query]);

    const [filterModal, setFilterModal] = useState<boolean>(false);
    const filterArea = useRef<HTMLDivElement>(null);
    const [stick, setStick] = useState<boolean>(false);
    const { groups } = useGroup();
    const [localGroups, setLocalGroups] = useState<Group[]>([]);
    const [pblcAlvo, setPblcAlvo] = useState<Group[]>([]);
    const api = new Api();

    // Fetch groups from API and set to local state
    const getGrouptargetadc = async () => {
        const api = new Api();
        try {
            const request = await api.request<GroupsResponse>({
                method: "get",
                url: "group/targetadcpbl",
            });
            if (request) {
                setPblcAlvo(request.data);
            }
        } catch (error) {
            console.error("Error fetching groups:", error);
        }
    };

    const getGroups = async () => {
        try {
            const request = await api.request<GroupsResponse>({
                method: "get",
                url: "group/listgroupstore",
                data: {
                    store_id: store?.id,
                },
            });


                setLocalGroups([request.data[0]]);

        } catch (error) {
            console.error("Error fetching groups:", error);
        }
    }

    useEffect(() => {
        getGrouptargetadc()
        getGroups()
    }, [groups]);

    const handleElementClick = (element: categories) => {
        const isSelected = query.categories.includes(element.id);
        const api = new Api();

        const updatedCategories = isSelected
            ? query.categories.filter((id) => id !== element.id)
            : [...query.categories, element.id];

        handleQueryValues({ categories: updatedCategories });

        if (isSelected) {
            removeRelatedElements(element);
        } else {
            filterTree(element);
        }
    };

    const filterTree = (clickedElement: categories) => {
        if (!clickedElement.element_related_id || clickedElement.element_related_id.length === 0) {
            return;
        }

        const relatedElement = groups
            .flatMap(group => group.categories)
            .find(el => clickedElement.element_related_id?.includes(el.id));

        const relatedGroup = groups.find(group => group.id === relatedElement?.group_id);
        if (!relatedGroup) return;

        const filteredElements = relatedGroup.categories.filter(el =>
            clickedElement.element_related_id?.includes(el.id)
        );

        const filteredGroup: Group = {
            ...relatedGroup,
            categories: filteredElements,
        };

        setLocalGroups(prev => {
            const indexInPrev = prev.findIndex(group => group.id === relatedGroup.id);

            if (indexInPrev !== -1) {
                const updated = [...prev];
                updated[indexInPrev].categories = [
                    ...updated[indexInPrev].categories,
                    ...filteredGroup.categories.filter(
                        el => !updated[indexInPrev].categories.some(existingEl => existingEl.id === el.id)
                    ),
                ];
                return updated;
            }

            const updated = [...prev];
            const indexInGroups = groups.findIndex(g => g.id === relatedGroup.id);

            let insertIndex = updated.length;
            for (let i = 0; i < updated.length; i++) {
                const groupIndex = groups.findIndex(g => g.id === updated[i].id);
                if (groupIndex > indexInGroups) {
                    insertIndex = i;
                    break;
                }
            }

            updated.splice(insertIndex, 0, filteredGroup);
            return updated;
        });

    };

    const removeRelatedElements = (clickedElement: categories) => {
        if (!clickedElement.element_related_id || clickedElement.element_related_id.length === 0) {
            return;
        }

        const otherSelectedElements = query.categories.filter(id => id !== clickedElement.id);
        const otherRelatedIds = groups
            .flatMap(group => group.categories)
            .filter(el => otherSelectedElements.includes(el.id))
            .flatMap(el => el.element_related_id || []);

        setLocalGroups(prev =>
            prev.map(group => ({
                ...group,
                elements: group.categories.filter(
                    el =>
                        !clickedElement.element_related_id?.includes(el.id) ||
                        otherRelatedIds.includes(el.id)
                ),
            })).filter(group => group.elements.length > 0)
        );


    };
    
    const openModal = () => {
        setFilterModal(true);
    };

    const handleStick = () => {
        const element = filterArea.current;
        if (element) {
            window.addEventListener("scroll", () =>
                setStick(window.scrollY > element.getBoundingClientRect().top + 800)
            );
        }
    };
    useEffect(() => {
        if (typeof window !== "undefined") {
            handleStick();
            startQueryHandle();
        }
    }, [router.query]);

    return (
        <form method="GET" onSubmit={e => e.preventDefault()}>

            <section ref={filterArea} className="w-full relative">
                <div className="h-[56px]"></div>
                <div
                    className={`w-full z-[20] top-0 left-0 ${stick ? "fixed mt-[62px] md:mt-[70px]" : "absolute"}`}
                >
                    <div className={`bg-cyan-500 ${stick ? "h-1/2" : "h-0"} w-full absolute top-0 left-0`}></div>

                    <div className="container-medium">
                        <div className="flex border rounded-lg bg-white overflow-hidden relative">
                            <div className="w-fit relative p-1">
                                <Button
                                    type="button"
                                    onClick={() => openModal()}
                                    className="font-normal py-2 px-3 md:pl-8 md:pr-7 h-full"
                                >
                                    <span className="hidden md:block">Filtros</span>
                                    {!!count ? (
                                        <div className="relative bg-zinc-950 -mr-1 rounded-full bg-yellow-300 p-[.55rem] text-[.55rem] font-bold">
                                            <div className="text-white absolute h-[.65rem] top-50 left-50 -translate-x-1/2 -translate-y-1/2">
                                                {count}
                                            </div>
                                        </div>
                                    ) : (
                                        <Icon icon="fa-sliders-h" className="text-zinc-900 text-xl md:text-base" />
                                    )}
                                </Button>
                            </div>
                            <input
                                type="text"
                                name="busca"
                                value={busca}
                                onChange={(e) => setBusca(e.target.value)}
                                className="w-full p-4"
                                placeholder="O que você precisa?"
                            />
                            <div className="p-1">
                                <Button className="px-3 py-2 h-full">
                                    <Icon icon="fa-search" type="far" className="md:text-lg rounded-none" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Modal title="Filtros" status={filterModal} close={() => setFilterModal(false)}>
                <div className="pb-6">
                    <Label>Ordenar por</Label>
                    <div className="relative">
                        <Button
                            type="button"
                            style="btn-outline-light"
                            className="font-normal w-full justify-start flex px-3 md:px-5 h-full"
                        >
                            <Icon
                                icon={query.order === "desc" ? "fa-sort-amount-down" : "fa-sort-amount-up"}
                                className="text-zinc-900 text-xl md:text-base"
                            />
                            <div className="hidden md:block whitespace-nowrap">
                                {query.order === "desc" ? "Mais recente" : "Mais antigo"}
                            </div>
                        </Button>
                        <select
                            name="ordem"
                            value={query.order ?? "desc"}
                            className="opacity-0 absolute h-full w-full top-0 left-0"
                            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                handleQueryValues({ order: e.target.value })
                            }
                        >
                            {[
                                { name: "Mais recente", value: "desc" },
                                { name: "Mais antigo", value: "asc" },
                            ].map((item, key) => (
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
                        <div className="text-sm">Exibir produtos até R$ {moneyFormat(query.range)}</div>
                        <div className="">
                            <div className="flex text-sm justify-between">
                                <span>R$ {moneyFormat(10)}</span>
                                <span>R$ {moneyFormat(1000)}</span>
                            </div>
                            <div className="range-control">
                                <input
                                    defaultValue={query.range}
                                    min="10"
                                    max="1000"
                                    step="10"
                                    type="range"
                                    name="range"
                                    className="w-full"
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                                        handleQueryValues({ range: parseInt(e.target.value, 10) })
                                    }
                                />
                                <span style={{ width: `${(100 * query.range) / 1000}%` }}></span>
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
                            onChange={(value: string[]) => handleQueryValues({ colors: value })}
                        />
                    </div>
                </div>

                <div className="pb-6">
                    <Label>Público-Alvo</Label>
                    <div className="flex gap-2 pt-1 pb-2">
                        {(pblcAlvo[0]?.categories ?? []).map((categorie) => (
                            <div
                                key={categorie.id}
                                className={`
          border cursor-pointer ease relative rounded
              ${query.categories.includes(categorie.id)
                                        ? "border-zinc-800 hover:border-zinc-500"
                                        : "hover:border-zinc-300"
                                    }
              flex flex-col items-center p-2 w-auto
        `}
                                onClick={() => { handleElementClick(categorie) }}

                            >
                                {categorie.icon && (
                                    <Img
                                        src={categorie.icon}
                                        className="object-contain h-[40px] w-[40px]"
                                    />
                                )}
                                <div className="text-sm md:text-base text-center font-medium">
                                    {categorie.name}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {Array.isArray(localGroups) && localGroups.length > 0 &&
    localGroups
        .filter(group => group && group.name)
        .map((group) => (
            <div key={group.id} className="pb-6">
                <Label>{group.name}</Label>
                <div className="flex -mx-4 px-4 md:grid relative overflow-x-auto scrollbar-hide">
                    <div className={`flex md:flex-wrap gap-2 ${group.id === localGroups[0]?.id ? "space-x-2" : ""}`}>
                        {(group.categories ?? []).map((element) => (
                            <div
                                key={element.id}
                                className={`
              border cursor-pointer ease relative rounded
              ${query.categories.includes(element.id)
                                                ? "border-zinc-800 hover:border-zinc-500"
                                                : "hover:border-zinc-300"
                                            }
              flex flex-col items-center p-2 w-auto
            `}
                                onClick={() => { handleElementClick(element) }}
                            >
                                <div className={`flex items-center gap-2 ${group.id === localGroups[0]?.id ? "flex-col" : "flex-row whitespace-nowrap"}`}>
                                    {element.icon && (
                                        <Img
                                            src={element.icon}
                                            className={`object-contain ${group.id === localGroups[0]?.id
                                                ? "h-[40px] w-[40px]"
                                                : "h-[20px] w-[20px] flex-shrink-0"
                                                }`}
                                        />
                                    )}

                                    <div
                                        className={`text-sm md:text-base ${group.id === localGroups[0]?.id
                                            ? "text-center font-medium"
                                            : "font-normal whitespace-nowrap"
                                            }`}
                                    >
                                        {element.name}
                                    </div>

                                    {query.categories.includes(element.id) && (
                                        <input
                                            type="checkbox"
                                            name="categoria[]"
                                            value={element.name}
                                            defaultChecked
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

                <div className="flex justify-between items-center pt-4 w-full bg-white">
                    <Button
                        type="button"
                        className="text-sm"
                        style="btn-link"
                        onClick={() => {
                            const cleanQuery = {
                                categories: [],
                                colors: [],
                                range: 1000,
                                order: "desc",
                            };
                            setQuery(cleanQuery);
                            setFilterModal(false);
                            returnData && returnData(cleanQuery);
                        }}
                    >
                        Limpar filtro
                    </Button>
                    <Button
                        type="button"
                        onClick={() => {
                            setFilterModal(false); // fecha o modal
                            returnData && returnData(query); // envia os filtros atuais
                        }}
                    >Ver resultados</Button>
                </div>
            </Modal>
        </form>
    );
}