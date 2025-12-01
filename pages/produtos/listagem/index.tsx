import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Filter from "@/src/components/common/filters/Filter";
import Newsletter from "@/src/components/common/Newsletter";
import Product from "@/src/components/common/Product";
import SuggestedProducts from "@/src/components/common/SuggestedProducts";
import { getImage, getQueryUrlParams } from "@/src/helper";
import { ProductType } from "@/src/models/product";
import Api from "@/src/services/api";
import Template from "@/src/template";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Icon from "@/src/icons/fontAwesome/FIcon";

let limit = 15;

export async function getStaticProps(ctx: any) {
  const api = new Api();
  let request: any;

  try {
    request = await api.content(
      {
        method: 'get',
        url: "default",
      },
      ctx
    );
  } catch (error) {
    request = { data: {} };
  }

  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};

  return {
    props: {
      HeaderFooter: HeaderFooter,
      DataSeo: DataSeo,
      Scripts: Scripts,
    },
    revalidate: 60 * 60 * 60,
  };
}

export default function Listagem({
  HeaderFooter,
  DataSeo,
  Scripts,
}: {
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
}) {
  const router = useRouter();
  const api = useMemo(() => new Api(), []);

  const [page, setPage] = useState(0 as number);
  const [hasMore, setHasMore] = useState(true as boolean);
  const [loading, setLoading] = useState(false as boolean);
  const [placeholder, setPlaceholder] = useState(true as boolean);
  const [filters, setFilters] = useState<any>({});
  const [products, setProducts] = useState([] as Array<ProductType>);
  const [suggestions, setSuggestions] = useState([] as Array<ProductType>);
  const [activeFilters, setActiveFilters] = useState<{
    colors: string[];
    categories: { name: string; icon?: string }[];
    tags: string[];
  }>({ colors: [], categories: [], tags: [] });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const activeRequest = useRef(0);
  const observerRef = useRef<HTMLDivElement | null>(null);

  function toQuery(params: Record<string, any>) {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      if (Array.isArray(v)) {
        v.forEach((item) => qs.append(`${k}[]`, String(item)));
      } else {
        qs.append(k, String(v));
      }
    });
    return qs.toString();
  }

  const normalizeFilters = useCallback(() => {
    const params = getQueryUrlParams();
    const normalized: Record<string, any> = {};

    const passthroughKeys = ["busca", "range", "tags", "store", "whereIn", "order"];
    passthroughKeys.forEach((key) => {
      const value = (params as any)[key];
      if (value !== undefined && value !== "") {
        normalized[key] = value;
      }
    });

    if (normalized.order === undefined && (params as any).ordem) {
      normalized.order = (params as any).ordem;
    }

    const ensureSingleValue = (value: any) =>
      Array.isArray(value) ? value[value.length - 1] : value;

    ["busca", "range", "store", "order"].forEach((key) => {
      if (normalized[key] !== undefined) {
        normalized[key] = ensureSingleValue(normalized[key]);
      }
    });

    const resolveArray = (value: unknown) => {
      if (Array.isArray(value)) return value.filter(Boolean).map((item) => String(item));
      if (value === undefined || value === null || value === "") return undefined;
      return [String(value)];
    };

    const colorKeys = ["colors", "color", "cores", "cor"];
    const colorsValue = colorKeys
      .map((key) => (params as any)[key])
      .find((value) => value !== undefined && value !== "");
    const colors = resolveArray(colorsValue);
    if (colors?.length) normalized.colors = colors;

    const categoryKeys = ["category", "categories", "categoria", "categorias"];
    const categoriesValue = categoryKeys
      .map((key) => (params as any)[key])
      .find((value) => value !== undefined && value !== "");
    const categories = resolveArray(categoriesValue);
    if (categories?.length) normalized.category = categories;

    if (normalized.order && Array.isArray(normalized.order)) {
      normalized.order = normalized.order[0];
    }

    return normalized;
  }, []);

  const fetchProducts = useCallback(
    async (activeFilters: Record<string, any>, nextPage: number, replace = false) => {
      const requestId = ++activeRequest.current;
      setLoading(true);

      try {
        const offset = nextPage * limit;
        const qs = toQuery({ ...activeFilters, limit, offset });

        const response: any = await api.request({
          method: "get",
          url: `request/products?${qs}`,
        });

        if (requestId !== activeRequest.current) {
          return;
        }

        const items = (response?.data ?? []) as ProductType[];
        const suggestedItems = (response?.suggestions ?? []) as ProductType[];
        const colorsFromApi = (response?.colors ?? []) as string[];
        const categoriesFromApi = (response?.categories ?? []) as { name: string; icon?: string }[];
        const tagsFromApi = (response?.tags ?? []) as string[];

        setProducts((prev) => (replace ? items : [...prev, ...items]));

        if (replace) {
          setSuggestions(suggestedItems);
          setActiveFilters({
            colors: colorsFromApi,
            categories: categoriesFromApi,
            tags: tagsFromApi,
          });
        }

        if (items.length >= limit) {
          setPage(nextPage + 1);
          setHasMore(true);
        } else {
          setPage(nextPage);
          setHasMore(false);
        }
      } finally {
        if (requestId === activeRequest.current) {
          setLoading(false);
          setPlaceholder(false);
        }
      }
    },
    [api]
  );

  useEffect(() => {
    const normalized = normalizeFilters();
    setFilters(normalized);
    setProducts([]);
    setPage(0);
    setHasMore(true);
    setPlaceholder(true);
    fetchProducts(normalized, 0, true);
  }, [router.asPath, normalizeFilters, fetchProducts]);

  const handleLoadMore = useCallback(() => {
    if (!hasMore || loading) return;
    fetchProducts(filters, page);
  }, [fetchProducts, filters, hasMore, loading, page]);

  // 👇 Scroll infinito usando IntersectionObserver
  useEffect(() => {
    if (!hasMore || loading) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          handleLoadMore();
        }
      },
      {
        root: null,
        rootMargin: "200px",
        threshold: 0.1,
      }
    );

    const currentRef = observerRef.current;
    if (currentRef) observer.observe(currentRef);

    return () => {
      if (currentRef) observer.unobserve(currentRef);
    };
  }, [hasMore, loading, handleLoadMore]);

  // 👇 Scroll Top
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  useEffect(() => {
    const onScroll = () => {
      setShowScrollTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `Produtos | ${DataSeo?.site_text ?? 'Fiestou'}`,
        image: !!getImage(DataSeo?.site_image)
          ? getImage(DataSeo?.site_image)
          : "",
        description: DataSeo?.site_description,
      }}
      header={{
        template: "default",
        position: "fixed",
        content: HeaderFooter,
      }}
      footer={{
        template: "default",
        content: HeaderFooter,
      }}
    >
      <div className="py-8"></div>
      <section className="pt-4 md:pt-8 relative"></section>
      <div className="container-medium">
        <Breadcrumbs
          links={[
            { url: "/produtos", name: "Produtos" },
            {
              url: "",
              name: `${products.length} Resultados`,
            },
          ]}
        />
      </div>

      <div className="relative pt-5">
        {placeholder ? (
          <div className="container-medium">
            <div className="animate-pulse py-8 rounded-lg overflow-hidden bg-zinc-200"></div>
          </div>
        ) : (
          <Filter {...filters} />
        )}
      </div>

      <section className="container-medium md:pt-4">
        {placeholder ? (
          <div className="cursor-wait grid md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((item, key) => (
              <div
                key={key}
                className="animate-pulse aspect aspect-square rounded-lg overflow-hidden bg-zinc-200"
              ></div>
            ))}
          </div>
        ) : (
          <>
            {!!products.length ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
                {products.map((item, key) => (
                  <div key={key}>
                    <Product product={item} />
                  </div>
                ))}
              </div>
            ) : (activeFilters.colors.length > 0 || activeFilters.categories.length > 0 || activeFilters.tags.length > 0) && suggestions.length > 0 ? (
              <div className="text-center py-12 opacity-80">
                <div className="text-2xl font-semibold font-title pb-2">
                  Não encontramos resultados para sua busca
                </div>
              </div>
            ) : (
              <div className="text-center py-20 opacity-70">
                <div className="text-4xl font-semibold font-title pb-2">
                  Ops!
                </div>
                Não encontramos resultados para sua busca
              </div>
            )}

            {hasMore && (
              <div ref={observerRef} className="text-center py-6">
                {loading && <span>Carregando mais produtos...</span>}
              </div>
            )}
          </>
        )}
      </section>


      {/* Sugestões de produtos com filtros selecionados */}
      {suggestions.length > 0 && (activeFilters.colors.length > 0 || activeFilters.categories.length > 0 || activeFilters.tags.length > 0) && (
        <SuggestedProducts
          products={suggestions}
          filters={activeFilters}
          title="Você também pode gostar"
        />
      )}

      {/* 👇 Botão de scroll top */}
      {showScrollTop && (
        <button
        onClick={scrollToTop}
        className="fixed bottom-16 right-6 z-50 bg-yellow-300 text-black rounded-full p-3 shadow-lg hover:bg-yellow-400 transition-all duration-200"
        aria-label="Voltar ao topo"
        >
          <Icon icon="fa-arrow-up" type="fas" className="text-lg" />
        </button>
      )}
      <Newsletter />
    </Template>
  );
}
