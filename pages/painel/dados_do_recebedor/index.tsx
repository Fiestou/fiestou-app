import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";
import UserEdit from "@/src/components/shared/UserEdit";
import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, Landmark, ShieldCheck } from "lucide-react";
import RecipientModal from "@/src/components/pages/painel/meus-dados/RecipientModal";
import { RecipientStatusResponse, RecipientType } from "@/src/models/Recipient";
import { getRecipientStatus } from "@/src/services/recipients";
import { PainelLayout, PageHeader } from "@/src/components/painel";
import FinanceSectionNav from "@/src/components/painel/FinanceSectionNav";
import usePainelPageMode from "@/src/components/painel/usePainelPageMode";

export default function MeusDados() {
  const api = useMemo(() => new Api(), []);
  const panelMode = usePainelPageMode();

  const [user, setUser] = useState({} as UserType);
  const [store, setStore] = useState<any>(null);
  const [recipientStatus, setRecipientStatus] = useState<RecipientStatusResponse | null>(null);
  const [recipientModalOpen, setRecipientModalOpen] = useState(false);

  const getUserData = useCallback(async () => {
    const request: any = await api.bridge({ method: "get", url: "users/get" });
    if (request.response) setUser(request.data);
  }, [api]);

  const getStoreData = useCallback(async () => {
    try {
      const response: any = await api.bridge({ method: "post", url: "stores/form" });
      if (response?.response && response?.data) setStore(response.data);
    } catch {}
  }, [api]);

  const fetchRecipientStatus = useCallback(async () => {
    const status = await getRecipientStatus();
    setRecipientStatus(status);
  }, []);

  const handleRecipientCompleted = (data: RecipientType) => {
    setRecipientStatus({ completed: Boolean(data?.code), recipient: data });
  };

  useEffect(() => {
    getUserData();
    getStoreData();
    fetchRecipientStatus();
  }, [fetchRecipientStatus, getStoreData, getUserData]);

  const shouldShowBanner =
    !!user?.id && user?.type === "partner" && recipientStatus && !recipientStatus.completed;

  return (
    <PainelLayout>
      <PageHeader
        title="Cadastro financeiro"
        description={
          panelMode === "simple"
            ? "Confira titular, documento e endereço da loja."
            : "Titular, documento e endereço usados para liberar recebimentos"
        }
      />

      <FinanceSectionNav />

      {shouldShowBanner && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-base font-semibold text-red-800">
                Seu cadastro financeiro ainda não foi concluído
              </p>
              <p className="mt-1 text-sm text-red-600/90">
                Conclua esse cadastro para receber pagamentos e usar todos os recursos financeiros da loja.
              </p>
            </div>
            <button
              type="button"
              className="inline-flex w-full items-center justify-center rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 sm:w-auto"
              onClick={() => setRecipientModalOpen(true)}
            >
              Concluir cadastro financeiro
            </button>
          </div>
        </div>
      )}

      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
        <div className={`grid gap-3 ${panelMode === "simple" ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Status do cadastro
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm font-medium text-zinc-900">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  recipientStatus?.completed ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
              {recipientStatus?.completed ? "Concluído" : "Pendente"}
            </div>
          </div>
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
              <Landmark size={16} />
              Conta bancária principal
            </div>
            <p className="mt-1 text-xs leading-relaxed text-emerald-700">
              A conta onde sua loja recebe fica na aba Conta bancária.
            </p>
            <Link
              href="/painel/conta"
              className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-medium text-emerald-700 transition-colors hover:bg-emerald-100"
            >
              Abrir conta bancária
              <ArrowRight size={14} />
            </Link>
          </div>
          {panelMode !== "simple" && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-800">
                <Landmark size={16} />
                Recebimentos e antecipações
              </div>
              <p className="mt-1 text-xs leading-relaxed text-blue-700">
                Acompanhe saldo, recebimentos e antecipações na aba Financeiro.
              </p>
            </div>
          )}
        </div>
      </div>

      {!!user?.id && (
        <UserEdit user={user} simpleMode={panelMode === "simple"} />
      )}

      <RecipientModal
        open={recipientModalOpen}
        onClose={() => setRecipientModalOpen(false)}
        status={recipientStatus}
        onCompleted={handleRecipientCompleted}
        user={user}
        store={store}
      />
    </PainelLayout>
  );
}
