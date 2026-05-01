import { useState } from "react";
import { useRouter } from "next/router";
import { PainelLayout } from "@/src/components/painel";
import { Building2, Send, Settings, FileText, Info, ArrowLeft } from "lucide-react";

export default function EmissaoPage() {
  const router = useRouter();

  return (
    <PainelLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/painel/fiscal")} className="p-1.5 hover:bg-zinc-100 rounded-lg">
            <ArrowLeft size={20} className="text-zinc-500" />
          </button>
          <div>
            <h1 className="font-title text-2xl sm:text-3xl font-bold text-zinc-900">Minha Emissao</h1>
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
          <button
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium bg-white text-zinc-900 shadow-sm"
          >
            <Send size={16} /> Minha Emissao
          </button>
        </div>

        {/* Info */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <div className="flex gap-3">
            <Info size={18} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Emissao de notas e opcional</p>
              <p>
                Como marketplace, a Fiestou e mediadora. Voce pode emitir notas pelo nosso sistema
                ou pela ferramenta que preferir. A responsabilidade fiscal e do lojista.
              </p>
            </div>
          </div>
        </div>

        {/* Setup Card */}
        <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center">
          <Settings size={48} className="mx-auto text-zinc-200 mb-4" />
          <h3 className="text-lg font-semibold text-zinc-700 mb-2">Configure sua empresa</h3>
          <p className="text-sm text-zinc-500 max-w-md mx-auto mb-6">
            Para emitir notas fiscais pelo sistema, voce precisa cadastrar os dados da sua empresa
            e enviar o certificado digital A1.
          </p>
          <button
            onClick={() => router.push("/painel/fiscal/emissao/configurar")}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            <Settings size={16} /> Configurar Empresa
          </button>
        </div>

        {/* Empty state for invoices */}
        <div className="bg-white border border-zinc-200 rounded-xl p-8 text-center">
          <FileText size={48} className="mx-auto text-zinc-200 mb-3" />
          <h3 className="text-lg font-semibold text-zinc-700 mb-1">Nenhuma nota emitida</h3>
          <p className="text-sm text-zinc-500 max-w-sm mx-auto">
            Apos configurar sua empresa, voce podera emitir notas fiscais diretamente por aqui.
          </p>
        </div>
      </div>
    </PainelLayout>
  );
}