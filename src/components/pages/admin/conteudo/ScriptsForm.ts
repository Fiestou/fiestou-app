export const ScriptsForm = [
  {
    title: "Informativo",
    fields: [
      {
        label: "Chamada principal",
        name: "lgpd_text",
        type: "input",
      },
      {
        label: "Termo de consentimento",
        name: "lgpd_description",
        type: "editor",
      },
    ],
  },
  {
    title: "Header",
    fields: [
      {
        label: "Scripts",
        name: "header_script_scripts",
        type: "list",
        mainField: "header_script_title",
        singular: "Script",
        plural: "Scripts",
        fields: [
          {
            label: "Título",
            name: "header_script_title",
            type: "input",
          },
          {
            label: "Descrição",
            name: "header_script_description",
            type: "textarea",
          },
          {
            label: "Obrigatório?",
            name: "header_script_required",
            type: "select",
          },
          {
            label: "Script",
            name: "header_script_code",
            type: "textarea",
          },
        ],
      },
    ],
  },
  {
    title: "Body",
    fields: [
      {
        label: "Scripts",
        name: "body_script_scripts",
        type: "list",
        mainField: "body_script_title",
        singular: "Script",
        plural: "Scripts",
        fields: [
          {
            label: "Título",
            name: "body_script_title",
            type: "input",
          },
          {
            label: "Descrição",
            name: "body_script_description",
            type: "textarea",
          },
          {
            label: "Obrigatório?",
            name: "body_script_required",
            type: "select",
          },
          {
            label: "Script",
            name: "body_script_code",
            type: "textarea",
          },
        ],
      },
    ],
  },
  {
    title: "Footer",
    fields: [
      {
        label: "Scripts",
        name: "footer_script_scripts",
        type: "list",
        mainField: "footer_script_title",
        singular: "Script",
        plural: "Scripts",
        fields: [
          {
            label: "Título",
            name: "footer_script_title",
            type: "input",
          },
          {
            label: "Descrição",
            name: "footer_script_description",
            type: "textarea",
          },
          {
            label: "Obrigatório?",
            name: "footer_script_required",
            type: "select",
          },
          {
            label: "Script",
            name: "footer_script_code",
            type: "textarea",
          },
        ],
      },
    ],
  },
];
