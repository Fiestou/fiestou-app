// src/components/painel/FiscalSection.tsx
// Seção de Nota Fiscal para incorporar na tela de detalhe do pedido
// e reutilizar na página de gestão fiscal

import { useState, useCallback } from "react";
import { FileText, Download, XCircle, RefreshCw, CheckCircle, AlertTriangle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/form";
import Modal from "@/src/components/utils/Modal";

interface FiscalSectionProps {
  orderId: number;
  orderTotal: number;
  nfeId?: string | null;
  nfeStatus?: string | null;
  nfeNumero?: number | null;
  nfeChave?: string | null;
  nfeEmitidoEm?: string | null;
  compact?: boolean;
  onEmit?: () => void;
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
  onEmit,
}: FiscalSectionProps) {
  const [loading, setLoading] = useState(false);
  const [emitting, setEmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [currentStatus, setCurrentStatus] = useState(nfeStatus);
  const [currentNfeId, setCurrentNfeId] = useState(nfeId);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelJustificativa, setCancelJustificativa] = useState("");
  const [cancelling, setCancelling] = useState(false);

  // Emitir nota
  const handleEmit = useCallback(async () => {
    setEmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const resp = await fetch("/api/fiscal/emit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });

      const data = await resp.json();

      if (data.success) {
        setCurrentNfeId(data.nfeId);
        setCurrentStatus(data.status || "processando");
        setSuccess(`Nota fiscal emitida com sucesso! ID: ${data.nfeId}`);
        onEmit?.();
      } else {
        setError(data.error || data.details || "Falha ao emitir nota fiscal");
      }
    } catch (err: any) {
      setError(err.message || "Erro de conexão");
    } finally {
      setEmitting(false);
    }
  }, [orderId, onEmit]);

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
    } catch (err: any) {
      setError("Erro ao consultar status");
    } finally {
      setLoading(false);
    }
  }, [currentNfeId]);

  // Cancelar
  const handleCancel = useCallback(async () => {
    if (!currentNfeId || cancelJustificativa.length < 15) return;
    setCancelling(true);
    setError(null);

    try {
      const resp = await fetch("/api/fiscal/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nfeId: currentNfeId,
          justificativa: cancelJustificativa,
          orderId,
        }),
      });

      const data = await resp.json();

      if (data.success) {
        setCurrentStatus("cancelada");
        setShowCancelModal(false);
        setCancelJustificativa("");
        setSuccess("Nota fiscal cancelada com sucesso");
      } else {
        setError(data.error || "Falha ao cancelar");
      }
    } catch (err: any) {
      setError("Erro ao cancelar nota fiscal");
    } finally {
      setCancelling(false);
    }
  }, [currentNfeId, cancelJustificativa, orderId]);

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

      {success && (
        <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
          <div className="flex items-center gap-2">
            <CheckCircle size={14} />
            {success}
          </div>
        </div>
      )}

      {/* Sem nota emitida */}
      {!hasNote && (
        <div className="text-center py-4">
          <FileText size={32} className="mx-auto text-zinc-300 mb-2" />
          <p className="text-sm text-zinc-500 mb-3">Nenhuma nota fiscal emitida para este pedido</p>
          <button
            onClick={handleEmit}
            disabled={emitting}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-zinc-300 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
          >
            {emitting ? (
              <>
                <Loader2 size={14} className="animate-spin" />
                Emitindo...
              </>
            ) : (
              <>
                <FileText size={14} />
                Emitir Nota Fiscal
              </>
            )}
          </button>
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
            <div>
              <span className="text-zinc-400 text-xs">Ambiente</span>
              <p className="font-medium text-zinc-900">
                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700">
                  SANDBOX
                </span>
              </p>
            </div>
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

            {currentStatus === "autorizada" && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
              >
                <XCircle size={12} />
                Cancelar
              </button>
            )}

            {(currentStatus === "rejeitada" || currentStatus === "erro") && (
              <button
                onClick={handleEmit}
                disabled={emitting}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 rounded-lg transition-colors"
              >
                {emitting ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
                Reemitir
              </button>
            )}
          </div>
        </div>
      )}

      {/* Modal de cancelamento */}
      {showCancelModal && (
        <Modal status={showCancelModal} close={() => setShowCancelModal(false)} size="sm">
          <div className="p-6">
            <h4 className="font-title text-lg font-bold text-zinc-900 mb-2">
              Cancelar Nota Fiscal
            </h4>
            <p className="text-sm text-zinc-500 mb-4">
              Informe o motivo do cancelamento. Mínimo de 15 caracteres.
            </p>

            <textarea
              value={cancelJustificativa}
              onChange={(e) => setCancelJustificativa(e.target.value)}
              placeholder="Motivo do cancelamento..."
              rows={3}
              className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none resize-none"
            />

            <div className="flex items-center justify-between mt-1 mb-4">
              <span className={`text-xs ${cancelJustificativa.length < 15 ? "text-red-400" : "text-green-500"}`}>
                {cancelJustificativa.length}/15 caracteres mínimos
              </span>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-2 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                Voltar
              </button>
              <button
                onClick={handleCancel}
                disabled={cancelling || cancelJustificativa.length < 15}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 disabled:bg-zinc-300 rounded-lg transition-colors"
              >
                {cancelling ? "Cancelando..." : "Confirmar Cancelamento"}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
