import { useRouter } from "next/router";
import React, { useEffect, useRef, useState } from "react";
import { FilterQueryType } from "@/src/types/filtros";
import ModalFilter from "./filter/ModalFilter";
import { StoreType } from "@/src/models/product";
import InputserachStore from "./components/InputserachStore";
import Inputsearchhome from "./components/Inputsearchhome";
import Api from "@/src/services/api"; // <- ADD: vamos usar no auto-load do painel

// se quiser, tipa a sua paginação certinho
export type ProductPage<T = any> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pages: number;
};

export interface FilterProps<T = any> {
  store?: StoreType;
  busca?: string;
  storeView?: boolean;
  /** UI/roteamento: 'home' navega; 'store' e 'panel' não navegam */
  context?: "home" | "store" | "panel";
  /** Usado apenas em store/panel (para buscas acionadas pelo usuário) */
  fetchProducts?: (params: Record<string, any>) => Promise<ProductPage<T>>;
  /** Recebe os resultados (auto-load do painel e buscas) */
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

  const handleQueryValues = (value: Partial<FilterQueryType>) => {
    setQuery((prev) => ({ ...prev, ...value }));
  };

  const startQueryHandle = () => {
    const routerQuery = router.query as {
      categorias?: string | string[];
      "categoria[]"?: string | string[];
      colors?: string | string[];
      range?: string;
      order?: string;
    };

    setQuery((prev) => {
      const next: Partial<FilterQueryType> = { categories: prev.categories ?? [] };

      if (routerQuery?.colors?.length) {
        next.colors =
          typeof routerQuery.colors === "string" ? [routerQuery.colors] : routerQuery.colors;
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

  // ----- helpers -----
  const buildParams = (overrides?: Record<string, any>) => {
    const params: Record<string, any> = {
      ...(busca ? { busca } : {}),
      order: query.order,
      range: String(query.range),
      page: 1,
      ...overrides,
    };

    if (store?.id) params.store = store.id;
    if (query.colors.length) params.colors = query.colors; // <-- aqui!
    if (query.categories.length) params["categoria[]"] = query.categories;

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

  /** Ação final: home navega; store/panel fazem fetch */
  const act = (params: Record<string, any>) => {
    if (context === "home") {
      router.push({ pathname: "/produtos/listagem", query: params });
    } else {
      fetchAndEmit(params);
    }
  };

  // busca do header
  const handleTextSearch = (value: string) => {
    const params = buildParams({ busca: value || "", page: 1 });
    act(params);
  };

  const handleSeeResults = () => {
    const params = buildParams({ page: 1 });
    act(params);

    if (context === "panel") {
      // dispara o fetch manualmente
      loadPanelProducts(1);
    }

    setTimeout(() => setFilterModal(false), 0);
  };

  const loadPanelProducts = async (page = 1) => {
    try {
      setLoading(true);

      // Monta todos os parâmetros selecionados
      const params = buildParams({ page });

      // Converte para query string
      const queryString = new URLSearchParams(params).toString();

      const res: any = await api.bridge({
        method: "get",
        url: "stores/products?" + queryString,
      });

      const raw = res?.data ?? res ?? {};
      const items = raw.items ?? raw.data ?? (Array.isArray(raw) ? raw : []);
      const total = Number(raw.total ?? items.length ?? 0);
      const currentPage = Number(raw.page ?? page);
      const pageSize = Number((raw.pageSize ?? raw.per_page ?? items.length) || 20);
      const pages = Number(raw.pages ?? Math.ceil(total / (pageSize || 1)));

      onResults?.({ items, total, page: currentPage, pageSize, pages }, { page: currentPage });
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    if (context === "panel") {

      loadPanelProducts(1);
    }

  }, []);

  return (
    <form className="w-full">
      {store && <input type="hidden" value={store.id} name="store" />}

      {storeView ? (
        <InputserachStore
          count={count}
          stick={stick}
          busca={busca}
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
      // title={`Filtros${loading ? " (carregando…)" : ""}`} // opcional
      />
    </form>
  );
}
