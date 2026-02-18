//@ts-nocheck
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import Api from "@/src/services/api";
import { Input, Select, TextArea } from "@/src/components/ui/form";
import { Cover, DayType, StoreType } from "@/src/models/store";
import Img from "@/src/components/utils/ImgBase";
import FileInput from "@/src/components/ui/form/FileInputUI";
import { getImage, getZipCode, justNumber } from "@/src/helper";
import { RelationType } from "@/src/models/relation";
import MultiSelect from "@/src/components/ui/form/MultiSelectUi";
import { useSegmentGroups } from "@/src/hooks/useSegmentGroups";
import {
  ImageIcon, UserCircle, Save, X, Pencil, FileText,
  Building2, MapPin, Clock, Truck, ScrollText, Share2,
  Instagram, Facebook, Globe, Phone, Eye, ChevronRight,
} from "lucide-react";
import { PainelLayout, PageHeader } from "@/src/components/painel";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

function TimePick({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const [h, m] = (value || "00:00").split(":");
  const hour = h || "00";
  const minute = MINUTES.reduce((prev, cur) => Math.abs(parseInt(cur) - parseInt(m || "0")) < Math.abs(parseInt(prev) - parseInt(m || "0")) ? cur : prev, "00");

  return (
    <div className="flex items-center gap-0.5">
      <select
        value={hour}
        onChange={(e) => onChange(`${e.target.value}:${minute}`)}
        className="px-2 py-1.5 border border-zinc-200 rounded-l-lg text-sm bg-white focus:ring-2 focus:ring-yellow-400 outline-none appearance-none text-center w-14"
      >
        {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
      </select>
      <span className="text-zinc-400 font-bold text-xs">:</span>
      <select
        value={minute}
        onChange={(e) => onChange(`${hour}:${e.target.value}`)}
        className="px-2 py-1.5 border border-zinc-200 rounded-r-lg text-sm bg-white focus:ring-2 focus:ring-yellow-400 outline-none appearance-none text-center w-14"
      >
        {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
    </div>
  );
}

const days: Record<string, string[]> = [
  { value: "Domingo", name: "Domingo" },
  { value: "Segunda", name: "Segunda" },
  { value: "Terça", name: "Terça" },
  { value: "Quarta", name: "Quarta" },
  { value: "Quinta", name: "Quinta" },
  { value: "Sexta", name: "Sexta" },
  { value: "Sábado", name: "Sabado" },
  { value: "Feriados", name: "Feriados" },
];

const tabs = [
  { id: "aparencia", label: "Aparência", icon: ImageIcon },
  { id: "informacoes", label: "Informações", icon: Building2 },
  { id: "horarios", label: "Horários", icon: Clock },
  { id: "entrega", label: "Entrega", icon: Truck },
  { id: "regras", label: "Regras", icon: ScrollText },
  { id: "contato", label: "Contato", icon: Share2 },
];

export default function Loja() {
  const api = useMemo(() => new Api(), []);
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("aparencia");
  const [saving, setSaving] = useState(false);

  const [week, setWeek] = useState([] as Array<DayType>);
  const handleWeek = (value: Object, day: string) => {
    let handle = store?.openClose ?? ([] as Array<DayType>);
    days.map(
      (item: string, key: string) =>
        item.value == day && (handle[key] = { ...handle[key], ...value, day: day })
    );
    setWeek(handle);
    setStore({ ...store, openClose: handle });
  };

  const [handleCover, setHandleCover] = useState({} as { preview: string; remove: number });
  const [handleProfile, setHandleProfile] = useState({} as { preview: string; remove: number });

  const { segments, loading: segmentsLoading, error: segmentsError } = useSegmentGroups();
  const handleStore = async (value: Object) => setStore({ ...store, ...value });

  const [oldStore, setOldStore] = useState({} as StoreType);
  const [store, setStore] = useState({} as StoreType);

  const getStore = useCallback(async () => {
    let request: any = await api.bridge({ method: "post", url: "stores/form" });
    const handle = request.data ?? {};

    if (typeof handle.minimum_order === "string") {
      try { handle.minimum_order = JSON.parse(handle.minimum_order); } catch { handle.minimum_order = null; }
    }
    handle.minimum_order = handle.minimum_order ?? { enabled: 0, value: 0 };
    handle.minimum_order.enabled = handle.minimum_order.enabled ? 1 : 0;
    handle.minimum_order.value = handle.minimum_order.value
      ? Number(handle.minimum_order.value).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
      : "";
    handle.deliveryRegions = handle.zipcode_cities_ranges?.map((item: any) => item.zipcode_cities_range_id);

    if (typeof handle.rental_rules === "string") {
      try { handle.rental_rules = JSON.parse(handle.rental_rules); } catch { handle.rental_rules = null; }
    }
    handle.rental_rules = handle.rental_rules ?? {
      enabled: false,
      return_period: "next_day",
      return_period_custom: "",
      deposit_enabled: false,
      deposit_type: "percentage",
      deposit_value: "",
      cancellation_deadline: "",
      cancellation_fee: "",
      late_fee_enabled: false,
      late_fee_value: "",
      additional_rules: "",
    };

    if (typeof handle.metadata === "string") {
      try { handle.metadata = JSON.parse(handle.metadata); } catch { handle.metadata = {}; }
    }
    handle.metadata = handle.metadata ?? {};
    handle.social_links = handle.metadata?.social_links ?? {
      instagram: "",
      facebook: "",
      whatsapp: "",
      website: "",
    };

    setOldStore(handle);
    setStore(handle);
    setWeek((handle?.openClose ?? []) as Array<DayType>);
    setHandleCover({ remove: 0, preview: handle?.cover ? getImage(handle?.cover, "xl") : "" });
    setHandleProfile({ remove: 0, preview: handle?.profile ? getImage(handle?.profile, "thumb") : "" });
  }, [api]);

  const handleCoverRemove = async () => {
    setHandleCover({ preview: "", remove: store?.cover?.id ?? handleCover.remove });
    handleStore({ cover: {} });
  };

  const handleCoverPreview = async (e: React.FormEvent) => {
    const file = e.target.files[0];
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
    const fileData = { base64, fileName: file.name };
    setHandleCover({ ...handleCover, preview: fileData.base64 });
    return fileData;
  };

  const handleSubmitCover = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let coverValue = store?.cover;

    if (handleCover.remove) {
      const request = await api.media({ dir: "store", app: store.id, index: store.id, method: "remove", medias: [handleCover.remove] }).then((res) => res);
      if (request.response && request.removed) coverValue = {};
    }

    if (store?.cover?.files) {
      const upload = await api.media({ dir: "store", app: store.id, index: store.id, method: "upload", medias: [store?.cover?.files] }).then((data) => data);
      if (upload.response && upload.medias[0].status) {
        const media = upload.medias[0].media;
        media["details"] = JSON.parse(media.details);
        coverValue = { id: media.id, base_url: media.base_url, permanent_url: media.permanent_url, details: media.details, preview: media.base_url + media.details?.sizes["lg"] };
      }
    }

    handleStore({ cover: coverValue });
    const handle = { ...store, cover: coverValue };
    const request: NextApiResponse = await api.bridge({ method: "post", url: "stores/register", data: handle });
    if (request.response) { setStore(handle); setOldStore(Object.assign({}, handle)); setHandleCover({ preview: coverValue?.preview, remove: 0 }); }
    setSaving(false);
  };

  const handleProfileRemove = async () => {
    setHandleProfile({ preview: "", remove: store?.profile?.id ?? handleProfile.remove });
    handleStore({ profile: {} });
  };

  const handleProfilePreview = async (e: React.FormEvent) => {
    const file = e.target.files[0];
    const base64 = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });
    const fileData = { base64, fileName: file.name };
    setHandleProfile({ ...handleProfile, preview: fileData.base64 });
    return fileData;
  };

  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let profileValue = store?.profile;

    if (handleProfile.remove) {
      const request = await api.media({ dir: "store", app: store.id, index: store.id, method: "remove", medias: [handleProfile.remove] }).then((res) => res);
      if (request.response && request.removed) profileValue = {};
    }

    if (store?.profile?.files) {
      const upload = await api.media({ dir: "store", app: store.id, index: store.id, method: "upload", medias: [store?.profile?.files] }).then((data) => data);
      if (upload.response && upload.medias[0].status) {
        const media = upload.medias[0].media;
        media["details"] = JSON.parse(media.details);
        profileValue = { id: media.id, base_url: media.base_url, permanent_url: media.permanent_url, details: media.details, preview: media.base_url + media.details?.sizes["lg"] };
      }
    }

    handleStore({ profile: profileValue });
    const handle = { ...store, profile: profileValue };
    const request: NextApiResponse = await api.bridge({ method: "post", url: "stores/register", data: handle });
    if (request.response) { setStore(handle); setOldStore(Object.assign({}, handle)); setHandleProfile({ preview: profileValue?.preview, remove: 0 }); }
    setSaving(false);
  };

  const handleZipCode = async (zipCode: string) => {
    const location = await getZipCode(zipCode);
    if (location) {
      let address = store;
      address["zipCode"] = justNumber(zipCode);
      address["street"] = location.logradouro;
      address["neighborhood"] = location.bairro;
      address["city"] = location.localidade;
      address["state"] = location.uf;
      address["country"] = "Brasil";
      setStore(address);
    }
  };

  function moneyBRToNumber(value?: string | number) {
    if (value === null || value === undefined) return 0;
    if (typeof value === "number") return value;
    if (typeof value !== "string") return 0;
    const onlyNumbers = value.replace(/\D/g, "");
    if (!onlyNumbers) return 0;
    return Number(onlyNumbers) / 100;
  }

  const maskMoneyBR = (value: string) => {
    const onlyNumbers = value.replace(/\D/g, "");
    if (!onlyNumbers) return "";
    return (parseInt(onlyNumbers, 10) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const handleSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setSaving(true);
    const payload = {
      ...store,
      metadata: { ...(store.metadata || {}), social_links: store.social_links },
      default_delivery_fee: moneyBRToNumber(store?.default_delivery_fee),
      minimum_order: { enabled: store?.minimum_order?.enabled ? 1 : 0, value: moneyBRToNumber(store?.minimum_order?.value) },
    };
    const request: NextApiResponse = await api.bridge({ method: "post", url: "stores/register", data: payload });
    if (request.response) { setOldStore(store); handleStore(store); }
    setSaving(false);
    await api.request({ method: "PUT", url: `app/zipcode-cities-range-stores/${store?.id}`, data: { ids: store?.deliveryRegions } });
  };

  const [deliveryRegionsOptions, setDeliveryRegionsOptions] = useState([]);

  useEffect(() => {
    const fetchRegions = async () => {
      try {
        const response = await api.request({ method: "get", url: "app/zipcode-cities-range" });
        setDeliveryRegionsOptions((response?.data?.data || []).map((region) => ({ value: region.id, name: `${region.name} (${region.start} - ${region.finish})` })));
      } catch { setDeliveryRegionsOptions([]); }
    };
    fetchRegions();
  }, [api]);

  useEffect(() => { getStore(); }, [getStore]);

  const isStoreOpen = () => {
    const now = new Date();
    const dayIndex = now.getDay();
    const currentDay = week[dayIndex];
    if (!currentDay || currentDay.working !== "on") return false;
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    return currentTime >= (currentDay.open || "00:00") && currentTime <= (currentDay.close || "23:59");
  };

  if (router.isFallback) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case "aparencia":
        return (
          <div className="grid gap-6">
            <form onSubmit={handleSubmitCover} encType="multipart/form-data" className="bg-white rounded-xl border border-zinc-200 p-6">
              <h3 className="text-base font-semibold text-zinc-900 mb-4">Imagem de capa</h3>
              <FileInput
                name="cover"
                id="cover"
                onChange={async (e) => { handleStore({ cover: { files: await handleCoverPreview(e) } }); }}
                aspect="aspect-[6/2.5]"
                loading={saving}
                remove={(e) => handleCoverRemove(e)}
                preview={handleCover.preview}
              />
              <p className="text-xs text-zinc-400 mt-2">Tamanho recomendado: 1024 x 480px - PNG, JPEG</p>
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Save size={14} />
                  Salvar capa
                </button>
              </div>
            </form>

            <form onSubmit={handleSubmitProfile} encType="multipart/form-data" className="bg-white rounded-xl border border-zinc-200 p-6">
              <h3 className="text-base font-semibold text-zinc-900 mb-4">Foto de perfil</h3>
              <div className="flex items-center gap-6">
                <div className="w-[90px]">
                  <FileInput
                    name="profile"
                    id="profile"
                    onChange={async (e) => { handleStore({ profile: { files: await handleProfilePreview(e) } }); }}
                    rounded
                    placeholder="Abrir"
                    aspect="aspect-square"
                    loading={saving}
                    remove={(e) => handleProfileRemove(e)}
                    preview={handleProfile.preview}
                  />
                </div>
                <p className="text-sm text-zinc-500">Imagem quadrada, mínimo 200x200px</p>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Save size={14} />
                  Salvar foto
                </button>
              </div>
            </form>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 p-6">
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Nome do estabelecimento</label>
                  <Input onChange={(e) => handleStore({ title: e.target.value })} value={store?.title} placeholder="Digite o nome aqui" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Descrição</label>
                  <TextArea onChange={(e) => handleStore({ description: e.target.value })} value={store?.description} placeholder="Conte sobre sua loja" rows={4} />
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 text-sm bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  <Save size={14} />
                  Salvar alterações
                </button>
              </div>
            </form>
          </div>
        );

      case "informacoes":
        return (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 p-6">
            <div className="grid gap-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">CNPJ</label>
                  <Input name="cnpj" onChange={(e) => handleStore({ document: justNumber(e.target.value) })} value={store?.document} placeholder="00.000.000/0000-00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Nome jurídico</label>
                  <Input name="nome" onChange={(e) => handleStore({ companyName: e.target.value })} value={store?.companyName} placeholder="Razão social" />
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-5">
                <h4 className="text-sm font-semibold text-zinc-900 mb-4">Endereço</h4>
                <div className="grid gap-3">
                  <Input name="cep" onChange={(e) => handleZipCode(e.target.value)} value={store?.zipCode} placeholder="CEP" />
                  <div className="grid sm:grid-cols-[1fr_100px] gap-3">
                    <Input name="rua" readonly value={store?.street} placeholder="Rua" />
                    <Input name="numero" onChange={(e) => handleStore({ number: e.target.value })} value={store?.number} placeholder="Número" />
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <Input name="bairro" readonly value={store?.neighborhood} placeholder="Bairro" />
                    <Input name="complemento" onChange={(e) => handleStore({ complement: e.target.value })} value={store?.complement} placeholder="Complemento" />
                  </div>
                  <div className="grid sm:grid-cols-[1fr_80px] gap-3">
                    <Input name="cidade" readonly value={store?.city} placeholder="Cidade" />
                    <Input name="estado" readonly value={store?.state} placeholder="UF" />
                  </div>
                </div>
              </div>

              <div className="border-t border-zinc-100 pt-5">
                <h4 className="text-sm font-semibold text-zinc-900 mb-4">Segmento</h4>
                {segmentsLoading ? <p className="text-sm text-zinc-400">Carregando...</p> :
                 segmentsError ? <p className="text-sm text-red-500">{segmentsError}</p> :
                 <Select onChange={(e) => handleStore({ segment: e.target.value })} value={store?.segment} placeholder="Selecione seu segmento" name="lojaTipo" options={segments.map((item) => ({ name: item.name, value: item.id }))} />
                }
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-sm bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={14} />
                Salvar alterações
              </button>
            </div>
          </form>
        );

      case "horarios":
        return (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 p-6">
            <h3 className="text-base font-semibold text-zinc-900 mb-5">Horário de funcionamento</h3>
            <div className="grid gap-2">
              {days.map((day, key) => {
                const isOpen = week[key]?.working === "on";
                return (
                  <div key={key} className={`flex items-center gap-4 p-3 rounded-lg transition-colors ${isOpen ? "bg-green-50 border border-green-100" : "bg-zinc-50 border border-zinc-100"}`}>
                    <button
                      type="button"
                      onClick={() => handleWeek({ working: isOpen ? "off" : "on" }, day.value)}
                      className={`relative w-10 h-5 rounded-full transition-colors ${isOpen ? "bg-green-400" : "bg-zinc-300"}`}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${isOpen ? "left-5" : "left-0.5"}`} />
                    </button>
                    <span className="w-24 text-sm font-medium text-zinc-700">{day.name}</span>
                    {isOpen ? (
                    <div className="flex items-center gap-3">
                        <TimePick value={week[key]?.open} onChange={(v) => handleWeek({ open: v }, day.value)} />
                        <span className="text-xs text-zinc-400">até</span>
                        <TimePick value={week[key]?.close} onChange={(v) => handleWeek({ close: v }, day.value)} />
                      </div>
                    ) : (
                      <span className="text-sm text-zinc-400">Fechado</span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-sm bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={14} />
                Salvar horários
              </button>
            </div>
          </form>
        );

      case "entrega":
        return (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 p-6">
            <div className="grid gap-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Você possui serviço de entrega?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="is_delivery_fee_active" value="1" checked={!!store?.is_delivery_fee_active} onChange={(e) => handleStore({ is_delivery_fee_active: Number(e.target.value) })} className="text-yellow-500" />
                    Sim
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="is_delivery_fee_active" value="0" checked={!store?.is_delivery_fee_active} onChange={(e) => handleStore({ is_delivery_fee_active: Number(e.target.value) })} className="text-yellow-500" />
                    Não
                  </label>
                </div>
              </div>

              {!!store?.is_delivery_fee_active && (
                <>
                  <div className="border-t border-zinc-100 pt-4">
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Valor do KM rodado</label>
                    <Input type="text" value={store?.default_delivery_fee} onChange={(e) => handleStore({ default_delivery_fee: maskMoneyBR(e.target.value) })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Região de atendimento</label>
                    <MultiSelect name="deliveryRegions" placeholder="Selecione as regiões" value={store?.deliveryRegions} onChange={(values) => handleStore({ deliveryRegions: values })} options={deliveryRegionsOptions} className="min-h-[46px] relative" isMulti={true} />
                  </div>
                </>
              )}

              <div className="border-t border-zinc-100 pt-5">
                <label className="block text-sm font-medium text-zinc-700 mb-2">Pedido mínimo</label>
                <div className="flex gap-4 mb-3">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="minimum_order_enabled" value="1" checked={!!store?.minimum_order?.enabled} onChange={() => handleStore({ minimum_order: { ...store.minimum_order, enabled: 1 } })} className="text-yellow-500" />
                    Sim
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="minimum_order_enabled" value="0" checked={!store?.minimum_order?.enabled} onChange={() => handleStore({ minimum_order: { ...store.minimum_order, enabled: 0, value: 0 } })} className="text-yellow-500" />
                    Não
                  </label>
                </div>
                {!!store?.minimum_order?.enabled && (
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Valor mínimo</label>
                    <Input type="text" value={store?.minimum_order?.value ?? ""} onChange={(e) => handleStore({ minimum_order: { ...store.minimum_order, value: maskMoneyBR(e.target.value) } })} placeholder="Ex: R$ 50,00" />
                  </div>
                )}
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-sm bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={14} />
                Salvar alterações
              </button>
            </div>
          </form>
        );

      case "regras":
        return (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 p-6">
            <div className="flex items-center gap-2 mb-5">
              <FileText size={18} className="text-zinc-400" />
              <h3 className="text-base font-semibold text-zinc-900">Regras de locação</h3>
            </div>

            <div className="grid gap-5">
              <div>
                <label className="block text-sm font-medium text-zinc-700 mb-2">Ativar regras de locação?</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="rental_enabled" checked={!!store?.rental_rules?.enabled} onChange={() => handleStore({ rental_rules: { ...store.rental_rules, enabled: true } })} className="text-yellow-500" />
                    Sim
                  </label>
                  <label className="flex items-center gap-2 text-sm">
                    <input type="radio" name="rental_enabled" checked={!store?.rental_rules?.enabled} onChange={() => handleStore({ rental_rules: { ...store.rental_rules, enabled: false } })} className="text-yellow-500" />
                    Não
                  </label>
                </div>
              </div>

              {!!store?.rental_rules?.enabled && (
                <>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Prazo de devolução</label>
                      <select
                        value={store?.rental_rules?.return_period ?? "next_day"}
                        onChange={(e) => handleStore({ rental_rules: { ...store.rental_rules, return_period: e.target.value } })}
                        className="w-full px-3 py-2.5 border border-zinc-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-yellow-400 outline-none"
                      >
                        <option value="same_day">Mesmo dia</option>
                        <option value="next_day">Dia seguinte</option>
                        <option value="24h">24 horas</option>
                        <option value="48h">48 horas</option>
                        <option value="custom">Personalizado</option>
                      </select>
                      {store?.rental_rules?.return_period === "custom" && (
                        <Input
                          value={store?.rental_rules?.return_period_custom ?? ""}
                          onChange={(e) => handleStore({ rental_rules: { ...store.rental_rules, return_period_custom: e.target.value } })}
                          placeholder="Ex: 3 dias úteis"
                          className="mt-2"
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Caução / Depósito</label>
                      <div className="flex gap-4 mb-2">
                        <label className="flex items-center gap-2 text-sm">
                          <input type="radio" name="deposit_enabled" checked={!!store?.rental_rules?.deposit_enabled} onChange={() => handleStore({ rental_rules: { ...store.rental_rules, deposit_enabled: true } })} className="text-yellow-500" />
                          Sim
                        </label>
                        <label className="flex items-center gap-2 text-sm">
                          <input type="radio" name="deposit_enabled" checked={!store?.rental_rules?.deposit_enabled} onChange={() => handleStore({ rental_rules: { ...store.rental_rules, deposit_enabled: false } })} className="text-yellow-500" />
                          Não
                        </label>
                      </div>
                      {!!store?.rental_rules?.deposit_enabled && (
                        <div className="flex gap-2">
                          <select
                            value={store?.rental_rules?.deposit_type ?? "percentage"}
                            onChange={(e) => handleStore({ rental_rules: { ...store.rental_rules, deposit_type: e.target.value } })}
                            className="px-3 py-2 border border-zinc-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-yellow-400 outline-none"
                          >
                            <option value="percentage">% do valor</option>
                            <option value="fixed">Valor fixo (R$)</option>
                          </select>
                          <Input
                            type="text"
                            value={store?.rental_rules?.deposit_value ?? ""}
                            onChange={(e) => handleStore({ rental_rules: { ...store.rental_rules, deposit_value: e.target.value } })}
                            placeholder={store?.rental_rules?.deposit_type === "fixed" ? "R$ 0,00" : "Ex: 30"}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Prazo de cancelamento</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={store?.rental_rules?.cancellation_deadline ?? ""}
                          onChange={(e) => handleStore({ rental_rules: { ...store.rental_rules, cancellation_deadline: e.target.value } })}
                          placeholder="48"
                          min={0}
                        />
                        <span className="text-sm text-zinc-500 whitespace-nowrap">horas antes</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">Até quantas horas antes do evento o cliente pode cancelar sem multa</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Taxa de cancelamento fora do prazo</label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          value={store?.rental_rules?.cancellation_fee ?? ""}
                          onChange={(e) => handleStore({ rental_rules: { ...store.rental_rules, cancellation_fee: e.target.value } })}
                          placeholder="50"
                          min={0}
                          max={100}
                        />
                        <span className="text-sm text-zinc-500">%</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">Porcentagem cobrada se cancelar fora do prazo</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Multa por atraso na devolução</label>
                    <div className="flex gap-4 mb-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input type="radio" name="late_fee_enabled" checked={!!store?.rental_rules?.late_fee_enabled} onChange={() => handleStore({ rental_rules: { ...store.rental_rules, late_fee_enabled: true } })} className="text-yellow-500" />
                        Sim
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input type="radio" name="late_fee_enabled" checked={!store?.rental_rules?.late_fee_enabled} onChange={() => handleStore({ rental_rules: { ...store.rental_rules, late_fee_enabled: false } })} className="text-yellow-500" />
                        Não
                      </label>
                    </div>
                    {!!store?.rental_rules?.late_fee_enabled && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-zinc-500">R$</span>
                        <Input
                          type="text"
                          value={store?.rental_rules?.late_fee_value ?? ""}
                          onChange={(e) => handleStore({ rental_rules: { ...store.rental_rules, late_fee_value: e.target.value } })}
                          placeholder="0,00"
                        />
                        <span className="text-sm text-zinc-500 whitespace-nowrap">por dia</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Regras adicionais</label>
                    <TextArea
                      value={store?.rental_rules?.additional_rules ?? ""}
                      onChange={(e) => handleStore({ rental_rules: { ...store.rental_rules, additional_rules: e.target.value } })}
                      placeholder="Escreva aqui regras e termos adicionais da sua loja. Ex: itens devem ser devolvidos limpos, montagem não inclusa, etc."
                      rows={4}
                    />
                    <p className="text-xs text-zinc-400 mt-1">Estas regras serão exibidas para o cliente no momento da compra</p>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-sm bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={14} />
                Salvar regras
              </button>
            </div>
          </form>
        );

      case "contato":
        return (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 p-6">
            <h3 className="text-base font-semibold text-zinc-900 mb-5">Redes sociais e contato</h3>
            <div className="grid gap-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-1.5">
                  <Instagram size={16} className="text-pink-500" />
                  Instagram
                </label>
                <Input
                  value={store?.social_links?.instagram ?? ""}
                  onChange={(e) => handleStore({ social_links: { ...store.social_links, instagram: e.target.value } })}
                  placeholder="https://instagram.com/sualoja"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-1.5">
                  <Facebook size={16} className="text-blue-600" />
                  Facebook
                </label>
                <Input
                  value={store?.social_links?.facebook ?? ""}
                  onChange={(e) => handleStore({ social_links: { ...store.social_links, facebook: e.target.value } })}
                  placeholder="https://facebook.com/sualoja"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-1.5">
                  <Phone size={16} className="text-green-500" />
                  WhatsApp
                </label>
                <Input
                  value={store?.social_links?.whatsapp ?? ""}
                  onChange={(e) => handleStore({ social_links: { ...store.social_links, whatsapp: e.target.value } })}
                  placeholder="(11) 99999-9999"
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-1.5">
                  <Globe size={16} className="text-zinc-500" />
                  Website
                </label>
                <Input
                  value={store?.social_links?.website ?? ""}
                  onChange={(e) => handleStore({ social_links: { ...store.social_links, website: e.target.value } })}
                  placeholder="https://sualoja.com.br"
                />
              </div>
            </div>
            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 text-sm bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={14} />
                Salvar contato
              </button>
            </div>
          </form>
        );

      default:
        return null;
    }
  };

  return (
    <PainelLayout>
      <PageHeader title="Minha Loja" description="Personalize sua loja no Fiestou" />

      <div className="grid lg:grid-cols-[1fr_300px] gap-8">
        <div>
          <div className="flex gap-1 border-b border-zinc-200 mb-6 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
                    isActive
                      ? "border-yellow-400 text-zinc-900"
                      : "border-transparent text-zinc-400 hover:text-zinc-600"
                  }`}
                >
                  <Icon size={16} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {renderTabContent()}
        </div>

        <div className="hidden lg:block">
          <div className="bg-white rounded-xl border border-zinc-200 overflow-hidden sticky top-6">
            <div className="aspect-[16/7] relative bg-zinc-100">
              {handleCover.preview ? (
                <Img src={handleCover.preview} className="absolute object-cover h-full inset-0 w-full" />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <ImageIcon size={32} className="text-zinc-300" />
                </div>
              )}
            </div>

            <div className="px-4 pb-4">
              <div className="flex items-end gap-3 -mt-6 mb-3">
                <div className="w-14 h-14 rounded-full border-2 border-white bg-zinc-100 overflow-hidden shadow-sm flex-shrink-0">
                  {handleProfile.preview ? (
                    <Img src={handleProfile.preview} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <UserCircle size={24} className="text-zinc-400" />
                    </div>
                  )}
                </div>
                {isStoreOpen() ? (
                  <span className="text-xs font-medium text-green-600 bg-green-50 px-2 py-0.5 rounded-full mb-1">Aberto agora</span>
                ) : (
                  <span className="text-xs font-medium text-zinc-400 bg-zinc-50 px-2 py-0.5 rounded-full mb-1">Fechado</span>
                )}
              </div>

              <h4 className="font-semibold text-zinc-900 text-sm">{store?.title || "Nome da loja"}</h4>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{store?.description || "Descrição da loja"}</p>

              {(store?.social_links?.instagram || store?.social_links?.facebook || store?.social_links?.whatsapp || store?.social_links?.website) && (
                <div className="flex gap-2 mt-3 pt-3 border-t border-zinc-100">
                  {store.social_links.instagram && (
                    <a href={store.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-pink-500 transition-colors">
                      <Instagram size={16} />
                    </a>
                  )}
                  {store.social_links.facebook && (
                    <a href={store.social_links.facebook} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-blue-600 transition-colors">
                      <Facebook size={16} />
                    </a>
                  )}
                  {store.social_links.whatsapp && (
                    <span className="text-zinc-400">
                      <Phone size={16} />
                    </span>
                  )}
                  {store.social_links.website && (
                    <a href={store.social_links.website} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-zinc-600 transition-colors">
                      <Globe size={16} />
                    </a>
                  )}
                </div>
              )}

              {store?.city && (
                <div className="flex items-center gap-1 text-xs text-zinc-400 mt-2">
                  <MapPin size={12} />
                  {store.city}, {store.state}
                </div>
              )}
            </div>

            <div className="px-4 pb-4">
              <p className="text-[10px] uppercase tracking-wider text-zinc-400 font-medium">Preview da loja</p>
            </div>
          </div>
        </div>
      </div>
    </PainelLayout>
  );
}
