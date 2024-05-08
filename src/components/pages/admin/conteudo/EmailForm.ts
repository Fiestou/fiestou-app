export const EmailForm = [
  {
    title: "Cadastro de usuário",
    fields: [
      {
        label: "",
        type: "message",
        content: "Variáveis disponíveis: <b>{user_name}</b>",
      },
      {
        label: "Assunto",
        name: "register_subject",
        type: "input",
      },
      {
        label: "Imagem destaque",
        name: "register_image",
        type: "media",
        options: {
          dir: "site",
        },
      },
      {
        label: "Corpo do email",
        name: "register_body",
        type: "editor",
      },
    ],
  },
  {
    title: "Compra realizada",
    fields: [
      {
        label: "",
        type: "message",
        content:
          "Variáveis disponíveis: <b>{user_name}, {items_order}, {order_code}</b>",
      },
      {
        label: "Assunto",
        name: "order_subject",
        type: "input",
      },
      {
        label: "Imagem destaque",
        name: "order_image",
        type: "media",
        options: {
          dir: "site",
        },
      },
      {
        label: "Corpo do email",
        name: "order_body",
        type: "editor",
      },
    ],
  },
  {
    title: "Aviso ao parceiro de compra realizada",
    fields: [
      {
        label: "",
        type: "message",
        content: "Variáveis disponíveis: <b>{partner_name}, {order_code}</b>",
      },
      {
        label: "Assunto",
        name: "partner_order_subject",
        type: "input",
      },
      {
        label: "Imagem destaque",
        name: "partner_order_image",
        type: "media",
        options: {
          dir: "site",
        },
      },
      {
        label: "Corpo do email",
        name: "partner_order_body",
        type: "editor",
      },
    ],
  },
  {
    title: "Pagamento efetuado",
    fields: [
      {
        label: "",
        type: "message",
        content: "Variáveis disponíveis: <b>{user_name}, {order_code}</b>",
      },
      {
        label: "Assunto",
        name: "order_complete_subject",
        type: "input",
      },
      {
        label: "Imagem destaque",
        name: "order_complete_image",
        type: "media",
        options: {
          dir: "site",
        },
      },
      {
        label: "Corpo do email",
        name: "order_complete_body",
        type: "editor",
      },
    ],
  },
  {
    title: "Status de entrega",
    fields: [
      {
        label: "",
        type: "message",
        content:
          "Variáveis disponíveis: <b>{user_name}, {status_delivery}, {order_code}</b>",
      },
      {
        label: "Assunto",
        name: "delivery_subject",
        type: "input",
      },
      {
        label: "Imagem destaque",
        name: "delivery_image",
        type: "media",
        options: {
          dir: "site",
        },
      },
      {
        label: "Corpo do email",
        name: "delivery_body",
        type: "editor",
      },
    ],
  },
];
