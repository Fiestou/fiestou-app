import Image from "next/image";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import Api from "@/src/services/api";
import { OrderType, OrderTypeResponse } from "@/src/models/order";
import {
  dateBRFormat,
  getExtenseData,
  moneyFormat,
  print_r,
} from "@/src/helper";
import { Button, Label, Select } from "@/src/components/ui/form";
import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import { deliveryToName, deliveryTypes } from "@/src/models/delivery";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

interface OrderItem {
  quantity: number;
  product: {
    title: string;
    description?: string;
    sku?: string;
  };
  total: number;
  details?: {
    dateStart?: string;
    dateEnd?: string;
  };
}

export async function getServerSideProps(ctx: any) {
  const api = new Api();
  const query = ctx.query;

  let request: any = await api.bridge(
    {
      method: "post",
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

  return {
    props: {
      suborder: suborder,
      order: suborder?.order ?? {},
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
}: {
  suborder: OrderType;
  order: OrderTypeResponse;
}) {
  const api = new Api();
  const router = useRouter();

  const orderByStore = useCallback(() => {
    let orderByStore = new Map<number, any>();

    order.products?.forEach((productItem: any) => {
      const listItem = order.listItems?.find((item: any) => item.product.id === productItem.id);
      const productItemWithAttributes = order.products?.find((item: any) => item.id === productItem.id);
      const additionalExtras: any[] = [];
      
      if (listItem?.attributes) {
        listItem.attributes.forEach((attribute: any) => {
          const attributeTitle = JSON.parse(productItemWithAttributes?.attributes ?? "[]");
          
          attribute.variations.forEach((variation: any) => {
            additionalExtras.push({
              title: attributeTitle.find((item: any) => item.id === attribute.id)?.title,
              quantity: variation.quantity,
              price: parseFloat(variation.price.replace(',', '.'))
            });
          });
        });
      }

      if (orderByStore.has(productItem.store.id)) {
        return orderByStore.get(productItem.store.id).push({...productItem, additionalExtra: additionalExtras});
      }

      return orderByStore.set(productItem.store.id, [{
        ...productItem,
        additionalExtra: additionalExtras,
      }]);
    });

    return orderByStore;
  }, [order]);

  const [form, setForm] = useState(FormInitialType);
  const [dropdownDelivery, setDropdownDelivery] = useState(false as boolean);

  const [data, setData] = useState((suborder ?? {}) as OrderType);
  const handleData = (value: Object) => {
    setData((data) => ({ ...data, ...value }));
  };

  const [deliveryStatus, setDeliveryStatus] = useState(
    suborder.deliveryStatus as string
  );
  const notifyDelivery = async (e: any) => {
    e.preventDefault();

    setDropdownDelivery(false);

    setForm({ ...form, loading: true });

    const handle: any = {
      ...data,
      deliveryStatus: deliveryStatus,
    };

    const request: any = await api.bridge({
      method: "post",
      url: "suborders/register",
      data: handle,
    });

    if (!!request.response) {
      setData(handle);
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
                {order && order.products && Array.isArray(order.products) ? (
                  Array.from(orderByStore().entries()).map(([storeId, items]: [number, any[]]) => {

                    const subtotal = items.reduce((sum: number, item: any) => sum + Number(item.price) + item.additionalExtra.reduce((sum: number, extra: any) => sum + Number(extra.price), 0), 0);
                    const frete: string | number = order.freights_orders_price.find((freight) => freight.store_id == storeId)?.price || 0;

                    return (
                      <div key={storeId} className="mb-8">
                        <div className="font-title text-zinc-900 font-bold text-xl mb-2">
                          {items[0]?.store?.companyName}
                        </div>
                        {items.map((item) => (
                          <div key={item.id} className="border-b py-2">
                            <div className="flex justify-between items-center">
                              <div className="w-full grid gap-4">
                                <h5 className="font-title text-zinc-900 font-medium text-lg">
                                  {/* @TODO: Não é possível exibir a quantidade de itens, pois a API não retorna a quantidade */}
                                  1 x {item.title}
                                </h5>
                              </div>
                              <div className="font-title text-zinc-900 font-medium text-lg whitespace-nowrap">
                                R$ {moneyFormat(item.price)}
                              </div>
                            </div>
                            {item.additionalExtra && Array.isArray(item.additionalExtra) && item.additionalExtra.map((extra: any) => (
                              <div key={extra.id} className="flex justify-between items-center mt-2 px-6">
                                <div key={extra.id} className="w-full grid gap-4 mt-2">
                                  <h5 className="font-title text-zinc-500 font-medium text-sm">
                                    {/* @TODO: Não é possível exibir a quantidade de itens, pois a API não retorna a quantidade */}
                                    {extra.quantity} x {extra.title}
                                  </h5>
                                </div>
                                <div className="font-title text-zinc-500 font-medium text-sm whitespace-nowrap">
                                  R$ {moneyFormat(extra.price)}
                                </div>
                              </div>
                            ))}
                          </div>
                        ))}
                        <div className="flex justify-between items-center mt-2">
                          <span>Frete</span>
                          <span>R$ {moneyFormat(frete)}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2 font-semibold">
                          <span>Subtotal</span>
                          <span>R$ {moneyFormat(subtotal + Number(frete))}</span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-zinc-500">
                    Nenhum item encontrado neste pedido
                  </p>
                )}
                <div className="flex text-zinc-900">
                  <div className="w-full text-2xl">Total</div>
                  <div className="w-fit pt-1 font-title font-bold text-2xl whitespace-nowrap">
                    R$ {moneyFormat(order.total)}
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
                    <div>{suborder.user?.phone}</div>
                    <div>{suborder.user?.cpf}</div>
                  </div>
                </div>
                {!!order.metadata && (
                  <>
                    <div className="my-6 border-dashed border-t"></div>
                    <div>
                      <div className="font-bold font-title text-zinc-900 text-xl mb-4">
                        Pagamento
                      </div>
                      <div>
                        <div>
                          {!!order.metadata?.payment_method &&
                          order.metadata?.payment_method == "pix"
                            ? "PIX"
                            : "Cartão de crédito"}
                        </div>
                        {!!order.metadata?.installments && (
                          <div>{order.metadata?.installments}x</div>
                        )}
                      </div>
                    </div>
                  </>
                )}
                <div className="my-6 border-dashed border-t"></div>
                <div>
                  <div className="font-bold font-title text-zinc-900 text-xl mb-4">
                    Entrega (
                    {!!order?.deliveryPrice
                      ? `R$ ${moneyFormat(order.deliveryPrice)}`
                      : "Gratuita"}
                    )
                  </div>
                  <div>
                    {deliveryToName[order.deliveryTo]}, {order.deliverySchedule}
                  </div>
                  <div>
                    {order?.deliveryAddress?.street},{" "}
                    {order?.deliveryAddress?.number},{" "}
                    {order?.deliveryAddress?.neighborhood}
                  </div>
                  <div>
                    CEP: {order?.deliveryAddress?.zipCode}
                    <br />
                    {order?.deliveryAddress?.complement}
                  </div>
                  <div>
                    {order?.deliveryAddress?.city} |{" "}
                    {order?.deliveryAddress?.state}
                  </div>
                </div>
                <form
                  onSubmit={(e: any) => notifyDelivery(e)}
                  className="mt-6 pt-6 border-t flex gap-2"
                >
                  {dropdownDelivery && (
                    <div
                      onClick={(e: any) => {
                        setDropdownDelivery(false);
                      }}
                      className="fixed w-full h-full top-0 left-0 opacity-0"
                    ></div>
                  )}
                  <div className="form-group m-0 w-full">
                    <Label style="float">Status de processo</Label>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownDelivery(true);
                        }}
                        className="w-full"
                      >
                        {deliveryTypes
                          .filter((item: any) => item.value == deliveryStatus)
                          .map((item: any, key: any) => (
                            <div
                              key={key}
                              className="p-4 border rounded focus:border-zinc-800 hover:border-zinc-400 ease text-sm cursor-pointer text-zinc-500 hover:text-zinc-900 ease flex gap-1 items-center"
                            >
                              <div
                                className={`p-1 rounded-full ${item.background}`}
                              ></div>
                              <div className="flex gap-1">
                                <span>{item.icon}</span>
                                <span>{item.name}</span>
                              </div>
                            </div>
                          ))}
                      </button>
                      {dropdownDelivery && (
                        <div className="w-full relative">
                          <div className="bg-white -mt-[1px] rounded border top-0 left-0 w-full grid p-2">
                            {deliveryTypes.map((item: any, key: any) => (
                              <div
                                key={key}
                                className="p-1 text-sm cursor-pointer text-zinc-500 hover:text-zinc-900 ease flex gap-1 items-center"
                                onClick={(e: any) => {
                                  setDeliveryStatus(item.value);
                                  setDropdownDelivery(false);
                                }}
                              >
                                <div
                                  className={`p-1 rounded-full ${item.background}`}
                                ></div>
                                <div className="flex gap-1">
                                  <span>{item.icon}</span>
                                  <span>{item.name}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <Select
                      name="status_entrega"
                      onChange={(e: any) => setDeliveryStatus(e.target.value)}
                      value={data.deliveryStatus ?? "pending"}
                      options={deliveryTypes}
                    />
                  </div>
                  <div className="text-zinc-900 text-right">
                    {!dropdownDelivery && (
                      <Button
                        loading={form.loading}
                        style="btn-light"
                        className="font-semibold p-4 text-sm h-full"
                      >
                        <Icon icon="fa-paper-plane" type="far" />
                      </Button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Template>
  );
}
