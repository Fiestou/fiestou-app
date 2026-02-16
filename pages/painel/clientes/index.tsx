import Link from "next/link";
import { useEffect, useState } from "react";
import { Users, Eye } from "lucide-react";
import Api from "@/src/services/api";
import {
  PainelLayout,
  PageHeader,
  DataTable,
  EmptyState,
  SearchInput,
} from "@/src/components/painel";
import type { Column } from "@/src/components/painel";

export async function getServerSideProps(ctx: any) {
  const store = ctx.req.cookies["fiestou.store"] ?? 0;
  return { props: { store } };
}

export default function Clientes({ store }: { store: any }) {
  const api = new Api();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetch = async () => {
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
  }, []);

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

      {!loading && filtered.length === 0 ? (
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
      )}
    </PainelLayout>
  );
}
