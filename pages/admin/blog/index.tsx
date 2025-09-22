import Image from "next/image";
import Link from "next/link";
import Template from "@/src/template";
import { Button } from "@/src/components/ui/form";
import { NextApiRequest, NextApiResponse } from "next";
import Api from "@/src/services/api";
import { useEffect, useState } from "react";
import { getExtenseData } from "@/src/helper";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export default function Blog() {
  const api = new Api();

  const [posts, setPosts] = useState([] as Array<any>);

  const getPosts = async () => {
    let request: any = await api.bridge({
      method: "get",
      url: "admin/content/list",
      data: {
        type: "blog",
        orderBy: "id desc",
      },
    });

    if (request.response) {
      setPosts(request.data);
    }
  };

  const removePost = async (postID: string | number) => {
    const userConfirmed = window.confirm(
      "Tem certeza de que deseja remover este post?"
    );

    if (!userConfirmed) {
      return;
    }

    let request: any = await api.bridge({
      method: "post",
      url: "admin/content/remove",
      data: {
        remove: postID,
      },
    });

    if (request.response) {
      setPosts(posts.filter((post: any) => post.id != postID));
    }
  };

  useEffect(() => {
    getPosts();
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
      <section className="">
        <div className="container-medium pt-12">
          <div className="pb-4">
            <Breadcrumbs
              links={[
                { url: "/admin", name: "Admin" },
                { url: "/admin/blog", name: "Blog" },
              ]}
            />
          </div>
          <div className="grid md:flex gap-4 items-center w-full">
            <div className="text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900 w-full">
              <span className="font-title font-bold">Blog</span>
            </div>
            <div className="flex gap-6 w-fit items-center">
              <Button
                href="/admin/blog/form"
                className="whitespace-nowrap py-4 px-8"
              >
                Novo post
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section className="pt-6">
        <div className="container-medium pb-12">
          <div className="border"
          >
            <div className="flex bg-zinc-100 p-8 gap-8 font-bold text-zinc-900 font-title">
              <div className="w-full">Título</div>
              <div className="w-[48rem]">Última atualização</div>
              <div className="w-[32rem]">Status</div>
              <div className="w-[32rem]">Ações</div>
            </div>
            {!!posts?.length &&
              posts.map((item: any, key: any) => (
                <div
                  key={key}
                  className="flex border-t p-8 gap-8 text-zinc-900 hover:bg-zinc-50 bg-opacity-5 ease items-center"
                >
                  <div className="w-full">
                    <div>{item.title}</div>
                  </div>
                  <div className="w-[48rem]">
                    <div>
                      {!!item.updated_at
                        ? getExtenseData(item.updated_at)
                        : "sem cadastro"}
                    </div>
                  </div>
                  <div className="w-[32rem] text-center">
                    <div className="rounded-md text-sm bg-zinc-100 py-2">
                      {!!item.status ? "Público" : "Privado"}
                    </div>
                  </div>
                  <div className="w-[32rem] text-center flex gap-2">
                    {!!item?.publicUrl && (
                      <>
                        <Link
                          target="_blank"
                          href={`${item?.publicUrl}`}
                          className="hover:text-purple-700 ease py-2 px-3"
                        >
                          <Icon icon="fa-eye" type="far" />
                        </Link>
                        <Button
                          type="button"
                          style="btn-link"
                          className="py-2 px-3"
                        >
                          <Icon icon="fa-share-alt" type="far" />
                        </Button>
                      </>
                    )}
                    <Button
                      href={`/admin/blog/${item.id}`}
                      style="btn-transparent"
                      className="py-2 px-3"
                    >
                      <Icon icon="fa-edit" type="far" />
                    </Button>
                    <Button
                      onClick={() => removePost(item.id)}
                      style="btn-transparent"
                      className="py-2 px-3"
                    >
                      <Icon icon="fa-trash" type="far" />
                    </Button>
                  </div>
                </div>
              ))}
          </div>
          <div className="pt-4">Mostrando 1 página de 1 com 4 produtos</div>
        </div>
      </section>
    </Template>
  );
}
