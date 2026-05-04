import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { PainelLayout } from "@/src/components/painel";
import { ArrowLeft, Building2, Shield, MapPin, Loader2, CheckCircle, AlertCircle, Info } from "lucide-react";
import { getStore } from "@/src/contexts/AuthContext";
import Api from "@/src/services/api";

export default function ConfigurarEmpresa() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [prefilling, setPrefilling] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({});
  const [prefilledFields, setPrefilledFields] = useState<Set<string>>(new Set());

  const [form, setForm] = useState({
    cnpj: "", razaoSocial: "", nomeFantasia: "", inscricaoMunicipal: "",
    regimeTributario: "simplesNacional",
    street: "", number: "", district: "", postalCode: "", city: "", state: "", cityCode: "",
    federalServiceCode: "7.02", cnaeCode: "", issWithheld: "false", issRate: "0.02",
  });

  // Pré-preencher com dados da loja
  useEffect(() => {
    async function prefill() {
      try {
        const api = new Api();
        const resp: any = await api.bridge({ method: "post", url: "stores/form" });
        const store = resp?.data || resp;
        if (!store?.id) return;

        const filled = new Set<string>();
        const updates: Record<string, string> = {};

        if (store.document) { updates.cnpj = store.document; filled.add("cnpj"); }
        if (store.companyName) { updates.razaoSocial = store.companyName; filled.add("razaoSocial"); }
        if (store.title) { updates.nomeFantasia = store.title; filled.add("nomeFantasia"); }
        if (store.street) { updates.street = store.street; filled.add("street"); }
        if (store.number) { updates.number = store.number; filled.add("number"); }
        if (store.neighborhood) { updates.district = store.neighborhood; filled.add("district"); }
        if (store.zipCode) { updates.postalCode = store.zipCode; filled.add("postalCode"); }
        if (store.city) { updates.city = store.city; filled.add("city"); }
        if (store.state) { updates.state = store.state; filled.add("state"); }

        setForm(prev => ({ ...prev, ...updates }));
        setPrefilledFields(filled);
      } catch (_) {}
      finally { setPrefilling(false); }
    }
    prefill();
  }, []);

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setStepErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validateStep = (s: number): boolean => {
    const errors: Record<string, string> = {};
    if (s === 0) {
      if (!form.cnpj.replace(/\D/g, "")) errors.cnpj = "CNPJ é obrigatório";
      else if (form.cnpj.replace(/\D/g, "").length < 14) errors.cnpj = "CNPJ inválido (precisa ter 14 dígitos)";
      if (!form.razaoSocial.trim()) errors.razaoSocial = "Razão Social é obrigatória";
    }
    if (s === 1) {
      if (!form.street.trim()) errors.street = "Rua é obrigatória";
      if (!form.city.trim()) errors.city = "Cidade é obrigatória";
      if (!form.state.trim()) errors.state = "UF é obrigatória";
    }
    setStepErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => { if (validateStep(step)) setStep(s => s + 1); };

  const handleSubmit = async () => {
    if (!validateStep(2)) return;
    setLoading(true);
    setError("");
    try {
      const storeId = getStore();
      const res = await fetch("/api/fiscal/store-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          storeId,
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
      if (!data.success) throw new Error(data.details || data.error || "Erro ao cadastrar");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erro ao cadastrar empresa");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = (field: string) =>
    `w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-zinc-900/10 focus:border-zinc-400 transition-colors ${
      stepErrors[field] ? "border-red-300 bg-red-50/30" : prefilledFields.has(field) ? "border-green-200 bg-green-50/20" : "border-zinc-200"
    }`;
  const labelCls = "block text-sm font-medium text-zinc-700 mb-1";
  const errorCls = "text-xs text-red-500 mt-1";
  const hintCls = "text-xs text-zinc-400 mt-1";

  if (prefilling) {
    return (
      <PainelLayout>
        <div className="max-w-2xl mx-auto py-12 text-center">
          <Loader2 size={32} className="mx-auto text-zinc-300 animate-spin mb-3" />
          <p className="text-sm text-zinc-500">Carregando dados da sua loja...</p>
        </div>
      </PainelLayout>
    );
  }

  if (success) {
    return (
      <PainelLayout>
        <div className="max-w-lg mx-auto py-12 text-center">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-zinc-900 mb-2">Empresa cadastrada!</h2>
          <p className="text-zinc-500 mb-6">
            Sua empresa foi registrada no sistema fiscal. Para ativar a emissão,
            envie o certificado digital A1 pelo painel da Spedy.
          </p>
          <button onClick={() => router.push("/painel/fiscal/emissao")}
            className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors">
            Voltar para Emissão
          </button>
        </div>
      </PainelLayout>
    );
  }

  const steps = [
    { icon: Building2, label: "Dados da Empresa" },
    { icon: MapPin, label: "Endereço" },
    { icon: Shield, label: "Tributação" },
  ];

  const filledCount = prefilledFields.size;

  return (
    <PainelLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/painel/fiscal/emissao")} className="p-1.5 hover:bg-zinc-100 rounded-lg transition-colors">
            <ArrowLeft size={20} className="text-zinc-500" />
          </button>
          <h1 className="font-title text-2xl font-bold text-zinc-900">Configurar Empresa</h1>
        </div>

        {/* Pre-fill notice */}
        {filledCount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex gap-3">
              <CheckCircle size={18} className="text-green-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">
                {filledCount} campos foram preenchidos automaticamente com os dados da sua loja.
                Confira e complete o que faltar.
              </p>
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="flex gap-2">
          {steps.map((s, i) => (
            <button key={i} onClick={() => { if (i < step) setStep(i); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-medium transition-all ${
                i === step ? "bg-zinc-900 text-white" : i < step ? "bg-green-50 text-green-700 cursor-pointer hover:bg-green-100" : "bg-zinc-100 text-zinc-400 cursor-default"
              }`}>
              <s.icon size={14} /> {s.label}
            </button>
          ))}
        </div>

        <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-4">
          {step === 0 && (<>
            <div>
              <label className={labelCls}>CNPJ *</label>
              <input className={inputCls("cnpj")} placeholder="00.000.000/0001-00" value={form.cnpj} onChange={e => update("cnpj", e.target.value)} />
              {stepErrors.cnpj && <p className={errorCls}>{stepErrors.cnpj}</p>}
            </div>
            <div>
              <label className={labelCls}>Razão Social *</label>
              <input className={inputCls("razaoSocial")} value={form.razaoSocial} onChange={e => update("razaoSocial", e.target.value)} />
              {stepErrors.razaoSocial && <p className={errorCls}>{stepErrors.razaoSocial}</p>}
            </div>
            <div>
              <label className={labelCls}>Nome Fantasia</label>
              <input className={inputCls("nomeFantasia")} value={form.nomeFantasia} onChange={e => update("nomeFantasia", e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Inscrição Municipal</label>
              <input className={inputCls("inscricaoMunicipal")} value={form.inscricaoMunicipal} onChange={e => update("inscricaoMunicipal", e.target.value)} />
            </div>
          </>)}

          {step === 1 && (<>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className={labelCls}>Rua *</label>
                <input className={inputCls("street")} value={form.street} onChange={e => update("street", e.target.value)} />
                {stepErrors.street && <p className={errorCls}>{stepErrors.street}</p>}
              </div>
              <div>
                <label className={labelCls}>Número</label>
                <input className={inputCls("number")} value={form.number} onChange={e => update("number", e.target.value)} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Bairro</label>
              <input className={inputCls("district")} value={form.district} onChange={e => update("district", e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className={labelCls}>CEP</label>
                <input className={inputCls("postalCode")} placeholder="00000-000" value={form.postalCode} onChange={e => update("postalCode", e.target.value)} />
              </div>
              <div>
                <label className={labelCls}>Cidade *</label>
                <input className={inputCls("city")} value={form.city} onChange={e => update("city", e.target.value)} />
                {stepErrors.city && <p className={errorCls}>{stepErrors.city}</p>}
              </div>
              <div>
                <label className={labelCls}>UF *</label>
                <input className={inputCls("state")} maxLength={2} placeholder="PB" value={form.state} onChange={e => update("state", e.target.value.toUpperCase())} />
                {stepErrors.state && <p className={errorCls}>{stepErrors.state}</p>}
              </div>
            </div>
            <div>
              <label className={labelCls}>Código IBGE do Município</label>
              <input className={inputCls("cityCode")} placeholder="Ex: 2507507" value={form.cityCode} onChange={e => update("cityCode", e.target.value)} />
              <p className={hintCls}>Consulte em ibge.gov.br se não souber</p>
            </div>
          </>)}

          {step === 2 && (<>
            <div>
              <label className={labelCls}>Regime Tributário</label>
              <select className={inputCls("regimeTributario")} value={form.regimeTributario} onChange={e => update("regimeTributario", e.target.value)}>
                <option value="simplesNacional">Simples Nacional</option>
                <option value="lucroPresumido">Lucro Presumido</option>
                <option value="lucroReal">Lucro Real</option>
                <option value="mei">MEI</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Código Serviço Federal (LC 116)</label>
              <input className={inputCls("federalServiceCode")} placeholder="Ex: 7.02" value={form.federalServiceCode} onChange={e => update("federalServiceCode", e.target.value)} />
              <p className={hintCls}>7.02 = Locação de bens. Consulte seu contador se necessário</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>ISS a reter?</label>
                <select className={inputCls("issWithheld")} value={form.issWithheld} onChange={e => update("issWithheld", e.target.value)}>
                  <option value="false">Não - ISS não retido</option>
                  <option value="true">Sim - ISS retido na fonte</option>
                </select>
                <p className={hintCls}>Define se o ISS será retido pelo tomador</p>
              </div>
              <div>
                <label className={labelCls}>Alíquota ISS (%)</label>
                <input className={inputCls("issRate")} placeholder="Ex: 2" value={form.issRate} onChange={e => update("issRate", e.target.value)} />
                <p className={hintCls}>Normalmente entre 2% e 5%</p>
              </div>
            </div>
            <div>
              <label className={labelCls}>CNAE (opcional)</label>
              <input className={inputCls("cnaeCode")} placeholder="Ex: 7490104" value={form.cnaeCode} onChange={e => update("cnaeCode", e.target.value)} />
            </div>
          </>)}

          {error && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
              <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="flex justify-between pt-2">
            {step > 0 ? (
              <button onClick={() => setStep(s => s - 1)} className="px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-100 rounded-lg transition-colors">Voltar</button>
            ) : <div />}
            {step < 2 ? (
              <button onClick={nextStep} className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 transition-colors">Próximo</button>
            ) : (
              <button onClick={handleSubmit} disabled={loading}
                className="px-6 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-medium hover:bg-zinc-800 disabled:opacity-50 flex items-center gap-2 transition-colors">
                {loading && <Loader2 size={14} className="animate-spin" />} Cadastrar Empresa
              </button>
            )}
          </div>
        </div>
      </div>
    </PainelLayout>
  );
}
