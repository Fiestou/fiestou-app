import Api from "@/src/services/api";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { RelationType } from "@/src/models/relation";
import { filterRepeatRemove, getImage, moneyFormat } from "@/src/helper";
import React from "react";
import { Button, Label } from "@/src/components/ui/form";
import Modal from "@/src/components/utils/Modal";
import Colors from "@/src/components/ui/form/ColorsUI";
import Img from "@/src/components/utils/ImgBase";
import { FilterQueryType } from "@/src/components/common/Filter";

interface FilterPainelType {
  status: boolean;
  onFilter: Function;
  onClose: Function;
}

const initQuery = {
  categories: [],
  colors: [],
  range: 1000,
  order: "desc",
};

export default function Filter(attrs: FilterPainelType) {
  const api = new Api();
  const router = useRouter();

  const [query, setQuery] = useState(initQuery as FilterQueryType);

  const handleQueryValues = (value: any) => {
    setQuery({ ...query, ...value });
  };

  const emitSearch = () => {
    !!attrs.onFilter && attrs.onFilter(query);
  };

  const [activeChecked, setActiveChecked] = useState([] as Array<any>);
  const handleActiveChecked = (category: any) => {
    let handleActive = activeChecked.includes(category.id)
      ? activeChecked.filter((item) => item != category.id)
      : [...activeChecked, category.id];

    setActiveChecked(handleActive);

    let handleQuery = (query.categories ?? []).includes(category.slug)
      ? query.categories.filter((item: any) => item != category.slug)
      : [...(query?.categories ?? []), category.slug];

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

  const getFilter: any = async () => {
    const request: any = await api.request({
      method: "get",
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

  useEffect(() => {
    getFilter();
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

        <div>
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
                                      (query.categories ?? []).includes(
                                        category.slug
                                      )
                                        ? "border-zinc-800 hover:border-zinc-500"
                                        : "hover:border-zinc-300"
                                    }`}
                                    onClick={() =>
                                      handleActiveChecked(category)
                                    }
                                  >
                                    <div className="px-3 md:px-1">
                                      {(query.categories ?? []).includes(
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
