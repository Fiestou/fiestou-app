// src/components/painel/FiscalSection.tsx
// Seção de Nota Fiscal para incorporar na tela de detalhe do pedido
// e reutilizar na página de gestão fiscal

import { useState, useCallback } from "react";
import { FileText, Download, RefreshCw, CheckCircle, AlertTriangle, Clock, XCircle } from "lucide-react";

interface FiscalSectionProps {
  orderId: number;
  orderTotal: number;
  nfeId?: string | null;
  nfeStatus?: string | null;
  nfeNumero?: number | null;
  nfeChave?: string | null;
  nfeEmitidoEm?: string | null;
  compact?: boolean;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
  processando: { label: "Processando", color: "text-yellow-600 bg-yellow-50 border-yellow-200", icon: Clock },
  autorizada: { label: "Autorizada", color: "text-green-600 bg-green-50 border-green-200", icon: CheckCircle },
  rejeitada: { label: "Rejeitada", color: "text-red-600 bg-red-50 border-red-200", icon: AlertTriangle },
  cancelada: { label: "Cancelada", color: "text-zinc-500 bg-zinc-50 border-zinc-200", icon: XCircle },
  erro: { label: "Erro", color: "text-red-600 bg-red-50 border-red-200", icon: AlertTriangle },
};

export default function FiscalSection({
  orderId,
  orderTotal,
  nfeId,
  nfeStatus,
  nfeNumero,
  nfeChave,
  nfeEmitidoEm,
  compact = false,
}: FiscalSectionProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState(nfeStatus);
  const [currentNfeId, setCurrentNfeId] = useState(nfeId);



  // Consultar status
  const handleRefresh = useCallback(async () => {
    if (!currentNfeId) return;
    setLoading(true);
    setError(null);

    try {
      const resp = await fetch(`/api/fiscal/status?nfeId=${currentNfeId}`);
      const data = await resp.json();

      if (data.success) {
        setCurrentStatus(data.status);
      }
    } catch {
      setError("Erro ao consultar status");
    } finally {
      setLoading(false);
    }
  }, [currentNfeId]);



  // Download
  const handleDownload = useCallback(
    (format: "pdf" | "xml") => {
      if (!currentNfeId) return;
      window.open(`/api/fiscal/download?nfeId=${currentNfeId}&format=${format}`, "_blank");
    },
    [currentNfeId]
  );

  const cfg = statusConfig[currentStatus || ""] || null;
  const hasNote = !!currentNfeId;

  return (
    <div className={`bg-white border border-zinc-200 rounded-xl ${compact ? "p-3" : "p-4 sm:p-5"}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-cyan-500" />
          <h3 className="font-semibold text-zinc-900 text-sm sm:text-base">Nota Fiscal</h3>
        </div>

        {cfg && (
          <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full border ${cfg.color}`}>
            <cfg.icon size={12} />
            {cfg.label}
          </span>
        )}
      </div>

      {/* Alertas */}
      {error && (
        <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          <div className="flex items-center gap-2">
            <AlertTriangle size={14} />
            {error}
          </div>
        </div>
      )}

      {/* Sem nota emitida */}
      {!hasNote && (
        <div className="text-center py-4">
          <FileText size={32} className="mx-auto text-zinc-300 mb-2" />
          <p className="text-sm text-zinc-500">
            A nota fiscal será emitida automaticamente pela Fiestou após a confirmação do pagamento.
          </p>
        </div>
      )}

      {/* Nota existe */}
      {hasNote && (
        <div className="space-y-3">
          {/* Dados da nota */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {nfeNumero && (
              <div>
                <span className="text-zinc-400 text-xs">Número</span>
                <p className="font-medium text-zinc-900">{nfeNumero}</p>
              </div>
            )}
            <div>
              <span className="text-zinc-400 text-xs">Valor</span>
              <p className="font-medium text-zinc-900">
                R$ {orderTotal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
              </p>
            </div>
            {nfeEmitidoEm && (
              <div>
                <span className="text-zinc-400 text-xs">Emitido em</span>
                <p className="font-medium text-zinc-900">
                  {new Date(nfeEmitidoEm).toLocaleDateString("pt-BR")}
                </p>
              </div>
            )}
          </div>

          {/* Chave de acesso */}
          {nfeChave && (
            <div>
              <span className="text-zinc-400 text-xs">Chave de Acesso</span>
              <p className="font-mono text-[11px] text-zinc-600 break-all bg-zinc-50 rounded px-2 py-1.5 mt-0.5">
                {nfeChave}
              </p>
            </div>
          )}

          {/* Ações */}
          <div className="flex flex-wrap gap-2 pt-1">
            {(currentStatus === "autorizada" || currentStatus === "processando") && (
              <>
                <button
                  onClick={() => handleDownload("pdf")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg transition-colors"
                >
                  <Download size={12} />
                  PDF
                </button>
                <button
                  onClick={() => handleDownload("xml")}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-cyan-700 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-lg transition-colors"
                >
                  <Download size={12} />
                  XML
                </button>
              </>
            )}

            <button
              onClick={handleRefresh}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors"
            >
              <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
              Atualizar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
