import Link from "next/link";
import { GetServerSideProps } from "next";
import { toast } from "react-toastify";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import Api from "@/src/services/api";
import { getExtenseData, moneyFormat } from "@/src/helper";
import { OrderType } from "@/src/models/order";
import HelpCard from "@/src/components/common/HelpCard";
import { Button } from "@/src/components/ui/form";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import {
  buildCartItemsFromOrder,
  normalizeOrderEntity,
} from "@/src/services/order";
import { getOrderStatusPresentation } from "@/src/services/order-status";
import type { OrderStatusKey } from "@/src/services/order-status";
import { getCartFromCookies, saveCartToCookies } from "@/src/services/cart";

interface PedidosProps {
  orders: OrderType[];
  summary: OrdersSummary;
  pageInfo: PageInfo;
  filters: OrdersFilters;
  page: any;
  HeaderFooter: any;
}

type StatusFilter = "all" | OrderStatusKey;

interface OrdersFilters {
  q: string;
  status: StatusFilter;
  from: string;
  to: string;
}

interface OrdersSummary {
  paid: number;
  pending: number;
  processing: number;
  canceled: number;
  total: number;
}

interface PageInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  fromItem: number;
  toItem: number;
  hasPrev: boolean;
  hasNext: boolean;
}

const PAGE_SIZE = 8;

function asNumber(value: any): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asText(value: any): string {
  return String(value ?? "").trim();
}

function parseObject(value: any): Record<string, any> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {};
    } catch {
      return {};
    }
  }
  return typeof value === "object" && !Array.isArray(value) ? value : {};
}

function parseArray(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function formatDateToBr(value: any): string {
  const raw = asText(value);
  if (!raw) return "";

  const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    return `${isoMatch[3]}/${isoMatch[2]}/${isoMatch[1]}`;
  }

  const brMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (brMatch) {
    return `${brMatch[1]}/${brMatch[2]}/${brMatch[3]}`;
  }

  return raw;
}

function buildDateRangeLabel(start: any, end: any): string {
  const formattedStart = formatDateToBr(start);
  const formattedEnd = formatDateToBr(end);

  if (formattedStart && formattedEnd && formattedStart !== formattedEnd) {
    return `${formattedStart} a ${formattedEnd}`;
  }

  return formattedStart || formattedEnd || "";
}

function resolveOrderItems(order: any): any[] {
  const listItems = parseArray(order?.listItems);
  if (listItems.length) return listItems;

  return parseArray(order?.items);
}

function resolveOrderStores(order: any): string[] {
  const names: string[] = [];

  const pushName = (name: any) => {
    const normalized = asText(name);
    if (!normalized) return;
    if (!names.includes(normalized)) {
      names.push(normalized);
    }
  };

  if (Array.isArray(order?.stores)) {
    order.stores.forEach((store: any) => {
      pushName(store?.title);
      pushName(store?.companyName);
      pushName(store?.name);
    });
  }

  pushName(order?.store?.title);
  pushName(order?.store?.companyName);
  pushName(order?.store?.name);

  resolveOrderItems(order).forEach((item) => {
    const metadata = parseObject(item?.metadata);
    const rawItem = parseObject(metadata?.raw_item);
    const store =
      item?.product?.store ??
      metadata?.product?.store ??
      parseObject(rawItem?.product)?.store;

    pushName(store?.title);
    pushName(store?.companyName);
    pushName(store?.name);
  });

  return names;
}

function resolveItemNames(order: any): string[] {
  const items = resolveOrderItems(order);
  const names: string[] = [];

  items.forEach((item) => {
    const metadata = parseObject(item?.metadata);
    const rawItem = parseObject(metadata?.raw_item);
    const product = rawItem?.product ?? metadata?.product ?? item?.product;

    const name =
      asText(item?.name) ||
      asText(item?.title) ||
      asText(product?.title) ||
      asText(product?.name);

    if (name && !names.includes(name)) {
      names.push(name);
    }
  });

  return names;
}

function resolveItemsCount(order: any): number {
  const items = resolveOrderItems(order);
  if (!items.length) return 0;

  const totalUnits = items.reduce((sum, item) => {
    const quantity = Math.max(1, asNumber(item?.quantity));
    return sum + quantity;
  }, 0);

  return totalUnits > 0 ? totalUnits : items.length;
}

