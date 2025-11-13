"use client";

import Link from "next/link";
import Template from "@/src/template";
import { Button, Input } from "@/src/components/ui/form";
import { ChangeEvent, useEffect, useState } from "react";
import Api from "@/src/services/api";
import { useRouter } from "next/router";
import Icon from "@/src/icons/fontAwesome/FIcon";
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

  const handleCache = async () => {
    try {
      await axios.get(`/api/cache`, {
        params: { route: `/blog/${content.slug}` },
      });
    } catch (error: any) {
      console.error(
        "Erro ao atualizar o cache:",
        error?.response?.data || error.message
      );
    }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setFormValue({ loading: true });

    const handle = { ...content };
    const request: any = await api.bridge({
      method: "post",
      url: "admin/content/register",
      data: {
        type: "blog",
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
      router.push({ pathname: "/admin/blog" });
    } else {
      setFormValue({ loading: false, sended: request.response });
    }
  };

  const getPost = async () => {
    if (!id || id === "form") {
      setContent((prev) => ({ ...prev, status: 1 })); // garante status = 1 em novo post
      setPlaceholder(false);
      return;
    }

    setPlaceholder(true);
    const request: any = await api.bridge({
      method: "get",
      url: "admin/content/get",
      data: { type: "blog", id },
    });

    // garante que o status nunca seja nulo ou undefined
    setContent({ ...request.data, status: request.data?.status ?? 1 });
    setPlaceholder(false);
  };

  useEffect(() => {
    if (router.isReady) getPost();
  }, [router.isReady, id]);

  return (
    <Template
      header={{ template: "admin", position: "solid" }}
      footer={{ template: "clean" }}
    >
      {placeholder ? null : (
        <form onSubmit={handleSubmit}>
          <section>
            <div className="container-medium pt-6 md:pt-12 pb-4 md:pb-8">
              <div className="flex justify-between">
                <div className="pb-4">
                  <Breadcrumbs
                    links={[
                      { url: "/admin", name: "Admin" },
                      { url: "/admin/blog", name: "Blog" },
                    ]}
                  />
                </div>
                {!!content?.slug && (
                  <Link
                    href={`/api/cache?route=/blog/${content.slug}&redirect=/blog/${content.slug}`}
                    target="_blank"
                    className="whitespace-nowrap flex items-center gap-2 ease hover:text-zinc-950 font-semibold"
                  >
                    Limpar cache
                    <Icon icon="fa-sync" className="text-xs mt-1" />
                  </Link>
                )}
              </div>

              <div className="flex items-end">
                <div className="w-full flex items-center">
                  <Link passHref href="/admin/blog">
                    <Icon
                      icon="fa-long-arrow-left"
                      className="mr-6 text-2xl text-zinc-900"
                    />
                  </Link>
                  <div className="font-title font-bold text-2xl md:text-4xl flex gap-4 items-center text-zinc-900 w-full">
                    {id !== "form" ? "Editar: " + content.title : "Criar novo post"}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="container-medium pb-12">
              <div className="grid lg:flex gap-10 ld:gap-20 items-start">
                <div className="w-full grid gap-8">
                  {/* Campo de título */}
                  <div className="grid gap-2">
                    <label
                      htmlFor="post-title"
                      className="font-medium text-zinc-800"
                    >
                      Título
                    </label>
                    <Input
                      id="post-title"
                      value={content.title}
                      onChange={(e) => handleContent({ title: e.target.value })}
                      placeholder="Digite o título do post"
                    />
                    {!!content?.slug && (
                      <Link
                        href={`/blog/${content.slug}`}
                        target="_blank"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        /blog/{content.slug}
                      </Link>
                    )}
                  </div>

                  {/* Editor de conteúdo */}
                  <div className="grid gap-2">
                    <label
                      htmlFor="post-content"
                      className="font-medium text-zinc-800"
                    >
                      Conteúdo
                    </label>
                    <Editor
                      value={content?.blocks?.[0]?.content ?? ""}
                      onChange={(val) =>
                        handleContent({
                          blocks: [{ id: 1, type: "text", content: val }],
                        })
                      }
                      minHeight={180}
                      className="your-tailwind-classes quill-textarea"
                    />
                  </div>
                </div>

                <div className="w-full lg:max-w-[24rem] grid gap-4 pb-2">
                  <div className="order-last lg:order-1 grid">
                    <Button className="py-4" loading={form.loading}>
                      Salvar
                    </Button>
                  </div>

                  <div className="grid gap-4 order-1 lg:order-2 form-group">
                    <div>
                      <label style={{ float: "right" }}>
                        Visualização:{" "}
                        {content?.status === 1 ? "Público" : "Privado"}
                      </label>

                      <select
                        name="status"
                        value={String(content.status)}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                          handleContent({ status: Number(e.target.value) })
                        }
                        className="form-control"
                      >
                        {[
                          { name: "Público", value: 1 },
                          { name: "Privado", value: 0 },
                        ].map((option, key) => (
                          <option value={String(option.value)} key={key}>
                            {option.name}
                          </option>
                        ))}
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
