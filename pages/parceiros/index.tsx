import Product from "@/src/components/common/Product";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Image from "next/image";
import Link from "next/link";
import Partner from "@/src/components/common/Partner";
import Template from "@/src/template";
import Api from "@/src/services/api";
import { StoreType } from "@/src/models/store";
import { getImage } from "@/src/helper";
import Img from "@/src/components/utils/ImgBase";
import Filter from "@/src/components/common/Filter";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export async function getStaticProps(ctx: any) {
  const api = new Api();
  let request: any = await api.call(
    {
      url: "request/graph",
      data: [
        {
          model: "page",
          filter: [
            {
              key: "slug",
              value: "parceiros",
              compare: "=",
            },
          ],
        },
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
  const content = request?.data?.query?.page[0] ?? [];

  console.log(content);

  request = await api.get({
    url: "request/stores",
  });

  return {
    props: {
      stores: request?.data ?? [],
      content: content ?? {},
      HeaderFooter: HeaderFooter[0] ?? {},
      DataSeo: DataSeo[0] ?? {},
      Scripts: Scripts[0] ?? {},
    },
    revalidate: 60 * 60 * 60,
  };
}

export default function Parceiros({
  stores,
  content,
  HeaderFooter,
  DataSeo,
  Scripts,
}: {
  stores: Array<StoreType>;
  content: any;
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
}) {
  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `${content.main_text} | ${DataSeo?.site_text}`,
        image: !!getImage(DataSeo?.site_image)
          ? getImage(DataSeo?.site_image)
          : "",
        description: `${content.main_description} - ${DataSeo?.site_description}`,
        url: `faq`,
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
      <section
        className="bg-cyan-500 pt-24 md:pt-32 relative"
        style={{ backgroundColor: "#2dc4fe" }}
      >
        <div className="container-medium relative pb-4 md:pb-10 text-white">
          <div className="flex">
            <div className="w-full">
              <div className="pb-4">
                <Breadcrumbs
                  links={[{ url: "/parceiros", name: "Parceiros" }]}
                />
              </div>
              <h1
                className="font-title font-bold text-4xl md:text-5xl mb-4"
                dangerouslySetInnerHTML={{ __html: content.main_text }}
              ></h1>
              <div
                className="text-lg md:text-2xl font-semibold"
                dangerouslySetInnerHTML={{ __html: content.main_description }}
              ></div>
            </div>
            {!!getImage(content.main_icons) && (
              <div className="w-fit">
                <Img
                  src={getImage(content.main_icons)}
                  className="w-auto max-w-full"
                />
              </div>
            )}
          </div>
        </div>
      </section>
      {/* <Filter /> */}
      <section className="pt-6 md:pt-10 pb-10 md:pb-20">
        <div className="container-medium">
          <div className="grid sm:grid-cols-3 gap-2 md:gap-y-10 md:gap-x-6">
            {!!stores &&
              stores.map((store, key) => (
                <div key={key}>
                  <Partner params={store} />
                </div>
              ))}
          </div>
        </div>
      </section>
    </Template>
  );
}
