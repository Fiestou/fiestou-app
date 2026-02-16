import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { DollarSign, Landmark, Clock3, HandCoins, RefreshCcw, Plus, XCircle, AlertCircle } from "lucide-react";
import { toast } from "react-toastify";
import Modal from "@/src/components/utils/Modal";
import { moneyFormat } from "@/src/helper";
import {
  getFinancialOverview,
  getFinancialAnticipations,
  createFinancialAnticipation,
  cancelFinancialAnticipation,
  updateAutomaticAnticipationSettings,
  updateTransferSettings,
} from "@/src/services/financial";
import {
  PainelLayout,
  PageHeader,
  DataTable,
  Badge,
  EmptyState,
} from "@/src/components/painel";
import type { Column } from "@/src/components/painel";

type TransferSettings = {
  transfer_enabled: boolean;
  transfer_interval: "daily" | "weekly" | "monthly";
  transfer_day: number;
};

type AutoAnticipationSettings = {
  enabled: boolean;
  type: "full" | "1025";
  volume_percentage: number | null;
  delay: number | null;
  anticipation_days: number[];
};

type ConfirmActionType =
  | "save_transfer"
  | "save_automatic"
  | "create_anticipation"
  | "cancel_anticipation";

type ConfirmState = {
  open: boolean;
  action: ConfirmActionType | null;
  title: string;
  description: string;
  payload?: any;
};

function toCents(value: string): number {
  if (!value) return 0;
  const clean = value.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".");
  const n = Number(clean);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100);
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("pt-BR");
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("pt-BR");
}

function centsToMoney(cents: number) {
  return `R$ ${moneyFormat((Number(cents) || 0) / 100)}`;
}

function normalizeTransferInterval(value: any): "daily" | "weekly" | "monthly" {
  const normalized = String(value || "").trim().toLowerCase();
  if (normalized === "daily" || normalized === "diario") return "daily";
  if (normalized === "monthly" || normalized === "mensal") return "monthly";
  return "weekly";
}

function normalizeTransferDay(value: any, interval: "daily" | "weekly" | "monthly") {
  const parsed = Number(value);
  const safe = Number.isFinite(parsed) ? Math.trunc(parsed) : 0;

  if (interval === "daily") return 0;
  if (interval === "weekly") return Math.min(5, Math.max(1, safe || 5));
  return Math.min(31, Math.max(1, safe || 5));
}

function statusInfo(raw: any) {
  const status = String(raw || "").toLowerCase();

  if (["approved", "paid", "completed"].includes(status)) {
    return { label: "Aprovada", variant: "success" as const };
  }
  if (["canceled", "cancelled", "denied", "failed"].includes(status)) {
    return { label: "Cancelada", variant: "danger" as const };
  }
  if (["processing"].includes(status)) {
    return { label: "Processando", variant: "warning" as const };
  }
  return { label: status ? status : "Pendente", variant: "info" as const };
}

