// pages/admin/fiscal/index.tsx
// Dashboard fiscal do admin — visão completa de todas as notas

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  FileText,
  Download,
  CheckCircle,
  AlertTriangle,
  Clock,
  XCircle,
  RefreshCw,
  Search,
  Loader2,
  Building2,
  ArrowLeft,
  TrendingUp,
  Eye,
} from "lucide-react";

export default function AdminFiscalPage() {
  const [notas, setNotas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchOrder, setSearchOrder] = useState("");
  const [emittingOrderId, setEmittingOrderId] = useState<number | null>(null);
  const [alert, setAlert] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Emitir nota pelo admin
  const handleAdminEmit = useCallback(async (orderId: number) => {
    setEmittingOrderId(orderId);
    setAlert(null);

    try {
      const resp = await fetch("/api/fiscal/emit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId }),
      });
      const data = await resp.json();

      if (data.success) {
        setAlert({ type: "success", msg: `NF-e emitida para pedido #${orderId}. ID: ${data.nfeId}` });
      } else {
        setAlert({ type: "error", msg: data.error || data.details || "Erro ao emitir" });
      }
    } catch (err: any) {
      setAlert({ type: "error", msg: err.message });
    } finally {
      setEmittingOrderId(null);
    }
  }, []);

  // Consultar nota por pedido
  const handleSearch = useCallback(async () => {
    if (!searchOrder) return;
    setLoading(true);
    setAlert(null);
    // A busca seria feita via listagem de notas com referência
    // Por agora mostramos o fluxo de emissão direta
    setLoading(false);
  }, [searchOrder]);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Top bar */}
      <div className="bg-white border-b border-zinc-200 px-4 sm:px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="p-2 hover:bg-zinc-100 rounded-lg transition-colors">
              <ArrowLeft size={18} className="text-zinc-500" />
            </Link>
            <div>
              <h1 className="font-title text-xl sm:text-2xl font-bold text-zinc-900">
                Painel Fiscal
              </h1>
              <p className="text-xs text-zinc-500">
                Controle centralizado de notas fiscais — NuvemFiscal
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
            SANDBOX
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Alerts */}
        {alert && (
          <div
            className={`p-3 rounded-lg text-sm flex items-center gap-2 border ${
              alert.type === "success"
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {alert.type === "success" ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
            {alert.msg}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Total Emitidas</span>
              <div className="w-8 h-8 bg-cyan-50 rounded-lg flex items-center justify-center">
                <FileText size={16} className="text-cyan-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-zinc-900">0</p>
            <p className="text-xs text-zinc-400 mt-1">notas fiscais</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Autorizadas</span>
              <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircle size={16} className="text-green-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-green-600">0</p>
            <p className="text-xs text-zinc-400 mt-1">aprovadas pela SEFAZ</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Pendentes</span>
              <div className="w-8 h-8 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Clock size={16} className="text-yellow-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-yellow-600">0</p>
            <p className="text-xs text-zinc-400 mt-1">em processamento</p>
          </div>

          <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-zinc-400 uppercase tracking-wide">Faturamento NF</span>
              <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center">
                <TrendingUp size={16} className="text-purple-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-zinc-900">R$ 0</p>
            <p className="text-xs text-zinc-400 mt-1">total em notas</p>
          </div>
        </div>

        {/* Emissão rápida pelo admin */}
        <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm">
          <h3 className="font-semibold text-zinc-900 mb-3 flex items-center gap-2">
            <FileText size={16} className="text-cyan-500" />
            Emitir Nota Fiscal
          </h3>
          <p className="text-sm text-zinc-500 mb-4">
            Informe o ID do pedido para emitir uma NF-e diretamente pelo painel administrativo.
          </p>

          <div className="flex gap-3">
            <input
              type="number"
              value={searchOrder}
              onChange={(e) => setSearchOrder(e.target.value)}
              placeholder="ID do pedido (ex: 1234)"
              className="flex-1 max-w-xs border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
            />
            <button
              onClick={() => searchOrder && handleAdminEmit(Number(searchOrder))}
              disabled={!searchOrder || emittingOrderId !== null}
              className="inline-flex items-center gap-2 px-5 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-zinc-300 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
            >
              {emittingOrderId ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  Emitindo...
                </>
              ) : (
                <>
                  <FileText size={14} />
                  Emitir NF-e
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tabela de notas — vazia por enquanto */}
        <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-zinc-100 flex items-center justify-between">
            <h3 className="font-semibold text-zinc-900">Histórico de Notas</h3>
            <button
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-zinc-600 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg transition-colors"
            >
              <RefreshCw size={12} />
              Atualizar
            </button>
          </div>

          <div className="p-8 text-center">
            <FileText size={48} className="mx-auto text-zinc-200 mb-3" />
            <h3 className="text-lg font-semibold text-zinc-600 mb-1">
              Nenhuma nota emitida ainda
            </h3>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Quando as credenciais da NuvemFiscal forem configuradas e os pedidos começarem
              a receber notas, elas aparecerão listadas aqui com status em tempo real.
            </p>
          </div>
        </div>

        {/* Info de configuração */}
        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-2xl p-5">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-cyan-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 size={20} className="text-cyan-600" />
            </div>
            <div>
              <h4 className="font-semibold text-cyan-900 mb-1">Configuração Necessária</h4>
              <div className="text-sm text-cyan-800 space-y-1">
                <p>Para começar a emitir notas fiscais, complete estes passos:</p>
                <ol className="list-decimal list-inside text-xs space-y-1 mt-2 text-cyan-700">
                  <li>Criar conta na <strong>NuvemFiscal</strong> e gerar credenciais de Sandbox</li>
                  <li>Preencher <code className="bg-cyan-100/50 px-1 rounded">NUVEMFISCAL_CLIENT_ID</code> e <code className="bg-cyan-100/50 px-1 rounded">NUVEMFISCAL_CLIENT_SECRET</code> no .env</li>
                  <li>Cadastrar a empresa emitente (CNPJ + endereço)</li>
                  <li>Enviar o certificado digital A1 (.pfx)</li>
                  <li>Testar emissão com um pedido de teste</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
