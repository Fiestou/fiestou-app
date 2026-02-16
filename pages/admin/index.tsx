import { Button } from "@/src/components/ui/form";
import { getUser } from "@/src/contexts/AuthContext";
import { UserType } from "@/src/models/user";
import Template from "@/src/template";
import { useEffect, useState } from "react";
import Api from "@/src/services/api";
import { moneyFormat } from "@/src/helper";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";

interface DashboardStats {
  orders: {
    total: number;
    month: number;
    last_month: number;
    pending: number;
  };
  revenue: {
    total: number;
    month: number;
    last_month: number;
  };
  users: {
    total: number;
    new_month: number;
  };
  partners: {
    total: number;
    active: number;
  };
  products: {
    total: number;
    active: number;
  };
  withdrawals: {
    pending: number;
    pending_value: number;
  };
  recent_orders: Array<{
    id: number;
    group_hash: string;
    total: number;
    status: any;
    customer_name: string;
    created_at: string;
  }>;
}

function StatCard({
  title,
  value,
  subtitle,
  icon,
  href,
  color = "blue",
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: string;
  href?: string;
  color?: string;
}) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    green: "bg-green-50 text-green-600",
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
    red: "bg-red-50 text-red-600",
    zinc: "bg-zinc-100 text-zinc-600",
  };

  const content = (
    <div className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500">{title}</p>
          <p className="text-2xl font-bold text-zinc-900 mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorMap[color]}`}
        >
          <Icon icon={icon} type="far" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }
  return content;
}

function QuickLink({
  title,
  icon,
  href,
}: {
  title: string;
  icon: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 bg-white border rounded-lg px-4 py-3 hover:bg-zinc-50 hover:shadow-sm transition-all"
    >
      <Icon icon={icon} type="far" className="text-zinc-500" />
      <span className="text-sm font-medium text-zinc-700">{title}</span>
      <Icon
        icon="fa-chevron-right"
        type="far"
        className="text-[.6rem] text-zinc-400 ml-auto"
      />
    </Link>
  );
}

