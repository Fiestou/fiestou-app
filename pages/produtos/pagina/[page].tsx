import Product from "@/src/components/common/Product";
import Template from "@/src/template";
import Api from "@/src/services/api";
import { ProductType } from "@/src/models/product";

import Img from "@/src/components/utils/ImgBase";
import { getImage } from "@/src/helper";


import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Breadcrumbs from "@/src/components/common/Breadcrumb";
import { Button } from "@/src/components/ui/form";
import { useRouter } from "next/router";
import Paginate from "@/src/components/utils/Paginate";
import Filter from "@/src/components/common/filters/Filter";

let limit = 15;

export const getStaticPaths = async (ctx: any) => {
  // const api = new Api();
  // const request: any = await api.request(
  //   {
  //     method: "get",
  //     url: "request/products",
  //   },
  //   ctx
  // );

  // let metadata: any = request?.metadata ?? {};

  // const pages: any = new Array(Math.ceil((metadata?.count ?? limit) / limit))
  //   .fill(true)
  //   .filter((item, key) => !!key)
  //   .map((item, key) => {
  //     return key + 1;
  //   });

  // const paths = pages.map((item: any) => {
  //   return { params: { page: item.toString() } };
  // });

  return {
    paths: [],
    fallback: "blocking",
  };
};

export async function getStaticProps(ctx: any) {
  const api = new Api();
  const params: any = ctx.params;

  let request: any = await api.content(
    {
      method: 'get',
      url: "products",
    },
    ctx
  );

  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};
  const content = request?.data?.content ?? {};

  let offset = !!params?.page ? (params?.page - 1) * limit : 0;

  request = await api.request(
    {
      method: "get",
      url: "request/products",
      data: {
        limit: limit,
        offset: offset,
        ordem: "desc",
      },
    },
    ctx
  );

  let metadata: any = request?.metadata ?? {};

  const pages: any = new Array(
    Math.ceil((metadata?.count ?? limit) / limit)
  ).fill(true);

  return {
    props: {
      page: params?.page ?? 1,
      paginate: pages,
      products: request?.data ?? [],
      content: content,
      HeaderFooter: HeaderFooter,
      DataSeo: DataSeo,
      Scripts: Scripts,
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
      <section className="bg-cyan-500  pt-24 md:pt-32 relative">
        <div className="container-medium relative pb-14 md:pb-16 text-white">
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

      <div className="relative mt-[-1.85rem]">
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
          {!!paginate?.length && (
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
