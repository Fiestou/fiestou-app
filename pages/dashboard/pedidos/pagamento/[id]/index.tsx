import Template from "@/src/template";
import Api from "@/src/services/api";
import { fetchOrderById } from "@/src/services/order";
import { useDebugValue, useEffect, useState } from "react";
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

  // novo bloco de delivery (modelo novo)
  const legacyOrder = order as any;

  // NOVO MODELO: tudo vem dentro de order.delivery
  const deliveryAddress =
    order?.delivery?.address ?? legacyOrder?.deliveryAddress;

  const deliverySchedule =
    order?.delivery?.schedule ?? legacyOrder?.deliverySchedule;

  // Calcular frete total somando os deliveryFee de cada item (para múltiplas lojas)
  const calculateTotalDeliveryFee = () => {
    if (!order?.items?.length) return 0;
    
    const totalFee = order.items.reduce((sum, item: any) => {
      const metadata = typeof item.metadata === 'string' 
        ? JSON.parse(item.metadata) 
        : item.metadata;
      
      const fee = Number(metadata?.details?.deliveryFee || 0);
      return sum + fee;
    }, 0);
    
    // Se a soma dos deliveryFee for maior que 0, usar ela
    // Senão, usar o delivery.price padrão
    return totalFee > 0 
      ? totalFee 
      : (Number(order?.delivery?.priceLabel) || Number(order?.delivery?.price) || Number(legacyOrder?.deliveryPrice) || 0);
  };

  const deliveryPrice = calculateTotalDeliveryFee();

  // AQUI: agora é SEMPRE string (ou undefined)
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
    expires_in: 300,
  });
  const handlePix = (value: Partial<PixType>) => {
    setPix((prev) => ({ ...prev, ...value } as PixType));
  };

  const [boleto, setBoleto] = useState<any>({});

  const ConfirmManager = async () => {
    try {
      // Usa o serviço centralizado para obter o pedido atualizado
      const handle = await fetchOrderById(api, orderId);

      if (handle && handle.status === 1) {
        window.location.href = `/dashboard/pedidos`;
      }
    } catch (err) {
      console.error("ConfirmManager error:", err);
    }
  };

  const CardManager = () => {
    let attempts = 5;

    const interval = setInterval(() => {
      if (new Date().getSeconds() % 5 === 0) {
        attempts--;
        ConfirmManager();
      }

      if (attempts === 0) {
        attempts--;
        alert("Algo deu errado ao processar seu pagamento. Tente novamente.");
        window.location.href = `/dashboard/pedidos`;
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
        `${minutes < 10 ? "0" : ""}${minutes}:${seconds < 10 ? "0" : ""
        }${seconds}`
      );
    };

    updateExpire();

    const interval = setInterval(() => {
      if (!!expire && expire !== "expired") {
        updateExpire();

        if (
          new Date().getSeconds() === 30 ||
          new Date().getSeconds() === 0
        ) {
          ConfirmManager();
        }
      }

      if (expire === "expire") {
        setExpire("");
        alert(
          "Seu código de pagamento via pix não é mais válido. Tente novamente."
        );
        window.location.href = `/dashboard/pedidos`;
      }
    }, 1000);

    return () => clearInterval(interval);
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
      // agora bate na rota GET /order/{id}
      const request: any = await api.bridge({
        method: "get",
        url: `order/${orderId}`,
      });

      const fetchedOrder: OrderType | undefined = request?.order;

      if (!fetchedOrder) {
        // se quiser, pode redirecionar aqui
        // window.location.href = `/dashboard/pedidos/${orderId}`;
        setPlaceholder(false);
        return;
      }

      // salva o pedido no estado
      setOrder(fetchedOrder);

      // ---------------------------------------
      // Monta as datas a partir de items[].metadata.details
      // (ou do formato antigo metadata.raw_item.details, se existir)
      // ---------------------------------------
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

        // novo formato: metadata.details
        // legado: metadata.raw_item.details
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

      // ---------------------------------------
      // Produtos para o OrderItemsList
      // (agora vêm em order.products)
      // ---------------------------------------
      const productsList = fetchedOrder.products ?? [];

      setProducts(productsList);

      // ---------------------------------------
      // Usuário (agora vem em order.customer)
      // ---------------------------------------
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

    // 1. Calcular valores corretamente
    const deliveryAmountCents = Math.round(deliveryPrice * 100); // frete em centavos
    const totalAmountCents = Math.round((order.total || 0) * 100); // total em centavos
    
    // 2. Calcular subtotal dos produtos (total - frete)
    const subtotalCents = totalAmountCents - deliveryAmountCents;

    // 3. Preparar items do pedido com valor correto
    const orderItems = order.items?.map((item: any, index: number) => {
      const itemTotalCents = Math.round((item.total || 0) * 100);
      
      return {
        amount: itemTotalCents,
        description: item.name || "Produto",
        quantity: item.quantity || 1,
        code: String(item.productId || item.id || ""),
      };
    }) || [];

    // 4. Ajustar arredondamentos para garantir que a soma bata
    const itemsSum = orderItems.reduce((sum, item) => sum + item.amount, 0);
    
    // Se a soma não bater, ajusta o primeiro item
    if (itemsSum !== subtotalCents && orderItems.length > 0) {
      const diff = subtotalCents - itemsSum;
      orderItems[0].amount += diff;
    }

    // 5. Verificar se agora está correto
    const finalItemsSum = orderItems.reduce((sum, item) => sum + item.amount, 0);

    // Payload base
    const basePayload: any = {
      order_id: Number(orderId),
      payment_method: payment.payment_method,
      
      order: {
        amount: totalAmountCents, // Total em centavos
        items: orderItems, // Items com valores corretos
        shipping: {
          description: "delivery",
          amount: deliveryAmountCents, // IMPORTANTE: incluir o valor do frete
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

    // CARTÃO DE CRÉDITO
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

    // SPLIT POR LOJA - Criar um split para cada loja com seu recipient_id
    // Agrupar items por loja e calcular valores
    const storeGroups: Record<string, { 
      recipientId: string; 
      itemsTotal: number; 
      deliveryFee: number;
    }> = {};

    order.items?.forEach((item: any) => {
      // Parse metadata se necessário
      let metadata = item.metadata;
      if (typeof metadata === 'string') {
        try {
          metadata = JSON.parse(metadata);
        } catch {
          metadata = {};
        }
      }

      // Pegar store do metadata ou do produto
      const store = metadata?.product?.store || item?.product?.store;
      const recipientId = store?.recipient_id || "acc_default";
      const itemTotal = Math.round((item.total || 0) * 100);
      const deliveryFee = Number(metadata?.details?.deliveryFee || 0);

      if (!storeGroups[recipientId]) {
        storeGroups[recipientId] = {
          recipientId,
          itemsTotal: 0,
          deliveryFee: 0,
        };
      }

      storeGroups[recipientId].itemsTotal += itemTotal;
      storeGroups[recipientId].deliveryFee += Math.round(deliveryFee * 100);
    });

    // Se não conseguiu agrupar por lojas, usar o valor total para um único recipient
    const splits = Object.values(storeGroups).length > 0
      ? Object.values(storeGroups).map(group => ({
          type: "flat",
          amount: group.itemsTotal + group.deliveryFee, // Produtos + frete da loja
          recipient_id: group.recipientId,
        }))
      : [{
          type: "flat",
          amount: totalAmountCents,
          recipient_id: order.store?.recipient_id || "acc_default",
        }];

    basePayload.payments = [{
      payment_method: payment.payment_method,
      split: splits,
    }];

    // PIX
    if (payment.payment_method === "pix") {
      basePayload.pix_expires_in = 300;
    }

    // BOLETO
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


    // Validação antes de enviar
    const validationErrors = [];
    
    if (!orderItems.length) {
      validationErrors.push("Pedido sem itens válidos");
    }
    
    if (finalItemsSum + deliveryAmountCents !== totalAmountCents) {
      validationErrors.push("Soma dos itens + frete não confere com total");
      console.error("ERRO DE VALIDAÇÃO:", {
        finalItemsSum,
        deliveryAmountCents,
        totalAmountCents,
        soma: finalItemsSum + deliveryAmountCents,
        diferença: totalAmountCents - (finalItemsSum + deliveryAmountCents)
      });
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

      // Verifica se não houve erro (sucesso)
      if (!response?.error && response?.response) {
        const data = response?.data || {};

        if (payment.payment_method === "credit_card") {
          if (data?.status === "paid") {
            formFeedback["sended"] = true;
            // Redirecionar imediatamente para a página do pedido
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
      console.error("ERRO AO PROCESSAR PAGAMENTO:", err);
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
                      deliveryTo={deliveryTo} // já é string amigável
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

