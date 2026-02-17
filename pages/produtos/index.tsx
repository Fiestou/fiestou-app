import { useEffect, useState, useRef } from "react";
import Product from "@/src/components/common/Product";
import Template from "@/src/template";
import Api from "@/src/services/api";
import { ProductType } from "@/src/models/product";
import { getImage, isMobileDevice } from "@/src/helper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Filter from "@/src/components/common/filters/Filter";
import { useRouter } from "next/router";
import CartPreview from "@/src/components/common/CartPreview";
import { Search, SlidersHorizontal } from "lucide-react";
import {
  hasMoreByResult,
  mergeUniqueProducts,
} from "@/src/services/productsPagination";
import { getOrCreateVisitorId } from "@/src/services/recommendations";

const PAGE_SIZE = 15;

export default function Produtos() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [content, setContent] = useState<any>({});
  const [HeaderFooter, setHeaderFooter] = useState<any>({});
  const [DataSeo, setDataSeo] = useState<any>({});
  const [Scripts, setScripts] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [showFilters, setShowFilters] = useState<boolean>(false);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const activeRequest = useRef(0);
  const loadMoreLock = useRef(false);
  const router = useRouter();
  const [showCartPreview, setShowCartPreview] = useState(false);

  useEffect(() => {
    const api = new Api();

    async function loadContent() {
      try {
        let request: any = await api.content({
          method: "get",
          url: "products",
        });

        setHeaderFooter(request?.data?.HeaderFooter ?? {});
        setDataSeo(request?.data?.DataSeo ?? {});
        setScripts(request?.data?.Scripts ?? {});
        setContent(request?.data?.content ?? {});
      } catch (err) {
        console.error("Erro ao carregar conteúdo inicial:", err);
      }
    }

    loadContent();
  }, []);

  useEffect(() => {
    const api = new Api();
    const requestId = ++activeRequest.current;
    let cancelled = false;

    async function loadProducts() {
      if (!hasMore) return;

      setLoading(true);
      try {
        const offset = (page - 1) * PAGE_SIZE;
        const visitorId =
          typeof window !== "undefined" ? getOrCreateVisitorId() : undefined;

        const request = (await api.request({
          method: "get",
          url: "request/products",
          data: {
            limit: PAGE_SIZE,
            offset,
            ordem: "desc",
            source: "public:produtos",
            visitor_id: visitorId || undefined,
            path: typeof window !== "undefined" ? window.location.pathname : undefined,
          },
        })) as { data: ProductType[]; metadata?: { count?: number } };

        if (cancelled || requestId !== activeRequest.current) return;

        const newProducts = Array.isArray(request.data) ? request.data : [];

        setProducts((prev) => mergeUniqueProducts(prev, newProducts));

        const metadata = request.metadata ?? {};
        const total = Number(metadata.count ?? 0);
        setHasMore(
          hasMoreByResult(total, offset, PAGE_SIZE, newProducts.length),
        );
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
      } finally {
        if (!cancelled && requestId === activeRequest.current) {
          loadMoreLock.current = false;
          setLoading(false);
        }
      }
    }

    loadProducts();
    return () => {
      cancelled = true;
    };
  }, [hasMore, page]);

  useEffect(() => {
    if (!observerRef.current || !hasMore) return;

    const target = observerRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting) return;
        if (loading || loadMoreLock.current) return;

        loadMoreLock.current = true;
        setPage((prev) => prev + 1);
      },
      {
        root: null,
        rootMargin: "320px 0px",
        threshold: 0.01,
      }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [loading, hasMore]);

  useEffect(() => {
    if (!router.isReady) return;

    if (router.query.openCart === "1") {
      setShowCartPreview(true);
    }
  }, [router.isReady, router.query.openCart]);

  const isInitialLoading = loading && products.length === 0;

  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `Produtos | ${DataSeo?.site_text}`,
        image: !!getImage(DataSeo?.site_image)
          ? getImage(DataSeo?.site_image)
          : "",
        description: `${content?.main_description} - ${DataSeo?.site_description}`,
        url: `produtos`,
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
      <section className="bg-gradient-to-br from-cyan-500 to-blue-600 pt-20 md:pt-28 pb-8 md:pb-12">
        <div className="container-medium">
          <div className="mb-4">
            <Breadcrumbs links={[{ url: "/produtos", name: "Produtos" }]} />
          </div>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="font-title font-bold text-3xl md:text-5xl text-white mb-2">
                Produtos
              </h1>
              <p className="text-white/90 text-base md:text-lg">
                Encontre as decorações perfeitas para sua festa
              </p>
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center gap-2 px-4 py-2.5 bg-white text-cyan-600 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
            >
              <SlidersHorizontal size={18} />
              Filtros
            </button>
          </div>
        </div>
      </section>

      <section className="container-medium py-6 md:py-8">
        <div className="hidden md:block mb-6">
          <Filter />
        </div>

        {showFilters && (
          <div className="md:hidden mb-6 bg-white rounded-lg shadow-lg p-4 border border-zinc-200">
            <Filter />
          </div>
        )}

        {isInitialLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`product-skeleton-${index}`}
                className="animate-pulse rounded-xl border border-zinc-200 bg-zinc-100 aspect-[4/5]"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
            {Array.isArray(products) &&
              products.map((item, key) => (
                <div key={item?.id ?? key} className="animate-fadeIn">
                  <Product product={item} />
                </div>
              ))}
          </div>
        )}

        {!isInitialLoading && loading && (
          <div className="py-6 flex items-center justify-center gap-2 text-zinc-500 text-sm">
            <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            Carregando mais produtos...
          </div>
        )}

        <div ref={observerRef} className="h-10"></div>

        {!hasMore && products.length > 0 && (
          <div className="py-8 text-center">
            <p className="text-zinc-500 mb-4">Você viu todos os produtos disponíveis</p>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-6 py-3 bg-cyan-500 hover:bg-cyan-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              Voltar ao topo
            </button>
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="py-16 text-center">
            <div className="w-20 h-20 mx-auto mb-4 bg-zinc-100 rounded-full flex items-center justify-center">
              <Search size={32} className="text-zinc-400" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-700 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-zinc-500">
              Tente ajustar os filtros ou volte mais tarde
            </p>
          </div>
        )}
      </section>

      {showCartPreview && (
        <CartPreview
          isMobile={isMobileDevice()}
          onClose={() => setShowCartPreview(false)}
        />
      )}
    </Template>
  );
}
