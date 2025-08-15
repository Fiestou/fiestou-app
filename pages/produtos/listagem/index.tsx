/* Titar 'request' */
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Filter from "@/src/components/common/Filter";
import Newsletter from "@/src/components/common/Newsletter";
import Product from "@/src/components/common/Product";
import { Button } from "@/src/components/ui/form";
import { getImage, getQueryUrlParams } from "@/src/helper";
import { ProductType } from "@/src/models/product";
import Api from "@/src/services/api";
import Template from "@/src/template";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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

  const api = new Api();

  const [page, setPage] = useState(0 as number);
  const [placeholder, setPlaceholder] = useState(true as boolean);
  const [params, setParams] = useState({} as any);
  const [products, setProducts] = useState([] as Array<ProductType>);

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

  const getProducts = async () => {
    const handleParams: any = getQueryUrlParams();
    const normalized: any = {};

    const passthroughKeys = ["busca", "range", "tags", "store", "ordem", "whereIn"];
    for (const k of passthroughKeys) {
      if (handleParams[k] !== undefined && handleParams[k] !== "") normalized[k] = handleParams[k];
    }

    const rawCategory =
      handleParams["category"] ??
      handleParams["categoria"] ??
      handleParams["categorias"] ??
      handleParams["categoria[]"] ??
      handleParams["categories"];
    if (rawCategory !== undefined && rawCategory !== "")
      normalized["category"] = Array.isArray(rawCategory) ? rawCategory : [rawCategory];

    const rawColors =
      handleParams["colors"] ??
      handleParams["color"] ??
      handleParams["cores"] ??
      handleParams["cor"] ??
      handleParams["cor[]"];
    if (rawColors !== undefined && rawColors !== "")
      normalized["colors"] = Array.isArray(rawColors) ? rawColors : [rawColors];

    setParams(normalized);

    const offset = page * limit;

    const qs = toQuery({ ...normalized, limit, offset });
    
    const request: any = await api.request(
      {
      method: "get",
      url: `request/products?${qs}`,
    });

    const handle = request.data;

    if (!handle?.length) {
      setPage(-1);
    } else {
      setPage((p) => p + 1);
      setProducts((prev) => [...prev, ...handle]);
    }
    setPlaceholder(false);
  };
  
  useEffect(() => {
    if (!!window) {
      getProducts();
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setProducts([]);
    setPage(0);
    setPlaceholder(true);
    getProducts();
    
  }, [router.asPath]);

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
          <Filter {...params} />
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
            {!!products.length || !placeholder ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
                {!!products.length &&
                  products.map((item, key) => (
                    <div key={key}>
                      <Product product={item} />
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-20 opacity-70">
                <div className="text-4xl font-semibold font-title pb-2">
                  Ops!
                </div>
                Não encontramos resultados para sua busca
              </div>
            )}

            {page != -1 && (
              <div className="text-center">
                <Button
                  onClick={() => {
                    getProducts();
                  }}
                >
                  Carregar mais
                </Button>
              </div>
            )}
          </>
        )}
      </section>

      <Newsletter />
    </Template>
  );
}
