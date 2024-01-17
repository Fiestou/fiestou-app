import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { Button } from "@/src/components/ui/form";
import { NextApiRequest, NextApiResponse } from "next";
import { getExtenseData, moneyFormat } from "@/src/helper";
import Api from "@/src/services/api";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export async function getServerSideProps(ctx: any) {
  const api = new Api();

  let request: any = await api.bridge(
    {
      url: "suborders/list",
    },
    ctx
  );

  return {
    props: {
      orders: request?.data ?? [],
    },
  };
}

export default function Pedidos({ orders }: { orders: Array<any> }) {
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
                { url: "/painel/pedidos", name: "Pedidos" },
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
                <span className="font-title font-bold">Pedidos</span>
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
              <div className="w-[16rem]">Pedido</div>
              <div className="w-[40rem]">Data</div>
              <div className="w-[48rem]">Cliente</div>
              <div className="w-[32rem]">Total</div>
              <div className="w-[32rem]">Status</div>
              <div className="w-[22rem]">Ações</div>
            </div>
            {!!orders &&
              orders.map((suborder, key) => (
                <div
                  key={key}
                  className="grid lg:flex border-t p-4 lg:p-8 gap-2 lg:gap-8 text-zinc-900 hover:bg-zinc-50 bg-opacity-5 ease items-center"
                >
                  <div className="w-full lg:w-[16rem]">
                    <span className="text-sm pr-2 w-[4rem] inline-block lg:hidden text-zinc-400">
                      pedido:
                    </span>
                    #{suborder.order.id}
                  </div>
                  <div className="w-full lg:w-[40rem] whitespace-nowrap text-sm lg:text-base">
                    <span className="text-sm pr-2 w-[4rem] inline-block lg:hidden text-zinc-400">
                      data:
                    </span>
                    {getExtenseData(suborder.created_at)}
                  </div>
                  <div className="w-full lg:w-[48rem]">
                    <span className="text-sm pr-2 w-[4rem] inline-block lg:hidden text-zinc-400">
                      cliente:
                    </span>
                    <span className="font-bold">{suborder.user.name}</span>
                  </div>
                  <div className="w-full lg:w-[32rem]">
                    <span className="text-sm pr-2 w-[4rem] inline-block lg:hidden text-zinc-400">
                      valor:
                    </span>
                    <span className="font-bold">
                      R$ {moneyFormat(suborder.total)}
                    </span>
                  </div>
                  <div className="w-full lg:w-[32rem]">
                    <span className="text-sm pr-2 w-[4rem] inline-block lg:hidden text-zinc-400">
                      status:
                    </span>

                    {suborder.order?.status == 1 ? (
                      <div className="bg-green-100 text-green-700 rounded text-sm inline-block px-2 py-1">
                        pago
                      </div>
                    ) : suborder.order?.metadata?.status == "expired" ? (
                      <div className="bg-red-100 text-red-700 rounded text-sm inline-block px-2 py-1">
                        cancelado
                      </div>
                    ) : suborder.order?.status == 0 ? (
                      <div className="bg-yellow-100 text-yellow-700 rounded text-sm inline-block px-2 py-1">
                        em aberto
                      </div>
                    ) : (
                      <div className="bg-zinc-100 text-zinc-700 rounded text-sm inline-block px-2 py-1">
                        processando
                      </div>
                    )}
                  </div>
                  <div className="w-full lg:w-[22rem] grid">
                    <Button
                      href={`/painel/pedidos/${suborder.id}`}
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
