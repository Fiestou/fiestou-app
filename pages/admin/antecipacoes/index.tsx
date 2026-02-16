import { useEffect, useMemo, useState } from "react";
import Template from "@/src/template";
import Api from "@/src/services/api";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Modal from "@/src/components/utils/Modal";
import { moneyFormat } from "@/src/helper";
import { AlertCircle, Ban, RefreshCw, Search } from "lucide-react";
import { toast } from "react-toastify";

function centsToMoney(cents: number) {
  return `R$ ${moneyFormat((Number(cents) || 0) / 100)}`;
}

function statusBadge(statusRaw: any) {
  const status = String(statusRaw || "").toLowerCase();
  if (["approved", "paid", "completed"].includes(status)) {
    return { label: "Aprovada", className: "bg-green-100 text-green-700" };
  }
  if (["canceled", "cancelled", "denied", "failed"].includes(status)) {
    return { label: "Cancelada", className: "bg-red-100 text-red-700" };
  }
  if (["processing"].includes(status)) {
    return { label: "Processando", className: "bg-amber-100 text-amber-700" };
  }
  return { label: status ? status : "Pendente", className: "bg-blue-100 text-blue-700" };
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("pt-BR");
}

export default function AdminAnticipacoes() {
  const api = new Api();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [rows, setRows] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    total: 0,
    pending: 0,
    approved: 0,
    canceled: 0,
    requested_amount: 0,
  });
  const [errors, setErrors] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [confirm, setConfirm] = useState({
    open: false,
    recipientCode: "",
    anticipationId: "",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const request: any = await api.bridge({
        method: "get",
        url: "admin/anticipations",
        data: {
          status: statusFilter || undefined,
          search: search || undefined,
          size: 50,
        },
      });

      if (request?.response && request?.data) {
        setRows(Array.isArray(request.data.items) ? request.data.items : []);
        setSummary(request.data.summary || {});
        setErrors(Array.isArray(request.data.errors) ? request.data.errors : []);
      } else {
        toast.error(request?.message || "Falha ao carregar antecipações");
        setRows([]);
        setSummary({});
        setErrors([]);
      }
    } catch {
      toast.error("Erro ao carregar antecipações");
      setRows([]);
      setSummary({});
      setErrors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

  const filteredRows = useMemo(() => {
    if (!search.trim()) return rows;
    const s = search.toLowerCase();
    return rows.filter((row) =>
      [
        row?.id,
        row?.store_name,
        row?.partner_name,
        row?.partner_email,
        row?.recipient_code,
        row?.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [rows, search]);

  const cancelAnticipation = async () => {
    if (!confirm.recipientCode || !confirm.anticipationId) return;
    setSaving(true);
    try {
      const request: any = await api.bridge({
        method: "post",
        url: "admin/anticipations/cancel",
        data: {
          recipient_code: confirm.recipientCode,
          anticipation_id: confirm.anticipationId,
        },
      });

      if (request?.response) {
        toast.success("Antecipação cancelada com sucesso");
        setConfirm({ open: false, recipientCode: "", anticipationId: "" });
        fetchData();
      } else {
        toast.error(request?.message || "Não foi possível cancelar antecipação");
      }
    } catch {
      toast.error("Erro ao cancelar antecipação");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Template
      header={{ template: "admin", position: "solid" }}
      footer={{ template: "clean" }}
    >
      <Modal
        status={confirm.open}
        title="Cancelar antecipação"
        close={() => !saving && setConfirm({ open: false, recipientCode: "", anticipationId: "" })}
        size="xs"
      >
        <div className="space-y-4">
          <p className="text-sm text-zinc-600">
            Confirma o cancelamento da antecipação <strong>{confirm.anticipationId}</strong>?
          </p>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConfirm({ open: false, recipientCode: "", anticipationId: "" })}
              disabled={saving}
              className="px-3 py-2 text-sm border border-zinc-300 rounded-lg text-zinc-700 hover:bg-zinc-50 disabled:opacity-50"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={cancelAnticipation}
              disabled={saving}
              className="px-3 py-2 text-sm bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg disabled:opacity-50"
            >
              {saving ? "Cancelando..." : "Confirmar cancelamento"}
            </button>
          </div>
        </div>
      </Modal>

      <section>
        <div className="container-medium pt-8">
          <Breadcrumbs
            links={[
              { url: "/admin", name: "Admin" },
              { url: "/admin/antecipacoes", name: "Antecipações de Lojistas" },
            ]}
          />
        </div>
      </section>

      <section>
        <div className="container-medium py-6">
          <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
            <h1 className="font-title font-bold text-3xl text-zinc-900">
              Antecipações de Lojistas
            </h1>
            <button
              type="button"
              onClick={fetchData}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50"
            >
              <RefreshCw size={14} />
              Atualizar
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Total</p>
              <p className="text-2xl font-bold text-zinc-900">{summary?.total || 0}</p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Pendentes</p>
              <p className="text-2xl font-bold text-blue-600">{summary?.pending || 0}</p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Aprovadas</p>
              <p className="text-2xl font-bold text-green-600">{summary?.approved || 0}</p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Canceladas</p>
              <p className="text-2xl font-bold text-red-600">{summary?.canceled || 0}</p>
            </div>
            <div className="bg-white border rounded-xl p-4">
              <p className="text-sm text-zinc-500">Valor solicitado</p>
              <p className="text-2xl font-bold text-zinc-900">
                {centsToMoney(Number(summary?.requested_amount || 0))}
              </p>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por loja, parceiro, status..."
                className="w-full border border-zinc-200 bg-white rounded-lg pl-9 pr-3 py-2 text-sm"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-zinc-200 bg-white rounded-lg px-3 py-2 text-sm min-w-[220px]"
            >
              <option value="">Todos os status</option>
              <option value="pending">Pendentes</option>
              <option value="processing">Processando</option>
              <option value="approved">Aprovadas</option>
              <option value="canceled">Canceladas</option>
            </select>
          </div>

          {errors.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="text-amber-700 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-amber-800">
                    Alguns recebedores retornaram erro na consulta
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    {errors.slice(0, 3).map((err) => `${err.recipient_code}: ${err.message}`).join(" | ")}
                  </p>
                </div>
              </div>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-400"></div>
              <span className="ml-3 text-zinc-500">Carregando...</span>
            </div>
          ) : (
            <div className="bg-white border rounded-xl overflow-hidden">
              <div className="grid grid-cols-[8rem_1fr_1fr_7rem_7rem_7rem_8rem_6rem] gap-3 px-5 py-3 bg-zinc-50 border-b text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                <div>ID</div>
                <div>Loja</div>
                <div>Parceiro</div>
                <div>Solicitada</div>
                <div>Pagamento</div>
                <div>Valor</div>
                <div className="text-center">Status</div>
                <div className="text-center">Ação</div>
              </div>
              {filteredRows.length > 0 ? (
                filteredRows.map((row, key) => {
                  const status = statusBadge(row.status);
                  const canCancel = ["pending", "processing", "requested"].includes(
                    String(row?.status || "").toLowerCase()
                  );
                  return (
                    <div
                      key={`${row.id}-${key}`}
                      className="grid grid-cols-[8rem_1fr_1fr_7rem_7rem_7rem_8rem_6rem] gap-3 px-5 py-4 border-b last:border-0 hover:bg-zinc-50 transition-colors items-center text-sm"
                    >
                      <div className="font-mono text-xs text-zinc-700 truncate">
                        {row.id || "-"}
                      </div>
                      <div className="font-medium text-zinc-900 truncate">{row.store_name || "-"}</div>
                      <div className="text-zinc-700 truncate">
                        <div className="font-medium">{row.partner_name || "-"}</div>
                        <div className="text-xs text-zinc-500">{row.partner_email || "-"}</div>
                      </div>
                      <div className="text-zinc-600">{formatDate(row.created_at)}</div>
                      <div className="text-zinc-600">{formatDate(row.payment_date)}</div>
                      <div className="font-semibold text-zinc-900">
                        {centsToMoney(Number(row.requested_amount || 0))}
                      </div>
                      <div className="text-center">
                        <span className={`inline-block text-xs px-3 py-1 rounded-full font-medium ${status.className}`}>
                          {status.label}
                        </span>
                      </div>
                      <div className="flex justify-center">
                        {canCancel ? (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirm({
                                open: true,
                                recipientCode: row.recipient_code,
                                anticipationId: row.id,
                              })
                            }
                            className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 flex items-center justify-center transition-colors"
                            title="Cancelar antecipação"
                          >
                            <Ban size={14} />
                          </button>
                        ) : (
                          <span className="text-xs text-zinc-300">-</span>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-zinc-400">
                  Nenhuma antecipação encontrada
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </Template>
  );
}

