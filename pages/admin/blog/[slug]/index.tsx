import Link from "next/link";
import Template from "@/src/template";
import { Button, Input, Label, Select } from "@/src/components/ui/form";
import { useEffect, useState } from "react";
import Api from "@/src/services/api";
import { useRouter } from "next/router";
import { NextApiRequest, NextApiResponse } from "next";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Editor from "@/src/components/ui/form/EditorUI";
import FileManager from "@/src/components/ui/form/FileManager";

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
          model: "blog",
          id: content.id ?? null,
          title: content?.title ?? null,
          slug: content?.title ?? null,
          status: !!content?.status ? 1 : 0,
          content: {
            image: handle.image,
            blocks: handle.blocks,
          },
        },
      ],
    });

    setContent(handle);

    if (request.response) {
      // setFormValue({ loading: false, sended: request.response });
      router.push({ pathname: "/admin/blog" });
    } else {
      setFormValue({ loading: false, sended: request.response });
    }
  };

  const getPost = async () => {
    if (slug != "form") {
      let request: any = await api.call({
        url: "request/graph",
        data: [
          {
            model: "blog",
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

      if (request.response) {
        const post = request.data.query.blog[0] ?? {};

        setContent(post);
      }
    }

    setPlaceholder(false);
  };

  useEffect(() => {
    getPost();
  }, []);

  return (
    <Template
      header={{
        template: "admin",
        position: "solid",
      }}
      footer={{
        template: "clean",
      }}
    >
      {placeholder ? (
        <></>
      ) : (
        <form onSubmit={(e: any) => handleSubmit(e)}>
          <section className="">
            <div className="container-medium pt-6 md:pt-12 pb-4 md:pb-8">
              <div className="flex">
                <div className="pb-4">
                  <Breadcrumbs
                    links={[
                      { url: "/admin", name: "Admin" },
                      { url: "/admin/blog", name: "Blog" },
                    ]}
                  />
                </div>
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
                    {slug != "form" ? "Editando" : "Novo post"}
                  </div>
                </div>
              </div>
            </div>
          </section>
          <section className="">
            <div className="container-medium pb-12">
              <div className="grid lg:flex gap-10 ld:gap-20 items-start">
                <div className="w-full grid gap-8">
                  <div className="">
                    <Input
                      value={content.title}
                      onChange={(e: any) =>
                        handleContent({ title: e.target.value })
                      }
                      placeholder="Título"
                    />
                    <div className="pt-2 text-sm">
                      <Link
                        target="_blank"
                        href={`/blog/${content.slug}`}
                      >{`/blog/${content.slug}`}</Link>
                    </div>
                  </div>
                  <div className="">
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
                <div className="w-full lg:max-w-[24rem] grid gap-4 pb-2">
                  <div className="order-last lg:order-1 grid">
                    <Button className="py-4" loading={form.loading}>
                      Salvar
                    </Button>
                  </div>
                  <div className="grid gap-4 order-1 lg:order-2 form-group">
                    <div>
                      <Label style="float">
                        Visualização {content?.status}
                      </Label>
                      <Select
                        name="status"
                        value={content?.status}
                        onChange={(e: any) =>
                          handleContent({ status: e.target.value })
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
                    <div>
                      <div className="">
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