export default function FinanceiroPage() {
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingAnticipations, setLoadingAnticipations] = useState(true);
  const [saving, setSaving] = useState(false);

  const [overview, setOverview] = useState<any>(null);
  const [limits, setLimits] = useState<any>(null);
  const [anticipations, setAnticipations] = useState<any[]>([]);
  const [providerWarning, setProviderWarning] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [transferSettings, setTransferSettings] = useState<TransferSettings>({
    transfer_enabled: true,
    transfer_interval: "weekly",
    transfer_day: 5,
  });

  const [autoSettings, setAutoSettings] = useState<AutoAnticipationSettings>({
    enabled: false,
    type: "full",
    volume_percentage: null,
    delay: null,
    anticipation_days: [],
  });
  const [autoDaysInput, setAutoDaysInput] = useState("");

  const [anticipationModal, setAnticipationModal] = useState(false);
  const [newAnticipation, setNewAnticipation] = useState({
    requested_amount: "",
    payment_date: "",
    timeframe: "",
  });

  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false,
    action: null,
    title: "",
    description: "",
  });

  const recipientReady = !!overview?.recipient?.ready;

  const loadOverview = async () => {
    setLoadingOverview(true);
    try {
      const res: any = await getFinancialOverview();
      if (res?.response && res?.data) {
        setOverview(res.data);

        const transfer = res.data.transfer_settings ?? {};
        const interval = normalizeTransferInterval(transfer.transfer_interval);
        setTransferSettings({
          transfer_enabled: Boolean(transfer.transfer_enabled ?? true),
          transfer_interval: interval,
          transfer_day: normalizeTransferDay(transfer.transfer_day, interval),
        });

        const auto = res.data.automatic_anticipation_settings ?? {};
        const days = Array.isArray(auto.anticipation_days)
          ? auto.anticipation_days.map((d: any) => Number(d)).filter((d: number) => Number.isFinite(d))
          : [];

        setAutoSettings({
          enabled: Boolean(auto.enabled),
          type: auto.type === "1025" ? "1025" : "full",
          volume_percentage:
            auto.volume_percentage == null ? null : Number(auto.volume_percentage),
          delay: auto.delay == null ? null : Number(auto.delay),
          anticipation_days: days,
        });
        setAutoDaysInput(days.join(","));
      } else {
        toast.error(res?.message || "Não foi possível carregar dados financeiros");
      }
    } catch {
      toast.error("Erro ao carregar dados financeiros");
    } finally {
      setLoadingOverview(false);
    }
  };

  const loadAnticipations = async () => {
    setLoadingAnticipations(true);
    setProviderWarning("");
    try {
      const res: any = await getFinancialAnticipations({
        page: 1,
        size: 30,
        status: statusFilter || undefined,
      });

      if (res?.response && res?.data) {
        setAnticipations(Array.isArray(res.data.items) ? res.data.items : []);
        setLimits(res.data.limits ?? null);

        const providerMessage =
          res.data?.provider_error?.message ||
          res.data?.limits_error?.message ||
          "";
        if (providerMessage) {
          setProviderWarning(providerMessage);
        }
      } else {
        setAnticipations([]);
        setLimits(null);
        setProviderWarning("");
        if (recipientReady) {
          toast.error(res?.message || "Não foi possível carregar antecipações");
        }
      }
    } catch {
      setAnticipations([]);
      setLimits(null);
      setProviderWarning("");
    } finally {
      setLoadingAnticipations(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  useEffect(() => {
    if (!recipientReady) return;
    loadAnticipations();
  }, [statusFilter, recipientReady]);

  const openConfirm = (
    action: ConfirmActionType,
    title: string,
    description: string,
    payload?: any
  ) => {
    setConfirm({
      open: true,
      action,
      title,
      description,
      payload,
    });
  };

  const closeConfirm = () => {
    if (saving) return;
    setConfirm({ open: false, action: null, title: "", description: "" });
  };

  const executeConfirmedAction = async () => {
    if (!confirm.action) return;
    setSaving(true);
    try {
      if (confirm.action === "save_transfer") {
        const payload = {
          transfer_enabled: transferSettings.transfer_enabled,
          transfer_interval: transferSettings.transfer_interval,
          transfer_day:
            transferSettings.transfer_interval === "daily"
              ? 0
              : Number(transferSettings.transfer_day || 5),
        };
        const res: any = await updateTransferSettings(payload);
        if (res?.response) {
          toast.success("Configurações de recebimento atualizadas");
          await loadOverview();
        } else {
          toast.error(res?.message || "Falha ao salvar configurações");
        }
      }

      if (confirm.action === "save_automatic") {
        const days = autoDaysInput
          .split(",")
          .map((v) => Number(v.trim()))
          .filter((n) => Number.isFinite(n) && n >= 1 && n <= 31);
        const uniqueDays = Array.from(new Set(days)).sort((a, b) => a - b);

        const payload = {
          enabled: autoSettings.enabled,
          type: autoSettings.type,
          volume_percentage:
            autoSettings.volume_percentage == null
              ? null
              : Number(autoSettings.volume_percentage),
          delay: autoSettings.delay == null ? null : Number(autoSettings.delay),
          anticipation_days: uniqueDays,
        };

        const res: any = await updateAutomaticAnticipationSettings(payload);
        if (res?.response) {
          toast.success("Antecipação automática atualizada");
          await loadOverview();
        } else {
          toast.error(res?.message || "Falha ao salvar antecipação automática");
        }
      }

      if (confirm.action === "create_anticipation") {
        const cents = toCents(newAnticipation.requested_amount);
        if (!cents) {
          toast.error("Informe um valor válido para antecipação");
          setSaving(false);
          return;
        }
        if (!newAnticipation.payment_date) {
          toast.error("Informe a data de pagamento");
          setSaving(false);
          return;
        }

        const payload = {
          requested_amount: cents,
          payment_date: newAnticipation.payment_date,
          timeframe: newAnticipation.timeframe || undefined,
        };

        const res: any = await createFinancialAnticipation(payload);
        if (res?.response) {
          toast.success("Antecipação solicitada com sucesso");
          setAnticipationModal(false);
          setNewAnticipation({ requested_amount: "", payment_date: "", timeframe: "" });
          await loadAnticipations();
          await loadOverview();
        } else {
          toast.error(res?.message || "Falha ao criar antecipação");
        }
      }

      if (confirm.action === "cancel_anticipation") {
        const anticipationId = String(confirm.payload?.id || "");
        if (!anticipationId) {
          toast.error("Antecipação inválida");
          setSaving(false);
          return;
        }
        const res: any = await cancelFinancialAnticipation(anticipationId);
        if (res?.response) {
          toast.success("Antecipação cancelada");
          await loadAnticipations();
        } else {
          toast.error(res?.message || "Falha ao cancelar antecipação");
        }
      }

      closeConfirm();
    } catch {
      toast.error("Erro inesperado na operação financeira");
    } finally {
      setSaving(false);
    }
  };

  const columns: Column<any>[] = [
    {
      key: "id",
      label: "ID",
      className: "w-32",
      render: (row) => (
        <span className="font-mono text-xs text-zinc-600">
          {row.id || "-"}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Solicitada em",
      render: (row) => <span className="text-sm text-zinc-700">{formatDateTime(row.created_at)}</span>,
    },
    {
      key: "payment_date",
      label: "Pagamento",
      className: "w-36",
      render: (row) => <span className="text-sm text-zinc-700">{formatDate(row.payment_date)}</span>,
    },
    {
      key: "requested_amount",
      label: "Valor",
      className: "w-32",
      render: (row) => (
        <span className="font-semibold text-zinc-900">
          {centsToMoney(Number(row.requested_amount || 0))}
        </span>
      ),
    },
    {
      key: "fee",
      label: "Taxa",
      className: "w-28",
      render: (row) => (
        <span className="text-sm text-zinc-600">
          {centsToMoney(Number(row.fee || 0))}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      className: "w-32",
      render: (row) => {
        const info = statusInfo(row.status);
        return <Badge variant={info.variant}>{info.label}</Badge>;
      },
    },
    {
      key: "actions",
      label: "Ações",
      className: "w-28",
      render: (row) => {
        const status = String(row.status || "").toLowerCase();
        const canCancel = ["pending", "processing", "requested"].includes(status);
        if (!canCancel) return <span className="text-xs text-zinc-400">-</span>;
        return (
          <button
            onClick={() =>
              openConfirm(
                "cancel_anticipation",
                "Cancelar antecipação",
                `Tem certeza que deseja cancelar a antecipação ${row.id}?`,
                { id: row.id }
              )
            }
            className="text-red-600 hover:text-red-700 text-sm font-medium"
          >
            Cancelar
          </button>
        );
      },
    },
  ];

  const financialCards = useMemo(() => {
    const local = overview?.local_balance ?? {};
    const pagarme = overview?.pagarme_balance ?? {};

    return [
      {
        title: "Disponível",
        value: centsToMoney(Number(pagarme.available_amount || 0)),
        subtitle: "Saldo disponível na Pagar.me",
        icon: <DollarSign size={16} />,
        tone: "emerald",
      },
      {
        title: "A receber",
        value: centsToMoney(Number(pagarme.waiting_funds_amount || 0)),
        subtitle: "Valores aguardando liberação",
        icon: <Clock3 size={16} />,
        tone: "amber",
      },
      {
        title: "Recebimentos (plataforma)",
        value: `R$ ${moneyFormat(Number(local.payments || 0))}`,
        subtitle: "Total de repasses registrados",
        icon: <Landmark size={16} />,
        tone: "blue",
      },
      {
        title: "Antecipado transferido",
        value: centsToMoney(Number(pagarme.transferred_amount || 0)),
        subtitle: "Histórico de transferências",
        icon: <HandCoins size={16} />,
        tone: "purple",
      },
    ];
  }, [overview]);

  return (
    <PainelLayout>
      <Modal
        status={anticipationModal}
        title="Nova antecipação"
        close={() => setAnticipationModal(false)}
        size="sm"
      >
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium text-zinc-700">Valor (R$)</label>
            <input
              type="text"
              value={newAnticipation.requested_amount}
              onChange={(e) =>
                setNewAnticipation((prev) => ({
                  ...prev,
                  requested_amount: e.target.value,
                }))
              }
              placeholder="Ex: 1200,00"
              className="w-full mt-1 border border-zinc-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">Data de pagamento</label>
            <input
              type="date"
              value={newAnticipation.payment_date}
              onChange={(e) =>
                setNewAnticipation((prev) => ({
                  ...prev,
                  payment_date: e.target.value,
                }))
              }
              className="w-full mt-1 border border-zinc-300 rounded-lg px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">Quando antecipar (opcional)</label>
            <select
              value={newAnticipation.timeframe}
              onChange={(e) =>
                setNewAnticipation((prev) => ({
                  ...prev,
                  timeframe: e.target.value,
                }))
              }
              className="w-full mt-1 border border-zinc-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Automático (recomendado)</option>
              <option value="start">No início do período</option>
              <option value="end">No fim do período</option>
            </select>
            <p className="mt-1 text-xs text-zinc-500">
              Se não tiver certeza, deixe em automático.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              openConfirm(
                "create_anticipation",
                "Confirmar antecipação",
                "Confirma o envio da solicitação de antecipação para a Pagar.me?"
              )
            }
            className="bg-yellow-400 hover:bg-yellow-500 text-zinc-900 rounded-lg py-2.5 text-sm font-semibold"
          >
            Solicitar antecipação
          </button>
        </div>
      </Modal>

      <Modal
        status={confirm.open}
        title={confirm.title || "Confirmar ação"}
        close={closeConfirm}
        size="xs"
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-600">{confirm.description}</p>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={closeConfirm}
              disabled={saving}
              className="px-3 py-2 text-sm rounded-lg border border-zinc-300 text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={executeConfirmedAction}
              disabled={saving}
              className="px-3 py-2 text-sm rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50"
            >
              {saving ? "Processando..." : "Confirmar"}
            </button>
          </div>
        </div>
      </Modal>

      <PageHeader
        title="Financeiro"
        description="Recebimentos, repasses e antecipações da sua loja"
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                loadOverview();
                if (recipientReady) loadAnticipations();
              }}
              className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <RefreshCcw size={15} />
              Atualizar
            </button>
            <button
              type="button"
              disabled={!recipientReady}
              onClick={() => setAnticipationModal(true)}
              className="bg-yellow-400 hover:bg-yellow-500 text-zinc-900 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus size={15} />
              Nova antecipação
            </button>
          </div>
        }
      />

      {!loadingOverview && !recipientReady && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-4">
          <p className="text-sm text-red-700">
            Para liberar recebimentos e antecipações, conclua primeiro o{" "}
            <Link href="/painel/dados_do_recebedor" className="underline font-semibold">
              cadastro da Pagar.me
            </Link>
            .
          </p>
        </div>
      )}

      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
        {financialCards.map((card) => (
          <div key={card.title} className="bg-white border border-zinc-200 rounded-xl p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-zinc-500">{card.title}</p>
                <p className="text-lg font-bold text-zinc-900 mt-1">{card.value}</p>
                <p className="text-xs text-zinc-400 mt-1">{card.subtitle}</p>
              </div>
              <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-600">
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-2 gap-5 mb-5">
        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-900">Configurações de recebimento</h3>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between text-sm">
              <span className="text-zinc-600">Transferência habilitada</span>
              <input
                type="checkbox"
                checked={transferSettings.transfer_enabled}
                onChange={(e) =>
                  setTransferSettings((prev) => ({
                    ...prev,
                    transfer_enabled: e.target.checked,
                  }))
                }
                className="w-4 h-4 accent-yellow-500"
              />
            </label>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="block text-zinc-600 mb-1">Frequência</span>
                <select
                  value={transferSettings.transfer_interval}
                  onChange={(e) =>
                    setTransferSettings((prev) => ({
                      ...prev,
                      transfer_interval: e.target.value as "daily" | "weekly" | "monthly",
                      transfer_day: e.target.value === "daily" ? 0 : 5,
                    }))
                  }
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2"
                >
                  <option value="daily">Diário</option>
                  <option value="weekly">Semanal</option>
                  <option value="monthly">Mensal</option>
                </select>
              </label>
              {transferSettings.transfer_interval !== "daily" && (
                <label className="text-sm">
                  <span className="block text-zinc-600 mb-1">
                    {transferSettings.transfer_interval === "weekly"
                      ? "Dia da semana (1-5)"
                      : "Dia do mês (1-31)"}
                  </span>
                  <input
                    type="number"
                    min={1}
                    max={transferSettings.transfer_interval === "weekly" ? 5 : 31}
                    value={transferSettings.transfer_day}
                    onChange={(e) =>
                      setTransferSettings((prev) => ({
                        ...prev,
                        transfer_day: Number(e.target.value || 1),
                      }))
                    }
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2"
                  />
                </label>
              )}
            </div>

            <button
              type="button"
              onClick={() =>
                openConfirm(
                  "save_transfer",
                  "Salvar recebimentos",
                  "Confirma a atualização das configurações de recebimento da loja?"
                )
              }
              className="w-full mt-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg py-2.5 text-sm font-semibold"
            >
              Salvar configurações
            </button>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-zinc-900">Antecipação automática</h3>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between text-sm">
              <span className="text-zinc-600">Ativar antecipação automática</span>
              <input
                type="checkbox"
                checked={autoSettings.enabled}
                onChange={(e) =>
                  setAutoSettings((prev) => ({
                    ...prev,
                    enabled: e.target.checked,
                  }))
                }
                className="w-4 h-4 accent-yellow-500"
              />
            </label>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="block text-zinc-600 mb-1">Tipo</span>
                <select
                  value={autoSettings.type}
                  onChange={(e) =>
                    setAutoSettings((prev) => ({
                      ...prev,
                      type: e.target.value as "full" | "1025",
                    }))
                  }
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2"
                >
                  <option value="full">Total (full)</option>
                  <option value="1025">10/25 (1025)</option>
                </select>
              </label>
              <label className="text-sm">
                <span className="block text-zinc-600 mb-1">Percentual (%)</span>
                <input
                  type="number"
                  min={1}
                  max={100}
                  value={autoSettings.volume_percentage ?? ""}
                  onChange={(e) =>
                    setAutoSettings((prev) => ({
                      ...prev,
                      volume_percentage: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2"
                />
              </label>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <label className="text-sm">
                <span className="block text-zinc-600 mb-1">Delay (dias)</span>
                <input
                  type="number"
                  min={0}
                  max={31}
                  value={autoSettings.delay ?? ""}
                  onChange={(e) =>
                    setAutoSettings((prev) => ({
                      ...prev,
                      delay: e.target.value ? Number(e.target.value) : null,
                    }))
                  }
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2"
                />
              </label>
              <label className="text-sm">
                <span className="block text-zinc-600 mb-1">Dias (1-31, separado por vírgula)</span>
                <input
                  type="text"
                  value={autoDaysInput}
                  onChange={(e) => setAutoDaysInput(e.target.value)}
                  placeholder="Ex: 5,10,20"
                  className="w-full border border-zinc-300 rounded-lg px-3 py-2"
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() =>
                openConfirm(
                  "save_automatic",
                  "Salvar antecipação automática",
                  "Confirma a atualização da antecipação automática na Pagar.me?"
                )
              }
              className="w-full mt-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg py-2.5 text-sm font-semibold"
            >
              Salvar antecipação automática
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-5 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-zinc-900">Antecipações solicitadas</h3>
          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-zinc-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Todos os status</option>
              <option value="pending">Pendentes</option>
              <option value="processing">Processando</option>
              <option value="approved">Aprovadas</option>
              <option value="canceled">Canceladas</option>
            </select>
          </div>
        </div>

        {!!limits && (
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-3 mb-4 text-xs text-zinc-600">
            <p className="font-semibold text-zinc-700 mb-1">Limites de antecipação (Pagar.me)</p>
            <pre className="whitespace-pre-wrap">{JSON.stringify(limits, null, 2)}</pre>
          </div>
        )}

        {!!providerWarning && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-amber-700 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Integração de antecipação indisponível no momento
                </p>
                <p className="text-xs text-amber-700 mt-1">{providerWarning}</p>
              </div>
            </div>
          </div>
        )}

        {!recipientReady ? (
          <EmptyState
            icon={<XCircle size={30} />}
            title="Recebedor não configurado"
            description="Finalize o cadastro da Pagar.me para usar antecipações."
          />
        ) : (
          <DataTable
            columns={columns}
            data={anticipations}
            keyField="id"
            pageSize={8}
            loading={loadingAnticipations}
            emptyMessage="Nenhuma antecipação encontrada"
          />
        )}
      </div>
    </PainelLayout>
  );
}
