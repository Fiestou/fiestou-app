import Link from "next/link";
import Template from "@/src/template";
import { Button, Input, Label, Select } from "@/src/components/ui/form";
import { useEffect, useState } from "react";
import Api from "@/src/services/api";
import { useRouter } from "next/router";
import { NextApiRequest, NextApiResponse } from "next";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Editor from "@/src/components/ui/form/EditorUI";
import FileManager from "@/src/components/ui/form/FileManager";
import { shortId } from "@/src/helper";
import axios from "axios";

export async function getServerSideProps(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { slug } = req.query;

  return {
    props: {
      slug: slug,
    },
  };
}

const formInitial = {
  sended: false,
  loading: false,
};

interface PostType {
  id: number;
  title: string;
  slug: string;
  image: Array<any>;
  blocks: Array<any>;
  status: string | number;
}

export default function Form({ slug }: { slug: string }) {
  const api = new Api();
  const router = useRouter();

  const [placeholder, setPlaceholder] = useState(true as boolean);

  const [form, setForm] = useState(formInitial);
  const setFormValue = (value: any) => {
    setForm((form) => ({ ...form, ...value }));
  };

  const [content, setContent] = useState({} as PostType);
  const handleContent = (value: any) => {
    setContent({ ...content, ...value });
  };

  const handleCache = async () => {
    try {
      await axios.get(`/api/cache?route=/blog/${content.slug}`);
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
      method: "post",
      url: "admin/content/register",
      data: {
        type: "communicate",
        id: content.id ?? null,
        title: content?.title ?? `content-${shortId()}`,
        slug: content?.title ?? null,
        status: content?.status,
        content: {
          image: handle.image,
          blocks: handle.blocks,
        },
      },
    });

    await handleCache();

    setContent(handle);

    if (request.response) {
      router.push({ pathname: "/admin/comunicados" });
    } else {
      setFormValue({ loading: false, sended: request.response });
    }
  };

  const getPost = async () => {
    setPlaceholder(true);

    if (slug != "form") {
      let request: any = await api.bridge({
        method: "get",
        url: "admin/content/get",
        data: {
          type: "communicate",
          slug: slug,
        },
      });

      setContent(request.data);
    }

    setPlaceholder(false);
  };

  useEffect(() => {
    getPost();
  }, []);

  const isNew = slug === "form";

  return (
    <Template
      header={{ template: "admin", position: "solid" }}
      footer={{ template: "clean" }}
    >
      <section>
        <div className="container-medium pt-8">
          <Breadcrumbs
            links={[
              { url: "/admin", name: "Admin" },
              { url: "/admin/comunicados", name: "Comunicados" },
              { url: `/admin/comunicados/${slug}`, name: isNew ? "Novo" : content?.title || "Editando" },
            ]}
          />
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
                {isNew ? "Novo comunicado" : content?.title || "Editando"}
              </h1>

              <div className="grid lg:grid-cols-[1fr_20rem] gap-6 items-start">
                <div className="grid gap-6">
                  <div className="bg-white border rounded-xl p-6">
                    <label className="block text-sm text-zinc-500 mb-2">Titulo</label>
                    <Input
                      value={content.title}
                      onChange={(e: any) =>
                        handleContent({ title: e.target.value })
                      }
                      placeholder="Titulo do comunicado"
                    />
                    {!isNew && content?.slug && (
                      <div className="mt-2">
                        <Link
                          target="_blank"
                          href={`/comunicados/${content.slug}`}
                          className="text-sm text-blue-600 hover:underline"
                        >{`/comunicados/${content.slug}`}</Link>
                      </div>
                    )}
                  </div>

                  <div className="bg-white border rounded-xl p-6">
                    <label className="block text-sm text-zinc-500 mb-2">Conteúdo</label>
                    <Editor
                      value={
                        content?.blocks && content?.blocks[0]
                          ? content?.blocks[0].content
                          : ""
                      }
                      onChange={(value: any) =>
                        handleContent({
                          blocks: [
                            {
                              id: 1,
                              type: "text",
                              content: value,
                            },
                          ],
                        })
                      }
                      placeholder="Escreva seu conteúdo..."
                    />
                  </div>
                </div>

                <div>
                  <div className="bg-white border rounded-xl p-6 sticky top-24 grid gap-4">
                    <div>
                      <label className="block text-sm text-zinc-500 mb-1">Visibilidade</label>
                      <Select
                        name="status"
                        value={content?.status}
                        onChange={(e: any) =>
                          handleContent({ status: e.target.value })
                        }
                        options={[
                          { name: "Público", value: 1 },
                          { name: "Privado", value: 0 },
                        ]}
                      />
                    </div>

                    <div>
                      <FileManager
                        placeholder="Imagem destaque"
                        value={content?.image ?? []}
                        aspect="aspect-square"
                        multiple={false}
                        onChange={(emit: any) =>
                          handleContent({ image: emit })
                        }
                        options={{
                          dir: "blog",
                        }}
                      />
                    </div>

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
  );
}
