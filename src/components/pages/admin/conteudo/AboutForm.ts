export const AboutForm = [
  {
    title: "Vitrine",
    fields: [
      {
        label: "Título",
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
  {
    title: "Funcionamento",
    fields: [
      {
        label: "Título",
        name: "works_title",
        type: "input",
      },
      {
        label: "Chamada",
        name: "works_text",
        type: "input",
      },
      {
        label: "Explicação",
        name: "works_list",
        type: "list",
        mainField: "work_title",
        singular: "Explicação",
        plural: "Explicações",
        fields: [
          {
            label: "Título",
            name: "work_title",
            type: "input",
          },
          {
            label: "Descrição",
            name: "work_description",
            type: "textarea",
          },
          {
            label: "Ícone",
            name: "work_image",
            type: "icon",
          },
        ],
      },
    ],
  },
  {
    title: "Texto institucional",
    fields: [
      {
        label: "Título",
        name: "about_title",
        type: "input",
      },
      {
        label: "Chamada",
        name: "about_text",
        type: "input",
      },
      {
        label: "Texto",
        name: "about_text",
        type: "editor",
      },
      {
        label: "Imagem lateral",
        name: "about_image",
        type: "media",
        options: {
          dir: "site",
        },
      },
    ],
  },
  {
    title: "Argumentação",
    fields: [
      {
        label: "Título",
        name: "args_title",
        type: "input",
      },
      {
        label: "Chamada",
        name: "args_text",
        type: "input",
      },
      {
        label: "Argumentos",
        name: "args_list",
        mainField: "arg_title",
        singular: "Argumento",
        plural: "Argumentos",
        type: "list",
        fields: [
          {
            label: "Título",
            name: "arg_title",
            type: "input",
          },
          {
            label: "Descrição",
            name: "arg_description",
            type: "textarea",
          },
          {
            label: "Ícone",
            name: "arg_image",
            type: "icon",
          },
        ],
      },
    ],
  },
];
