export const PartnerForm = [
  {
    title: "Vitrine",
    fields: [
      {
        label: "Chamada principal",
        name: "main_text",
        type: "input",
      },
      {
        label: "Descrição",
        name: "main_description",
        type: "textarea",
        options: {
          formate: "line",
          plugin: "quill",
        },
      },
      {
        label: "Imagem de fundo (desktop)",
        name: "main_cover",
        type: "media",
        column: "md:col-span-4",
        options: {
          dir: "site",
        },
      },
      {
        label: "Imagem de fundo (mobile)",
        name: "main_cover_mobile",
        type: "media",
        column: "md:col-span-2",
        options: {
          dir: "site",
        },
      },
    ],
  },
  {
    title: "Formulário",
    column: "sidebar",
    fields: [
      {
        label: "Título do formulário",
        name: "form_title",
        type: "input",
      },
      {
        label: "Termos de uso",
        name: "form_term",
        type: "textarea",
        options: {
          plugin: "quill",
        },
      },
      {
        label: "Texto do botão",
        name: "form_button",
        type: "input",
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
        label: "Descrição",
        name: "works_description",
        type: "textarea",
        options: {
          plugin: "quill",
        },
      },
      {
        label: "Explicação",
        name: "works_list",
        mainField: "work_title",
        type: "list",
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
    title: "Planos",
    fields: [
      {
        label: "Título",
        name: "plain_title",
        type: "input",
      },
      {
        label: "Chamada",
        name: "plain_text",
        type: "input",
      },
      {
        label: "Descrição",
        name: "plain_description",
        type: "textarea",
      },
      {
        label: "Lista de planos",
        name: "plans_list",
        mainField: "plan_title",
        type: "list",
        singular: "Lista de planos",
        plural: "Planos",
        fields: [
          {
            label: "Título",
            name: "plan_title",
            type: "input",
          },
          {
            label: "Valor",
            name: "plan_price",
            type: "input",
          },
          {
            label: "Descrição",
            name: "plan_description",
            type: "textarea",
          },
          {
            label: "Recursos",
            name: "plan_resources",
            type: "textarea",
          },
        ],
      },
    ],
  },
  {
    title: "FAQ",
    fields: [
      {
        label: "Título",
        name: "faq_title",
        type: "input",
      },
      {
        label: "Chamada",
        name: "faq_text",
        type: "input",
      },
      {
        label: "Descrição",
        name: "faq_description",
        type: "textarea",
      },
      {
        label: "Respostas",
        name: "faq_list",
        type: "list",
        mainField: "answer_question",
        singular: "Pergunta",
        plural: "Perguntas",
        fields: [
          {
            label: "Pergunta",
            name: "answer_question",
            type: "input",
          },
          {
            label: "Resposta",
            name: "answer_text",
            type: "textarea",
          },
        ],
      },
    ],
  },
  {
    title: "CTA",
    fields: [
      {
        label: "Chamada principal",
        name: "cta_text",
        type: "input",
      },
      {
        label: "Descrição",
        name: "cta_description",
        type: "textarea",
        options: {
          plugin: "quill",
        },
      },
      {
        label: "Imagem lateral",
        name: "cta_image",
        type: "media",
        options: {
          dir: "site",
        },
      },
      {
        label: "Texto do botão",
        name: "cta_button",
        type: "input",
      },
    ],
  },
];
