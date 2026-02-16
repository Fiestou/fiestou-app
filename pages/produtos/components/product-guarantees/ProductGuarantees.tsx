import Icon from "@/src/icons/fontAwesome/FIcon";

export default function ProductGuarantees() {
  const guarantees = [
    {
      icon: "fa-shield-alt",
      title: "Pagamento seguro",
      desc: "Receba o item no dia marcado ou devolvemos o dinheiro",
      important: true,
    },
    {
      icon: "fa-calendar-times",
      title: "Cancelamento fácil",
      desc: "1 dia antes da entrega, pode cancelar o pedido",
      important: false,
    },
    {
      icon: "fa-check-circle",
      title: "Parceiro confiável",
      desc: "Garantia do Fiestou da entrega",
      important: true,
    },
  ];

  return (
    <div className="border rounded-lg p-3 space-y-2.5">
      {guarantees.map((item, i) => (
        <div key={i} className="flex items-start gap-2.5">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-amber-50 flex items-center justify-center">
            <Icon icon={item.icon} className="text-amber-600 text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <div
              className={`text-sm font-medium ${
                item.important ? "text-emerald-700" : "text-zinc-900"
              }`}
            >
              {item.title}
            </div>
            <div
              className={`text-xs leading-relaxed ${
                item.important ? "text-emerald-700/90" : "text-zinc-600"
              }`}
            >
              {item.desc}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
