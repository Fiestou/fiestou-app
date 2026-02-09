import Link from "next/link";
import Template from "@/src/template";
import { Button, Label, Select } from "@/src/components/ui/form";
import { useEffect, useState } from "react";
import Api from "@/src/services/api";
import { useRouter } from "next/router";
import HandleField from "@/src/components/ui/form/HandleField";
import { HandleGetFields } from "@/src/components/pages/admin/conteudo/ContentForm";
import axios from "axios";
import { shortId } from "@/src/helper";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

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

  return {
    props: {
      slug: slug,
      formFields: formFields,
    },
  };
}

const formInitial = {
  sended: false,
  loading: false,
};

export default function Form({
  slug,
  formFields,
}: {
  slug: any;
  formFields: any;
}) {
  const api = new Api();
  const router = useRouter();

  const [placeholder, setPlaceholder] = useState(true as boolean);

  const [form, setForm] = useState(formInitial);
  const setFormValue = (value: any) => {
    setForm((form) => ({ ...form, ...value }));
  };

  const [page, setPage] = useState({} as any);

  const [content, setContent] = useState({} as any);

  const handleContent = (name: any, value: any) => {
    let handle: any = content;

    handle[name] = value;

    setContent(handle);
  };

  const handleCache = async () => {
    try {
      if (!!page.publicUrl)
        await axios.get(`/api/cache?route=${page.publicUrl}`);
    } catch (error) {

    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setFormValue({ loading: true });

    const handle = {
      ...content,
    };

    const request: any = await api.bridge({
      method: 'post',
      url: "admin/content/register",
      data: {
        type: "page",
        id: content.id ?? null,
        title: formFields?.title ?? `page-${shortId()}`,
        slug: formFields?.slug ?? null,
        status: content?.status,
        content: handle,
      },
    });

    await handleCache();

    setContent(handle);

    if (request.response) {
      router.push({ pathname: "/admin/conteudo" });
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
          className="bg-white border rounded-xl p-6"
        >
          {group.title && (
            <h4 className="text-lg font-semibold text-zinc-900 mb-4">{group.title}</h4>
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

  const getPost = async () => {
    setPlaceholder(true);

    if (slug != "form") {
      let request: any = await api.bridge({
        method: "get",
        url: "admin/content/get",
        data: {
          type: "page",
          slug: slug,
        },
      });

      if (request.response) {
        setContent({ ...request.data, publicUrl: formFields?.publicUrl ?? "" });
      }
    }

    setPlaceholder(false);
  };

  useEffect(() => {
    getPost();
  }, []);

  return (
    !router.isFallback && (
      <Template
        header={{ template: "admin", position: "solid" }}
        footer={{ template: "clear" }}
      >
        <section>
          <div className="container-medium pt-8">
            <div className="flex items-center justify-between">
              <Breadcrumbs
                links={[
                  { url: "/admin", name: "Admin" },
                  { url: "/admin/conteudo", name: "Conteudo" },
                  { url: `/admin/conteudo/${slug}`, name: formFields?.title || "Editando" },
                ]}
              />
              {!!page.publicUrl && (
                <Link
                  href={`/api/cache?route=${page.publicUrl}&redirect=${page.publicUrl}`}
                  target="_blank"
                  className="text-sm text-zinc-500 hover:text-zinc-700"
                >
                  Limpar cache
                </Link>
              )}
            </div>
          </div>
        </section>

        {placeholder ? (
          <section>
            <div className="container-medium py-16 flex justify-center items-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-400"></div>
              <span className="ml-3 text-zinc-500">Carregando...</span>
            </div>
          </section>
        ) : (
          <form onSubmit={(e: any) => handleSubmit(e)}>
            <section>
              <div className="container-medium py-6">
                <h1 className="font-title font-bold text-3xl text-zinc-900 mb-6">
                  {formFields?.title || "Editando"}
                </h1>

                <div className="grid lg:grid-cols-[1fr_20rem] gap-6 items-start">
                  <div className="grid gap-6">
                    {!!formFields?.form &&
                      renderSectionsForm(
                        formFields?.form.filter(
                          (item: any) => item.column != "sidebar"
                        )
                      )}
                  </div>

                  <div>
                    <div className="bg-white border rounded-xl p-6 sticky top-24 grid gap-4">
                      <div>
                        <label className="block text-sm text-zinc-500 mb-1">Visibilidade</label>
                        <Select
                          name="status"
                          value={content?.status ?? 1}
                          onChange={(e: any) =>
                            handleContent("status", e.target.value)
                          }
                          options={[
                            { name: "Publico", value: 1 },
                            { name: "Privado", value: 0 },
                          ]}
                        />
                      </div>

                      {!!formFields?.form.filter(
                        (item: any) => item.column == "sidebar"
                      ).length && (
                        <div className="grid gap-4 border-t pt-4">
                          {renderSectionsForm(
                            formFields?.form.filter(
                              (item: any) => item.column == "sidebar"
                            )
                          )}
                        </div>
                      )}

                      <Button className="w-full py-3" loading={form.loading}>
                        Salvar
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </form>
        )}
      </Template>
    )
  );
}
