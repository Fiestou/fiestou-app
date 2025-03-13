import Image from "next/image";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { Button, Input } from "@/src/components/ui/form";
import { NextApiRequest, NextApiResponse } from "next";
import Api from "@/src/services/api";
import { ProductType, getPrice } from "@/src/models/product";
import { moneyFormat } from "@/src/helper";
import { useEffect, useState } from "react";
import Img from "@/src/components/utils/ImgBase";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Cookies from "js-cookie";
import Filter from "@/src/components/pages/painel/produtos/Filter";
import { FilterQueryType } from "@/src/components/common/Filter";

export async function getServerSideProps(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const api = new Api();

  const store: any = await api.graph(
    {
      url: "content/graph",
      data: [
        {
          model: "store",
        },
      ],
    },
    req
  );

  const hasStore = !!store?.data?.query?.store;

  let products: any = [];

  if (hasStore) {
    let request: any = await api.graph(
      {
        url: "content/graph",
        data: [
          {
            model: "product as products",
          },
        ],
      },
      req
    );

    products = request?.data?.query?.products ?? [];
  }

  return {
    props: {
      hasStore: hasStore,
    },
  };
}

export default function Produtos({ hasStore }: { hasStore: boolean }) {
  const api = new Api();

  const [placeholder, setPlaceholder] = useState(true as boolean);

  const [search, setSearch] = useState("" as string);

  const [filterActive, setFilterActive] = useState(false as boolean);

  const [filter, setFilter] = useState({
    page: 1,
    search: "",
    limit: 20,
    pages: 0,
    total: 0,
    query: {},
  } as {
    page: number;
    limit: number;
    search: string;
    order: string;
    pages: number;
    total: number;
    query: any;
  });

  const handleFilter = (value: any) => {
    setFilter({ ...filter, ...value });
  };

  const [products, setProducts] = useState([] as Array<any>);
  const getProducts = async () => {
    if (!!window) {
      window.scrollTo({ top: 0, left: 0 });
    }

    setPlaceholder(true);

    let request: any = await api.bridge({
      method: "get",
      url: `stores/products`,
      data: {
        ...filter,
        ...filter.query,
      },
    });

    setPlaceholder(false);
    setProducts(request?.data ?? []);

    handleFilter({
      total: request.metadata?.total ?? 0,
      pages: request.metadata?.pages ?? 0,
    });
  };

  const RemoveProduct = async (item: any) => {
    setPlaceholder(true);

    let request: any = await api.bridge({
      method: "post",
      url: "products/remove",
      data: { id: item.id },
    });

    if (!!request?.response) {
      const productId: number = request.data ?? 0;
      setProducts(products.filter((item: any) => item.id != productId));
    }

    setPlaceholder(false);
  };

  useEffect(() => {
    getProducts();
  }, [filter.search, filter.page, filter.limit, filter.query]);

  useEffect(() => {
    if (!!window) {
      getProducts();
    }
  }, []);

  return (
    <Template
      header={{
        template: "painel",
        position: "solid",
      }}
      footer={{
        template: "clean",
      }}
    >
      <section className="">
        <div className="container-medium pt-12">
          <div className="pb-4">
            <Breadcrumbs
              links={[
                { url: "/painel", name: "Painel" },
                { url: "/painel/produtos", name: "Produtos" },
              ]}
            />
          </div>
          <div className="lg:flex items-center">
            <Link passHref href="/painel">
              <Icon
                icon="fa-long-arrow-left"
                className="mr-4 lg:mr-6 text-2xl text-zinc-900"
              />
            </Link>
            <div className="grid md:flex gap-4 items-center w-full">
              <div className="w-fit pr-10">
                <div className="font-title font-bold text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900">
                  Produtos
                </div>
                <div className="text-sm">{filter.total} resultados</div>
              </div>
              <div className="flex items-center gap-4 w-full md:w-fit">
                <div className="w-full grid">
                  <Button
                    className="whitespace-nowrap"
                    href="/painel/produtos/novo"
                  >
                    Novo produto
                  </Button>
                </div>
              </div>
              <form
                onSubmit={(e: any) => {
                  e.preventDefault();
                  handleFilter({ search: search, page: 1 });
                }}
                className="w-full flex gap-4"
                method="POST"
              >
                <div className="w-full relative">
                  <Input
                    onChange={(e: any) => setSearch(e.target.value)}
                    placeholder="Pesquisar..."
                    className="h-full"
                  />
                  <button className="absolute right-0 top-0 h-full px-4 py-2">
                    <Icon
                      icon="fa-search"
                      className="text-zinc-900"
                      type="far"
                    />
                  </button>
                </div>
                <div>
                  <Button
                    type="button"
                    onClick={() => setFilterActive(!filterActive)}
                    style="btn-outline-light"
                    className="whitespace-nowrap relative z-10 border text-zinc-900 font-semibold px-8"
                  >
                    Filtrar <Icon icon="fa-sliders-h" className="ml-1" />{" "}
                    {(!!filter.query?.categories?.length ||
                      !!filter.query?.colors?.length ||
                      filter.query?.range !== 1000) && (
                      <div className="absolute bg-yellow-300 text-zinc-950 top-0 right-0 translate-x-1/2 -translate-y-1/2 p-3 rounded-full">
                        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs">
                          {(!!filter.query?.categories?.length
                            ? filter.query?.categories?.length
                            : 0) +
                            (!!filter.query?.colors?.length
                              ? filter.query?.colors?.length
                              : 0) +
                            (!!filter.query?.range ? 1 : 0)}
                        </span>
                      </div>
                    )}
                  </Button>
                </div>
              </form>
            </div>
          </div>
          <Filter
            status={filterActive}
            onFilter={(query: any) => {
              handleFilter({ query: query });
              setFilterActive(false);
            }}
            onClose={() => setFilterActive(!filterActive)}
          />
        </div>
      </section>
      <section className="pt-6">
        <div className="container-medium pb-12">
          <div className="border border-t-0 grid md:grid-cols-2 lg:block w-full">
            <div className="hidden lg:flex border-t bg-zinc-100 p-4 lg:p-8 gap-4 lg:gap-8 font-bold text-zinc-900 font-title">
              <div className="w-full">Produto</div>
              <div className="w-[32rem] max-w-[6rem]">Estoque</div>
              <div className="w-[32rem]">Preço</div>
              <div className="w-[32rem]">Exibição</div>
              <div className="w-[32rem]">Tipo</div>
              <div className="w-[32rem]">Ações</div>
            </div>
            {placeholder ? (
              [1, 2, 3, 4, 5].map((item: any, key: number) => (
                <div key={key} className="my-4 md:my-8 px-4 md:px-8">
                  <div className="bg-zinc-200 rounded-md animate-pulse py-10"></div>
                </div>
              ))
            ) : !!products.length ? (
              products.map((item, key) => (
                <div
                  key={key}
                  className="grid grid-cols-2 lg:flex border-t p-4 lg:p-8 gap-2 lg:gap-8 text-zinc-900 hover:bg-zinc-50 bg-opacity-5 items-center"
                >
                  <div className="col-span-2 w-full flex items-center gap-4">
                    <div className="aspect-square relative overflow-hidden w-[4rem] rounded-md bg-zinc-100">
                      {!!item?.gallery?.length ? (
                        <Img
                          src={
                            item?.gallery[0]?.base_url +
                            item?.gallery[0]?.details?.sizes["sm"]
                          }
                          size="xs"
                          className="absolute object-cover h-full inset-0 w-full"
                        />
                      ) : (
                        <Icon
                          icon="fa-image"
                          className="text-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25"
                        />
                      )}
                    </div>
                    <div className="font-semibold">{item.title}</div>
                  </div>
                  <div className="w-full lg:w-[32rem] lg:max-w-[6rem] text-center">
                    {!!item?.quantity ? (
                      <div className="rounded-md bg-zinc-100 py-2">
                        {item?.quantity}
                      </div>
                    ) : (
                      <div className="rounded-md bg-zinc-100 py-3 px-2 text-xs whitespace-nowrap">
                        sem estoque
                      </div>
                    )}
                  </div>
                  <div className="w-full lg:w-[32rem] text-center">
                    <div className="rounded-md bg-zinc-100">
                      <div className="w-full py-2">
                        R$ {getPrice(item).price}
                      </div>
                    </div>
                  </div>
                  <div className="w-full lg:w-[32rem] text-center">
                    <div className="rounded-md bg-zinc-100 py-2">
                      {!!item.status ? "Exibindo" : "Oculto"}
                    </div>
                  </div>
                  <div className="w-full lg:w-[32rem] text-center">
                    <div className="rounded-md bg-zinc-100 py-2">
                      Para alugar
                    </div>
                  </div>
                  <div className="col-span-2 w-full lg:w-[32rem] text-center grid grid-cols-3 gap-2">
                    <button className="rounded-md bg-zinc-100 hover:bg-yellow-300 ease py-2 px-3">
                      <Icon icon="fa-share-alt" type="far" />
                    </button>
                    {/* <button className="rounded-md bg-zinc-100 hover:bg-yellow-300 ease py-2 px-3">
                          <Icon icon="fa-copy" type="far" />
                        </button> */}
                    <Link
                      href={`/painel/produtos/${item.id}`}
                      className="rounded-md bg-zinc-100 hover:bg-yellow-300 ease py-2 px-3"
                    >
                      <Icon icon="fa-pen" type="far" />
                    </Link>
                    <div className="group relative">
                      <button
                        type="button"
                        className="rounded-md bg-zinc-100 group-hover:bg-yellow-300 ease py-2 px-3"
                      >
                        <Icon icon="fa-trash" type="far" />
                      </button>
                      <input className="cursor-pointer absolute h-full w-full top-0 left-0 opacity-0" />
                      <div className="absolute w-full bottom-0 left-0 hidden group-focus-within:block">
                        <div className="absolute border top-0 -mt-1 left-1/2 -translate-x-1/2 flex bg-white py-2 px-4 text-sm rounded-md gap-5">
                          <div className="cursor-pointer">cancelar</div>
                          <button
                            onClick={() => RemoveProduct(item)}
                            className="cursor-pointer underline font-semibold text-zinc-900 hover:text-red-600"
                          >
                            confirmar
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center px-4 py-10">
                Não encontramos resultados para essa busca
              </div>
            )}
          </div>
          {!!filter.pages && filter.pages > 1 && (
            <div className="relative w-full pt-4">
              <div className="flex gap-1 justify-center md:gap-2">
                {Array.from({
                  length: filter.pages,
                }).map((_, key) => (
                  <Button
                    style="btn-white"
                    type="button"
                    onClick={() => handleFilter({ page: key + 1 })}
                    key={key}
                    className={`${
                      filter.page == key + 1 && "bg-yellow-400"
                    } p-4 text-sm rounded-full`}
                  >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      {key + 1}
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </Template>
  );
}
