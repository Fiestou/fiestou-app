import { deliveryToName } from "@/src/models/delivery";

const DELIVERY_OPTIONS = [
  { type: "reception", icon: "🏢" },
  { type: "door", icon: "🚪" },
  { type: "for_me", icon: "📦" },
] as const;

type DeliveryType = typeof DELIVERY_OPTIONS[number]["type"];

interface DeliveryOptionsProps {
  value: string;
  onChange: (value: string) => void;
}

export default function DeliveryOptions({
  value,
  onChange,
}: DeliveryOptionsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      {DELIVERY_OPTIONS.map((option, key) => {
        const isSelected = value === option.type;

        return (
          <div
            key={key}
            onClick={() => onChange(option.type)}
            className={`border ${
              isSelected
                ? "border-yellow-400 bg-yellow-50"
                : "border-gray-200 hover:border-gray-300"
            } p-3 lg:p-4 cursor-pointer rounded-lg transition-all duration-200 flex gap-3 items-center`}
          >
            <div
              className={`${
                isSelected ? "border-yellow-500" : "border-gray-300"
              } w-4 h-4 rounded-full border-2 relative flex-shrink-0`}
            >
              {isSelected && (
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 bg-yellow-500 rounded-full"></div>
              )}
            </div>
            <div className="text-sm font-medium leading-tight flex-1">
              {deliveryToName[option.type]}
            </div>
            <span className="text-lg">{option.icon}</span>
          </div>
        );
      })}
    </div>
  );
}
