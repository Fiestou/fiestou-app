export const ContactForm = [
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
    title: "Informações",
    fields: [
      {
        label: "Descrição",
        name: "contact_description",
        type: "textarea",
        options: {
          plugin: "quill",
        },
      },
      {
        label: "E-mail público",
        name: "contact_email",
        type: "input",
      },
      {
        label: "Celular público",
        name: "contact_phone",
        type: "input",
      },
      {
        label: "Endereço",
        name: "contact_address",
        type: "textarea",
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
        mainField: "answer_name",
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
