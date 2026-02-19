import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import {
  getOrderStatusPresentation,
  isOrderCanceled,
  isOrderPaid,
  isOrderProcessing,
} from "@/src/services/order-status";

interface TimelineStep {
  key: string;
  title: string;
  description: string;
}

interface HistoryEvent {
  id: string;
  title: string;
  description: string;
  timestamp?: string | null;
  tone: "success" | "current" | "warning" | "danger" | "neutral";
}

interface NextAction {
  title: string;
  description: string;
  tone: "success" | "current" | "warning" | "danger" | "neutral";
  buttonLabel?: string;
  href?: string;
}

interface OrderTimelineHistoryProps {
  order: any;
}

const DELIVERY_STATUS_LABELS: Record<string, string> = {
  pending: "Aguardando preparação",
  paid: "Pagamento confirmado",
  processing: "Em separação",
  sent: "Enviado",
  transiting: "Em trânsito",
  received: "Entregue",
  returned: "Retornado",
  canceled: "Cancelado",
  waitingwithdrawal: "Aguardando retirada",
  collect: "Coleta de devolução em andamento",
  complete: "Concluído",
};

const DELIVERY_STATUS_DETAILS: Record<string, string> = {
  pending: "Seu pagamento foi registrado e o pedido aguarda andamento da loja.",
  paid: "Pagamento confirmado e pedido disponível para preparação.",
  processing: "A loja está organizando os itens para envio ou retirada.",
  sent: "Pedido enviado pela loja.",
  transiting: "Pedido em deslocamento para o endereço informado.",
  received: "Pedido entregue com sucesso.",
  returned: "Pedido retornou para a loja.",
  canceled: "Pedido cancelado.",
  waitingwithdrawal: "Pedido disponível para retirada no local combinado.",
  collect: "Parceiro a caminho para recolher os itens.",
  complete: "Fluxo de entrega e devolução finalizado.",
};

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

