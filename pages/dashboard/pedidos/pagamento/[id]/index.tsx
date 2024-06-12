import Template from "@/src/template";
import Api from "@/src/services/api";
import { useEffect, useState } from "react";
import {
  CopyClipboard,
  dateBRFormat,
  findDates,
  getImage,
  getShorDate,
  justNumber,
  moneyFormat,
} from "@/src/helper";
import { Button } from "@/src/components/ui/form";
import { OrderType } from "@/src/models/order";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Link from "next/link";
import Img from "@/src/components/utils/ImgBase";

import Pagarme from "@/src/services/pagarme";
import { deliveryToName } from "@/src/models/delivery";

export interface CardType {
  number: number;
  holder_name: string;
  exp_month: number;
  exp_year: number;
  cvv: number;
  holder_document: string;
  billing_address: {
    line_1: string;
    line_2: string;
    zip_code: string;
    city: string;
    state: string;
    country: string;
  };
}

export interface PaymentType {
  payment_method: "credit_card" | "pix";
  credit_card: {
    card: CardType;
    operation_type: string;
    installments: number;
    statement_descriptor: string;
  };
  pix: PixType;
}

export interface PixType {
  status: boolean;
  expires_in: number;
  code?: string;
  qrcode?: string;
  time: string;
}

interface FormInitialType {
  sended: boolean;
  loading: boolean;
  feedback: string;
}

export async function getServerSideProps(ctx: any) {
  const api = new Api();
  const params = ctx.params;

  let request: any = await api.content({
    url: "order",
  });

  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};

  return {
    props: {
      orderId: params.id,
      HeaderFooter: HeaderFooter,
      DataSeo: DataSeo,
      Scripts: Scripts,
    },
  };
}

