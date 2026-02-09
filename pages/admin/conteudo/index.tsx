import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { Button } from "@/src/components/ui/form";
import Api from "@/src/services/api";
import { useEffect, useState } from "react";
import { getExtenseData } from "@/src/helper";
import { HandleForm } from "@/src/components/pages/admin/conteudo/ContentForm";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export default function Conteudo() {
  const api = new Api();

  const [origin, setOrigin] = useState("todos");
  const [pages, setPages] = useState([] as Array<any>);
  const [loading, setLoading] = useState(true);

  const getPosts = async () => {
    setLoading(true);
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
    setLoading(false);
  };

  useEffect(() => {
    getPosts();
  }, []);

  const filtered = pages.filter(
    (itm: any) => itm.origin == origin || origin == "todos"
  );

  const origins = [...new Set(pages.map((p: any) => p.origin).filter(Boolean))];

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
              { url: "/admin/conteudo", name: "Conteúdo" },
            ]}
          />
        </div>
      </section>

      <section>
        <div className="container-medium py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-title font-bold text-3xl text-zinc-900">
              Conteúdo
            </h1>
            <div className="flex gap-3 items-center">
              <select
                onChange={(e) => setOrigin(e.target.value)}
                value={origin}
                className="rounded-xl border px-4 py-2.5 text-sm text-zinc-700 bg-white outline-none"
              >
                <option value="todos">Todos</option>
                {origins.map((o: string) => (
                  <option key={o} value={o}>
                    {o.charAt(0).toUpperCase() + o.slice(1)}
                  </option>
                ))}
              </select>
              <Button
                href="/api/cache"
                target="_blank"
                type="button"
                className="whitespace-nowrap py-2.5 px-6"
              >
                Limpar cache
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Total</p>
              <p className="text-2xl font-bold text-zinc-900">{pages.length}</p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Com cadastro</p>
              <p className="text-2xl font-bold text-green-600">
                {pages.filter((p: any) => !!p.meta).length}
              </p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Sem cadastro</p>
              <p className="text-2xl font-bold text-zinc-500">
                {pages.filter((p: any) => !p.meta).length}
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
              <div className="grid grid-cols-[1fr_6rem_12rem_6rem_6rem] gap-4 px-5 py-3 bg-zinc-50 border-b text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <div>Página</div>
                <div>Origem</div>
                <div>Atualizado em</div>
                <div className="text-center">Status</div>
                <div className="text-center">Ações</div>
              </div>
              {filtered.length > 0 ? (
                filtered.map((item: any, key: any) => (
                  <div
                    key={key}
                    className="grid grid-cols-[1fr_6rem_12rem_6rem_6rem] gap-4 px-5 py-4 border-b last:border-0 hover:bg-zinc-50 transition-colors items-center"
                  >
                    <div className="font-medium text-zinc-900 truncate">
                      {item.title}
                    </div>
                    <div className="text-sm text-zinc-600">{item.origin}</div>
                    <div className="text-sm text-zinc-600">
                      {!!item?.meta
                        ? getExtenseData(item.meta.updated_at)
                        : "sem cadastro"}
                    </div>
                    <div className="text-center">
                      {!!item?.meta ? (
                        <span
                          className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
                            !!item.meta.status
                              ? "bg-green-100 text-green-700"
                              : "bg-zinc-100 text-zinc-600"
                          }`}
                        >
                          {!!item.meta.status ? "Público" : "Privado"}
                        </span>
                      ) : (
                        <span className="inline-block text-xs px-3 py-1 rounded-full font-medium bg-amber-100 text-amber-700">
                          Pendente
                        </span>
                      )}
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
                        href={`/admin/conteudo/${item.slug}`}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 hover:bg-blue-100 hover:text-blue-600 transition-colors text-zinc-500"
                      >
                        <Icon icon="fa-pen" type="far" className="text-xs" />
                      </Link>
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
                  <p>Nenhuma página encontrada</p>
                </div>
              )}
            </div>
          )}
          <div className="pt-3 text-sm text-zinc-400">
            Mostrando {filtered.length} de {pages.length} páginas
          </div>
        </div>
      </section>
    </Template>
  );
}
