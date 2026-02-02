import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { Button } from "@/src/components/ui/form";
import { getExtenseData, moneyFormat } from "@/src/helper";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import { OrderStatusBadge } from "@/src/components/order";
import { useEffect, useState } from "react";
import { getMyOrders } from "@/src/services/order";

export default function Pedidos() {
  const [orders, setOrders] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getMyOrders();
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error);
        setOrders([]);
      }
      setLoading(false);
    };
    fetchOrders();
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
            {loading ? (
              <div className="border-t p-8 text-center text-zinc-500">
                Carregando pedidos...
              </div>
            ) : orders.length === 0 ? (
              <div className="border-t p-8 text-center text-zinc-500">
                Nenhum pedido encontrado
              </div>
            ) : (
              orders.map((order, key) => (
                <div
                  key={key}
                  className="grid lg:flex border-t p-4 lg:p-8 gap-2 lg:gap-8 text-zinc-900 hover:bg-zinc-50 bg-opacity-5 ease items-center"
                >
                  <div className="w-full lg:w-[16rem]">
                    <span className="text-sm pr-2 w-[4rem] inline-block lg:hidden text-zinc-400">
                      pedido:
                    </span>
                    #{order.mainOrderId || order.id}
                    {order.ordersCount > 1 && (
                      <span className="text-xs text-zinc-500 ml-1">
                        (+{order.ordersCount - 1})
                      </span>
                    )}
                  </div>
                  <div className="w-full lg:w-[40rem] whitespace-nowrap text-sm lg:text-base">
                    <span className="text-sm pr-2 w-[4rem] inline-block lg:hidden text-zinc-400">
                      data:
                    </span>
                    {getExtenseData(order.createdAt || order.created_at)}
                  </div>
                  <div className="w-full lg:w-[48rem]">
                    <span className="text-sm pr-2 w-[4rem] inline-block lg:hidden text-zinc-400">
                      cliente:
                    </span>

                    <span className="font-bold">{order.customer?.name || order.user?.name}</span>
                    <div className="text-sm">{order.customer?.email || order.user?.email}</div>
                  </div>
                  <div className="w-full lg:w-[32rem]">
                    <span className="text-sm pr-2 w-[4rem] inline-block lg:hidden text-zinc-400">
                      valor:
                    </span>
                    <span className="font-bold">
                      R$ {moneyFormat(order.total)}
                    </span>
                  </div>
                  <div className="w-full lg:w-[32rem]">
                    <span className="text-sm pr-2 w-[4rem] inline-block lg:hidden text-zinc-400">
                      status:
                    </span>

                    <OrderStatusBadge
                      status={order.status}
                      metadataStatus={order.metadata?.status}
                      paymentStatus={order.metadata?.payment_status}
                      paidAt={order.metadata?.paid_at}
                      statusText={order.statusText}
                    />
                  </div>
                  <div className="w-full lg:w-[22rem] grid">
                    <Button
                      href={`/painel/pedidos/${order.mainOrderId || order.id}`}
                      style="btn-light"
                      className="text-zinc-900 py-2 px-3 mt-4 lg:mt-0 text-sm whitespace-nowrap"
                    >
                      Ver detalhes
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
          {orders && orders.length > 0 && (
            <div className="pt-4 text-sm text-zinc-500">
              Mostrando {orders.length} {orders.length === 1 ? "pedido" : "pedidos"}
            </div>
          )}
        </div>
      </section>
    </Template>
  );
}
