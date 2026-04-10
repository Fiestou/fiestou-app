import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  DollarSign,
  Landmark,
  Clock3,
  HandCoins,
  RefreshCcw,
  Plus,
  XCircle,
  AlertCircle,
  ArrowRight,
  WalletCards,
} from "lucide-react";
import { toast } from "react-toastify";
import Modal from "@/src/components/utils/Modal";
import { moneyFormat } from "@/src/helper";
import {
  getFinancialOverview,
  getFinancialAnticipations,
  createFinancialAnticipation,
  cancelFinancialAnticipation,
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
import FinanceSectionNav from "@/src/components/painel/FinanceSectionNav";
import usePainelPageMode from "@/src/components/painel/usePainelPageMode";

type TransferSettings = {
  transfer_enabled: boolean;
  transfer_interval: "daily" | "weekly" | "monthly";
  transfer_day: number;
};

type ConfirmActionType =
  | "save_transfer"
  | "create_anticipation"
  | "cancel_anticipation";

type ConfirmState = {
  open: boolean;
  action: ConfirmActionType | null;
  title: string;
  description: string;
  payload?: any;
};

const PAGARME_STANDARD_WITHDRAW_FEE_CENTS = 367;

function calculateEasterSunday(year: number) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date: Date, amount: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + amount);
  next.setHours(0, 0, 0, 0);
  return next;
}

function getBrazilBankHolidaySet(year: number) {
  const easterSunday = calculateEasterSunday(year);
  const carnivalMonday = addDays(easterSunday, -48);
  const carnivalTuesday = addDays(easterSunday, -47);
  const corpusChristi = addDays(easterSunday, 60);

  return new Set([
    `${year}-01-01`,
    `${year}-04-21`,
    `${year}-05-01`,
    `${year}-09-07`,
    `${year}-10-12`,
    `${year}-11-02`,
    `${year}-11-15`,
    `${year}-11-20`,
    `${year}-12-25`,
    toDateInputValue(carnivalMonday),
    toDateInputValue(carnivalTuesday),
    toDateInputValue(corpusChristi),
  ]);
}

function isBankingBusinessDay(date: Date) {
  const day = date.getDay();
  if (day === 0 || day === 6) return false;
  return !getBrazilBankHolidaySet(date.getFullYear()).has(toDateInputValue(date));
}

function getNextBusinessDay(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  while (!isBankingBusinessDay(normalized)) {
    normalized.setDate(normalized.getDate() + 1);
  }
  return normalized;
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateInput(value?: string | null) {
  const raw = String(value || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw)) return null;
  const [year, month, day] = raw.split("-").map(Number);
  const parsed = new Date(year, month - 1, day);
  parsed.setHours(0, 0, 0, 0);
  if (
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month - 1 ||
    parsed.getDate() !== day
  ) {
    return null;
  }
  return parsed;
}

const WEEKDAY_OPTIONS = [
  { value: 1, label: "Segunda-feira" },
  { value: 2, label: "Terça-feira" },
  { value: 3, label: "Quarta-feira" },
  { value: 4, label: "Quinta-feira" },
  { value: 5, label: "Sexta-feira" },
];

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

