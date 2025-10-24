import { useState } from "react";
import Template from "@/src/template";
import Img from "@/src/components/utils/ImgBase";
import { Button } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export default function Ajuda() {
  const [collapseFaq, setCollapseFaq] = useState<number | null>(null);

  const faqData = [
    {
      question: "Como funciona?",
      answer:
        "Procure o que precise para sua festa, reserve, faça o pagamento. E entregamos no dia marcado.",
    },
    {
      question: "Que produtos a Fiestou oferece?",
      answer: "Oferecemos decorações, buffet e bolo para a festa.",
    },
    {
      question: "Onde pode ser feito a entrega?",
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
        "Na descrição dos produtos, diz se está incluído a montagem ou não.",
    },
    {
      question: "Onde posso baixar o aplicativo?",
      answer:
        "No momento não temos aplicativo. Somos um website que pode acessar em qualquer navegador.",
    },
  ];

  return (
    <Template
      scripts={{}}
      metaPage={{
        title: "Dúvidas | Fiestou",
        image: "/images/fiestou-logo.png",
        description: "Perguntas frequentes sobre nossos serviços",
        url: "faq",
      }}
      header={{
        template: "default",
        position: "fixed",
        content: {},
      }}
      footer={{
        template: "default",
        content: {},
      }}
    >
      <section className="bg-cyan-500 pt-24 md:pt-32 relative">
        <div className="container-medium relative pb-4 md:pb-10 text-white">
          <div className="flex items-end">
            <div className="w-full">
              <div className="pb-4">
                <Breadcrumbs links={[{ url: "/faq", name: "FAQ" }]} />
              </div>
              <h1 className="font-title font-bold text-4xl md:text-5xl mb-4">
                Dúvidas
              </h1>
              <div className="text-lg md:text-2xl font-semibold">
                Temos as respostas
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-1 md:py-10">
        <div className="container-medium">
          {faqData.map((item, index) => (
            <div key={index} className="border-b py-6">
              <div
                onClick={() =>
                  setCollapseFaq(collapseFaq === index ? null : index)
                }
                className="font-title flex font-bold text-zinc-900 md:text-2xl cursor-pointer"
              >
                <span className="w-full">{item.question}</span>
                <div>
                  <Icon
                    icon={
                      collapseFaq === index ? "fa-chevron-up" : "fa-chevron-down"
                    }
                    type="far"
                    className="text-sm"
                  />
                </div>
              </div>
              {collapseFaq === index && (
                <div className="pt-4">{item.answer}</div>
              )}
            </div>
          ))}
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
              <Img className="w-full" src="/images/champagne-question.jpeg" />
            </div>
          </div>
        </div>
      </section>
    </Template>
  );
}
