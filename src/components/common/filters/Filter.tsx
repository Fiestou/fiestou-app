import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { FilterQueryType } from "@/src/types/filtros";
import ModalFilter from "./filter/ModalFilter";
import InputSearchStore, {
  InputSearchStoreRef,
} from "./components/InputserachStore";
import Inputsearchhome from "./components/Inputsearchhome";
import Api from "@/src/services/api";
import { buildProductsQuery } from "@/src/services/productsPagination";

export type ProductPage<T = any> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};

export interface FilterProps<T = any> {
  store?: number;
  busca?: string;
  storeView?: boolean;
  context?: "home" | "store" | "panel";
  fetchProducts?: (params: Record<string, any>) => Promise<ProductPage<T>>;
  onResults?: (data: ProductPage<T>, params: Record<string, any>) => void;
}

export default function Filter<T = any>({
  store,
  busca,
  storeView,
  context = "home",
  fetchProducts,
  onResults,
}: FilterProps<T>) {
  const router = useRouter();
  const api = new Api();

  const [query, setQuery] = useState<FilterQueryType>({
    categories: [],
    colors: [],
    range: 1000,
    order: "desc",
  });

  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState<number>(0);
  const [filterModal, setFilterModal] = useState<boolean>(false);
  const [stick, setStick] = useState<boolean>(false);

  const filterArea = useRef<HTMLDivElement>(null);
  const searchRef = useRef<InputSearchStoreRef>(null);

  const startQueryHandle = () => {
    const routerQuery = router.query as {
      categorias?: string | string[];
      "categoria[]"?: string | string[];
      colors?: string | string[];
      range?: string;
      order?: string;
    };

    setQuery((prev) => {
      const next: Partial<FilterQueryType> = {
        categories: prev.categories ?? [],
      };

      if (routerQuery?.colors?.length) {
        next.colors =
          typeof routerQuery.colors === "string"
            ? [routerQuery.colors]
            : routerQuery.colors;
      }

      if (routerQuery?.range) {
        next.range = parseInt(routerQuery.range, 10);
      }

      if (routerQuery?.order) {
        next.order = routerQuery.order;
      }

      return { ...prev, ...next };
    });
  };

  useEffect(() => {
    let handle = 0;
    handle += query.categories.length;
    handle += query.colors.length;
    handle += query.range < 1000 ? 1 : 0;
    handle += query.order !== "desc" ? 1 : 0;
    setCount(handle);
  }, [query]);

  const handleQueryValues = (value: Partial<FilterQueryType>) => {
    setQuery((prev) => ({ ...prev, ...value }));
  };

  const handleStick = () => {
    const element = filterArea.current;
    if (!element) return;

    const onScroll = () =>
      setStick(window.scrollY > element.getBoundingClientRect().top + 800);

    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const cleanup = handleStick();
      startQueryHandle();
      return cleanup;
    }
  }, [router.query]);

  const buildParams = (overrides?: Record<string, any>) => {
    const params: Record<string, any> = {
      ...(busca ? { busca } : {}),
      order: query.order,
      range: String(query.range),
      page: 1,
      ...overrides,
    };

    if (store) params.store = store;
    if (query.colors.length) params.colors = query.colors;
    if (query.categories.length) params.category = query.categories;

    return params;
  };

  const fetchAndEmit = async (params: Record<string, any>) => {
    if (!fetchProducts || !onResults) return;
    setLoading(true);
    try {
      const data = await fetchProducts(params);
      onResults(data, params);
    } finally {
      setLoading(false);
    }
  };

  const act = (params: Record<string, any>) => {
    if (context === "home") {
      router.push({ pathname: "/produtos/listagem", query: params });
    } else {
      fetchAndEmit(params);
    }
  };

  const handleTextSearch = (value: string) => {
    const params = buildParams(
      value ? { busca: value, page: 1 } : { busca: "", page: 1 }
    );
    act(params);
  };

  const handleSeeResults = () => {
    const params = buildParams({ page: 1 });
    act(params);

    if (context === "panel") {
      loadPanelProducts(1);
    }

    setTimeout(() => setFilterModal(false), 0);
  };

  const loadPanelProducts = async (page = 1) => {
    try {
      setLoading(true);
      const params = buildParams({ page });
      const queryString = buildProductsQuery(params);
      const res: any = await api.request({
        method: "get",
        url:
          (context === "panel" ? "stores/products?" : "request/products?") +
          queryString,
      });

      const raw = res?.data ?? res ?? {};
      const items = raw.items ?? raw.data ?? (Array.isArray(raw) ? raw : []);
      const total = Number(raw.total ?? items.length ?? 0);
      const currentPage = Number(raw.page ?? page);
      const pageSize = Number(
        (raw.pageSize ?? raw.per_page ?? items.length) || 20
      );
      const pages = Number(raw.pages ?? Math.ceil(total / (pageSize || 1)));

      onResults?.(
        { items, total, page: currentPage, pageSize, pages },
        { page: currentPage }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (context === "panel" && !fetchProducts) {
      loadPanelProducts(1);
    }
  }, [context, fetchProducts]);

  return (
    <div className="w-full">
      {store && <input type="hidden" value={store} name="store" />}

      {storeView ? (
        <InputSearchStore
          ref={searchRef}
          count={count}
          stick={stick}
          filterAreaRef={filterArea}
          onOpenFilters={() => setFilterModal(true)}
          onSearch={handleTextSearch}
        />
      ) : (
        <Inputsearchhome
          count={count}
          stick={stick}
          busca={busca}
          filterAreaRef={filterArea}
          onOpenFilters={() => setFilterModal(true)}
          onSearch={handleTextSearch}
        />
      )}

      <ModalFilter
        open={filterModal}
        onClose={() => setFilterModal(false)}
        query={query}
        onChange={handleQueryValues}
        count={count}
        onSubmit={handleSeeResults}
        store={store}
        storeView={storeView}
      />
    </div>
  );
}
