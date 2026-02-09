import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import Api from "@/src/services/api";
import { moneyFormat } from "@/src/helper";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import { getImage } from "@/src/helper";

interface DeliveryAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  complement: string;
}

interface GalleryItem {
  base_url: string;
  details: {
    sizes: {
      sm: string;
      md?: string;
    };
  };
}

interface ProductData {
  id: number;
  title: string;
  gallery: GalleryItem[] | null;
}

interface Order {
  order: any;
  id: number;
  created_at: string;
  status: string;
  listItems: string;
  deliveryAddress: string | DeliveryAddress;
  deliveryTo: string;
  deliverySchedule: string;
  deliveryStatus: string;
  deliveryPrice: number | string;
  delivery?: {
    status?: string;
    schedule?: {
      date: string;
      period: string;
      time: string;
    };
    to?: string;
    price?: number;
    priceLabel?: string;
    address?: DeliveryAddress;
  };
  user: {
    name: string;
    email: string;
    details: string;
  };
  partnerName?: string;
  partnerEmail?: string;
  payment?: {
    method?: string;
    installments?: number;
    amountTotal?: number;
    status?: string;
    transactionType?: string;
    pdf?: string;
    url?: string;
  };
  metadata?: {
    payment_method: string;
    payment_status: string;
    installments: number;
    amount_total: number;
    paid_at?: string;
    split?: any[];
    splits?: any[];
    transaction_type?: string;
    items?: { name: string; quantity: number; price: number }[];
  };
  total: number;
  productsData?: ProductData[];
}

interface ApiResponse {
  order: any;
  data: Order;
}

