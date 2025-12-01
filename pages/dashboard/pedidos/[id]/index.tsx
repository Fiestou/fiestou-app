import Image from "next/image";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import Api from "@/src/services/api";
import { fetchOrderById } from "@/src/services/order";
import { OrderType } from "@/src/models/order";
import Payment from "@/src/services/payment";
import { RateType } from "@/src/models/product";
import {
  dateBRFormat,
  findDates,
  getExtenseData,
  getImage,
  getShorDate,
  moneyFormat,
} from "@/src/helper";
import Img from "@/src/components/utils/ImgBase";
import { Button, Label, TextArea } from "@/src/components/ui/form";
import { useEffect, useRef, useState } from "react";
import Modal from "@/src/components/utils/Modal";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import { deliveryTypes } from "@/src/models/delivery";
import Pagarme from "@/src/services/pagarme";
const formInitial = {
  edit: "",
  loading: false,
};

export default function Pedido({
  orderId,
  HeaderFooter,
  DataSeo,
  Scripts,
}: {
  orderId: number;
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
}) {
  const api = new Api();

  const [form, setForm] = useState(formInitial);
  const handleForm = (value: Object) => {
    setForm({ ...form, ...value });
  };

  const [cancel, setCancel] = useState(false as boolean);
  const [order, setOrder] = useState({} as OrderType);
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
      method: 'post',
      url: "comments/register",
      data: handle,
    });

    if (request.response) {
      setModalRating(false);
    }

    handleForm({ loading: false });
  };

  const submitCancel = async () => {
    const pagarme = new Pagarme();

    const request = await pagarme.cancelOrder(order);
  };

  const [resume, setResume] = useState({} as any);

  const renderDelivery = () => {
    if (!order?.id) return null;

    const valid = deliveryTypes.filter(
      (item) => !["canceled", "returned"].includes(item.value)
    );

    const active = valid.findIndex(
      (step) => step.value === order.delivery_status
    );

    const TodayStep = (
      <div className="relative flex pb-8">
        <div className="absolute top-0 left-0 border-l-2 border-dashed h-full ml-3"></div>
        <div className="w-fit">
          <div className="p-3 bg-green-500 rounded-full relative">
            <Icon
              icon="fa-check"
              className="absolute text-white text-xs top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </div>
        </div>
        <div className="w-full pl-3">
          <div className="font-bold text-zinc-900">
            Pedido realizado - {getShorDate(order.createdAt)}
          </div>
          <div className="text-sm">Seu pedido foi registrado.</div>
        </div>
      </div>
    );

    return (
      <>
        {TodayStep}

        {valid.map((step, index) => {
          const isCompleted = index < active;
          const isCurrent = index === active;

          const circleColor = isCompleted
            ? "bg-green-500"
            : isCurrent
              ? "bg-yellow-400"
              : "bg-zinc-400";

          return (
            <div key={step.value} className="relative flex pb-8">
              {index !== valid.length - 1 && (
                <div className="absolute top-0 left-0 border-l-2 border-dashed h-full ml-3"></div>
              )}

              <div className="w-fit">
                <div className="p-3 rounded-full relative">
                  <div className={`${circleColor} p-3 rounded-full relative`}>
                    {isCompleted && (
                      <Icon
                        icon="fa-check"
                        className="absolute text-white text-xs top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      />
                    )}
                  </div>
                </div>
              </div>

              <div
                className={`w-full pl-3 ${index > active ? "opacity-40" : ""
                  }`}
              >
                <div className="font-bold text-zinc-900">{step.name}</div>
                <div className="text-sm">{step.description}</div>
              </div>
            </div>
          );
        })}
      </>
    );
  };
  
  const getOrder = async () => {
    const fetchedOrder: OrderType | null =
      (await fetchOrderById(api, orderId)) ?? ({} as OrderType);

    if (!fetchedOrder?.id) {
      return {
        redirect: {
          permanent: false,
        },
      };
    }

    // ------------------------------
    // 1. Produtos (fonte do item)
    // ------------------------------
    const products = fetchedOrder.items?.map((item) => item.productId) ?? [];

    setProducts(products);

    // ------------------------------
    // 2. Datas do agendamento
    // ------------------------------
    const dates: string[] = [];

    fetchedOrder.items?.forEach((item) => {
      const rawDetails = item.metadata?.raw_item?.details;

      if (rawDetails?.dateStart) dates.push(rawDetails.dateStart);
      if (rawDetails?.dateEnd) dates.push(rawDetails.dateEnd);
    });

    // fallback para pedidos novos
    if (dates.length === 0 && fetchedOrder.metadata?.scheduleStart) {
      dates.push(fetchedOrder.metadata.scheduleStart);
      dates.push(
        fetchedOrder.metadata.scheduleEnd ?? fetchedOrder.metadata.scheduleStart
      );
    }

    setResume({
      startDate: findDates(dates).minDate,
      endDate: findDates(dates).maxDate,
    });

    // ------------------------------
    // 3. Salva o pedido completo
    // ------------------------------
    setOrder(fetchedOrder);
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
      scripts={Scripts}
      metaPage={{
        title: `Pedido | ${DataSeo?.site_text}`,
      }}
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
                      {order.status == -1 ? (
                        <div className="bg-zinc-100 text-zinc-700 rounded text-sm inline-block px-2 py-1">
                          processando
                        </div>
                      ) : order.status == 1 ? (
                        <div className="bg-green-100 text-green-700 rounded text-sm inline-block px-2 py-1">
                          pago
                        </div>
                      ) : order.status == -2 ||
                        order?.metadata?.status == "expired" ? (
                        <div className="bg-red-100 text-red-700 rounded text-sm inline-block px-2 py-1">
                          cancelado
                        </div>
                      ) : (
                        <div className="bg-yellow-100 text-yellow-700 rounded text-sm inline-block px-2 py-1">
                          em aberto
                        </div>
                      )}
                    </div>
                  </div>

                  {order?.metadata?.status != "expired" && (
                    <div>
                      <div className="grid">{renderDelivery()}</div>
                      <div className="py-10">
                        <hr />
                      </div>
                    </div>
                  )}
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
                                <Link href={`/produtos/${product?.id}`}>
                                  {product.title}
                                </Link>
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
                  <div className="rounded-2xl bg-zinc-100 p-4 md:p-8">
                    {order.status == 0 && (
                      <div>
                        <Button
                          style="btn-success"
                          className="w-full"
                          href={`/dashboard/pedidos/pagamento/${order.id}`}
                        >
                          Efetuar pagamento
                        </Button>
                        <div className="border-t -mx-8 my-8"></div>
                      </div>
                    )}

                    {order.status == -1 && (
                      <div>
                        <div className="bg-zinc-50 text-center p-2 text-zinc-800 rounded">
                          Aguardando confirmação de pagamento...
                        </div>

                        {!!order.metadata?.transaction_type &&
                          order.metadata?.transaction_type == "boleto" && (
                            <div className="grid pt-4 -mb-2">
                              <a
                                rel="noreferrer"
                                href={order.metadata?.pdf}
                                target="_blank"
                                className="font-semibold text-center rounded-md hover:underline text-cyan-600 hover:text-cyan-800 ease"
                              >
                                Visualizar boleto
                              </a>
                            </div>
                          )}
                        <div className="border-t -mx-8 my-8"></div>
                      </div>
                    )}

                    <div className="font-title font-bold text-zinc-900 text-xl mb-6">
                      Resumo
                    </div>
                    <div className="grid gap-6">
                      <div className="grid text-sm">
                        <div className="text-zinc-900">
                          Pedido nº <b>{order.id}</b>
                        </div>
                        <div className="">
                          Realizado em {getShorDate(order.createdAt)}
                        </div>
                        <div className="">
                          Agendado para: {dateBRFormat(resume.startDate)}{" "}
                          {resume.endDate != resume.startDate
                            ? `- ${dateBRFormat(resume.endDate)}`
                            : ""}{" "}
                          |{order.delivery_schedule}
                      </div>
                      <div className="">
                        Valor de entrega:{" "}
                        {!!order?.delivery_price
                            ? `R$ ${moneyFormat(order.delivery_price)}`
                            : "Gratuita"}
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
                            {order?.delivery_address?.street},{" "}
                            {order?.delivery_address?.number}
                          </div>
                          <div>{order?.delivery_address?.neighborhood}</div>
                          <div>CEP: {order?.delivery_address?.zipCode}</div>
                          <div>
                            {order?.delivery_address?.city} |{" "}
                            {order?.delivery_address?.state} -{" "}
                            {order?.delivery_address?.country}
                          </div>
                          <div>
                            complemento: {order?.delivery_address?.complement}
                          </div>
                        </div>
                      </div>

                      {!!order.metadata && (
                        <>
                          <div>
                            <hr className="my-0" />
                          </div>

                          <div className="grid gap-2">
                            <div className="text-zinc-900 font-bold">
                              Pagamento
                              {/* {getExtenseData(order.metadata.paid_at)} */}
                            </div>
                            <div className="text-sm flex items-center gap-2">
                              {!!order.metadata?.payment_method &&
                                order.metadata?.payment_method == "pix" ? (
                                <>
                                  <Img
                                    src="/images/pagarme/pix-icon.png"
                                    className="w-[1.75rem]"
                                  />
                                  <div className="w-full">PIX</div>
                                </>
                              ) : !!order.metadata?.transaction_type &&
                                order.metadata?.transaction_type == "boleto" ? (
                                <>
                                  <Img
                                    src="/images/pagarme/document-icon.png"
                                    className="w-[1.75rem]"
                                  />
                                  <div className="w-full">Boleto bancário</div>
                                </>
                              ) : (
                                <>
                                  <Img
                                    src="/images/pagarme/card-icon.png"
                                    className="w-[1.75rem]"
                                  />
                                  <div className="w-full">
                                    Cartão de crédito :{" "}
                                    {order.metadata?.installments ?? "1"}x
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      )}

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
                              R$ {moneyFormat(order.subtotal)}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="w-full">Frete</div>
                            <div className="whitespace-nowrap">
                              {!!order.delivery_price
                                ? `R$ ${moneyFormat(order.delivery_price)}`
                                : "Grátis"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <hr className="my-0" />
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="w-full font-title text-zinc-900 font-bold">
                          TOTAL
                        </div>
                        <div className="text-2xl text-zinc-900 font-bold whitespace-nowrap">
                          R$ {moneyFormat(order.total)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {order.status != -2 && false && (
                    <button
                      type="button"
                      onClick={() => setCancel(true)}
                      className="text-center mx-auto block mt-4 hover:underline text-zinc-950 ease"
                    >
                      cancelar pedido
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>

          <Modal
            title="Cancelar pedido"
            status={cancel}
            close={() => setCancel(false)}
          >
            <div className="grid gap-6">
              <div className="text-center">
                Ao cancelar seu pedido, uma taxa de serviço poderá ser cobrada e
                seus itens voltarão para o estoque. Deseja mesmo continuar?
              </div>
              <div className="grid gap-2 justify-center">
                <Button
                  type="button"
                  style="btn-danger"
                  className="text-sm"
                  onClick={() => submitCancel()}
                >
                  Continuar e cancelar pedido
                </Button>
                <button
                  type="button"
                  onClick={() => setCancel(false)}
                  className="text-center text-sm mx-auto block mt-4 hover:underline text-zinc-950 ease"
                >
                  Voltar
                </button>
              </div>
            </div>
          </Modal>

          <Modal
            title="Avaliação de produto"
            status={modalRating}
            close={() => setModalRating(false)}
          >
            <form
              onSubmit={(e: any) => submitRate(e)}
              className="flex flex-col gap-4"
            >
              {!!order?.status ? (
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
                  <div className="md:flex items-center gap-4">
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
                            className={`${rate.rate >= value
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
