import Product from "@/src/components/common/Product";
import Template from "@/src/template";
import Api from "@/src/services/api";
import { ProductType } from "@/src/models/product";

import Img from "@/src/components/utils/ImgBase";
import { getImage } from "@/src/helper";
import Filter from "@/src/components/common/Filter";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Breadcrumbs from "@/src/components/common/Breadcrumb";
import { Button } from "@/src/components/ui/form";
import { useRouter } from "next/router";
import Paginate from "@/src/components/utils/Paginate";
import RegionConfirm from "@/src/default/alerts/RegionConfirm";

export const getStaticPaths = async (ctx: any) => {
  const api = new Api();
  const request: any = await api.get(
    {
      url: "request/products",
      data: {
        metadata: { count: "total" },
      },
    },
    ctx
  );

  let metadata: any = request?.metadata ?? {};

  const pages: any = new Array(Math.ceil((metadata?.count ?? 15) / 15))
    .fill(true)
    .filter((item, key) => !!key)
    .map((item, key) => {
      return key + 1;
    });

  const paths = pages.map((item: any) => {
    return { params: { page: item.toString() } };
  });

  return {
    paths: paths,
    fallback: true,
  };
};

export async function getStaticProps(ctx: any) {
  const api = new Api();
  const { page } = ctx.params;

  let request: any = {};

  request = await api.call(
    {
      url: "request/graph",
      data: [
        {
          model: "page as HeaderFooter",
          filter: [
            {
              key: "slug",
              value: "menu",
              compare: "=",
            },
          ],
        },
        {
          model: "page as DataSeo",
          filter: [
            {
              key: "slug",
              value: "seo",
              compare: "=",
            },
          ],
        },
        {
          model: "page as Scripts",
          filter: [
            {
              key: "slug",
              value: "scripts",
              compare: "=",
            },
          ],
        },
      ],
    },
    ctx
  );

  const HeaderFooter = request?.data?.query?.HeaderFooter ?? [];
  const DataSeo = request?.data?.query?.DataSeo ?? [];
  const Scripts = request?.data?.query?.Scripts ?? [];

  request = await api.get({ url: "content/products" }, ctx);

  const content = request?.data?.content ?? {};

  let limit = 15;
  let offset = page * 15;

  request = await api.get(
    {
      url: "request/products",
      data: {
        limit: limit,
        offset: offset,
        metadata: { count: "total" },
      },
    },
    ctx
  );

  let metadata: any = request?.metadata ?? {};

  const pages: any = new Array(Math.ceil((metadata?.count ?? 15) / 15)).fill(
    true
  );

  return {
    props: {
      page: page,
      products: request?.data ?? [],
      paginate: pages,
      content: content,
      HeaderFooter: HeaderFooter[0] ?? {},
      DataSeo: DataSeo[0] ?? {},
      Scripts: Scripts[0] ?? {},
    },
    revalidate: 60 * 60 * 60,
  };
}

export default function Produtos({
  page,
  paginate,
  products,
  content,
  HeaderFooter,
  DataSeo,
  Scripts,
}: {
  page: any;
  paginate: Array<any>;
  products: Array<ProductType>;
  content: any;
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
      <RegionConfirm />

      <section className="bg-cyan-500  pt-24 md:pt-32 relative">
        <div className="container-medium relative pb-14 md:pb-20 text-white">
          <div className="flex items-end">
            <div className="w-full">
              <div className="pb-4">
                <Breadcrumbs links={[{ url: "/produtos", name: "Produtos" }]} />
              </div>
              <h1
                className="font-title font-bold text-4xl md:text-5xl md:mb-4"
                dangerouslySetInnerHTML={{ __html: content?.main_text }}
              ></h1>
              <div
                className="text-lg md:text-2xl font-semibold"
                dangerouslySetInnerHTML={{ __html: content?.main_description }}
              ></div>
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

      <div className="relative mt-[-3rem] md:mt-[-4.5rem]">
        <Filter />
      </div>

      <section className="container-medium md:pt-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 py-6">
          {products &&
            products.map((item, key) => (
              <div key={key}>
                <Product product={item} />
              </div>
            ))}
        </div>

        <div className="pt-4 pb-14">
          {!!paginate.length && (
            <Paginate
              paginate={paginate}
              current={parseInt(page)}
              route="produtos"
            />
          )}
        </div>
      </section>
    </Template>
  );
}