function resolveScheduleSummary(order: any): string {
  const schedule = order?.delivery?.schedule;

  if (typeof schedule === "string") {
    const plainSchedule = asText(schedule);
    if (plainSchedule) return plainSchedule;
  }

  const scheduleDate =
    typeof schedule === "object" && schedule ? asText(schedule?.date) : "";
  const scheduleWindow =
    typeof schedule === "object" && schedule
      ? [asText(schedule?.period), asText(schedule?.time)]
          .filter(Boolean)
          .join(" - ")
      : "";

  const metadataStart = asText(order?.metadata?.scheduleStart);
  const metadataEnd = asText(order?.metadata?.scheduleEnd);

  const itemDates: string[] = [];
  resolveOrderItems(order).forEach((item) => {
    const metadata = parseObject(item?.metadata);
    const rawDetails =
      parseObject(metadata?.raw_item)?.details ?? metadata?.details ?? {};
    const start = asText(rawDetails?.dateStart);
    const end = asText(rawDetails?.dateEnd);
    if (start) itemDates.push(start);
    if (end) itemDates.push(end);
  });

  itemDates.sort();
  const itemStart = itemDates[0] ?? "";
  const itemEnd = itemDates[itemDates.length - 1] ?? itemStart;

  const rangeLabel = buildDateRangeLabel(
    scheduleDate || metadataStart || itemStart,
    metadataEnd || itemEnd
  );

  return [rangeLabel, scheduleWindow].filter(Boolean).join(" • ");
}

function resolvePaymentMethodLabel(order: any): string {
  const method = asText(order?.metadata?.payment_method || order?.payment?.method).toLowerCase();

  if (method === "credit_card" || method === "cartao" || method === "cartão") {
    return "Cartão de crédito";
  }
  if (method === "pix") {
    return "Pix";
  }
  if (method === "boleto") {
    return "Boleto";
  }

  return "Não informado";
}

function isStatusFilter(value: any): value is StatusFilter {
  return (
    value === "all" ||
    value === "paid" ||
    value === "pending" ||
    value === "processing" ||
    value === "canceled"
  );
}

