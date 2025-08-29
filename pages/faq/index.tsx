import Api from "@/src/services/api";
import Template from "@/src/template";
import { useState } from "react";
import Img from "@/src/components/utils/ImgBase";
import { Button } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { getImage } from "@/src/helper";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export async function getStaticProps(ctx: any) {
  const api = new Api();

  let request: any = await api.content({ method: 'get', url: `faq` });

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
              >Dúvidas</h1>
              <div
                className="text-lg md:text-2xl font-semibold"
              >Temos as respostas</div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-1 md:py-10">
        <div className="container-medium">
          <div className="">
            <div className="border-b py-6">
              <div
                onClick={() => setCollapseFaq(collapseFaq !== 0 ? 0 : -1)}
                className="font-title flex font-bold text-zinc-900 md:text-2xl cursor-pointer"
              >
                <span className="w-full">Como funciona?</span>
                <div>
                  <Icon
                    icon={collapseFaq === 0 ? "fa-chevron-up" : "fa-chevron-down"}
                    type="far"
                    className="text-sm"
                  />
                </div>
              </div>
              {collapseFaq === 0 && (
                <div className="pt-4">
                  Procure o que precise para sua festa, reserve, faça o pagamento. E entregamos no dia marcado.
                </div>
              )}
            </div>

            <div className="border-b py-6">
              <div
                onClick={() => setCollapseFaq(collapseFaq !== 1 ? 1 : -1)}
                className="font-title flex font-bold text-zinc-900 md:text-2xl cursor-pointer"
              >
                <span className="w-full">Que produtos a Fiestou oferece?</span>
                <div>
                  <Icon
                    icon={collapseFaq === 1 ? "fa-chevron-up" : "fa-chevron-down"}
                    type="far"
                    className="text-sm"
                  />
                </div>
              </div>
              {collapseFaq === 1 && (
                <div className="pt-4">
                  Oferecemos decorações, buffet e bolo para a festa.
                </div>
              )}
            </div>
            <div className="border-b py-6">
              <div
                onClick={() => setCollapseFaq(collapseFaq !== 2 ? 2 : -1)}
                className="font-title flex font-bold text-zinc-900 md:text-2xl cursor-pointer"
              >
                <span className="w-full">Onde pode ser feito a entrega?</span>
                <div>
                  <Icon
                    icon={collapseFaq === 2 ? "fa-chevron-up" : "fa-chevron-down"}
                    type="far"
                    className="text-sm"
                  />
                </div>
              </div>
              {collapseFaq === 2 && (
                <div className="pt-4">
                  Na cidade de João Pessoa.
                </div>
              )}
            </div>
            <div className="border-b py-6">
              <div
                onClick={() => setCollapseFaq(collapseFaq !== 3 ? 3 : -1)}
                className="font-title flex font-bold text-zinc-900 md:text-2xl cursor-pointer"
              >
                <span className="w-full">Onde nos localizamos?</span>
                <div>
                  <Icon
                    icon={collapseFaq === 3 ? "fa-chevron-up" : "fa-chevron-down"}
                    type="far"
                    className="text-sm"
                  />
                </div>
              </div>
              {collapseFaq === 3 && (
                <div className="pt-4">
                  Temos um depósito na Rua Alfonso Ramos Maia 77 - Miramar. Mas a gente faz a entrega no lugar que você deseja. Menos trabalho para você!
                </div>
              )}
            </div>
            <div className="border-b py-6">
              <div
                onClick={() => setCollapseFaq(collapseFaq !== 4 ? 4 : -1)}
                className="font-title flex font-bold text-zinc-900 md:text-2xl cursor-pointer"
              >
                <span className="w-full">Quanto custa?</span>
                <div>
                  <Icon
                    icon={collapseFaq === 4 ? "fa-chevron-up" : "fa-chevron-down"}
                    type="far"
                    className="text-sm"
                  />
                </div>
              </div>
              {collapseFaq === 4 && (
                <div className="pt-4">
                  Temos diversos produtos, com os valores nos cards.
                </div>
              )}
            </div>
            <div className="border-b py-6">
              <div
                onClick={() => setCollapseFaq(collapseFaq !== 5 ? 5 : -1)}
                className="font-title flex font-bold text-zinc-900 md:text-2xl cursor-pointer"
              >
                <span className="w-full">A Fiestou faz a montagem da decoração?</span>
                <div>
                  <Icon
                    icon={collapseFaq === 5 ? "fa-chevron-up" : "fa-chevron-down"}
                    type="far"
                    className="text-sm"
                  />
                </div>
              </div>
              {collapseFaq === 5 && (
                <div className="pt-4">
                  Na descrição dos produtos, diz se está incluído a montagem ou não.
                </div>
              )}
            </div>
            <div className="border-b py-6">
              <div
                onClick={() => setCollapseFaq(collapseFaq !== 6 ? 6 : -1)}
                className="font-title flex font-bold text-zinc-900 md:text-2xl cursor-pointer"
              >
                <span className="w-full">Onde posso baixar o aplicativo?</span>
                <div>
                  <Icon
                    icon={collapseFaq === 6 ? "fa-chevron-up" : "fa-chevron-down"}
                    type="far"
                    className="text-sm"
                  />
                </div>
              </div>
              {collapseFaq === 6 && (
                <div className="pt-4">
                  No momento não temos aplicativo. Somos um website que pode acessar em qualquer navegador.
                </div>
              )}
            </div>
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
                <Button
                  href="https://wa.me/5583999812030?text=Ol%C3%A1%2C%20gostaria%20de%20tirar%20uma%20d%C3%BAvida."
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Enviar mensagem
                </Button>
              </div>
            </div>

            <div className="w-full">
              <Img className="w-full" src={getImage(Faq?.cta_image)} />
            </div>
          </div>
        </div>


      </section>
    </Template>
  );
}
