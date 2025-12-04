import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { Button } from "@/src/components/ui/form";
import { NextApiRequest, NextApiResponse } from "next";
import Api from "@/src/services/api";
import { getExtenseData, moneyFormat } from "@/src/helper";
import { useEffect, useState } from "react";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export async function getServerSideProps(ctx: any) {
  const store = ctx.req.cookies["fiestou.store"] ?? 0;

  return {
    props: {
      store: store,
    },
  };
}

export default function Clientes({ store }: { store: any }) {
  const api = new Api();

  const [clients, setClients] = useState([] as Array<any>);

  const relationship = async () => {
    let request: any = await api.bridge({
      method: 'post',
      url: "stores/customers",
      data: {
        store: store,
      },
    });

    setClients(request.data || []);
  };

  useEffect(() => {
    if (!!window) {
      relationship();
    }
  }, []);

  return (
    <Template
      header={{
        template: "painel",
        position: "solid",
      }}
      footer={{
        template: "clean",
      }}
    >
      <section className="">
        <div className="container-medium pt-12">
          <div className="pb-4">
            <Breadcrumbs
              links={[
                { url: "/painel", name: "Painel" },
                { url: "/painel/clientes", name: "Clientes" },
              ]}
            />
          </div>
          <div className="grid md:flex gap-4 items-center w-full">
            <div className="w-full flex items-center">
              <Link passHref href="/painel">
                <Icon
                  icon="fa-long-arrow-left"
                  className="mr-6 text-2xl text-zinc-900"
                />
              </Link>
              <div className="text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900 w-full">
                <span className="font-title font-bold">Clientes</span>
              </div>
            </div>
            <div className="flex items-center gap-6 w-full md:w-fit">
              <div>
                <button
                  type="button"
                  className="rounded-xl whitespace-nowrap border py-4 text-zinc-900 font-semibold px-8"
                >
                  Filtrar{" "}
                  <Icon
                    icon="fa-chevron-down"
                    type="far"
                    className="text-xs ml-1"
                  />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="pt-6">
        <div className="container-medium pb-12">
          <div className="border border-t-0 grid md:grid-cols-2 lg:block w-full">
            <div className="hidden lg:flex border-t bg-zinc-100 p-4 lg:p-8 gap-4 lg:gap-8 font-bold text-zinc-900 font-title">
              <div className="w-[40rem]">Nome</div>
              <div className="w-full">E-mail</div>
              <div className="w-[22rem]"></div>
            </div>
            {!!clients &&
              clients.map((client: any, key: any) => (
                <div
                  key={key}
                  className="grid lg:flex border-t p-4 lg:p-8 gap-2 lg:gap-8 text-zinc-900 hover:bg-zinc-50 bg-opacity-5 ease items-center"
                >
                  <div className="w-full lg:w-[40rem]">
                    <span className="text-sm pr-2 w-[4rem] inline-block lg:hidden text-zinc-400">
                      Nome
                    </span>
                    {client?.name}
                  </div>
                  <div className="w-full">
                    <span className="text-sm pr-2 w-[4rem] inline-block lg:hidden text-zinc-400">
                      E-mail
                    </span>
                    {client?.email}
                  </div>
                  <div className="w-full lg:w-[22rem] grid">
                    <Button
                      href={`/painel/clientes/${client.id}`}
                      style="btn-light"
                      className="text-zinc-900 py-2 px-3 mt-4 lg:mt-0 text-sm whitespace-nowrap"
                    >
                      Ver detalhes
                    </Button>
                  </div>
                </div>
              ))}
          </div>
          <div className="pt-4">Mostrando 1 página de 1 com 4 produtos</div>
        </div>
      </section>
    </Template>
  );
}
