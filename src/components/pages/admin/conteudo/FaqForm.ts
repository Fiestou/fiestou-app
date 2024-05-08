export const FaqForm = [
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
        type: "editor",
      },
    ],
  },
  {
    title: "FAQ",
    fields: [
      {
        label: "Perguntas e Respostas",
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
        type: "editor",
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
        name: "cta_redirect",
        type: "redirect",
      },
    ],
  },
];
