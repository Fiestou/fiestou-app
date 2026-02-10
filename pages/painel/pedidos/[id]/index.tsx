import Link from "next/link";
import Api from "@/src/services/api";
import { OrderType } from "@/src/models/order";
import {
  getExtenseData,
  moneyFormat,
  getOrderDeliveryInfo,
  getImage,
} from "@/src/helper";
import { Select } from "@/src/components/ui/form";
import { useCallback, useState, useEffect } from "react";
import { useRouter } from "next/router";
import { deliveryTypes } from "@/src/models/delivery";
import { OrderStatusBadge } from "@/src/components/order";
import {
  ArrowLeft,
  Send,
  Truck,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  User,
  Package,
  ShoppingBag,
} from "lucide-react";
import { PainelLayout, PageHeader, Badge } from "@/src/components/painel";

export default function Pedido() {
  const api = new Api();
  const router = useRouter();

  const [order, setOrder] = useState({} as OrderType);
  const [productsData, setProductsData] = useState<any[]>([]);
  const [form, setForm] = useState({ loading: false });
  const [deliveryStatus, setDeliveryStatus] = useState<string>("pending");

  useEffect(() => {
    if (!router.isReady) return;
    const idRaw = router.query.id ?? router.query[0];
    const id = Number(idRaw);
    if (!id) return;

    (async () => {
      const request: any = await api.bridge({
        method: "post",
        url: "orders/get",
        data: { id },
      });

      const orderData = request?.data?.data ?? request?.data ?? request;

      if (orderData) {
        let listItems = [];
        if (Array.isArray(orderData.items)) {
          listItems = orderData.items;
        } else if (typeof orderData.listItems === "string") {
          listItems = JSON.parse(orderData.listItems || "[]");
        } else if (Array.isArray(orderData.listItems)) {
          listItems = orderData.listItems;
        }

        const products = orderData.products ?? orderData.productsData ?? [];
        setProductsData(products);

        let parsedMetadata = orderData.metadata;
        if (typeof parsedMetadata === "string") {
          try {
            parsedMetadata = JSON.parse(parsedMetadata);
          } catch (e) {
            parsedMetadata = {};
          }
        }

        const mergedMetadata = {
          ...(parsedMetadata ?? {}),
          ...(orderData.payment ?? {}),
        };

        const normalizedOrder: any = {
          ...orderData,
          id: orderData.id ?? orderData.mainOrderId,
          user: orderData.customer ?? orderData.user,
          products: products,
          listItems: listItems,
          delivery: {
            to: orderData.delivery?.to ?? orderData.deliveryTo ?? orderData.delivery_to,
            schedule: orderData.delivery?.schedule ?? orderData.deliverySchedule,
            price: orderData.delivery?.price ?? orderData.deliveryTotal ?? orderData.deliveryPrice ?? orderData.delivery_price,
            address: orderData.delivery?.address ?? orderData.deliveryAddress ?? orderData.delivery_address,
            status: orderData.delivery?.status ?? orderData.deliveryStatus ?? orderData.delivery_status,
          },
          delivery_status: orderData.deliveryStatus ?? orderData.delivery_status,
          total: orderData.total,
          metadata: mergedMetadata,
          createdAt: orderData.createdAt ?? orderData.created_at,
          freights_orders_price: orderData.freights_orders_price ?? [],
        };

        setOrder(normalizedOrder as OrderType);
        setDeliveryStatus(normalizedOrder.delivery_status ?? "pending");
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.isReady, router.query]);

  const orderByStore = useCallback(() => {
    let storeMap = new Map<number, any>();

    order.products?.forEach((productItem: any) => {
      const listItem = order.listItems?.find((item: any) => item.product?.id === productItem.id);
      const productItemWithAttributes = order.products?.find((item: any) => item.id === productItem.id);
      const productWithGallery = productsData.find((p: any) => p.id === productItem.id);
      const additionalExtras: any[] = [];

      if (listItem?.attributes) {
        listItem.attributes.forEach((attribute: any) => {
          let attributeTitle = productItemWithAttributes?.attributes ?? [];
          if (typeof attributeTitle === "string") {
            try {
              attributeTitle = JSON.parse(attributeTitle);
            } catch (e) {
              attributeTitle = [];
            }
          }

          attribute.variations.forEach((variation: any) => {
            additionalExtras.push({
              title: attributeTitle.find((item: any) => item.id === attribute.id)?.title,
              quantity: variation.quantity,
              price: typeof variation.price === "string" ? parseFloat(variation.price.replace(",", ".")) : Number(variation.price),
            });
          });
        });
      }

      const productWithFullData = {
        ...productItem,
        gallery: productWithGallery?.gallery || productItem.gallery || [],
        additionalExtra: additionalExtras,
      };

      if (storeMap.has(productItem.store.id)) {
        return storeMap.get(productItem.store.id).push(productWithFullData);
      }
      return storeMap.set(productItem.store.id, [productWithFullData]);
    });

    return storeMap;
  }, [order, productsData]);

  const notifyDelivery = async (e: any) => {
    e.preventDefault();
    setForm({ loading: true });

    const request: any = await api.bridge({
      method: "post",
      url: "orders/update-delivery-status",
      data: { id: order.id, delivery_status: deliveryStatus },
    });

    if (request?.response) {
      const returnedOrder = request?.data?.data ?? request?.data ?? null;
      if (returnedOrder && returnedOrder.id) {
        setOrder(returnedOrder as any);
      } else {
        setOrder({ ...order, delivery_status: deliveryStatus } as any);
      }
      alert("Status atualizado e notificacao enviada ao cliente!");
    } else {
      alert(request?.message || "Erro ao atualizar status do pedido.");
    }

    setForm({ loading: false });
  };

  const currentDeliveryType = deliveryTypes.find((d) => d.value === deliveryStatus);

  return (
    <PainelLayout>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/painel/pedidos"
          className="p-2 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-600"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold text-zinc-900">Pedido #{order.id}</h1>
          <OrderStatusBadge
            status={order.status}
            metadataStatus={order.metadata?.status}
            paymentStatus={order.metadata?.payment_status}
            paidAt={order.metadata?.paid_at}
          />
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <div className="flex items-center gap-2 mb-1">
              <ShoppingBag size={18} className="text-zinc-400" />
              <h2 className="text-lg font-semibold text-zinc-900">Detalhes do pedido</h2>
            </div>
            <p className="text-sm text-zinc-500 mb-6">
              Realizado em: {getExtenseData(order.createdAt)}
            </p>

            {order && order.products && Array.isArray(order.products) ? (
              Array.from(orderByStore().entries()).map(([storeId, items]: [number, any[]]) => {
                const subtotal = items.reduce(
                  (sum: number, item: any) =>
                    sum +
                    Number(item.price) +
                    item.additionalExtra.reduce((s: number, extra: any) => s + Number(extra.price), 0),
                  0
                );
                const frete: string | number =
                  order.freights_orders_price?.find((freight: any) => freight.store_id == storeId)?.price || 0;

                return (
                  <div key={storeId} className="mb-6 last:mb-0">
                    <div className="font-semibold text-zinc-900 text-base mb-3 flex items-center gap-2">
                      <Package size={16} className="text-yellow-500" />
                      {items[0]?.store?.companyName}
                    </div>

                    {items.map((item) => (
                      <div key={item.id} className="border-b border-zinc-100 py-4 last:border-0">
                        <div className="flex justify-between items-start">
                          <h5 className="font-medium text-zinc-900">1 x {item.title}</h5>
                          <span className="font-semibold text-zinc-900 whitespace-nowrap ml-4">
                            R$ {moneyFormat(item.price)}
                          </span>
                        </div>

                        {Array.isArray(item.gallery) && item.gallery.length > 0 && (
                          <div className="flex gap-2 mt-3">
                            {item.gallery
                              .filter((img: any) => !!img.base_url)
                              .slice(0, 4)
                              .map((img: any, imgKey: number) => (
                                <div key={imgKey} className="w-14 h-14 rounded-lg bg-zinc-100 overflow-hidden">
                                  <img
                                    src={getImage(img, "thumb")}
                                    className="w-full h-full object-cover"
                                    alt={`${item.title} - ${imgKey + 1}`}
                                    onError={(e) => {
                                      (e.target as HTMLImageElement).src = "/placeholder.jpg";
                                    }}
                                  />
                                </div>
                              ))}
                          </div>
                        )}

                        {item.additionalExtra?.map((extra: any, extraKey: number) => (
                          <div key={extraKey} className="flex justify-between items-center mt-2 pl-4">
                            <span className="text-sm text-zinc-500">
                              {extra.quantity} x {extra.title}
                            </span>
                            <span className="text-sm text-zinc-500 whitespace-nowrap">
                              R$ {moneyFormat(extra.price)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ))}

                    <div className="border-t border-zinc-100 pt-3 mt-2 space-y-1.5">
                      <div className="flex justify-between text-sm text-zinc-600">
                        <span>Frete</span>
                        <span>R$ {moneyFormat(frete)}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-zinc-900">
                        <span>Subtotal</span>
                        <span>R$ {moneyFormat(subtotal + Number(frete))}</span>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-zinc-500 text-sm">Nenhum item encontrado neste pedido</p>
            )}

            <div className="border-t-2 border-zinc-200 pt-4 mt-4 flex justify-between items-center">
              <span className="text-xl font-bold text-zinc-900">Total</span>
              <span className="text-xl font-bold text-zinc-900">
                R$ {moneyFormat(order.total)}
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-zinc-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <User size={16} className="text-zinc-400" />
              <h3 className="font-semibold text-zinc-900">Dados do cliente</h3>
            </div>
            <div className="text-sm text-zinc-600 space-y-1">
              <div>{(order as any).user?.name}</div>
              <div>{(order as any).user?.email}</div>
              <div>{(order as any).user?.phone}</div>
              <div>{(order as any).user?.cpf}</div>
            </div>
          </div>

          {!!order.metadata && (
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <CreditCard size={16} className="text-zinc-400" />
                <h3 className="font-semibold text-zinc-900">Pagamento</h3>
              </div>
              <div className="text-sm">
                {(() => {
                  const paymentMethod = order.metadata?.payment_method || order.metadata?.transaction_type;
                  const isPix = paymentMethod === "pix";
                  const isBoleto = paymentMethod === "boleto";
                  const isCreditCard = paymentMethod === "credit_card" || (!isPix && !isBoleto);
                  const isPaid =
                    !!order.metadata?.paid_at ||
                    order.metadata?.payment_status === "paid" ||
                    order.metadata?.payment_status === "approved";

                  return (
                    <>
                      <div className="text-zinc-700 font-medium">
                        {isPix ? "PIX" : isBoleto ? "Boleto Bancario" : "Cartao de credito"}
                        {isCreditCard && order.metadata?.installments && (
                          <span> em {order.metadata.installments}x</span>
                        )}
                      </div>
                      <div className="mt-1.5">
                        {isPaid ? (
                          <Badge variant="success" dot>Pago</Badge>
                        ) : (
                          <Badge variant="warning" dot>Aguardando pagamento</Badge>
                        )}
                      </div>
                    </>
                  );
                })()}
                {(() => {
                  const splits = order.metadata?.split || order.metadata?.splits || [];
                  const storeRecipients = splits.filter((s: any) => s.recipient?.type !== "company");
                  if (storeRecipients.length > 0) {
                    return (
                      <div className="text-xs text-zinc-400 mt-3 pt-3 border-t border-zinc-100">
                        <strong className="text-zinc-500">
                          Recebedor{storeRecipients.length > 1 ? "es" : ""}:
                        </strong>
                        {storeRecipients.map((s: any, idx: number) => (
                          <div key={idx} className="mt-1">
                            {s.recipient?.name || "N/A"}{" "}
                            <span className="text-zinc-300">({s.recipient?.id || "-"})</span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </div>
          )}

          <div className="bg-white rounded-xl border border-zinc-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Truck size={16} className="text-zinc-400" />
                <h3 className="font-semibold text-zinc-900">Entrega</h3>
              </div>
              {order?.delivery?.price ? (
                <Badge variant="neutral">R$ {moneyFormat(order.delivery.price)}</Badge>
              ) : (
                <Badge variant="success">Gratuita</Badge>
              )}
            </div>

            {(() => {
              const deliveryInfo = getOrderDeliveryInfo(order);
              return (
                <div className="text-sm space-y-3">
                  {deliveryInfo?.to && (
                    <div className="flex items-center gap-2 text-zinc-600">
                      <Truck size={14} className="text-zinc-400" />
                      {deliveryInfo.to}
                    </div>
                  )}
                  {(deliveryInfo?.date || deliveryInfo?.time) && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      {deliveryInfo?.date && (
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-amber-600" />
                          <span className="font-medium text-amber-800">{deliveryInfo.date}</span>
                        </div>
                      )}
                      {deliveryInfo?.time && (
                        <div className="flex items-center gap-2 mt-1">
                          <Clock size={14} className="text-amber-600" />
                          <span className="text-amber-700">{deliveryInfo.time}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="mt-3 pt-3 border-t border-dashed border-zinc-200">
              <div className="flex items-center gap-1.5 text-xs text-zinc-400 mb-1.5">
                <MapPin size={12} />
                Endereco de entrega
              </div>
              <div className="text-sm text-zinc-600 space-y-0.5">
                <div>
                  {order?.delivery?.address?.street}, {order?.delivery?.address?.number},{" "}
                  {order?.delivery?.address?.neighborhood}
                </div>
                <div>
                  CEP: {order?.delivery?.address?.zipCode}
                  {order?.delivery?.address?.complement && (
                    <> - {order?.delivery?.address?.complement}</>
                  )}
                </div>
                <div>
                  {order?.delivery?.address?.city} | {order?.delivery?.address?.state}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 p-5">
            <h3 className="font-semibold text-zinc-900 mb-3">Status de processo</h3>
            <form onSubmit={notifyDelivery} className="space-y-3">
              <Select
                name="status_entrega"
                onChange={(e: any) => setDeliveryStatus(e.target.value)}
                value={deliveryStatus ?? "pending"}
                options={deliveryTypes}
              />
              {currentDeliveryType && (
                <p className="text-xs text-zinc-400">{currentDeliveryType.description}</p>
              )}
              <button
                type="submit"
                disabled={form.loading}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-medium py-2.5 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
              >
                <Send size={14} />
                {form.loading ? "Enviando..." : "Atualizar e notificar"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </PainelLayout>
  );
}
