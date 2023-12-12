export const HeaderFooterForm = [
  {
    title: "Menu",
    fields: [
      {
        label: "Logo",
        name: "header_logo",
        type: "media",
        options: {
          dir: "site",
        },
        column: "md:col-span-4",
      },
      {
        label: "Ícone",
        name: "header_icon",
        type: "media",
        options: {
          dir: "site",
        },
        column: "md:col-span-2",
      },
      {
        label: "Links principais",
        name: "menu_links",
        type: "list",
        mainField: "menu_title",
        singular: "Link",
        plural: "Links",
        fields: [
          {
            label: "Título",
            name: "menu_title",
            type: "input",
          },
          {
            label: "Ícone",
            name: "menu_icon",
            type: "icon",
          },
          {
            label: "Link",
            name: "menu_link",
            type: "input",
          },
        ],
      },
      {
        label: "Links dropdown",
        name: "dropdown_links",
        type: "list",
        mainField: "dropdown_title",
        singular: "Link",
        plural: "Links",
        fields: [
          {
            label: "Título",
            name: "dropdown_title",
            type: "input",
          },
          {
            label: "Link",
            name: "dropdown_link",
            type: "input",
          },
        ],
      },
    ],
  },
  {
    title: "Rodapé",
    fields: [
      {
        label: "Logo",
        name: "footer_logo",
        type: "media",
        options: {
          dir: "site",
        },
      },
      {
        label: "Descrição breve",
        name: "footer_text",
        type: "textarea",
      },
      {
        label: "Coluna de links",
        name: "column_links",
        type: "list",
        mainField: "column_title",
        singular: "Coluna",
        plural: "Colunas",
        fields: [
          {
            label: "Título",
            name: "column_title",
            type: "input",
          },
          {
            label: "Lista de links",
            name: "column_list_links",
            type: "list",
            mainField: "column_list_title",
            singular: "Link",
            plural: "Links",
            fields: [
              {
                label: "Título",
                name: "column_list_title",
                type: "input",
              },
              {
                label: "Link",
                name: "column_list_link",
                type: "input",
              },
            ],
          },
        ],
      },
      {
        label: 'Coluna "Siga nas redes"',
        name: "social",
        type: "list",
        mainField: "social_title",
        singular: "Rede",
        plural: "Redes",
        fields: [
          {
            label: "Título",
            name: "social_title",
            type: "input",
          },
          {
            label: "Link",
            name: "social_link",
            type: "input",
          },
        ],
      },
    ],
  },
];
