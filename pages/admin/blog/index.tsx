import Link from "next/link";
import Template from "@/src/template";
import { Button } from "@/src/components/ui/form";
import Api from "@/src/services/api";
import { useEffect, useState } from "react";
import { getExtenseData } from "@/src/helper";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export default function Blog() {
  const api = new Api();

  const [posts, setPosts] = useState([] as Array<any>);
  const [loading, setLoading] = useState(true);

  const getPosts = async () => {
    setLoading(true);
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
    setLoading(false);
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

  const publicCount = posts.filter((i: any) => i.status !== 0).length;

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
      <section>
        <div className="container-medium pt-8">
          <Breadcrumbs
            links={[
              { url: "/admin", name: "Admin" },
              { url: "/admin/blog", name: "Blog" },
            ]}
          />
        </div>
      </section>

      <section>
        <div className="container-medium py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-title font-bold text-3xl text-zinc-900">
              Blog
            </h1>
            <Button
              href="/admin/blog/form"
              className="whitespace-nowrap py-3 px-6"
            >
              Novo post
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Total de posts</p>
              <p className="text-2xl font-bold text-zinc-900">{posts.length}</p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Publicados</p>
              <p className="text-2xl font-bold text-green-600">
                {publicCount}
              </p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Privados</p>
              <p className="text-2xl font-bold text-zinc-500">
                {posts.length - publicCount}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-400"></div>
              <span className="ml-3 text-zinc-500">Carregando...</span>
            </div>
          ) : (
            <div className="bg-white border rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_12rem_8rem_8rem] gap-4 px-5 py-3 bg-zinc-50 border-b text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <div>Título</div>
                <div>Atualizado em</div>
                <div className="text-center">Status</div>
                <div className="text-center">Ações</div>
              </div>
              {posts.length > 0 ? (
                posts.map((item: any, key: any) => (
                  <div
                    key={key}
                    className="grid grid-cols-[1fr_12rem_8rem_8rem] gap-4 px-5 py-4 border-b last:border-0 hover:bg-zinc-50 transition-colors items-center"
                  >
                    <div className="font-medium text-zinc-900 truncate">
                      {item.title}
                    </div>
                    <div className="text-sm text-zinc-600">
                      {!!item.updated_at
                        ? getExtenseData(item.updated_at)
                        : "sem cadastro"}
                    </div>
                    <div className="text-center">
                      <span
                        className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
                          item.status === 0
                            ? "bg-zinc-100 text-zinc-600"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.status === 0 ? "Privado" : "Público"}
                      </span>
                    </div>
                    <div className="flex justify-center gap-2">
                      {!!item?.publicUrl && (
                        <Link
                          target="_blank"
                          href={`${item?.publicUrl}`}
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-blue-100 hover:text-blue-600 transition-colors text-zinc-500"
                        >
                          <Icon icon="fa-eye" type="far" className="text-xs" />
                        </Link>
                      )}
                      <Link
                        href={`/admin/blog/${item.id}`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-blue-100 hover:text-blue-600 transition-colors text-zinc-500"
                      >
                        <Icon icon="fa-pen" type="far" className="text-xs" />
                      </Link>
                      <button
                        onClick={() => removePost(item.id)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-red-100 hover:text-red-600 transition-colors text-zinc-500"
                      >
                        <Icon
                          icon="fa-trash"
                          type="far"
                          className="text-xs"
                        />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-zinc-400">
                  <Icon
                    icon="fa-inbox"
                    type="far"
                    className="text-3xl mb-2"
                  />
                  <p>Nenhum post encontrado</p>
                </div>
              )}
            </div>
          )}
          <div className="pt-3 text-sm text-zinc-400">
            Mostrando {posts.length} posts
          </div>
        </div>
      </section>
    </Template>
  );
}
