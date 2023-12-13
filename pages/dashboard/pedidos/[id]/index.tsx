import Image from "next/image";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import Api from "@/src/services/api";
import { OrderType } from "@/src/models/order";
import Payment from "@/src/services/payment";
import { RateType } from "@/src/models/product";
import {
  dateBRFormat,
  findDates,
  getImage,
  getShorDate,
  moneyFormat,
} from "@/src/helper";
import Img from "@/src/components/utils/ImgBase";
import { Button, Label, TextArea } from "@/src/components/ui/form";
import { useEffect, useRef, useState } from "react";
import Modal from "@/src/components/utils/Modal";
import {
  CompleteOrderMail,
  PartnerNewOrderMail,
  RegisterOrderMail,
} from "@/src/mail";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import { deliveryTypes } from "@/src/models/delivery";

export async function getServerSideProps(ctx: any) {
  const api = new Api();
  const params = ctx.params;

  let request: any = await api.call(
    {
      url: "request/graph",
      data: [
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

  const HeaderFooter = request?.data?.query?.HeaderFooter ?? [];
  const DataSeo = request?.data?.query?.DataSeo ?? [];
  const mailContent = request?.data?.query?.mailContent ?? [];

  return {
    props: {
      orderId: params.id,
      HeaderFooter: HeaderFooter[0] ?? {},
      DataSeo: DataSeo[0] ?? {},
      mailContent: mailContent[0] ?? {},
    },
  };
}

const formInitial = {
  edit: "",
  loading: false,
};

export default function Pedido({
  orderId,
  mailContent,
  HeaderFooter,
  DataSeo,
}: {
  orderId: number;
  mailContent: any;
  HeaderFooter: any;
  DataSeo: any;
}) {
  const api = new Api();

  const [form, setForm] = useState(formInitial);
  const handleForm = (value: Object) => {
    setForm({ ...form, ...value });
  };

  const [order, setOrder] = useState({} as any);
  const [products, setProducts] = useState([] as Array<any>);

  const [rate, setRate] = useState({} as RateType);
  const handleRate = (value: any) => {
    setRate({ ...rate, ...value });
  };

  const [modalRating, setModalRating] = useState(false);
  const openMoralRating = (product: any) => {
    handleRate({ product: product });
    setModalRating(true);
  };

  const submitRate = async (e: any) => {
    e.preventDefault();

    handleForm({ loading: true });

    const handle = {
      ...rate,
      product: rate.product.id,
    };

    const request: any = await api.bridge({
      url: "comments/register",
      data: handle,
    });

    if (request.response) {
      setModalRating(false);
    }

    handleForm({ loading: false });
  };

  const [resume, setResume] = useState({} as any);

  console.log(order);

  const renderDelivery = () => {
    let checked = false;

    let render = [];

    render.push(
      <div className="relative flex pb-8">
        <div className="absolute top-0 left-0 border-l-2 border-dashed h-full ml-3"></div>
        <div className="w-fit relative">
          <div className="p-3 bg-yellow-300 rounded-full"></div>
        </div>
        <div className="w-full pl-3">
          <div className="font-bold text-zinc-900">
            Pedido realizado - {getShorDate(order.created_at)}
          </div>
          <div className="text-sm">Seu pedido já está em nosso sistema.</div>
        </div>
      </div>
    );

    const validDeliveryTypes = deliveryTypes.filter(
      (item: any) => !["canceled", "returned"].includes(item.value)
    );
    const checkedLevel = validDeliveryTypes
      .map((item: any) => item.value)
      .indexOf(order.deliveryStatus);

    validDeliveryTypes.map((item: any, key) => {
      render.push(
        <div
          key={key}
          className={`${checkedLevel < key && "opacity-40"} relative flex`}
        >
          <div className="w-fit relative bg-white">
            {validDeliveryTypes.length - 1 != key && (
              <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 border-l-2 border-dashed h-full"></div>
              </div>
            )}
            <div className={`bg-white relative rounded-full`}>
              <div
                className={`${
                  checkedLevel <= key
                    ? "bg-zinc-400 animate-pulse"
                    : "bg-yellow-300"
                } p-3 rounded-full`}
              ></div>
            </div>
          </div>
          <div className="w-full pl-3 pb-8">
            <div className="font-bold text-zinc-900">{item.name}</div>
            <div className="text-sm">{item.description}</div>
          </div>
        </div>
      );
    });

    return render;
  };

  const getOrder = async (attempts?: number) => {
    let request: any = await api.bridge({
      url: "orders/get",
      data: {
        id: orderId,
      },
    });

    if (!request?.response) {
      return {
        redirect: {
          permanent: false,
          destination: "/dashboard/pedidos",
        },
      };
    }

    const handle = request?.data ?? {};

    if (!!handle?.metadata?.id && handle?.metadata?.status != "complete") {
      const payment = new Payment();
      const checkoutSession: any = await payment.getSession(
        handle?.metadata?.id
      );

      await api.bridge({
        url: "orders/register-meta",
        data: {
          id: handle.id,
          metadata: checkoutSession?.data,
        },
      });

      if (checkoutSession?.data?.status == "complete") {
        await CompleteOrderMail(handle, {
          subject: mailContent["order_complete_subject"],
          html: mailContent["order_complete_body"],
        });

        await PartnerNewOrderMail(handle, handle?.notificate ?? [], {
          subject: mailContent["partner_order_subject"],
          html: mailContent["partner_order_body"],
        });
      }
      // else {
      //   await RegisterOrderMail(handle, handle.listItems, {
      //     subject: mailContent["order_subject"],
      //     html: mailContent["order_body"],
      //   });
      // }
    }

    let dates =
      handle.listItems?.map((item: any) => item.details.dateStart) ?? {};

    setResume({
      startDate: findDates(dates).minDate,
      endDate: findDates(dates).maxDate,
    } as any);

    setOrder(handle);
    setProducts(handle.products);
    console.log(handle.products, "<<");
  };

  const initialized = useRef(false);
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      getOrder();
    }
  }, []);

  return (
    <Template
      header={{
        template: "default",
        position: "solid",
        content: HeaderFooter,
      }}
      footer={{
        template: "clean",
      }}
    >
      {!!order?.id ? (
        <>
          <section className="">
            <div className="container-medium pt-12">
              <div className="pb-4">
                <Breadcrumbs
                  links={[
                    { url: "/dashboard", name: "Dashboard" },
                    { url: "/dashboard/pedidos", name: "Pedidos" },
                  ]}
                />
              </div>
            </div>
          </section>
          <section className="">
            <div className="container-medium pb-12">
              <div className="grid md:flex align-top gap-10 md:gap-20">
                <div className="w-full">
                  <div className="flex items-center mb-10">
                    <Link passHref href="/dashboard/pedidos">
                      <Icon
                        icon="fa-long-arrow-left"
                        className="mr-6 text-2xl text-zinc-900"
                      />
                    </Link>
                    <div className="text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900 w-full">
                      <span className="font-title font-bold">
                        Pedido #{order.id}
                      </span>
                      {order?.metadata?.payment_status == "paid" ? (
                        <div className="bg-green-400 text-white rounded text-sm inline-block px-2 py-1">
                          pago
                        </div>
                      ) : (
                        <div className="bg-zinc-100 text-zinc-700 rounded text-sm inline-block px-2 py-1">
                          em aberto
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid">{renderDelivery()}</div>
                  <div className="py-10">
                    <hr />
                  </div>
                  <div className="grid">
                    <h4 className="text-xl md:text-2xl text-zinc-800 pb-6">
                      Itens do pedido
                    </h4>
                    {!!products &&
                      products.map((product: any, key: any) => (
                        <div key={key}>
                          <div className="flex items-center gap-6">
                            <div className="w-fit">
                              <div className="aspect-square bg-zinc-200 w-[6rem] rounded-xl">
                                {!!product?.gallery?.length && (
                                  <Img
                                    src={getImage(product?.gallery[0], "thumb")}
                                    className="w-full h-full object-contain"
                                  />
                                )}
                              </div>
                            </div>
                            <div className="grid gap-1 w-full">
                              <div className="font-title text-lg font-bold text-zinc-900">
                                {product.title}
                              </div>
                              <div className="text-sm">
                                {!!product.sku && (
                                  <>
                                    sku #{product.sku} <br />
                                  </>
                                )}
                                Fornecido por:
                                <Link
                                  href={`/${product?.store.slug}`}
                                  className="text-zinc-900 pl-2 font-semibold underline"
                                >
                                  {product?.store.title}
                                </Link>
                              </div>

                              <div className="mt-2">
                                <Button
                                  type="button"
                                  onClick={() => openMoralRating(product)}
                                  style="btn-transparent"
                                  className="whitespace-nowrap text-sm font-semibold text-zinc-900 p-0 ease hover:text-yellow-500"
                                >
                                  <Icon icon="fa-comment" />
                                  avaliar produto
                                </Button>
                              </div>
                            </div>
                          </div>
                          <div className="py-6">
                            <hr />
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
                <div className="w-full md:max-w-[28rem]">
                  <div className="rounded-2xl bg-zinc-100 p-8">
                    {order?.metadata?.status == "open" && (
                      <div>
                        <Button
                          style="btn-success"
                          className="w-full"
                          href={order?.metadata?.url}
                        >
                          Efetuar pagamento
                        </Button>
                        <div className="border-t -mx-8 my-8"></div>
                      </div>
                    )}
                    <div className="font-bold text-zinc-900 text-xl mb-6">
                      Resumo do pedido
                    </div>
                    <div className="grid gap-6">
                      <div className="grid gap-2">
                        <div className="font-title text-zinc-900">
                          Pedido nº <b>{order.id}</b>
                        </div>
                        <div className="text-sm">
                          Realizado em {getShorDate(order.created_at)}
                        </div>
                        <div className="text-sm">
                          Agendado para: {dateBRFormat(resume.startDate)}{" "}
                          {resume.endDate != resume.startDate
                            ? `- ${dateBRFormat(resume.endDate)}`
                            : ""}{" "}
                          |{order.deliverySchedule}
                        </div>
                      </div>

                      <div>
                        <hr className="my-0" />
                      </div>

                      <div className="grid gap-2">
                        <div className="text-zinc-900 font-bold">
                          Endereço de entrega
                        </div>
                        <div className="text-sm">
                          <div>
                            {order?.deliveryAddress?.street},{" "}
                            {order?.deliveryAddress?.number}
                          </div>
                          <div>{order?.deliveryAddress?.neighborhood}</div>
                          <div>CEP: {order?.deliveryAddress?.zipCode}</div>
                          <div>
                            {order?.deliveryAddress?.city} |{" "}
                            {order?.deliveryAddress?.state} -{" "}
                            {order?.deliveryAddress?.country}
                          </div>
                        </div>
                      </div>

                      <div>
                        <hr className="my-0" />
                      </div>

                      <div className="grid gap-2">
                        <div className="text-zinc-900 font-bold">
                          Forma de pagamento
                        </div>
                        <div className="text-sm">
                          Pagamento com cartão de crédito
                          <br />
                          MasterCard****2367
                          <br />
                          Validade: 09/2024
                        </div>
                      </div>

                      <div>
                        <hr className="my-0" />
                      </div>

                      <div className="grid gap-2">
                        <div className="text-zinc-900 font-bold mb-2">
                          Total da compra
                        </div>
                        <div className="grid gap-2 text-sm">
                          <div className="flex gap-2">
                            <div className="w-full">Subtotal de produtos</div>
                            <div className="whitespace-nowrap">
                              R$ {moneyFormat(order.total)}
                            </div>
                          </div>
                          {/* <div className="flex gap-2">
                          <div className="w-full">
                            Frete - Entregador parceiro
                          </div>
                          <div className="whitespace-nowrap">R$ {moneyFormat(order.total)}</div>
                        </div> */}
                        </div>
                      </div>

                      <div>
                        <hr className="my-0" />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-full font-title text-zinc-900 font-bold">
                          Valor total
                        </div>
                        <div className="text-2xl text-zinc-900 font-bold whitespace-nowrap">
                          R$ {moneyFormat(order.total)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Modal
            title="Avaliação de produto"
            status={modalRating}
            close={() => setModalRating(false)}
          >
            <form onSubmit={(e: any) => submitRate(e)} className="grid gap-4">
              {order?.metadata?.status != "open" ? (
                <>
                  <div className="">
                    <div className="flex items-center gap-6">
                      <div className="w-fit">
                        <div className="aspect-square bg-zinc-200 w-[4rem] rounded-full relative overflow-hidden">
                          {!!getImage(rate.product?.gallery) && (
                            <Img
                              src={getImage(rate.product?.gallery, "thumb")}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                      </div>
                      <div className="grid w-full">
                        <div className="font-title font-semibold text-zinc-900">
                          {rate.product?.title}
                        </div>
                        <div className="text-sm">sku #{rate.product?.sku}</div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="relative">
                      <Label className="pt-1">
                        O que você achou do produto?
                      </Label>
                      <div className="opacity-0 h-0 absolute mt-3 left-1/2 top-0 -translate-x-1/2">
                        {!rate.rate && (
                          <input
                            type="checkbox"
                            required
                            className="inline-block"
                          />
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((value: number) => (
                        <label
                          key={value}
                          className="cursor-pointer"
                          onClick={() => handleRate({ rate: value })}
                        >
                          <Icon
                            icon="fa-star"
                            type={rate.rate >= value ? "fa" : "fal"}
                            className={`${
                              rate.rate >= value
                                ? "text-yellow-400"
                                : "text-gray-400"
                            }  ease text-lg hover:text-yellow-600`}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="">
                    <Label>Deixe seu comentário</Label>
                    <TextArea
                      rows="5"
                      onChange={(e: any) =>
                        handleRate({ comment: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid">
                    <Button loading={!!form.loading}>Enviar</Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-7">
                  <div className="mx-auto max-w-[24rem] mb-6">
                    É necessário que efetue o pagamento do seu pedido para fazer
                    sua avaliação ao produto.
                  </div>
                  <div>
                    <Button href={order?.metadata?.url}>
                      Efetuar pagamento
                    </Button>
                  </div>
                </div>
              )}
            </form>
          </Modal>
        </>
      ) : (
        <div className="cursor-wait container-medium animate-pulse">
          <div className="flex pt-10 md:pt-16 gap-10">
            <div className="w-full grid gap-4">
              <div className="py-10 w-full rounded-lg bg-zinc-100"></div>
              <div className="py-10 w-full rounded-lg bg-zinc-100"></div>
              <div className="py-10 w-full rounded-lg bg-zinc-100"></div>
              <div className="py-10 w-full rounded-lg bg-zinc-100"></div>
              <div className="py-10 w-full rounded-lg bg-zinc-100"></div>
            </div>
            <div className="py-48 w-full max-w-[24rem] rounded-lg bg-zinc-100"></div>
          </div>
        </div>
      )}
    </Template>
  );
}
