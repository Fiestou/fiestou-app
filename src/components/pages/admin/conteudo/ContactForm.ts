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
        type: "editor",
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
        label: "E-mail de contato",
        name: "contact_email",
        type: "input",
      },
      {
        label: "E-mail de suporte",
        name: "contact_email_support",
        type: "input",
      },
      {
        label: "Celular público",
        name: "contact_phone",
        type: "input",
      },
      {
        label: "Celular de suporte",
        name: "contact_phone_support",
        type: "input",
      },
      {
        label: "Endereço",
        name: "contact_address",
        type: "textarea",
      },
    ],
  },
];
