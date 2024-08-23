import Image from "next/image";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { Button } from "@/src/components/ui/form";
import { NextApiRequest, NextApiResponse } from "next";
import Api from "@/src/services/api";
import { useEffect, useState } from "react";
import { getExtenseData } from "@/src/helper";
import { HandleForm } from "@/src/components/pages/admin/conteudo/ContentForm";

export default function Conteudo() {
  const api = new Api();

  const [origin, setOrigin] = useState("todos");

  const [pages, setPages] = useState([] as Array<any>);

  const getPosts = async () => {
    let request: any = await api.bridge({
      method: "get",
      url: "admin/content/list",
      data: {
        type: "page",
      },
    });

    if (request.response) {
      const handlePages = request.data;
      const listPages: any = [];

      HandleForm.map((item: any) => {
        listPages.push({
          ...item,
          meta: handlePages.find((itm: any) => (itm.slug = item.slug)),
        });
      });

      setPages(listPages);
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
          <div className="flex">
            <div className="w-full">Produtos {">"} Title</div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="underline">Precisa de ajuda?</div>{" "}
              <Icon icon="fa-question-circle" />
            </div>
          </div>
          <div className="flex mt-10">
            <div className="w-full">
              <div className="font-title font-bold text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900">
                Conteúdo
              </div>
            </div>
            <div className="flex gap-6 w-fit items-center">
              <div>
                <select
                  onChange={(e) => setOrigin(e.target.value)}
                  className="rounded-md relative z-[1] whitespace-nowrap border py-4 text-zinc-900 font-semibold px-2"
                >
                  <option value="todos">todos</option>
                  <option value="site">site</option>
                  <option value="painel">painel</option>
                  <option value="dashboard">dashboard</option>
                </select>
              </div>
              <Button
                href="/api/cache"
                target="_blank"
                type="button"
                className="whitespace-nowrap py-4 px-8"
              >
                Limpar cache
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section className="pt-6">
        <div className="container-medium pb-12">
          <div className="border">
            <div className="flex bg-zinc-100 p-8 gap-8 font-bold text-zinc-900 font-title">
              <div className="w-full">Página</div>
              <div className="w-[32rem]">Origem</div>
              <div className="w-[48rem]">Última atualização</div>
              <div className="w-[14rem]">Status</div>
              <div className="w-[32rem]">Ações</div>
            </div>
            {!!pages?.length &&
              pages
                .filter((itm: any) => itm.origin == origin || origin == "todos")
                .map((item: any, key: any) => (
                  <div
                    key={key}
                    className="flex border-t p-8 gap-8 text-zinc-900 hover:bg-zinc-50 bg-opacity-5 ease items-center"
                  >
                    <div className="w-full">
                      <div>{item.title}</div>
                    </div>
                    <div className="w-[32rem]">
                      <div className="py-2">{item.origin}</div>
                    </div>
                    <div className="w-[48rem]">
                      <div className="text-xs">
                        {!!item?.meta
                          ? getExtenseData(item.meta.updated_at)
                          : "sem cadastro"}
                      </div>
                    </div>
                    <div className="w-[14rem] text-center">
                      <div className="rounded-md bg-zinc-100 py-2 text-xs">
                        {!!item?.meta
                          ? !!item.meta.status
                            ? "Público"
                            : "Privado"
                          : "sem cadastro"}
                      </div>
                    </div>
                    <div className="w-[32rem] text-center flex gap-2">
                      {!!item?.publicUrl && (
                        <>
                          <Link
                            target="_blank"
                            href={`${item?.publicUrl}`}
                            className="rounded-md bg-zinc-100 hover:bg-yellow-300 ease py-2 px-3"
                          >
                            <Icon icon="fa-eye" type="far" />
                          </Link>
                          <Button style="btn-light" className="py-2 px-3">
                            <Icon icon="fa-share-alt" type="far" />
                          </Button>
                        </>
                      )}
                      <Button
                        href={`/admin/conteudo/${item.slug}`}
                        style="btn-light"
                        className="py-2 px-3"
                      >
                        <Icon icon="fa-edit" type="far" />
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
