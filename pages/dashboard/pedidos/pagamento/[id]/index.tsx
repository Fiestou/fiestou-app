import Template from "@/src/template";
import Api from "@/src/services/api";
import { fetchOrderById } from "@/src/services/order";
import { useEffect, useRef, useState } from "react";
import {
  CopyClipboard,
  dateBRFormat,
  documentIsValid,
  findDates,
  getBrazilianStates,
  getImage,
  getShorDate,
  getZipCode,
  justNumber,
  moneyFormat,
} from "@/src/helper";
import { Button } from "@/src/components/ui/form";
import { CardType, OrderType, PaymentType, PixType } from "@/src/models/order";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Link from "next/link";
import Img from "@/src/components/utils/ImgBase";
import { deliveryToName } from "@/src/models/delivery";
import { UserType } from "@/src/models/user";
import { AddressType } from "@/src/models/address";
import { LoadingSkeleton } from "@/src/components/dashboard/pedidos/LoadingSkeleton";
import { HeadLine } from "@/src/components/dashboard/pedidos/HeadLine";
import { OrderDetailsCard } from "@/src/components/dashboard/pedidos/OrderDetailsCard";
import { OrderItemsList } from "@/src/components/dashboard/pedidos/OrderItemsList";
import { PaymentPanel } from "@/src/components/dashboard/pedidos/PaymentPanel";


interface FormInitialType {
  sended: boolean;
  loading: boolean;
  feedback: string;
}