export default function OrderDetails() {
  const router = useRouter();
  const { id } = router.query;
  const api = new Api();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const getOrderDetails = async () => {
    if (!id) return;

    try {
      const request = (await api.bridge({
        method: "get",
        url: `order/${id}`,
      })) as ApiResponse;

      const orderData = request?.data?.order ?? request?.order ?? request?.data ?? request;

      if (orderData) {
        let listItems = [];
        if (Array.isArray(orderData.items)) {
          listItems = orderData.items;
        } else if (typeof orderData.listItems === "string") {
          listItems = JSON.parse(orderData.listItems || "[]");
        } else if (Array.isArray(orderData.listItems)) {
          listItems = orderData.listItems;
        }

        let deliveryAddress: DeliveryAddress;
        const rawAddress = orderData.delivery?.address ?? orderData.deliveryAddress;

        if (typeof rawAddress === "string") {
          try {
            deliveryAddress = JSON.parse(rawAddress);
          } catch (error) {
            deliveryAddress = { street: "", number: "", neighborhood: "", city: "", state: "", zipCode: "", complement: "" };
          }
        } else {
          deliveryAddress = (rawAddress as DeliveryAddress) || { street: "", number: "", neighborhood: "", city: "", state: "", zipCode: "", complement: "" };
        }

        const user = orderData.customer ?? orderData.user ?? {};

        setOrder({
          ...orderData,
          id: orderData.id ?? orderData.mainOrderId,
          listItems,
          deliveryAddress,
          user,
          deliveryTo: orderData.delivery?.to ?? orderData.deliveryTo,
          deliverySchedule: orderData.delivery?.schedule ?? orderData.deliverySchedule,
          deliveryStatus: orderData.delivery?.status ?? orderData.deliveryStatus,
          deliveryPrice: orderData.deliveryTotal ?? orderData.delivery?.price ?? orderData.deliveryPrice,
          productsData: orderData.products ?? orderData.productsData,
        });
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes do pedido", error);
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryPriceLabel = () => {
    if (!order?.deliveryPrice && order?.deliveryPrice !== 0) return "N/A";
    if (order?.deliveryPrice === "Não informado" || order?.deliveryPrice === "Gratuita")
      return order?.deliveryPrice;
    return "R$ " + order?.deliveryPrice;
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return "N/A";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    if (cleaned.length === 11) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    return phone;
  };

  useEffect(() => {
    getOrderDetails();
  }, [id]);

  const formatCEP = (cep: string) => {
    if (!cep) return "N/A";
    const cleaned = cep.replace(/\D/g, "");
    return cleaned.length === 8 ? `${cleaned.slice(0, 5)}-${cleaned.slice(5)}` : cep;
  };

  function getExtenseData(data_informada = "") {
    if (!!data_informada) {
      let monthes = ["", "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
      var day_informado = data_informada.split("-")[2];
      var month_informado = data_informada.split("-")[1];
      var year_informado = data_informada.split("-")[0];
      return day_informado.split("T")[0] + " de " + monthes[parseInt(month_informado)] + " de " + year_informado;
    }
    return "";
  }

  const deliveryStatusMap: Record<string, string> = {
    paid: "Em separação", pending: "Pendente", processing: "Em separação", sent: "Enviado",
    transiting: "Em trânsito", received: "Entregue", returned: "Retornado", canceled: "Cancelado",
    waitingWithdrawl: "Aguardando retirada", collect: "Chegando para recolher", complete: "Concluído",
    failed: "Pagamento não aprovado", refunded: "Reembolsado", preparing: "Preparando pedido",
  };

  const paymentMethodMap: Record<string, string> = {
    credit_card: "Cartão de Crédito", pix: "PIX", boleto: "Boleto Bancário",
  };

  const paymentStatusMap: Record<string, string> = {
    paid: "Pago", approved: "Pago", pending: "Pendente", processing: "Processando",
    failed: "Falhou", canceled: "Cancelado", refunded: "Reembolsado",
  };

  const deliveryToMap: Record<string, string> = {
    reception: "Entregar na portaria", door: "Deixar na porta",
    inperson: "Estarei para receber", for_me: "Estarei para receber",
  };

  const getPaymentInfo = () => {
    const paymentMethod = order?.payment?.method || order?.metadata?.payment_method || order?.metadata?.transaction_type;
    const methodLabel = paymentMethodMap[paymentMethod || ""] || paymentMethod || "Não Informado";
    const isPaid = !!order?.metadata?.paid_at || order?.payment?.status === "paid" || order?.metadata?.payment_status === "paid" || order?.metadata?.payment_status === "approved" || order?.status === 1;
    const statusLabel = isPaid ? "Pago" : (paymentStatusMap[order?.payment?.status || ""] || paymentStatusMap[order?.metadata?.payment_status || ""] || "Pendente");
    const isCreditCard = paymentMethod === "credit_card";
    const installments = order?.payment?.installments || order?.metadata?.installments;
    const splits = order?.metadata?.split || order?.metadata?.splits || [];
    return { methodLabel, isPaid, statusLabel, isCreditCard, installments, splits };
  };

  return (
    <Template header={{ template: "admin", position: "solid" }}>
      <section>
        <div className="container-medium pt-8">
          <Breadcrumbs
            links={[
              { url: "/admin", name: "Admin" },
              { url: "/admin/pedidos", name: "Pedidos" },
              { url: `/admin/pedidos/${id}`, name: `#${id}` },
            ]}
          />
        </div>
      </section>

      <section>
        <div className="container-medium py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-title font-bold text-3xl text-zinc-900">
              Pedido #{id}
            </h1>
            {order && (
              <span className="text-2xl font-bold text-zinc-900">
                {order?.total ? "R$ " + moneyFormat(order?.total) : ""}
              </span>
            )}
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-400"></div>
              <span className="ml-3 text-zinc-500">Carregando...</span>
            </div>
          ) : order ? (
            <div className="grid gap-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                    Dados do Cliente
                  </h3>
                  <div className="grid gap-0 text-sm">
                    <div className="grid grid-cols-[8rem_1fr] py-2.5 px-3 bg-zinc-50 rounded">
                      <span className="text-zinc-500">Nome</span>
                      <span className="text-zinc-900">{order.user?.name || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-[8rem_1fr] py-2.5 px-3">
                      <span className="text-zinc-500">E-mail</span>
                      <span className="text-zinc-900">{order.user?.email || "N/A"}</span>
                    </div>
                    <div className="grid grid-cols-[8rem_1fr] py-2.5 px-3 bg-zinc-50 rounded">
                      <span className="text-zinc-500">Telefone</span>
                      <span className="text-zinc-900">
                        {formatPhoneNumber(order.user?.details ? JSON.parse(order.user?.details).phone || "" : "")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                    Pagamento
                  </h3>
                  {(() => {
                    const { methodLabel, isPaid, statusLabel, isCreditCard, installments, splits } = getPaymentInfo();
                    return (
                      <div className="grid gap-0 text-sm">
                        <div className="grid grid-cols-[8rem_1fr] py-2.5 px-3 bg-zinc-50 rounded">
                          <span className="text-zinc-500">Método</span>
                          <span className="text-zinc-900">
                            {methodLabel}{isCreditCard && installments ? ` em ${installments}x` : ""}
                          </span>
                        </div>
                        <div className="grid grid-cols-[8rem_1fr] py-2.5 px-3">
                          <span className="text-zinc-500">Status</span>
                          <span className={isPaid ? "text-green-600 font-medium" : "text-amber-600 font-medium"}>
                            {statusLabel}
                          </span>
                        </div>
                        {splits.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-dashed px-3">
                            <p className="text-zinc-500 mb-2">Divisão do pagamento:</p>
                            {splits.map((s: any, idx: number) => (
                              <p key={idx} className="py-1">
                                <span className={s.recipient?.type === "company" ? "text-blue-600" : "text-green-600"}>
                                  {s.recipient?.name || "N/A"}
                                </span>
                                : R$ {((s.amount || 0) / 100).toFixed(2)}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {order.partnerName && (
                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                    Parceiro
                  </h3>
                  <div className="grid gap-0 text-sm">
                    <div className="grid grid-cols-[8rem_1fr] py-2.5 px-3 bg-zinc-50 rounded">
                      <span className="text-zinc-500">Nome</span>
                      <span className="text-zinc-900">{order.partnerName}</span>
                    </div>
                    {order.partnerEmail && (
                      <div className="grid grid-cols-[8rem_1fr] py-2.5 px-3">
                        <span className="text-zinc-500">E-mail</span>
                        <span className="text-zinc-900">{order.partnerEmail}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="bg-white border rounded-xl p-6">
                <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                  Entrega ({getDeliveryPriceLabel()})
                </h3>
                <div className="grid gap-0 text-sm">
                  <div className="grid grid-cols-[8rem_1fr] py-2.5 px-3 bg-zinc-50 rounded">
                    <span className="text-zinc-500">Tipo</span>
                    <span className="text-zinc-900">
                      {deliveryToMap[order.deliveryTo] || deliveryToMap[order.delivery?.to || ""] || order.deliveryTo || order.delivery?.to || "N/A"}
                    </span>
                  </div>
                  <div className="grid grid-cols-[8rem_1fr] py-2.5 px-3">
                    <span className="text-zinc-500">Agendamento</span>
                    <span className="text-zinc-900">
                      {order.delivery?.schedule?.date
                        ? `${order.delivery.schedule.date} - ${order.delivery.schedule.period} (${order.delivery.schedule.time})`
                        : order.deliverySchedule || "N/A"}
                    </span>
                  </div>
                  <div className="grid grid-cols-[8rem_1fr] py-2.5 px-3 bg-zinc-50 rounded">
                    <span className="text-zinc-500">Endereço</span>
                    <span className="text-zinc-900">
                      {typeof order.deliveryAddress !== "string" && order.deliveryAddress?.street
                        ? `${order.deliveryAddress.street}, ${order.deliveryAddress.number} - ${order.deliveryAddress.neighborhood}`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="grid grid-cols-[8rem_1fr] py-2.5 px-3">
                    <span className="text-zinc-500">CEP</span>
                    <span className="text-zinc-900">
                      {typeof order.deliveryAddress !== "string" && order.deliveryAddress?.zipCode
                        ? formatCEP(order.deliveryAddress.zipCode)
                        : "N/A"}
                    </span>
                  </div>
                  <div className="grid grid-cols-[8rem_1fr] py-2.5 px-3 bg-zinc-50 rounded">
                    <span className="text-zinc-500">Cidade/UF</span>
                    <span className="text-zinc-900">
                      {typeof order.deliveryAddress !== "string"
                        ? `${order.deliveryAddress?.city || "N/A"} / ${order.deliveryAddress?.state || "N/A"}`
                        : "N/A"}
                    </span>
                  </div>
                  <div className="grid grid-cols-[8rem_1fr] py-2.5 px-3">
                    <span className="text-zinc-500">Status</span>
                    <span className="text-zinc-900 font-medium">
                      {deliveryStatusMap[order.deliveryStatus as keyof typeof deliveryStatusMap] || order.deliveryStatus || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {order.productsData && order.productsData.length > 0 && (
                <div className="bg-white border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-zinc-900 mb-4">
                    Produtos
                  </h3>
                  <div className="grid gap-4">
                    {order.productsData.map((product) => (
                      <div key={product.id}>
                        <p className="font-medium text-zinc-900 mb-2">{product.title}</p>
                        <div className="grid gap-3 grid-cols-6">
                          {Array.isArray(product.gallery) && product.gallery.length > 0 ? (
                            product.gallery
                              .filter((item: GalleryItem) => !!item.base_url)
                              .map((item: GalleryItem, key: number) => (
                                <div key={key} className="rounded-lg bg-zinc-100 overflow-hidden aspect-square">
                                  <img
                                    src={getImage(item, "thumb")}
                                    className="object-contain h-full w-full"
                                    alt={`${product.title} - ${key + 1}`}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/placeholder.jpg";
                                    }}
                                    width={150}
                                    height={150}
                                  />
                                </div>
                              ))
                          ) : (
                            <p className="text-sm text-zinc-400">Imagens não disponíveis</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border rounded-xl p-12 text-center">
              <Icon icon="fa-inbox" type="far" className="text-3xl text-zinc-300 mb-2" />
              <p className="text-zinc-500">Pedido não encontrado</p>
            </div>
          )}
        </div>
      </section>
    </Template>
  );
}
