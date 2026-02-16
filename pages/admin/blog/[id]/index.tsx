"use client";

import Link from "next/link";
import Template from "@/src/template";
import { Button, Input } from "@/src/components/ui/form";
import { useEffect, useState } from "react";
import Api from "@/src/services/api";
import { useRouter } from "next/router";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Editor from "@/src/components/ui/form/EditorUI";
import FileManager from "@/src/components/ui/form/FileManager";
import axios from "axios";
import { shortId } from "@/src/helper";

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

export default function Form() {
  const api = new Api();
  const router = useRouter();
  const { id } = router.query;

  const [placeholder, setPlaceholder] = useState(true);
  const [form, setForm] = useState(formInitial);
  const [content, setContent] = useState<PostType>({
    status: 1,
    id: 0,
    title: "",
    slug: "",
    image: [],
    blocks: [{ id: 1, type: "text", content: "" }],
  });

  const setFormValue = (value: any) => setForm((f) => ({ ...f, ...value }));
  const handleContent = (value: Partial<PostType>) =>
    setContent((prev) => ({ ...prev, ...value }));

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setFormValue({ loading: true });

    const response: any = await api.bridge({
      method: "post",
      url: "admin/content/register",
      data: {
        type: "blog",
        id: content.id ?? null,
        title: content?.title ?? `content-${shortId()}`,
        slug: content?.slug ?? null,
        status: content?.status,
        content: {
          image: content.image,
          blocks: content.blocks,
        },
      },
    });

    if (response?.data) {
      setContent(response.data);

      try {
        await axios.get("/api/cache", {
          params: { route: `/blog/${response.data.slug}` },
        });
      } catch (error: any) {}
    }

    if (response.response) {
      router.push("/admin/blog");
    } else {
      setFormValue({ loading: false, sended: response.response });
    }
  };

  const getPost = async () => {
    if (!id || id === "form") {
      setContent((prev) => ({ ...prev, status: 1 }));
      setPlaceholder(false);
      return;
    }

    setPlaceholder(true);
    const request: any = await api.bridge({
      method: "get",
      url: "admin/content/get",
      data: { type: "blog", id },
    });

    setContent({ ...request.data, status: request.data?.status ?? 1 });
    setPlaceholder(false);
  };

  useEffect(() => {
    if (router.isReady) getPost();
  }, [router.isReady, id]);

  const isNew = id === "form";

  return (
    <Template
      header={{ template: "admin", position: "solid" }}
      footer={{ template: "clean" }}
    >
      <section>
        <div className="container-medium pt-8">
          <div className="flex items-center justify-between">
            <Breadcrumbs
              links={[
                { url: "/admin", name: "Admin" },
                { url: "/admin/blog", name: "Blog" },
                { url: `/admin/blog/${id}`, name: isNew ? "Novo post" : content?.title || "Editando" },
              ]}
            />
            {!!content?.slug && (
              <Link
                href={`/api/cache?route=/blog/${content.slug}&redirect=/blog/${content.slug}`}
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
        <form onSubmit={handleSubmit}>
          <section>
            <div className="container-medium py-6">
              <h1 className="font-title font-bold text-3xl text-zinc-900 mb-6">
                {isNew ? "Novo post" : content?.title || "Editando"}
              </h1>

              <div className="grid lg:grid-cols-[1fr_20rem] gap-6 items-start">
                <div className="grid gap-6">
                  <div className="bg-white border rounded-xl p-6">
                    <label className="block text-sm text-zinc-500 mb-2">Titulo</label>
                    <Input
                      value={content.title}
                      onChange={(e: any) => handleContent({ title: e.target.value })}
                      placeholder="Título do post"
                    />
                    {!!content?.slug && (
                      <div className="mt-2">
                        <Link
                          href={`/blog/${content.slug}`}
                          target="_blank"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          /blog/{content.slug}
                        </Link>
                      </div>
                    )}
                  </div>

                  <div className="bg-white border rounded-xl p-6">
                    <label className="block text-sm text-zinc-500 mb-2">Conteúdo</label>
                    <Editor
                      value={content?.blocks?.[0]?.content ?? ""}
                      onChange={(val: any) =>
                        handleContent({
                          blocks: [{ id: 1, type: "text", content: val }],
                        })
                      }
                      minHeight={180}
                      className="quill-textarea"
                    />
                  </div>
                </div>

                <div>
                  <div className="bg-white border rounded-xl p-6 sticky top-24 grid gap-4">
                    <div>
                      <label className="block text-sm text-zinc-500 mb-1">Visibilidade</label>
                      <select
                        name="status"
                        value={String(content.status)}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          handleContent({ status: Number(e.target.value) })
                        }
                        className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
                      >
                        <option value="1">Público</option>
                        <option value="0">Privado</option>
                      </select>
                    </div>

                    <div>
                      <FileManager
                        placeholder="Imagem destaque"
                        value={content?.image ?? []}
                        aspect="aspect-square"
                        multiple={false}
                        onChange={(emit: any) => handleContent({ image: emit })}
                        options={{ dir: "blog" }}
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
