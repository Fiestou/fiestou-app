import { Button } from "@/src/components/ui/form";
import { dateBRFormat, getShorDate, moneyFormat } from "@/src/helper";
import { deliveryToName } from "@/src/models/delivery";
import Icon from "@/src/icons/fontAwesome/FIcon";
import {
  getOrderStatusKey,
  isOrderProcessing,
} from "@/src/services/order-status";
import AddressCard from "./AddressCard";
import PaymentMethodDisplay from "./PaymentMethodDisplay";
import OrderTotalSection from "./OrderTotalSection";

interface OrderSummaryProps {
  order: {
    id: number;
    status: number;
    total: number;
    subtotal?: number;
    createdAt?: string;
    metadata?: {
      payment_method?: string;
      transaction_type?: string;
      installments?: number;
      pdf?: string;
      url?: string;
      scheduleStart?: string;
      scheduleEnd?: string;
    };
    delivery?: {
      to?: string;
      price?: number;
      schedule?: string | { date?: string; period?: string; time?: string };
      scheduleDate?: string;
      address?: {
        street?: string;
        number?: string;
        neighborhood?: string;
        zipCode?: string;
        city?: string;
        state?: string;
        country?: string;
        complement?: string;
      };
    };
    deliveryTotal?: number;
  };
  products: Array<{
    name?: string;
    quantity: number;
    unitPrice: number;
    addons?: Array<{
      name: string;
      quantity: number;
      price: number;
      total?: number;
    }>;
    metadata?: {
      product?: {
        name?: string;
        title?: string;
      };
    };
  }>;
  resume?: {
    startDate?: string;
    endDate?: string;
  };
}

export default function OrderSummary({ order, products, resume }: OrderSummaryProps) {
  const total = Number(order.total || 0);
  const deliveryPrice = Number(order.deliveryTotal ?? order.delivery?.price ?? 0);
  const subtotal = Number(order.subtotal ?? Math.max(0, total - deliveryPrice));
  const statusKey = getOrderStatusKey(order);
  const canPayOrder = statusKey === "pending";
  const rawSchedule = order.delivery?.schedule;
  const scheduleLabel =
    typeof rawSchedule === "string"
      ? rawSchedule
      : rawSchedule && typeof rawSchedule === "object"
        ? [rawSchedule.period, rawSchedule.time].filter(Boolean).join(" - ")
        : "";
  const scheduleDateFromDelivery =
    rawSchedule && typeof rawSchedule === "object"
      ? rawSchedule.date
      : undefined;

  // Data de agendamento - usa delivery.scheduleDate (novo), resume, ou metadata como fallback
  const scheduleStartDate =
    order.delivery?.scheduleDate ||
    scheduleDateFromDelivery ||
    resume?.startDate ||
    order.metadata?.scheduleStart;
  const scheduleEndDate = resume?.endDate || order.metadata?.scheduleEnd;

  return (
    <div className="rounded-2xl bg-zinc-100 p-4 md:p-8">
      {/* Botão de pagamento para pedidos em aberto */}
      {canPayOrder && (
        <div>
          {order.metadata?.url ? (
            <Button
              style="btn-success"
              className="w-full"
              href={order.metadata.url}
              target="_blank"
            >
              Continuar pagamento
            </Button>
          ) : (
            <Button
              style="btn-success"
              className="w-full"
              href={`/dashboard/pedidos/pagamento/${order.id}`}
            >
              Efetuar pagamento
            </Button>
          )}
          <div className="border-t -mx-8 my-8"></div>
        </div>
      )}

      {/* Mensagem de aguardando pagamento */}
      {isOrderProcessing(order) && (
        <div>
          <div className="bg-zinc-50 text-center p-2 text-zinc-800 rounded">
            Aguardando confirmação de pagamento...
          </div>
          {order.metadata?.transaction_type === "boleto" && (
            <div className="grid pt-4 -mb-2">
              <a
                rel="noreferrer"
                href={order.metadata?.pdf}
                target="_blank"
                className="font-semibold text-center rounded-md hover:underline text-cyan-600 hover:text-cyan-800 ease"
              >
                Visualizar boleto
              </a>
            </div>
          )}
          <div className="border-t -mx-8 my-8"></div>
        </div>
      )}

      <div className="font-title font-bold text-zinc-900 text-xl mb-6">
        Resumo
      </div>

      <div className="grid gap-6">
        {/* Informações do pedido */}
        <div className="grid gap-2 text-sm">
          <div className="text-zinc-900">
            Pedido nº <b>{order.id}</b>
          </div>
          <div className="text-zinc-600">Realizado em {getShorDate(order.createdAt)}</div>
        </div>

        {/* Agendamento - Destacado (mostra se tem data OU horário) */}
        {(scheduleStartDate || scheduleLabel) && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-700 font-semibold mb-2">
              <Icon icon="fa-calendar" className="text-sm" />
              <span>Agendamento</span>
            </div>
            {scheduleStartDate && (
              <div className="flex items-center gap-2 text-zinc-700 mb-1">
                <span className="text-zinc-600">Data:</span>
                <span className="font-semibold text-zinc-900">
                  {dateBRFormat(scheduleStartDate)}
                  {scheduleEndDate && scheduleEndDate !== scheduleStartDate
                    ? ` até ${dateBRFormat(scheduleEndDate)}`
                    : ""}
                </span>
              </div>
            )}
            {scheduleLabel && (
              <div className="flex items-center gap-2 text-zinc-700">
                <Icon icon="fa-clock" className="text-sm text-yellow-600" />
                <span className="text-zinc-600">Horário:</span>
                <span className="font-semibold text-zinc-900">{scheduleLabel}</span>
              </div>
            )}
          </div>
        )}

        {/* Instrução de entrega - Destacado */}
        {order.delivery?.to && (
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-cyan-700 font-semibold mb-1">
              <Icon icon="fa-truck" className="text-sm" />
              <span>Instrução de entrega</span>
            </div>
            <div className="text-zinc-900 font-medium">
              {deliveryToName[order.delivery.to] || order.delivery.to}
            </div>
          </div>
        )}

        {/* Valor de entrega */}
        <div className="flex justify-between text-sm">
          <span className="text-zinc-600">Valor de entrega:</span>
          <span className="font-medium text-zinc-900">
            {deliveryPrice > 0
              ? `R$ ${moneyFormat(deliveryPrice)}`
              : "Gratuita"}
          </span>
        </div>

        <div>
          <hr className="my-0" />
        </div>

        {/* Endereço de entrega */}
        <AddressCard address={order.delivery?.address} />

        {/* Pagamento */}
        {order.metadata && (
          <>
            <div>
              <hr className="my-0" />
            </div>
            <div className="grid gap-2">
              <div className="text-zinc-900 font-bold">Pagamento</div>
              <PaymentMethodDisplay
                paymentMethod={order.metadata.payment_method}
                transactionType={order.metadata.transaction_type}
                installments={order.metadata.installments}
              />
            </div>
          </>
        )}

        <div>
          <hr className="my-0" />
        </div>

        {/* Total da compra */}
        <OrderTotalSection
          items={products}
          subtotal={subtotal}
          deliveryPrice={deliveryPrice}
          total={total}
        />

        <div>
          <hr className="my-0" />
        </div>

        {/* Total final */}
        <div className="flex items-center gap-2">
          <div className="w-full font-title text-zinc-900 font-bold">TOTAL</div>
          <div className="text-2xl text-zinc-900 font-bold whitespace-nowrap">
            R$ {moneyFormat(total)}
          </div>
        </div>
      </div>
    </div>
  );
}
