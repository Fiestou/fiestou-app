import { Button } from "@/src/components/ui/form";
import { dateBRFormat, getShorDate, moneyFormat } from "@/src/helper";
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
    };
    delivery?: {
      price?: number;
      schedule?: string;
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
  const subtotal = order.subtotal || ((order.total || 0) - (order.delivery?.price || 0));
  const deliveryPrice = order.deliveryTotal || order.delivery?.price;

  return (
    <div className="rounded-2xl bg-zinc-100 p-4 md:p-8">
      {/* Botão de pagamento para pedidos em aberto */}
      {order.status === 0 && (
        <div>
          <Button
            style="btn-success"
            className="w-full"
            href={`/dashboard/pedidos/pagamento/${order.id}`}
          >
            Efetuar pagamento
          </Button>
          <div className="border-t -mx-8 my-8"></div>
        </div>
      )}

      {/* Mensagem de aguardando pagamento */}
      {order.status === -1 && (
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
        <div className="grid text-sm">
          <div className="text-zinc-900">
            Pedido nº <b>{order.id}</b>
          </div>
          <div>Realizado em {getShorDate(order.createdAt)}</div>
          {resume?.startDate && (
            <div>
              Agendado para: {dateBRFormat(resume.startDate)}{" "}
              {resume.endDate && resume.endDate !== resume.startDate
                ? `- ${dateBRFormat(resume.endDate)}`
                : ""}{" "}
              | {order.delivery?.schedule}
            </div>
          )}
          <div>
            Valor de entrega:{" "}
            {order.delivery?.price
              ? `R$ ${moneyFormat(order.delivery.price)}`
              : "Gratuita"}
          </div>
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
          total={order.total}
        />

        <div>
          <hr className="my-0" />
        </div>

        {/* Total final */}
        <div className="flex items-center gap-2">
          <div className="w-full font-title text-zinc-900 font-bold">TOTAL</div>
          <div className="text-2xl text-zinc-900 font-bold whitespace-nowrap">
            R$ {moneyFormat(order.total)}
          </div>
        </div>
      </div>
    </div>
  );
}
