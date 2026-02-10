import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { Upload, FileSpreadsheet, ArrowLeft, Check, AlertTriangle, X, ChevronDown } from "lucide-react";
import Api from "@/src/services/api";
import {
  PainelLayout,
  PageHeader,
} from "@/src/components/painel";

const FIELD_OPTIONS = [
  { value: "", label: "-- Ignorar --" },
  { value: "title", label: "Nome do produto" },
  { value: "sku", label: "SKU / Código" },
  { value: "price", label: "Preço" },
  { value: "priceSale", label: "Preço promocional" },
  { value: "quantity", label: "Estoque" },
  { value: "description", label: "Descrição" },
  { value: "category", label: "Categoria" },
  { value: "weight", label: "Peso" },
  { value: "width", label: "Largura" },
  { value: "height", label: "Altura" },
  { value: "length", label: "Comprimento" },
  { value: "tags", label: "Tags" },
  { value: "color", label: "Cor" },
  { value: "comercialType", label: "Tipo comercial" },
  { value: "delivery_type", label: "Tipo de entrega" },
];

const COMERCIAL_TYPES = [
  { value: "aluguel", label: "Aluguel" },
  { value: "venda", label: "Venda" },
  { value: "comestivel", label: "Comestivel" },
  { value: "servico", label: "Servico" },
];

type Step = "upload" | "preview" | "result";

type PreviewData = {
  columns: string[];
  mapping: Record<string, number>;
  preview: any[][];
  totalRows: number;
  fileId: string;
  fileExt: string;
};

type ImportResult = {
  imported: number;
  errors: Array<{ row: number; message: string }>;
  total: number;
};

