export const DashboardForm = [
  {
    title: "Mensagem ao usuário",
    fields: [
      {
        label: "Mensagem principal",
        name: "board_text",
        type: "input",
        help: "Utilize {first_name} para representar o nome do usuário.",
      },
      {
        label: "Descritivo",
        name: "board_desc",
        type: "textarea",
      },
    ],
  },
  {
    title: "Atalhos",
    fields: [
      {
        label: "Pedidos",
        name: "board_order_desc",
        type: "input",
      },
      {
        label: "Meus dados",
        name: "board_user_desc",
        type: "input",
      },
      {
        label: "Favoritos",
        name: "board_likes_desc",
        type: "input",
      },
      {
        label: "Endereços",
        name: "board_address_desc",
        type: "input",
      },
      {
        label: "Chat",
        name: "board_chat_desc",
        type: "input",
      },
    ],
  },
];
