import shortUUID from "short-uuid";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Wallet, Plus } from "lucide-react";
import Api from "@/src/services/api";
import { Input, Select } from "@/src/components/ui/form";
import { getExtenseData, moneyFormat } from "@/src/helper";
import Modal from "@/src/components/utils/Modal";
import { useRouter } from "next/router";
import { WithdrawType } from "@/src/models/withdraw";
import { UserType } from "@/src/models/user";
import { getRecipientStatus } from "@/src/services/recipients";
import {
  PainelLayout,
  PageHeader,
  DataTable,
  Badge,
  EmptyState,
} from "@/src/components/painel";
import type { Column } from "@/src/components/painel";

export async function getServerSideProps(ctx: any) {
  const api = new Api();

  let request: any = await api.call(
    {
      method: "post",
      url: "request/graph",
      data: [
        {
          model: "page",
          filter: [{ key: "slug", value: "withdraw", compare: "=" }],
        },
      ],
    },
    ctx
  );

  let content: any = request?.data?.query?.page[0] ?? [];

  request = await api.bridge(
    { method: "get", url: "users/get" },
    ctx
  );

  const user: any = request?.data ?? {};
  const bankAccounts = (user?.bankAccounts ?? []).map((item: any) => ({
    value: JSON.stringify(item),
    name: item.title,
  }));

  return {
    props: { user, content: content ?? {}, bankAccounts },
  };
}

const formInitial = { sended: false, loading: false };

export default function Saque({
  content,
  bankAccounts,
}: {
  user: UserType;
  content: any;
  bankAccounts: any;
}) {
  const api = new Api();
  const router = useRouter();

  const [form, setForm] = useState(formInitial);
  const [modalWD, setModalWD] = useState(false);
  const [withdraw, setWithdraw] = useState({ code: "", value: 0 } as WithdrawType);
  const [withdrawList, setWithdrawList] = useState<any[]>([]);
  const [needsRecipientCompletion, setNeedsRecipientCompletion] = useState(true);

  const getWithdraw = async () => {
    const request: any = await api.bridge({ method: "post", url: "withdraw/list" });
    setWithdrawList(request.data || []);
  };

  const checkRecipient = async () => {
    const status = await getRecipientStatus();
    setNeedsRecipientCompletion(!status.completed);
  };

  useEffect(() => {
    getWithdraw();
    checkRecipient();
  }, []);

  const RegisterWithdraw = async (e: any) => {
    e.preventDefault();
    setForm({ ...form, loading: true });

    const handle: WithdrawType = { ...withdraw, code: shortUUID.generate() };
    const request: any = await api.bridge({
      method: "post",
      url: "withdraw/register",
      data: handle,
    });

    if (request?.response) {
      router.reload();
      setModalWD(false);
      setForm({ ...form, loading: false });
    }
  };

  const columns: Column<any>[] = [
    {
      key: "code",
      label: "Código",
      render: (row) => (
        <span className="font-mono text-xs text-zinc-600">{row.code}</span>
      ),
    },
    {
      key: "value",
      label: "Valor",
      sortable: true,
      className: "w-32",
      render: (row) => (
        <span className="font-semibold text-zinc-900">R$ {moneyFormat(row.value)}</span>
      ),
    },
    {
      key: "created_at",
      label: "Solicitado em",
      sortable: true,
      render: (row) => (
        <span className="text-sm text-zinc-600">{getExtenseData(row.created_at)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      className: "w-32",
      render: (row) => {
        if (row.status == 1) return <Badge variant="success">Aprovado</Badge>;
        if (row.status == 0) return <Badge variant="info">Em analise</Badge>;
        return <Badge variant="danger">Negado</Badge>;
      },
    },
  ];

  return (
    <PainelLayout>
      <Modal
        status={modalWD}
        title="Solicitacao de saque"
        close={() => setModalWD(false)}
      >
        <div className="grid gap-6 items-start">
          {withdrawList?.filter((item: any) => item.status == 0)?.length ? (
            <div className="rounded-lg text-center text-sm bg-yellow-50 border border-yellow-200 text-yellow-800 py-3 px-4">
              E necessario aguardar a conclusao da ultima solicitacao para realizar outras.
            </div>
          ) : (
            <>
              <div
                className="grid gap-1 text-sm"
                dangerouslySetInnerHTML={{ __html: content.modal_instruction }}
              />
              <form onSubmit={RegisterWithdraw} className="grid gap-4">
                <Input
                  onChange={(e: any) => setWithdraw({ ...withdraw, value: e.target.value })}
                  placeholder="R$"
                  required
                  className="h-14 text-center"
                />
                <Select
                  onChange={(e: any) => setWithdraw({ ...withdraw, bankAccount: e.target.value })}
                  required
                  className="h-14 text-center"
                  name="account"
                  options={[{ value: "", name: "Conta bancaria" }, ...bankAccounts]}
                />
                <button
                  type="submit"
                  disabled={form.loading}
                  className="bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-medium py-3 rounded-lg transition-colors disabled:opacity-50"
                >
                  {form.loading ? "Processando..." : "Confirmar"}
                </button>
              </form>
            </>
          )}
        </div>
      </Modal>

      <PageHeader
        title="Saques"
        description="Solicite e acompanhe seus saques"
        actions={
          <>
            <button
              type="button"
              onClick={() => setModalWD(true)}
              disabled={needsRecipientCompletion}
              className="bg-yellow-400 hover:bg-yellow-500 text-zinc-900 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
              Solicitar saque
            </button>
          </>
        }
      />

      {needsRecipientCompletion && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <p className="text-sm text-red-700">
            Antes de solicitar um saque, finalize o{" "}
            <Link href="/painel/dados_do_recebedor" className="underline font-semibold">
              cadastro da Pagar.me
            </Link>{" "}
            para liberar os repasses.
          </p>
        </div>
      )}

      {!withdrawList?.length ? (
        <div className="bg-white rounded-xl border border-zinc-200">
          <EmptyState
            icon={<Wallet size={32} />}
            title="Nenhum saque encontrado"
            description="Seus saques solicitados vao aparecer aqui"
          />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={withdrawList}
          keyField="code"
          pageSize={10}
          emptyMessage="Nenhum saque encontrado"
        />
      )}
    </PainelLayout>
  );
}
