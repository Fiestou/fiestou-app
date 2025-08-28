import Api from "@/src/services/api";
import Template from "@/src/template";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import ButtonLoader from "@/src/components/utils/ButtonLoader";
import Img from "@/src/components/utils/ImgBase";
import { Button, Input, Label } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Newsletter from "@/src/components/common/Newsletter";
import { cleanText, getImage } from "@/src/helper";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export async function getStaticProps(ctx: any) {
  const api = new Api();

  let request: any = await api.content({method: 'get', url: `faq` });

  const Faq = request?.data?.Faq ?? {};
  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};

  return {
    props: {
      Faq: Faq,
      HeaderFooter: HeaderFooter,
      DataSeo: DataSeo,
      Scripts: Scripts,
    },
    revalidate: 60 * 60 * 60,
  };
}

export default function Ajuda({
  Faq,
  HeaderFooter,
  DataSeo,
  Scripts,
}: {
  Faq: any;
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
}) {
  const [collapseFaq, setCollapseFaq] = useState(0);

  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `${Faq?.main_text} | ${DataSeo?.site_text}`,
        image: !!getImage(DataSeo?.site_image)
          ? getImage(DataSeo?.site_image)
          : "",
        description: `${Faq?.main_description} - ${DataSeo?.site_description}`,
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
      <section className="bg-cyan-500  pt-24 md:pt-32 relative">
        <div className="container-medium relative pb-4 md:pb-10 text-white">
          <div className="flex items-end">
            <div className="w-full">
              <div className="pb-4">
                <Breadcrumbs links={[{ url: "/faq", name: "FAQ" }]} />
              </div>
              <h1
                className="font-title font-bold text-4xl md:text-5xl mb-4"
                dangerouslySetInnerHTML={{ __html: Faq?.main_text }}
              ></h1>
              <div
                className="text-lg md:text-2xl font-semibold"
                dangerouslySetInnerHTML={{ __html: Faq?.main_description }}
              ></div>
            </div>
            {!!getImage(Faq?.main_icons) && (
              <div className="w-fit">
                <Img
                  src={getImage(Faq?.main_icons)}
                  className="w-auto max-w-full"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-1 md:py-10">
        <div className="container-medium">
          <div className="">
            {!!Faq?.main_text &&
              Faq?.faq_list.map((item: any, key: any) => (
                <div key={key} className="border-b py-6">
                  <div
                    onClick={() =>
                      setCollapseFaq(key != collapseFaq ? key : -1)
                    }
                    className="font-title flex font-bold text-zinc-900 md:text-2xl cursor-pointer"
                  >
                    <span className="w-full">{item.answer_question}</span>
                    <div>
                      <Icon
                        icon={
                          collapseFaq == key
                            ? "fa-chevron-up"
                            : "fa-chevron-down"
                        }
                        type="far"
                        className="text-sm"
                      />
                    </div>
                  </div>
                  {collapseFaq == key && (
                    <div
                      className="pt-4"
                      dangerouslySetInnerHTML={{ __html: item.answer_text }}
                    ></div>
                  )}
                </div>
              ))}
          </div>
        </div>
      </section>

      <section>
        <div className="container-medium py-14">
  <div className="bg-zinc-100 border border-zinc-100 rounded-xl grid lg:flex items-center relative overflow-hidden">
    <div className="w-full grid gap-6 p-6 md:p-16 text-zinc-900">
      <h4 className="font-title font-bold max-w-[30rem] text-3xl md:text-4xl">
        Fale com a nossa equipe e tire todas as suas dúvidas!
      </h4>

      <div className="pt-2">
        <Button href="/contato">Enviar mensagem</Button>
      </div>
    </div>

    <div className="w-full">
      <Img
        className="w-full"
        src="/images/faq-banner.png" // <-- aqui você coloca a imagem fixa
        alt="Entre em contato conosco"
      />
    </div>
  </div>
</div>

      </section>
    </Template>
  );
}
