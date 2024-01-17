import Image from "next/image";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import Api from "@/src/services/api";
import { OrderType } from "@/src/models/order";
import {
  dateBRFormat,
  getExtenseData,
  moneyFormat,
  print_r,
} from "@/src/helper";
import { Button, Label, Select } from "@/src/components/ui/form";
import { useState } from "react";
import { useRouter } from "next/router";
import { ChangeDeliveryStatusMail } from "@/src/mail";
import { deliveryTypes } from "@/src/models/delivery";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export async function getServerSideProps(ctx: any) {
  const api = new Api();
  const query = ctx.query;

  let request: any = await api.bridge(
    {
      url: "suborders/get",
      data: {
        id: query.id,
      },
    },
    ctx
  );

  let suborder = request?.data ?? {};

  if (!request?.response || !suborder.id) {
    return {
      redirect: {
        permanent: false,
        destination: "/painel/pedidos",
      },
    };
  }

  request = await api.call(
    {
      url: "request/graph",
      data: [
        {
          model: "page as mailContent",
          filter: [
            {
              key: "slug",
              value: "email",
              compare: "=",
            },
          ],
        },
      ],
    },
    ctx
  );

  const mailContent = request?.data?.query?.mailContent ?? [];

  return {
    props: {
      suborder: suborder,
      order: suborder?.order ?? {},
      mailContent: mailContent[0] ?? {},
    },
  };
}

const FormInitialType = {
  sended: false,
  loading: false,
};

