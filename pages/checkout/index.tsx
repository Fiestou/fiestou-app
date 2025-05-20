import Template from "@/src/template";
import Cookies from "js-cookie";
import Api from "@/src/services/api";
import { useCallback, useEffect, useState } from "react";
import {
  dateBRFormat,
  findDates,
  isCEPInRegion,
  justNumber,
  moneyFormat,
} from "@/src/helper";
import { Button } from "@/src/components/ui/form";
import { useRouter } from "next/router";
import { UserType } from "@/src/models/user";
import { AddressType } from "@/src/models/address";
import { ProductOrderType, ProductType } from "@/src/models/product";
import { StoreType } from "@/src/models/store";
import { OrderType } from "@/src/models/order";
import Partner from "@/src/components/common/Partner";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { CartType } from "@/src/models/cart";
import { deliveryToName } from "@/src/models/delivery";
import AddressCheckoutForm from "@/src/components/pages/checkout/AddressCheckoutForm";
import { formatCep, formatPhone } from "@/src/components/utils/FormMasks";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const FormInitialType = {
  sended: false,
  loading: false,
};

export async function getServerSideProps(ctx: any) {
  const api = new Api();

  const token = ctx.req.cookies["fiestou.authtoken"];
  if (!token) {
    return {
      redirect: {
        destination: "/acesso",
        permanent: false,
      },
    };
  }

  const parseCart = ctx.req.cookies["fiestou.cart"] ?? "";
  const cart = !!parseCart ? JSON.parse(parseCart) : [];

  let request: any = await api.bridge(
    {
      method: "post",
      url: `checkout/create`,
      data: {
        products: cart.map((item: any) => item.product),
      },
    },
    ctx
  );

  const DataSeo: any = request?.data?.DataSeo ?? {};
  const Scripts: any = request?.data?.Scripts ?? {};
  const Roles = request?.data?.Roles ?? {};

  const CheckoutPageContent = request?.data?.content ?? {};

  const user: UserType = request?.data?.user ?? {};
  const products: Array<ProductType> = request?.data?.products ?? [];

  cart.map((item: any, key: any) => {
    let handle = products.find((product: any) => product.id == item.product);

    if (!!handle) {
      cart[key]["product"] = handle;
    }
  });

  return {
    props: {
      cart: cart,
      user: user,
      token: !!token,
      products: products,
      Roles: Roles,
      CheckoutPageContent: CheckoutPageContent,
      DataSeo: DataSeo ?? {},
      Scripts: Scripts ?? {},
    },
  };
}

