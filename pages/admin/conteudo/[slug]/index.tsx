import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { Button, Label, Select } from "@/src/components/ui/form";
import { useState } from "react";
import Api from "@/src/services/api";
import { useRouter } from "next/router";
import HandleField from "@/src/components/ui/form/HandleField";
import { HandleGetFields } from "@/src/components/pages/admin/conteudo/ContentForm";

export async function getServerSideProps(ctx: any) {
  const api = new Api();
  const { slug } = ctx.query;

  const formFields = HandleGetFields(slug);

  if (!formFields?.title) {
    return {
      redirect: {
        permanent: false,
        destination: "/admin/conteudo",
      },
    };
  }

  let request: any = await api.call({
    url: "request/graph",
    data: [
      {
        model: "page",
        filter: [
          {
            key: "slug",
            value: slug,
            compare: "=",
          },
        ],
      },
    ],
  });

  // console.log(request, "<<");

  return {
    props: {
      page: request?.data?.query?.page[0] ?? {},
      formFields: formFields,
    },
  };
}

const formInitial = {
  sended: false,
  loading: false,
};

export default function Form({
  page,
  formFields,
}: {
  page: any;
  formFields: any;
}) {
  const api = new Api();
  const router = useRouter();

  const [form, setForm] = useState(formInitial);
  const setFormValue = (value: any) => {
    setForm((form) => ({ ...form, ...value }));
  };

  const [content, setContent] = useState(
    { ...page, publicUrl: formFields?.publicUrl ?? "" } ?? ({} as any)
  );
  const handleContent = (name: any, value: any) => {
    let handle: any = content;

    handle[name] = value;

    setContent(handle);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setFormValue({ loading: true });

    const handle = {
      ...content,
    };

    const request: any = await api.graph({
      url: "content/graph",
      data: [
        {
          method: "register",
          model: "page",
          id: content.id ?? null,
          title: formFields?.title ?? null,
          slug: formFields?.slug ?? null,
          status: content?.status,
          content: handle,
        },
      ],
    });

    setContent(handle);

    if (request.response) {
      setFormValue({ loading: false, sended: request.response });
      // router.push({ pathname: "/admin/conteudo" });
    } else {
      setFormValue({ loading: false, sended: request.response });
    }
  };

  const renderSectionsForm = (sections: any) => {
    return (
      !!sections &&
      sections.map((group: any, key: any) => (
        <div
          key={key}
          className={`${group?.width ?? "w-full"} border-t pt-4 pb-2`}
        >
          {group.title && (
            <h4 className="text-2xl text-zinc-900 mb-2">{group.title}</h4>
          )}
          <div className="grid grid-cols-6 justify-between gap-2">
            {group.fields &&
              group.fields.map((field: any, index: any) => (
                <div
                  key={index}
                  className={`col-span-6 ${field?.column ?? ""}`}
                >
                  <div className="form-group">
                    <Label style="float">{field.label}</Label>
                    <HandleField
                      {...field}
                      value={content[field.name]}
                      emitChange={(value?: any) => {
                        handleContent(field.name, value);
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))
    );
  };

  return (
    !router.isFallback && (
      <Template
        header={{
          template: "admin",
          position: "solid",
        }}
        footer={{
          template: "clear",
        }}
      >
        <form onSubmit={(e: any) => handleSubmit(e)}>
          <section className="">
            <div className="container-medium pt-6 md:pt-12 pb-4 md:pb-8">
              <div className="flex">
                <div className="w-full">Produtos {">"} Title</div>
                {!!page.publicUrl && (
                  <Link
                    href={`/api/cache?redirect=${page.publicUrl}`}
                    target="_blank"
                    className="whitespace-nowrap flex items-center gap-2 ease hover:text-zinc-900 font-semibold"
                  >
                    Limpar cache
                    <Icon icon="fa-sync" className="text-xs mt-1" />
                  </Link>
                )}
              </div>
              <div className="flex items-end">
                <div className="w-full flex items-center mt-6 md:mt-10">
                  <Link passHref href="/admin/conteudo">
                    <Icon
                      icon="fa-long-arrow-left"
                      className="mr-6 text-2xl text-zinc-900"
                    />
                  </Link>
                  <div className="font-title font-bold text-2xl md:text-4xl flex gap-4 items-center text-zinc-900 w-full">
                    Editando {`"${formFields?.title}"`}
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="">
            <div className="container-medium pb-12">
              <div className="grid lg:flex gap-10 ld:gap-20 items-start">
                <div className="w-full grid gap-8">
                  <div className="flex flex-wrap w-full gap-6">
                    {!!formFields?.form &&
                      renderSectionsForm(
                        formFields?.form.filter(
                          (item: any) => item.column != "sidebar"
                        )
                      )}
                  </div>
                </div>
                <div className="w-full lg:max-w-[20rem] grid gap-4 pb-2">
                  <div className="order-last lg:order-1 grid">
                    <Button loading={form.loading}>Salvar</Button>
                  </div>
                  <div className="order-1 lg:order-2 form-group">
                    <Label style="float">Visualização</Label>
                    <Select
                      name="status"
                      value={content?.status ?? 1}
                      onChange={(e: any) =>
                        handleContent("status", e.target.value)
                      }
                      options={[
                        {
                          name: "Público",
                          value: 1,
                        },
                        {
                          name: "Privado",
                          value: 0,
                        },
                      ]}
                    />
                  </div>
                  {!!formFields?.form.filter(
                    (item: any) => item.column == "sidebar"
                  ).length && (
                    <div className="order-3 grid gap-6 mt-5">
                      {renderSectionsForm(
                        formFields?.form.filter(
                          (item: any) => item.column == "sidebar"
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </form>
      </Template>
    )
  );
}