export async function getServerSideProps(ctx: any) {
  const api = new Api();
  const params = ctx.params;

  let request: any = await api.content({
    method: "get",
    url: "order",
  });

  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};

  return {
    props: {
      orderId: params.id,
      HeaderFooter,
      DataSeo,
      Scripts,
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

  const [form, setForm] = useState<FormInitialType>({
    sended: false,
    loading: false,
    feedback: "",
  });
  const handleForm = (value: Partial<FormInitialType>) => {
    setForm((prev) => ({ ...prev, ...value }));
  };

  const [installments, setInstallments] = useState(1);
  const [user, setUser] = useState({} as UserType);
  const [order, setOrder] = useState({} as OrderType);

  const legacyOrder = order as any;

  const deliveryAddress =
    order?.delivery?.address ?? legacyOrder?.deliveryAddress;

  const deliverySchedule =
    order?.delivery?.schedule ?? legacyOrder?.deliverySchedule;

  const calculateTotalDeliveryFee = () => {
    if (!order?.items?.length) return 0;
    
    const totalFee = order.items.reduce((sum, item: any) => {
      const metadata = typeof item.metadata === 'string' 
        ? JSON.parse(item.metadata) 
        : item.metadata;
      
      const fee = Number(metadata?.details?.deliveryFee || 0);
      return sum + fee;
    }, 0);
    
    return totalFee > 0
      ? totalFee 
      : (Number(order?.delivery?.priceLabel) || Number(order?.delivery?.price) || Number(legacyOrder?.deliveryPrice) || 0);
  };

  const deliveryPrice = calculateTotalDeliveryFee();

  const deliveryTo: string | undefined =
    order?.delivery?.to ?? legacyOrder?.deliveryTo;


  const handleCustomer = (value: Partial<UserType>) => {
    setUser((prev) => ({ ...(prev ?? {}), ...value } as UserType));
  };

  const [address, setAddress] = useState({} as AddressType);
  const handleAddress = (value: Partial<AddressType>) => {
    setAddress((prev) => ({ ...(prev ?? {}), ...value } as AddressType));
  };
  const [useOrderAddress, setUseOrderAddress] = useState(true);


  const [errorZipCode, setErrorZipCode] = useState(false);
  const handleZipCode = async () => {
    const handle: any = await getZipCode(address.zipCode);

    if (!handle?.localidade) {
      setErrorZipCode(true);
    } else {
      setErrorZipCode(false);
      handleAddress({
        street: handle.logradouro,
        neighborhood: handle.bairro,
        city: handle.localidade,
        state: handle.uf,
        country: "Brasil",
      });
    }
  };

  const [products, setProducts] = useState<Array<any>>([]);
  const [resume, setResume] = useState({} as any);
  const [placeholder, setPlaceholder] = useState(true);

  const [expire, setExpire] = useState("start");
  const [pix, setPix] = useState<PixType>({
    status: false,
    expires_in: 1800,
  });
  const handlePix = (value: Partial<PixType>) => {
    setPix((prev) => ({ ...prev, ...value } as PixType));
  };

  const [boleto, setBoleto] = useState<any>({});

  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const ConfirmManager = async () => {
    try {
      const handle = await fetchOrderById(api, orderId);

      if (handle && handle.status === 1) {
        window.location.href = `/dashboard/pedidos`;
      }
    } catch (err) {
      console.error("ConfirmManager error:", err);
    }
  };

  const CardManager = () => {
    let attempts = 6;
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(() => {
      attempts--;
      ConfirmManager();

      if (attempts <= 0) {
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = null;
        handleForm({
          loading: false,
          sended: false,
          feedback: "Não foi possível confirmar o pagamento. Verifique seus pedidos.",
        });
        setTimeout(() => {
          window.location.href = `/dashboard/pedidos`;
        }, 3000);
      }
    }, 5000);
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
        `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""
        }${seconds}`
      );
    };

    updateExpire();
    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(() => {
      if (!!expire && expire !== "expired") {
        updateExpire();

        if (
          new Date().getSeconds() === 30 ||
          new Date().getSeconds() === 0
        ) {
          ConfirmManager();
        }
      }

      if (expire === "expired") {
        setExpire("");
        if (pollingRef.current) clearInterval(pollingRef.current);
        pollingRef.current = null;
        handleForm({ loading: false, sended: false, feedback: "Seu código PIX expirou. Tente novamente." });
        setTimeout(() => {
          window.location.href = `/dashboard/pedidos`;
        }, 3000);
      }
    }, 1000);
  };

  const BoletoManager = (charge: any) => {
    setBoleto(charge);
  };

  const [card, setCard] = useState({} as CardType);
  const handleCard = (value: Partial<CardType>) => {
    setCard((prev) => ({ ...(prev ?? {}), ...value } as CardType));
  };

  const [payment, setPayment] = useState<PaymentType>({
    payment_method: "credit_card",
  });
  const handlePayment = (value: Partial<PaymentType>) => {
    setPayment((prev) => ({ ...(prev ?? {}), ...value } as PaymentType));
  };

  const getOrder = async () => {
    setPlaceholder(true);

    try {
      const request: any = await api.bridge({
        method: "get",
        url: `order/${orderId}`,
      });

      const fetchedOrder: OrderType | undefined = request?.order;

      if (!fetchedOrder) {
        setPlaceholder(false);
        return;
      }

      setOrder(fetchedOrder);

      const dates: string[] = [];

      fetchedOrder.items?.forEach((item: any) => {
        let rawMeta: any = item.metadata;

        if (typeof rawMeta === "string") {
          try {
            rawMeta = JSON.parse(rawMeta);
          } catch {
            rawMeta = {};
          }
        }

        const rawDetails =
          rawMeta?.details ?? rawMeta?.raw_item?.details ?? null;

        if (rawDetails?.dateStart) dates.push(rawDetails.dateStart);
        if (rawDetails?.dateEnd) dates.push(rawDetails.dateEnd);
      });

      const resumeData =
        dates.length > 0
          ? {
            startDate: findDates(dates).minDate,
            endDate: findDates(dates).maxDate,
          }
          : {
            startDate: fetchedOrder.createdAt,
            endDate: fetchedOrder.createdAt,
          };

      setResume(resumeData as any);

      const productsList = fetchedOrder.products ?? [];
      setProducts(productsList);

      const fetchedUser = fetchedOrder.customer ?? null;
      if (fetchedUser) {
        setUser({
          id: fetchedUser.id,
          name: fetchedUser.name,
          email: fetchedUser.email,
          phone: fetchedUser.phone,
        } as UserType);
      }
    } finally {
      setPlaceholder(false);
    }
  };

  useEffect(() => {
    getOrder();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitPayment = async (e: any) => {
    e.preventDefault();

    let formFeedback: any = { loading: true, feedback: "" };
    handleForm(formFeedback);

    const orderAddress: any = useOrderAddress ? deliveryAddress : address;

    const deliveryAmountCents = Math.round(deliveryPrice * 100);
    const totalAmountCents = Math.round((order.total || 0) * 100);
    const subtotalCents = totalAmountCents - deliveryAmountCents;

    const orderItems = order.items?.map((item: any, index: number) => {
      const itemTotalCents = Math.round((item.total || 0) * 100);
      
      return {
        amount: itemTotalCents,
        description: item.name || "Produto",
        quantity: item.quantity || 1,
        code: String(item.productId || item.id || ""),
      };
    }) || [];

    const itemsSum = orderItems.reduce((sum, item) => sum + item.amount, 0);
    if (itemsSum !== subtotalCents && orderItems.length > 0) {
      const diff = subtotalCents - itemsSum;
      orderItems[0].amount += diff;
    }

    const finalItemsSum = orderItems.reduce((sum, item) => sum + item.amount, 0);

    const basePayload: any = {
      order_id: Number(orderId),
      payment_method: payment.payment_method,
      document: justNumber(user?.document ?? user?.cpf ?? ""),

      order: {
        amount: totalAmountCents,
        items: orderItems,
        shipping: {
          description: "delivery",
          amount: deliveryAmountCents,
          recipient_name: user.name || "Cliente",
          recipient_phone: user.phone || "",
          address: {
            country: "BR",
            state: orderAddress?.state ?? "",
            city: orderAddress?.city ?? "",
            zip_code: justNumber(orderAddress?.zipCode ?? ""),
            line_1: `${orderAddress?.street ?? ""}, ${orderAddress?.number ?? ""}`.trim(),
            line_2: orderAddress?.complement || null,
          }
        }
      }
    };

    if (payment.payment_method === "credit_card") {
      basePayload.credit_card = {
        installments: Number(installments) || 1,
        statement_descriptor: "FIESTOU",
        operation_type: "auth_and_capture",
        card: {
          number: justNumber(card?.number ?? ""),
          holder_name: String(card?.holder_name ?? ""),
          exp_month: String(card?.exp_month ?? "").padStart(2, '0'),
          exp_year: String(card?.exp_year ?? ""),
          cvv: String(card?.cvv ?? ""),
          holder_document: justNumber(card?.holder_document ?? ""),
          billing_address: {
            country: "BR",
            state: orderAddress?.state ?? "",
            city: orderAddress?.city ?? "",
            zip_code: justNumber(orderAddress?.zipCode ?? ""),
            line_1: `${orderAddress?.street ?? ""}, ${orderAddress?.number ?? ""}`.trim(),
            line_2: orderAddress?.complement || null,
          },
        },
      };
    }

    if (payment.payment_method === "pix") {
      basePayload.pix_expires_in = 1800;
    }

    if (payment.payment_method === "boleto") {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 3);

      basePayload.boleto = {
        instructions: "Pagamento referente ao pedido na Fiestou",
        due_at: dueDate.toISOString().split('T')[0],
        document_number: String(orderId).padStart(8, '0'),
        type: "DM",
      };
    }

    const validationErrors = [];
    
    if (!orderItems.length) {
      validationErrors.push("Pedido sem itens válidos");
    }
    
    if (finalItemsSum + deliveryAmountCents !== totalAmountCents) {
      validationErrors.push("Soma dos itens + frete não confere com total");
    }
    
    if (!orderAddress?.zipCode || !orderAddress?.city || !orderAddress?.state) {
      validationErrors.push("Endereço de entrega incompleto");
    }

    if (validationErrors.length) {
      formFeedback = {
        ...formFeedback,
        loading: false,
        sended: false,
        feedback: validationErrors.join(", "),
      };
      handleForm(formFeedback);
      return;
    }

    try {
      const response: any = await api.bridge({
        method: "post",
        url: "checkout/store",
        data: basePayload,
      });

      formFeedback["loading"] = false;

      if (!response?.error && response?.response) {
        const data = response?.data || {};

        if (payment.payment_method === "credit_card") {
          if (data?.status === "paid") {
            formFeedback["sended"] = true;
            window.location.href = `/dashboard/pedidos/${orderId}`;
            return;
          } else {
            formFeedback = {
              ...formFeedback,
              sended: false,
              feedback:
                "Os dados fornecidos não foram aprovados. Tente novamente.",
            };
          }
        }

        if (payment.payment_method === "pix") {
          if (data?.status === "paid" || data?.status === "pending") {
            const tx = data?.charges?.[0]?.last_transaction || {};
            PixManager({
              status: true,
              code: tx.qr_code,
              qrcode: tx.qr_code_url,
              time: tx.expires_at,
              expires_in: pix.expires_in,
            });
            formFeedback["sended"] = true;
          } else {
            formFeedback = {
              ...formFeedback,
              sended: false,
              feedback: "Não foi possível gerar o PIX. Tente novamente.",
            };
          }
        }

        if (payment.payment_method === "boleto") {
          if (data?.status === "paid" || data?.status === "pending") {
            const tx = data?.charges?.[0]?.last_transaction || {};
            BoletoManager({
              status: true,
              pdf: tx?.pdf,
              due_at: tx?.due_at,
              line: tx?.line,
            });
            formFeedback["sended"] = true;
          } else {
            formFeedback = {
              ...formFeedback,
              sended: false,
              feedback: "Não foi possível gerar o boleto. Tente novamente.",
            };
          }
        }
      } else {
        formFeedback = {
          ...formFeedback,
          sended: false,
          feedback:
            response?.data?.message || response?.message || 
            "Algo deu errado ao processar seu pagamento. Tente novamente.",
        };
      }
    } catch (err) {
      console.error("Erro no pagamento:", err);
      formFeedback = {
        ...formFeedback,
        loading: false,
        sended: false,
        feedback: "Falha de comunicação com o servidor. Tente novamente.",
      };
    }

    handleForm(formFeedback);
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
      footer={{ template: "clean" }}
    >
      <section className="py-6 md:py-10">
        <div className="container-medium">
          {placeholder ? (
            <LoadingSkeleton />
          ) : (
            <form onSubmit={submitPayment}>
              <div className="grid md:flex items-start gap-10">
                <div className="grid gap-6 order-1 md:order-0 w-full">
                  <div className="hidden md:block">
                    <HeadLine orderId={orderId} />
                  </div>
                  <div className="grid gap-6 md:gap-10">
                    <OrderDetailsCard
                      order={order}
                      resume={resume}
                      deliveryAddress={deliveryAddress}
                      deliverySchedule={deliverySchedule}
                      deliveryTo={deliveryTo}
                    />
                    <OrderItemsList products={products} />
                  </div>
                </div>

                <div className="order-0 md:order-1 w-full md:max-w-[28rem] relative grid gap-4">
                  <div className="block md:hidden">
                    <HeadLine orderId={orderId} />
                  </div>

                  <PaymentPanel
                    order={order}
                    productsCount={products.length}
                    deliveryPrice={deliveryPrice}
                    form={form}
                    handleForm={handleForm}
                    pix={pix}
                    boleto={boleto}
                    expire={expire}
                    user={user}
                    card={card}
                    payment={payment}
                    installments={installments}
                    address={address}
                    useOrderAddress={useOrderAddress}
                    errorZipCode={errorZipCode}
                    handleCard={handleCard}
                    handlePayment={handlePayment}
                    handleCustomer={handleCustomer}
                    handleAddress={handleAddress}
                    handleZipCode={handleZipCode}
                    setInstallments={setInstallments}
                    setUseOrderAddress={setUseOrderAddress}
                  />
                </div>
              </div>
            </form>
          )}
        </div>
      </section>
    </Template>
  );
};

