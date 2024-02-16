export const CheckoutForm = [
  {
    title: "Termos e condições",
    fields: [
      {
        label: "Lista de termos",
        name: "terms_list",
        type: "list",
        mainField: "term_description",
        singular: "Termo",
        plural: "Termos",
        fields: [
          {
            label: "Descrição",
            name: "term_description",
            type: "editor",
          },
        ],
      },
    ],
  },
];
