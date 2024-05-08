import Api from "@/src/services/api";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Modal from "../utils/Modal";
import { Button, Label, Select } from "../ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { RelationType } from "@/src/models/relation";
import { filterRepeatRemove, getImage, moneyFormat } from "@/src/helper";
import Img from "../utils/ImgBase";
import React from "react";
import Check from "../ui/form/CheckUI";
import Colors from "../ui/form/ColorsUI";

interface QueryType {
  categories: Array<string>;
  colors: Array<string>;
  range: number;
  order: string;
}

export default function Filter(params: any) {
  const api = new Api();
  const router = useRouter();

  const [query, setQuery] = useState({
    categories: [],
    colors: [],
    range: 1000,
    order: "desc",
  } as QueryType);
  const handleQueryValues = (value: any) => {
    setQuery({ ...query, ...value });
  };
  const startQueryHandle = () => {
    console.log(router.query);

    const handleQuery: any = {
      categories: [],
    };

    if (!!router.query?.categorias?.length) {
      handleQuery["categories"] =
        typeof router.query?.categorias == "string"
          ? [router.query?.categorias]
          : router.query?.categorias;
    }

    if (!!router.query?.cores?.length) {
      handleQuery["colors"] =
        typeof router.query?.cores == "string"
          ? [router.query?.cores]
          : router.query?.cores;
    }

    if (!!router.query?.range) {
      handleQuery["range"] = router.query.range;
    }

    if (!!router.query?.ordem) {
      handleQuery["order"] = router.query.ordem;
    }

    setQuery({ ...query, ...handleQuery });
  };

  const [count, setCount] = useState(0 as number);
  useEffect(() => {
    let handle = 0;
    handle += query.categories?.length;
    handle += query.colors?.length;
    handle += query.range < 1000 ? 1 : 0;
    handle += query.order != "desc" ? 1 : 0;

    setCount(handle);
  }, [query]);

  const [filterModal, setFilterModal] = useState(false as boolean);

  const [activeChecked, setActiveChecked] = useState([] as Array<any>);
  const handleActiveChecked = (category: any) => {
    let handleActive = activeChecked.includes(category.id)
      ? activeChecked.filter((item) => item != category.id)
      : [...activeChecked, category.id];

    setActiveChecked(handleActive);

    let handleQuery = query.categories.includes(category.slug)
      ? query.categories.filter((item: any) => item != category.slug)
      : [...query.categories, category.slug];

    setQuery({ ...query, categories: handleQuery });
  };

  const [categories, setCategories] = useState([] as Array<RelationType>);
  const handleCategoriesLevelsChilds = (handle: any) => {
    let relations = [handle.parent ?? 0, ...(handle.closest ?? [])];

    if (!!handle?.childs?.length) {
      handle?.childs?.map((item: any) => {
        relations = [...relations, ...handleCategoriesLevelsChilds(item)];
      });
    }

    return filterRepeatRemove(relations);
  };

  const [categoriesLevels, setCategoriesLevels] = useState({} as any);
  const handleCategoriesLevels = (
    categories: any,
    handleLevel: any,
    level: number
  ) => {
    // --
    if (!handleLevel[level]) handleLevel[level] = [];

    handleLevel[level] = [...handleLevel[level], ...categories];

    (categories ?? []).map((item: any) => {
      if (item?.childs?.length) {
        handleLevel = handleCategoriesLevels(
          item?.childs,
          handleLevel,
          (level ?? 0) + 1
        );
      }
    });

    return handleLevel;
  };

  const openModal = () => {
    setFilterModal(true);

    if (!categories.length) {
      getFilter();
    }
  };

  const getFilter: any = async () => {
    const request: any = await api.get({
      url: "request/categories",
    });

    if (!!request.response) {
      const mainCategories: any = request.data?.filter(
        (item: any) => !item.parent
      );
      const levelCategories: any = {};

      (mainCategories ?? []).map((item: any) => {
        levelCategories[item.slug] = !!item?.childs?.length
          ? handleCategoriesLevels(item?.childs, {}, 0)
          : [];
      });

      setActiveChecked((mainCategories ?? []).map((item: any) => item.id));
      setCategories(mainCategories);
      setCategoriesLevels(levelCategories);
    }
  };

  const filterArea = useRef(null);
  const [stick, setStick] = useState(false);
  const handleStick = () => {
    const element: any = filterArea.current;
    window.addEventListener("scroll", () =>
      setStick(window.scrollY > element?.getBoundingClientRect().top + 800)
    );
  };

  useEffect(() => {
    if (!!window) {
      handleStick();
      startQueryHandle();
    }
  }, [router.query]);

  return (
    <form action="/produtos/listagem" method="GET">
      {!!params?.store && (
        <input type="hidden" value={params?.store} name="store" />
      )}

      <section ref={filterArea} className="w-full relative">
        <div className="h-[56px]"></div>
        <div
          className={`w-full z-[20] top-0 left-0 ${
            stick ? "fixed mt-[62px] md:mt-[70px]" : "absolute"
          }`}
        >
          <div
            className={`bg-cyan-500 ${
              stick ? "h-1/2" : "h-0"
            } w-full absolute top-0 left-0`}
          ></div>

          <div className="container-medium">
            <div className="flex border rounded-lg bg-white overflow-hidden relative">
              <div className="w-fit relative border-r">
                <Button
                  type="button"
                  style="btn-outline-light border-0"
                  onClick={() => openModal()}
                  className="font-normal px-3 md:pl-8 md:pr-7 h-full hover:bg-zinc-100"
                >
                  {!!count && (
                    <div className="relative -mr-1 rounded-full bg-yellow-300 p-[.55rem] text-[.55rem] font-bold">
                      <div className="text-zinc-900 absolute h-[.65rem] top-50 left-50 -translate-x-1/2 -translate-y-1/2">
                        {count}
                      </div>
                    </div>
                  )}
                  <span className="hidden md:block">Filtros </span>
                  <Icon
                    icon="fa-sliders-h"
                    className="text-zinc-900 text-xl md:text-base"
                  />
                </Button>
              </div>
              <input
                type="text"
                defaultValue={params?.busca ?? ""}
                className="w-full p-4"
                placeholder="O que você precisa?"
              />
              <div className="p-1">
                <Button className="px-3 py-2 h-full">
                  <Icon icon="fa-search" className="md:text-lg rounded-none" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Modal
        title="Filtros"
        status={filterModal}
        close={() => setFilterModal(false)}
      >
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
                  defaultValue={query.range}
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

        {!!categories?.length &&
          categories.map((mainCategory: any, key: any) => (
            <div key={key} className="pb-6">
              <Label>{mainCategory.title}</Label>
              <div className="flex -mx-4 px-4 md:grid relative overflow-x-auto scrollbar-hide">
                <div className="flex md:flex-wrap gap-2">
                  {!!categoriesLevels[mainCategory.slug] &&
                    Object.values(categoriesLevels[mainCategory.slug]).map(
                      (level: any, index: any) => (
                        <React.Fragment key={index}>
                          {level.map(
                            (category: any) =>
                              !!activeChecked.includes(category.parent) && (
                                <div
                                  key={category.id}
                                  id={`categories${category.id}`}
                                  className={`border cursor-pointer  ease relative rounded p-2 ${
                                    query.categories.includes(category.slug)
                                      ? "border-zinc-800 hover:border-zinc-500"
                                      : "hover:border-zinc-300"
                                  }`}
                                  onClick={() => handleActiveChecked(category)}
                                >
                                  <div className="px-3 md:px-1">
                                    {query.categories.includes(
                                      category.slug
                                    ) && (
                                      <input
                                        type="checkbox"
                                        name="categoria[]"
                                        value={category.slug ?? ""}
                                        defaultChecked={true}
                                        className="absolute opacity-0 z-[-1]"
                                      />
                                    )}
                                    <div
                                      className={`${
                                        mainCategory.metadata.style == "xl"
                                          ? "flex-col w-[5.6rem]"
                                          : ""
                                      } w-full flex items-center justify-center gap-2`}
                                    >
                                      {!!getImage(category.image) && (
                                        <Img
                                          src={getImage(category.image)}
                                          className={`${
                                            mainCategory.metadata.style == "xl"
                                              ? "h-[40px] w-[40px] md:h-[48px] md:w-[48px]"
                                              : mainCategory.metadata.style ==
                                                "lg"
                                              ? "md:h-[32px] md:w-[32px]"
                                              : "h-[20px] w-[20px]"
                                          }  object-contain`}
                                        />
                                      )}
                                      <div className="h-[20px] whitespace-nowrap text-sm md:text-base flex items-center">
                                        {category.title}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )
                          )}
                          <div className="w-full"></div>
                        </React.Fragment>
                      )
                    )}
                </div>
              </div>
            </div>
          ))}

        <div className="flex justify-between items-center pt-4 w-full bg-white">
          <Button
            type="button"
            className="text-sm"
            style="btn-link"
            href="/produtos/listagem/"
          >
            Limpar filtro
          </Button>

          <Button>Ver resultados</Button>
        </div>
      </Modal>
    </form>
  );
}
