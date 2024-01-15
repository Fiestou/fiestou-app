export const BlogForm = [
  {
    title: "Vitrine",
    fields: [
      {
        label: "Título",
        name: "blog_text",
        type: "input",
      },
      {
        label: "Ícones",
        name: "blog_icons",
        type: "media",
        options: {
          dir: "site",
        },
      },
      {
        label: "Descrição",
        name: "blog_description",
        type: "textarea",
      },
    ],
  },
];
