import { OrderType } from "@/src/models/order";
import { AddressType } from "@/src/models/address";
import { dateBRFormat, getShorDate } from "@/src/helper";

interface OrderDetailsCardProps {
  order: OrderType;
  resume: { startDate?: string; endDate?: string };
  deliveryAddress?: AddressType | null;
  deliverySchedule?: any;
  deliveryTo?: string;
}

export const OrderDetailsCard = ({
  order,
  resume,
  deliveryAddress,
  deliverySchedule,
  deliveryTo,
}: OrderDetailsCardProps) => (
  <div className="grid">
    <h4 className="text-xl md:text-2xl text-zinc-800">Detalhes do pedido</h4>
    <div className="grid border rounded-xl p-2 text-sm mt-4">
      <div className="flex gap-2 py-2 px-3 bg-zinc-100 rounded-md">
        <div className="text-zinc-900 font-bold w-full max-w-[10rem]">
          Pedido
        </div>
        <div>#{order.id}</div>
      </div>

      <div className="flex gap-2 py-2 px-3 rounded-md">
        <div className="text-zinc-900 font-bold w-full max-w-[10rem]">
          Realizado em
        </div>
        <div>{getShorDate(order.createdAt)}</div>
      </div>

      <div className="flex gap-2 py-2 px-3 bg-zinc-100 rounded-md">
        <div className="text-zinc-900 font-bold w-full max-w-[10rem]">
          Agendado para
        </div>
        <div>
          {dateBRFormat(resume.startDate)}
          {resume.endDate !== resume.startDate
            ? ` - ${dateBRFormat(resume.endDate)}`
            : ""}{" "}
          | {typeof deliverySchedule === 'object' && deliverySchedule
            ? [deliverySchedule.period, deliverySchedule.time].filter(Boolean).join(' - ')
            : deliverySchedule ?? ''}
        </div>
      </div>

      <div className="flex gap-2 py-2 px-3 rounded-md">
        <div className="text-zinc-900 font-bold w-full max-w-[10rem]">
          Endereço de entrega
        </div>
        <div>
          <div>
            {deliveryAddress?.street}, {deliveryAddress?.number} -{" "}
            {deliveryAddress?.neighborhood}
          </div>
          <div>
            CEP: {deliveryAddress?.zipCode} | {deliveryAddress?.city} |{" "}
            {deliveryAddress?.state} - {deliveryAddress?.country}
          </div>
          <div>
            {deliveryAddress?.complement} | {deliveryTo ?? ""}
          </div>
        </div>
      </div>
    </div>
  </div>
);
