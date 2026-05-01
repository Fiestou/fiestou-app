import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { PainelLayout } from "@/src/components/painel";
import { Building2, Send, Settings, FileText, Info, ArrowLeft, CheckCircle, Loader2 } from "lucide-react";
import { getStore } from "@/src/contexts/AuthContext";

export default function EmissaoPage() {
  const router = useRouter();
  const [hasConfig, setHasConfig] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [configData, setConfigData] = useState<any>(null);

  useEffect(() => {
    async function checkConfig() {
      try {
        const storeId = getStore();
        if (!storeId) return;
        const res = await fetch(`/api/fiscal/store-config?storeId=${storeId}`);
        const data = await res.json();
        if (data.success && data.config) {
          setHasConfig(true);
          setConfigData(data.config);
        }
      } catch (_) {}
      finally { setConfigLoading(false); }
    }
    checkConfig();
  }, []);

  return (
    <PainelLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/painel/fiscal")} className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-zinc-500" />
          </button>
          <div>
            <h1 className="font-title text-2xl sm:text-3xl font-bold text-zinc-900">Minha Emissão</h1>
            <p className="text-sm text-zinc-500 mt-1">Emita notas fiscais para seus clientes</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-100 rounded-xl p-1">
          <button
            onClick={() => router.push("/painel/fiscal")}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-zinc-500 hover:text-zinc-700 transition-all"
          >
            <Building2 size={16} /> Notas da Fiestou
          </button>
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-white text-zinc-900 shadow-sm transition-all">
            <Send size={16} /> Minha Emissão
          </button>
        </div>

        {/* Info */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex gap-3">
            <Info size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Emissão de notas é opcional</p>
              <p>
                Como marketplace, a Fiestou é mediadora. Você pode emitir notas pelo nosso sistema
                ou pela ferramenta que preferir. A responsabilidade fiscal é do lojista.
              </p>
            </div>
          </div>
        </div>

        {/* Loading */}
        {configLoading && (
          <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center">
            <Loader2 size={32} className="mx-auto text-zinc-300 animate-spin mb-3" />
            <p className="text-sm text-zinc-500">Verificando configuração fiscal...</p>
          </div>
        )}

        {/* Already configured */}
        {!configLoading && hasConfig && (
          <div className="bg-white border border-zinc-200 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-50 rounded-xl">
                <CheckCircle size={24} className="text-green-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-zinc-900 mb-1">Empresa configurada</h3>
                <div className="grid grid-cols-2 gap-3 text-sm mt-3">
                  <div>
                    <span className="text-zinc-400 text-xs">Razão Social</span>
                    <p className="text-zinc-700 font-medium">{configData?.razao_social || "-"}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-xs">CNPJ</span>
                    <p className="text-zinc-700 font-medium">{configData?.cnpj || "-"}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-xs">Regime Tributário</span>
                    <p className="text-zinc-700 font-medium">{configData?.regime_tributario || "-"}</p>
                  </div>
                  <div>
                    <span className="text-zinc-400 text-xs">Status</span>
                    <p className={`font-medium ${configData?.ativo ? "text-green-600" : "text-amber-600"}`}>
                      {configData?.ativo ? "Ativa" : "Pendente certificado"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/painel/fiscal/emissao/configurar")}
                  className="mt-4 px-4 py-2 text-sm text-zinc-600 border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
                >
                  Editar configuração
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Not configured */}
        {!configLoading && !hasConfig && (
          <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center">
            <Settings size={48} className="mx-auto text-zinc-200 mb-4" />
            <h3 className="text-lg font-semibold text-zinc-700 mb-2">Configure sua empresa</h3>
            <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">
              Para emitir notas fiscais pelo sistema, você precisa cadastrar os dados da sua empresa
              e enviar o certificado digital A1.
            </p>
            <button
              onClick={() => router.push("/painel/fiscal/emissao/configurar")}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
            >
              <Settings size={16} /> Configurar Empresa
            </button>
          </div>
        )}

        {/* Invoices empty state */}
        <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center">
          <FileText size={48} className="mx-auto text-zinc-200 mb-3" />
          <h3 className="text-lg font-semibold text-zinc-700 mb-1">Nenhuma nota emitida</h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto">
            Após configurar sua empresa, você poderá emitir notas fiscais diretamente por aqui.
          </p>
        </div>
      </div>
    </PainelLayout>
  );
}