export default function ImportarProdutos() {
  const api = new Api();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>("upload");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [dragActive, setDragActive] = useState(false);

  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [mapping, setMapping] = useState<Record<string, number>>({});
  const [comercialType, setComercialType] = useState("aluguel");

  const [result, setResult] = useState<ImportResult | null>(null);

  const handleFile = useCallback(async (file: File) => {
    const validExts = [".csv", ".xlsx", ".xls", ".txt"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();
    if (!validExts.includes(ext)) {
      setError("Formato invalido. Use CSV, XLSX ou XLS.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError("Arquivo muito grande. Maximo 10MB.");
      return;
    }

    setLoading(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res: any = await api.bridge({
        method: "post",
        url: "products/import-preview",
        data: formData,
        opts: { headers: { "Content-Type": "multipart/form-data" } },
      });

      if (res?.response && res?.columns) {
        setPreviewData(res);
        setMapping(res.mapping || {});
        setStep("preview");
      } else {
        setError(res?.message || "Erro ao processar arquivo");
      }
    } catch (err: any) {
      setError(err?.data?.message || err?.message || "Erro ao fazer upload");
    }
    setLoading(false);
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateMapping = (field: string, colIndex: number | "") => {
    setMapping((prev) => {
      const next = { ...prev };
      if (colIndex === "") {
        delete next[field];
      } else {
        next[field] = colIndex as number;
      }
      return next;
    });
  };

  const getColumnForField = (field: string): number | "" => {
    return mapping[field] ?? "";
  };

  const handleImport = async () => {
    if (!previewData) return;
    if (!mapping.title && mapping.title !== 0) {
      setError("Mapeie pelo menos a coluna 'Nome do produto'");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res: any = await api.bridge({
        method: "post",
        url: "products/import",
        data: {
          fileId: previewData.fileId,
          fileExt: previewData.fileExt,
          mapping,
          comercialType,
        },
      });

      if (res?.success || res?.response) {
        setResult({
          imported: res.imported || 0,
          errors: res.errors || [],
          total: res.total || 0,
        });
        setStep("result");
      } else {
        setError(res?.message || "Erro na importacao");
      }
    } catch (err: any) {
      setError(err?.data?.message || err?.message || "Erro na importacao");
    }
    setLoading(false);
  };

  const reset = () => {
    setStep("upload");
    setPreviewData(null);
    setMapping({});
    setResult(null);
    setError("");
  };

  return (
    <PainelLayout>
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/painel/produtos"
          className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
        >
          <ArrowLeft size={20} className="text-zinc-600" />
        </Link>
        <PageHeader
          title="Importar Produtos"
          description="Importe produtos em lote via planilha CSV ou Excel"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6 flex items-start gap-3">
          <AlertTriangle size={18} className="text-red-500 mt-0.5 shrink-0" />
          <div className="text-sm text-red-700 flex-1">{error}</div>
          <button type="button" onClick={() => setError("")} className="text-red-400 hover:text-red-600">
            <X size={16} />
          </button>
        </div>
      )}

      <div className="flex items-center gap-4 mb-8">
        {["upload", "preview", "result"].map((s, i) => {
          const labels = ["Upload", "Mapeamento", "Resultado"];
          const isActive = step === s;
          const isDone = ["upload", "preview", "result"].indexOf(step) > i;
          return (
            <div key={s} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isActive
                    ? "bg-yellow-500 text-white"
                    : isDone
                    ? "bg-emerald-500 text-white"
                    : "bg-zinc-200 text-zinc-500"
                }`}
              >
                {isDone ? <Check size={14} /> : i + 1}
              </div>
              <span className={`text-sm font-medium ${isActive ? "text-zinc-900" : "text-zinc-400"}`}>
                {labels[i]}
              </span>
              {i < 2 && <div className="w-12 h-px bg-zinc-200 mx-1" />}
            </div>
          );
        })}
      </div>

      {step === "upload" && (
        <div className="bg-white rounded-xl border border-zinc-200 p-8">
          <div
            className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
              dragActive
                ? "border-yellow-400 bg-yellow-50"
                : "border-zinc-300 hover:border-zinc-400"
            }`}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
          >
            <div className="flex justify-center mb-4">
              <div className="p-4 bg-zinc-100 rounded-full">
                <Upload size={32} className="text-zinc-400" />
              </div>
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">
              Arraste seu arquivo aqui
            </h3>
            <p className="text-sm text-zinc-500 mb-6">
              ou clique para selecionar. Formatos: CSV, XLSX, XLS (max 10MB)
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Processando..." : "Selecionar arquivo"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls,.txt"
              onChange={onFileSelect}
              className="hidden"
            />
          </div>

          <div className="mt-8 border-t border-zinc-100 pt-6">
            <h4 className="text-sm font-bold text-zinc-900 mb-3">Plataformas compativeis</h4>
            <p className="text-sm text-zinc-500 mb-4">
              O sistema reconhece automaticamente planilhas exportadas das principais plataformas:
            </p>
            <div className="flex flex-wrap gap-2 mb-6">
              {["Bling", "Tiny ERP", "Tray", "Nuvemshop", "Mercado Livre", "Shopify", "WooCommerce", "Planilha manual"].map((p) => (
                <span key={p} className="px-3 py-1 bg-zinc-100 text-zinc-600 text-xs font-medium rounded-full">
                  {p}
                </span>
              ))}
            </div>
            <h4 className="text-sm font-bold text-zinc-900 mb-3">Formato esperado</h4>
            <p className="text-sm text-zinc-500 mb-4">
              A planilha deve ter uma linha de cabecalho com os nomes das colunas.
              O sistema tenta mapear automaticamente as colunas.
            </p>
            <div className="overflow-x-auto">
              <table className="text-xs border border-zinc-200 rounded-lg">
                <thead>
                  <tr className="bg-zinc-50">
                    <th className="px-3 py-2 text-left text-zinc-600 font-medium">Nome</th>
                    <th className="px-3 py-2 text-left text-zinc-600 font-medium">Preço</th>
                    <th className="px-3 py-2 text-left text-zinc-600 font-medium">Estoque</th>
                    <th className="px-3 py-2 text-left text-zinc-600 font-medium">Descrição</th>
                    <th className="px-3 py-2 text-left text-zinc-600 font-medium">Categoria</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-zinc-100">
                    <td className="px-3 py-2 text-zinc-700">Kit Festa Infantil</td>
                    <td className="px-3 py-2 text-zinc-700">89,90</td>
                    <td className="px-3 py-2 text-zinc-700">15</td>
                    <td className="px-3 py-2 text-zinc-700">Kit completo para festa</td>
                    <td className="px-3 py-2 text-zinc-700">Festas</td>
                  </tr>
                  <tr className="border-t border-zinc-100">
                    <td className="px-3 py-2 text-zinc-700">Mesa Decorada</td>
                    <td className="px-3 py-2 text-zinc-700">150,00</td>
                    <td className="px-3 py-2 text-zinc-700">8</td>
                    <td className="px-3 py-2 text-zinc-700">Mesa decorada premium</td>
                    <td className="px-3 py-2 text-zinc-700">Decoracao</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {step === "preview" && previewData && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-zinc-900">
                Mapeamento de colunas
              </h3>
              <span className="text-sm text-zinc-500">
                {previewData.totalRows} produtos encontrados
              </span>
            </div>
            <p className="text-sm text-zinc-500 mb-6">
              Verifique se as colunas foram mapeadas corretamente. Ajuste se necessario.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FIELD_OPTIONS.filter(f => f.value).map((field) => (
                <div key={field.value}>
                  <label className="block text-xs font-medium text-zinc-600 mb-1">
                    {field.label}
                    {field.value === "title" && <span className="text-red-500 ml-0.5">*</span>}
                  </label>
                  <select
                    value={getColumnForField(field.value)}
                    onChange={(e) => updateMapping(field.value, e.target.value === "" ? "" : Number(e.target.value))}
                    className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none bg-white"
                  >
                    <option value="">-- Ignorar --</option>
                    {previewData.columns.map((col, i) => (
                      <option key={i} value={i}>
                        {col || `Coluna ${i + 1}`}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-100">
              <label className="block text-xs font-medium text-zinc-600 mb-1">
                Tipo comercial padrao (para produtos sem coluna mapeada)
              </label>
              <select
                value={comercialType}
                onChange={(e) => setComercialType(e.target.value)}
                className="w-full max-w-xs px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none bg-white"
              >
                {COMERCIAL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 p-6">
            <h3 className="text-base font-bold text-zinc-900 mb-4">
              Preview (primeiras 5 linhas)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-zinc-50">
                    <th className="px-3 py-2 text-left text-xs font-medium text-zinc-500 w-12">#</th>
                    {previewData.columns.map((col, i) => (
                      <th key={i} className="px-3 py-2 text-left text-xs font-medium text-zinc-600 whitespace-nowrap">
                        {col || `Col ${i + 1}`}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {previewData.preview.map((row, ri) => (
                    <tr key={ri} className="border-t border-zinc-100">
                      <td className="px-3 py-2 text-xs text-zinc-400">{ri + 1}</td>
                      {previewData.columns.map((_, ci) => (
                        <td key={ci} className="px-3 py-2 text-zinc-700 whitespace-nowrap max-w-[200px] truncate">
                          {row[ci] ?? ""}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={reset}
              className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={handleImport}
              disabled={loading}
              className="px-6 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-bold rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? "Importando..." : `Importar ${previewData.totalRows} produtos`}
            </button>
          </div>
        </div>
      )}

      {step === "result" && result && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-zinc-200 p-8 text-center">
            <div className="flex justify-center mb-4">
              <div className={`p-4 rounded-full ${result.errors.length === 0 ? "bg-emerald-100" : "bg-amber-100"}`}>
                {result.errors.length === 0 ? (
                  <Check size={32} className="text-emerald-600" />
                ) : (
                  <AlertTriangle size={32} className="text-amber-600" />
                )}
              </div>
            </div>
            <h3 className="text-xl font-bold text-zinc-900 mb-2">
              Importacao concluida
            </h3>
            <p className="text-zinc-500 mb-6">
              {result.imported} de {result.total} produtos importados com sucesso
            </p>

            <div className="flex justify-center gap-6 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600">{result.imported}</div>
                <div className="text-xs text-zinc-500">Importados</div>
              </div>
              {result.errors.length > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-500">{result.errors.length}</div>
                  <div className="text-xs text-zinc-500">Erros</div>
                </div>
              )}
            </div>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={reset}
                className="px-4 py-2 text-sm font-medium text-zinc-600 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
              >
                Importar novamente
              </button>
              <Link
                href="/painel/produtos"
                className="px-4 py-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-lg transition-colors"
              >
                Ver produtos
              </Link>
            </div>
          </div>

          {result.errors.length > 0 && (
            <div className="bg-white rounded-xl border border-zinc-200 p-6">
              <h4 className="text-sm font-bold text-zinc-900 mb-3">
                Erros na importacao ({result.errors.length})
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {result.errors.map((err, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm p-2 bg-red-50 rounded-lg">
                    <AlertTriangle size={14} className="text-red-500 mt-0.5 shrink-0" />
                    <span className="text-red-700">
                      Linha {err.row}: {err.message}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </PainelLayout>
  );
}
