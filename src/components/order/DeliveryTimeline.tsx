import Icon from "@/src/icons/fontAwesome/FIcon";
import { deliveryTypes } from "@/src/models/delivery";
import { getShorDate } from "@/src/helper";

interface DeliveryTimelineProps {
  deliveryStatus?: string;
  createdAt?: string;
}

export default function DeliveryTimeline({ deliveryStatus, createdAt }: DeliveryTimelineProps) {
  const valid = deliveryTypes.filter(
    (item) => !["canceled", "returned"].includes(item.value)
  );
  console.log("DeliveryTimeline deliveryStatus:", deliveryStatus);

  const active = valid.findIndex((step) => step.value === deliveryStatus);

  return (
    <div className="grid">
      {/* Primeiro passo - Pedido realizado */}
      <div className="relative flex pb-8">
        <div className="absolute top-0 left-0 border-l-2 border-dashed h-full ml-3"></div>
        <div className="w-fit">
          <div className="p-3 bg-green-500 rounded-full relative">
            <Icon
              icon="fa-check"
              className="absolute text-white text-xs top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </div>
        </div>
        <div className="w-full pl-3">
          <div className="font-bold text-zinc-900">
            Pedido realizado - {getShorDate(createdAt)}
          </div>
          <div className="text-sm">Seu pedido foi registrado.</div>
        </div>
      </div>

      {/* Demais passos */}
      {valid.map((step, index) => {
        const isCompleted = index < active;
        const isCurrent = index === active;

        const circleColor = isCompleted
          ? "bg-green-500"
          : isCurrent
            ? "bg-yellow-400"
            : "bg-zinc-400";

        return (
          <div key={step.value} className="relative flex pb-8">
            {index !== valid.length - 1 && (
              <div className="absolute top-0 left-0 border-l-2 border-dashed h-full ml-3"></div>
            )}

            <div className="w-fit">
              <div className="p-3 rounded-full relative">
                <div className={`${circleColor} p-3 rounded-full relative`}>
                  {isCompleted && (
                    <Icon
                      icon="fa-check"
                      className="absolute text-white text-xs top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    />
                  )}
                </div>
              </div>
            </div>

            <div className={`w-full pl-3 ${index > active ? "opacity-40" : ""}`}>
              <div className="font-bold text-zinc-900">{step.name}</div>
              <div className="text-sm">{step.description}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
