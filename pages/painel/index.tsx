import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import {
  ShoppingBag,
  DollarSign,
  Package,
  Users,
  Plus,
  ClipboardList,
  Download,
  Settings,
  FileSpreadsheet,
  AlertTriangle,
  CalendarClock,
  ShieldAlert,
  ArrowRight,
} from "lucide-react";
import { getUser } from "@/src/contexts/AuthContext";
import { UserType } from "@/src/models/user";
import Api from "@/src/services/api";
import { getExtenseData } from "@/src/helper";
import { getDashboardStats, getMyOrders, DashboardStatsResponse } from "@/src/services/order";
import { getRecipientStatus } from "@/src/services/recipients";
import { getFinancialOverview } from "@/src/services/financial";
import { RecipientStatusResponse, RecipientType } from "@/src/models/Recipient";
import RecipientModal from "@/src/components/pages/painel/meus-dados/RecipientModal";
import OnboardingProgress from "@/src/components/shared/OnboardingProgress";
import {
  PainelLayout,
  PageHeader,
  StatsCard,
  DataTable,
  Badge,
  EmptyState,
} from "@/src/components/painel";
import type { Column } from "@/src/components/painel";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type BalanceType = {
  cash: number;
  payments: number;
  promises: number;
  orders: number;
};

const PERIOD_OPTIONS = [
  { label: "7 dias", value: "7" },
  { label: "30 dias", value: "30" },
  { label: "90 dias", value: "90" },
  { label: "Todos", value: "all" },
];

const QUICK_ACTIONS = [
  {
    title: "Novo Produto",
    description: "Cadastrar um produto na sua loja",
    href: "/painel/produtos/novo",
    icon: Plus,
    color: "bg-yellow-50 text-yellow-600",
  },
  {
    title: "Ver Pedidos",
    description: "Acompanhar todos os pedidos",
    href: "/painel/pedidos",
    icon: ClipboardList,
    color: "bg-blue-50 text-blue-600",
  },
  {
    title: "Importar Produtos",
    description: "Importar em lote via planilha",
    href: "/painel/produtos/importar",
    icon: Download,
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    title: "Config Loja",
    description: "Personalizar sua loja",
    href: "/painel/loja",
    icon: Settings,
    color: "bg-purple-50 text-purple-600",
  },
];

function getStatusBadge(statusText: string) {
  const map: Record<string, { variant: "success" | "warning" | "info" | "danger" | "neutral"; label: string }> = {
    Pago: { variant: "success", label: "Pago" },
    Pendente: { variant: "warning", label: "Pendente" },
    Cancelado: { variant: "danger", label: "Cancelado" },
  };
  const found = map[statusText] || { variant: "neutral" as const, label: statusText || "Em aberto" };
  return <Badge variant={found.variant} dot>{found.label}</Badge>;
}

