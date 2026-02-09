import { UserType } from "@/src/models/user";
import Api from "@/src/services/api";
import { moneyFormat } from "@/src/helper";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Button } from "../ui/form";
import Link from "next/link";

export default function UserEditAdmin({
  user,
  redirect,
}: {
  user: UserType;
  redirect?: string;
}) {
  const api = new Api();
  const router = useRouter();

  const [data, setData] = useState({} as UserType);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  useEffect(() => {
    setData(user);
  }, [user]);

  const submitUser = async (e: any) => {
    e.preventDefault();
    setLoading(true);

    const request: any = await api.bridge({
      method: "post",
      url: "users/validate",
      data: { ...user, ...data },
    });

    if (request.response) {
      router.push({ pathname: redirect ?? "/admin/usuarios" });
    }

    setLoading(false);
  };

  const saveField = async (field: string, value: string) => {
    setLoading(true);

    const updateData: any = { id: user.id, [field]: value };

    const request: any = await api.bridge({
      method: "post",
      url: "users/update",
      data: updateData,
    });

    if (request.response || request.data) {
      setData((prev) => ({ ...prev, [field]: value }));
    }

    setEditing(null);
    setLoading(false);
  };

  const sendPasswordReset = async () => {
    if (!user.email) return;
    setResetLoading(true);

    await api.bridge({
      method: "post",
      url: "auth/recovery",
      data: { email: user.email, recaptcha_token: "admin_bypass" },
    });

    setResetSent(true);
    setResetLoading(false);
    setTimeout(() => setResetSent(false), 5000);
  };

  const loadOrders = async () => {
    if (ordersLoaded) return;
    setOrdersLoading(true);

    const request: any = await api.bridge({
      method: "post",
      url: "orders/customer-list",
      data: { customer: user.id },
    });

    if (request.data) {
      setOrders(Array.isArray(request.data) ? request.data : []);
    }

    setOrdersLoaded(true);
    setOrdersLoading(false);
  };

  const startEdit = (field: string, currentValue: string) => {
    setEditing(field);
    setEditValue(currentValue || "");
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditValue("");
  };

  const formatPhone = (phone: string) => {
    if (!phone) return "";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 11)
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 3)} ${cleaned.slice(3, 7)}-${cleaned.slice(7)}`;
    if (cleaned.length === 10)
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`;
    return phone;
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const editableFields = [
    { label: "Nome", key: "name", type: "text" },
    { label: "E-mail", key: "email", type: "email" },
    { label: "Telefone", key: "phone", type: "tel" },
  ];

  const readonlyFields = [
    { label: "Tipo", key: "type", format: (v: string) => v === "partner" ? "Parceiro" : v === "master" ? "Administrador" : "Usuário" },
    { label: "CPF/CNPJ", key: "cpf" },
    { label: "Criado em", key: "created_at", format: formatDate },
  ];

  const displayValue = (key: string) => {
    return (data as any)?.[key] || (user as any)?.[key] || "";
  };

  return (
    <div className="grid lg:grid-cols-[1fr_20rem] gap-6">
      <div className="grid gap-6">
        <div className="bg-white border rounded-xl p-6">
          <h3 className="text-lg font-semibold text-zinc-900 mb-4">
            Informações
          </h3>
          <div className="grid gap-0 text-sm">
            {editableFields.map((field, idx) => {
              const val = displayValue(field.key);
              if (!val && editing !== field.key) return null;
              const isEditing = editing === field.key;
              const displayVal = field.key === "phone" ? formatPhone(val) : val;

              return (
                <div
                  key={field.key}
                  className={`grid grid-cols-[10rem_1fr_auto] items-center py-2.5 px-3 ${
                    idx % 2 === 0 ? "bg-zinc-50 rounded" : ""
                  }`}
                >
                  <span className="text-zinc-500">{field.label}</span>
                  {isEditing ? (
                    <div className="flex gap-2">
                      <input
                        type={field.type}
                        value={editValue}
                        onChange={(e) => setEditValue(e.target.value)}
                        className="flex-1 px-2 py-1 border rounded text-sm outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === "Enter") saveField(field.key, editValue);
                          if (e.key === "Escape") cancelEdit();
                        }}
                      />
                      <button
                        onClick={() => saveField(field.key, editValue)}
                        className="text-xs px-2 py-1 bg-green-50 text-green-600 rounded hover:bg-green-100"
                        disabled={loading}
                      >
                        Salvar
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="text-xs px-2 py-1 text-zinc-400 hover:text-zinc-600"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <>
                      <span className="text-zinc-900 break-all">{String(displayVal)}</span>
                      <button
                        onClick={() => startEdit(field.key, val)}
                        className="text-xs text-zinc-400 hover:text-zinc-600 ml-2"
                      >
                        Editar
                      </button>
                    </>
                  )}
                </div>
              );
            })}

            {readonlyFields.map((field, idx) => {
              const val = displayValue(field.key);
              if (!val) return null;
              const formatted = field.format ? field.format(val) : val;
              const rowIdx = editableFields.length + idx;

              return (
                <div
                  key={field.key}
                  className={`grid grid-cols-[10rem_1fr] py-2.5 px-3 ${
                    rowIdx % 2 === 0 ? "bg-zinc-50 rounded" : ""
                  }`}
                >
                  <span className="text-zinc-500">{field.label}</span>
                  <span className="text-zinc-900 break-all">{String(formatted)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-zinc-900">
              Pedidos
            </h3>
            {!ordersLoaded && (
              <button
                onClick={loadOrders}
                disabled={ordersLoading}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                {ordersLoading ? "Carregando..." : "Carregar pedidos"}
              </button>
            )}
          </div>

          {ordersLoading ? (
            <div className="flex items-center py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-zinc-400"></div>
              <span className="ml-2 text-sm text-zinc-500">Carregando...</span>
            </div>
          ) : ordersLoaded && orders.length > 0 ? (
            <div className="grid gap-0 text-sm">
              <div className="grid grid-cols-[4rem_1fr_6rem_6rem] py-2 px-3 text-xs text-zinc-400 uppercase font-medium">
                <span>ID</span>
                <span>Data</span>
                <span>Total</span>
                <span>Status</span>
              </div>
              {orders.slice(0, 10).map((order: any, idx: number) => (
                <Link
                  key={order.id || idx}
                  href={`/admin/pedidos/${order.id || order.groupHash || order.group_hash}`}
                  className={`grid grid-cols-[4rem_1fr_6rem_6rem] py-2.5 px-3 hover:bg-blue-50 rounded transition-colors ${
                    idx % 2 === 0 ? "bg-zinc-50" : ""
                  }`}
                >
                  <span className="text-zinc-900 font-medium">#{order.id}</span>
                  <span className="text-zinc-600">{formatDate(order.created_at)}</span>
                  <span className="text-zinc-900">R$ {moneyFormat(order.total || 0)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full text-center ${
                    order.status === 1 || order.status === "paid"
                      ? "bg-green-50 text-green-700"
                      : "bg-amber-50 text-amber-700"
                  }`}>
                    {order.status === 1 || order.status === "paid" ? "Pago" : "Pendente"}
                  </span>
                </Link>
              ))}
              {orders.length > 10 && (
                <p className="text-xs text-zinc-400 px-3 pt-2">
                  Mostrando 10 de {orders.length} pedidos
                </p>
              )}
            </div>
          ) : ordersLoaded ? (
            <p className="text-sm text-zinc-400 py-4">Nenhum pedido encontrado</p>
          ) : (
            <p className="text-sm text-zinc-400 py-4">
              Clique em "Carregar pedidos" para ver o histórico
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="bg-white border rounded-xl p-6 sticky top-24 grid gap-4">
          <form onSubmit={submitUser}>
            <div className="mb-4">
              <label className="block text-sm text-zinc-500 mb-1">Status</label>
              <select
                name="status"
                value={data.status}
                onChange={(e: any) =>
                  setData({ ...data, status: parseInt(e.target.value) })
                }
                className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none"
              >
                <option value={1}>Ativo</option>
                <option value={0}>Bloqueado</option>
              </select>
            </div>
            <Button loading={loading} className="w-full py-3">
              Salvar Status
            </Button>
          </form>

          <div className="border-t pt-4">
            <p className="text-sm text-zinc-500 mb-2">Senha</p>
            {resetSent ? (
              <p className="text-sm text-green-600 py-2.5 text-center">
                E-mail de recuperação enviado
              </p>
            ) : (
              <button
                onClick={sendPasswordReset}
                disabled={resetLoading || !user.email}
                className="w-full py-2.5 text-sm border border-zinc-200 rounded-lg hover:bg-zinc-50 text-zinc-700 transition-colors disabled:opacity-50"
              >
                {resetLoading ? "Enviando..." : "Enviar reset de senha"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
