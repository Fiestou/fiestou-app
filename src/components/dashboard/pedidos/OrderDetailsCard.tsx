import { OrderType } from "@/src/models/order";
import {
  AddressType,
  getAddressKindLabel,
  isSchoolAddress,
  normalizeAddressShape,
} from "@/src/models/address";
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
}: OrderDetailsCardProps) => {
  const normalizedDeliveryAddress = normalizeAddressShape(deliveryAddress);
  const start = resume?.startDate ? dateBRFormat(resume.startDate) : "Não informado";
  const end =
    resume?.endDate && resume.endDate !== resume.startDate
      ? dateBRFormat(resume.endDate)
      : "";
  const scheduleLabel =
    typeof deliverySchedule === "object" && deliverySchedule
      ? [deliverySchedule.period, deliverySchedule.time].filter(Boolean).join(" - ")
      : deliverySchedule ?? "";

  return (
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
            {start}
            {end ? ` - ${end}` : ""} {scheduleLabel ? `| ${scheduleLabel}` : ""}
          </div>
        </div>

        <div className="flex gap-2 py-2 px-3 rounded-md">
          <div className="text-zinc-900 font-bold w-full max-w-[10rem]">
            Endereço de entrega
          </div>
          <div>
            <div>
              {getAddressKindLabel(normalizedDeliveryAddress)}
              {normalizedDeliveryAddress.locationName
                ? ` | ${normalizedDeliveryAddress.locationName}`
                : ""}
            </div>
            <div>
              {normalizedDeliveryAddress.street || "Rua não informada"}
              {normalizedDeliveryAddress.number ? `, ${normalizedDeliveryAddress.number}` : ""}
              {normalizedDeliveryAddress.neighborhood ? ` - ${normalizedDeliveryAddress.neighborhood}` : ""}
            </div>
            <div>
              CEP: {normalizedDeliveryAddress.zipCode || "Não informado"} | {normalizedDeliveryAddress.city || "Cidade não informada"} |{" "}
              {normalizedDeliveryAddress.state || "UF não informada"} - {normalizedDeliveryAddress.country || "Brasil"}
            </div>
            <div>
              {normalizedDeliveryAddress.complement || "Sem complemento"} | {deliveryTo ?? "Instrução não informada"}
            </div>
            {isSchoolAddress(normalizedDeliveryAddress) && !normalizedDeliveryAddress.locationName && (
              <div>Nome do local não informado</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
