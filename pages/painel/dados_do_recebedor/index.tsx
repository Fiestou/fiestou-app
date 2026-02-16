import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";
import UserEdit from "@/src/components/shared/UserEdit";
import { useEffect, useState } from "react";
import Link from "next/link";
import RecipientModal from "@/src/components/pages/painel/meus-dados/RecipientModal";
import { RecipientStatusResponse, RecipientType } from "@/src/models/Recipient";
import { getRecipientStatus } from "@/src/services/recipients";
import { PainelLayout, PageHeader } from "@/src/components/painel";

export default function MeusDados() {
  const api = new Api();

  const [user, setUser] = useState({} as UserType);
  const [store, setStore] = useState<any>(null);
  const [recipientStatus, setRecipientStatus] = useState<RecipientStatusResponse | null>(null);
  const [recipientModalOpen, setRecipientModalOpen] = useState(false);

  const getUserData = async () => {
    const request: any = await api.bridge({ method: "get", url: "users/get" });
    if (request.response) setUser(request.data);
  };

  const getStoreData = async () => {
    try {
      const response: any = await api.bridge({ method: "post", url: "stores/form" });
      if (response?.response && response?.data) setStore(response.data);
    } catch {}
  };

  const fetchRecipientStatus = async () => {
    const status = await getRecipientStatus();
    setRecipientStatus(status);
  };

  const handleRecipientCompleted = (data: RecipientType) => {
    setRecipientStatus({ completed: true, recipient: data });
  };

  useEffect(() => {
    getUserData();
    getStoreData();
    fetchRecipientStatus();
  }, []);

  const shouldShowBanner =
    !!user?.id && user?.type === "partner" && recipientStatus && !recipientStatus.completed;

  return (
    <PainelLayout>
      <PageHeader title="Dados do Recebedor" description="Configure seus dados para receber pagamentos" />

      {shouldShowBanner && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-5 mb-6">
          <p className="text-base font-semibold text-red-800">
            Seu cadastro na Pagar.me ainda não foi finalizado
          </p>
          <p className="text-sm mt-1 text-red-600/90">
            Conclua o passo a passo para receber pagamentos, antecipar valores e liberar o painel completo.
          </p>
          <button
            type="button"
            className="mt-3 bg-red-600 hover:bg-red-700 text-white font-medium text-sm px-4 py-2 rounded-lg transition-colors"
            onClick={() => setRecipientModalOpen(true)}
          >
            Concluir cadastro agora
          </button>
        </div>
      )}

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
        <p className="text-sm text-blue-800">
          Ajustes de recebimento e antecipação agora ficam centralizados em{" "}
          <Link href="/painel/financeiro" className="font-semibold underline">
            Financeiro
          </Link>
          .
        </p>
      </div>

      {!!user?.id && (
        <UserEdit user={user} />
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