export default function Pagamento({
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

  const [form, setForm] = useState({
    sended: false,
    loading: false,
  } as FormInitialType);
  const handleForm = (value: Object) => {
    setForm({ ...form, ...value });
  };

  const [order, setOrder] = useState({} as OrderType);

  const [products, setProducts] = useState([] as Array<any>);
  const [resume, setResume] = useState({} as any);
  const [placeholder, setPlaceholder] = useState(true as boolean);

  const [expire, setExpire] = useState("start" as string);
  const [pix, setPix] = useState({
    expires_in: 300,
  } as PixType);
  const handlePix = (value: any) => {
    setPix({ ...pix, ...value });
  };

  const ConfirmManager = async () => {
    let request: any = await api.bridge({
      url: "orders/get",
      data: {
        id: orderId,
      },
    });

    const handle: OrderType = request?.data ?? {};

    if (handle.status == 1) {
      window.location.href = `/dashboard/pedidos/${orderId}`;
    }
  };

  const CardManager = () => {
    let attempts = 5;

    const interval = setInterval(() => {
      if (new Date().getSeconds() % 5 === 0) {
        attempts--;
        ConfirmManager();
      }

      if (attempts == 0) {
        attempts--;

        alert("Algo deu errado ao processar seu pagamento. Tente novamente.");
        window.location.href = `/dashboard/pedidos/${orderId}`;
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  const PixManager = (charge: any) => {
    handlePix(charge);

    const targetTime = new Date(charge.time).getTime();
    const updateExpire = () => {
      const now = new Date().getTime();
      const distance = targetTime - now;

      if (distance <= 0) {
        setExpire("expired");
        return;
      }

      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setExpire(
        `${minutes < 10 ? "0" : ""}${minutes}:${
          seconds < 10 ? "0" : ""
        }${seconds}`
      );
    };

    updateExpire();

    const interval = setInterval(() => {
      if (!!expire && expire != "expired") {
        updateExpire();

        if (new Date().getSeconds() === 30 || new Date().getSeconds() === 0) {
          ConfirmManager();
        }
      }

      if (expire == "expire") {
        setExpire("");

        alert(
          "Seu código de pagamento via pix não é mais válido. Tente novamente."
        );
        window.location.href = `/dashboard/pedidos/${orderId}`;
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  const [card, setCard] = useState({} as CardType);
  const handleCard = (value: any) => {
    setCard({ ...card, ...value });
  };

  const [payment, setPayment] = useState({
    payment_method: "credit_card",
  } as PaymentType);
  const handlePayment = (value: any) => {
    setPayment({ ...payment, ...value });
  };

  const getOrder = async () => {
    setPlaceholder(true);

    let request: any = await api.bridge({
      url: "orders/get",
      data: {
        id: orderId,
      },
    });

    const handle: OrderType = request?.data ?? {};

    if (handle.status != 0) {
      window.location.href = `/dashboard/pedidos/${handle.id}`;
    }

    let dates: any = [];
    let products: any = [];

    handle.listItems?.map((item: any) => {
      dates.push(item.details.dateStart);
      products.push(item.product);
    });

    setResume({
      startDate: findDates(dates).minDate,
      endDate: findDates(dates).maxDate,
    } as any);

    setOrder(handle);
    setProducts(products);

    setPlaceholder(false);
  };

  useEffect(() => {
    getOrder();
  }, []);

  const submitPayment = async (e: any) => {
    e.preventDefault();

    handleForm({
      loading: true,
      feedback: "",
    });

    let updateOrder: any = await api.bridge({
      url: "orders/processing",
      data: {
        id: orderId,
      },
    });

    const handlePayment: any = payment;

    if (handlePayment.payment_method == "credit_card") {
      delete handlePayment["pix"];

      handlePayment["credit_card"] = {
        card: {
          ...card,
          // number: "4000000000000010",
          // holder_name: "Tony Stark",
          // exp_month: 1,
          // exp_year: 2030,
          // cvv: 3531,
          // holder_document: "39937710871",
        },
        operation_type: "auth_and_capture",
        installments: 1,
        statement_descriptor: "FIESTOU",
      };
    }

    if (handlePayment.payment_method == "pix") {
      delete handlePayment["credit_card"];

      handlePayment["pix"] = { expires_in: pix.expires_in };
    }

    const pagarme = new Pagarme();

    const request = await pagarme.createOrder(order, handlePayment);

    if (!!request.response) {
      const handle: any = request.data;

      if (payment.payment_method == "credit_card") {
        if (handle?.status == "paid") {
          CardManager();
        } else {
          handleForm({
            loading: false,
            sended: false,
            feedback: "Os dados fornecidos não são válidos. Tente novamente.",
          });
        }
      }

      if (payment.payment_method == "pix") {
        if (handle?.status == "paid" || handle?.status == "pending") {
          const handleCharge: any = !!handle?.charges?.length
            ? handle?.charges[0].last_transaction
            : {};

          PixManager({
            status: true,
            code: handleCharge.qr_code,
            qrcode: handleCharge.qr_code_url,
            time: handleCharge.expires_at,
          });
        } else {
          handleForm({
            loading: false,
            sended: false,
            feedback:
              "Algo deu errado ao processar seu pagamento. Tente novamente.",
          });
        }
      }
    } else {
      handleForm({
        loading: false,
        sended: false,
        feedback:
          "Algo deu errado ao processar seu pagamento. Tente novamente.",
      });
    }
  };

  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `Checkout | ${DataSeo?.site_text}`,
        url: `checkout`,
      }}
      header={{
        template: "clean",
        position: "solid",
        content: HeaderFooter,
      }}
      footer={{
        template: "clean",
      }}
    >
      <section className="py-6 md:py-10">
        <div className="container-medium">
          {placeholder ? (
            <div className="flex gap-10">
              <div className="w-full grid gap-4">
                <div className="bg-zinc-200 rounded-md animate-pulse py-10"></div>
                <div className="bg-zinc-200 rounded-md animate-pulse py-10 h-[20rem]"></div>
              </div>
              <div className="w-full md:max-w-[28rem]">
                <div className="bg-zinc-200 rounded-md animate-pulse py-10 h-[20rem]"></div>
              </div>
            </div>
          ) : (
            <form className="" onSubmit={(e: any) => submitPayment(e)}>
              <div className="grid md:flex items-start gap-10">
                <div className="grid gap-6 w-full">
                  <div className="pb-4 md:pb-6 border-b">
                    <div className="pb-4">
                      <Breadcrumbs
                        links={[
                          { url: "/dashboard", name: "Dashboard" },
                          { url: "/dashboard/pedidos", name: "Pedidos" },
                          {
                            url: `/dashboard/pedidos/${orderId}`,
                            name: "Pedido",
                          },
                        ]}
                      />
                    </div>
                    <div className="flex items-center">
                      <Link passHref href={`/dashboard/pedidos/${orderId}`}>
                        <Icon
                          icon="fa-long-arrow-left"
                          className="mr-4 md:mr-6 text-2xl text-zinc-900"
                        />
                      </Link>
                      <div className="font-title font-bold text-3xl md:text-4xl flex gap-4 items-center text-zinc-900">
                        Pagamento
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 md:gap-10">
                    <div className="grid">
                      <h4 className="text-xl md:text-2xl text-zinc-800">
                        Detalhes do pedido
                      </h4>
                      <div className="grid border rounded-xl p-2 text-sm mt-4">
                        <div className="flex gap-2 py-2 px-3 bg-zinc-100 rounded-md">
                          <div className="text-zinc-900 font-bold w-full max-w-[10rem]">
                            Pedido
                          </div>
                          <div className="">#{order.id}</div>
                        </div>

                        <div className="flex gap-2 py-2 px-3 rounded-md">
                          <div className="text-zinc-900 font-bold w-full max-w-[10rem]">
                            Realizado em
                          </div>
                          <div className="">
                            {getShorDate(order.created_at)}
                          </div>
                        </div>

                        <div className="flex gap-2 py-2 px-3 bg-zinc-100 rounded-md">
                          <div className="text-zinc-900 font-bold w-full max-w-[10rem]">
                            Agendado para
                          </div>
                          <div className="">
                            {dateBRFormat(resume.startDate)}{" "}
                            {resume.endDate != resume.startDate
                              ? `- ${dateBRFormat(resume.endDate)}`
                              : ""}{" "}
                            |{order.deliverySchedule}
                          </div>
                        </div>

                        <div className="flex gap-2 py-2 px-3 rounded-md">
                          <div className="text-zinc-900 font-bold w-full max-w-[10rem]">
                            Endereço de entrega
                          </div>
                          <div className="">
                            <div>
                              {order?.deliveryAddress?.street},{" "}
                              {order?.deliveryAddress?.number} -{" "}
                              {order?.deliveryAddress?.neighborhood}
                            </div>
                            <div>
                              CEP: {order?.deliveryAddress?.zipCode} |{" "}
                              {order?.deliveryAddress?.city} |{" "}
                              {order?.deliveryAddress?.state} -{" "}
                              {order?.deliveryAddress?.country}
                            </div>
                            <div>
                              {order?.deliveryAddress?.complement} |{" "}
                              {deliveryToName[order?.deliveryTo]}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="grid pb-4 md:pb-8">
                      <h4 className="text-xl md:text-2xl text-zinc-800">
                        Itens do pedido
                      </h4>

                      {!!products &&
                        products.map((product: any, key: any) => (
                          <div key={key} className="py-6">
                            <div className="flex items-center gap-6">
                              <div className="w-fit">
                                <div className="aspect-square bg-zinc-200 w-[6rem] rounded-xl">
                                  {!!product?.gallery?.length && (
                                    <Img
                                      src={getImage(
                                        product?.gallery[0],
                                        "thumb"
                                      )}
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
                                  <div className="text-zinc-900 pl-2 inline-block font-semibold underline">
                                    {product?.store.title}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-zinc-100 p-4 md:p-8 w-full md:max-w-[28rem] relative">
                  <div className="font-title font-bold text-zinc-900 text-xl mb-4">
                    Resumo
                  </div>

                  <div className="grid text-sm gap-2 mb-2 py-2">
                    <div className="flex gap-2">
                      <div className="w-full">
                        Subtotal ({products.length}{" "}
                        {products.length == 1 ? "item" : "itens"})
                      </div>
                      <div className="whitespace-nowrap">
                        R$ {moneyFormat(order.total)}
                      </div>
                    </div>

                    <div className="border-t"></div>

                    <div className="flex gap-2">
                      <div className="w-full text-zinc-900 font-bold">
                        Total
                      </div>
                      <div className="text-2xl text-zinc-900 font-bold whitespace-nowrap">
                        R$ {moneyFormat(order.total)}
                      </div>
                    </div>
                  </div>

                  {!!form.feedback && !form.sended && (
                    <div className="p-4 bg-red-500 text-white rounded-xl mb-4 flex justify-between">
                      <span>
                        Os dados do cartão não são válidos. Tente novamente.
                      </span>
                      <button
                        type="button"
                        onClick={() => handleForm({ feedback: "" })}
                      >
                        <Icon icon="fa-times" />
                      </button>
                    </div>
                  )}

                  {pix.status ? (
                    <div className="bg-white rounded-xl p-4">
                      <div className="text-center mb-4">
                        <div className="text-sm">Expira em:</div>
                        <div className="text-3xl text-zinc-900 font-bold">
                          {expire}
                        </div>
                      </div>
                      <div className="w-full max-w-[16rem] mx-auto">
                        {!!pix.qrcode ? (
                          <img src={pix.qrcode} className="w-full" />
                        ) : (
                          <div className="aspect-square border rounded"></div>
                        )}
                      </div>
                      <div className="px-3 pt-6">
                        <div className="px-4 py-3 bg-zinc-100 rounded">
                          <div className="text-sm line-clamp-3">{pix.code}</div>
                        </div>
                        <div className="text-center">
                          <input
                            type="text"
                            id="pix-code"
                            defaultValue={pix.code}
                            className="absolute h-0 w-0 opacity-0 overflow-hidden"
                          />
                          <button
                            type="button"
                            onClick={() => CopyClipboard("pix-code")}
                            className="font-semibold pt-3 pb-2 text-cyan-600"
                          >
                            <Icon icon="fa-copy" className="mr-2" />
                            COPIAR
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white rounded-xl grid">
                      <div>
                        <div
                          onClick={(e: any) =>
                            handlePayment({ payment_method: "credit_card" })
                          }
                          className={`p-3 md:p-4 cursor-pointer flex gap-2 items-center`}
                        >
                          <div
                            className={`border ${
                              payment.payment_method == "credit_card"
                                ? "border-zinc-400"
                                : "border-zinc-300"
                            } w-[1rem] rounded-full h-[1rem] relative`}
                          >
                            {payment.payment_method == "credit_card" && (
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[.5rem] h-[.5rem] bg-yellow-400 rounded-full"></div>
                            )}
                          </div>
                          <div className="leading-tight text-zinc-900 font-semibold flex items-center gap-1">
                            <Img
                              src="/images/pagarme/card-icon.png"
                              className="w-[1.75rem]"
                            />
                            <div className="w-full">CARTÃO DE CRÉDITO</div>
                          </div>
                        </div>

                        {payment.payment_method == "credit_card" && (
                          <div className="px-3 md:px-4 pb-3 md:pb-4">
                            <div className="bg-zinc-100 mb-2 py-2 px-3 text-sm rounded-md">
                              * Os dados de pagamento não ficam salvos em nossa
                              base de dados
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="form-group">
                                <label className="absolute top-0 left-0 ml-2 -mt-2 bg-white px-2 text-xs">
                                  Titular
                                </label>
                                <input
                                  type="text"
                                  onChange={(e: any) =>
                                    handleCard({ holder_name: e.target.value })
                                  }
                                  required
                                  className="form-control"
                                />
                              </div>
                              <div className="form-group">
                                <label className="absolute top-0 left-0 ml-2 -mt-2 bg-white px-2 text-xs">
                                  CPF/CNPJ
                                </label>
                                <input
                                  type="number"
                                  onChange={(e: any) =>
                                    handleCard({
                                      holder_document: justNumber(
                                        e.target.value
                                      ).toString(),
                                    })
                                  }
                                  required
                                  className="form-control"
                                />
                              </div>
                            </div>
                            <div className="form-group">
                              <label className="absolute top-0 left-0 ml-2 -mt-2 bg-white px-2 text-xs">
                                Número do Cartão
                              </label>
                              <input
                                type="number"
                                onChange={(e: any) =>
                                  handleCard({
                                    number: justNumber(
                                      e.target.value
                                    ).toString(),
                                  })
                                }
                                required
                                className="form-control appearance-none"
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div className="form-group">
                                <label className="absolute top-0 left-0 ml-2 -mt-2 bg-white px-2 text-xs">
                                  Validade
                                </label>
                                <div className="flex items-center border border-zinc-300 rounded-lg">
                                  <div className="w-full">
                                    <select
                                      id="expiry_month"
                                      name="expiry_month"
                                      required
                                      onChange={(e: any) =>
                                        handleCard({
                                          exp_month: justNumber(e.target.value),
                                        })
                                      }
                                      className="form-control border-0 appearance-none"
                                    >
                                      <option value="">Mês</option>
                                      <option value="01">01</option>
                                      <option value="02">02</option>
                                      <option value="03">03</option>
                                      <option value="04">04</option>
                                      <option value="05">05</option>
                                      <option value="06">06</option>
                                      <option value="07">07</option>
                                      <option value="08">08</option>
                                      <option value="09">09</option>
                                      <option value="10">10</option>
                                      <option value="11">11</option>
                                      <option value="12">12</option>
                                    </select>
                                  </div>
                                  <div className="w-fit">/</div>
                                  <div className="w-full">
                                    <select
                                      id="expiry_year"
                                      name="expiry_year"
                                      required
                                      onChange={(e: any) =>
                                        handleCard({
                                          exp_year: justNumber(e.target.value),
                                        })
                                      }
                                      className="form-control border-0 appearance-none"
                                    >
                                      <option value="">Ano</option>
                                      {Array.from(
                                        new Array(21),
                                        (val, index) =>
                                          new Date().getFullYear() + index
                                      ).map((year) => (
                                        <option key={year} value={year}>
                                          {year}
                                        </option>
                                      ))}
                                    </select>
                                  </div>
                                </div>
                              </div>
                              <div className="form-group">
                                <label className="absolute top-0 left-0 ml-2 -mt-2 bg-white px-2 text-xs">
                                  CVV/CVC
                                </label>
                                <input
                                  type="number"
                                  onChange={(e: any) =>
                                    handleCard({
                                      cvv: justNumber(
                                        e.target.value
                                      ).toString(),
                                    })
                                  }
                                  required
                                  className="form-control appearance-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="border-t">
                        <div
                          onClick={(e: any) =>
                            handlePayment({ payment_method: "pix" })
                          }
                          className={`p-3 md:p-4 cursor-pointer flex gap-2 items-center`}
                        >
                          <div
                            className={`border ${
                              payment.payment_method == "pix"
                                ? "border-zinc-400"
                                : "border-zinc-300"
                            } w-[1rem] rounded-full h-[1rem] relative`}
                          >
                            {payment.payment_method == "pix" && (
                              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[.5rem] h-[.5rem] bg-yellow-400 rounded-full"></div>
                            )}
                          </div>

                          <div className="leading-tight text-zinc-900 font-semibold flex items-center gap-1">
                            <Img
                              src="/images/pagarme/pix-icon.png"
                              className="w-[1.75rem]"
                            />
                            <div className="w-full">PIX</div>
                          </div>
                        </div>

                        {payment.payment_method == "pix" && (
                          <div className="px-3 md:px-4 pb-3 md:pb-4">
                            <div className="bg-zinc-100 py-2 px-3 text-sm rounded-md">
                              <b className="text-zinc-900">Atenção:</b> Ao
                              confirmar, será gerado um código para pagamento
                              via pix. Utilize o QRcode ou o código{" "}
                              {`"copiar e colar"`} para efetuar o pagamento no
                              aplicativo do seu banco.
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {form.loading && !pix.status && (
                    <div className="absolute inset-0 w-full h-full bg-white opacity-50 cursor-wait"></div>
                  )}

                  {!pix.status && (
                    <div className="grid mt-4">
                      <Button
                        loading={form.loading}
                        checked={form.sended || pix.status}
                        style="btn-success"
                        className="py-6 px-3"
                      >
                        Confirmar e pagar
                      </Button>
                    </div>
                  )}

                  <div className="mt-4 border-t pt-4 flex justify-center">
                    <Img
                      src="/images/pagarme/selo-flags.png"
                      className="w-full max-w-[16rem]"
                    />
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </section>
    </Template>
  );
}
