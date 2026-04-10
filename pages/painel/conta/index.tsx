import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, CreditCard, Info, Landmark, Pencil, ShieldCheck, X } from "lucide-react";
import { toast } from "react-toastify";
import Api from "@/src/services/api";
import { Input, Select } from "@/src/components/ui/form";
import { BankAccountType, UserType } from "@/src/models/user";
import { BankAccountTypeRecipient } from "@/src/models/Recipient";
import { PainelLayout, PageHeader, EmptyState } from "@/src/components/painel";
import FinanceSectionNav from "@/src/components/painel/FinanceSectionNav";
import { getStore } from "@/src/contexts/AuthContext";
import { getRecipientStatus } from "@/src/services/recipients";
import usePainelPageMode from "@/src/components/painel/usePainelPageMode";

const emptyBankProfile: BankAccountTypeRecipient = {
  holder_name: "",
  holder_document: "",
  bank: "",
  branch_number: "",
  branch_check_digit: "",
  account_number: "",
  account_check_digit: "",
  type: "checking",
};

function mapUserBankToRecipient(bank?: Partial<BankAccountType> | null, user?: UserType | null): BankAccountTypeRecipient {
  if (!bank) return { ...emptyBankProfile, holder_document: user?.cpf || user?.document || "" };

  return {
    holder_name: bank.holderName || bank.title || "",
    holder_document: bank.holderDocument || user?.cpf || user?.document || "",
    bank: bank.bank || "",
    branch_number: bank.agence || "",
    branch_check_digit: bank.agenceDigit || "",
    account_number: bank.accountNumber || "",
    account_check_digit: bank.accountDigit || "",
    type:
      bank.type || (bank.operation === "conta-poupanca" ? "savings" : "checking"),
  };
}

function mapWithdrawToRecipient(withdraw?: any, fallbackDocument = ""): BankAccountTypeRecipient {
  if (!withdraw) return { ...emptyBankProfile, holder_document: fallbackDocument };

  return {
    holder_name: withdraw.holder_name || "",
    holder_document: withdraw.holder_document || fallbackDocument,
    bank: withdraw.bank || "",
    branch_number: withdraw.branch_number || "",
    branch_check_digit: withdraw.branch_check_digit || "",
    account_number: withdraw.account_number || "",
    account_check_digit: withdraw.account_check_digit || "",
    type: withdraw.type || "checking",
  };
}

function toUserBankAccount(bank: BankAccountTypeRecipient): BankAccountType {
  return {
    title: bank.holder_name || "Conta principal",
    holderName: bank.holder_name || "",
    holderDocument: bank.holder_document || "",
    bank: bank.bank || "",
    agence: bank.branch_number || "",
    agenceDigit: bank.branch_check_digit || "",
    accountNumber: bank.account_number || "",
    accountDigit: bank.account_check_digit || "",
    operation: bank.type === "savings" ? "conta-poupanca" : "conta-corrente",
    type: bank.type || "checking",
  };
}

function isBankConfigured(bank: BankAccountTypeRecipient) {
  return Boolean(
    bank.holder_name &&
      bank.bank &&
      bank.branch_number &&
      bank.account_number &&
      bank.account_check_digit
  );
}

