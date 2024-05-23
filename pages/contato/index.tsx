import React, { useState } from "react";
import Template from "@/src/template";
import Api, { defaultQuery } from "@/src/services/api";
import { useRouter } from "next/router";
import Content from "@/src/components/utils/Content";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { Button } from "@/src/components/ui/form";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import { getImage } from "@/src/helper";
import Img from "@/src/components/utils/ImgBase";

export async function getStaticProps(ctx: any) {
  const api = new Api();

  let request: any = await api.content({ url: `contact` });

  const Contact = request?.data?.Contact ?? {};
  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};

  return {
    props: {
      Contact: Contact,
      HeaderFooter: HeaderFooter,
      DataSeo: DataSeo,
      Scripts: Scripts,
    },
    revalidate: 60 * 60 * 60,
  };
}

export default function Contact({
  Contact,
  HeaderFooter,
  DataSeo,
  Scripts,
}: {
  Contact: any;
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
}) {
  const api = new Api();
  console.log(Contact);

  const [data, setData] = useState({} as any);
  const [form, setForm] = useState({
    sended: false,
    loading: false,
  } as any);

  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `Contato | ${DataSeo?.site_text}`,
        image: !!getImage(DataSeo?.site_image)
          ? getImage(DataSeo?.site_image)
          : "",
        url: `contato`,
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
          <div className="flex">
            <div className="w-full">
              <div className="pb-4">
                <Breadcrumbs links={[{ url: "/contato", name: "Contato" }]} />
              </div>
              <h1
                className="font-title font-bold text-4xl md:text-5xl mb-4"
                dangerouslySetInnerHTML={{ __html: Contact?.main_text }}
              ></h1>
              <div
                className="text-lg md:text-2xl font-semibold"
                dangerouslySetInnerHTML={{ __html: Contact?.main_description }}
              ></div>
            </div>
            {!!getImage(Contact?.main_icons) && (
              <div className="w-fit">
                <Img
                  src={getImage(Contact?.main_icons)}
                  className="w-auto max-w-full"
                />
              </div>
            )}
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
                <span>{Contact?.contact_phone}</span>
                <span>{Contact?.contact_phone_support}</span>
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
                <a href={`mail:${Contact?.contact_email}`}>
                  <span>{Contact?.contact_email}</span>
                </a>
                <a href={`mail:${Contact?.contact_email_support}`}>
                  <span>{Contact?.contact_email_support}</span>
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
              <div className="text-sm grid">{Contact?.contact_address}</div>
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
              <Button className="">Enviar</Button>
            </div>
          </div>
        </form>
      </section>
    </Template>
  );
}
