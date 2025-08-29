import Api from "@/src/services/api";
import Template from "@/src/template";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import ButtonLoader from "@/src/components/utils/ButtonLoader";
import Img from "@/src/components/utils/ImgBase";
import { Button, Input, Label } from "@/src/components/ui/form";
import Newsletter from "@/src/components/common/Newsletter";
import { clean, getImage } from "@/src/helper";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import { library } from '@fortawesome/fontawesome-svg-core';
import { faHandPointUp, faCalendar, faWineBottle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Configura a biblioteca do Font Awesome
library.add(faHandPointUp, faCalendar, faWineBottle);

// Tipagem para as props (se usar TypeScript)
interface SobreProps {
  About: any;
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
}

// Função getStaticProps
export async function getStaticProps(ctx: any) {
  const api = new Api();
  let request: any = await api.content({ method: 'get', url: `about` });

  const About = request?.data?.About ?? {};
  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};

  return {
    props: {
      About,
      HeaderFooter,
      DataSeo,
      Scripts,
    },
    revalidate: 60 * 60 * 60,
  };
}

// Dados dos itens
const worksList = [
  {
    work_title: 'Clicou',
    work_description: 'Procure no site pelas melhores ofertas de fornecedores no setor de eventos, pesquisando por produtos ou por parceiros. Em alguns clicks sua festa está pronta.',
    work_icon: faHandPointUp, // Alterado de faCircle para fa-hand-point-up
  },
  {
    work_title: 'Marcou',
    work_description: 'Na data e horário marcado, a entrega será feita no endereço registrado. Pontualmente e com o acompanhamento pelo portal do usuário.',
    work_icon: faCalendar,
  },
  {
    work_title: 'Fiestou',
    work_description: 'Aproveite sua festa. No dia seguinte recolhemos, o que for alugado. E dá uma forcinha para gente e avalie o serviço.',
    work_icon: faWineBottle,
  },
];

export default function Sobre({ About, HeaderFooter, DataSeo, Scripts }: SobreProps) {
  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `Sobre | ${DataSeo?.site_text}`,
        image: getImage(DataSeo?.site_image) || "",
        description: clean(About?.main_description),
        url: `sobre`,
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
                <Breadcrumbs links={[{ url: "/sobre", name: "Sobre" }]} />
              </div>
              <h1 className="font-title font-bold text-4xl md:text-5xl mb-4">
                Sobre nós
              </h1>
              <div className="text-lg md:text-2xl font-semibold">
                Uma start-up para facilitar em como realizar sua festa
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:pt-20 relative overflow-hidden">
        <div className="container-medium">
          <div className="max-w-3xl mx-auto text-center pb-6 md:pb-14">
            <h2 className="font-title text-zinc-900 font-bold text-3xl md:text-5xl mt-2">
              Te ajudamos a festejar sem dor de cabeça
            </h2>
          </div>
          <div className="px-4 py-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {worksList.map((item, index) => (
                <div
                  key={index}
                  className="border h-full rounded-lg p-6 md:p-10 bg-white"
                >
                  <div className="p-8 text-yellow-400 relative">
                    <FontAwesomeIcon
                      icon={item.work_icon}
                      className="text-6xl absolute top-1/2 left-0 -translate-y-1/2"
                    />
                    <FontAwesomeIcon
                      icon={item.work_icon}
                      className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2"
                    />
                  </div>
                  <div className="pt-6">
                    <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">
                      {item.work_title}
                    </h3>
                    <div className="text-gray-600">{item.work_description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="md:py-6">
          <div className="max-w-[88rem] pt-10 pb-6 md:py-20 mx-auto bg-zinc-100">
            <div className="container-medium grid lg:flex gap-6 md:gap-10 items-center">
              <div className="w-full grid gap-4 md:gap-8">
                <h4
                  className="font-title font-bold max-w-[30rem] text-4xl text-zinc-900"
                  dangerouslySetInnerHTML={{ __html: About?.about_title }}
                ></h4>
                <div
                  className="max-w-[30rem] md:text-lg"
                  dangerouslySetInnerHTML={{ __html: About?.about_text }}
                ></div>
              </div>
              {!!About?.about_image && (
                <div className="w-full">
                  <Img
                    src={getImage(About?.about_image)}
                    className="w-full rounded-xl"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
    </Template>
  );
}