export default function Pedido({
  suborder,
  order,
  mailContent,
}: {
  suborder: OrderType;
  order: OrderType;
  mailContent: any;
}) {
  const api = new Api();
  const router = useRouter();

  const [form, setForm] = useState(FormInitialType);

  const [data, setData] = useState((suborder ?? {}) as OrderType);
  const handleData = (value: Object) => {
    setData((data) => ({ ...data, ...value }));
  };

  const [deliveryStatus, setDeliveryStatus] = useState(
    suborder.deliveryStatus as string
  );
  const notifyDelivery = async (e: any) => {
    e.preventDefault();

    setForm({ ...form, loading: true });

    const handle: any = {
      ...data,
      deliveryStatus: deliveryStatus,
    };

    const request: any = await api.bridge({
      url: "suborders/register",
      data: handle,
    });

    if (!!request.response) {
      setData(handle);
      await ChangeDeliveryStatusMail(handle, {
        subject: mailContent["delivery_subject"],
        html: mailContent["delivery_body"],
      });
    }

    setForm({ ...form, loading: false });

    alert("Notificação enviada ao cliente!");
  };

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
        <div className="container-medium pt-12 pb-4">
          <div className="pb-4">
            <Breadcrumbs
              links={[
                { url: "/painel", name: "Painel" },
                { url: "/painel/pedidos", name: "Pedidos" },
                { url: "#", name: `#${order.id}` },
              ]}
            />
          </div>
          <div className="grid md:flex items-center w-full">
            <Link passHref href="/painel/pedidos">
              <Icon
                icon="fa-long-arrow-left"
                className="mr-4 lg:mr-6 text-2xl text-zinc-900"
              />
            </Link>
            <div className="flex flex-wrap gap-2 lg:gap-4 items-center pb-2">
              <div className="font-title inline-block pt-2 font-bold text-3xl lg:text-4xl text-zinc-900">
                Pedido #{order.id}
              </div>
              <div className="inline-block md:pt-2">
                {order?.status == 1 ? (
                  <div className="bg-green-100 text-green-700 rounded text-sm inline-block px-2 py-1">
                    pago
                  </div>
                ) : order?.metadata?.status == "expired" ? (
                  <div className="bg-red-100 text-red-700 rounded text-sm inline-block px-2 py-1">
                    cancelado
                  </div>
                ) : order?.status == 0 ? (
                  <div className="bg-yellow-100 text-yellow-700 rounded text-sm inline-block px-2 py-1">
                    em aberto
                  </div>
                ) : (
                  <div className="bg-zinc-100 text-zinc-700 rounded text-sm inline-block px-2 py-1">
                    processando
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="">
        <div className="container-medium pb-12">
          <div className="grid md:flex align-top gap-10 lg:gap-20">
            <div className="w-full order-2 lg:order-1">
              <div className="grid md:gap-2 pb-6">
                <div className="text-2xl text-zinc-900">Detalhes do pedido</div>
                <div className="text-base">
                  Realizado em: {getExtenseData(order.created_at)}
                </div>
              </div>
              <div className="border rounded-xl p-4 lg:p-8">
                {!!order.listItems.length &&
                  order.listItems.map((item: any, key: any) => {
                    return (
                      <div key={key}>
                        <div className="flex">
                          <div className="w-full grid gap-4">
                            <h5 className="font-title text-zinc-900 font-bold text-lg">
                              {item.quantity} x {item.product.title}
                            </h5>
                            <div>{item.product.description}</div>
                            <div className="text-sm">
                              {!!item.product.sku && (
                                <div>SKU: {item.product.sku}</div>
                              )}
                            </div>
                          </div>
                          <div className="font-title text-zinc-900 font-bold text-lg whitespace-nowrap">
                            R$ {moneyFormat(item.total)}
                          </div>
                        </div>
                        {!!item.details.dateStart && (
                          <>
                            <div className="py-4">
                              <hr />
                            </div>
                            <div className="flex">
                              <div className="w-full">Pedido para</div>
                              <div className="whitespace-nowrap">
                                {dateBRFormat(item.details.dateStart)}
                                {!!item.details.dateEnd &&
                                  item.details.dateStart !=
                                    item.details.dateEnd &&
                                  ` - ${dateBRFormat(
                                    item.details.dateEnd
                                  )}`}{" "}
                                | {order.deliverySchedule}
                              </div>
                            </div>
                          </>
                        )}
                        <div className="py-4">
                          <hr />
                        </div>
                      </div>
                    );
                  })}
                <div className="flex text-zinc-900">
                  <div className="w-full text-2xl">Total</div>
                  <div className="w-fit pt-1 font-title font-bold text-2xl whitespace-nowrap">
                    R$ {moneyFormat(suborder.total)}
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full lg:max-w-[22rem] order-1 lg:order-2">
              <div className="border rounded-xl p-4 md:p-8">
                <div>
                  <div className="font-bold font-title text-zinc-900 text-xl mb-4">
                    Dados do cliente
                  </div>
                  <div>
                    <div>{suborder.user?.name}</div>
                    <div>{suborder.user?.email}</div>
                    {/* <div>{suborder.user?.phone}</div>
                    <div>{suborder.user?.cpf}</div> */}
                  </div>
                </div>
                <div className="my-6 border-dashed border-t"></div>
                <div>
                  <div className="font-bold font-title text-zinc-900 text-xl mb-4">
                    Endereço de envio
                  </div>
                  <div>
                    {order?.deliveryAddress?.street},{" "}
                    {order?.deliveryAddress?.number}
                  </div>
                  <div>{order?.deliveryAddress?.neighborhood}</div>
                  <div>CEP: {order?.deliveryAddress?.zipCode}</div>
                  <div>
                    {order?.deliveryAddress?.city} |{" "}
                    {order?.deliveryAddress?.state}
                  </div>
                </div>
                <form
                  onSubmit={(e: any) => notifyDelivery(e)}
                  className="mt-6 pt-6 border-t flex gap-2"
                >
                  <div className="form-group m-0 w-full">
                    <Label style="float">Status de processo</Label>
                    <Select
                      name="status_entrega"
                      onChange={(e: any) => setDeliveryStatus(e.target.value)}
                      value={data.deliveryStatus ?? "pending"}
                      options={deliveryTypes}
                    />
                  </div>
                  <div className="text-zinc-900 text-right">
                    <Button
                      loading={form.loading}
                      style="btn-light"
                      className="font-semibold p-4 text-sm h-full"
                    >
                      <Icon icon="fa-paper-plane" type="far" />
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* <pre className="whitespace-wrap">{print_r(suborder)}</pre> */}
    </Template>
  );
}
