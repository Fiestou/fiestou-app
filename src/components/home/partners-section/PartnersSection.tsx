"use client";

import { useState } from "react";
import Img from "@/src/components/utils/ImgBase";
import Icon from "@/src/icons/fontAwesome/FIcon";
import SellerRegistrationForm from "@/src/components/parceiros/SellerRegistrationForm";

interface Partner {
  name: string;
  url: string;
  image: string;
  alt: string;
}

interface PartnersSectionProps {
  partners?: Partner[];
}

export default function PartnersSection({
  partners = [],
}: PartnersSectionProps) {
  const [showForm, setShowForm] = useState(false);

  return (
    <section className="xl:py-14">
      <div className="max-w-[88rem] py-12 md:py-20 mx-auto bg-zinc-100">
        <div className="container-medium">
          <div className="max-w-4xl mx-auto text-center pb-8 md:pb-14">
            <h2 className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2">
              Confira os parceiros já cadastrados
            </h2>
          </div>

          <div className="flex justify-center gap-2 md:gap-12">
            {partners.map((item, i) => (
              <div
                key={i}
                className="flex flex-col gap-4 aspect-square text-center"
              >
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ height: "100%" }}
                >
                  <Img
                    className="w-full h-full rounded-[10px] border border-solid border-yellow shadow-md"
                    src={item.image}
                    alt={item.alt}
                    title={item.alt}
                  />
                </a>
                <h4 className="font-bold">{item.name}</h4>
              </div>
            ))}
          </div>

          <div className="bg-white mt-6 lg:mt-20 rounded-xl grid items-start relative overflow-hidden">
            <div className="grid lg:flex items-center w-full">
                <div className="w-full grid gap-6 p-6 md:p-16">
                <h4 className="font-title font-bold max-w-[30rem] text-zinc-900 text-5xl">
                    Faça parte do Fiestou
                </h4>
                <div className="max-w-[20rem]">
                    <span>
                    Atua no setor de eventos e quer alcançar mais clientes, em
                    João Pessoa? Entre no nosso time criando sua conta agora!
                    </span>
                </div>
                <div className="md:pt-4">
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 font-semibold text-white transition-all duration-300
                        ${showForm ? "bg-zinc-700 hover:bg-zinc-800" : "bg-cyan-500 hover:bg-cyan-600"}`}
                    >
                        <Icon icon={showForm ? "fa-xmark" : "fa-store"} type="far" />
                        {showForm ? "Fechar formulário" : "Eu quero ser parceiro"}
                    </button>
                </div>
                </div>

                <div className="w-full">
                <div className="aspect-[2/2]">
                    <Img
                    className="w-full h-full object-contain"
                    src="/images/Faca-parte-do-Fiestou.png"
                    alt="Faça parte do Fiestou"
                    title="Faça parte do Fiestou"
                    />
                </div>
                </div>
            </div>

            {/* Expansível do Accordion usando classes Tailwind modernas */}
            <div 
                className={`w-full overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] flex justify-center
                    ${showForm ? "grid-rows-[1fr] opacity-100 pb-16 px-6 lg:px-16" : "grid-rows-[0fr] opacity-0"}`}
                style={{ display: 'grid', marginTop: showForm ? '-4rem' : '0' }}
            >
                <div className="min-h-0 w-full max-w-2xl relative z-10">
                    <div className="w-full">
                       {showForm && <SellerRegistrationForm />}
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
