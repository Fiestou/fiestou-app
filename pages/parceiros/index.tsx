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
import { useEffect } from "react";
import { PartnerType } from "@/src/models/partner";
import { HeaderFooterType } from "@/src/models/headerFooter";
import { DataSeoType } from "@/src/models/dataSeo";
import { ScriptsType } from "@/src/models/scripts";

export async function getStaticProps(ctx: any) {
  const api = new Api();

  let request: any = await api.content({ url: `partners` });

  const Stores = request?.data?.Stores ?? [];
  const Partners = request?.data?.Partners ?? {};
  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};
  
  return {
    props: {
      Stores: Stores,
      Partners: Partners,
      HeaderFooter: HeaderFooter,
      DataSeo: DataSeo,
      Scripts: Scripts,
    },
    revalidate: 60,
  };
}

export default function Parceiros({
  Stores,
  Partners,
  HeaderFooter,
  DataSeo,
  Scripts,
}: {
  Stores: StoreType[];
  Partners: PartnerType;
  HeaderFooter: HeaderFooterType;
  DataSeo: DataSeoType;
  Scripts: ScriptsType;
}) {
  
  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `${Partners?.main_text} | ${DataSeo?.site_text}`,
        image: getImage(DataSeo?.site_image)
          ? getImage(DataSeo?.site_image)
          : "",
        description: `${Partners?.main_description} - ${DataSeo?.site_description}`,
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
      <section className="bg-cyan-500 pt-24 md:pt-32 relative">
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
                dangerouslySetInnerHTML={{ __html: Partners?.main_text }}
              ></h1>
              <div
                className="text-lg md:text-2xl font-semibold"
                dangerouslySetInnerHTML={{ __html: Partners?.main_description }}
              ></div>
            </div>
            {!!getImage(Partners?.main_icons) && (
              <div className="w-fit">
                <Img
                  src={getImage(Partners?.main_icons)}
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
            {Stores &&
              Stores.map((store, key) => (
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