export default function Admin() {
  const [user, setUser] = useState({} as UserType);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const api = new Api();

  const fetchStats = async () => {
    try {
      const res: any = await api.bridge({
        method: "get",
        url: "admin/dashboard/stats",
      });
      if (res?.response && res.data) {
        setStats(res.data);
      }
    } catch (err) {
      console.log("dashboard stats error", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      setUser(getUser);
      fetchStats();
    }
  }, []);

  const getVariation = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? "+100%" : "0%";
    const diff = ((current - previous) / previous) * 100;
    return `${diff > 0 ? "+" : ""}${diff.toFixed(0)}%`;
  };

  const getStatusLabel = (status: any) => {
    const map: Record<string, string> = {
      paid: "Pago",
      approved: "Pago",
      pending: "Pendente",
      processing: "Processando",
      canceled: "Cancelado",
    };
    if (status === 1) return "Pago";
    return map[status] || "Pendente";
  };

  const getStatusColor = (status: any) => {
    if (status === 1 || status === "paid" || status === "approved")
      return "bg-green-100 text-green-800";
    if (status === "canceled") return "bg-red-100 text-red-800";
    return "bg-amber-100 text-amber-800";
  };

  return (
    <Template
      header={{
        template: "admin",
        position: "solid",
      }}
      footer={{
        template: "clean",
      }}
    >
      <section>
        <div className="container-medium pt-8 pb-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-title font-bold text-3xl text-zinc-900">
                Olá, {user.name || "Admin"}
              </h1>
              <p className="text-zinc-500 mt-1">
                Aqui está o resumo da sua plataforma
              </p>
            </div>
            <Button
              href={`${process.env.APP_URL}/logout`}
              style="btn-light"
              className="py-2 px-4 text-sm"
            >
              Sair da conta
            </Button>
          </div>
        </div>
      </section>

      <section>
        <div className="container-medium py-4">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-400"></div>
              <span className="ml-3 text-zinc-500">Carregando dados...</span>
            </div>
          ) : stats ? (
            <div className="grid gap-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  title="Pedidos"
                  value={stats.orders.total}
                  subtitle={`${stats.orders.month} este mês (${getVariation(stats.orders.month, stats.orders.last_month)} vs anterior)`}
                  icon="fa-shopping-bag"
                  href="/admin/pedidos"
                  color="blue"
                />
                <StatCard
                  title="Faturamento"
                  value={`R$ ${moneyFormat(stats.revenue.total)}`}
                  subtitle={`R$ ${moneyFormat(stats.revenue.month)} este mês`}
                  icon="fa-dollar-sign"
                  href="/admin/pedidos"
                  color="green"
                />
                <StatCard
                  title="Clientes"
                  value={stats.users.total}
                  subtitle={`${stats.users.new_month} novos este mês`}
                  icon="fa-users"
                  href="/admin/usuarios"
                  color="purple"
                />
                <StatCard
                  title="Parceiros"
                  value={stats.partners.total}
                  subtitle={`${stats.partners.active} ativos`}
                  icon="fa-store"
                  href="/admin/parceiros"
                  color="amber"
                />
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard
                  title="Produtos"
                  value={stats.products.total}
                  subtitle={`${stats.products.active} ativos`}
                  icon="fa-box"
                  color="zinc"
                />
                <StatCard
                  title="Saques pendentes"
                  value={stats.withdrawals.pending}
                  subtitle={
                    stats.withdrawals.pending > 0
                      ? `R$ ${moneyFormat(stats.withdrawals.pending_value)} em análise`
                      : "Nenhum saque pendente"
                  }
                  icon="fa-money-bill-wave"
                  href="/admin/saques"
                  color={stats.withdrawals.pending > 0 ? "red" : "zinc"}
                />
                <StatCard
                  title="Pedidos pendentes"
                  value={stats.orders.pending}
                  subtitle="Aguardando processamento"
                  icon="fa-clock"
                  href="/admin/pedidos"
                  color={stats.orders.pending > 0 ? "amber" : "zinc"}
                />
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <div className="bg-white border rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b flex items-center justify-between">
                      <h3 className="font-semibold text-zinc-900">
                        Pedidos recentes
                      </h3>
                      <Link
                        href="/admin/pedidos"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Ver todos
                      </Link>
                    </div>
                    {stats.recent_orders.length > 0 ? (
                      <div>
                        {stats.recent_orders.map((order) => (
                          <Link
                            key={order.id}
                            href={`/admin/pedidos/${order.id}`}
                            className="flex items-center gap-4 px-5 py-3 border-b last:border-0 hover:bg-zinc-50 transition-colors"
                          >
                            <div className="w-full">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-zinc-900">
                                  #{order.id}
                                </span>
                                <span className="text-zinc-400">-</span>
                                <span className="text-sm text-zinc-600">
                                  {order.customer_name}
                                </span>
                              </div>
                              <span className="text-xs text-zinc-400">
                                {new Date(order.created_at).toLocaleDateString(
                                  "pt-BR"
                                )}
                              </span>
                            </div>
                            <div className="text-right whitespace-nowrap">
                              <div className="font-medium text-zinc-900">
                                R$ {moneyFormat(order.total)}
                              </div>
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}
                              >
                                {getStatusLabel(order.status)}
                              </span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-zinc-400">
                        Nenhum pedido recente
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <div className="bg-white border rounded-xl overflow-hidden">
                    <div className="px-5 py-4 border-b">
                      <h3 className="font-semibold text-zinc-900">
                        Acesso rápido
                      </h3>
                    </div>
                    <div className="p-3 grid gap-2">
                      <QuickLink
                        title="Pedidos"
                        icon="fa-shopping-bag"
                        href="/admin/pedidos"
                      />
                      <QuickLink
                        title="Parceiros"
                        icon="fa-handshake"
                        href="/admin/parceiros"
                      />
                      <QuickLink
                        title="Saques"
                        icon="fa-money-bill-wave"
                        href="/admin/saques"
                      />
                      <QuickLink
                        title="Carrinhos abandonados"
                        icon="fa-cart-arrow-down"
                        href="/admin/carrinhos-abandonados"
                      />
                      <QuickLink
                        title="Recomendações"
                        icon="fa-chart-line"
                        href="/admin/recomendacoes"
                      />
                      <QuickLink
                        title="Conteúdo"
                        icon="fa-file-alt"
                        href="/admin/conteudo"
                      />
                      <QuickLink
                        title="Filtros"
                        icon="fa-filter"
                        href="/admin/filtro"
                      />
                      <QuickLink
                        title="Configurações"
                        icon="fa-cog"
                        href="/admin/configuracoes"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-zinc-500">
              Não foi possível carregar os dados do dashboard.
              <br />
              <button
                onClick={fetchStats}
                className="mt-4 text-blue-600 hover:underline"
              >
                Tentar novamente
              </button>
            </div>
          )}
        </div>
      </section>
    </Template>
  );
}
