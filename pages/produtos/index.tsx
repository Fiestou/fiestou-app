import { useEffect, useState, useRef } from "react";
import Product from "@/src/components/common/Product";
import Template from "@/src/template";
import Api from "@/src/services/api";
import { ProductType } from "@/src/models/product";
import { getImage } from "@/src/helper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Filter from "@/src/components/common/filters/Filter";

let limit = 15;

export default function Produtos() {
  const [products, setProducts] = useState<ProductType[]>([]);
  const [page, setPage] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [content, setContent] = useState<any>({});
  const [HeaderFooter, setHeaderFooter] = useState<any>({});
  const [DataSeo, setDataSeo] = useState<any>({});
  const [Scripts, setScripts] = useState<any>({});
  const [loading, setLoading] = useState<boolean>(true);
  const observerRef = useRef<HTMLDivElement | null>(null);

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

    async function loadProducts() {
      setLoading(true);
      try {
        let offset = (page - 1) * limit;

        const request = (await api.request({
          method: "get",
          url: "request/products",
          data: {
            limit,
            offset,
            ordem: "desc",
          },
        })) as { data: ProductType[]; metadata?: { count?: number } };

        const newProducts = Array.isArray(request.data) ? request.data : [];

        setProducts((prev) => [...prev, ...newProducts]);

        const metadata = request.metadata ?? {};
        const total = metadata.count ?? 0;

        if (products.length + newProducts.length >= total) {
          setHasMore(false);
        }
      } catch (err) {
        console.error("Erro ao carregar produtos:", err);
      } finally {
        setLoading(false);
      }
    }


    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  // Observer para scroll infinito
  useEffect(() => {
    if (!observerRef.current || !hasMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    observer.observe(observerRef.current);

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    };
  }, [loading, hasMore]);

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
      {/* Header da página de produtos */}
      <section className="bg-cyan-500 pt-24 md:pt-32 relative">
        <div className="container-medium relative pb-14 md:pb-16 text-white">
          <div className="flex items-end">
            <div className="w-full">
              <div className="pb-4">
                <Breadcrumbs links={[{ url: "/produtos", name: "Produtos" }]} />
              </div>
              <h1 className="font-title font-bold text-4xl md:text-5xl md:mb-4">
                Produtos
              </h1>
              <span className="text-lg md:text-2xl font-semibold">
                Encontre as decorações da sua festa
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="relative mt-[-1.85rem]">
        <Filter />
      </div>

      <section className="container-medium md:pt-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 py-6">
          {Array.isArray(products) &&
            products.map((item, key) => (
              <div key={key}>
                <Product product={item} />
              </div>
            ))}
        </div>

        {/* Loader + sentinel para scroll infinito */}
        {loading && (
          <div className="py-6 text-center text-gray-500">Carregando...</div>
        )}
        <div ref={observerRef} className="h-10"></div>

        {!hasMore && (
          <div className="py-6 text-center">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="px-6 py-3 bg-yellow-300 text-black font-semibold rounded-lg shadow-md hover:bg-yellow-400 transition"
            >
              Voltar ao início
            </button>
          </div>
        )}
      </section>
    </Template>
  );
}
