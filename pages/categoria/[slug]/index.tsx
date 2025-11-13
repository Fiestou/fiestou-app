import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Filter from "@/src/components/common/filters/Filter";

import Product from "@/src/components/common/Product";
import Img from "@/src/components/utils/ImgBase";
import Paginate from "@/src/components/utils/Paginate";
import { cleanText, getImage } from "@/src/helper";
import { ProductType } from "@/src/models/product";
import { RelationType } from "@/src/models/relation";
import { StoreType } from "@/src/models/store";
import Api from "@/src/services/api";
import Template from "@/src/template";
import { useRouter } from "next/router";

let limit = 15;

export const getStaticPaths = async (ctx: any) => {
  const api = new Api();

  let request: any = await api.request({
    method: "get",
    url: "request/categories-paths",
    data: {
      limit: limit,
    },
  });

  let categories = request?.data ?? [];

  const paths: any = [];

  Object.keys(categories).map((slug: any) => {
    paths.push({ params: { slug: slug } });
  });

  return {
    paths: paths,
    fallback: true,
  };
};

export async function getStaticProps(ctx: any) {
  const api = new Api();

  const params = ctx.params;

  let request: any = await api.content(
    {
      method: 'get',
      url: "default",
    },
    ctx
  );

  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};

  let offset = !!params?.page ? (params?.page - 1) * limit : 0;

  request = await api.request(
    {
      method: "get",
      url: "request/category",
      data: {
        slug: params?.slug,
        limit: limit,
        offset: offset,
        metadata: { count: "total" },
      },
    },
    ctx
  );

  let metadata: any = request?.metadata ?? {};

  const pages: any = new Array(
    Math.ceil((metadata?.count ?? limit) / limit)
  ).fill(true);

  const category = request?.data?.category ?? [];
  const products = request?.data?.products ?? [];

  request = await api.request(
    {
      method: "get",
      url: "content/products",
    },
    ctx
  );

  const content = request?.data?.content ?? {};

  return {
    props: {
      page: params?.page ?? 1,
      paginate: pages,
      params: params,
      category: category,
      products: products,
      content: content,
      HeaderFooter: HeaderFooter,
      DataSeo: DataSeo,
      Scripts: Scripts,
    },
    revalidate: 60 * 60 * 60,
  };
}

export default function Categoria({
  page,
  paginate,
  category,
  products,
  content,
  params,
  HeaderFooter,
  DataSeo,
  Scripts,
}: {
  page: any;
  paginate: Array<any>;
  category: any;
  products: Array<ProductType>;
  content: any;
  params?: any;
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
}) {
  const { isFallback } = useRouter();

  if (isFallback) {
    return <></>;
  }

  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `${cleanText(category?.title)} - Categoria | ${
          DataSeo?.site_text
        }`,
        image: !!getImage(DataSeo?.site_image)
          ? getImage(DataSeo?.site_image)
          : "",
        description: DataSeo?.site_description,
        url: `categoria/${category?.slug}`,
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
      <section className="bg-cyan-500 pt-24 md:pt-32 relative">
        <div className="container-medium relative pb-4 md:pb-16 text-white">
          <div className="flex items-end">
            <div className="w-full">
              <div className="pb-4">
                <Breadcrumbs links={[{ url: "/sobre", name: "Sobre" }]} />
              </div>
              <h1
                className="font-title font-bold text-4xl md:text-5xl mb-8 md:mb-0"
                dangerouslySetInnerHTML={{ __html: category?.title }}
              ></h1>
              {/*
              <div
                className="text-lg md:text-2xl font-semibold"
                dangerouslySetInnerHTML={{ __html: content?.main_description }}
              ></div>
              */}
            </div>
            {!!getImage(content?.main_icons) && (
              <div className="w-fit">
                <Img
                  src={getImage(content?.main_icons)}
                  className="w-auto max-w-full"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="relative mt-[-1.85rem]">
        <Filter {...params} />
      </div>

      <section className="container-medium md:pt-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 py-6">
          {products &&
            products.map((item, key) => (
              <div key={key}>
                <Product product={item} />
              </div>
            ))}
        </div>

        <div className="pt-4 pb-14">
          {!!paginate?.length && (
            <Paginate
              paginate={paginate}
              current={parseInt(page)}
              route={`categoria/${category?.slug}`}
            />
          )}
        </div>
      </section>
      
    </Template>
  );
}
