import Image from "next/image";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import Api from "@/src/services/api";
import { getExtenseData, moneyFormat } from "@/src/helper";
import { OrderType } from "@/src/models/order";
import HelpCard from "@/src/components/common/HelpCard";
import { Button } from "@/src/components/ui/form";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export async function getServerSideProps(ctx: any) {
  const api = new Api();
  let request: any = {};

  request = await api.bridge(
    {
      url: "orders/list",
    },
    ctx
  );

  let orders = request?.data ?? [];

  request = await api.call(
    {
      url: "request/graph",
      data: [
        {
          model: "page",
          filter: [
            {
              key: "slug",
              value: "client-orders",
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

  const page: any = request?.data?.query?.page[0] ?? {};
  const HeaderFooter = request?.data?.query?.HeaderFooter ?? [];

  return {
    props: {
      orders: orders,
      page: page,
      HeaderFooter: HeaderFooter[0] ?? {},
    },
  };
}

export default function Pedidos({
  orders,
  page,
  HeaderFooter,
}: {
  orders: Array<any>;
  page: any;
  HeaderFooter: any;
}) {
  return (
    <Template
      header={{
        template: "default",
        position: "solid",
        content: HeaderFooter,
      }}
    >
      <section className="">
        <div className="container-medium py-12">
          <div className="pb-4">
            <Breadcrumbs
              links={[
                { url: "/dashboard", name: "Dashboard" },
                { url: "/dashboard/pedidos", name: "Pedidos" },
              ]}
            />
          </div>
          <div className="flex items-center">
            <Link passHref href="/dashboard">
              <Icon
                icon="fa-long-arrow-left"
                className="mr-6 text-2xl text-zinc-900"
              />
            </Link>
            <div className="font-title font-bold text-3xl md:text-4xl flex gap-4 items-center text-zinc-900 w-full">
              Pedidos
            </div>
          </div>
        </div>
      </section>
      <section className="">
        <div className="container-medium pb-12">
          <div className="grid md:flex gap-10 md:gap-24 items-start">
            <div className="w-full grid gap-4 md:gap-8">
              {!!orders.length ? (
                orders.map((item: any, key: any) => (
                  <div
                    key={key}
                    className="flex flex-wrap items-center justify-between gap-6 border-b pb-4 md:pb-8"
                  >
                    <div className="order-1 md:order-1 w-[45%] md:w-full md:max-w-[14rem]">
                      <div className="font-title text-zinc-900 font-semibold">
                        pedido #{item.id}
                      </div>
                      {/* <div className="text-sm">{item.title}</div> */}
                      <div className="text-sm pt-1">
                        {getExtenseData(item.created_at)}
                      </div>
                    </div>
                    <div className="order-3 md:order-1 w-[45%] md:w-full md:max-w-[8rem]">
                      <div className="opacity-75 text-xs">total:</div>
                      <div className="text-zinc-900 font-semibold whitespace-nowrap">
                        R$ {moneyFormat(item.total)}
                      </div>
                    </div>
                    <div className="order-2 md:order-1 text-right md:text-center w-[45%] md:w-full md:max-w-[8rem]">
                      {item?.metadata?.payment_status == "paid" ? (
                        <div className="bg-green-400 text-white rounded text-sm inline-block px-2 py-1">
                          pago
                        </div>
                      ) : (
                        <div className="bg-zinc-100 text-zinc-500 rounded text-sm inline-block px-2 py-1">
                          em aberto
                        </div>
                      )}
                    </div>
                    <div className="order-4 md:order-1 text-right md:text-center w-[45%] md:w-fit">
                      <Link
                        href={`/dashboard/pedidos/${item.id}`}
                        className="text-zinc-900 text-sm underline whitespace-nowrap font-bold"
                      >
                        detalhes
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center bg-zinc-50 rounded-xl p-6 md:p-10 flex flex-col justify-center gap-6">
                  <div className="text-lg max-w-[28rem] mx-auto">
                    Não encontramos pedidos registrados na sua conta. Navegue
                    pelo catálogo e realize seu primeiro pedido.
                  </div>
                  <div className="mb-2">
                    <Button href="/produtos">
                      Montar minha festa{" "}
                      <Icon
                        icon="fa-arrow-right"
                        className="text-xs ml-2 -mr-2"
                        type="far"
                      />
                    </Button>
                  </div>
                </div>
              )}
            </div>
            <div className="w-full max-w-[24rem]">
              <HelpCard list={page.help_list} />
            </div>
          </div>
        </div>
      </section>
    </Template>
  );
}
