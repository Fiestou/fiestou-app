import { Button, Input, Label, Select } from "@/src/components/ui/form";
import { StoreCategoryType } from "@/src/models/store";
import Api from "@/src/services/api";
import React, { useEffect, useRef, useState } from "react";
import Modal from "../utils/Modal";
import Check from "../ui/form/CheckUI";
import Img from "../utils/ImgBase";
import { getImage, moneyFormat, filterRepeatRemove } from "@/src/helper";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Colors from "../ui/form/ColorsUI";
import { RelationType } from "@/src/models/relation";
import { useRouter } from "next/router";

export default function Filter__(params: any) {
  const api = new Api();
  const router = useRouter();
  const query = router.query;

  const count =
    (!!Object.values(query).length ? 1 : 0) +
    (!!parseInt(query?.range?.toString() ?? "0") ? 1 : 0) +
    (!!query?.rate?.length ? 1 : 0) +
    (!!query?.busca ? 1 : 0) +
    (!!query?.cores
      ? typeof query?.cores == "string"
        ? 1
        : query?.cores?.length
      : 0) +
    (!!query?.categoria
      ? typeof query?.categoria == "string"
        ? 1
        : query?.categoria?.length
      : 0);

  const [filterOrder, setFilterOrder] = useState(
    (query?.ordem == "asc" ? "asc" : "desc") as string
  );

  const [visibleFields, setVisibleFields] = useState(query as any);

  const [filterModal, setFilterModal] = useState(false);

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

  const renderCategoriesForm = (slug: any) => {
    // console.log(slug, categoriesLevels);
    const render: any = [<></>];

    return render;
  };

  const [range, setRange] = useState(0 as any);
  const [rate, setRate] = useState(0 as any);

  const [activeChecked, setActiveChecked] = useState([] as Array<any>);
  const handleActiveChecked = (category: any) => {
    let handle = !activeChecked.includes(category.id)
      ? [...activeChecked, category.id]
      : activeChecked.filter((item) => item != category.id);

    setActiveChecked(handle);
  };

  const getFilter: any = async () => {
    const request = await api
      .get({
        url: "request/categories",
      })
      .then(({ data }: any) => {
        const mainCategories: any = data?.filter((item: any) => !item.parent);
        const levelCategories: any = {};

        (mainCategories ?? []).map((item: any) => {
          levelCategories[item.slug] = !!item?.childs?.length
            ? handleCategoriesLevels(item?.childs, {}, 0)
            : [];
        });

        setActiveChecked((mainCategories ?? []).map((item: any) => item.id));
        setCategories(mainCategories);
        setCategoriesLevels(levelCategories);

        setRate(query?.rate ?? 0);
        setRange(parseInt((query?.range ?? 0).toString()));
      });
  };

  const filterArea = useRef(null);
  const [stick, setStick] = useState(false);

  useEffect(() => {
    if (!!window) {
      const element: any = filterArea.current;
      window.addEventListener("scroll", () =>
        setStick(window.scrollY > element?.getBoundingClientRect().top + 800)
      );
    }

    if (!categories?.length) {
      getFilter();
    }
  }, []);

  return (
    <section ref={filterArea} className="w-full">
      <form action="/produtos/listagem" method="GET">
        {!!params?.store && !!query?.store && (
          <input type="hidden" value={params?.store} name="store" />
        )}
        <div
          className={`w-full top-0 left-0 ${
            stick
              ? "fixed mt-[62px] md:mt-[4.3rem] z-[50]"
              : "relative pt-5 md:pt-10"
          }`}
        >
          {stick && (
            <div className="bg-cyan-500  h-1/2 w-full absolute top-0 left-0"></div>
          )}
          <div className="container-medium">
            <div className="flex border rounded-xl bg-white overflow-hidden relative">
              <div className="w-fit">
                <Button
                  type="button"
                  style="btn-outline-light border-0"
                  onClick={() => setFilterModal(true)}
                  className="font-normal px-3 md:pl-8 md:pr-7 h-full hover:bg-zinc-50"
                >
                  <span className="hidden md:block">Filtros </span>
                  {!!count ? (
                    <div className="rounded-full bg-yellow-300 p-3 text-sm font-semibold relative">
                      <div className="text-zinc-900 absolute top-50 left-50 -translate-x-1/2 -translate-y-1/2">
                        {count}
                      </div>
                    </div>
                  ) : (
                    <Icon
                      icon="fa-sliders-h"
                      className="text-zinc-900 text-xl md:text-base"
                    />
                  )}
                </Button>
              </div>
              <div className="w-full relative border-l overflow-hidden flex">
                {!!visibleFields.search && (
                  <input
                    type="hidden"
                    name="busca"
                    defaultValue={visibleFields.search}
                  />
                )}
                <input
                  type="text"
                  defaultValue={params?.busca ?? ""}
                  className="w-full p-4"
                  placeholder="O que você precisa?"
                  onChange={(e) =>
                    setVisibleFields({
                      ...visibleFields,
                      search: e.target.value,
                    })
                  }
                />
                <div className="">
                  <Button className="px-4 py-3 h-full">
                    <Icon
                      icon="fa-search"
                      className="md:text-lg rounded-none"
                    />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        {stick && <div className="h-[4.9rem] md:h-[6.5rem]"></div>}

        {/* FILTER MODAL */}
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
                    filterOrder == "desc"
                      ? "fa-sort-amount-down"
                      : "fa-sort-amount-up"
                  }
                  className="text-zinc-900 text-xl md:text-base"
                />
                <div className="hidden md:block whitespace-nowrap">
                  {filterOrder == "desc" ? "Mais recente" : "Mais antigo"}
                </div>
              </Button>
              <div className="opacity-0 absolute h-full w-full top-0 left-0">
                <Select
                  name="ordem"
                  onChange={(e: any) => {
                    setFilterOrder(e.target.value);
                  }}
                  value={filterOrder}
                  options={[
                    {
                      name: "Mais recente",
                      value: "desc",
                    },
                    {
                      name: "Mais antigo",
                      value: "asc",
                    },
                  ]}
                ></Select>
              </div>
            </div>
          </div>

          {/* 
          <div className="pb-6">
            {!!rate && <input type="hidden" value={rate} name="rate" />}
            <Label>Avaliação</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((value: number, key: any) => (
                <label
                  key={key}
                  className="cursor-pointer"
                  onClick={() =>
                    setRate(rate == 1 && value == rate ? 0 : value)
                  }
                >
                  <Icon
                    icon="fa-star"
                    type={rate >= value ? "fa" : "fal"}
                    className={`${
                      rate >= value ? "text-yellow-400" : "text-gray-400"
                    }  ease text-2xl hover:text-yellow-600`}
                  />
                </label>
              ))}
            </div>
          </div>
           */}

          <div className="pb-6">
            <Label>Faixa de preço</Label>
            <div className="grid gap-2 py-1">
              <div className="text-sm">
                Exibir produtos até R$ {moneyFormat(!!range ? range : 1000)}
              </div>
              <div className="">
                <div className="flex text-sm justify-between">
                  <span>R$ {moneyFormat(10)}</span>
                  <span>R$ {moneyFormat(1000)}</span>
                </div>
                <div className="range-control">
                  {!!range && (
                    <input type="hidden" name="range" defaultValue={range} />
                  )}
                  <input
                    defaultValue={!!range ? range : 1000}
                    min="10"
                    max="1000"
                    step="10"
                    type="range"
                    onChange={(e: any) => setRange(e.target.value)}
                    className="w-full"
                  />
                  <span
                    style={{
                      width: `${((!!range ? range : 1000) * 100) / 1000}%`,
                    }}
                  ></span>
                </div>
              </div>
            </div>
          </div>

          <div className="pb-6">
            <Label>Cores</Label>
            <div className="flex gap-1 pt-1 pb-2">
              <Colors name="cores" value={query?.cores ?? []} />
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
                                  <Check
                                    key={category.id}
                                    name="categoria"
                                    value={category.slug}
                                    id={`categories${category.id}`}
                                    {...((!!query["categoria[]"] &&
                                      query["categoria[]"].includes(
                                        category.slug
                                      )) ||
                                    activeChecked.includes(category.id)
                                      ? { checked: true }
                                      : {})}
                                    onClick={(e: any) =>
                                      handleActiveChecked(category)
                                    }
                                  >
                                    <div className="px-3 md:px-1">
                                      {activeChecked.includes(category.id) && (
                                        <input
                                          type="checkbox"
                                          name="categoria[]"
                                          defaultValue={category.slug}
                                          defaultChecked={true}
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
                                              mainCategory.metadata.style ==
                                              "xl"
                                                ? "h-[40px] w-[40px] md:h-[48px] md:w-[48px]"
                                                : mainCategory.metadata.style ==
                                                  "lg"
                                                ? "md:h-[32px] md:w-[32px]"
                                                : "h-[20px] w-[20px]"
                                            }  object-contain`}
                                          />
                                        )}
                                        <div className="h-[20px] text-sm md:text-base flex items-center">
                                          {category.title}
                                        </div>
                                      </div>
                                    </div>
                                  </Check>
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
    </section>
  );
}
