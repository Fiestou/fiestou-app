export const deliveryTypes = [
  {
    name: "Aguardando pagamento",
    value: "pending",
    description:
      "Seu pagamento ainda não for confirmado pelo getway de pagamento.",
  },
  {
    name: "Processando",
    value: "processing",
    description:
      "Seu pedido já esta em nosso sistema e estamos preparando para envio.",
  },
  {
    name: "Enviado",
    value: "sent",
    description: "Seu Pedido já foi enviado e logo estará em trânsito.",
  },
  {
    name: "Em trânsito",
    value: "transiting",
    description: "Seu pedido está indo até você",
  },
  {
    name: "Entregue",
    value: "received",
    description: "Seu pedido foi entregue.",
  },
  {
    name: "Retornado",
    value: "returned",
    description: "Seu pedido retornou por falta de recebimento.",
  },
  {
    name: "Cancelado",
    value: "canceled",
    description: "Seu pedido foi cancelado.",
  },
  {
    name: "Aguardando retirada",
    value: "waitingWithdrawal",
    description: "Aguardando para devolução",
  },
  {
    name: "Concluído",
    value: "complete",
    description: `Esperamos que tenha gostado da experiência FIESTOU. Obrigado!`,
  },
];
