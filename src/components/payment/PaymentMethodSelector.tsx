import Img from "@/src/components/utils/ImgBase";

type PaymentMethod = "credit_card" | "boleto" | "pix";

interface PaymentMethodSelectorProps {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
  children?: {
    credit_card?: React.ReactNode;
    boleto?: React.ReactNode;
    pix?: React.ReactNode;
  };
}

const PAYMENT_METHODS = [
  { type: "credit_card" as const, label: "CARTÃO DE CRÉDITO", icon: "/images/pagarme/card-icon.png" },
  { type: "boleto" as const, label: "BOLETO", icon: "/images/pagarme/document-icon.png" },
  { type: "pix" as const, label: "PIX", icon: "/images/pagarme/pix-icon.png" },
];

export default function PaymentMethodSelector({
  value,
  onChange,
  children,
}: PaymentMethodSelectorProps) {
  return (
    <div className="bg-white rounded-xl grid">
      {PAYMENT_METHODS.map((method, index) => {
        const isSelected = value === method.type;
        const content = children?.[method.type];

        return (
          <div key={method.type} className={index > 0 ? "border-t" : ""}>
            <MethodOptionHeader
              label={method.label}
              icon={method.icon}
              selected={isSelected}
              onClick={() => onChange(method.type)}
            />
            {isSelected && content}
          </div>
        );
      })}
    </div>
  );
}

function MethodOptionHeader({
  label,
  icon,
  selected,
  onClick,
}: {
  label: string;
  icon: string;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="p-3 md:p-4 cursor-pointer flex gap-2 items-center"
    >
      <div
        className={`border ${
          selected ? "border-zinc-400" : "border-zinc-300"
        } w-[1rem] rounded-full h-[1rem] relative`}
      >
        {selected && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[.5rem] h-[.5rem] bg-yellow-400 rounded-full" />
        )}
      </div>
      <div className="leading-tight text-zinc-900 font-semibold flex items-center gap-1">
        <Img src={icon} className="w-[1.75rem]" />
        <div className="w-full">{label}</div>
      </div>
    </div>
  );
}
