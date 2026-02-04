import { useState } from "react";
import Template from "@/src/template";
import { useAbandonedCarts } from "@/src/hooks/useAbandonedCarts";
import AbandonedCartsTable from "@/src/components/admin/abandoned-carts/AbandonedCartsTable";
import { moneyFormat } from "@/src/helper";

export default function CarrinhosAbandonados() {
  const [status, setStatus] = useState("all");
  const [hours, setHours] = useState(10);

  const { carts, stats, loading, error, refresh, sendEmail, getCartDetail } = useAbandonedCarts(
    status,
    hours
  );

  return (
    <Template header={{ template: "admin", position: "solid" }}>
      <section>
        <div className="container-medium pt-12 flex justify-between items-center">
          <span>Admin &gt; Carrinhos Abandonados</span>
          <button
            onClick={refresh}
            className="px-4 py-2 text-sm bg-zinc-100 hover:bg-zinc-200 rounded-lg"
          >
            Atualizar
          </button>
        </div>
      </section>

      {stats && (
        <section className="container-medium pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm text-zinc-500">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm text-zinc-500">Pendentes</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pending}</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm text-zinc-500">Notificados</p>
              <p className="text-2xl font-bold text-green-600">{stats.notified}</p>
            </div>
            <div className="bg-white border rounded-lg p-4">
              <p className="text-sm text-zinc-500">Valor Total</p>
              <p className="text-2xl font-bold">R$ {moneyFormat(stats.total_value)}</p>
            </div>
          </div>
        </section>
      )}

      <section className="container-medium pt-6">
        <div className="bg-white border rounded-lg p-4 flex flex-wrap gap-4 items-center">
          <div>
            <label className="block text-sm text-zinc-500 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg"
            >
              <option value="all">Todos</option>
              <option value="pending">Pendentes</option>
              <option value="notified">Notificados</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-500 mb-1">
              Abandonado há (horas)
            </label>
            <select
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="px-3 py-2 border rounded-lg"
            >
              <option value={1}>1 hora</option>
              <option value={2}>2 horas</option>
              <option value={6}>6 horas</option>
              <option value={10}>10 horas</option>
              <option value={24}>24 horas</option>
              <option value={48}>48 horas</option>
              <option value={72}>72 horas</option>
            </select>
          </div>
        </div>
      </section>

      <section className="container-medium pt-6 pb-12">
        {loading && <div className="text-center py-8">Carregando...</div>}
        {error && <div className="text-red-500 text-center py-8">{error}</div>}
        {!loading && !error && (
          <div className="bg-white border rounded-lg overflow-hidden">
            <AbandonedCartsTable carts={carts} onSendEmail={sendEmail} getCartDetail={getCartDetail} />
          </div>
        )}
      </section>
    </Template>
  );
}
