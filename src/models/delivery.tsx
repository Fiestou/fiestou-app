export const deliveryTypes = [
  {
    name: "Pagamento",
    icon: "⌛",
    value: "pending",
    background: "bg-zinc-300",
    description: "Etapa de confirmação de pagamento.",
  },
  {
    name: "Em separação",
    icon: "👍",
    value: "paid",
    background: "bg-blue-400",
    description:
      "Seu pedido já esta em nosso sistema e estamos preparando para envio.",
  },
  {
    name: "Em separação",
    icon: "👍",
    value: "processing",
    background: "bg-blue-400",
    description:
      "Seu pedido já esta em nosso sistema e estamos preparando para envio.",
  },
  {
    name: "Enviado",
    icon: "📦",
    value: "sent",
    background: "bg-yellow-300",
    description: "Seu Pedido já foi enviado e logo estará em trânsito.",
  },
  {
    name: "Em trânsito",
    icon: "🚚",
    value: "transiting",
    background: "bg-yellow-500",
    description: "Seu pedido está indo até você",
  },
  {
    name: "Entregue",
    icon: "☑️",
    value: "received",
    background: "bg-green-300",
    description: "Seu pedido foi entregue.",
  },
  {
    name: "Retornado",
    icon: "🔄",
    value: "returned",
    background: "bg-purple-400",
    description: "Seu pedido retornou por falta de recebimento.",
  },
  {
    name: "Cancelado",
    icon: "❌",
    value: "canceled",
    background: "bg-red-400",
    description: "Seu pedido foi cancelado.",
  },
  {
    name: "Aguardando retirada",
    icon: "⏱️",
    value: "waitingWithdrawal",
    background: "bg-blue-200",
    description: "Aguardando o cliente retirar.",
  },
  {
    name: "Chegando para recolher",
    icon: "🚚",
    value: "collect",
    background: "bg-blue-300",
    description: "Chegando para devolução",
  },
  {
    name: "Concluído",
    icon: "✅",
    value: "complete",
    background: "bg-green-600",
    description: `Esperamos que tenha gostado da experiência FIESTOU. Obrigado!`,
  },
];

export const deliveryToName: Record<string, string> = {
  reception: "Entregar na portaria",
  door: "Deixar na porta",
  for_me: "Estarei para receber",
};