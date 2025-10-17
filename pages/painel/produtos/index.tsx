"use client";

import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { Button } from "@/src/components/ui/form";
import Api from "@/src/services/api";
import { ProductType } from "@/src/models/product";
import { useEffect, useRef, useState, useCallback, use } from "react";
import Img from "@/src/components/utils/ImgBase";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Filter from "@/src/components/common/filters/Filter";

type ProductPage<T = any> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};

export default function Produtos({ hasStore }: { hasStore: boolean }) {
  const api = new Api();

  const [placeholder, setPlaceholder] = useState<boolean>(true);
  const [products, setProducts] = useState<ProductType[]>([]);

  // scroll infinito
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [filters, setFilters] = useState<Record<string, any>>({});
  const observerRef = useRef<HTMLDivElement | null>(null);

  // --------- Buscar produtos ---------
  const DEFAULT_PAGE_SIZE = 20; // mesma default do backend

  const fetchProducts = async (
    params: Record<string, any>
  ): Promise<ProductPage<ProductType>> => {
    const normalized = {
      search: params.busca ?? "",
      order: params.ordem ?? "desc",
      range: Number(params.range ?? 100),
      colors: params.cores ?? [],
      // envia 'category[]' e 'category' para compatibilidade com backends diferentes
      "category[]": params["categoria[]"] ?? params.categories ?? [],
      category: params.category ?? params["categoria[]"] ?? [],
      page: Number(params.page ?? 1),
      limit: Number(params.limit ?? DEFAULT_PAGE_SIZE), // garante que enviamos limit
    };

    try {
      if (normalized.page === 1) setPlaceholder(true);

      const queryString = new URLSearchParams(normalized as any).toString();
      const res: any = await api.bridge({
        method: "get",
        url: "stores/products?" + queryString,
      });

      const raw = res?.data ?? res ?? {};

      const items = raw.items ?? raw.data ?? (Array.isArray(raw) ? raw : []);
      const total = Number(raw.total ?? raw.count ?? 0);

      const currentPage = Number(
        raw.page ?? raw.current_page ?? normalized.page
      );

      const pageSize =
        Number(
          raw.pageSize ??
            raw.per_page ??
            raw.perPage ??
            raw.limit ??
            normalized.limit
        ) || DEFAULT_PAGE_SIZE;

      const pages =
        Number(
          raw.pages ??
            raw.last_page ??
            (total > 0
              ? Math.ceil(total / pageSize)
              : items.length
              ? Math.ceil(items.length / pageSize)
              : 1)
        ) || 1;

      return { items, total, page: currentPage, pageSize, pages };
    } finally {
      if (normalized.page === 1) setPlaceholder(false);
    }
  };

  // --------- Quando filtro muda ---------
  const onFilterResults = (data: ProductPage<ProductType>, params?: any) => {
    setProducts(data.items);
    setPage(1);
    // usa pages quando disponível, senão confia no pageSize/items
    setHasMore(data.page < data.pages || data.items.length === data.pageSize);
    setPlaceholder(false);

    // salva filtros e força que exista limit nos próximos requests
    const saved = {
      ...(params ?? {}),
      limit: params?.limit ?? DEFAULT_PAGE_SIZE,
    };
    setFilters(saved);
  };

  // --------- Carregar mais produtos ---------
  // --------- Carregar mais produtos ---------
  const loadMoreProducts = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);

    const nextPage = page + 1;
    const data = await fetchProducts({
      ...filters,
      page: nextPage,
      limit: DEFAULT_PAGE_SIZE,
    });

    setProducts((prev) => [...prev, ...data.items]);
    setPage(nextPage);

    const nextHasMore =
      data.page < data.pages || data.items.length === data.pageSize;

    setHasMore(Boolean(nextHasMore));
    setLoadingMore(false);
  }, [page, hasMore, loadingMore, filters]);

  // --- Adiciona este useEffect logo após a declaração dos states ---
  useEffect(() => {
    if (!observerRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          loadMoreProducts();
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loadingMore, hasMore, loadMoreProducts]);

  // --------- Observer: detecta fim da lista ---------
  useEffect(() => {
    if (!observerRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 0.5 } // mais sensível que 1.0
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [loadingMore, hasMore]);

  // --------- Remover produto ---------
  const RemoveProduct = async (item: ProductType) => {
    setPlaceholder(true);

    const request: any = await api.bridge({
      method: "post",
      url: "products/remove",
      data: { id: item.id },
    });

    if (!!request?.response) {
      const productId: number = request.data ?? 0;
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }

    setPlaceholder(false);
  };

  return (
    <Template header={{ template: "painel", position: "solid" }}>
      <section>
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

              <Filter
                context="panel"
                storeView
                fetchProducts={fetchProducts}
                onResults={(data, params) => onFilterResults(data, params)}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="pt-6">
        <div className="container-medium pb-12">
          <div className="border border-t-0 grid md:grid-cols-2 lg:block w-full">
            {/* Cabeçalho */}
            <div className="hidden lg:flex border-t bg-zinc-100 p-4 lg:p-8 gap-4 lg:gap-8 font-bold text-zinc-900 font-title">
              <div className="w-full">Produto</div>
              <div className="w-[32rem] max-w-[7rem]">Estoque</div>
              <div className="w-[32rem] max-w-[8rem]">Preço</div>
              <div className="w-[32rem] max-w-[9rem]">Exibição</div>
              <div className="w-[32rem] max-w-[7rem]">Tipo</div>
              <div className="w-[32rem] max-w-[8rem]">Ações</div>
            </div>

            {placeholder ? (
              [1, 2, 3, 4, 5].map((_, key) => (
                <div key={key} className="my-4 md:my-8 px-4 md:px-8">
                  <div className="bg-zinc-200 rounded-md animate-pulse py-10" />
                </div>
              ))
            ) : products.length ? (
              <>
                {products.map((item, key) => (
                  <div
                    key={key}
                    className="grid grid-cols-2 lg:flex border-t p-4 lg:p-8 gap-2 lg:gap-8 text-zinc-900 hover:bg-zinc-50 bg-opacity-5 items-center"
                  >
                    {/* conteúdo do item */}
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
                        <div className="w-full py-2">R$ {item.price}</div>
                      </div>
                    </div>

                    <div className="w-full lg:w-[32rem] text-center">
                      <div className="rounded-md bg-zinc-100 py-2">
                        {!!item.status ? "Exibindo" : "Oculto"}
                      </div>
                    </div>

                    <div className="w-full lg:w-[32rem] text-center">
                      <div className="rounded-md bg-zinc-100 py-2">
                        {item?.comercialType
                          ? item.comercialType.charAt(0).toUpperCase() +
                            item.comercialType.slice(1)
                          : "—"}
                      </div>
                    </div>

                    <div className="col-span-2 w-full lg:w-[32rem] text-center grid grid-cols-3 gap-2">
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
                      <div />
                    </div>
                  </div>
                ))}

                {/* Sentinela */}
                <div
                  ref={observerRef}
                  className="h-12 flex items-center justify-center"
                >
                  {loadingMore && (
                    <div className="text-sm text-zinc-500">
                      Carregando mais...
                    </div>
                  )}
                  {!hasMore && (
                    <div className="text-sm text-zinc-400">
                      Todos os produtos carregados
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center px-4 py-10">
                Não encontramos resultados para essa busca
              </div>
            )}
          </div>
        </div>
      </section>
    </Template>
  );
}