function formatCurrency(value: number) {
  return `R$ ${(value || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function toNumber(value: any, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function getOrderPaymentLabel(order: any) {
  if (order?.metadata?.payment_method_display) {
    return order.metadata.payment_method_display;
  }

  const method = String(
    order?.metadata?.payment_method ||
    order?.metadata?.transaction_type ||
    order?.payment?.method ||
    ""
  ).toLowerCase();

  if (method === "credit_card") {
    const installments = Number(order?.metadata?.installments || order?.payment?.installments || 0);
    return installments > 1 ? `Cartão (${installments}x)` : "Cartão";
  }
  if (method === "pix") return "PIX";
  if (method === "boleto") return "Boleto";
  return "Não informado";
}

type OperationsSummary = {
  pendingConfirmation: number;
  deliveriesToday: number;
  delayedDeliveries: number;
  urgentOrders: Array<{
    id: number | string;
    createdAt?: string;
    total: number;
    customerName: string;
    reason: "delayed" | "today" | "pending";
  }>;
};

function toYmd(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function normalizeDateToYmd(value: any): string | null {
  if (!value) return null;

  if (typeof value === "string") {
    const raw = value.trim();
    if (!raw) return null;

    const brMatch = raw.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (brMatch) {
      const [, day, month, year] = brMatch;
      return `${year}-${month}-${day}`;
    }

    const isoMatch = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (isoMatch) {
      return `${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}`;
    }
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return toYmd(parsed);
}

function getOrderDeliveryDateYmd(order: any): string | null {
  return (
    normalizeDateToYmd(order?.delivery?.schedule?.date) ||
    normalizeDateToYmd(order?.deliverySchedule?.date) ||
    normalizeDateToYmd(order?.metadata?.scheduleStart) ||
    normalizeDateToYmd(order?.metadata?.scheduleEnd) ||
    null
  );
}

function getOrderDeliveryStatus(order: any): string {
  return String(order?.deliveryStatus || order?.delivery_status || order?.delivery?.status || "").toLowerCase();
}

function isOrderCanceled(order: any): boolean {
  const paymentStatus = String(order?.metadata?.payment_status || "").toLowerCase();
  const metadataStatus = String(order?.metadata?.status || "").toLowerCase();
  return (
    Number(order?.status) === -2 ||
    metadataStatus === "expired" ||
    paymentStatus === "expired" ||
    paymentStatus === "canceled" ||
    paymentStatus === "failed"
  );
}

function isOrderPaid(order: any): boolean {
  const paymentStatus = String(order?.metadata?.payment_status || "").toLowerCase();
  return (
    Number(order?.status) === 1 ||
    !!order?.metadata?.paid_at ||
    paymentStatus === "paid" ||
    paymentStatus === "approved"
  );
}

function isOrderDelivered(order: any): boolean {
  const deliveryStatus = getOrderDeliveryStatus(order);
  return [
    "delivered",
    "delivered_to_customer",
    "completed",
    "concluded",
    "entregue",
    "concluido",
    "concluído",
  ].includes(deliveryStatus);
}

function getOrderNavigationId(order: any): number | string {
  return order?.mainOrderId || order?.orderIds?.[0] || order?.id;
}

function exportOrdersCsv(orders: any[]) {
  if (!orders.length) return;

  const headers = ["ID", "Data", "Cliente", "Email", "Total", "Status"];
  const rows = orders.map((o: any) => {
    const id = o.mainOrderId || o.id;
    const date = o.createdAt || o.created_at;
    const total = o.totalGeneral || o.total || 0;
    const name = o.customer?.name || o.user?.name || "---";
    const email = o.customer?.email || o.user?.email || "";
    return [
      id,
      date ? new Date(date).toLocaleDateString("pt-BR") : "",
      name,
      email,
      Number(total).toFixed(2).replace(".", ","),
      o.statusText || "Pendente",
    ];
  });

  const csv = [headers.join(";"), ...rows.map((r: any[]) => r.join(";"))].join("\r\n");
  const csvContent = "\uFEFF" + csv;
  const encoded = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
  const link = document.createElement("a");
  link.href = encoded;
  link.download = `pedidos_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function getServerSideProps(ctx: any) {
  const api = new Api();

  let request: any = await api.call(
    {
      method: 'post',
      url: "request/graph",
      data: [
        {
          model: "page",
          filter: [
            {
              key: "slug",
              value: "home-partner",
              compare: "=",
            },
          ],
        },
      ],
    },
    ctx
  );

  let content = request?.data?.query?.page ?? {};

  return {
    props: {
      content: content[0] ?? {},
    },
  };
}

export default function Parceiro({ content }: { content: any }) {
  const api = new Api();
  const [user, setUser] = useState({} as UserType);
  const [store, setStore] = useState<any>(null);
  const [balance, setBalance] = useState({} as BalanceType);
  const [stats, setStats] = useState<DashboardStatsResponse | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingExport, setLoadingExport] = useState(false);
  const [period, setPeriod] = useState("30");
  const [recipientModalOpen, setRecipientModalOpen] = useState(false);
  const [recipientStatus, setRecipientStatus] = useState<RecipientStatusResponse | null>(null);
  const [productCount, setProductCount] = useState(0);
  const [loadingOperations, setLoadingOperations] = useState(true);
  const [operations, setOperations] = useState<OperationsSummary>({
    pendingConfirmation: 0,
    deliveriesToday: 0,
    delayedDeliveries: 0,
    urgentOrders: [],
  });

  const getBalance = async () => {
    const applyLegacyBalance = async () => {
      const legacyBalance: any = await api.bridge({
        method: "post",
        url: "stores/balance",
      });
      const legacyData = legacyBalance?.data ?? legacyBalance ?? {};

      setBalance({
        cash: toNumber(legacyData.cash, 0),
        payments: toNumber(legacyData.payments, 0),
        promises: toNumber(legacyData.promises, 0),
        orders: toNumber(legacyData.orders, 0),
      });
    };

    try {
      const overview: any = await getFinancialOverview();
      const overviewData = overview?.response ? overview?.data : overview?.data?.data;
      const localBalance = overviewData?.local_balance;

      if (localBalance && typeof localBalance === "object") {
        setBalance({
          cash: toNumber(localBalance.cash_recommended ?? localBalance.cash, 0),
          payments: toNumber(localBalance.payments, 0),
          promises: toNumber(localBalance.promises, 0),
          orders: toNumber(localBalance.orders, 0),
        });
        return;
      }
    } catch {
      // Mantém fallback legado quando overview falhar no backend ou na rede.
    }

    try {
      await applyLegacyBalance();
    } catch {
      setBalance({
        cash: 0,
        payments: 0,
        promises: 0,
        orders: 0,
      });
    }
  };

  const fetchStats = useCallback(async (p: string, opts?: { silent?: boolean }) => {
    const silent = !!opts?.silent;
    if (!silent) {
      setLoadingStats(true);
    }
    const data = await getDashboardStats(p);
    setStats(data);
    if (!silent) {
      setLoadingStats(false);
    }
  }, []);

  const fetchOperationsOverview = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = !!opts?.silent;
    if (!silent) {
      setLoadingOperations(true);
    }
    try {
      const orders = await getMyOrders();
      const list = Array.isArray(orders) ? orders : [];

      const todayYmd = toYmd(new Date());

      const pendingConfirmation: any[] = [];
      const deliveriesToday: any[] = [];
      const delayedDeliveries: any[] = [];

      list.forEach((order: any) => {
        if (isOrderCanceled(order)) {
          return;
        }

        const deliveryDateYmd = getOrderDeliveryDateYmd(order);
        const paid = isOrderPaid(order);
        const delivered = isOrderDelivered(order);

        if (!paid) {
          pendingConfirmation.push(order);
        }

        if (deliveryDateYmd === todayYmd && !delivered) {
          deliveriesToday.push(order);
        }

        if (deliveryDateYmd && deliveryDateYmd < todayYmd && !delivered) {
          delayedDeliveries.push(order);
        }
      });

      const urgentOrders = [
        ...delayedDeliveries.map((order: any) => ({ ...order, reason: "delayed" as const })),
        ...deliveriesToday.map((order: any) => ({ ...order, reason: "today" as const })),
        ...pendingConfirmation.map((order: any) => ({ ...order, reason: "pending" as const })),
      ]
        .reduce((acc: any[], current: any) => {
          if (acc.some((item) => getOrderNavigationId(item) === getOrderNavigationId(current))) {
            return acc;
          }
          return [...acc, current];
        }, [])
        .slice(0, 6)
        .map((order: any) => ({
          id: getOrderNavigationId(order),
          createdAt: order?.createdAt || order?.created_at,
          total: Number(order?.total || 0),
          customerName: order?.customer?.name || order?.user?.name || "Cliente",
          reason: order.reason,
        }));

      setOperations({
        pendingConfirmation: pendingConfirmation.length,
        deliveriesToday: deliveriesToday.length,
        delayedDeliveries: delayedDeliveries.length,
        urgentOrders,
      });
    } catch {
      setOperations({
        pendingConfirmation: 0,
        deliveriesToday: 0,
        delayedDeliveries: 0,
        urgentOrders: [],
      });
    } finally {
      if (!silent) {
        setLoadingOperations(false);
      }
    }
  }, []);

  const getProducts = async () => {
    try {
      const res: any = await api.bridge({
        method: "get",
        url: "stores/products",
      });
      setProductCount(res?.meta?.total || res?.data?.length || 0);
    } catch (err) {}
  };

  const checkPagarmeStatus = async () => {
    try {
      const status = await getRecipientStatus();
      setRecipientStatus(status);
    } catch (err) {}
  };

  const getStoreData = async () => {
    try {
      const response: any = await api.bridge({
        method: "post",
        url: "stores/form",
      });
      if (response?.response && response?.data) {
        setStore(response.data);
      }
    } catch (err) {}
  };

  const handleRecipientCompleted = (data: RecipientType) => {
    setRecipientStatus({
      completed: true,
      recipient: data,
    });
  };

  const handleExport = async () => {
    setLoadingExport(true);
    try {
      const data = await getMyOrders();
      if (Array.isArray(data) && data.length) {
        const formatted = data.map((o: any) => {
          const meta = o.metadata || {};
          const ps = meta.payment_status;
          const hasPaid = !!meta.paid_at;
          let statusText = "Pendente";
          if (hasPaid || ps === "paid" || ps === "approved") statusText = "Pago";
          else if (["expired", "canceled", "failed"].includes(ps)) statusText = "Cancelado";
          return { ...o, statusText };
        });
        exportOrdersCsv(formatted);
      }
    } catch {}
    setLoadingExport(false);
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUser(getUser());
      getBalance();
      getProducts();
      checkPagarmeStatus();
      getStoreData();
      fetchOperationsOverview();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchStats(period);
  }, [period, fetchStats]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const refreshData = () => {
      fetchStats(period, { silent: true });
      fetchOperationsOverview({ silent: true });
    };

    const intervalId = window.setInterval(refreshData, 60_000);
    const handleFocus = () => refreshData();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        refreshData();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [period, fetchStats, fetchOperationsOverview]);

  const recentOrders = stats?.recentOrders || [];

  const chartData = {
    labels: ["Pago", "Pendente", "Cancelado"],
    datasets: [
      {
        data: [
          stats?.statusCounts?.paid || 0,
          stats?.statusCounts?.pending || 0,
          stats?.statusCounts?.canceled || 0,
        ],
        backgroundColor: ["#10b981", "#f59e0b", "#ef4444"],
        borderColor: ["#d1fae5", "#fef3c7", "#fee2e2"],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 16,
          usePointStyle: true,
          pointStyleWidth: 10,
          font: { size: 12 },
        },
      },
    },
    cutout: "60%",
  };

  const hasChartData = (stats?.statusCounts?.paid || 0) + (stats?.statusCounts?.pending || 0) + (stats?.statusCounts?.canceled || 0) > 0;

  const orderColumns: Column[] = [
    {
      key: "id",
      label: "#",
      sortable: true,
      className: "w-16",
      render: (row: any) => (
        <span className="font-medium text-zinc-900">#{row.mainOrderId || row.id}</span>
      ),
    },
    {
      key: "created_at",
      label: "Data",
      sortable: true,
      render: (row: any) => (
        <span className="text-zinc-600 text-sm whitespace-nowrap">
          {getExtenseData(row.createdAt || row.created_at)}
        </span>
      ),
    },
    {
      key: "customer",
      label: "Cliente",
      render: (row: any) => {
        const customerName = row.customer?.name || row.user?.name || "---";
        const customerEmail = row.customer?.email || row.user?.email || "";
        return (
          <div>
            <span className="font-medium text-zinc-800 block">{customerName}</span>
            {!!customerEmail && (
              <span className="text-xs text-zinc-500">{customerEmail}</span>
            )}
          </div>
        );
      },
    },
    {
      key: "total",
      label: "Valor",
      sortable: true,
      render: (row: any) => (
        <span className="font-semibold text-zinc-900">
          {formatCurrency(row.total)}
        </span>
      ),
    },
    {
      key: "payment_method",
      label: "Pagamento",
      className: "w-32",
      render: (row: any) => (
        <span className="text-sm text-zinc-700">
          {getOrderPaymentLabel(row)}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: any) => getStatusBadge(row.statusText),
    },
    {
      key: "actions",
      label: "",
      className: "w-24",
      render: (row: any) => (
        <Link
          href={`/painel/pedidos/${row.mainOrderId || row.id}`}
          className="text-sm text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
        >
          Detalhes
        </Link>
      ),
    },
  ];

  const periodLabel = PERIOD_OPTIONS.find(p => p.value === period)?.label || "";

  return (
    <PainelLayout>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <PageHeader
          title="Dashboard"
          description="Resumo da sua loja"
        />
        <div className="flex items-center gap-2">
          {PERIOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPeriod(opt.value)}
              className={`px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors ${
                period === opt.value
                  ? "border-yellow-400 bg-yellow-50 text-zinc-900"
                  : "border-zinc-200 text-zinc-500 hover:border-zinc-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <OnboardingProgress onOpenPagarme={() => setRecipientModalOpen(true)} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard
          icon={<ShoppingBag size={20} />}
          iconColor="bg-cyan-50 text-cyan-600"
          value={loadingStats ? "..." : (stats?.ordersCount ?? balance.orders ?? 0)}
          label="Pedidos no período"
          trend={{ value: 0, label: periodLabel }}
        />
        <StatsCard
          icon={<DollarSign size={20} />}
          iconColor="bg-emerald-50 text-emerald-600"
          value={loadingStats ? "..." : formatCurrency(stats?.totalRevenue ?? 0)}
          label="Receita (pagos)"
        />
        <StatsCard
          icon={<Package size={20} />}
          iconColor="bg-yellow-50 text-yellow-600"
          value={loadingStats ? "..." : formatCurrency(stats?.avgTicket ?? 0)}
          label="Ticket médio"
        />
        <StatsCard
          icon={<Users size={20} />}
          iconColor="bg-purple-50 text-purple-600"
          value={productCount}
          label="Produtos ativos"
        />
      </div>

      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-5 mb-8">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 font-display">Central de Operação</h2>
            <p className="text-sm text-zinc-500">Priorize os pedidos críticos e agilize o atendimento.</p>
          </div>
          <Link
            href="/painel/pedidos"
            className="text-sm text-yellow-600 hover:text-yellow-700 font-medium transition-colors whitespace-nowrap"
          >
            Ver pedidos
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          <Link
            href="/painel/pedidos?quick=pending-confirmation"
            className="rounded-lg border border-zinc-200 p-4 hover:border-yellow-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-zinc-500">A confirmar</span>
              <ShieldAlert size={15} className="text-amber-500" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 mt-1">
              {loadingOperations ? "..." : operations.pendingConfirmation}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Pedidos aguardando confirmação.</p>
          </Link>

          <Link
            href="/painel/pedidos?quick=deliveries-today"
            className="rounded-lg border border-zinc-200 p-4 hover:border-yellow-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-zinc-500">Entrega de hoje</span>
              <CalendarClock size={15} className="text-cyan-500" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 mt-1">
              {loadingOperations ? "..." : operations.deliveriesToday}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Pedidos com agenda para hoje.</p>
          </Link>

          <Link
            href="/painel/pedidos?quick=delayed"
            className="rounded-lg border border-zinc-200 p-4 hover:border-red-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-zinc-500">Atrasados</span>
              <AlertTriangle size={15} className="text-red-500" />
            </div>
            <div className="text-2xl font-bold text-zinc-900 mt-1">
              {loadingOperations ? "..." : operations.delayedDeliveries}
            </div>
            <p className="text-xs text-zinc-500 mt-1">Exigem ação imediata.</p>
          </Link>
        </div>

        {!loadingOperations && operations.urgentOrders.length > 0 && (
          <div className="rounded-lg border border-zinc-200 overflow-hidden">
            {operations.urgentOrders.map((order) => (
              <div
                key={`urgent-${order.id}`}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-zinc-100 last:border-b-0"
              >
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-zinc-900">
                    Pedido #{order.id}
                  </div>
                  <div className="text-xs text-zinc-500 truncate">
                    {order.customerName} • {order.createdAt ? getExtenseData(order.createdAt) : "Data não informada"}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge
                    variant={
                      order.reason === "delayed"
                        ? "danger"
                        : order.reason === "today"
                          ? "info"
                          : "warning"
                    }
                  >
                    {order.reason === "delayed"
                      ? "Atrasado"
                      : order.reason === "today"
                        ? "Entrega hoje"
                        : "A confirmar"}
                  </Badge>
                  <div className="text-sm font-semibold text-zinc-800">
                    {formatCurrency(order.total)}
                  </div>
                  <Link
                    href={`/painel/pedidos/${order.id}`}
                    className="inline-flex items-center gap-1 text-sm text-yellow-700 hover:text-yellow-800 font-medium"
                  >
                    Ver <ArrowRight size={13} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-zinc-900 font-display">Últimos pedidos</h2>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleExport}
                  disabled={loadingExport}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  <FileSpreadsheet size={14} />
                  {loadingExport ? "Exportando..." : "Exportar CSV"}
                </button>
                <Link
                  href="/painel/pedidos"
                  className="text-sm text-yellow-600 hover:text-yellow-700 font-medium transition-colors"
                >
                  Ver todos
                </Link>
              </div>
            </div>

            {recentOrders.length === 0 && !loadingStats ? (
              <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm">
                <EmptyState
                  icon={<ShoppingBag size={28} />}
                  title="Nenhum pedido ainda"
                  description="Quando seus clientes fizerem pedidos, eles vão aparecer aqui."
                />
              </div>
            ) : (
              <DataTable
                columns={orderColumns}
                data={recentOrders}
                pageSize={5}
                loading={loadingStats}
                emptyMessage="Nenhum pedido encontrado"
              />
            )}
          </div>
        </div>

        <div className="space-y-6">
          {hasChartData && (
            <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-5">
              <h3 className="text-sm font-bold text-zinc-900 mb-4">Status dos pedidos</h3>
              <div className="h-52">
                <Doughnut data={chartData} options={chartOptions} />
              </div>
              <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                <div>
                  <div className="text-lg font-bold text-emerald-600">{stats?.statusCounts?.paid || 0}</div>
                  <div className="text-xs text-zinc-500">Pagos</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-amber-500">{stats?.statusCounts?.pending || 0}</div>
                  <div className="text-xs text-zinc-500">Pendentes</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-500">{stats?.statusCounts?.canceled || 0}</div>
                  <div className="text-xs text-zinc-500">Cancelados</div>
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 className="text-lg font-bold text-zinc-900 font-display mb-4">Ações rápidas</h2>
            <div className="grid gap-3">
              {QUICK_ACTIONS.map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-4 flex items-center gap-4 hover:border-yellow-300 hover:shadow-md transition-all group"
                >
                  <div className={`p-2.5 rounded-lg ${action.color}`}>
                    <action.icon size={18} />
                  </div>
                  <div>
                    <div className="font-semibold text-zinc-900 text-sm group-hover:text-yellow-700 transition-colors">
                      {action.title}
                    </div>
                    <div className="text-xs text-zinc-500">{action.description}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {recipientStatus?.completed && (
            <div className="bg-emerald-50 rounded-xl border border-emerald-200 p-4">
              <div className="text-sm font-medium text-emerald-700">
                Recebedor ativo
              </div>
              <div className="text-xs text-emerald-600 mt-1">
                Código: {(recipientStatus?.recipient as any)?.code ||
                  (typeof recipientStatus?.recipient === 'string' ? recipientStatus.recipient : null) ||
                  "N/A"}
              </div>
            </div>
          )}

          {balance.promises > 0 && (
            <div className="bg-amber-50 rounded-xl border border-amber-200 p-4">
              <div className="text-sm font-medium text-amber-700">
                Promessas de pagamento
              </div>
              <div className="text-lg font-bold text-amber-800 mt-1">
                {formatCurrency(balance.promises)}
              </div>
            </div>
          )}
        </div>
      </div>

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
