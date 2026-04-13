// pages/painel/fiscal/index.tsx
// Página de notas fiscais do lojista — somente consulta

import { useState } from "react";
import { PainelLayout } from "@/src/components/painel";
import {
  FileText,
  Download,
  CheckCircle,
  AlertTriangle,
  Clock,
  Info,
} from "lucide-react";

type NfeListItem = {
  id: string;
  status: string;
  numero?: number;
  serie?: number;
  chave?: string;
  data_emissao?: string;
  valor_total?: number;
  referencia?: string;
};

const statusBadge: Record<string, { label: string; cls: string }> = {
  autorizada: { label: "Autorizada", cls: "bg-green-50 text-green-700 border-green-200" },
  processando: { label: "Processando", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  rejeitada: { label: "Rejeitada", cls: "bg-red-50 text-red-700 border-red-200" },
  cancelada: { label: "Cancelada", cls: "bg-zinc-50 text-zinc-500 border-zinc-200" },
};

export default function FiscalPage() {
  const [notas] = useState<NfeListItem[]>([]);
  const [loading] = useState(false);

  const stats = {
    total: notas.length,
    autorizadas: notas.filter((n) => n.status === "autorizada").length,
    processando: notas.filter((n) => n.status === "processando").length,
    rejeitadas: notas.filter((n) => n.status === "rejeitada").length,
  };

  return (
    <PainelLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-title text-2xl sm:text-3xl font-bold text-zinc-900">
            Notas Fiscais
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Acompanhe as notas fiscais dos seus pedidos
          </p>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <div className="flex gap-3">
            <Info size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              A Fiestou emite a nota fiscal automaticamente para cada pedido pago.
              Você não precisa fazer nada — as notas aparecem aqui assim que forem aprovadas.
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <FileText size={14} className="text-zinc-400" />
              <span className="text-xs text-zinc-400 font-medium">Total</span>
            </div>
            <p className="text-2xl font-bold text-zinc-900">{stats.total}</p>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={14} className="text-green-500" />
              <span className="text-xs text-zinc-400 font-medium">Autorizadas</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{stats.autorizadas}</p>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={14} className="text-yellow-500" />
              <span className="text-xs text-zinc-400 font-medium">Processando</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">{stats.processando}</p>
          </div>
          <div className="bg-white border border-zinc-200 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle size={14} className="text-red-500" />
              <span className="text-xs text-zinc-400 font-medium">Rejeitadas</span>
            </div>
            <p className="text-2xl font-bold text-red-600">{stats.rejeitadas}</p>
          </div>
        </div>

        {/* Lista vazia */}
        {notas.length === 0 && !loading && (
          <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center">
            <FileText size={48} className="mx-auto text-zinc-200 mb-3" />
            <h3 className="text-lg font-semibold text-zinc-700 mb-1">
              Nenhuma nota fiscal emitida
            </h3>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto">
              As notas fiscais dos seus pedidos aparecerão aqui conforme forem emitidas.
            </p>
          </div>
        )}

        {/* Tabela de notas */}
        {notas.length > 0 && (
          <div className="bg-white border border-zinc-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-100">
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Nº</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Status</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Valor</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Data</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-zinc-400">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {notas.map((nota) => {
                    const badge = statusBadge[nota.status] || statusBadge["processando"];
                    return (
                      <tr key={nota.id} className="border-b border-zinc-50 hover:bg-zinc-50/50">
                        <td className="px-4 py-3 font-medium text-zinc-900">{nota.numero || "-"}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-zinc-700">
                          {nota.valor_total
                            ? `R$ ${nota.valor_total.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`
                            : "-"}
                        </td>
                        <td className="px-4 py-3 text-zinc-500">
                          {nota.data_emissao
                            ? new Date(nota.data_emissao).toLocaleDateString("pt-BR")
                            : "-"}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => window.open(`/api/fiscal/download?nfeId=${nota.id}&format=pdf`, "_blank")}
                            className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded transition-colors"
                            title="Download PDF"
                          >
                            <Download size={14} />
                          </button>
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
