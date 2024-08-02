export const HomeForm = [
  {
    title: "Vitrine",
    fields: [
      {
        label: "Slide",
        mainField: "main_slide_text",
        singular: "Slide",
        plural: "Slides",
        name: "main_slide",
        type: "list",
        fields: [
          {
            label: "Chamada principal",
            name: "main_slide_text",
            type: "input",
          },
          {
            label: "Descrição",
            name: "main_slide_description",
            type: "editor",
            options: {
              formate: "line",
            },
          },
          {
            label: "Redirecionamento principal",
            name: "main_slide_redirect",
            type: "redirect",
          },
          {
            label: "Imagem de fundo (desktop)",
            name: "main_slide_cover",
            type: "media",
            options: {
              dir: "site",
            },
          },
          {
            label: "Imagem de fundo (mobile)",
            name: "main_slide_cover_mobile",
            type: "media",
            options: {
              dir: "site",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Carrossel explicativo",
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
        label: "Etapas",
        mainField: "step_text",
        singular: "Etapa",
        plural: "Etapas",
        name: "works_steps",
        type: "list",
        fields: [
          {
            label: "Chamada principal",
            name: "step_text",
            type: "input",
          },
          {
            label: "Imagem de fundo",
            name: "step_cover",
            type: "media",
            options: {
              dir: "site",
            },
          },
        ],
      },
    ],
  },
  {
    title: "Categorias",
    fields: [
      {
        label: "Título",
        name: "categories_title",
        type: "input",
      },
      {
        label: "Chamada",
        name: "categories_text",
        type: "input",
      },
      {
        label: "Descrição",
        name: "categories_description",
        type: "textarea",
      },
      {
        label: "Redirecionamento",
        name: "categories_redirect",
        type: "redirect",
      },
    ],
  },
  {
    title: "Produtos em destaque",
    fields: [
      {
        label: "Título",
        name: "feature_title",
        type: "input",
      },
      {
        label: "Chamada",
        name: "feature_text",
        type: "input",
      },
      {
        label: "Redirecionamento",
        name: "feature_redirect",
        type: "redirect",
      },
    ],
  },
  {
    title: "Seja parceiro",
    fields: [
      {
        label: "Título",
        name: "partner_title",
        type: "input",
      },
      {
        label: "Chamada",
        name: "partner_text",
        type: "input",
      },
      {
        label: "Parceiros",
        name: "partner_list",
        type: "list",
        mainField: "partner_item_title",
        singular: "Parceiro",
        plural: "Parceiros",
        fields: [
          {
            label: "Título",
            name: "partner_item_title",
            type: "input",
          },
          {
            label: "Link",
            name: "partner_item_link",
            type: "input",
          },
          {
            label: "Imagem",
            name: "partner_item_image",
            type: "media",
            options: {
              dir: "site",
            },
          },
        ],
      },
      {
        label: "Chamada secundária",
        name: "partner_text_secondary",
        type: "input",
      },
      {
        label: "Descrição",
        name: "partner_description_secondary",
        type: "textarea",
      },
      {
        label: "Redirecionamento",
        name: "partner_redirect",
        type: "redirect",
      },
      {
        label: "Imagem",
        name: "partner_image",
        type: "media",
        options: {
          dir: "site",
        },
      },
    ],
  },
  {
    title: "Depoimentos",
    fields: [
      {
        label: "Título",
        name: "quotes_title",
        type: "input",
      },
      {
        label: "Chamada",
        name: "quotes_text",
        type: "input",
      },
      {
        label: "Descrição",
        name: "quotes_description",
        type: "textarea",
      },
      {
        label: "Depoimentos",
        name: "quotes_list",
        type: "list",
        mainField: "quote_name",
        singular: "Depoimento",
        plural: "Depoimentos",
        fields: [
          {
            label: "Foto",
            name: "quote_image",
            type: "media",
            options: {
              dir: "site",
              type: "thumb",
            },
          },
          {
            label: "Nome",
            name: "quote_name",
            type: "input",
          },
          {
            label: "Atividade",
            name: "quote_work",
            type: "input",
          },
          {
            label: "Depoimento",
            name: "quote_text",
            type: "textarea",
          },
        ],
      },
    ],
  },
  {
    title: "Blog",
    fields: [
      {
        label: "Título",
        name: "blog_title",
        type: "input",
      },
      {
        label: "Subtítulo",
        name: "blog_subtitle",
        type: "input",
      },
    ],
  },
];