export default function Checkout({
  cart,
  user,
  token,
  products,
  Roles,
  CheckoutPageContent,
  DataSeo,
  Scripts,
}: {
  cart: Array<CartType>;
  user: UserType;
  token: boolean;
  products: Array<ProductType>;
  Roles: any;
  CheckoutPageContent: any;
  DataSeo: any;
  Scripts: any;
}) {
  const api = new Api();

  const platformCommission = Roles?.platformCommission ?? 5;
  const deliveryTax = parseFloat(Roles?.kmPrice) ?? 2.5;

  let stores: Array<StoreType> = [];

  products.map((product: any, key: any) => {
    stores[product.store.id] = product.store;
  });

  const { isFallback } = useRouter();

  const [form, setForm] = useState(FormInitialType);

  const [schedule, setSchedule] = useState("" as string);
  const [deliveryTo, setDeliveryTo] = useState("reception" as string);

  const [customLocation, setCustomLocation] = useState(false as boolean);
  const [locations, setLocations] = useState([] as Array<AddressType>);
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [initialPhone] = useState(formatPhone(user?.phone || ""));
  const [address, setAddress] = useState({
    country: "Brasil",
  } as AddressType);
  const handleAddress = (value: any) => {
    setAddress((prevAddress) => ({
      ...prevAddress,
      ...value,
    }));
  };

  const isPhoneValid = (phone: string): boolean => {
    const digitsOnly = phone.replace(/\D/g, "");
    return digitsOnly.length >= 10 && digitsOnly.length <= 11;
  };

  const hasChanged = useCallback(() => {
    return phone !== initialPhone;
  }, [phone, initialPhone]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(formatPhone(e.target.value));
  };

  const handleSavePhone = async () => {
    if (!isPhoneValid(phone)) {
      toast.error("Telefone inválido!");
      return;
    }

    try {
      await api.bridge({
        method: "post",
        url: "users/update",
        data: { phone: phone.replace(/\D/g, "") },
      });
      toast.success("Salvo com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar!");
    }
  };

  const [deliveryPrice, setDeliveryPrice] = useState<
    { price: number; store_id: number }[]
  >([]);

  useEffect(() => {
    if (user?.phone) {
      setPhone(formatPhone(user.phone));
    }
  }, [user?.phone]);

  useEffect(() => {
    if (!!address?.zipCode && justNumber(address?.zipCode).length >= 8) {
      console.log("Products", products);
      const getShippingPrice = async () => {
        const data: any = await api.request({
          method: "get",
          url: `delivery-zipcodes/${address?.zipCode}`,
          data: {
            ids: products.map((product: ProductType) => product.id),
          },
        });

        console.log("Data", data);
        if (data.data) {
          setDeliveryPrice(data.data as { price: number; store_id: number }[]);
        }
        console.log("Delivery Price", deliveryPrice);
      };

      getShippingPrice();
    }
  }, [address?.zipCode]);

  const [listCart, setListCart] = useState([] as Array<CartType>);
  const [resume, setResume] = useState({} as any);
  useEffect(() => {
    let dates = cart.map((item: any) => item.details.dateStart);
    let subtotal = cart.reduce((acumulador: number, item: any) => {
      return acumulador + item.total;
    }, 0);

    setResume({
      subtotal: subtotal,
      total: deliveryPrice.reduce((acc, item) => acc + item.price, subtotal),
      startDate: findDates(dates).minDate,
      endDate: findDates(dates).maxDate,
    });

    setListCart(cart);
  }, [cart, deliveryPrice]);

  useEffect(() => {
    setLocations(user?.address ?? []);
    setAddress((user?.address ?? []).filter((addr) => !!addr.main)[0]);

    if (!!window && (!token || !user.id)) {
      Cookies.set("fiestou.redirect", "checkout", { expires: 1 });
      window.location.href = "/acesso";
    }
  }, [user, token]);

  const submitOrder = async (e: any) => {
    e.preventDefault();

    setForm({ ...form, loading: true });

    let total = deliveryPrice.reduce((acc, item) => acc + item.price, 0);
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
      total: resume.total,
      deliverySchedule: schedule,
      deliveryAddress: address,
      deliveryTo: deliveryTo,
      deliveryPrice: deliveryPrice.reduce((acc, item) => acc + item.price, 0),
      deliveryStatus: "pending",
      status: -1,
    };

    const registerOrder: any = await api.bridge({
      method: "post",
      url: "orders/register",
      data: order,
    });

    if (!!registerOrder.response && !!registerOrder?.data?.id) {
      Cookies.remove("fiestou.cart");
      window.location.href = `/dashboard/pedidos/pagamento/${registerOrder?.data?.id}`;
    }

    setForm({ ...form, loading: false });
  };

  useEffect(() => {
    if (!!window && !!Cookies.get("fiestou.region")) {
      const handle: any = JSON.parse(Cookies.get("fiestou.region") ?? "");
      setAddress({ zipCode: handle?.cep ?? "", number: "" });
    }
  }, []);

  const renderDeliveryPrice = () => {
    const renderFreteItem = (item: { price: number; store_id: number }) => {
      const product = products.find(
        (product: any) => product.store.id == item.store_id
      );

      return (
        <div className="flex justify-between w-full">
          <span className="font-bold">
            Frete - {(product?.store as unknown as StoreType)?.companyName}
          </span>
          <span className="ml-2">R$ {moneyFormat(item?.price)}</span>
        </div>
      );
    };
    if (deliveryPrice.length == 0)
      return (
        <>
          <span className="font-bold">
            Frete {!!address?.zipCode && `(${formatCep(address?.zipCode)})`}
          </span>
        </>
      );

    if ((address?.zipCode?.length ?? 0) < 8)
      return (
        <div className="flex justify-between w-full">
          <span className="font-bold">
            Frete {!!address?.zipCode && `(${formatCep(address?.zipCode)})`}
          </span>
          <span>Entrega indisponível</span>
        </div>
      );
    return (
      <div className="w-full">
        {deliveryPrice?.map((item: any, index: number) => (
          <div key={index} className="text-sm flex justify-between">
            {renderFreteItem(item)}
          </div>
        ))}
      </div>
    );
  };

  return !isFallback && !!token ? (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `Checkout | ${DataSeo?.site_text}`,
        url: `checkout`,
      }}
      header={{
        template: "clean",
        position: "solid",
      }}
      footer={{
        template: "clean",
      }}
    >
      <section className="py-6 md:py-10">
        <form autoComplete="off" onSubmit={(e: any) => submitOrder(e)}>
          <div className="container-medium pb-14">
            <div className="grid md:flex gap-4 md:gap-10 items-start">
              <div className="grid gap-6 w-full">
                <div className="pb-4 md:pb-6 border-b">
                  <div className="pb-4">
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

                <div className="grid gap-6 md:gap-10">
                  <div className="grid gap-4 mb-0">
                    <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
                      Endereço de entrega
                    </h4>
                    {!!address?.zipCode && !isCEPInRegion(address?.zipCode) && (
                      <div className="flex items-center bg-yellow-100 text-yellow-900 px-4 py-3 rounded-md">
                        <Icon icon="fa-exclamation-triangle" className="mr-2" />
                        <div>
                          Sua região ainda não está disponível para nossos
                          fornecedores.
                        </div>
                      </div>
                    )}

                    {(!address?.complement ||
                      !address?.street ||
                      !address?.number ||
                      !address?.city ||
                      !address?.state) && (
                      <div className="flex items-start bg-yellow-100 text-yellow-900 px-4 py-3 rounded-md">
                        <Icon
                          icon="fa-exclamation-triangle"
                          className="mr-3 mt-1"
                        />
                        <div>
                          Preencha seu endereço corretamente. Não se esqueça do
                          informar o complemento.
                        </div>
                      </div>
                    )}

                    {!!locations.length && !customLocation && (
                      <div className="grid gap-2">
                        <div className="">
                          {locations.map((addr: AddressType, key: any) => (
                            <div
                              className={`${
                                addr == address
                                  ? "border-yellow-400"
                                  : "border-zinc-200 hover:border-zinc-400"
                              } rounded-md border ease cursor-pointer`}
                              key={key}
                              onClick={() => {
                                setAddress(addr);
                              }}
                            >
                              <div className={`flex gap-3 p-4 items-center`}>
                                <div className="pr-2">
                                  <div
                                    className={`${
                                      addr?.street == address?.street
                                        ? "border-zinc-400"
                                        : "border-zinc-300"
                                    } w-[1rem] h-[1rem] rounded-full border relative`}
                                  >
                                    {addr?.street == address?.street && (
                                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[.5rem] h-[.5rem] bg-yellow-400 rounded-full"></div>
                                    )}
                                  </div>
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
                              </div>
                            </div>
                          ))}
                        </div>
                        {!customLocation && (
                          <div>
                            <button
                              type="button"
                              onClick={() => setCustomLocation(true)}
                              className="text-sm underline text-zinc-900 hover:text-yellow-500 ease"
                            >
                              Entregar em outro endereço
                            </button>
                          </div>
                        )}
                      </div>
                    )}

                    {!!locations.length && !!customLocation && (
                      <div>
                        <button
                          type="button"
                          onClick={() => setCustomLocation(false)}
                          className="text-sm underline text-zinc-900 hover:text-yellow-500 ease"
                        >
                          Selecionar meu endereço
                        </button>
                      </div>
                    )}

                    {(!locations.length || customLocation) && (
                      <div>
                        <AddressCheckoutForm
                          address={address}
                          onChange={(value: any) => handleAddress(value)}
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
                      Verifique seu número de telefone
                    </h4>
                    <p className="whitespace-nowrap text-sm">
                      * O Fiestou utiliza seu número exclusivamente para enviar
                      atualizações sobre o status do seu pedido.
                    </p>
                  </div>

                  <div className="flex flex-row border-1 gap-2">
                    <input
                      name="phone"
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        const formattedValue = formatPhone(rawValue);
                        setPhone(formattedValue);
                      }}
                      required
                      value={phone}
                      placeholder="Insira seu telefone aqui"
                      className={`form-control flex flex-3 w-full ${
                        phone && !isPhoneValid(phone)
                          ? "border-2 border-red-500"
                          : !hasChanged()
                          ? "bg-gray-100"
                          : "border-2 border-green-500"
                      }`}
                    />
                    <Button
                      onClick={handleSavePhone}
                      disable={
                        !isPhoneValid(phone) ||
                        phone === formatPhone(user?.phone || "")
                      }
                      style="btn-yellow"
                    >
                      <b>Salvar</b>
                      <ToastContainer />
                    </Button>
                  </div>

                  <div className="mb-0 relative overflow-hidden">
                    <h4 className="text-xl md:text-2xl leading-tight text-zinc-800">
                      Detalhes de entrega
                    </h4>
                    <div className="flex pt-4 flex-col gap-6">
                      <div className="grid md:grid-cols-3 gap-2 md:gap-4">
                        {[
                          { type: "reception", icon: "🏢" },
                          { type: "door", icon: "🚪" },
                          { type: "for_me", icon: "📦" },
                        ].map((option: any, key: any) => (
                          <div
                            key={key}
                            onClick={(e: any) => {
                              setDeliveryTo(option.type);
                            }}
                            className={`border ${
                              deliveryTo == option.type
                                ? "border-yellow-400"
                                : "hover:border-zinc-400"
                            } p-3 md:p-4 cursor-pointer rounded-md ease flex gap-2 items-center`}
                          >
                            <div
                              className={`${
                                deliveryTo == option.type
                                  ? "border-zinc-400"
                                  : ""
                              } w-[1rem] h-[1rem] rounded-full border relative`}
                            >
                              {deliveryTo == option.type && (
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[.5rem] h-[.5rem] bg-yellow-400 rounded-full"></div>
                              )}
                            </div>
                            <div className="text-[.85rem] leading-tight text-nowrap">
                              {deliveryToName[option.type]}
                            </div>
                            <span className="text-lg self-end">
                              {option.icon}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="border relative rounded-lg py-4">
                        <div className="h-0 relative overflow-hidden">
                          {!schedule && (
                            <input readOnly name="agendamento" required />
                          )}
                        </div>
                        <div className="absolute top-0 left-0 bg-white text-sm -mt-3 px-1 mx-1">
                          Horário
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
                            { period: "Manhã", time: "08:00" },
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
                  </div>

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
              </div>

              <div className="w-full md:max-w-[28rem] md:mb-[2rem] relative">
                <div className="rounded-2xl bg-zinc-100 p-4 md:p-8">
                  <div className="font-title font-bold text-zinc-900 text-xl mb-6">
                    Resumo
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-start justify-between">
                      <div className="font-bold text-sm text-zinc-900 flex items-center">
                        <Icon
                          icon="fa-calendar"
                          className="text-sm mr-2 opacity-75"
                        />
                        Data da locação
                      </div>
                      <div className="whitespace-nowrap text-right text-sm">
                        {dateBRFormat(resume.startDate)}{" "}
                        {resume.endDate != resume.startDate
                          ? `- ${dateBRFormat(resume.endDate)}`
                          : ""}
                        <div>{schedule}</div>
                      </div>
                    </div>
                    <div className="border-t"></div>
                    <div className="flex">
                      <div className="w-full whitespace-nowrap">
                        Subtotal ({listCart.length}{" "}
                        {listCart.length == 1 ? "item" : "itens"})
                      </div>
                      <div className="whitespace-nowrap">
                        R$ {moneyFormat(resume.subtotal)}
                      </div>
                    </div>

                    <div className="border-t"></div>

                    <div className="flex items-start justify-between">
                      <div className="text-sm text-zinc-900 flex items-start w-full">
                        <Icon
                          icon="fa-truck"
                          className="text-sm mr-1 opacity-75"
                        />
                        {renderDeliveryPrice()}
                      </div>
                      {/* <div className="grid text-right">
                        <div className="whitespace-nowrap font-semibold text-sm">
                          {renderDeliveryPrice()}
                        </div>
                      </div> */}
                    </div>

                    <div className="border-t"></div>

                    <div className="flex gap-4 md:mb-4">
                      <div className="w-full pt-1 text-zinc-900 font-bold">
                        TOTAL
                      </div>
                      <div className="text-2xl text-zinc-900 font-bold whitespace-nowrap">
                        R$ {moneyFormat(resume.total)}
                      </div>
                    </div>

                    {!!CheckoutPageContent?.terms_list?.length && (
                      <div className="links-underline bg-zinc-200 rounded grid gap-2 p-3 text-[.85rem] leading-tight">
                        {CheckoutPageContent?.terms_list.map(
                          (term: any, key: any) => (
                            <div key={key} className="flex gap-2 pb-1">
                              <div className="pt-[2px]">
                                <input type="checkbox" required />
                              </div>
                              <div
                                dangerouslySetInnerHTML={{
                                  __html: term.term_description,
                                }}
                              ></div>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    <div className="grid fixed z-10 md:relative bg-white md:bg-transparent bottom-0 left-0 w-full p-1 md:p-0">
                      {!!address?.street &&
                      !!address?.complement &&
                      !!address?.number &&
                      !!schedule &&
                      !!address?.zipCode &&
                      !!isCEPInRegion(address?.zipCode) &&
                      isPhoneValid(phone) ? (
                        <Button
                          loading={form.loading}
                          style="btn-success"
                          className="py-6 mb-4 md:mb-0"
                        >
                          Confirmar e efetuar pagamento
                        </Button>
                      ) : (
                        <button
                          type="button"
                          className="btn bg-green-500 text-white border border-transparent opacity-40 py-6 mb-4 md:mb-0 text cursor-not-allowed"
                        >
                          Confirmar e efetuar pagamento
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </section>
    </Template>
  ) : (
    <></>
  );
}