function formatDateTime(value?: string | null): string {
  const raw = asText(value);
  if (!raw) return "Sem horário registrado";

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;

  return parsed.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getPaymentMethodLabel(order: any): string {
  const method = asText(
    order?.payment?.methodLabel ??
      order?.metadata?.payment_method_display ??
      order?.metadata?.payment_method ??
      order?.payment?.method
  ).toLowerCase();

  if (!method) return "não informado";
  if (method.includes("credit")) return "cartão de crédito";
  if (method === "pix") return "pix";
  if (method === "boleto") return "boleto";
  return method;
}

function getDeliveryStatus(order: any): string {
  return asText(order?.delivery?.status ?? order?.delivery_status).toLowerCase();
}

function isPickupFlow(order: any): boolean {
  const items = parseArray(order?.items);
  if (!items.length) return false;

  return items.every((item) => {
    const metadata = parseObject(item?.metadata);
    const rawItem = parseObject(metadata?.raw_item);
    const rawDetails = parseObject(rawItem?.details);
    const metadataDetails = parseObject(metadata?.details);
    const details =
      Object.keys(rawDetails).length > 0 ? rawDetails : metadataDetails;
    const selection = asText(details?.deliverySelection).toLowerCase();
    return selection === "pickup";
  });
}

function resolveScheduleSummary(order: any): string {
  const schedule = order?.delivery?.schedule;
  if (!schedule) return "";

  if (typeof schedule === "string") {
    return asText(schedule);
  }

  const date = asText(schedule?.date);
  const period = asText(schedule?.period);
  const time = asText(schedule?.time);
  return [date, period, time].filter(Boolean).join(" • ");
}

function buildTimelineSteps(pickup: boolean): TimelineStep[] {
  if (pickup) {
    return [
      {
        key: "created",
        title: "Pedido realizado",
        description: "Pedido recebido e aguardando confirmação.",
      },
      {
        key: "paid",
        title: "Pagamento confirmado",
        description: "Pagamento aprovado para iniciar separação.",
      },
      {
        key: "ready_pickup",
        title: "Pronto para retirada",
        description: "Pedido disponível para retirada na loja.",
      },
      {
        key: "completed",
        title: "Concluído",
        description: "Retirada concluída.",
      },
    ];
  }

  return [
    {
      key: "created",
      title: "Pedido realizado",
      description: "Pedido recebido e aguardando confirmação.",
    },
    {
      key: "paid",
      title: "Pagamento confirmado",
      description: "Pagamento aprovado para iniciar separação.",
    },
    {
      key: "processing",
      title: "Em preparação",
      description: "A loja está separando os itens.",
    },
    {
      key: "transit",
      title: "Em transporte",
      description: "Pedido em deslocamento para o endereço informado.",
    },
    {
      key: "delivered",
      title: "Entregue",
      description: "Pedido entregue com sucesso.",
    },
  ];
}

function resolveActiveStep(order: any, pickup: boolean): number {
  const canceled = isOrderCanceled(order);
  if (canceled) return -1;

  const deliveryStatus = getDeliveryStatus(order);
  const paid = isOrderPaid(order);

  if (pickup) {
    if (["complete", "received"].includes(deliveryStatus)) return 3;
    if (["waitingwithdrawal", "collect", "sent", "transiting", "processing", "paid"].includes(deliveryStatus)) {
      return 2;
    }
    if (paid) return 1;
    return 0;
  }

  if (["complete", "received"].includes(deliveryStatus)) return 4;
  if (["transiting", "sent", "collect"].includes(deliveryStatus)) return 3;
  if (["processing", "paid", "waitingwithdrawal"].includes(deliveryStatus)) return 2;
  if (paid) return 1;
  return 0;
}

function buildHistoryEvents(order: any): HistoryEvent[] {
  const events: HistoryEvent[] = [];
  const orderStatus = getOrderStatusPresentation(order);
  const canceled = isOrderCanceled(order);
  const paid = isOrderPaid(order);
  const processing = isOrderProcessing(order);
  const paymentMethod = getPaymentMethodLabel(order);
  const paymentStatus = asText(order?.payment?.status ?? order?.metadata?.payment_status).toLowerCase();
  const paidAt = asText(order?.metadata?.paid_at || order?.payment?.paidAt);
  const createdAt = asText(order?.createdAt || order?.created_at);
  const deliveryStatus = getDeliveryStatus(order);
  const scheduleSummary = resolveScheduleSummary(order);
  const stores = parseArray(order?.stores);
  const splittedOrders = parseArray(order?.orders);

  events.push({
    id: "created",
    title: "Pedido criado",
    description: `Pedido #${order?.id} registrado na plataforma.`,
    timestamp: createdAt || null,
    tone: "success",
  });

  if (scheduleSummary) {
    events.push({
      id: "schedule",
      title: "Agendamento definido",
      description: scheduleSummary,
      timestamp: null,
      tone: "neutral",
    });
  }

  if (paid) {
    events.push({
      id: "payment_approved",
      title: "Pagamento aprovado",
      description: `Pagamento confirmado via ${paymentMethod}.`,
      timestamp: paidAt || createdAt || null,
      tone: "success",
    });
  } else if (processing || ["processing", "in_analysis", "analyzing"].includes(paymentStatus)) {
    events.push({
      id: "payment_processing",
      title: "Pagamento em análise",
      description: "A operadora está validando o pagamento.",
      timestamp: null,
      tone: "current",
    });
  } else if (canceled || ["canceled", "cancelled", "failed", "refused", "expired"].includes(paymentStatus)) {
    events.push({
      id: "payment_rejected",
      title: "Pagamento não concluído",
      description: "O pagamento não foi aprovado.",
      timestamp: paidAt || null,
      tone: "danger",
    });
  } else {
    events.push({
      id: "payment_pending",
      title: "Aguardando pagamento",
      description: "Conclua o pagamento para avançar com o pedido.",
      timestamp: null,
      tone: "warning",
    });
  }

  const shouldIncludeDeliveryStatus =
    !!deliveryStatus &&
    !(deliveryStatus === "paid" && paid) &&
    !(deliveryStatus === "pending" && !paid && !processing && !canceled);

  if (shouldIncludeDeliveryStatus) {
    events.push({
      id: "delivery_status",
      title: DELIVERY_STATUS_LABELS[deliveryStatus] || "Atualização de entrega",
      description:
        DELIVERY_STATUS_DETAILS[deliveryStatus] ||
        "Houve uma atualização no status logístico do pedido.",
      timestamp: null,
      tone: canceled ? "danger" : orderStatus.key === "paid" ? "success" : "current",
    });
  }

  if (stores.length > 1) {
    events.push({
      id: "multi_store",
      title: "Pedido com múltiplas lojas",
      description: `${stores.length} lojas participam deste pedido.`,
      timestamp: null,
      tone: "neutral",
    });
  }

  if (splittedOrders.length > 1) {
    const completedStores = splittedOrders.filter((entry) =>
      ["received", "complete"].includes(asText(entry?.deliveryStatus).toLowerCase())
    ).length;
    events.push({
      id: "stores_progress",
      title: "Andamento por loja",
      description: `${completedStores} de ${splittedOrders.length} pedidos de loja foram concluídos.`,
      timestamp: null,
      tone: "neutral",
    });
  }

  return events;
}

function getToneClasses(tone: HistoryEvent["tone"]): string {
  if (tone === "success") return "bg-green-100 text-green-700";
  if (tone === "current") return "bg-cyan-100 text-cyan-700";
  if (tone === "warning") return "bg-yellow-100 text-yellow-700";
  if (tone === "danger") return "bg-red-100 text-red-700";
  return "bg-zinc-100 text-zinc-700";
}

function getToneIcon(tone: HistoryEvent["tone"]): string {
  if (tone === "success") return "fa-check";
  if (tone === "current") return "fa-clock";
  if (tone === "warning") return "fa-exclamation";
  if (tone === "danger") return "fa-times";
  return "fa-circle";
}

function buildNextAction(order: any): NextAction {
  const canceled = isOrderCanceled(order);
  const paid = isOrderPaid(order);
  const processing = isOrderProcessing(order);
  const deliveryStatus = getDeliveryStatus(order);

  if (canceled) {
    return {
      title: "Pedido cancelado",
      description: "Este pedido foi cancelado e não possui novas ações pendentes.",
      tone: "danger",
    };
  }

  if (!paid && !processing) {
    return {
      title: "Pagamento pendente",
      description: "Conclua o pagamento para iniciar preparação e entrega do pedido.",
      tone: "warning",
      buttonLabel: "Concluir pagamento",
      href: `/dashboard/pedidos/pagamento/${order?.id}`,
    };
  }

  if (["transiting", "sent", "collect"].includes(deliveryStatus)) {
    return {
      title: "Pedido em rota",
      description: "Seu pedido já está em deslocamento. Acompanhe atualizações de entrega nesta página.",
      tone: "current",
    };
  }

  if (["received", "complete"].includes(deliveryStatus)) {
    return {
      title: "Pedido concluído",
      description: "Seu pedido foi finalizado. Você pode avaliar os itens e repetir quando quiser.",
      tone: "success",
    };
  }

  return {
    title: "Aguardando avanço da loja",
    description: "Pagamento confirmado. A loja está preparando os itens para próxima etapa logística.",
    tone: "neutral",
  };
}

export default function OrderTimelineHistory({ order }: OrderTimelineHistoryProps) {
  const pickupFlow = isPickupFlow(order);
  const canceled = isOrderCanceled(order);
  const timelineSteps = buildTimelineSteps(pickupFlow);
  const activeStep = resolveActiveStep(order, pickupFlow);
  const historyEvents = buildHistoryEvents(order);
  const nextAction = buildNextAction(order);

  return (
    <section className="grid gap-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6">
        <h4 className="text-lg md:text-xl text-zinc-900 font-semibold mb-2">Próxima ação recomendada</h4>
        <div className={`rounded-xl px-4 py-3 ${getToneClasses(nextAction.tone)}`}>
          <p className="text-sm font-semibold">{nextAction.title}</p>
          <p className="text-sm opacity-90 mt-1">{nextAction.description}</p>
        </div>
        {nextAction.href && nextAction.buttonLabel && (
          <div className="mt-3">
            <Link
              href={nextAction.href}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-yellow-500 text-zinc-900 text-sm font-semibold hover:bg-yellow-400 transition-colors"
            >
              {nextAction.buttonLabel}
              <Icon icon="fa-arrow-right" className="text-xs" type="far" />
            </Link>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <h4 className="text-xl md:text-2xl text-zinc-900">Linha do tempo do pedido</h4>
          {canceled && (
            <span className="inline-flex items-center gap-1 rounded-full bg-red-100 text-red-700 px-3 py-1 text-xs font-semibold">
              <Icon icon="fa-times" className="text-[10px]" />
              Pedido cancelado
            </span>
          )}
        </div>

        <div className="grid gap-4">
          {timelineSteps.map((step, index) => {
            const completed = !canceled && index < activeStep;
            const current = !canceled && index === activeStep;
            const pending = canceled || index > activeStep;

            const badgeClass = completed
              ? "bg-green-500 text-white"
              : current
                ? "bg-yellow-400 text-zinc-900"
                : "bg-zinc-200 text-zinc-500";

            return (
              <div key={step.key} className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${badgeClass}`}>
                  {completed ? <Icon icon="fa-check" className="text-[10px]" /> : index + 1}
                </div>
                <div className={`${pending ? "opacity-60" : ""}`}>
                  <p className="font-semibold text-zinc-900">{step.title}</p>
                  <p className="text-sm text-zinc-600">{step.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 md:p-6">
        <h4 className="text-lg md:text-xl text-zinc-900 font-semibold mb-4">
          Histórico de eventos
        </h4>

        <div className="grid gap-3">
          {historyEvents.map((event) => (
            <div
              key={event.id}
              className="rounded-xl border border-zinc-100 bg-zinc-50 px-3.5 py-3"
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center ${getToneClasses(
                    event.tone
                  )}`}
                >
                  <Icon icon={getToneIcon(event.tone)} className="text-[10px]" />
                </div>
                <div className="w-full">
                  <p className="text-sm font-semibold text-zinc-900">{event.title}</p>
                  <p className="text-sm text-zinc-600 mt-0.5">{event.description}</p>
                  {event.timestamp && (
                    <p className="text-xs text-zinc-500 mt-1">
                      {formatDateTime(event.timestamp)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
