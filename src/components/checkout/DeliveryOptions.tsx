import { AddressKind } from "@/src/models/address";
import { deliveryToName } from "@/src/models/delivery";
import Icon from "@/src/icons/fontAwesome/FIcon";

const DEFAULT_OPTIONS = [
  { type: "reception", icon: "fa-building", title: "Portaria" },
  { type: "door", icon: "fa-door-open", title: "Porta" },
  { type: "for_me", icon: "fa-user", title: "Receber pessoalmente" },
] as const;

const ADDRESS_KIND_OPTIONS: Array<{
  value: AddressKind;
  title: string;
  description: string;
  icon: string;
}> = [
  {
    value: "school",
    title: "Locais de Evento",
    description: "Escolas, salões, shoppings, parques e eventos.",
    icon: "fa-school",
  },
  {
    value: "home",
    title: "Casa",
    description: "Entrega residencial, condomínio ou apartamento.",
    icon: "fa-home",
  },
];

const GROUPED_OPTIONS: Record<
  AddressKind,
  Array<{ type: string; icon: string; title: string; description: string }>
> = {
  home: [
    {
      type: "reception",
      icon: "fa-building",
      title: "Deixar na portaria",
      description: "Ideal para condomínios e prédios.",
    },
    {
      type: "door",
      icon: "fa-door-open",
      title: "Deixar na porta",
      description: "Entrega direta no endereço informado.",
    },
    {
      type: "for_me",
      icon: "fa-user",
      title: "Estarei para receber",
      description: "A cliente ou responsável recebe em mãos.",
    },
  ],
  school: [
    {
      type: "reception",
      icon: "fa-building",
      title: "Deixar na portaria",
      description: "Entrega no acesso principal do local.",
    },
    {
      type: "school_reception",
      icon: "fa-concierge-bell",
      title: "Deixar na recepção",
      description: "Recepção, secretaria ou coordenação.",
    },
    {
      type: "school_room",
      icon: "fa-chalkboard-teacher",
      title: "Deixar em sala específica",
      description: "Use o complemento para indicar sala, bloco ou turma.",
    },
  ],
};

interface DeliveryOptionsProps {
  value: string;
  onChange: (value: string) => void;
  layout?: "default" | "grouped";
  addressKind?: AddressKind;
  onAddressKindChange?: (value: AddressKind) => void;
}

function SelectionCard({
  selected,
  onClick,
  icon,
  title,
  description,
}: {
  selected: boolean;
  onClick: () => void;
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border p-3 text-left transition-all duration-200 ${
        selected
          ? "border-yellow-400 bg-yellow-50 shadow-sm"
          : "border-zinc-200 bg-white hover:border-yellow-200 hover:bg-yellow-50/60"
      }`}
      aria-pressed={selected}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full border ${
            selected
              ? "border-yellow-200 bg-yellow-100 text-yellow-700"
              : "border-yellow-100 bg-zinc-50 text-yellow-600"
          }`}
        >
          <Icon icon={icon} className="text-base" />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-zinc-900">{title}</div>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            {description}
          </p>
        </div>
      </div>
    </button>
  );
}

export default function DeliveryOptions({
  value,
  onChange,
  layout = "default",
  addressKind = "home",
  onAddressKindChange,
}: DeliveryOptionsProps) {
  if (layout === "grouped") {
    const activeOptions = GROUPED_OPTIONS[addressKind];

    return (
      <div className="space-y-4">
        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm font-semibold text-zinc-900">
            Onde será a entrega?
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            Nesta versão, Locais de Evento e Casa ficam no mesmo bloco da instrução final.
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {ADDRESS_KIND_OPTIONS.map((option) => (
              <SelectionCard
                key={option.value}
                selected={addressKind === option.value}
                onClick={() => onAddressKindChange?.(option.value)}
                icon={option.icon}
                title={option.title}
                description={option.description}
              />
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white p-4">
          <p className="text-sm font-semibold text-zinc-900">
            Como devemos entregar nesse local?
          </p>
          <p className="mt-1 text-xs leading-relaxed text-zinc-500">
            Escolha a instrução mais próxima do destino final.
          </p>

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {activeOptions.map((option) => {
              const isSelected = value === option.type;

              return (
                <SelectionCard
                  key={option.type}
                  selected={isSelected}
                  onClick={() => onChange(option.type)}
                  icon={option.icon}
                  title={option.title}
                  description={option.description}
                />
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {DEFAULT_OPTIONS.map((option) => {
        const isSelected = value === option.type;

        return (
          <div
            key={option.type}
            onClick={() => onChange(option.type)}
            className={`cursor-pointer rounded-lg border p-3 transition-all duration-200 flex items-center gap-3 lg:p-4 ${
              isSelected
                ? "border-yellow-400 bg-yellow-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div
              className={`w-4 h-4 rounded-full border-2 relative flex-shrink-0 ${
                isSelected ? "border-yellow-500" : "border-gray-300"
              }`}
            >
              {isSelected && (
                <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-yellow-500"></div>
              )}
            </div>
            <div className="flex-1 text-sm font-medium leading-tight text-zinc-800">
              {deliveryToName[option.type]}
            </div>
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-yellow-100 bg-white text-yellow-600">
              <Icon icon={option.icon} className="text-sm" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
