import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import { PainelLayout } from "@/src/components/painel";
import { FileText, Download, CheckCircle, AlertTriangle, Clock, Info, Building2, Send } from "lucide-react";
import { getStore } from "@/src/contexts/AuthContext";

type Invoice = {
  id: string;
  integrationId: string;
  status: string;
  numero: number;
  amount: number;
  description: string;
  issuedOn: string;
  receiver: { name: string; federalTaxNumber: string };
};

const statusMap: Record<string, { label: string; cls: string }> = {
  authorized: { label: "Autorizada", cls: "bg-green-50 text-green-700 border-green-200" },
  enqueued: { label: "Processando", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  rejected: { label: "Rejeitada", cls: "bg-red-50 text-red-700 border-red-200" },
  cancelled: { label: "Cancelada", cls: "bg-zinc-50 text-zinc-500 border-zinc-200" },
};

export default function FiscalPage() {
  const [tab, setTab] = useState<"fiestou" | "emissao">("fiestou");
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      const storeId = getStore();
      const res = await fetch(`/api/fiscal/store-invoices?storeId=${storeId || ""}`);
      const data = await res.json();
      if (data.success) setInvoices(data.invoices || []);
    } catch (err) {
      console.error("Erro ao carregar notas:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadInvoices(); }, [loadInvoices]);

  const stats = {
    total: invoices.length,
    autorizadas: invoices.filter(n => n.status === "authorized").length,
    processando: invoices.filter(n => n.status === "enqueued").length,
    rejeitadas: invoices.filter(n => n.status === "rejected").length,
  };

  return (
    <PainelLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-title text-2xl sm:text-3xl font-bold text-zinc-900">Notas Fiscais</h1>
          <p className="text-sm text-zinc-500 mt-1">Gerencie as notas fiscais da sua loja</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-100 rounded-xl p-1">
          <button
            onClick={() => setTab("fiestou")}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
              tab === "fiestou" ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <Building2 size={16} /> Notas da Fiestou
          </button>
          <button
            onClick={() => router.push("/painel/fiscal/emissao")}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-all"
          >
            <Send size={16} /> Minha Emissao
          </button>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              A Fiestou emite nota fiscal de intermediacao (comissao) para cada pedido pago no marketplace.
              Essas notas aparecem aqui automaticamente.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { icon: FileText, label: "Total", value: stats.total, color: "text-zinc-400" },
            { icon: CheckCircle, label: "Autorizadas", value: stats.autorizadas, color: "text-green-500", valueColor: "text-green-600" },
            { icon: Clock, label: "Processando", value: stats.processando, color: "text-yellow-500", valueColor: "text-yellow-600" },
            { icon: AlertTriangle, label: "Rejeitadas", value: stats.rejeitadas, color: "text-red-500", valueColor: "text-red-600" },
          ].map(({ icon: Icon, label, value, color, valueColor }) => (
            <div key={label} className="bg-white border border-zinc-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon size={14} className={color} />
                <span className="text-xs text-zinc-400 font-medium">{label}</span>
              </div>
              <p className={`text-2xl font-bold ${valueColor || "text-zinc-900"}`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-zinc-300 border-t-zinc-600 rounded-full mx-auto mb-3" />
            <p className="text-sm text-zinc-500">Carregando notas fiscais...</p>
          </div>
        )}

        {/* Empty */}
        {!loading && invoices.length === 0 && (
          <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center">
            <FileText size={48} className="mx-auto text-zinc-200 mb-3" />
            <h3 className="text-lg font-semibold text-zinc-700 mb-1">Nenhuma nota fiscal emitida</h3>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto">
              As notas fiscais de comissao aparecerao aqui conforme pedidos forem pagos.
            </p>
          </div>
        )}

        {/* Table */}
        {!loading && invoices.length > 0 && (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">No</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Tomador</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Valor</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Data</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {invoices.map(nota => {
                    const badge = statusMap[nota.status] || statusMap["enqueued"];
                    return (
                      <tr key={nota.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                        <td className="px-4 py-3 font-medium text-zinc-900">{nota.numero || "-"}</td>
                        <td className="px-4 py-3 text-zinc-700">{nota.receiver?.name || "-"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-700">
                          {nota.amount ? `R$ ${nota.amount.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "-"}
                        </td>
                        <td className="px-4 py-3 text-zinc-500">
                          {nota.issuedOn ? new Date(nota.issuedOn).toLocaleDateString("pt-BR") : "-"}
                        </td>
                        <td className="px-4 py-3">
                          {nota.status === "authorized" && (
                            <button
                              onClick={() => window.open(`/api/fiscal/download?nfeId=${nota.id}&format=pdf`, "_blank")}
                              className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded transition-colors"
                              title="Download PDF"
                            >
                              <Download size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PainelLayout>
  );
}