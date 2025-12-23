import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import Api from "@/src/services/api";
import { getExtenseData, moneyFormat } from "@/src/helper";
import { OrderType } from "@/src/models/order";
import HelpCard from "@/src/components/common/HelpCard";
import { Button } from "@/src/components/ui/form";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import { GetServerSideProps } from "next";


interface PedidosProps {
  orders: OrderType[];
  page: any;
}

export default function Pedidos({ orders = [], page = { help_list: [] } }: PedidosProps) {

  console.log('Orders Page', orders);
  return (
    <Template
      header={{
        template: "default",
        position: "solid",
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
                orders.map((item: OrderType, key: number) => {
                  console.log('Order Item', item);
                  return (
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
                        {getExtenseData(item.createdAt)}
                      </div>
                    </div>
                    <div className="order-3 md:order-1 w-[45%] md:w-full md:max-w-[8rem]">
                      <div className="opacity-75 text-xs">total:</div>
                      <div className="text-zinc-900 font-semibold whitespace-nowrap">
                        R$ {moneyFormat(item.total)}
                      </div>
                    </div>
                    <div className="order-2 md:order-1 text-right md:text-center w-[45%] md:w-full md:max-w-[8rem]">
                      {item?.status === 1 ? (
                        <div className="bg-green-100 text-green-700 rounded text-sm inline-block px-2 py-1">
                          pago
                        </div>
                      ) : item?.metadata?.status === "expired" ? (
                        <div className="bg-red-100 text-red-700 rounded text-sm inline-block px-2 py-1">
                          cancelado
                        </div>
                      ) : item?.status === 0 ? (
                        <div className="bg-yellow-100 text-yellow-700 rounded text-sm inline-block px-2 py-1">
                          em aberto
                        </div>
                      ) : (
                        <div className="bg-zinc-100 text-zinc-700 rounded text-sm inline-block px-2 py-1">
                          processando
                        </div>
                      )}
                    </div>
                    <div className="order-4 md:order-1 text-right md:text-center w-[45%] md:w-fit">
                      <Link
                        href={`/dashboard/pedidos/${item.orderIds[0]}`}
                        className="text-zinc-900 text-sm underline whitespace-nowrap font-bold"
                      >
                        detalhes
                      </Link>
                    </div>
                  </div>
                )})
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

export const getServerSideProps: GetServerSideProps<PedidosProps> = async (ctx) => {
  const api = new Api();
  
  try {
    const request = await api.bridge(
      {
        method: 'get',
        url: "orders/list",
      },
      ctx
    ) as { data?: OrderType[]; page?: any };

    console.log('Orders Request', request);

    return {
      props: {
        orders: request?.data || [],
        page: request?.page || { help_list: [] },
      },
    };
  } catch (error) {
    return {
      props: {
        orders: [],
        page: { help_list: [] },
      },
    };
  }
};