function buildOrderSearchText(order: any): string {
  const ids = [
    order?.id,
    order?.mainOrderId,
    ...(Array.isArray(order?.orderIds) ? order.orderIds : []),
  ]
    .filter(Boolean)
    .join(" ");

  const customer = [
    order?.customer?.name,
    order?.customer?.email,
    order?.user?.name,
    order?.user?.email,
  ]
    .filter(Boolean)
    .join(" ");

  const stores = Array.isArray(order?.stores)
    ? order.stores
        .map((store: any) =>
          [store?.title, store?.companyName, store?.slug].filter(Boolean).join(" ")
        )
        .join(" ")
    : "";

  const items = Array.isArray(order?.listItems)
    ? order.listItems
        .map((item: any) =>
          [
            item?.name,
            item?.title,
            item?.product?.title,
            item?.product?.name,
            item?.product?.slug,
          ]
            .filter(Boolean)
            .join(" ")
        )
        .join(" ")
    : "";

  return [
    ids,
    customer,
    stores,
    items,
    order?.statusText,
    order?.metadata?.payment_method,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function Pedidos({
  orders = [],
  summary = {
    paid: 0,
    pending: 0,
    processing: 0,
    canceled: 0,
    total: 0,
  },
  pageInfo = {
    page: 1,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
    fromItem: 0,
    toItem: 0,
    hasPrev: false,
    hasNext: false,
  },
  filters = {
    q: "",
    status: "all",
    from: "",
    to: "",
  },
  page = { help_list: [] },
  HeaderFooter = {},
}: PedidosProps) {
  const safeOrders = Array.isArray(orders) ? orders : [];
  const hasActiveFilters =
    !!filters.q || filters.status !== "all" || !!filters.from || !!filters.to;

  const metrics =
    summary ??
    safeOrders.reduce(
      (acc, order) => {
        const total = asNumber(order?.total);
        const status = getOrderStatusPresentation(order).key;

        if (status === "paid") acc.paid += 1;
        if (status === "pending") acc.pending += 1;
        if (status === "processing") acc.processing += 1;
        if (status === "canceled") acc.canceled += 1;

        acc.total += total;
        return acc;
      },
      {
        paid: 0,
        pending: 0,
        processing: 0,
        canceled: 0,
        total: 0,
      }
    );

  const buildPageHref = (targetPage: number): string => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.status !== "all") params.set("status", filters.status);
    if (filters.from) params.set("from", filters.from);
    if (filters.to) params.set("to", filters.to);
    if (targetPage > 1) params.set("page", String(targetPage));

    const query = params.toString();
    return query ? `/dashboard/pedidos?${query}` : "/dashboard/pedidos";
  };

  const handleRepeatOrder = (order: OrderType) => {
    const repeatResult = buildCartItemsFromOrder(order);

    if (!repeatResult.items.length) {
      toast.error("Não foi possível repetir este pedido.");
      return;
    }

    const currentCart = getCartFromCookies();
    const nextCart = currentCart.concat(repeatResult.items);
    saveCartToCookies(nextCart, "add");

    if (repeatResult.skipped > 0) {
      toast.info(
        `Alguns itens não puderam ser adicionados (${repeatResult.skipped}).`
      );
    }

    toast.success(`${repeatResult.items.length} item(ns) adicionados ao carrinho.`);
    window.location.href = "/carrinho";
  };

  return (
    <Template
      header={{
        template: "default",
        position: "solid",
        content: HeaderFooter,
      }}
    >
      <section>
        <div className="container-medium py-10 md:py-12">
          <div className="pb-4">
            <Breadcrumbs
              links={[
                { url: "/dashboard", name: "Dashboard" },
                { url: "/dashboard/pedidos", name: "Pedidos" },
              ]}
            />
          </div>

          <div className="flex items-start gap-4">
            <Link passHref href="/dashboard" className="pt-1">
              <Icon icon="fa-long-arrow-left" className="text-2xl text-zinc-900" />
            </Link>
            <div>
              <h1 className="font-title font-bold text-3xl md:text-4xl text-zinc-900">
                Meus pedidos
              </h1>
              <p className="text-sm md:text-base text-zinc-600 mt-2 max-w-2xl leading-relaxed">
                Veja o status, acompanhe prazos e retome ações importantes sem precisar abrir pedido por pedido.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section>
        <div className="container-medium pb-14">
          <div className="grid xl:grid-cols-[minmax(0,1fr),22rem] gap-8 xl:gap-10 items-start">
            <div className="w-full grid gap-5 md:gap-6">
              <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <h2 className="text-lg font-semibold text-zinc-900">Filtros</h2>
                  <span className="text-xs text-zinc-500">
                    {pageInfo.totalItems > 0
                      ? `${pageInfo.fromItem}-${pageInfo.toItem} de ${pageInfo.totalItems} pedido(s)`
                      : hasActiveFilters
                      ? "Nenhum pedido com esses filtros"
                      : "Sem pedidos"}
                  </span>
                </div>

                <form
                  method="get"
                  action="/dashboard/pedidos"
                  className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 md:gap-4 items-end"
                >
                  <div className="grid gap-1.5">
                    <label
                      htmlFor="orders-q"
                      className="text-xs uppercase tracking-wide text-zinc-500"
                    >
                      Buscar pedido
                    </label>
                    <input
                      id="orders-q"
                      name="q"
                      defaultValue={filters.q}
                      placeholder="Número, loja, item ou pagamento"
                      className="form-control"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <label
                      htmlFor="orders-status"
                      className="text-xs uppercase tracking-wide text-zinc-500"
                    >
                      Status
                    </label>
                    <select
                      id="orders-status"
                      name="status"
                      defaultValue={filters.status}
                      className="form-control"
                    >
                      <option value="all">Todos</option>
                      <option value="paid">Pagos</option>
                      <option value="pending">Em aberto</option>
                      <option value="processing">Processando</option>
                      <option value="canceled">Cancelados</option>
                    </select>
                  </div>

                  <div className="grid gap-1.5">
                    <label
                      htmlFor="orders-from"
                      className="text-xs uppercase tracking-wide text-zinc-500"
                    >
                      Data inicial
                    </label>
                    <input
                      id="orders-from"
                      name="from"
                      type="date"
                      defaultValue={filters.from}
                      className="form-control"
                    />
                  </div>

                  <div className="grid gap-1.5">
                    <label
                      htmlFor="orders-to"
                      className="text-xs uppercase tracking-wide text-zinc-500"
                    >
                      Data final
                    </label>
                    <input
                      id="orders-to"
                      name="to"
                      type="date"
                      defaultValue={filters.to}
                      className="form-control"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2 xl:col-span-4 flex flex-wrap items-center gap-2 pt-1">
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-md bg-cyan-700 text-white text-sm font-semibold hover:bg-cyan-800 transition-colors"
                    >
                      Aplicar filtros
                    </button>
                    <Link
                      href="/dashboard/pedidos"
                      className="inline-flex items-center justify-center px-4 py-2.5 rounded-md border border-zinc-300 text-sm font-semibold text-zinc-700 hover:bg-zinc-50 transition-colors"
                    >
                      Limpar filtros
                    </Link>
                  </div>
                </form>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3 md:gap-4">
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center mb-2">
                    <Icon icon="fa-check" className="text-xs" />
                  </div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Pagos</p>
                  <p className="text-2xl font-bold text-zinc-900 mt-1">{metrics.paid}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center mb-2">
                    <Icon icon="fa-hourglass-half" className="text-xs" />
                  </div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Em aberto</p>
                  <p className="text-2xl font-bold text-zinc-900 mt-1">{metrics.pending}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-700 flex items-center justify-center mb-2">
                    <Icon icon="fa-clock" className="text-xs" />
                  </div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Processando</p>
                  <p className="text-2xl font-bold text-zinc-900 mt-1">{metrics.processing}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
                  <div className="w-8 h-8 rounded-full bg-red-100 text-red-700 flex items-center justify-center mb-2">
                    <Icon icon="fa-times" className="text-xs" />
                  </div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Cancelados</p>
                  <p className="text-2xl font-bold text-zinc-900 mt-1">{metrics.canceled}</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:col-span-2 xl:col-span-1">
                  <div className="w-8 h-8 rounded-full bg-cyan-100 text-cyan-700 flex items-center justify-center mb-2">
                    <Icon icon="fa-wallet" className="text-xs" />
                  </div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500">Total em pedidos</p>
                  <p className="text-xl font-bold text-zinc-900 mt-1">R$ {moneyFormat(metrics.total)}</p>
                </div>
              </div>

              {!!safeOrders.length ? (
                safeOrders.map((item: OrderType, key: number) => {
                  const status = getOrderStatusPresentation(item);
                  const orderRef = item.mainOrderId || item.orderIds?.[0] || item.id;
                  const stores = resolveOrderStores(item);
                  const itemNames = resolveItemNames(item);
                  const scheduleSummary = resolveScheduleSummary(item);
                  const paymentMethod = resolvePaymentMethodLabel(item);
                  const unitsCount = resolveItemsCount(item);
                  const mainStore = stores[0] || "Loja não identificada";

                  return (
                    <article
                      key={item.id || key}
                      className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6 shadow-sm"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-title text-zinc-900 font-semibold text-lg leading-tight">
                            Pedido #{item.mainOrderId || item.id}
                          </p>
                          <p className="text-sm text-zinc-500">
                            Criado em {getExtenseData(item.createdAt || item.created_at)}
                          </p>
                          <div className="flex flex-wrap items-center gap-2 pt-1">
                            <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600">
                              <Icon icon="fa-cube" className="text-[10px]" />
                              {unitsCount} {unitsCount === 1 ? "item" : "itens"}
                            </span>
                            {item.ordersCount && item.ordersCount > 1 && (
                              <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs text-zinc-600">
                                <Icon icon="fa-store" className="text-[10px]" />
                                {item.ordersCount} lojas no mesmo pedido
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="md:text-right space-y-2">
                          <div className={`${status.badgeClassName} rounded-full text-xs font-semibold inline-flex items-center px-3 py-1`}>
                            {status.label}
                          </div>
                          <div>
                            <p className="text-xs uppercase tracking-wide text-zinc-500">Total</p>
                            <p className="text-xl font-bold text-zinc-900 whitespace-nowrap">
                              R$ {moneyFormat(asNumber(item.total))}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="rounded-xl bg-zinc-50 border border-zinc-100 px-3 py-3">
                          <p className="text-[11px] uppercase tracking-wide text-zinc-500">Loja</p>
                          <p className="text-sm font-medium text-zinc-900 mt-1">{mainStore}</p>
                          {stores.length > 1 && (
                            <p className="text-xs text-zinc-500 mt-1">+{stores.length - 1} outra(s)</p>
                          )}
                        </div>
                        <div className="rounded-xl bg-zinc-50 border border-zinc-100 px-3 py-3">
                          <p className="text-[11px] uppercase tracking-wide text-zinc-500">Agendamento</p>
                          <p className="text-sm font-medium text-zinc-900 mt-1">
                            {scheduleSummary || "A confirmar"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-zinc-50 border border-zinc-100 px-3 py-3">
                          <p className="text-[11px] uppercase tracking-wide text-zinc-500">Pagamento</p>
                          <p className="text-sm font-medium text-zinc-900 mt-1">{paymentMethod}</p>
                        </div>
                      </div>

                      <div className="mt-4 border-t border-zinc-100 pt-4">
                        <p className="text-[11px] uppercase tracking-wide text-zinc-500 mb-2">Itens do pedido</p>
                        <div className="flex flex-wrap gap-2">
                          {itemNames.length > 0 ? (
                            <>
                              {itemNames.slice(0, 3).map((name) => (
                                <span
                                  key={`${orderRef}-${name}`}
                                  className="inline-flex items-center rounded-full bg-white border border-zinc-200 px-3 py-1 text-xs text-zinc-700"
                                >
                                  {name}
                                </span>
                              ))}
                              {itemNames.length > 3 && (
                                <span className="inline-flex items-center rounded-full bg-zinc-100 px-3 py-1 text-xs text-zinc-600">
                                  +{itemNames.length - 3} outros
                                </span>
                              )}
                            </>
                          ) : (
                            <span className="text-xs text-zinc-500">Itens indisponíveis para visualização rápida.</span>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 pt-4 border-t border-zinc-100 flex flex-wrap items-center gap-2">
                        <Link
                          href={`/dashboard/pedidos/${orderRef}`}
                          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md border border-zinc-300 text-sm font-semibold text-zinc-800 hover:bg-zinc-50 transition-colors"
                        >
                          Ver detalhes
                          <Icon icon="fa-arrow-right" className="text-xs" type="far" />
                        </Link>

                        {status.key === "pending" && (
                          <Link
                            href={`/dashboard/pedidos/pagamento/${orderRef}`}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-yellow-500 text-zinc-900 text-sm font-semibold hover:bg-yellow-400 transition-colors"
                          >
                            Concluir pagamento
                            <Icon icon="fa-credit-card" className="text-xs" />
                          </Link>
                        )}

                        {status.key === "paid" && (
                          <button
                            type="button"
                            onClick={() => handleRepeatOrder(item)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-cyan-700 text-white text-sm font-semibold hover:bg-cyan-800 transition-colors"
                          >
                            Repetir pedido
                            <Icon icon="fa-cart-plus" className="text-xs" />
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="text-center bg-zinc-50 rounded-2xl border border-zinc-200 p-6 md:p-10 flex flex-col justify-center gap-6">
                  <div className="text-base md:text-lg max-w-[30rem] mx-auto leading-relaxed text-zinc-700">
                    {hasActiveFilters
                      ? "Nenhum pedido corresponde aos filtros aplicados. Ajuste os filtros e tente novamente."
                      : "Você ainda não possui pedidos. Explore o catálogo para montar sua festa e acompanhar tudo por aqui."}
                  </div>
                  <div className="mb-2">
                    <Button href="/produtos">
                      Ver produtos
                      <Icon icon="fa-arrow-right" className="text-xs ml-2 -mr-2" type="far" />
                    </Button>
                  </div>
                </div>
              )}

              {pageInfo.totalPages > 1 && (
                <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
                  <div className="text-sm text-zinc-600">
                    Página {pageInfo.page} de {pageInfo.totalPages}
                  </div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={buildPageHref(pageInfo.page - 1)}
                      aria-disabled={!pageInfo.hasPrev}
                      className={`px-3.5 py-2 rounded-md text-sm font-semibold transition-colors ${
                        pageInfo.hasPrev
                          ? "border border-zinc-300 text-zinc-700 hover:bg-zinc-50"
                          : "border border-zinc-200 text-zinc-400 pointer-events-none"
                      }`}
                    >
                      Anterior
                    </Link>
                    <Link
                      href={buildPageHref(pageInfo.page + 1)}
                      aria-disabled={!pageInfo.hasNext}
                      className={`px-3.5 py-2 rounded-md text-sm font-semibold transition-colors ${
                        pageInfo.hasNext
                          ? "bg-cyan-700 text-white hover:bg-cyan-800"
                          : "bg-zinc-200 text-zinc-400 pointer-events-none"
                      }`}
                    >
                      Próxima
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="w-full xl:max-w-[22rem] xl:sticky xl:top-24">
              <HelpCard list={page?.help_list ?? []} />
            </div>
          </div>
        </div>
      </section>
    </Template>
  );
}

export const getServerSideProps: GetServerSideProps<PedidosProps> = async (ctx) => {
  const api = new Api();

  try {
    const query = ctx.query ?? {};
    const q = typeof query.q === "string" ? query.q.trim() : "";
    const from = typeof query.from === "string" ? query.from : "";
    const to = typeof query.to === "string" ? query.to : "";
    const rawStatus = typeof query.status === "string" ? query.status : "all";
    const status: StatusFilter = isStatusFilter(rawStatus) ? rawStatus : "all";
    const rawPage = typeof query.page === "string" ? Number.parseInt(query.page, 10) : 1;

    const filters: OrdersFilters = {
      q,
      status,
      from,
      to,
    };

    const params = new URLSearchParams();
    if (q) params.set("search", q);
    if (from) params.set("date_from", from);
    if (to) params.set("date_to", to);
    const url = params.toString() ? `orders/list?${params.toString()}` : "orders/list";

    const [ordersRequest, contentRequest] = await Promise.all([
      api.bridge(
        {
          method: "get",
          url,
        },
        ctx
      ) as Promise<any>,
      api.content(
        {
          method: "get",
          url: "account/user",
        },
        ctx
      ) as Promise<any>,
    ]);

    const source = ordersRequest?.data?.data ?? ordersRequest?.data ?? [];
    const normalizedOrders = (Array.isArray(source) ? source : [])
      .map((item) => normalizeOrderEntity(item) as unknown as OrderType)
      .sort((a: any, b: any) => {
        const dateA = new Date(a?.createdAt || a?.created_at || 0).getTime();
        const dateB = new Date(b?.createdAt || b?.created_at || 0).getTime();
        return dateB - dateA;
      });

    const localSearchTerm = q.toLowerCase();
    const searchedOrders = q
      ? normalizedOrders.filter((order) =>
          buildOrderSearchText(order).includes(localSearchTerm)
        )
      : normalizedOrders;

    const filteredOrders = searchedOrders.filter((order) =>
      status === "all" ? true : getOrderStatusPresentation(order).key === status
    );

    const summary: OrdersSummary = filteredOrders.reduce(
      (acc, order) => {
        const total = asNumber(order?.total);
        const statusKey = getOrderStatusPresentation(order).key;

        if (statusKey === "paid") acc.paid += 1;
        if (statusKey === "pending") acc.pending += 1;
        if (statusKey === "processing") acc.processing += 1;
        if (statusKey === "canceled") acc.canceled += 1;

        acc.total += total;
        return acc;
      },
      {
        paid: 0,
        pending: 0,
        processing: 0,
        canceled: 0,
        total: 0,
      }
    );

    const totalItems = filteredOrders.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
    const page = Number.isFinite(rawPage) && rawPage > 0 ? Math.min(rawPage, totalPages) : 1;
    const startIndex = (page - 1) * PAGE_SIZE;
    const pageOrders = filteredOrders.slice(startIndex, startIndex + PAGE_SIZE);

    const pageInfo: PageInfo = {
      page,
      pageSize: PAGE_SIZE,
      totalItems,
      totalPages,
      fromItem: totalItems === 0 ? 0 : startIndex + 1,
      toItem: Math.min(startIndex + PAGE_SIZE, totalItems),
      hasPrev: page > 1,
      hasNext: page < totalPages,
    };

    const safeProps = JSON.parse(
      JSON.stringify({
        orders: pageOrders,
        summary,
        pageInfo,
        filters,
        page: contentRequest?.data?.Account ?? { help_list: [] },
        HeaderFooter: contentRequest?.data?.HeaderFooter ?? {},
      })
    ) as PedidosProps;

    return {
      props: safeProps,
    };
  } catch (error) {
    return {
      props: {
        orders: [],
        summary: {
          paid: 0,
          pending: 0,
          processing: 0,
          canceled: 0,
          total: 0,
        },
        pageInfo: {
          page: 1,
          pageSize: PAGE_SIZE,
          totalItems: 0,
          totalPages: 1,
          fromItem: 0,
          toItem: 0,
          hasPrev: false,
          hasNext: false,
        },
        filters: {
          q: "",
          status: "all",
          from: "",
          to: "",
        },
        page: { help_list: [] },
        HeaderFooter: {},
      },
    };
  }
};
