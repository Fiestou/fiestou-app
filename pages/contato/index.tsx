import React, { useState } from "react";
import Template from "@/src/template";
import Api, { defaultQuery } from "@/src/services/api";
import { useRouter } from "next/router";
import Content from "@/src/components/utils/Content";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { Button } from "@/src/components/ui/form";

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
              value: "sobre",
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
      ],
    },
    ctx
  );

  const content = request?.data?.query?.page ?? [];
  const HeaderFooter = request?.data?.query?.HeaderFooter ?? [];
  const DataSeo = request?.data?.query?.DataSeo ?? [];

  return {
    props: {
      content: content[0] ?? {},
      HeaderFooter: HeaderFooter[0] ?? {},
      DataSeo: DataSeo[0] ?? {},
    },
    revalidate: 60 * 60,
  };
}

export default function Contact({
  content,
  HeaderFooter,
  DataSeo,
}: {
  content: any;
  HeaderFooter: any;
  DataSeo: any;
}) {
  const api = new Api();

  const { isFallback } = useRouter();

  const params = content.contato;

  const [data, setData] = useState({} as any);
  const [form, setForm] = useState({
    sended: false,
    loading: false,
  } as any);

  return (
    <Template
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
                <div className="flex gap-2 text-sm opacity-70">
                  <div className="flex items-center">
                    <a className="hover:underline" href="/">
                      Início
                    </a>
                  </div>
                  <div className="flex items-center">
                    <div className="mr-2 text-[.5rem] leading-none">
                      <Icon icon="fa-chevron-right " />
                    </div>
                    <a className="hover:underline" href="/contato/">
                      Contato
                    </a>
                  </div>
                </div>
              </div>
              <h1 className="font-title font-bold text-4xl md:text-5xl mb-4">
                Contato
              </h1>
              <div className="text-lg md:text-2xl font-semibold">
                Uma start-up para facilitar em como realizar sua festa
              </div>
            </div>
            <div className="w-fit"></div>
          </div>
        </div>
      </section>

      <section className="container-medium px-6 md:my-5 md:py-10">
        <div className="grid lg:grid-cols-3 text-lg gap-4">
          <div className="border h-full rounded-lg p-6 md:p-10">
            <div className="p-8 text-yellow-400 relative">
              <Icon
                icon="fa-phone"
                className="text-6xl absolute top-1/2 left-0 -translate-y-1/2"
              />
              <Icon
                icon="fa-phone"
                type="fa"
                className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2"
              />
            </div>
            <div className="pt-6 grid">
              <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">
                Telefone
              </h3>
              <div className="text-sm grid">
                <span>17 99232-2333</span>
                <span>17 99232-2333</span>
              </div>
            </div>
          </div>

          <div className="border h-full rounded-lg p-6 md:p-10">
            <div className="p-8 text-yellow-400 relative">
              <Icon
                icon="fa-envelope-open"
                className="text-6xl absolute top-1/2 left-0 -translate-y-1/2"
              />
              <Icon
                icon="fa-envelope-open"
                type="fa"
                className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2"
              />
            </div>
            <div className="pt-6 grid">
              <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">
                E-mail
              </h3>
              <div className="text-sm grid">
                <a href={`mail:contato@fiestou.com.br`}>
                  <span>contato@fiestou.com.br</span>
                </a>
                <a href={`mail:suporte@fiestou.com.br`}>
                  <span>suporte@fiestou.com.br</span>
                </a>
              </div>
            </div>
          </div>

          <div className="border h-full rounded-lg p-6 md:p-10">
            <div className="p-8 text-yellow-400 relative">
              <Icon
                icon="fa-map-marker-check"
                className="text-6xl absolute top-1/2 left-0 -translate-y-1/2"
              />
              <Icon
                icon="fa-map-marker-check"
                type="fa"
                className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2"
              />
            </div>
            <div className="pt-6 grid">
              <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">
                Local
              </h3>
              <div className="text-sm grid">
                Rua Afonso Ramos Maia, 77 Brisamar - João Pessoa | PB CEP:
                58033-040 | Brasil
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-medium pb-20 z-10 relative px-4">
        <form onSubmit={(e) => {}}>
          <div className="grid gap-4 bg-zinc-100 p-6 lg:p-20 relative overflow-hidden rounded-xl md:rounded-3xl">
            <div className="grid lg:grid-cols-2 gap-4">
              <div>
                <input
                  required
                  type="text"
                  name="name"
                  className="form-control bg-white p-4 text-zinc-900"
                  placeholder="Nome"
                  onChange={(e: any) =>
                    setData({ ...data, name: e.target.value })
                  }
                />
              </div>
              <div>
                <input
                  type="text"
                  name="lastName"
                  className="form-control bg-white p-4 text-zinc-900"
                  placeholder="Sobre nome"
                  onChange={(e: any) =>
                    setData({ ...data, lastName: e.target.value })
                  }
                />
              </div>

              <div className="">
                <input
                  className="form-control bg-white p-4 text-zinc-900"
                  required
                  type="email"
                  name="email"
                  placeholder="E-Mail"
                  onChange={(e: any) =>
                    setData({ ...data, email: e.target.value })
                  }
                />
              </div>

              <div className="">
                <input
                  className="form-control bg-white p-4 text-zinc-900"
                  required
                  type="text"
                  name="subject"
                  placeholder="Assunto"
                  onChange={(e: any) =>
                    setData({ ...data, subject: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="">
              <textarea
                rows={5}
                required
                name="message"
                className="form-control bg-white p-4 text-zinc-900"
                placeholder="Mensagem"
                onChange={(e: any) =>
                  setData({ ...data, message: e.target.value })
                }
              ></textarea>
            </div>

            <div className="grid">
              <Button className="">Envar</Button>
            </div>
          </div>
        </form>
      </section>
    </Template>
  );
}
