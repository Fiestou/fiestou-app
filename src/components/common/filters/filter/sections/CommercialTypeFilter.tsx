import {
  Briefcase,
  Clock3,
  Tag,
  UtensilsCrossed,
} from "lucide-react";

const COMMERCIAL_TYPES = [
  {
    value: "aluguel",
    label: "Aluguel",
    description: "Produto alugado por período",
    icon: Clock3,
    tone: "blue",
  },
  {
    value: "venda",
    label: "Venda",
    description: "Produto vendido definitivamente",
    icon: Tag,
    tone: "emerald",
  },
  {
    value: "comestivel",
    label: "Comestível",
    description: "Alimentos e bebidas",
    icon: UtensilsCrossed,
    tone: "amber",
  },
  {
    value: "servicos",
    label: "Serviços",
    description: "Prestação de serviço",
    icon: Briefcase,
    tone: "violet",
  },
];

const toneMap: Record<string, string> = {
  blue: "border-blue-200 bg-blue-50 text-blue-900 shadow-sm",
  emerald: "border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm",
  amber: "border-amber-200 bg-amber-50 text-amber-900 shadow-sm",
  violet: "border-violet-200 bg-violet-50 text-violet-900 shadow-sm",
};

const cardIdleMap: Record<string, string> = {
  blue: "hover:border-blue-200 hover:bg-blue-50/40",
  emerald: "hover:border-emerald-200 hover:bg-emerald-50/40",
  amber: "hover:border-amber-200 hover:bg-amber-50/40",
  violet: "hover:border-violet-200 hover:bg-violet-50/40",
};

const iconToneMap: Record<string, string> = {
  blue: "bg-blue-100 text-blue-700 ring-blue-200/70",
  emerald: "bg-emerald-100 text-emerald-700 ring-emerald-200/70",
  amber: "bg-amber-100 text-amber-700 ring-amber-200/70",
  violet: "bg-violet-100 text-violet-700 ring-violet-200/70",
};

export default function CommercialTypeFilter({
  value,
  onChange,
  availableTypes,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  availableTypes?: string[];
}) {
  const selected = Array.isArray(value) ? value : [];
  const allowedTypes = Array.isArray(availableTypes)
    ? new Set([...availableTypes, ...selected])
    : null;
  const visibleTypes = allowedTypes
    ? COMMERCIAL_TYPES.filter((item) => allowedTypes.has(item.value))
    : COMMERCIAL_TYPES;

  const toggleType = (type: string) => {
    const next = selected.includes(type)
      ? selected.filter((item) => item !== type)
      : [...selected, type];

    onChange(next);
  };

  if (!visibleTypes.length) {
    return null;
  }

  return (
    <div className="pb-6">
      <div className="mb-2">
        <div className="text-sm font-semibold text-zinc-900">Tipo comercial</div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {visibleTypes.map((item) => {
          const Icon = item.icon;
          const active = selected.includes(item.value);

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => toggleType(item.value)}
              className={`rounded-2xl border px-3 py-3 text-center transition-all ${
                active
                  ? toneMap[item.tone]
                  : `border-zinc-200 bg-white text-zinc-700 ${cardIdleMap[item.tone]}`
              }`}
            >
              <span
                className={`mx-auto mb-2 inline-flex h-11 w-11 items-center justify-center rounded-2xl ring-1 shadow-sm ${iconToneMap[item.tone]}`}
              >
                <Icon size={20} strokeWidth={2.2} />
              </span>
              <div className="text-sm font-semibold leading-tight">{item.label}</div>
              <div className={`mt-1 text-[11px] leading-4 ${active ? "text-current/80" : "text-zinc-500"}`}>
                {item.description}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
