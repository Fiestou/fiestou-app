import { useState } from "react";
import { useRouter } from "next/router";
import { PainelLayout } from "@/src/components/painel";
import { ArrowLeft, Building2, Shield, Hash, Loader2, CheckCircle } from "lucide-react";
import { getStore } from "@/src/contexts/AuthContext";

export default function ConfigurarEmpresa() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [form, setForm] = useState({
    cnpj: "", razaoSocial: "", nomeFantasia: "", inscricaoMunicipal: "",
    regimeTributario: "simplesNacional",
    street: "", number: "", district: "", postalCode: "", city: "", state: "PB", cityCode: "2507507",
    federalServiceCode: "7.02", cnaeCode: "",
  });

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      const store = getStore();
      const res = await fetch("/api/fiscal/store-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId: store?.id,
          cnpj: form.cnpj,
          razaoSocial: form.razaoSocial,
          nomeFantasia: form.nomeFantasia,
          inscricaoMunicipal: form.inscricaoMunicipal,
          regimeTributario: form.regimeTributario,
          federalServiceCode: form.federalServiceCode,
          cnaeCode: form.cnaeCode,
          endereco: {
            street: form.street, number: form.number, district: form.district,
            postalCode: form.postalCode, city: form.city, state: form.state, cityCode: form.cityCode,
          },
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || data.details || "Erro ao cadastrar");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar empresa");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400";
  const labelCls = "block text-sm font-medium text-zinc-700 mb-1";

  if (success) {
    return (
      <PainelLayout>
        <div className="max-w-lg mx-auto py-12 text-center">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Empresa cadastrada!</h2>
          <p className="text-zinc-500 mb-6">Sua empresa foi registrada. Agora envie o certificado digital A1 pelo painel da Spedy para ativar a emissao.</p>
          <button onClick={() => router.push("/painel/fiscal/emissao")} className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800">
            Voltar para Emissao
          </button>
        </div>
      </PainelLayout>
    );
  }

  const steps = [
    { icon: Building2, label: "Dados da Empresa" },
    { icon: Hash, label: "Endereco" },
    { icon: Shield, label: "Tributacao" },
  ];

  return (
    <PainelLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/painel/fiscal/emissao")} className="p-1.5 hover:bg-zinc-100 rounded-lg">
            <ArrowLeft size={20} className="text-zinc-500" />
          </button>
          <h1 className="font-title text-2xl font-bold text-zinc-900">Configurar Empresa</h1>
        </div>

        {/* Steps */}
        <div className="flex gap-2">
          {steps.map((s, i) => (
            <button key={i} onClick={() => setStep(i)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all ${
                i === step ? "bg-zinc-900 text-white" : i < step ? "bg-green-50 text-green-700" : "bg-zinc-100 text-zinc-400"
              }`}>
              <s.icon size={14} /> {s.label}
            </button>
          ))}
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4">
          {step === 0 && (<>
            <div><label className={labelCls}>CNPJ *</label><input className={inputCls} placeholder="00.000.000/0001-00" value={form.cnpj} onChange={e => update("cnpj", e.target.value)} /></div>
            <div><label className={labelCls}>Razao Social *</label><input className={inputCls} value={form.razaoSocial} onChange={e => update("razaoSocial", e.target.value)} /></div>
            <div><label className={labelCls}>Nome Fantasia</label><input className={inputCls} value={form.nomeFantasia} onChange={e => update("nomeFantasia", e.target.value)} /></div>
            <div><label className={labelCls}>Inscricao Municipal</label><input className={inputCls} value={form.inscricaoMunicipal} onChange={e => update("inscricaoMunicipal", e.target.value)} /></div>
          </>)}

          {step === 1 && (<>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2"><label className={labelCls}>Rua</label><input className={inputCls} value={form.street} onChange={e => update("street", e.target.value)} /></div>
              <div><label className={labelCls}>Numero</label><input className={inputCls} value={form.number} onChange={e => update("number", e.target.value)} /></div>
            </div>
            <div><label className={labelCls}>Bairro</label><input className={inputCls} value={form.district} onChange={e => update("district", e.target.value)} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div><label className={labelCls}>CEP</label><input className={inputCls} value={form.postalCode} onChange={e => update("postalCode", e.target.value)} /></div>
              <div><label className={labelCls}>Cidade</label><input className={inputCls} value={form.city} onChange={e => update("city", e.target.value)} /></div>
              <div><label className={labelCls}>UF</label><input className={inputCls} value={form.state} onChange={e => update("state", e.target.value)} /></div>
            </div>
          </>)}

          {step === 2 && (<>
            <div>
              <label className={labelCls}>Regime Tributario</label>
              <select className={inputCls} value={form.regimeTributario} onChange={e => update("regimeTributario", e.target.value)}>
                <option value="simplesNacional">Simples Nacional</option>
                <option value="lucroPresumido">Lucro Presumido</option>
                <option value="lucroReal">Lucro Real</option>
                <option value="mei">MEI</option>
              </select>
            </div>
            <div><label className={labelCls}>Codigo Servico Federal (LC 116)</label><input className={inputCls} placeholder="Ex: 7.02" value={form.federalServiceCode} onChange={e => update("federalServiceCode", e.target.value)} /></div>
            <div><label className={labelCls}>CNAE (opcional)</label><input className={inputCls} placeholder="Ex: 7490104" value={form.cnaeCode} onChange={e => update("cnaeCode", e.target.value)} /></div>
          </>)}

          {error && <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">{error}</p>}

          <div className="flex justify-between pt-2">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 rounded-lg">Voltar</button>
            ) : <div />}
            {step < 2 ? (
              <button onClick={() => setStep(s => s + 1)} className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800">Proximo</button>
            ) : (
              <button onClick={handleSubmit} disabled={loading || !form.cnpj || !form.razaoSocial}
                className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 flex items-center gap-2">
                {loading && <Loader2 size={14} className="animate-spin" />} Cadastrar Empresa
              </button>
            )}
          </div>
        </div>
      </div>
    </PainelLayout>
  );
}