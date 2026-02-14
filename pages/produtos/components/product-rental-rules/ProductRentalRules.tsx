import Icon from "@/src/icons/fontAwesome/FIcon";

interface ProductRentalRulesProps {
  store: any;
}

export default function ProductRentalRules({ store }: ProductRentalRulesProps) {
  const rules = store?.rental_rules;
  if (!rules?.enabled) return null;

  const returnLabels: any = {
    same_day: "mesmo dia",
    next_day: "dia seguinte",
    "24h": "24 horas",
    "48h": "48 horas",
  };
  const returnText =
    rules.return_period === "custom"
      ? rules.return_period_custom
      : returnLabels[rules.return_period];

  const items: { icon: string; label: string; value: string }[] = [];

  if (returnText) {
    items.push({ icon: "fa-undo", label: "Devolução", value: returnText });
  }
  if (rules.deposit_enabled) {
    items.push({
      icon: "fa-shield",
      label: "Caução",
      value:
        rules.deposit_type === "fixed"
          ? `R$ ${rules.deposit_value}`
          : `${rules.deposit_value}% do valor`,
    });
  }
  if (rules.cancellation_deadline) {
    let val = `Até ${rules.cancellation_deadline}h antes`;
    if (rules.cancellation_fee) val += ` (multa ${rules.cancellation_fee}%)`;
    items.push({ icon: "fa-ban", label: "Cancelamento", value: val });
  }
  if (rules.late_fee_enabled && rules.late_fee_value) {
    items.push({
      icon: "fa-clock",
      label: "Atraso",
      value: `R$ ${rules.late_fee_value}/dia`,
    });
  }

  if (items.length === 0 && !rules.additional_rules) return null;

  return (
    <div className="border rounded-lg p-3 bg-gray-50">
      <div className="flex items-center gap-2 mb-2.5">
        <Icon icon="fa-file-contract" className="text-amber-600 text-sm" />
        <span className="font-semibold text-sm text-zinc-900">
          Regras de Locação
        </span>
      </div>

      {items.length > 0 && (
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {items.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <Icon
                icon={item.icon}
                className="text-xs text-amber-600 mt-0.5 flex-shrink-0"
              />
              <div className="text-xs text-zinc-700 leading-relaxed">
                <span className="font-medium">{item.label}:</span>{" "}
                {item.value}
              </div>
            </div>
          ))}
        </div>
      )}

      {rules.additional_rules && (
        <div className="mt-2.5 pt-2.5 border-t">
          <div className="flex items-start gap-2">
            <Icon
              icon="fa-info-circle"
              className="text-xs text-amber-600 mt-0.5 flex-shrink-0"
            />
            <div className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line">
              {rules.additional_rules}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
