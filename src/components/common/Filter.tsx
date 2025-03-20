import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Modal from "../utils/Modal";
import { Button, Label } from "../ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { moneyFormat } from "@/src/helper";
import Img from "../utils/ImgBase";
import React from "react";
import Check from "../ui/form/CheckUI";
import Colors from "../ui/form/ColorsUI";
import { Group, useGroup } from "@/src/store/filter";

export interface FilterQueryType {
  categories: number[];
  colors: string[];
  range: number;
  order: string;
}

export interface Element {
  id: number;
  name: string;
  icon: string;
  description: string;
  active: number;
  created_at: string;
  updated_at: string;
  laravel_through_key: number;
  checked: boolean;
  descendants?: Element[];
  slug?: string;
}

export default function Filter(params: { store?: string; busca?: string }) {
  const router = useRouter();

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
  const [localGroups, setLocalGroups] = useState<Group[]>(groups);

  const onClickElementFilter = (elementId: number, checked: boolean, descendants: Element[]) => {
    let checkedGroupElements: Group[] = [];
    let updateLocalGroups = localGroups
      .map((group) => ({
        ...group,
        elements: group.elements
          .map((element) => {
            if (element.id === elementId) {
              if (!element.checked === true) {
                checkedGroupElements.push(group)
              }
              return { ...element, checked: !element.checked };
            }
            return element;
          })
      }))

    let positionGroup = 0;
    let lastGroup: Group;
    for (let i = 0; i < updateLocalGroups.length; i++) {
      const localGroup = updateLocalGroups[i];

      if (localGroup.elements.some(element => element.id === elementId)) {
        lastGroup = localGroup;
        positionGroup = i;
      }
    }

    if (updateLocalGroups.length + 1 > positionGroup + 1) {
      let finalGroups: Group[] = updateLocalGroups;

      finalGroups.map((group, index) => {
        let groupGlobal = groups.find((groupGlobal) => group.id === groupGlobal.id);
        let elements: Element[] = [];

        if (index === positionGroup + 1) {
          if (!checked === true) {
            groupGlobal?.elements.map((element) => {
              if (descendants.some((descendant) => descendant.id === element.id) && !elements.includes(element)) {
                elements.push(element)
              }

            })
            lastGroup.elements.find((lastsElements) => lastsElements.checked === true)

            group.elements = elements;
          } else {
            group.elements = groupGlobal?.elements || []
          }
        }
      })

      setLocalGroups(finalGroups);
    }
  };

  useEffect(() => {

  }, [localGroups])

  useEffect(() => {
    setLocalGroups(groups);
  }, [groups]);

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
    <form action="/produtos/listagem" method="GET">
      {params?.store && <input type="hidden" value={params.store} name="store" />}

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
                  <span className="hidden md:block">Filtros </span>
                  {count ? (
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
                defaultValue={params?.busca ?? ""}
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

        {localGroups.map((group, index) => (
          <div key={index} className="pb-6">
            <Label>{group.name}</Label>
            <div className="flex -mx-4 px-4 md:grid relative overflow-x-auto scrollbar-hide">
              <div className="flex md:flex-wrap gap-2">
                {group.elements.map((element: Element) => (
                  <div
                    key={element.id}
                    className={`border cursor-pointer ease relative rounded p-2 ${element.checked
                      ? "border-zinc-800 hover:border-zinc-500"
                      : "hover:border-zinc-300"
                      }`}
                    onClick={() => {
                      onClickElementFilter(element.id, element.checked, element.descendants || [])
                    }}
                  >
                    <div className="px-3 md:px-1 flex items-center gap-2">
                      {element.icon && (
                        <Img src={element.icon} className="h-[20px] w-[20px] object-contain" />
                      )}
                      <div className="h-[20px] whitespace-nowrap text-sm md:text-base">
                        {element.name}
                      </div>
                      {query.categories.includes(element.id) && (
                        <input
                          type="checkbox"
                          name="categoria[]"
                          value={element.slug || element.name}
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

        <div className="flex justify-between items-center pt-4 w-full bg-white">
          <Button type="button" className="text-sm" style="btn-link" href="/produtos/listagem/">
            Limpar filtro
          </Button>
          <Button>Ver resultados</Button>
        </div>
      </Modal>
    </form>
  );
}