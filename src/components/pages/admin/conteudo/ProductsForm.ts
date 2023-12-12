export const ProductsForm = [
  {
    title: "Vitrine",
    fields: [
      {
        label: "Chamada principal",
        name: "main_text",
        type: "input",
      },
      {
        label: "Ícones",
        name: "main_icons",
        type: "media",
        options: {
          dir: "site",
        },
      },
      {
        label: "Descrição",
        name: "main_description",
        type: "textarea",
      },
    ],
  },
];
