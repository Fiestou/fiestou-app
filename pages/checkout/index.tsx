import Template from "@/src/template";
import Cookies from "js-cookie";
import Api from "@/src/services/api";
import Payment from "@/src/services/payment";
import { useEffect, useState } from "react";
import { dateBRFormat, findDates, getZipCode, moneyFormat } from "@/src/helper";
import { Button, Input, Label, Select } from "@/src/components/ui/form";
import { useRouter } from "next/router";
import { UserType } from "@/src/models/user";
import { AddressType } from "@/src/models/address";
import { ProductOrderType, ProductType } from "@/src/models/product";
import { StoreType } from "@/src/models/store";
import { ItemOrderType, OrderType } from "@/src/models/order";
import shortUUID from "short-uuid";
import Partner from "@/src/components/common/Partner";
import { loadStripe } from "@stripe/stripe-js";
import { RegisterOrderMail } from "@/src/mail";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Link from "next/link";
import Img from "@/src/components/utils/ImgBase";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { CartType } from "@/src/models/cart";

const FormInitialType = {
  sended: false,
  loading: false,
};

export async function getServerSideProps(ctx: any) {
  const api = new Api();

  let request: any;

  const parse = ctx.req.cookies["fiestou.cart"] ?? "";
  const cart = !!parse ? JSON.parse(parse) : [];

  let user: UserType = !!ctx.req.cookies["fiestou.user"]
    ? JSON.parse(ctx.req.cookies["fiestou.user"])
    : {};

  request = await api.bridge(
    {
      url: "users/get",
      data: {
        ref: user.email,
      },
    },
    ctx
  );

  user = request?.data ?? ({} as UserType);

  request = await api.get({
    url: "request/products",
    data: {
      whereIn: cart.map((item: any) => item.product),
    },
  });

  const products = request?.data ?? [];

  cart.map((item: any, key: any) => {
    let handle = products.find(
      (prod: any, index: any) => prod.id == item.product
    );

    if (!!handle) {
      cart[key]["product"] = handle;
    }
  });

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
        {
          model: "roles",
        },
      ],
    },
    ctx
  );

  const roles = request?.data?.query?.roles ?? [];
  const mailContent = request?.data?.query?.mailContent ?? [];

  return {
    props: {
      cart: cart,
      user: user,
      token: !!ctx.req.cookies["fiestou.authtoken"],
      products: products,
      roles: roles[0] ?? {},
      mailContent: mailContent[0] ?? {},
    },
  };
}

