export const SeoForm = [
  {
    title: "Dados do site",
    fields: [
      {
        label: "Título principal",
        name: "site_text",
        type: "input",
      },
      {
        label: "Imagem principal",
        name: "site_image",
        type: "media",
        options: {
          dir: "site",
        },
      },
      {
        label: "Meta descrição",
        name: "site_description",
        type: "textarea",
      },
      {
        label: "Meta tags",
        name: "site_tags",
        type: "input",
      },
    ],
  },
];
