export const HomePartnerForm = [
  {
    title: "Vitrine",
    fields: [
      {
        label: "Mensagem de boas vindas",
        name: "main_text",
        type: "editor",
        options: {
          formate: "line",
        },
      },
    ],
  },
  {
    title: "",
    column: "sidebar",
    fields: [
      {
        label: "Cards de instruções",
        name: "help_list",
        type: "list",
        mainField: "help_title",
        singular: "Instrução",
        plural: "Instruções",
        fields: [
          {
            label: "Título",
            name: "help_title",
            type: "input",
          },
          {
            label: "Descrição",
            name: "help_text",
            type: "textarea",
          },
        ],
      },
    ],
  },
];