function getAnticipationMinimumDate() {
  const nowInSaoPaulo = new Date(
    new Date().toLocaleString("sv-SE", {
      timeZone: "America/Sao_Paulo",
      hour12: false,
    }).replace(" ", "T")
  );

  if (Number.isNaN(nowInSaoPaulo.getTime())) {
    return toDateInputValue(getNextBusinessDay(new Date()));
  }

  const isAfterCutoff =
    nowInSaoPaulo.getHours() > 11 ||
    (nowInSaoPaulo.getHours() === 11 &&
      (nowInSaoPaulo.getMinutes() > 0 ||
        nowInSaoPaulo.getSeconds() > 0 ||
        nowInSaoPaulo.getMilliseconds() > 0));

  if (isAfterCutoff) {
    nowInSaoPaulo.setDate(nowInSaoPaulo.getDate() + 1);
  }

  return toDateInputValue(getNextBusinessDay(nowInSaoPaulo));
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

function getTransferIntervalLabel(value: "daily" | "weekly" | "monthly") {
  if (value === "daily") return "Diário";
  if (value === "monthly") return "Mensal";
  return "Semanal";
}

function getTransferDayLabel(
  interval: "daily" | "weekly" | "monthly",
  day: number,
) {
  if (interval === "daily") {
    return "Repasse em dias úteis";
  }

  if (interval === "weekly") {
    const weekDays = [
      "",
      "Segunda-feira",
      "Terça-feira",
      "Quarta-feira",
      "Quinta-feira",
      "Sexta-feira",
    ];
    return weekDays[day] || `Dia ${day}`;
  }

  return `Todo dia ${day}`;
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
  const panelMode = usePainelPageMode();
  const [loadingOverview, setLoadingOverview] = useState(true);
  const [loadingAnticipations, setLoadingAnticipations] = useState(true);
  const [saving, setSaving] = useState(false);

  const [overview, setOverview] = useState<any>(null);
  const [anticipations, setAnticipations] = useState<any[]>([]);
  const [anticipationLimits, setAnticipationLimits] = useState<any>(null);
  const [providerWarning, setProviderWarning] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const [transferSettings, setTransferSettings] = useState<TransferSettings>({
    transfer_enabled: true,
    transfer_interval: "weekly",
    transfer_day: 5,
  });

  const [anticipationModal, setAnticipationModal] = useState(false);
  const [newAnticipation, setNewAnticipation] = useState({
    requested_amount: "",
    payment_date: getAnticipationMinimumDate(),
    timeframe: "",
  });

  const [confirm, setConfirm] = useState<ConfirmState>({
    open: false,
    action: null,
    title: "",
    description: "",
  });

  const recipientReady = !!overview?.recipient?.ready;
  const minimumAnticipationDate = getAnticipationMinimumDate();
  const hasMinimumAnticipationAmount =
    anticipationLimits?.minimum?.amount != null &&
    Number.isFinite(Number(anticipationLimits.minimum.amount));
  const minimumAnticipationAmount = hasMinimumAnticipationAmount
    ? Number(anticipationLimits.minimum.amount)
    : null;
  const hasMaximumAnticipationAmount =
    anticipationLimits?.maximum?.amount != null &&
    Number.isFinite(Number(anticipationLimits.maximum.amount));
  const maximumAnticipationAmount = hasMaximumAnticipationAmount
    ? Number(anticipationLimits.maximum.amount)
    : null;
  const hasMinimumAnticipationFee =
    anticipationLimits?.minimum?.anticipation_fee != null &&
    Number.isFinite(Number(anticipationLimits.minimum.anticipation_fee));
  const minimumAnticipationFee = hasMinimumAnticipationFee
    ? Number(anticipationLimits.minimum.anticipation_fee)
    : null;
  const hasMaximumAnticipationFee =
    anticipationLimits?.maximum?.anticipation_fee != null &&
    Number.isFinite(Number(anticipationLimits.maximum.anticipation_fee));
  const maximumAnticipationFee = hasMaximumAnticipationFee
    ? Number(anticipationLimits.maximum.anticipation_fee)
    : null;
  const hasMinimumOperationalFee =
    anticipationLimits?.minimum?.fee != null &&
    Number.isFinite(Number(anticipationLimits.minimum.fee));
  const minimumOperationalFee = hasMinimumOperationalFee
    ? Number(anticipationLimits.minimum.fee)
    : null;
  const hasMaximumOperationalFee =
    anticipationLimits?.maximum?.fee != null &&
    Number.isFinite(Number(anticipationLimits.maximum.fee));
  const maximumOperationalFee = hasMaximumOperationalFee
    ? Number(anticipationLimits.maximum.fee)
    : null;
  const hasMinimumFraudFee =
    anticipationLimits?.minimum?.fraud_coverage_fee != null &&
    Number.isFinite(Number(anticipationLimits.minimum.fraud_coverage_fee));
  const minimumFraudFee = hasMinimumFraudFee
    ? Number(anticipationLimits.minimum.fraud_coverage_fee)
    : null;
  const hasMaximumFraudFee =
    anticipationLimits?.maximum?.fraud_coverage_fee != null &&
    Number.isFinite(Number(anticipationLimits.maximum.fraud_coverage_fee));
  const maximumFraudFee = hasMaximumFraudFee
    ? Number(anticipationLimits.maximum.fraud_coverage_fee)
    : null;
  const hasAnticipationLimitsLoaded =
    minimumAnticipationAmount != null || maximumAnticipationAmount != null;
  const noEligibleAnticipationBalance =
    maximumAnticipationAmount != null && maximumAnticipationAmount <= 0;

  const loadOverview = useCallback(async () => {
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
      } else {
        toast.error(res?.message || "Não foi possível carregar dados financeiros");
      }
    } catch {
      toast.error("Erro ao carregar dados financeiros");
    } finally {
      setLoadingOverview(false);
    }
  }, []);

  const loadAnticipations = useCallback(async () => {
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
        setAnticipationLimits(res.data?.limits ?? null);

        const providerMessage =
          res.data?.provider_error?.message ||
          res.data?.limits_error?.message ||
          "";
        if (providerMessage) {
          setProviderWarning(providerMessage);
        }
      } else {
        setAnticipations([]);
        setAnticipationLimits(null);
        setProviderWarning("");
        if (recipientReady) {
          toast.error(res?.message || "Não foi possível carregar antecipações");
        }
      }
    } catch {
      setAnticipations([]);
      setAnticipationLimits(null);
      setProviderWarning("");
    } finally {
      setLoadingAnticipations(false);
    }
  }, [recipientReady, statusFilter]);

  useEffect(() => {
    loadOverview();
  }, [loadOverview]);

  useEffect(() => {
    if (!recipientReady) return;
    loadAnticipations();
  }, [recipientReady, loadAnticipations]);

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

      if (confirm.action === "create_anticipation") {
        const cents = toCents(newAnticipation.requested_amount);
        if (!cents) {
          toast.error("Informe um valor válido para antecipação");
          setSaving(false);
          return;
        }
        if (!hasAnticipationLimitsLoaded) {
          toast.error(
            "Não foi possível consultar o valor mínimo e máximo de antecipação da sua loja agora."
          );
          setSaving(false);
          return;
        }
        if (maximumAnticipationAmount != null && maximumAnticipationAmount <= 0) {
          toast.error("Sem saldo elegível para antecipação no momento.");
          setSaving(false);
          return;
        }
        if (
          minimumAnticipationAmount != null &&
          minimumAnticipationAmount > 0 &&
          cents < minimumAnticipationAmount
        ) {
          toast.error(
            `O valor mínimo para antecipar é ${centsToMoney(minimumAnticipationAmount)}`
          );
          setSaving(false);
          return;
        }
        if (
          maximumAnticipationAmount != null &&
          maximumAnticipationAmount > 0 &&
          cents > maximumAnticipationAmount
        ) {
          toast.error(
            `O valor máximo para antecipar agora é ${centsToMoney(maximumAnticipationAmount)}`
          );
          setSaving(false);
          return;
        }
        if (!newAnticipation.payment_date) {
          toast.error("Informe a data de pagamento");
          setSaving(false);
          return;
        }
        const selectedPaymentDate = parseDateInput(newAnticipation.payment_date);
        if (!selectedPaymentDate) {
          toast.error("Escolha uma data válida para antecipação");
          setSaving(false);
          return;
        }
        if (newAnticipation.payment_date < minimumAnticipationDate) {
          toast.error("Escolha uma data válida para antecipação");
          setSaving(false);
          return;
        }
        if (!isBankingBusinessDay(selectedPaymentDate)) {
          toast.error("Escolha um dia útil bancário para antecipação");
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
          setNewAnticipation({
            requested_amount: "",
            payment_date: getAnticipationMinimumDate(),
            timeframe: "",
          });
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
    const recipientIsReady = !!overview?.recipient?.ready;
    const recommendedAvailable = recipientIsReady
      ? Number(pagarme.available_amount || 0) / 100
      : Number(local.cash_recommended ?? (local.cash || 0));

    return [
      {
        title: "Saldo disponível",
        value: recipientIsReady
          ? centsToMoney(Number(pagarme.available_amount || 0))
          : `R$ ${moneyFormat(recommendedAvailable)}`,
        subtitle: recipientIsReady
          ? "Valor já liberado para sua loja"
          : "Estimativa atual da plataforma",
        icon: <DollarSign size={16} />,
        tone: "emerald",
      },
      {
        title: "A receber",
        value: recipientIsReady
          ? centsToMoney(Number(pagarme.waiting_funds_amount || 0))
          : `R$ ${moneyFormat(Number(local.promises || 0))}`,
        subtitle: recipientIsReady
          ? "Valores ainda em liberação"
          : "Pedidos ainda em processamento",
        icon: <Clock3 size={16} />,
        tone: "amber",
      },
      {
        title: "Recebimentos registrados",
        value: `R$ ${moneyFormat(Number(local.payments || 0))}`,
        subtitle: "Resumo usado para conferência",
        icon: <Landmark size={16} />,
        tone: "blue",
      },
      {
        title: recipientIsReady ? "Transferido para a conta" : "Transferências pendentes",
        value: recipientIsReady
          ? centsToMoney(Number(pagarme.transferred_amount || 0))
          : `R$ ${moneyFormat(Number(local.withdraw_pending_value || 0))}`,
        subtitle: recipientIsReady
          ? "Movimentações já concluídas"
          : `${Number(local.withdraw_pending_count || 0)} solicitação(ões) em análise`,
        icon: <HandCoins size={16} />,
        tone: "purple",
      },
    ];
  }, [overview]);

  const openAnticipationModal = () => {
    setNewAnticipation({
      requested_amount: "",
      payment_date: getAnticipationMinimumDate(),
      timeframe: "",
    });
    setAnticipationModal(true);
  };

  const pageActions = (
    <div className="flex w-full sm:w-auto flex-col gap-2 sm:flex-row sm:items-center">
      <button
        type="button"
        onClick={() => {
          loadOverview();
          if (recipientReady) loadAnticipations();
        }}
        className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 w-full sm:w-auto"
      >
        <RefreshCcw size={15} />
        Atualizar
      </button>
      <button
        type="button"
        disabled={!recipientReady}
        onClick={openAnticipationModal}
        className="bg-yellow-400 hover:bg-yellow-500 text-zinc-900 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors flex items-center justify-center gap-2 w-full sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus size={15} />
        Nova antecipação
      </button>
    </div>
  );

  const sharedModals = (
    <>
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
            {noEligibleAnticipationBalance && (
              <p className="mt-2 text-xs text-red-700 font-semibold">
                Sem saldo elegível para antecipação no momento.
              </p>
            )}
            <p className="mt-1 text-xs text-red-600 font-semibold">
              {minimumAnticipationAmount != null
                ? `Valor mínimo para antecipação: ${centsToMoney(minimumAnticipationAmount)}.`
                : "Não foi possível consultar o valor mínimo de antecipação da sua loja agora."}
            </p>
            <p className="mt-1 text-xs text-red-600 font-semibold">
              {maximumAnticipationAmount != null
                ? `Valor máximo para antecipação agora: ${centsToMoney(maximumAnticipationAmount)}.`
                : "Não foi possível consultar o valor máximo de antecipação da sua loja agora."}
            </p>
            <div className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2.5">
              <p className="text-xs font-semibold text-red-700">
                A antecipação pode ter custos.
              </p>
              <p className="mt-1 text-[11px] text-red-700">
                Taxa de antecipação:{" "}
                {minimumAnticipationFee != null &&
                maximumAnticipationFee != null &&
                !noEligibleAnticipationBalance
                  ? `${centsToMoney(minimumAnticipationFee)} até ${centsToMoney(maximumAnticipationFee)}`
                  : "não informado"}
              </p>
              <p className="text-[11px] text-red-700">
                Taxa operacional:{" "}
                {minimumOperationalFee != null &&
                maximumOperationalFee != null &&
                !noEligibleAnticipationBalance
                  ? `${centsToMoney(minimumOperationalFee)} até ${centsToMoney(maximumOperationalFee)}`
                  : "não informado"}
              </p>
              <p className="text-[11px] text-red-700">
                Cobertura antifraude:{" "}
                {minimumFraudFee != null &&
                maximumFraudFee != null &&
                !noEligibleAnticipationBalance
                  ? `${centsToMoney(minimumFraudFee)} até ${centsToMoney(maximumFraudFee)}`
                  : "não informado"}
              </p>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-zinc-700">Data de pagamento</label>
            <input
              type="date"
              value={newAnticipation.payment_date}
              min={minimumAnticipationDate}
              onChange={(e) => {
                const rawValue = e.target.value;
                const selectedDate = parseDateInput(rawValue);
                if (selectedDate && !isBankingBusinessDay(selectedDate)) {
                  const nextBusinessDay = getNextBusinessDay(selectedDate);
                  const normalizedValue = toDateInputValue(nextBusinessDay);
                  toast.info(
                    `Antecipações só podem ser agendadas em dias úteis bancários. Ajustamos para ${formatDate(normalizedValue)}.`
                  );
                  setNewAnticipation((prev) => ({
                    ...prev,
                    payment_date: normalizedValue,
                  }));
                  return;
                }

                setNewAnticipation((prev) => ({
                  ...prev,
                  payment_date: rawValue,
                }));
              }}
              className="w-full mt-1 border border-zinc-300 rounded-lg px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-zinc-500">
              Antecipações só podem ser agendadas em dias úteis bancários, sem feriados nacionais, Carnaval e Corpus Christi.
            </p>
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
            disabled={noEligibleAnticipationBalance || !hasAnticipationLimitsLoaded}
            onClick={() =>
              openConfirm(
                "create_anticipation",
                "Confirmar antecipação",
                "Confirma o pedido de antecipação?"
              )
            }
            className="bg-yellow-400 hover:bg-yellow-500 text-zinc-900 rounded-lg py-2.5 text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Solicitar antecipação
          </button>
          {!hasAnticipationLimitsLoaded && (
            <p className="text-xs text-amber-700 font-medium">
              Aguarde os limites da Pagar.me carregarem antes de solicitar a antecipação.
            </p>
          )}
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
    </>
  );

  const recipientPendingAlert =
    !loadingOverview && !recipientReady ? (
      <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-red-800">
              Cadastro financeiro ainda não concluído
            </p>
            <p className="mt-1 text-sm text-red-700">
              Para liberar recebimentos e antecipações, conclua primeiro a
              aba Cadastro financeiro.
            </p>
          </div>
          <Link
            href="/painel/dados_do_recebedor"
            className="inline-flex w-full items-center justify-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-medium text-red-700 transition-colors hover:bg-red-100 sm:w-auto"
          >
            Ir para cadastro
            <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    ) : null;

  const financialCardsGrid = (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-5">
      {financialCards.map((card) => (
        <div
          key={card.title}
          className={`rounded-2xl border p-4 ${
            card.tone === "emerald"
              ? "border-emerald-200 bg-emerald-50/70"
              : card.tone === "amber"
                ? "border-amber-200 bg-amber-50/70"
                : card.tone === "blue"
                  ? "border-blue-200 bg-blue-50/70"
                  : "border-violet-200 bg-violet-50/70"
          }`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-zinc-500">{card.title}</p>
              <p className="text-lg font-bold text-zinc-900 mt-1">{card.value}</p>
              <p className="text-xs text-zinc-400 mt-1">{card.subtitle}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-white/80 flex items-center justify-center text-zinc-700 shadow-sm">
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const anticipationHistoryContent = !recipientReady ? (
    <EmptyState
      icon={<XCircle size={30} />}
      title="Cadastro financeiro pendente"
      description="Finalize a aba Cadastro financeiro para usar antecipações."
    />
  ) : (
    <DataTable
      columns={columns}
      data={anticipations}
      keyField="id"
      pageSize={panelMode === "simple" ? 5 : 8}
      loading={loadingAnticipations}
      emptyMessage="Nenhuma antecipação encontrada"
    />
  );

  if (panelMode === "simple") {
    return (
      <PainelLayout>
        {sharedModals}

        <PageHeader
          title="Financeiro"
          description="Veja o essencial do financeiro da sua loja."
          actions={pageActions}
        />

        <FinanceSectionNav />

        {recipientPendingAlert}
        {financialCardsGrid}

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-bold text-zinc-900">O essencial</h2>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <Link
                href="/painel/dados_do_recebedor"
                className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 transition-colors hover:border-yellow-300 hover:bg-white"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Cadastro financeiro
                </div>
                <div className="mt-2 text-base font-semibold text-zinc-900">
                  {recipientReady ? "Concluído" : "Pendente"}
                </div>
              </Link>

              <Link
                href="/painel/conta"
                className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4 transition-colors hover:border-yellow-300 hover:bg-white"
              >
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Conta bancária
                </div>
                <div className="mt-2 text-base font-semibold text-zinc-900">
                  {overview?.bank_account?.bank_code ? "Revisar conta" : "Cadastrar conta"}
                </div>
              </Link>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Recebimento
                </div>
                <div className="mt-2 text-base font-semibold text-zinc-900">
                  {transferSettings.transfer_enabled
                    ? `${getTransferIntervalLabel(transferSettings.transfer_interval)}`
                    : "Desligado"}
                </div>
                {transferSettings.transfer_enabled && (
                  <p className="mt-1 text-sm text-zinc-500">
                    {getTransferDayLabel(
                      transferSettings.transfer_interval,
                      transferSettings.transfer_day
                    )}
                  </p>
                )}
              </div>

              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
                <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
                  Antecipação
                </div>
                <div className="mt-2 text-base font-semibold text-zinc-900">
                  {hasAnticipationLimitsLoaded
                    ? `${centsToMoney(minimumAnticipationAmount || 0)} até ${centsToMoney(maximumAnticipationAmount || 0)}`
                    : "Indisponível agora"}
                </div>
                {hasAnticipationLimitsLoaded && (
                  <p className="mt-1 text-sm text-zinc-500">
                    A partir de {formatDate(minimumAnticipationDate)}
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-5">
            <h2 className="text-lg font-bold text-zinc-900">Ações</h2>

            {!!providerWarning && (
              <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 text-amber-700" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">
                      Antecipação indisponível no momento
                    </p>
                    <p className="mt-1 text-xs text-amber-700">{providerWarning}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-4 space-y-3">
              <Link
                href="/painel/dados_do_recebedor"
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3 transition-colors hover:border-yellow-300 hover:bg-white"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900">Cadastro financeiro</p>
                  <p className="text-xs text-zinc-500">
                    {recipientReady ? "Revisar dados" : "Concluir cadastro"}
                  </p>
                </div>
                <ArrowRight size={16} className="text-zinc-400" />
              </Link>

              <Link
                href="/painel/conta"
                className="flex items-center justify-between rounded-xl border border-zinc-200 bg-zinc-50/70 px-4 py-3 transition-colors hover:border-yellow-300 hover:bg-white"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900">Conta bancária</p>
                  <p className="text-xs text-zinc-500">
                    {overview?.bank_account?.bank_code ? "Revisar conta" : "Cadastrar conta"}
                  </p>
                </div>
                <ArrowRight size={16} className="text-zinc-400" />
              </Link>
            </div>
          </section>
        </div>
      </PainelLayout>
    );
  }

  return (
    <PainelLayout>
      {sharedModals}

      <PageHeader
        title="Financeiro"
        description="Recebimentos da loja."
        actions={pageActions}
      />

      <FinanceSectionNav />

      <div className="mb-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="mb-4 flex items-center gap-2">
          <div className="rounded-xl bg-yellow-50 p-2.5 text-yellow-600">
            <WalletCards size={18} />
          </div>
          <h2 className="text-base font-semibold text-zinc-900">Situação atual</h2>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  Cadastro financeiro
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm font-medium text-zinc-900">
              <span
                className={`inline-block h-2.5 w-2.5 rounded-full ${
                  recipientReady ? "bg-emerald-500" : "bg-amber-500"
                }`}
              />
                  {recipientReady ? "Concluído" : "Pendente"}
            </div>
          </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  Recebimento
                </div>
                <div className="mt-1 text-sm font-medium text-zinc-900">
                  {transferSettings.transfer_enabled ? "Ligado" : "Desligado"}
                </div>
                <div className="mt-1 text-xs text-zinc-500">
                  {transferSettings.transfer_enabled
                    ? `${getTransferIntervalLabel(transferSettings.transfer_interval)} · ${getTransferDayLabel(
                        transferSettings.transfer_interval,
                        transferSettings.transfer_day,
                      )}`
                    : "Desligado"}
                </div>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3">
                <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                  Antecipação
                </div>
                <div className="mt-1 text-sm font-medium text-zinc-900">
                  {hasAnticipationLimitsLoaded
                    ? `${centsToMoney(minimumAnticipationAmount || 0)} até ${centsToMoney(maximumAnticipationAmount || 0)}`
                    : "Indisponível agora"}
                </div>
                {hasAnticipationLimitsLoaded && (
                  <div className="mt-1 text-xs text-zinc-500">
                    A partir de {formatDate(minimumAnticipationDate)}
                  </div>
                )}
              </div>
            </div>
      </div>

      {recipientPendingAlert}
      {financialCardsGrid}

      <div className="grid xl:grid-cols-2 gap-5 mb-5">
        <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5">
          <div className="mb-4">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 mb-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Resumo do recebimento
              </div>
              <div className="mt-1 text-sm font-medium text-zinc-900">
                {transferSettings.transfer_enabled
                  ? `${getTransferIntervalLabel(transferSettings.transfer_interval)} · ${getTransferDayLabel(
                      transferSettings.transfer_interval,
                      transferSettings.transfer_day,
                    )}`
                  : "Transferência desligada"}
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">Recebimento</h3>
            </div>
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

            <div className="grid gap-3 sm:grid-cols-2">
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
                      ? "Dia da semana"
                      : "Dia do mês (1-31)"}
                </span>
                  {transferSettings.transfer_interval === "weekly" ? (
                    <select
                      value={transferSettings.transfer_day}
                      onChange={(e) =>
                        setTransferSettings((prev) => ({
                          ...prev,
                          transfer_day: Number(e.target.value || 1),
                        }))
                      }
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2"
                    >
                      {WEEKDAY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="number"
                      min={1}
                      max={31}
                      value={transferSettings.transfer_day}
                      onChange={(e) =>
                        setTransferSettings((prev) => ({
                          ...prev,
                          transfer_day: Number(e.target.value || 1),
                        }))
                      }
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2"
                    />
                  )}
                </label>
              )}
            </div>

            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
              <p className="text-sm font-semibold text-red-700">
                Taxa padrão por transferência: {centsToMoney(PAGARME_STANDARD_WITHDRAW_FEE_CENTS)}
              </p>
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
              Salvar recebimento
            </button>
          </div>
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5">
          <div className="mb-4">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 mb-4">
              <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                Disponível agora
              </div>
              <div className="mt-1 text-sm font-medium text-zinc-900">
                {hasAnticipationLimitsLoaded
                  ? `${centsToMoney(minimumAnticipationAmount || 0)} até ${centsToMoney(maximumAnticipationAmount || 0)}`
                  : "Antecipação indisponível agora"}
              </div>
              {hasAnticipationLimitsLoaded && (
                <div className="mt-1 text-xs text-zinc-500">
                  A partir de {formatDate(minimumAnticipationDate)}
                </div>
              )}
            </div>
            <div>
              <h3 className="font-semibold text-zinc-900">Nova antecipação</h3>
            </div>
          </div>
          <div className="space-y-3">
            <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3 text-sm text-zinc-600">
              Use a antecipação manual quando quiser adiantar um valor específico.
            </div>

            {!!providerWarning ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                {providerWarning}
              </div>
            ) : (
              <div className="rounded-xl border border-zinc-200 bg-white p-3 text-sm text-zinc-600">
                Abra uma nova antecipação para escolher valor e data do pagamento.
              </div>
            )}

            <button
              type="button"
              disabled={!recipientReady || noEligibleAnticipationBalance || !hasAnticipationLimitsLoaded}
              onClick={openAnticipationModal}
              className="w-full rounded-lg bg-yellow-400 py-2.5 text-sm font-semibold text-zinc-900 transition-colors hover:bg-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Nova antecipação
            </button>

            {!hasAnticipationLimitsLoaded && (
              <p className="text-xs text-amber-700 font-medium">
                Aguarde os limites da Pagar.me carregarem antes de solicitar a antecipação.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white border border-zinc-200 rounded-xl p-4 sm:p-5 mb-4">
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-semibold text-zinc-900">Antecipações solicitadas</h3>
          </div>
          <div className="flex w-full sm:w-auto items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto border border-zinc-300 rounded-lg px-3 py-2 text-sm"
            >
              <option value="">Todos os status</option>
              <option value="pending">Pendentes</option>
              <option value="processing">Processando</option>
              <option value="approved">Aprovadas</option>
              <option value="canceled">Canceladas</option>
            </select>
          </div>
        </div>

        {!!providerWarning && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertCircle size={16} className="text-amber-700 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-800">
                  Antecipação indisponível no momento
                </p>
                <p className="text-xs text-amber-700 mt-1">{providerWarning}</p>
              </div>
            </div>
          </div>
        )}

        {anticipationHistoryContent}
      </div>
    </PainelLayout>
  );
}