export default function Checkout({
  cart,
  user,
  token,
  products,
  roles,
  mailContent,
}: {
  cart: Array<CartType>;
  user: UserType;
  token: boolean;
  products: Array<ProductType>;
  roles: any;
  mailContent: any;
}) {
  const api = new Api();
  const router = useRouter();
  const { isFallback } = useRouter();

  const [form, setForm] = useState(FormInitialType);

  const [listCart, setListCart] = useState(cart as Array<CartType>);

  let dates = listCart.map((item: any) => item.details.dateStart);
  let subtotal = listCart.reduce((acumulador: number, item: any) => {
    return acumulador + item.total;
  }, 0);

  const [resume, setResume] = useState({
    subtotal: subtotal,
    total: subtotal,
    startDate: findDates(dates).minDate,
    endDate: findDates(dates).maxDate,
  } as any);

  const platformCommission = roles?.platformCommission ?? 5;

  let stores = products.map((product: any, key: any) => product.store);

  stores = stores.filter(
    (obj: any, index: any) =>
      stores.findIndex((item) => item.id === obj.id) === index
  );

  const [schedule, setSchedule] = useState("" as string);
  const [locations, setLocations] = useState([] as Array<AddressType>);
  const [address, setAddress] = useState({} as AddressType);

  useEffect(() => {
    setLocations(user?.address ?? []);
    setAddress((user?.address ?? []).filter((addr) => !!addr.main)[0]);

    if (!!window && (!token || !user.id)) {
      Cookies.set("fiestou.redirect", "checkout", { expires: 1 });
      window.location.href = "/acesso";
    }
  }, [user, token]);

  const handleZipCode = async (zipCode: string) => {
    const location = await getZipCode(zipCode);

    if (!!location) {
      let handleAddress = {} as AddressType;

      handleAddress["zipCode"] = zipCode;
      handleAddress["street"] = location.logradouro;
      handleAddress["neighborhood"] = location.bairro;
      handleAddress["city"] = location.localidade;
      handleAddress["state"] = location.uf;
      handleAddress["country"] = "Brasil";
      handleAddress["main"] = true;

      setAddress({ ...address, ...handleAddress });
    }
  };

  const submitOrder = async (e: any) => {
    e.preventDefault();

    setForm({ ...form, loading: true });

    let total = 0;
    let listItems: Array<ProductOrderType> = [];

    cart.map((item: any, key: any) => {
      const cartItem = Object.assign({}, item);
      let product: any =
        products.find((prod: any) => prod.id == cartItem.product.id) ?? {};

      if (!!product.id) {
        let store: StoreType = product.store ?? {};

        const unavailableDate = [
          ...(product?.details?.unavailable ?? []),
          cartItem.details.dateStart,
        ];

        const handle = {
          ...product.details,
          unavailable: unavailableDate,
        };

        product = {
          ...product,
          details: handle,
        };

        listItems.push({
          attributes: cartItem.attributes,
          details: cartItem.details,
          product: {
            ...product?.details,
            title: product?.title,
            id: product?.id ?? "",
            store: { id: store.id, slug: store.slug, title: store.title },
            vehicle: product?.vehicle ?? "",
            freeTax: product?.freeTax ?? "",
            fragility: product?.fragility ?? "",
            comercialType: product?.comercialType ?? "",
            schedulingTax: product?.schedulingTax ?? "",
            schedulingPeriod: product?.schedulingPeriod ?? "",
          },
          quantity: cartItem.quantity,
          total: cartItem.total,
        });

        total += cartItem.total;
      }
    });

    const order: OrderType = {
      user: user,
      listItems: listItems,
      platformCommission: platformCommission,
      total: total,
      deliverySchedule: schedule,
      deliveryAddress: address,
      deliveryStatus: "pending",
    };

    const sendOrderToClient: any = await api.bridge({
      url: "orders/register",
      data: order,
    });

    if (!!sendOrderToClient.response) {
      const orderId = sendOrderToClient.data.id;

      const payment = new Payment();
      const stripe = await loadStripe(
        process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
      );
      const checkoutSession: any = await payment.createSession({
        ...order,
        id: orderId,
      });

      if (!!checkoutSession?.session?.id) {
        setForm({ ...form, loading: false });

        await api.bridge({
          url: "orders/register-meta",
          data: {
            id: orderId,
            metadata: checkoutSession?.session,
          },
        });

        Cookies.remove("fiestou.cart");

        await RegisterOrderMail(order, listCart, {
          subject: mailContent["order_subject"],
          html: mailContent["order_body"],
        });

        const result = await stripe?.redirectToCheckout({
          sessionId: checkoutSession?.session.id,
        });

        if (result?.error) {
          alert(result.error.message);
        }
      }
    }
  };

  return (
    !isFallback && (
      <Template
        header={{
          template: "clean",
          position: "solid",
        }}
        footer={{
          template: "clean",
        }}
      >
        <section className="pt-6 md:pt-12">
          <div className="container-medium pb-4 md:pb-0">
            <div className="pb-4 md:pt-6">
              <Breadcrumbs
                links={[
                  { url: "/produtos", name: "Produtos" },
                  { url: "/carrinho", name: "Carrinho" },
                ]}
              />
            </div>
            <div className="flex items-center">
              <Link passHref href="/carrinho">
                <Icon
                  icon="fa-long-arrow-left"
                  className="mr-4 md:mr-6 text-2xl text-zinc-900"
                />
              </Link>
              <div className="font-title font-bold text-3xl md:text-4xl flex gap-4 items-center text-zinc-900">
                Finalizar
              </div>
            </div>
          </div>
        </section>
        <section className="pt-6 md:py-12">
          <form onSubmit={(e: any) => submitOrder(e)}>
            <div className="container-medium">
              <div className="grid md:flex gap-4 md:gap-10 items-start">
                <div className="grid gap-6 md:gap-10 w-full">
                  <div className="grid gap-4 border-b pb-8 mb-0">
                    <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
                      Endereço de entrega
                    </h4>
                    {!!locations.length ? (
                      <div className="">
                        {locations.map((addr: AddressType, key: any) => (
                          <div className="relative" key={key}>
                            {addr?.street == address?.street &&
                              addr?.number == address?.number && (
                                <div className="absolute rounded-md border-2 border-yellow-500 inset-0"></div>
                              )}
                            <label
                              className={`${
                                addr?.street == address?.street &&
                                addr?.number == address?.number &&
                                "text-yellow-600"
                              } flex gap-3 p-4 items-center`}
                            >
                              <div className="pr-2">
                                <input
                                  type="radio"
                                  checked={
                                    addr?.street == address?.street &&
                                    addr?.number == address?.number
                                  }
                                  onChange={() => setAddress(addr)}
                                />
                              </div>
                              <div>
                                <div>
                                  {addr.street}, {addr.number}
                                </div>
                                <div>
                                  {addr.neighborhood} - {addr.city} |{" "}
                                  {addr.state}
                                </div>
                                <div>
                                  CEP: {addr.zipCode} - {addr.country}
                                </div>
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div>
                        <div className="grid gap-2">
                          <Input
                            name="cep"
                            onChange={(e: any) => handleZipCode(e.target.value)}
                            required
                            defaultValue={address?.zipCode}
                            placeholder="CEP"
                          />
                          <div className="flex gap-2">
                            <div className="w-full">
                              <Input
                                name="rua"
                                readonly
                                required
                                defaultValue={address?.street}
                                placeholder="Rua"
                              />
                            </div>
                            <div className="w-[10rem]">
                              <Input
                                name="numero"
                                onChange={(e: any) =>
                                  setAddress({
                                    ...address,
                                    number: e.target.value,
                                  })
                                }
                                required
                                defaultValue={address?.number}
                                placeholder="Número"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="w-full">
                              <Input
                                name="bairro"
                                readonly
                                required
                                defaultValue={address?.neighborhood}
                                placeholder="Bairro"
                              />
                            </div>
                            <div className="w-full">
                              <Input
                                name="complemento"
                                onChange={(e: any) =>
                                  setAddress({
                                    ...address,
                                    complement: e.target.value,
                                  })
                                }
                                defaultValue={address?.complement}
                                placeholder="Complemento"
                              />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <div className="w-full">
                              <Input
                                name="cidade"
                                readonly
                                required
                                defaultValue={address?.city}
                                placeholder="Cidade"
                              />
                            </div>
                            <div className="w-[10rem]">
                              <Input
                                name="estado"
                                readonly
                                required
                                defaultValue={address?.state}
                                placeholder="UF"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="mb-0 relative overflow-hidden">
                    <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
                      Horário de entrega
                    </h4>
                    <div className="h-0 pt-4 relative overflow-hidden">
                      {!schedule && (
                        <input readOnly name="agendamento" required />
                      )}
                    </div>
                    <div className="border relative rounded-lg py-4">
                      <div className="absolute top-0 left-0 bg-white text-sm -mt-3 px-1 mx-2">
                        Selecione
                      </div>
                      <Swiper
                        spaceBetween={0}
                        breakpoints={{
                          0: {
                            slidesPerView: 4.5,
                          },
                          1024: {
                            slidesPerView: 7.5,
                          },
                        }}
                      >
                        {[
                          { period: "Manhã", time: "09:00" },
                          { period: "Manhã", time: "10:00" },
                          { period: "Manhã", time: "11:00" },
                          { period: "Manhã", time: "12:00" },
                          { period: "Tarde", time: "13:00" },
                          { period: "Tarde", time: "14:00" },
                          { period: "Tarde", time: "15:00" },
                          { period: "Tarde", time: "16:00" },
                          { period: "Tarde", time: "17:00" },
                          { period: "Noite", time: "18:00" },
                          { period: "Noite", time: "19:00" },
                          { period: "Noite", time: "20:00" },
                          { period: "Noite", time: "21:00" },
                        ].map((item: any, key) => (
                          <SwiperSlide key={key} className="pl-4">
                            <div
                              onClick={() =>
                                setSchedule(`${item.period} - ${item.time}`)
                              }
                              className={`${
                                schedule == item.period + " - " + item.time
                                  ? "text-yellow-500"
                                  : "text-zinc-500 hover:text-zinc-900"
                              }  ease cursor-pointer`}
                            >
                              <div className="text-xs">{item.period}</div>
                              <div className="font-semibold">{item.time}</div>
                            </div>
                          </SwiperSlide>
                        ))}
                      </Swiper>
                    </div>
                  </div>
                  <div className="border-b pb-4"></div>

                  <div className="grid gap-4 pb-4 md:pb-8 mb-0">
                    <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
                      Fornecedores
                    </h4>
                    <div className="grid lg:grid-cols-2 gap-4">
                      {stores.map((store: any, key: any) => (
                        <div key={key}>
                          <Partner params={store} />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="w-full md:mb-[2rem] grid gap-6 max-w-[30rem] relative bg-zinc-100 p-4 md:p-8 rounded-md">
                  <h5 className="font-title text-xl text-zinc-900">
                    Resumo do pedido
                  </h5>
                  <div className="grid gap-6">
                    <div className="border-zinc-300">
                      <div className="font-bold text-zinc-900">
                        Data da locação
                      </div>
                      <div>
                        {dateBRFormat(resume.startDate)}
                        {resume.endDate != resume.startDate
                          ? ` - ${dateBRFormat(resume.endDate)}`
                          : ""}
                        {!!schedule ? ` | ${schedule}` : ""}
                      </div>
                    </div>
                    <div>
                      <hr className="my-0 border-zinc-300" />
                    </div>
                    <div className="flex">
                      <div className="w-full whitespace-nowrap">
                        Subtotal ({listCart.length}{" "}
                        {listCart.length == 1 ? "item" : "itens"})
                      </div>
                      <div className="whitespace-nowrap">
                        R$ {moneyFormat(resume.subtotal)}
                      </div>
                    </div>
                    <div className="rounded-md bg-red-100 text-sm text-zinc-900 p-3 md:p-3 grid gap-2">
                      <div className="flex items-center gap-2 font-bold">
                        <Icon
                          icon="fa-exclamation-triangle"
                          type="fa"
                          className="text-xs text-red-500"
                        />
                        <span className="">Atenção</span>
                      </div>
                      <div className="text-xs">
                        Para os produtos alugados, requeremos que retornem tudo
                        que estava na descrição e com as mesmas condições, que
                        foram apresentados. Obrigado e aproveite.
                      </div>
                    </div>
                    <div className="flex">
                      <div className="text-zinc-900 text-lg">Total</div>
                      <div className="whitespace-nowrap w-full text-right">
                        <div className="font-bold text-zinc-900 text-xl">
                          R$ {moneyFormat(resume.total)} à vista
                        </div>
                        <div className="text-xs">
                          ou em até 10x de R$ {moneyFormat(resume.total / 10)}{" "}
                          sem juros
                        </div>
                      </div>
                    </div>
                    <div className="grid relative p-1 md:p-0">
                      {!!address?.street && !!schedule ? (
                        <Button
                          loading={form.loading}
                          style="btn-success"
                          className="py-6 px-3"
                        >
                          Confirmar e efetuar pagamento
                        </Button>
                      ) : (
                        <button
                          type="button"
                          className="btn bg-green-500 text-white border border-transparent opacity-40 py-6 px-3 text cursor-not-allowed"
                        >
                          Confirmar e efetuar pagamento
                        </button>
                      )}

                      <div className="border-t text-xs grayscale mt-4 pt-2 opacity-50 flex justify-center items-center gap-2">
                        <span>pagamento via:</span>

                        <Img
                          src="/images/stripe.png"
                          size="md"
                          className="w-[4rem]"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        </section>
      </Template>
    )
  );
}
