import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import Api from "@/src/services/api";
import { useEffect, useState } from "react";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export default function Partner() {
  const api = new Api();

  const [partners, setPartners] = useState([] as Array<any>);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const getPartners = async () => {
    setLoading(true);
    let request: any = await api.bridge({
      method: "get",
      url: "users/list",
      data: {
        type: "partner",
      },
    });

    if (request.response) {
      setPartners(request.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    getPartners();
  }, []);

  const filtered = partners
    .filter((i) => !!i.id)
    .filter((item) => {
      if (!search) return true;
      const q = search.toLowerCase();
      return (
        item?.name?.toLowerCase().includes(q) ||
        item?.email?.toLowerCase().includes(q) ||
        item?.store_name?.toLowerCase().includes(q) ||
        item?.phone?.includes(q)
      );
    });

  const activeCount = partners.filter((i) => !!i.id && !!i.status).length;
  const blockedCount = partners.filter((i) => !!i.id && !i.status).length;
  const pagarmeCount = partners.filter((i) => !!i.id && i.pagarme_registered).length;

  const maskRecipientCode = (code: string) => {
    if (!code) return "";
    if (code.length <= 8) return code;
    return code.slice(0, 6) + "..." + code.slice(-4);
  };

  return (
    <Template
      header={{
        template: "admin",
        position: "solid",
      }}
    >
      <section>
        <div className="container-medium pt-8">
          <Breadcrumbs
            links={[
              { url: "/admin", name: "Admin" },
              { url: "/admin/parceiros", name: "Parceiros" },
            ]}
          />
        </div>
      </section>

      <section>
        <div className="container-medium py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-title font-bold text-3xl text-zinc-900">
              Parceiros
            </h1>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Total</p>
              <p className="text-2xl font-bold text-zinc-900">
                {partners.filter((i) => !!i.id).length}
              </p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Ativos</p>
              <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Bloqueados</p>
              <p className="text-2xl font-bold text-red-600">{blockedCount}</p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Pagar.me</p>
              <p className="text-2xl font-bold text-blue-600">{pagarmeCount}</p>
            </div>
          </div>

          <div className="bg-white border rounded-xl p-4 mb-6">
            <div className="flex items-center gap-3">
              <Icon icon="fa-search" type="far" className="text-zinc-400" />
              <input
                type="text"
                placeholder="Buscar por nome, e-mail, loja ou telefone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full outline-none text-sm text-zinc-700 placeholder:text-zinc-400"
              />
              {search && (
                <button
                  onClick={() => setSearch("")}
                  className="text-zinc-400 hover:text-zinc-600"
                >
                  <Icon icon="fa-times" type="far" />
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-400"></div>
              <span className="ml-3 text-zinc-500">Carregando...</span>
            </div>
          ) : (
            <div className="bg-white border rounded-xl overflow-hidden">
              <div className="grid grid-cols-[1fr_10rem_8rem_8rem_6rem] gap-4 px-5 py-3 bg-zinc-50 border-b text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <div>Nome / Loja</div>
                <div>Celular</div>
                <div className="text-center">Status</div>
                <div className="text-center">Pagar.me</div>
                <div className="text-center">Ações</div>
              </div>
              {filtered.length > 0 ? (
                filtered.map((item, key) => (
                  <div
                    key={key}
                    className="grid grid-cols-[1fr_10rem_8rem_8rem_6rem] gap-4 px-5 py-4 border-b last:border-0 hover:bg-zinc-50 transition-colors items-center"
                  >
                    <div>
                      <div className="font-medium text-zinc-900 truncate">
                        {item?.name}
                      </div>
                      {item?.store_name && (
                        <div className="text-xs text-zinc-400 truncate">
                          {item.store_name}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-zinc-600">
                      {item?.phone || "-"}
                    </div>
                    <div className="text-center">
                      <span
                        className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${
                          item?.status
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {!!item?.status ? "Ativo" : "Bloqueado"}
                      </span>
                    </div>
                    <div className="text-center">
                      {item?.pagarme_registered ? (
                        <span className="inline-block text-xs px-3 py-1 rounded-full font-medium bg-blue-100 text-blue-700" title={item?.pagarme_recipient_code}>
                          {maskRecipientCode(item?.pagarme_recipient_code)}
                        </span>
                      ) : (
                        <span className="inline-block text-xs px-3 py-1 rounded-full font-medium bg-zinc-100 text-zinc-400">
                          Pendente
                        </span>
                      )}
                    </div>
                    <div className="flex justify-center gap-2">
                      <Link
                        title="Editar"
                        href={`/admin/parceiros/${item?.id}`}
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
                    icon="fa-search"
                    type="far"
                    className="text-3xl mb-2"
                  />
                  <p>Nenhum parceiro encontrado</p>
                </div>
              )}
            </div>
          )}
          <div className="pt-3 text-sm text-zinc-400">
            {search
              ? `${filtered.length} de ${partners.filter((i) => !!i.id).length} parceiros`
              : `${filtered.length} parceiros`}
          </div>
        </div>
      </section>
    </Template>
  );
}