export default function Conta() {
  const api = useMemo(() => new Api(), []);
  const panelMode = usePainelPageMode();
  const [user, setUser] = useState({} as UserType);
  const [bank, setBank] = useState<BankAccountTypeRecipient>({ ...emptyBankProfile });
  const [savedBank, setSavedBank] = useState<BankAccountTypeRecipient>({ ...emptyBankProfile });
  const [recipientId, setRecipientId] = useState<number | null>(null);
  const [recipientReady, setRecipientReady] = useState(false);
  const [withdrawId, setWithdrawId] = useState<number | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [userRequest, recipientStatus] = await Promise.all([
        api.bridge({ method: "get", url: "users/get" }),
        getRecipientStatus(),
      ]);

      const nextUser = userRequest?.response ? userRequest.data : ({} as UserType);
      setUser(nextUser);
      setRecipientReady(Boolean(recipientStatus?.completed));
      setRecipientId(recipientStatus?.recipient?.id ? Number(recipientStatus.recipient.id) : null);

      const storeId = getStore();
      let withdrawData: any = null;
      if (storeId) {
        const withdrawRequest: any = await api.bridge({ method: "get", url: `/withdraw/${storeId}` });
        withdrawData = withdrawRequest?.[0] ?? withdrawRequest?.data?.[0] ?? withdrawRequest?.data ?? null;
      }

      const fallbackDocument = nextUser?.cpf || nextUser?.document || "";
      const nextBank = withdrawData?.bank || withdrawData?.holder_name
        ? mapWithdrawToRecipient(withdrawData, fallbackDocument)
        : recipientStatus?.recipient?.bank_account
          ? mapWithdrawToRecipient(recipientStatus.recipient.bank_account, fallbackDocument)
          : mapUserBankToRecipient(nextUser?.bankAccounts?.[0], nextUser);

      setWithdrawId(withdrawData?.id ? Number(withdrawData.id) : null);
      setBank(nextBank);
      setSavedBank(nextBank);
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const bankConfigured = isBankConfigured(savedBank);
  const effectiveHolderDocument = bank.holder_document || user?.cpf || user?.document || "";

  const handleChange = (key: keyof BankAccountTypeRecipient, value: string) => {
    setBank((prev) => ({
      ...prev,
      [key]: value,
      holder_document:
        key === "holder_document" ? value : prev.holder_document || effectiveHolderDocument,
    }));
  };

  const syncUserBankMirror = async (nextBank: BankAccountTypeRecipient) => {
    if (!user?.id) return false;

    const firstBank = toUserBankAccount(nextBank);
    const currentAccounts = Array.isArray(user.bankAccounts) ? [...user.bankAccounts] : [];
    const mirroredAccounts = [firstBank, ...currentAccounts.slice(1)];
    const payload: UserType = {
      ...user,
      id: user.id,
      bankAccounts: mirroredAccounts,
    };

    const response: any = await api.bridge({
      method: "post",
      url: "users/update",
      data: payload,
    });

    if (response?.response) {
      setUser(payload);
      return true;
    }

    return false;
  };

  const handleSave = async () => {
    const storeId = getStore();

    if (!recipientId) {
      toast.warning("Conclua primeiro o cadastro financeiro da loja.");
      return;
    }

    if (!storeId) {
      toast.error("Loja não encontrada.");
      return;
    }

    if (!isBankConfigured(bank)) {
      toast.warning("Preencha titular, banco, agência, conta e dígito da conta.");
      return;
    }

    setSaving(true);

    try {
      const cleanDocument = (bank.holder_document || user?.cpf || user?.document || "").replace(/\D/g, "");
      const payload = {
        store: storeId,
        recipient_id: recipientId,
        holder_name: (bank.holder_name || "").trim(),
        holder_document: cleanDocument,
        holder_type: cleanDocument.length === 14 ? "company" : "individual",
        bank: (bank.bank || "").trim(),
        branch_number: (bank.branch_number || "").trim(),
        branch_check_digit: (bank.branch_check_digit || "").trim(),
        account_number: (bank.account_number || "").trim(),
        account_check_digit: (bank.account_check_digit || "").trim(),
        type: bank.type || "checking",
        split_payment: 1,
        is_split: 1,
      };

      const response: any = withdrawId
        ? await api.bridge({
            method: "post",
            url: "/withdraw/update",
            data: { id: withdrawId, ...payload },
          })
        : await api.bridge({
            method: "post",
            url: "/withdraw/register",
            data: payload,
          });

      if (!response?.response) {
        toast.error(response?.message || "Não foi possível salvar a conta bancária.");
        return;
      }

      if (response?.data?.id) {
        setWithdrawId(Number(response.data.id));
      }

      const normalizedBank = {
        ...bank,
        holder_document: cleanDocument,
      };

      setSavedBank(normalizedBank);
      setBank(normalizedBank);
      setEditing(false);

      const synced = await syncUserBankMirror(normalizedBank);
      if (!synced) {
        toast.warning("Conta bancária salva, mas a tela ainda pode mostrar dados antigos. Atualize a página e confira novamente.");
      } else {
        toast.success("Conta bancária atualizada.");
      }
    } finally {
      setSaving(false);
    }
  };

  const holderDocumentLabel = (effectiveHolderDocument.replace(/\D/g, "").length === 14)
    ? "CNPJ do titular"
    : "CPF do titular";

  return (
    <PainelLayout>
      <PageHeader
        title="Conta bancária"
        description={
          panelMode === "simple"
            ? "Confira a conta onde sua loja recebe."
            : "Cadastre ou atualize a conta onde sua loja recebe"
        }
        actions={
          !editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-zinc-900 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex w-full sm:w-auto items-center justify-center gap-2"
            >
              <Pencil size={16} />
              {bankConfigured ? "Editar conta" : "Cadastrar conta"}
            </button>
          ) : (
            <div className="grid grid-cols-1 gap-2 sm:flex">
              <button
                type="button"
                onClick={() => {
                  setBank(savedBank);
                  setEditing(false);
                }}
                className="w-full rounded-lg px-4 py-2.5 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 sm:w-auto"
              >
                <span className="inline-flex items-center gap-2">
                  <X size={16} />
                  Cancelar
                </span>
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSave}
                className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50 sm:w-auto"
              >
                <span className="inline-flex items-center gap-2">
                  <Check size={16} />
                  {saving ? "Salvando..." : "Salvar conta"}
                </span>
              </button>
            </div>
          )
        }
      />

      <FinanceSectionNav />

      <div className={`mb-5 grid grid-cols-1 gap-3 ${panelMode === "simple" ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Status da conta
          </span>
          <div className="mt-1 text-sm font-semibold text-zinc-900">
            {bankConfigured ? "Pronta para receber" : "Ainda não cadastrada"}
          </div>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-4">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Titular
          </span>
          <div className="mt-1 text-sm font-semibold text-zinc-900 break-words">
            {savedBank.holder_name || "Ainda não informado"}
          </div>
        </div>
        {panelMode !== "simple" && (
          <div className="rounded-2xl border border-zinc-200 bg-white p-4">
            <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Banco principal
            </span>
            <div className="mt-1 text-sm font-semibold text-zinc-900 break-words">
              {savedBank.bank || "Ainda não informado"}
            </div>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              {savedBank.account_number
                ? `Conta ${savedBank.account_number}`
                : "Depois de salvar, a conta aparece aqui para conferência rápida."}
            </p>
          </div>
        )}
      </div>

      {!recipientReady && (
        <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-white p-2.5 text-red-600 shadow-sm">
              <ShieldCheck size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-red-800">
                Finalize antes o cadastro financeiro
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-red-700">
                Antes de cadastrar a conta bancária, conclua nome, documento e endereço na aba Cadastro financeiro.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className={`grid gap-8 ${panelMode === "simple" ? "grid-cols-1" : "lg:grid-cols-[1fr_320px]"}`}>
        <div>
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="mb-4 border-b border-zinc-100 pb-4">
              <h3 className="text-lg font-semibold text-zinc-900">
                Conta bancária da loja
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                {editing
                  ? "Revise banco, agência, conta e dígitos."
                  : "Confira a conta onde a loja recebe."}
              </p>
            </div>

            {loading ? (
              <div className="py-10 text-center text-sm text-zinc-400">Carregando conta bancária...</div>
            ) : !editing && !bankConfigured ? (
              <EmptyState
                icon={<CreditCard size={28} />}
                title="Nenhuma conta bancária cadastrada"
                description="Cadastre a conta da loja para começar a receber."
                action={
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-yellow-400 px-4 py-2.5 text-sm font-medium text-zinc-900 transition-colors hover:bg-yellow-500"
                  >
                    <Pencil size={16} />
                    Cadastrar conta
                  </button>
                }
              />
            ) : editing ? (
              <div className="grid gap-4">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-zinc-900">Titular e banco</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
                      Nome do titular
                      <Input
                        value={bank.holder_name || ""}
                        onChange={(e: any) => handleChange("holder_name", e.target.value)}
                        placeholder="Nome do titular"
                        required
                      />
                    </label>
                    <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
                      {holderDocumentLabel}
                      <Input
                        value={effectiveHolderDocument}
                        onChange={(e: any) => handleChange("holder_document", e.target.value)}
                        placeholder={holderDocumentLabel}
                        required
                      />
                    </label>
                    <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
                      Código do banco
                      <Input
                        value={bank.bank || ""}
                        onChange={(e: any) => handleChange("bank", e.target.value)}
                        placeholder="Ex.: 336"
                        required
                      />
                    </label>
                    <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
                      Tipo de conta
                      <Select
                        value={bank.type || "checking"}
                        onChange={(e: any) => handleChange("type", e.target.value)}
                        options={[
                          { name: "Conta corrente", value: "checking" },
                          { name: "Conta poupança", value: "savings" },
                        ]}
                      />
                    </label>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-4">
                  <h4 className="mb-3 text-sm font-semibold text-zinc-900">Agência e conta</h4>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
                      Número da agência
                      <Input
                        value={bank.branch_number || ""}
                        onChange={(e: any) => handleChange("branch_number", e.target.value)}
                        placeholder="0001"
                        required
                      />
                    </label>
                    <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
                      Dígito da agência
                      <Input
                        value={bank.branch_check_digit || ""}
                        onChange={(e: any) => handleChange("branch_check_digit", e.target.value)}
                        placeholder="0"
                      />
                    </label>
                    <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
                      Número da conta
                      <Input
                        value={bank.account_number || ""}
                        onChange={(e: any) => handleChange("account_number", e.target.value)}
                        placeholder="9733271"
                        required
                      />
                    </label>
                    <label className="grid gap-1.5 text-sm font-medium text-zinc-700">
                      Dígito da conta
                      <Input
                        value={bank.account_check_digit || ""}
                        onChange={(e: any) => handleChange("account_check_digit", e.target.value)}
                        placeholder="2"
                        required
                      />
                    </label>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    Titular
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-900 break-words">
                    {savedBank.holder_name || "Não informado"}
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    Documento do titular
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-900 break-all">
                    {effectiveHolderDocument || "Não informado"}
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    Banco
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-900 break-words">
                    {savedBank.bank || "Não informado"}
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    Tipo de conta
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-900 break-words">
                    {savedBank.type === "savings" ? "Conta poupança" : "Conta corrente"}
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    Agência
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-900 break-words">
                    {savedBank.branch_number || "Não informada"}
                    {savedBank.branch_check_digit ? `-${savedBank.branch_check_digit}` : ""}
                  </div>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    Conta
                  </div>
                  <div className="mt-1 text-sm font-semibold text-zinc-900 break-all">
                    {savedBank.account_number || "Não informada"}
                    {savedBank.account_check_digit ? `-${savedBank.account_check_digit}` : ""}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {panelMode !== "simple" && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-zinc-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                  <ShieldCheck size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-zinc-900">Cadastro financeiro x conta bancária</h3>
                  <div className="mt-2 grid gap-2 text-sm leading-relaxed text-zinc-600">
                    <p><strong>Cadastro financeiro:</strong> nome, documento e endereço do responsável.</p>
                    <p><strong>Conta bancária:</strong> banco, agência, conta e dígitos onde a loja recebe.</p>
                    <p>Antes de salvar, confira se os dados estão iguais aos do banco.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PainelLayout>
  );
}
