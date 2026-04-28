import { useMemo, useState } from "react";
import Api from "@/src/services/api";
import Template from "@/src/template";
import Img from "@/src/components/utils/ImgBase";
import { Button } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import { getImage } from "@/src/helper";

interface FaqItem {
  id?: string;
  question?: string;
  answer?: string;
  answer_question?: string;
  answer_text?: string;
}

interface FaqPageProps {
  Faq: any;
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
}

const defaultFaqItems: FaqItem[] = [
  {
    question: "Como funciona?",
    answer:
      "Procure o que precisa para sua festa, reserve e faça o pagamento. Entregamos no dia marcado.",
  },
  {
    question: "Que produtos a Fiestou oferece?",
    answer: "Oferecemos decorações, buffet e bolo para a festa.",
  },
  {
    question: "Onde pode ser feita a entrega?",
    answer: "Na cidade de João Pessoa.",
  },
  {
    question: "Onde nos localizamos?",
    answer:
      "Temos um depósito na Rua Alfonso Ramos Maia 77 - Miramar. Mas a gente faz a entrega no lugar que você deseja. Menos trabalho para você!",
  },
  {
    question: "Quanto custa?",
    answer: "Temos diversos produtos, com os valores nos cards.",
  },
  {
    question: "A Fiestou faz a montagem da decoração?",
    answer:
      "Na descrição dos produtos, diz se a montagem está incluída ou não.",
  },
  {
    question: "Onde posso baixar o aplicativo?",
    answer:
      "No momento não temos aplicativo. Somos um website que você pode acessar em qualquer navegador.",
  },
];

const stripHtml = (value: any) =>
  String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export async function getStaticProps(ctx: any) {
  const api = new Api();
  const request: any = await api.content({ method: "get", url: "faq" }, ctx);

  const Faq = request?.data?.Faq ?? {};
  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};

  return {
    props: {
      Faq,
      HeaderFooter,
      DataSeo,
      Scripts,
    },
    revalidate: 60 * 60 * 60,
  };
}

export default function Ajuda({
  Faq,
  HeaderFooter,
  DataSeo,
  Scripts,
}: FaqPageProps) {
  const [collapseFaq, setCollapseFaq] = useState<number | null>(null);

  const faqItems = useMemo(() => {
    const list = Array.isArray(Faq?.faq_list) ? Faq.faq_list : [];

    return list.length
      ? list.filter(
          (item: FaqItem) => !!item?.answer_question || !!item?.answer_text
        )
      : defaultFaqItems;
  }, [Faq?.faq_list]);

  const heroTitle = Faq?.main_text || "Dúvidas";
  const heroDescription = Faq?.main_description || "<p>Temos as respostas</p>";
  const ctaTitle = Faq?.cta_text || "Fale com a nossa equipe e tire todas as suas dúvidas!";
  const ctaDescription =
    Faq?.cta_description ||
    "<p>Receba orientação rápida para escolher o item ideal para a sua festa.</p>";
  const ctaLabel = Faq?.cta_redirect?.label || "Enviar mensagem";
  const ctaUrl =
    Faq?.cta_redirect?.url ||
    "https://wa.me/5583999812030?text=Ol%C3%A1%2C%20gostaria%20de%20tirar%20uma%20d%C3%BAvida.";
  const ctaImage = getImage(Faq?.cta_image) || "/images/champagne-question.jpeg";

  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `Dúvidas | ${DataSeo?.site_text || "Fiestou"}`,
        image: getImage(DataSeo?.site_image) || "/images/fiestou-logo.png",
        description:
          stripHtml(heroDescription) ||
          "Perguntas frequentes sobre nossos serviços",
        url: "faq",
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
          <div className="flex items-end gap-6">
            <div className="w-full">
              <div className="pb-4">
                <Breadcrumbs links={[{ url: "/faq", name: "FAQ" }]} />
              </div>
              <h1
                className="font-title font-bold text-4xl md:text-5xl mb-4"
                dangerouslySetInnerHTML={{ __html: heroTitle }}
              />
              <div
                className="text-lg md:text-2xl font-semibold"
                dangerouslySetInnerHTML={{ __html: heroDescription }}
              />
            </div>
            {!!getImage(Faq?.main_icons) && (
              <div className="hidden md:block w-fit">
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
          {faqItems.map((item: any, index: number) => {
            const question = item?.answer_question || item?.question || "";
            const answer = item?.answer_text || item?.answer || "";

            return (
              <div key={item?.id ?? index} className="border-b py-6">
                <button
                  type="button"
                  onClick={() =>
                    setCollapseFaq(collapseFaq === index ? null : index)
                  }
                  className="font-title flex w-full items-start gap-4 text-left font-bold text-zinc-900 md:text-2xl"
                >
                  <span className="flex-1">{question}</span>
                  <span className="pt-1">
                    <Icon
                      icon={
                        collapseFaq === index
                          ? "fa-chevron-up"
                          : "fa-chevron-down"
                      }
                      type="far"
                      className="text-sm"
                    />
                  </span>
                </button>
                {collapseFaq === index && (
                  <div className="pt-4 text-zinc-700 leading-7 whitespace-pre-line">
                    {answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="container-medium py-14">
          <div className="bg-zinc-100 border border-zinc-100 rounded-xl grid lg:flex items-center relative overflow-hidden">
            <div className="w-full grid gap-4 p-6 md:p-16 text-zinc-900">
              <h4
                className="font-title font-bold max-w-[32rem] text-3xl md:text-4xl"
                dangerouslySetInnerHTML={{ __html: ctaTitle }}
              />
              <div
                className="max-w-[32rem] text-base md:text-lg text-zinc-700"
                dangerouslySetInnerHTML={{ __html: ctaDescription }}
              />

              <div className="pt-2">
                <Button href={ctaUrl} target="_blank" rel="noopener noreferrer">
                  {ctaLabel}
                </Button>
              </div>
            </div>

            <div className="w-full">
              <Img className="w-full" src={ctaImage} />
            </div>
          </div>
        </div>
      </section>
    </Template>
  );
}
