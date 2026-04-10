import Link from "next/link";
import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";
import { getExtenseData, moneyFormat } from "@/src/helper";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  User,
  MapPin,
  ShoppingBag,
  Mail,
  Phone,
  CreditCard,
  CalendarClock,
} from "lucide-react";
import { PainelLayout, Badge, EmptyState } from "@/src/components/painel";
import usePainelPageMode from "@/src/components/painel/usePainelPageMode";

export async function getServerSideProps(ctx: any) {
  const { id } = ctx.query;
  const rawStore = ctx.req.cookies["fiestou.store"];
  const parsedStore = Number(rawStore);
  const store = Number.isInteger(parsedStore) && parsedStore > 0 ? parsedStore : 0;
  return { props: { id, store } };
}

export default function Cliente({ id, store }: { id: number; store: number }) {
  const api = useMemo(() => new Api(), []);
  const panelMode = usePainelPageMode();
  const [user, setUser] = useState({} as UserType);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      if (!store) {
        setLoading(false);
        return;
      }

      try {
        const [userReq, ordersReq]: any[] = await Promise.all([
          api.bridge({ method: "post", url: "stores/customers", data: { id, store } }),
          api.bridge({ method: "post", url: "orders/customer-list", data: { customer: id, store } }),
        ]);
        if (userReq?.response && userReq?.data) {
          setUser(userReq.data);
          setLoadError("");
        } else {
          setUser({} as UserType);
          setLoadError("Não foi possível carregar os dados completos deste cliente agora.");
        }

        if (ordersReq?.response && ordersReq?.data) {
          setOrders(ordersReq.data);
        } else {
          setOrders([]);
        }
      } catch {
        setLoadError("Não foi possível carregar os dados completos deste cliente agora.");
      }
      setLoading(false);
    };
    fetchData();
  }, [api, id, store]);

  const totalSpent = orders.reduce(
    (sum: number, order: any) => sum + Number(order.total || 0),
    0,
  );
  const paidOrders = orders.filter(
    (order: any) => order?.metadata?.payment_status === "paid",
  ).length;

  return (
    <PainelLayout>
      <div className="mb-6 flex items-center gap-3">
        <Link
          href="/painel/clientes"
          className="p-2 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-600"
        >
          <ArrowLeft size={20} />
        </Link>
        <div className="min-w-0">
          <h1 className="break-words text-xl font-bold text-zinc-900 sm:text-2xl">
            {user.name || "Cliente"}
          </h1>
          {user?.created_at && (
            <p className="text-sm text-zinc-500">
              Primeira interação em {getExtenseData(user.created_at)}
            </p>
          )}
        </div>
      </div>

      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
        {panelMode !== "simple" && (
          <div className="flex items-start gap-3">
            <div className="rounded-xl bg-yellow-50 p-2.5 text-yellow-600">
              <User size={18} />
            </div>
            <div className="min-w-0">
              <h2 className="text-base font-semibold text-zinc-900">
                Visão rápida do cliente
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-zinc-600">
                Use esta tela para entender o histórico de compras e revisar os
                dados principais sem precisar abrir vários pedidos.
              </p>
            </div>
          </div>
        )}
        <div className={`${panelMode === "simple" ? "" : "mt-4"} grid gap-3 sm:grid-cols-3`}>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Compras
            </div>
            <div className="mt-1 text-lg font-bold text-zinc-900">
              {orders.length}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Pagas
            </div>
            <div className="mt-1 text-lg font-bold text-zinc-900">
              {paidOrders}
            </div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3">
            <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
              Total movimentado
            </div>
            <div className="mt-1 text-lg font-bold text-zinc-900">
              R$ {moneyFormat(totalSpent)}
            </div>
          </div>
        </div>
      </div>

      {!!loadError && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {loadError}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className={`space-y-4 ${panelMode === "simple" ? "order-2 lg:order-1" : ""}`}>
          <div className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag size={18} className="text-zinc-400" />
              <h2 className="text-lg font-semibold text-zinc-900">
                {panelMode === "simple" ? "Pedidos" : "Compras"}
              </h2>
              {orders.length > 0 && (
                <Badge variant="neutral">{orders.length}</Badge>
              )}
            </div>

            {!loading && orders.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag size={28} />}
                title="Nenhuma compra"
                description={
                  panelMode === "simple"
                    ? "Este cliente ainda não comprou"
                    : "Este cliente ainda não realizou compras"
                }
              />
            ) : (
              <div className="space-y-3">
                {orders.map((order: any, key: any) => (
                  <Link
                    href={`/painel/pedidos/${order.id}`}
                    key={key}
                    className="block rounded-xl border border-zinc-100 p-4 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <span className="font-semibold text-zinc-900">
                        Pedido #{order.id}
                      </span>
                      <span className="font-semibold text-zinc-900">
                        R$ {moneyFormat(order.total)}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-2 text-sm text-zinc-400">
                        <CalendarClock size={14} />
                        <span>{getExtenseData(order.created_at)}</span>
                      </div>
                      <div className="flex gap-2">
                        {order?.metadata?.payment_status === "paid" ? (
                          <Badge variant="success">Pago</Badge>
                        ) : (
                          <Badge variant="neutral">Processando</Badge>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className={`space-y-4 ${panelMode === "simple" ? "order-1 lg:order-2" : ""}`}>
          <div className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-5">
            <div className="flex items-center gap-2 mb-3">
              <User size={16} className="text-zinc-400" />
              <h3 className="font-semibold text-zinc-900">
                {panelMode === "simple" ? "Dados" : "Dados do cliente"}
              </h3>
            </div>
            <div className="grid gap-3 text-sm">
              {user.name && (
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 px-3 py-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    Nome
                  </div>
                  <div className="mt-1 flex min-w-0 items-start gap-2 text-zinc-700">
                    <User size={14} className="mt-0.5 shrink-0 text-zinc-300" />
                    <span className="break-words">{user.name}</span>
                  </div>
                </div>
              )}
              {user.email && (
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 px-3 py-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    E-mail
                  </div>
                  <div className="mt-1 flex min-w-0 items-start gap-2 text-zinc-700">
                    <Mail size={14} className="mt-0.5 shrink-0 text-zinc-300" />
                    <span className="break-all">{user.email}</span>
                  </div>
                </div>
              )}
              {user.phone && (
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 px-3 py-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    Telefone
                  </div>
                  <div className="mt-1 flex min-w-0 items-start gap-2 text-zinc-700">
                    <Phone size={14} className="mt-0.5 shrink-0 text-zinc-300" />
                    <span className="break-words">{user.phone}</span>
                  </div>
                </div>
              )}
              {user.cpf && (
                <div className="rounded-xl border border-zinc-100 bg-zinc-50/70 px-3 py-2.5">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    CPF
                  </div>
                  <div className="mt-1 flex min-w-0 items-start gap-2 text-zinc-700">
                    <CreditCard
                      size={14}
                      className="mt-0.5 shrink-0 text-zinc-300"
                    />
                    <span className="break-words">{user.cpf}</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {Array.isArray((user as any)?.address) && (user as any).address.length > 0 && (
            <div className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-zinc-400" />
                <h3 className="font-semibold text-zinc-900">
                  {panelMode === "simple" ? "Endereço" : "Endereço"}
                </h3>
              </div>
              {(user as any).address.map((item: any, key: any) => (
                <div
                  key={key}
                  className="space-y-1 rounded-xl border border-zinc-100 bg-zinc-50/70 px-3 py-3 break-words text-sm text-zinc-600"
                >
                  <div className="font-medium text-zinc-900">
                    {item?.street}, {item?.number}
                  </div>
                  <div>{item?.neighborhood}</div>
                  <div>CEP: {item?.zipCode}</div>
                  <div>
                    {item?.city} | {item?.state}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </PainelLayout>
  );
}
