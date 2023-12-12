export const AccountForm = [
  {
    title: "Instruções",
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
          {
            label: "Ícone",
            name: "help_icon",
            type: "icon",
          },
        ],
      },
    ],
  },
];
