type AnyOrder = Record<string, any>;

export type OrderStatusKey = "canceled" | "paid" | "processing" | "pending";

export interface OrderStatusPresentation {
  key: OrderStatusKey;
  label: string;
  badgeClassName: string;
}

function toLower(value: any): string {
  return String(value ?? "").trim().toLowerCase();
}

function toNumber(value: any): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function statusTextToKey(statusText?: string | null): OrderStatusKey | null {
  const text = toLower(statusText);
  if (!text) return null;

  if (
    text.includes("cancel") ||
    text.includes("expir") ||
    text.includes("recus") ||
    text.includes("falh")
  ) {
    return "canceled";
  }

  if (
    text.includes("pago") ||
    text.includes("aprov") ||
    text.includes("confirm")
  ) {
    return "paid";
  }

  if (
    text.includes("process") ||
    text.includes("análise") ||
    text.includes("analise")
  ) {
    return "processing";
  }

  if (
    text.includes("aberto") ||
    text.includes("pendente") ||
    text.includes("aguard")
  ) {
    return "pending";
  }

  return null;
}

export function isOrderCanceled(order: AnyOrder): boolean {
  const status = toNumber(order?.status);
  const metadataStatus = toLower(order?.metadata?.status);
  const paymentStatus = toLower(
    order?.metadata?.payment_status ?? order?.payment?.status
  );

  if (status === -2) return true;

  return [
    "expired",
    "canceled",
    "cancelled",
    "failed",
    "refused",
    "chargeback",
  ].includes(metadataStatus) || [
    "expired",
    "canceled",
    "cancelled",
    "failed",
    "refused",
    "chargeback",
  ].includes(paymentStatus);
}

export function isOrderPaid(order: AnyOrder): boolean {
  const status = toNumber(order?.status);
  const paymentStatus = toLower(
    order?.metadata?.payment_status ?? order?.payment?.status
  );

  return (
    status === 1 ||
    !!order?.metadata?.paid_at ||
    ["paid", "approved", "captured", "authorized"].includes(paymentStatus)
  );
}

export function isOrderProcessing(order: AnyOrder): boolean {
  const status = toNumber(order?.status);
  if (status === -1) return true;

  const paymentStatus = toLower(
    order?.metadata?.payment_status ?? order?.payment?.status
  );

  return ["processing", "analyzing", "in_analysis"].includes(paymentStatus);
}

export function getOrderStatusKey(order: AnyOrder): OrderStatusKey {
  if (isOrderCanceled(order)) return "canceled";
  if (isOrderPaid(order)) return "paid";
  if (isOrderProcessing(order)) return "processing";

  const byStatusText = statusTextToKey(order?.statusText);
  if (byStatusText) return byStatusText;

  return "pending";
}

export function getOrderStatusPresentation(order: AnyOrder): OrderStatusPresentation {
  const key = getOrderStatusKey(order);

  const map: Record<OrderStatusKey, Omit<OrderStatusPresentation, "key">> = {
    canceled: {
      label: "Cancelado",
      badgeClassName: "bg-red-100 text-red-700",
    },
    paid: {
      label: "Pago",
      badgeClassName: "bg-green-100 text-green-700",
    },
    processing: {
      label: "Processando",
      badgeClassName: "bg-zinc-100 text-zinc-700",
    },
    pending: {
      label: "Em aberto",
      badgeClassName: "bg-yellow-100 text-yellow-700",
    },
  };

  const fromStatusText = statusTextToKey(order?.statusText);
  const defaultItem = map[key];

  if (fromStatusText === key && order?.statusText) {
    return {
      key,
      label: String(order.statusText),
      badgeClassName: defaultItem.badgeClassName,
    };
  }

  return {
    key,
    label: defaultItem.label,
    badgeClassName: defaultItem.badgeClassName,
  };
}
