import { useState } from "react";
import Template from "@/src/template";
import { useAbandonedCarts } from "@/src/hooks/useAbandonedCarts";
import AbandonedCartsTable from "@/src/components/admin/abandoned-carts/AbandonedCartsTable";
import { moneyFormat } from "@/src/helper";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export default function CarrinhosAbandonados() {
  const [status, setStatus] = useState("all");
  const [hours, setHours] = useState(10);

  const { carts, stats, loading, error, refresh, sendEmail, getCartDetail } =
    useAbandonedCarts(status, hours);

  return (
    <Template header={{ template: "admin", position: "solid" }}>
      <section>
        <div className="container-medium pt-8">
          <Breadcrumbs
            links={[
              { url: "/admin", name: "Admin" },
              {
                url: "/admin/carrinhos-abandonados",
                name: "Carrinhos Abandonados",
              },
            ]}
          />
        </div>
      </section>

      <section>
        <div className="container-medium py-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="font-title font-bold text-3xl text-zinc-900">
              Carrinhos Abandonados
            </h1>
            <button
              onClick={refresh}
              className="flex items-center gap-2 px-4 py-2.5 text-sm bg-white border rounded-xl hover:bg-zinc-50 transition-colors text-zinc-700"
            >
              <Icon icon="fa-sync" type="far" className="text-xs" />
              Atualizar
            </button>
          </div>

          {stats && (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white border rounded-xl p-4">
                <p className="text-sm text-zinc-500">Total</p>
                <p className="text-2xl font-bold text-zinc-900">
                  {stats.total}
                </p>
              </div>
              <div className="bg-white border rounded-xl p-4">
                <p className="text-sm text-zinc-500">Pendentes</p>
                <p className="text-2xl font-bold text-amber-600">
                  {stats.pending}
                </p>
              </div>
              <div className="bg-white border rounded-xl p-4">
                <p className="text-sm text-zinc-500">Notificados</p>
                <p className="text-2xl font-bold text-green-600">
                  {stats.notified}
                </p>
              </div>
              <div className="bg-white border rounded-xl p-4">
                <p className="text-sm text-zinc-500">Valor Total</p>
                <p className="text-2xl font-bold text-zinc-900">
                  R$ {moneyFormat(stats.total_value)}
                </p>
              </div>
            </div>
          )}

          <div className="bg-white border rounded-xl p-4 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="px-3 py-2 border rounded-lg text-sm outline-none"
                >
                  <option value="all">Todos</option>
                  <option value="pending">Pendentes</option>
                  <option value="notified">Notificados</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">
                  Abandonado há
                </label>
                <select
                  value={hours}
                  onChange={(e) => setHours(Number(e.target.value))}
                  className="px-3 py-2 border rounded-lg text-sm outline-none"
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
          </div>

          {loading && (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-400"></div>
              <span className="ml-3 text-zinc-500">Carregando...</span>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600">
              {error}
            </div>
          )}
          {!loading && !error && (
            <div className="bg-white border rounded-xl overflow-hidden">
              <AbandonedCartsTable
                carts={carts}
                onSendEmail={sendEmail}
                getCartDetail={getCartDetail}
              />
            </div>
          )}
        </div>
      </section>
    </Template>
  );
}
