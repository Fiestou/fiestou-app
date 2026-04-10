import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Users, Eye, Mail, ArrowRight } from "lucide-react";
import Api from "@/src/services/api";
import usePainelPageMode from "@/src/components/painel/usePainelPageMode";
import {
  PainelLayout,
  PageHeader,
  DataTable,
  EmptyState,
  SearchInput,
} from "@/src/components/painel";
import type { Column } from "@/src/components/painel";

export async function getServerSideProps(ctx: any) {
  const rawStore = ctx.req.cookies["fiestou.store"];
  const parsedStore = Number(rawStore);
  const store = Number.isInteger(parsedStore) && parsedStore > 0 ? parsedStore : 0;
  return { props: { store } };
}

export default function Clientes({ store }: { store: any }) {
  const panelMode = usePainelPageMode();
  const api = useMemo(() => new Api(), []);
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
      if (!store) {
        setClients([]);
        setLoading(false);
        return;
      }

      try {
        const request: any = await api.bridge({
          method: "post",
          url: "stores/customers",
          data: { store },
        });
        setClients(request.data || []);
      } catch {
        setClients([]);
      }
      setLoading(false);
    };
    fetch();
  }, [api, store]);

  const filtered = clients.filter((c) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      (c.name || "").toLowerCase().includes(q) ||
      (c.email || "").toLowerCase().includes(q)
    );
  });

  const columns: Column<any>[] = [
    {
      key: "name",
      label: "Nome",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-zinc-900">{row.name}</p>
        </div>
      ),
    },
    {
      key: "email",
      label: "E-mail",
      sortable: true,
      render: (row) => <span className="text-zinc-600">{row.email}</span>,
    },
    {
      key: "actions",
      label: "Ações",
      className: "w-28",
      render: (row) => (
        <Link
          href={`/painel/clientes/${row.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
        >
          <Eye size={14} />
          Detalhes
        </Link>
      ),
    },
  ];

  const clientsWithEmail = useMemo(
    () => clients.filter((client) => !!String(client?.email || "").trim()).length,
    [clients]
  );

  const recentClients = useMemo(() => filtered.slice(0, 8), [filtered]);

  const clientsListContent =
    !loading && filtered.length === 0 ? (
      <div className="bg-white rounded-xl border border-zinc-200">
        <EmptyState
          icon={<Users size={32} />}
          title="Nenhum cliente encontrado"
          description={
            search
              ? "Tente ajustar a busca"
              : "Quando clientes comprarem na sua loja, eles vão aparecer aqui"
          }
        />
      </div>
    ) : (
      <DataTable
        columns={columns}
        data={filtered}
        keyField="id"
        pageSize={15}
        loading={loading}
        emptyMessage="Nenhum cliente encontrado"
      />
    );

  if (panelMode === "simple") {
    return (
      <PainelLayout>
        <PageHeader
          title="Clientes"
          description="Busque rápido quem já comprou com sua loja."
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                Total
              </div>
              <Users size={16} className="text-zinc-400" />
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{filtered.length}</div>
          </div>
          <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-4">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold uppercase tracking-[0.14em] text-blue-700">
                Com e-mail
              </div>
              <Mail size={16} className="text-blue-700" />
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{clientsWithEmail}</div>
          </div>
          <div className="rounded-xl border border-yellow-200 bg-yellow-50/70 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-yellow-700">
              Buscar
            </div>
            <div className="mt-2">
              <SearchInput
                placeholder="Buscar clientes..."
                value={search}
                onChange={setSearch}
                className="w-full"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <section className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Últimos clientes</h2>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {recentClients.length === 0 && !loading ? (
                <div className="rounded-lg border border-zinc-200 px-4 py-6 text-sm text-zinc-500">
                  Nenhum cliente para mostrar agora.
                </div>
              ) : (
                recentClients.map((client) => (
                  <Link
                    key={client.id}
                    href={`/painel/clientes/${client.id}`}
                    className="flex items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 transition-colors hover:border-yellow-300"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-zinc-900 truncate">
                        {client.name}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500 truncate">
                        {client.email || "E-mail não informado"}
                      </p>
                    </div>
                    <ArrowRight size={16} className="shrink-0 text-zinc-400" />
                  </Link>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-zinc-900">Clientes</h2>
          </div>
          {clientsListContent}
        </section>
      </PainelLayout>
    );
  }

  return (
    <PainelLayout>
      <PageHeader title="Clientes" description="Clientes que compraram na sua loja" />

      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-zinc-200 mb-4">
        <SearchInput
          placeholder="Buscar clientes..."
          value={search}
          onChange={setSearch}
          className="w-full sm:w-72"
        />
      </div>

      {clientsListContent}
    </PainelLayout>
  );
}
