import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import Api from "@/src/services/api";
import { fetchOrderById } from "@/src/services/order";
import { OrderType } from "@/src/models/order";
import { RateType } from "@/src/models/product";
import { findDates } from "@/src/helper";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import { useEffect, useRef, useState } from "react";
import Pagarme from "@/src/services/pagarme";
import {
  OrderStatusBadge,
  DeliveryTimeline,
  OrderItemCard,
  OrderSummary,
  RatingModal,
  CancelOrderModal,
} from "@/src/components/order";

const formInitial = {
  edit: "",
  loading: false,
};

// Helper para agrupar itens por loja
interface StoreGroup {
  storeId: number | string;
  storeName: string;
  storeSlug?: string;
  items: any[];
}

function groupItemsByStore(items: any[]): StoreGroup[] {
  const groups: Record<string, StoreGroup> = {};

  items.forEach((item) => {
    const store = item?.metadata?.product?.store;
    const storeId = store?.id || store?.slug || 'unknown';
    const storeName = store?.title || store?.name || 'Loja';
    const storeSlug = store?.slug;

    if (!groups[storeId]) {
      groups[storeId] = {
        storeId,
        storeName,
        storeSlug,
        items: [],
      };
    }
    groups[storeId].items.push(item);
  });

  return Object.values(groups);
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
      orderId: parseInt(params.id),
      HeaderFooter,
      DataSeo,
      Scripts,
    },
  };
}

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

  const [cancel, setCancel] = useState(false);
  const [order, setOrder] = useState({} as OrderType);
  const [products, setProducts] = useState([] as Array<any>);

  const [rate, setRate] = useState({} as RateType);
  const handleRate = (value: any) => {
    setRate({ ...rate, ...value });
  };

  const [modalRating, setModalRating] = useState(false);
  const openRatingModal = (product: any) => {
    handleRate({ product: product });
    setModalRating(true);
  };

  const submitRate = async (e: React.FormEvent) => {
    e.preventDefault();
    handleForm({ loading: true });

    const handle = {
      ...rate,
      product: rate.product.id,
    };

    const request: any = await api.bridge({
      method: "post",
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
    await pagarme.cancelOrder(order);
  };

  const [resume, setResume] = useState({} as any);

  const getOrder = async () => {
    const fetchedOrder: OrderType | null =
      (await fetchOrderById(api, orderId)) ?? ({} as OrderType);

    if (!fetchedOrder?.id) {
      return;
    }

    // Produtos - merge items com products completos
    const productsWithFullData =
      fetchedOrder.items?.map((item: any) => {
        const fullProduct = fetchedOrder.products?.find(
          (p: any) => p.id === item.productId
        );

        return {
          ...item,
          metadata: {
            ...item.metadata,
            product: {
              ...item.metadata?.product,
              ...fullProduct,
            },
          },
        };
      }) || [];

    setProducts(productsWithFullData);

    // Datas do agendamento
    const dates: string[] = [];
    fetchedOrder.items?.forEach((item) => {
      const rawDetails = item.metadata?.raw_item?.details;
      if (rawDetails?.dateStart) dates.push(rawDetails.dateStart);
      if (rawDetails?.dateEnd) dates.push(rawDetails.dateEnd);
    });

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
          {/* Breadcrumbs */}
          <section>
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

          {/* Conteúdo principal */}
          <section>
            <div className="container-medium pb-12">
              <div className="grid md:flex align-top gap-10 md:gap-20">
                {/* Coluna esquerda - Timeline e itens */}
                <div className="w-full">
                  {/* Header do pedido */}
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
                      <OrderStatusBadge
                        status={order.status}
                        metadataStatus={order.metadata?.status}
                      />
                    </div>
                  </div>

                  {/* Timeline de entrega */}
                  {order?.metadata?.status !== "expired" && (
                    <div>
                      <DeliveryTimeline
                        deliveryStatus={order.delivery?.status || (order as any).delivery_status}
                        createdAt={order.createdAt}
                      />
                      <div className="py-10">
                        <hr />
                      </div>
                    </div>
                  )}

                  {/* Itens do pedido - Agrupados por loja */}
                  <div className="grid">
                    <h4 className="text-xl md:text-2xl text-zinc-800 pb-6">
                      Itens do pedido
                    </h4>
                    {groupItemsByStore(products || []).map((storeGroup, groupKey) => (
                      <div key={groupKey} className="mb-6">
                        {/* Header da loja - só mostra se tem mais de uma loja */}
                        {groupItemsByStore(products || []).length > 1 && (
                          <div className="bg-zinc-100 rounded-lg p-3 mb-4 flex items-center gap-2">
                            <Icon icon="fa-store" className="text-zinc-500" />
                            <span className="font-semibold text-zinc-800">
                              {storeGroup.storeSlug ? (
                                <Link
                                  href={`/${storeGroup.storeSlug}`}
                                  className="hover:underline hover:text-cyan-600"
                                >
                                  {storeGroup.storeName}
                                </Link>
                              ) : (
                                storeGroup.storeName
                              )}
                            </span>
                            <span className="text-sm text-zinc-500">
                              ({storeGroup.items.length} {storeGroup.items.length === 1 ? 'item' : 'itens'})
                            </span>
                          </div>
                        )}
                        {storeGroup.items.map((item: any, itemKey: number) => (
                          <OrderItemCard
                            key={itemKey}
                            item={item}
                            onRate={openRatingModal}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Coluna direita - Resumo */}
                <div className="w-full md:max-w-[28rem]">
                  <OrderSummary
                    order={order as any}
                    products={products}
                    resume={resume}
                  />

                  {order.status !== -2 && false && (
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

          {/* Modal de cancelamento */}
          <CancelOrderModal
            isOpen={cancel}
            onClose={() => setCancel(false)}
            onConfirm={submitCancel}
          />

          {/* Modal de avaliação */}
          <RatingModal
            isOpen={modalRating}
            onClose={() => setModalRating(false)}
            onSubmit={submitRate}
            product={rate.product}
            rate={rate.rate || 0}
            comment={rate.comment}
            onRateChange={(value) => handleRate({ rate: value })}
            onCommentChange={(value) => handleRate({ comment: value })}
            loading={form.loading}
            orderStatus={order.status}
            paymentUrl={order.metadata?.url}
          />
        </>
      ) : (
        /* Loading skeleton */
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
