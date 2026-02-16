import Link from "next/link";
import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";
import { getExtenseData, moneyFormat } from "@/src/helper";
import { useEffect, useState } from "react";
import { ArrowLeft, User, MapPin, ShoppingBag, Mail, Phone, CreditCard } from "lucide-react";
import { PainelLayout, Badge, EmptyState } from "@/src/components/painel";

export async function getServerSideProps(ctx: any) {
  const { id } = ctx.query;
  const store = ctx.req.cookies["fiestou.store"] ?? 0;
  return { props: { id, store } };
}

export default function Cliente({ id, store }: { id: number; store: number }) {
  const api = new Api();
  const [user, setUser] = useState({} as UserType);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userReq, ordersReq]: any[] = await Promise.all([
          api.bridge({ method: "post", url: "stores/customers", data: { id, store } }),
          api.bridge({ method: "post", url: "orders/customer-list", data: { customer: id, store } }),
        ]);
        if (userReq?.data) setUser(userReq.data);
        if (ordersReq?.data) setOrders(ordersReq.data);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  return (
    <PainelLayout>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/painel/clientes"
          className="p-2 rounded-lg hover:bg-zinc-100 transition-colors text-zinc-600"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-zinc-900">{user.name || "Cliente"}</h1>
          {user?.created_at && (
            <p className="text-sm text-zinc-500">
              Primeira interacao em {getExtenseData(user.created_at)}
            </p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShoppingBag size={18} className="text-zinc-400" />
              <h2 className="text-lg font-semibold text-zinc-900">Compras</h2>
              {orders.length > 0 && (
                <Badge variant="neutral">{orders.length}</Badge>
              )}
            </div>

            {!loading && orders.length === 0 ? (
              <EmptyState
                icon={<ShoppingBag size={28} />}
                title="Nenhuma compra"
                description="Este cliente ainda não realizou compras"
              />
            ) : (
              <div className="space-y-3">
                {orders.map((order: any, key: any) => (
                  <Link
                    href={`/painel/pedidos/${order.id}`}
                    key={key}
                    className="block p-4 rounded-lg border border-zinc-100 hover:border-zinc-300 hover:bg-zinc-50 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold text-zinc-900">#{order.id}</span>
                      <span className="font-semibold text-zinc-900">
                        R$ {moneyFormat(order.total)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">
                        {getExtenseData(order.created_at)}
                      </span>
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

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-zinc-200 p-5">
            <div className="flex items-center gap-2 mb-3">
              <User size={16} className="text-zinc-400" />
              <h3 className="font-semibold text-zinc-900">Dados do cliente</h3>
            </div>
            <div className="space-y-2.5 text-sm">
              {user.name && (
                <div className="flex items-center gap-2 text-zinc-600">
                  <User size={14} className="text-zinc-300" />
                  {user.name}
                </div>
              )}
              {user.email && (
                <div className="flex items-center gap-2 text-zinc-600">
                  <Mail size={14} className="text-zinc-300" />
                  {user.email}
                </div>
              )}
              {user.phone && (
                <div className="flex items-center gap-2 text-zinc-600">
                  <Phone size={14} className="text-zinc-300" />
                  {user.phone}
                </div>
              )}
              {user.cpf && (
                <div className="flex items-center gap-2 text-zinc-600">
                  <CreditCard size={14} className="text-zinc-300" />
                  {user.cpf}
                </div>
              )}
            </div>
          </div>

          {Array.isArray((user as any)?.address) && (user as any).address.length > 0 && (
            <div className="bg-white rounded-xl border border-zinc-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <MapPin size={16} className="text-zinc-400" />
                <h3 className="font-semibold text-zinc-900">Endereço</h3>
              </div>
              {(user as any).address.map((item: any, key: any) => (
                <div key={key} className="text-sm text-zinc-600 space-y-0.5">
                  <div>
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
