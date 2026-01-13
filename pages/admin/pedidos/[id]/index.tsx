import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import Api from "@/src/services/api";
import { moneyFormat } from "@/src/helper";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Img from "@/src/components/utils/ImgBase";
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
  metadata?: {
    payment_method: string;
    installments: string;
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

      // Nova estrutura: { order: { ... } } ou formato antigo
      const orderData = request?.data?.order ?? request?.order ?? request?.data ?? request;

      if (orderData) {
        // Lista de itens pode vir como array ou string JSON
        let listItems = [];
        if (Array.isArray(orderData.items)) {
          listItems = orderData.items;
        } else if (typeof orderData.listItems === 'string') {
          listItems = JSON.parse(orderData.listItems || "[]");
        } else if (Array.isArray(orderData.listItems)) {
          listItems = orderData.listItems;
        }

        // Endereço de entrega pode vir em delivery.address ou deliveryAddress
        let deliveryAddress: DeliveryAddress;
        const rawAddress = orderData.delivery?.address ?? orderData.deliveryAddress;

        if (typeof rawAddress === 'string') {
          try {
            deliveryAddress = JSON.parse(rawAddress);
          } catch (error) {
            deliveryAddress = {
              street: '',
              number: '',
              neighborhood: '',
              city: '',
              state: '',
              zipCode: '',
              complement: ''
            };
          }
        } else {
          deliveryAddress = rawAddress as DeliveryAddress || {
            street: '',
            number: '',
            neighborhood: '',
            city: '',
            state: '',
            zipCode: '',
            complement: ''
          };
        }

        // Mapeia cliente para formato esperado
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
      console.error("🚨 Erro ao buscar detalhes do pedido", error);
    } finally {
      setLoading(false);
    }
  };

  const getDeliveryPriceLabel = (deliveryPrice: number | string) => {
    if (order?.deliveryPrice === "Não informado" || order?.deliveryPrice === "Gratuita")
      return order?.deliveryPrice
        
      return "R$" + order?.deliveryPrice;
  };

  const formatPhoneNumber = (phone: string) => {
    if (!phone) return 'N/A';
  
    const cleaned = phone.replace(/\D/g, '');
  
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11) {
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    } else {
      return phone;
    }
  };

  useEffect(() => {
    getOrderDetails();
  }, [id]);

  const formatCEP = (cep: string) => {
    if (!cep) return 'N/A';
  
    const cleaned = cep.replace(/\D/g, '');
  
    return cleaned.length === 8 ? `${cleaned.slice(0, 5)}-${cleaned.slice(5)}` : cep;
  };

  const deliveryStatusMap: Record<string, string> = {
    paid: "� Em separação",
    pending: "⌛ Aguardando pagamento",
    processing: "👍 Em separação",
    sent: "📦 Enviado",
    transiting: "🚚 Em trânsito",
    received: "☑️ Entregue",
    returned: "🔄 Retornado",
    canceled: "❌ Cancelado",
    waitingWithdrawl: "⏱️ Aguardando retirada",
    collect: "🚚 Chegando para recolher",
    complete: "✅ Concluído",
    failed: "❌ Pagamento não aprovado",
    refunded: "💰 Reembolsado",
    preparing: "📦 Preparando pedido",
  };

  function getExtenseData(data_informada = "", pos = "") {
    if (!!data_informada) {
      let monthes = new Array(
        "",
        "Janeiro",
        "Fevereiro",
        "Março",
        "Abril",
        "Maio",
        "Junho",
        "Julho",
        "Agosto",
        "Setembro",
        "Outubro",
        "Novembro",
        "Dezembro"
      );
      let semana = new Array(
        "Domingo",
        "Segunda-feira",
        "Terça-feira",
        "Quarta-feira",
        "Quinta-feira",
        "Sexta-feira",
        "Sábado"
      );
  
      var day_informado = data_informada.split("-")[2];
      var month_informado = data_informada.split("-")[1];
      var year_informado = data_informada.split("-")[0];
  
      var data =
        day_informado.split("T")[0] +
        " de " +
        monthes[parseInt(month_informado)] +
        " de " +
        year_informado;
  
      return pos == "m"
        ? parseInt(month_informado)
        : pos == "d"
        ? day_informado.split("T")[0]
        : pos == "Y"
        ? year_informado
        : data.split("T")[0];
    }
  
    return "";
  }
  
  return (
    <Template
      header={{
        template: "admin",
        position: "solid",
      }}
    >
      <section>
        <div className="container-medium pt-12">
          <div className="flex">
            <Breadcrumbs
              links={[
                { url: "/admin", name: "Admin" },
                { url: "/admin/pedidos", name: "Pedidos" },
                { url: `/admin/pedidos/${id}`, name: `#${id}` },
              ]}
            />
          </div>
          <div className="flex mt-10 items-center">
            <div className="w-full">
              <div className="font-title font-bold text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900">
                Pedido #{id}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pt-6">
        <div className="container-medium pb-12">
          {loading ? (
            <div className="text-center text-lg">Carregando...</div>
          ) : order ? (
            <div className="bg-white shadow-md rounded-lg p-6">
              <p className="text-xl font-bold mb-4">Detalhes do Pedido</p>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">
                  Valor: {order?.total ? 'R$ ' + moneyFormat(order?.total) : 'Não informado'}
                </h2>
              </div>
  
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Dados do Cliente</h2>
                <p>{order.user?.name}</p>
                <p>{order.user?.email}</p>
                <p>{formatPhoneNumber(order.user?.details ? JSON.parse(order.user?.details).phone || '' : '')}</p>
              </div>
  
              {order.partnerName && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-3">Parceiro</h2>
                  <p>{order.partnerName}</p>
                  <p>{order.partnerEmail}</p>
                </div>
              )}

              {order.productsData && order.productsData.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-3">Produtos</h2>
                  {order.productsData.map((product) => (
                    <div key={product.id} className="mb-4">
                      <div className="form-group">
                        <label className="text-zinc-900 font-bold">{product.title}</label>
                        <div className="grid gap-4 grid-cols-5 mt-4">
                          {Array.isArray(product.gallery) && product.gallery.length > 0 ? (
                            product.gallery
                              .filter((item: GalleryItem) => !!item.base_url)
                              .map((item: GalleryItem, key: number) => (
                                <div key={key} className="w-full group">
                                  <div className="relative rounded-md bg-zinc-100 overflow-hidden aspect-square">
                                    <img
                                      src={getImage(item, "thumb")}
                                      className="absolute object-contain h-full inset-0 w-full"
                                      alt={`${product.title} - Imagem ${key + 1}`}
                                      onError={(e) => {
                                        (e.target as HTMLImageElement).src = '/placeholder.jpg';
                                      }}
                                      width={300}
                                      height={300}
                                    />
                                  </div>
                                </div>
                              ))
                          ) : (
                            <p>Imagens não disponíveis</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Pagamento</h2>
                <p>{order.metadata?.payment_method || 'Não Informado'}</p>
                <p>
                  {order.metadata?.installments ? `${order.metadata.installments}x` : 'Não Informado'}
                </p>
              </div>

              <div className="mb-6">
              <h2 className="text-lg font-semibold mb-3">Entrega ({getDeliveryPriceLabel((order.deliveryPrice || order.delivery?.price) as number)})</h2>
                <p>{order.deliveryTo || order.delivery?.to}, {order.delivery?.schedule?.date ? `${order.delivery.schedule.date} - ${order.delivery.schedule.period} (${order.delivery.schedule.time})` : order.deliverySchedule}</p>
                <p>{(typeof order.deliveryAddress !== 'string' && order.deliveryAddress?.street) || 'N/A'}, {(typeof order.deliveryAddress !== 'string' && order.deliveryAddress?.number) || 'N/A'}, {(typeof order.deliveryAddress !== 'string' && order.deliveryAddress?.neighborhood) || 'N/A'}</p>
                <p>CEP: {(typeof order.deliveryAddress !== 'string' && order.deliveryAddress?.zipCode) ? formatCEP(order.deliveryAddress.zipCode) : 'N/A'}</p>
                <p>Complemento: {(typeof order.deliveryAddress !== 'string' && order.deliveryAddress?.complement) || 'N/A'}</p>
                <p>{(typeof order.deliveryAddress !== 'string' && order.deliveryAddress?.city) || 'N/A'} | {(typeof order.deliveryAddress !== 'string' && order.deliveryAddress?.state) || 'N/A'}</p>
              </div>

              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-3">Status de Processo</h2>
                <p>
                  {deliveryStatusMap[order.deliveryStatus as keyof typeof deliveryStatusMap] || 
                   `Status: ${order.deliveryStatus}`}
                </p>
              </div>
              
            </div>
          ) : (
            <div className="text-center text-lg text-red-500">Pedido não encontrado.</div>
          )}
        </div>
      </section>
    </Template>
  );
}  