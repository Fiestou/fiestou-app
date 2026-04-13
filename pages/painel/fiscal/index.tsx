// pages/painel/fiscal/index.tsx
// Página de gestão fiscal do lojista

import { useEffect, useState, useCallback } from "react";
import { PainelLayout } from "@/src/components/painel";
import { Button } from "@/src/components/ui/form";
import {
  FileText,
  Download,
  CheckCircle,
  AlertTriangle,
  Clock,
  XCircle,
  RefreshCw,
  Settings,
  Search,
  Loader2,
  Building2,
  Upload,
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
  ambiente?: number;
};

const statusBadge: Record<string, { label: string; cls: string }> = {
  autorizada: { label: "Autorizada", cls: "bg-green-50 text-green-700 border-green-200" },
  processando: { label: "Processando", cls: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  rejeitada: { label: "Rejeitada", cls: "bg-red-50 text-red-700 border-red-200" },
  cancelada: { label: "Cancelada", cls: "bg-zinc-50 text-zinc-500 border-zinc-200" },
};

export default function FiscalPage() {
  const [tab, setTab] = useState<"notas" | "config">("notas");
  const [notas, setNotas] = useState<NfeListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [configSuccess, setConfigSuccess] = useState<string | null>(null);

  // Config form
  const [cnpj, setCnpj] = useState("");
  const [razaoSocial, setRazaoSocial] = useState("");
  const [inscricaoEstadual, setIe] = useState("");
  const [regime, setRegime] = useState(1);

  // Certificado
  const [certFile, setCertFile] = useState<File | null>(null);
  const [certSenha, setCertSenha] = useState("");
  const [certLoading, setCertLoading] = useState(false);

  // Buscar empresa cadastrada
  const loadCompany = useCallback(async () => {
    if (!cnpj || cnpj.replace(/\D/g, "").length < 11) return;
    try {
      const resp = await fetch(`/api/fiscal/company?cnpj=${cnpj.replace(/\D/g, "")}`);
      const data = await resp.json();
      if (data.success && data.empresa) {
        setRazaoSocial(data.empresa.razao_social || "");
        setIe(data.empresa.inscricao_estadual || "");
      }
    } catch {}
  }, [cnpj]);

  // Cadastrar empresa
  const handleSaveConfig = useCallback(async () => {
    const cleanCnpj = cnpj.replace(/\D/g, "");
    if (cleanCnpj.length < 11 || !razaoSocial) {
      setConfigError("CNPJ e Razão Social são obrigatórios");
      return;
    }

    setConfigLoading(true);
    setConfigError(null);
    setConfigSuccess(null);

    try {
      const resp = await fetch("/api/fiscal/company", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cnpj: cleanCnpj,
          razao_social: razaoSocial,
          inscricao_estadual: inscricaoEstadual,
          regime_tributario: regime,
        }),
      });

      const data = await resp.json();

      if (data.success) {
        setConfigSuccess("Empresa cadastrada com sucesso na NuvemFiscal!");
      } else {
        setConfigError(data.error || data.details || "Erro ao cadastrar empresa");
      }
    } catch (err: any) {
      setConfigError(err.message || "Erro de conexão");
    } finally {
      setConfigLoading(false);
    }
  }, [cnpj, razaoSocial, inscricaoEstadual, regime]);

  // Upload certificado
  const handleUploadCert = useCallback(async () => {
    if (!certFile || !certSenha || !cnpj) return;
    setCertLoading(true);
    setConfigError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1] || "";
        const resp = await fetch("/api/fiscal/company", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "upload_certificado",
            cnpj: cnpj.replace(/\D/g, ""),
            certificado_base64: base64,
            senha: certSenha,
          }),
        });

        const data = await resp.json();
        if (data.success) {
          setConfigSuccess("Certificado digital enviado com sucesso!");
          setCertFile(null);
          setCertSenha("");
        } else {
          setConfigError(data.error || "Erro ao enviar certificado");
        }
        setCertLoading(false);
      };
      reader.readAsDataURL(certFile);
    } catch {
      setConfigError("Erro ao processar certificado");
      setCertLoading(false);
    }
  }, [certFile, certSenha, cnpj]);

  const stats = {
    total: notas.length,
    autorizadas: notas.filter((n) => n.status === "autorizada").length,
    processando: notas.filter((n) => n.status === "processando").length,
    rejeitadas: notas.filter((n) => n.status === "rejeitada").length,
  };

  return (
    <PainelLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-title text-2xl sm:text-3xl font-bold text-zinc-900">
            Gestão Fiscal
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Gerencie suas notas fiscais emitidas pela plataforma
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setTab("notas")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === "notas"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <FileText size={14} className="inline mr-1.5 -mt-0.5" />
            Notas Fiscais
          </button>
          <button
            onClick={() => setTab("config")}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === "config"
                ? "bg-white text-zinc-900 shadow-sm"
                : "text-zinc-500 hover:text-zinc-700"
            }`}
          >
            <Settings size={14} className="inline mr-1.5 -mt-0.5" />
            Configurações
          </button>
        </div>

        {/* Tab: Notas Fiscais */}
        {tab === "notas" && (
          <div className="space-y-4">
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
                  As notas fiscais aparecerão aqui conforme forem emitidas para os seus pedidos.
                  Configure seus dados fiscais na aba de Configurações.
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
                            <td className="px-4 py-3 font-medium text-zinc-900">
                              {nota.numero || "-"}
                            </td>
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
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() =>
                                    window.open(`/api/fiscal/download?nfeId=${nota.id}&format=pdf`, "_blank")
                                  }
                                  className="p-1.5 text-cyan-600 hover:bg-cyan-50 rounded transition-colors"
                                  title="Download PDF"
                                >
                                  <Download size={14} />
                                </button>
                              </div>
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
        )}

        {/* Tab: Configurações Fiscais */}
        {tab === "config" && (
          <div className="space-y-4 max-w-2xl">
            {/* Alertas */}
            {configError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex items-center gap-2">
                <AlertTriangle size={14} />
                {configError}
              </div>
            )}
            {configSuccess && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700 flex items-center gap-2">
                <CheckCircle size={14} />
                {configSuccess}
              </div>
            )}

            {/* Dados da Empresa */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={16} className="text-cyan-500" />
                <h3 className="font-semibold text-zinc-900">Dados da Empresa</h3>
              </div>

              <div className="grid gap-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">CNPJ</label>
                    <input
                      type="text"
                      value={cnpj}
                      onChange={(e) => setCnpj(e.target.value)}
                      onBlur={loadCompany}
                      placeholder="00.000.000/0000-00"
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1">Inscrição Estadual</label>
                    <input
                      type="text"
                      value={inscricaoEstadual}
                      onChange={(e) => setIe(e.target.value)}
                      placeholder="ISENTO ou número"
                      className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Razão Social</label>
                  <input
                    type="text"
                    value={razaoSocial}
                    onChange={(e) => setRazaoSocial(e.target.value)}
                    placeholder="Nome da empresa"
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Regime Tributário</label>
                  <select
                    value={regime}
                    onChange={(e) => setRegime(Number(e.target.value))}
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                  >
                    <option value={1}>Simples Nacional</option>
                    <option value={2}>Simples Nacional (excesso de sublimite)</option>
                    <option value={3}>Regime Normal (Lucro Presumido/Real)</option>
                  </select>
                </div>

                <button
                  onClick={handleSaveConfig}
                  disabled={configLoading}
                  className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 disabled:bg-zinc-300 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
                  {configLoading ? "Salvando..." : "Cadastrar na NuvemFiscal"}
                </button>
              </div>
            </div>

            {/* Certificado Digital */}
            <div className="bg-white border border-zinc-200 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Upload size={16} className="text-cyan-500" />
                <h3 className="font-semibold text-zinc-900">Certificado Digital A1</h3>
              </div>
              <p className="text-xs text-zinc-500 mb-4">
                Envie seu certificado digital A1 (.pfx) para poder emitir notas fiscais eletrônicas. 
                O certificado é armazenado de forma segura na NuvemFiscal.
              </p>

              <div className="grid gap-3">
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Arquivo .pfx</label>
                  <input
                    type="file"
                    accept=".pfx,.p12"
                    onChange={(e) => setCertFile(e.target.files?.[0] || null)}
                    className="w-full text-sm text-zinc-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-zinc-300 file:text-xs file:font-medium file:bg-zinc-50 file:text-zinc-700 hover:file:bg-zinc-100"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-500 mb-1">Senha do Certificado</label>
                  <input
                    type="password"
                    value={certSenha}
                    onChange={(e) => setCertSenha(e.target.value)}
                    placeholder="Senha do certificado"
                    className="w-full border border-zinc-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                  />
                </div>
                <button
                  onClick={handleUploadCert}
                  disabled={certLoading || !certFile || !certSenha}
                  className="w-full sm:w-auto px-6 py-2.5 bg-zinc-800 hover:bg-zinc-900 disabled:bg-zinc-300 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                >
                  {certLoading ? "Enviando..." : "Enviar Certificado"}
                </button>
              </div>
            </div>

            {/* Info box */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex gap-3">
                <AlertTriangle size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-semibold mb-1">Ambiente Sandbox</p>
                  <p className="text-xs text-amber-700">
                    A integração está configurada em modo sandbox (homologação).
                    As notas emitidas neste modo não têm validade fiscal.
                    Para emitir notas reais, é necessário ativar o ambiente de produção.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PainelLayout>
  );
}
