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
import { toast } from "react-toastify";
import {
  ImageIcon, UserCircle, Save, X, Pencil, FileText,
  Building2, MapPin, Clock, Truck, ScrollText, Share2,
  Instagram, Facebook, Globe, Phone, Eye, ChevronRight, ChevronDown,
} from "lucide-react";
import { PainelLayout, PageHeader } from "@/src/components/painel";
import usePainelPageMode from "@/src/components/painel/usePainelPageMode";

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, "0"));
const MINUTES = ["00", "05", "10", "15", "20", "25", "30", "35", "40", "45", "50", "55"];

function TimePick({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  const [h, m] = (value || "00:00").split(":");
  const hour = h || "00";
  const minute = MINUTES.reduce((prev, cur) => Math.abs(parseInt(cur) - parseInt(m || "0")) < Math.abs(parseInt(prev) - parseInt(m || "0")) ? cur : prev, "00");

  return (
    <div className="grid w-full grid-cols-[1fr_auto_1fr] items-center gap-2">
      <select
        value={hour}
        onChange={(e) => onChange(`${e.target.value}:${minute}`)}
        className="min-w-0 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-center text-base font-medium text-zinc-700 outline-none transition-colors focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
      >
        {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
      </select>
      <span className="shrink-0 text-center text-sm font-semibold text-zinc-400">:</span>
      <select
        value={minute}
        onChange={(e) => onChange(`${hour}:${e.target.value}`)}
        className="min-w-0 w-full rounded-xl border border-zinc-200 bg-white px-3 py-3 text-center text-base font-medium text-zinc-700 outline-none transition-colors focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
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

const TAB_HELPERS: Record<string, string> = {
  aparencia: "Capa, foto e apresentação da loja.",
  informacoes: "CNPJ, razão social e endereço principal.",
  horarios: "Dias e faixas de atendimento da loja.",
  entrega: "Frete, retirada e regiões atendidas.",
  regras: "Condições de aluguel, danos e cancelamentos.",
  contato: "Redes, WhatsApp e site da loja.",
};

const submitButtonClass =
  "w-full sm:w-auto justify-center px-5 py-3 text-sm font-medium bg-yellow-400 hover:bg-yellow-500 text-zinc-900 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2";
const inlineChoiceGroupClass = "flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4";

export default function Loja() {
  const api = useMemo(() => new Api(), []);
  const router = useRouter();
  const panelMode = usePainelPageMode();

  const [activeTab, setActiveTab] = useState("aparencia");
  const [isMobileSchedule, setIsMobileSchedule] = useState(false);
  const [expandedScheduleDay, setExpandedScheduleDay] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [saveFeedback, setSaveFeedback] = useState<{
    type: "success" | "warning" | "error";
    text: string;
    at: number;
  } | null>(null);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

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
    handle.deliveryRegions = normalizeRegionIds(
      handle.zipcode_cities_ranges?.map((item: any) => item.zipcode_cities_range_id),
    );

    // Delivery radius from DB
    handle.delivery_lat = handle.delivery_lat || null;
    handle.delivery_lng = handle.delivery_lng || null;
    handle.delivery_radius_km = handle.delivery_radius_km || 0;

    if (typeof handle.rental_rules === "string") {
      try { handle.rental_rules = JSON.parse(handle.rental_rules); } catch { handle.rental_rules = null; }
    }
    const rentalRuleDefaults = {
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
      damage_rules: "",
    };
    handle.rental_rules = { ...rentalRuleDefaults, ...(handle.rental_rules || {}) };

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
    try {
      let coverValue = store?.cover;

      if (handleCover.remove) {
        const request = await api
          .media({ dir: "store", app: store.id, index: store.id, method: "remove", medias: [handleCover.remove] })
          .then((res) => res);
        if (request.response && request.removed) coverValue = {};
      }

      if (store?.cover?.files) {
        const upload = await api
          .media({ dir: "store", app: store.id, index: store.id, method: "upload", medias: [store?.cover?.files] })
          .then((data) => data);
        if (upload.response && upload.medias[0].status) {
          const media = upload.medias[0].media;
          media["details"] = JSON.parse(media.details);
          coverValue = {
            id: media.id,
            base_url: media.base_url,
            permanent_url: media.permanent_url,
            details: media.details,
            preview: media.base_url + media.details?.sizes["lg"],
          };
        }
      }

      handleStore({ cover: coverValue });
      const handle = { ...store, cover: coverValue };
      const request: NextApiResponse = await api.bridge({ method: "post", url: "stores/register", data: handle });
      if (request?.response) {
        setStore(handle);
        setOldStore(Object.assign({}, handle));
        setHandleCover({ preview: coverValue?.preview, remove: 0 });
        toast.success("Capa salva com sucesso.");
      } else {
        toast.error(request?.message || request?.data?.message || "Não foi possível salvar a capa.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Não foi possível salvar a capa.");
    } finally {
      setSaving(false);
    }
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
    try {
      let profileValue = store?.profile;

      if (handleProfile.remove) {
        const request = await api
          .media({ dir: "store", app: store.id, index: store.id, method: "remove", medias: [handleProfile.remove] })
          .then((res) => res);
        if (request.response && request.removed) profileValue = {};
      }

      if (store?.profile?.files) {
        const upload = await api
          .media({ dir: "store", app: store.id, index: store.id, method: "upload", medias: [store?.profile?.files] })
          .then((data) => data);
        if (upload.response && upload.medias[0].status) {
          const media = upload.medias[0].media;
          media["details"] = JSON.parse(media.details);
          profileValue = {
            id: media.id,
            base_url: media.base_url,
            permanent_url: media.permanent_url,
            details: media.details,
            preview: media.base_url + media.details?.sizes["lg"],
          };
        }
      }

      handleStore({ profile: profileValue });
      const handle = { ...store, profile: profileValue };
      const request: NextApiResponse = await api.bridge({ method: "post", url: "stores/register", data: handle });
      if (request?.response) {
        setStore(handle);
        setOldStore(Object.assign({}, handle));
        setHandleProfile({ preview: profileValue?.preview, remove: 0 });
        toast.success("Foto da loja salva com sucesso.");
      } else {
        toast.error(request?.message || request?.data?.message || "Não foi possível salvar a foto da loja.");
      }
    } catch (error: any) {
      toast.error(error?.message || "Não foi possível salvar a foto da loja.");
    } finally {
      setSaving(false);
    }
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

  const normalizeRegionIds = (regions: any): number[] => {
    if (!Array.isArray(regions)) return [];

    return regions
      .map((region: any) => {
        if (typeof region === "number") return region;
        if (typeof region === "string") return Number(region);
        if (region && typeof region === "object") {
          if (typeof region.id === "number") return region.id;
          if (typeof region.id === "string") return Number(region.id);
          if (typeof region.value === "number") return region.value;
          if (typeof region.value === "string") return Number(region.value);
        }
        return NaN;
      })
      .filter((id: number) => Number.isInteger(id) && id > 0);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    setSaveFeedback(null);
    try {
      const normalizedDeliveryRegions = normalizeRegionIds(store?.deliveryRegions);
      const payload = {
        ...store,
        deliveryRegions: normalizedDeliveryRegions,
        delivery_lat: store?.delivery_lat || null,
        delivery_lng: store?.delivery_lng || null,
        delivery_radius_km: store?.delivery_radius_km || 0,
        metadata: { ...(store.metadata || {}), social_links: store.social_links },
        default_delivery_fee: moneyBRToNumber(store?.default_delivery_fee),
        minimum_order: { enabled: store?.minimum_order?.enabled ? 1 : 0, value: moneyBRToNumber(store?.minimum_order?.value) },
      };
      const request: NextApiResponse = await api.bridge({
        method: "post",
        url: "stores/register",
        data: payload,
      });

      if (!request?.response) {
        const message = request?.message || request?.data?.message || "Não foi possível salvar os dados da loja.";
        setSaveFeedback({ type: "error", text: message, at: Date.now() });
        toast.error(message);
        return;
      }

      setStore(payload);
      setOldStore(payload);
      let feedback: { type: "success" | "warning"; text: string } = {
        type: "success",
        text: "Dados da loja salvos com sucesso.",
      };

      const resolvedStoreId = Number(payload?.id || store?.id);
      if (Number.isInteger(resolvedStoreId) && resolvedStoreId > 0) {
        const regionRequest: any = await api.request({
          method: "PUT",
          url: `app/zipcode-cities-range-stores/${resolvedStoreId}`,
          data: { ids: normalizedDeliveryRegions },
        });

        if (regionRequest?.status && Number(regionRequest.status) >= 400) {
          const regionMessage =
            regionRequest?.data?.error ||
            regionRequest?.data?.message ||
            "Dados da loja salvos, mas houve falha ao atualizar as regiões de entrega.";
          feedback = { type: "warning", text: regionMessage };
          toast.warning(regionMessage);
        }
      }

      if (feedback.type === "success") {
        toast.success(feedback.text);
      }
      setSaveFeedback({ type: feedback.type, text: feedback.text, at: Date.now() });
    } catch (error: any) {
      const message = error?.message || "Falha ao salvar a loja. Tente novamente.";
      setSaveFeedback({ type: "error", text: message, at: Date.now() });
      toast.error(message);
    } finally {
      setSaving(false);
    }
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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const media = window.matchMedia("(max-width: 639px)");
    const sync = () => setIsMobileSchedule(media.matches);
    sync();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", sync);
      return () => media.removeEventListener("change", sync);
    }

    media.addListener(sync);
    return () => media.removeListener(sync);
  }, []);

  useEffect(() => {
    if (!isMobileSchedule) {
      setExpandedScheduleDay("");
      return;
    }

    const firstOpenDay =
      days.find((day, index) => week[index]?.working === "on")?.value || days[0]?.value;

    setExpandedScheduleDay((current) => current || firstOpenDay || "");
  }, [isMobileSchedule, week]);

  const isStoreOpen = () => {
    const now = new Date();
    const dayIndex = now.getDay();
    const currentDay = week[dayIndex];
    if (!currentDay || currentDay.working !== "on") return false;
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    return currentTime >= (currentDay.open || "00:00") && currentTime <= (currentDay.close || "23:59");
  };

  const openDaysCount = useMemo(
    () => week.filter((day) => day?.working === "on").length,
    [week],
  );

  const socialLinksCount = useMemo(
    () =>
      Object.values(store?.social_links || {}).filter((value) =>
        typeof value === "string" ? value.trim().length > 0 : Boolean(value),
      ).length,
    [store?.social_links],
  );

  const deliveryRegionCount = useMemo(
    () => normalizeRegionIds(store?.deliveryRegions).length,
    [store?.deliveryRegions],
  );

  const activeTabMeta = useMemo(
    () => tabs.find((tab) => tab.id === activeTab) || tabs[0],
    [activeTab],
  );

  const getDayStatusText = (day: DayType | undefined) => {
    if (!day || day.working !== "on") return "Fechado";
    return `${day.open || "00:00"} às ${day.close || "00:00"}`;
  };

  const renderStorePreviewCard = (compact = false) => (
    <div className={`overflow-hidden rounded-xl border border-zinc-200 bg-white ${compact ? "" : "sticky top-6"}`}>
      <div className="relative aspect-[16/7] bg-zinc-100">
        {handleCover.preview ? (
          <Img src={handleCover.preview} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <ImageIcon size={32} className="text-zinc-300" />
          </div>
        )}
      </div>

      <div className="px-4 pb-4">
        <div className="mb-3 -mt-6 flex items-end gap-3">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-white bg-zinc-100 shadow-sm">
            {handleProfile.preview ? (
              <Img src={handleProfile.preview} className="h-full w-full object-cover" />
            ) : (
              <UserCircle size={24} className="text-zinc-400" />
            )}
          </div>
          {isStoreOpen() ? (
            <span className="mb-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-600">Aberto agora</span>
          ) : (
            <span className="mb-1 rounded-full bg-zinc-50 px-2 py-0.5 text-xs font-medium text-zinc-400">Fechado</span>
          )}
        </div>

        <h4 className="text-sm font-semibold text-zinc-900">{store?.title || "Nome da loja"}</h4>
        <p className="mt-1 line-clamp-2 text-xs text-zinc-500">{store?.description || "Descrição da loja"}</p>

        {store?.city && (
          <div className="mt-2 flex items-center gap-1 text-xs text-zinc-400">
            <MapPin size={12} />
            {store.city}, {store.state}
          </div>
        )}
      </div>

      {!compact && (
        <div className="px-4 pb-4">
          <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">Preview da loja</p>
        </div>
      )}
    </div>
  );

  if (router.isFallback) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case "aparencia":
        return (
          <div className="grid grid-cols-1 gap-6">
            <form onSubmit={handleSubmitCover} encType="multipart/form-data" className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-6">
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
              {panelMode !== "simple" && (
                <p className="mt-2 text-xs text-zinc-400">Tamanho recomendado: 1024 x 480px - PNG, JPEG</p>
              )}
              <div className="mt-4 flex flex-col sm:flex-row sm:justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className={submitButtonClass}
                >
                  <Save size={14} />
                  Salvar capa
                </button>
              </div>
            </form>

            <form onSubmit={handleSubmitProfile} encType="multipart/form-data" className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-6">
              <h3 className="text-base font-semibold text-zinc-900 mb-4">Foto de perfil</h3>
              <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-6">
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
                {panelMode !== "simple" && (
                  <p className="break-words text-base text-zinc-500">Imagem quadrada, mínimo 200x200px</p>
                )}
              </div>
              <div className="mt-4 flex flex-col sm:flex-row sm:justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className={submitButtonClass}
                >
                  <Save size={14} />
                  Salvar foto
                </button>
              </div>
            </form>

            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-6">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">
                    {panelMode === "simple" ? "Nome da loja" : "Nome do estabelecimento"}
                  </label>
                  <Input onChange={(e) => handleStore({ title: e.target.value })} value={store?.title} placeholder={panelMode === "simple" ? "Nome da loja" : "Digite o nome aqui"} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Descrição</label>
                  <TextArea
                    onChange={(e) => handleStore({ description: e.target.value })}
                    value={store?.description}
                    placeholder="Conte sobre sua loja"
                    rows={8}
                    className="min-h-[260px] sm:min-h-[220px]"
                  />
                </div>
              </div>
              <div className="mt-4 flex flex-col sm:flex-row sm:justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className={submitButtonClass}
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
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-6">
            <div className={`grid grid-cols-1 ${panelMode === "simple" ? "gap-4" : "gap-5"}`}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">CNPJ</label>
                  <Input name="cnpj" onChange={(e) => handleStore({ document: justNumber(e.target.value) })} value={store?.document} placeholder="00.000.000/0000-00" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 mb-1.5">Nome jurídico</label>
                  <Input name="nome" onChange={(e) => handleStore({ companyName: e.target.value })} value={store?.companyName} placeholder="Razão social" />
                </div>
              </div>

              <div className={panelMode === "simple" ? "" : "border-t border-zinc-100 pt-5"}>
                {panelMode !== "simple" && (
                  <h4 className="mb-4 text-sm font-semibold text-zinc-900">Endereço</h4>
                )}
                <div className="grid grid-cols-1 gap-3">
                  <Input name="cep" onChange={(e) => handleZipCode(e.target.value)} value={store?.zipCode} placeholder="CEP" />
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_100px]">
                    <Input name="rua" readonly value={store?.street} placeholder="Rua" />
                    <Input name="numero" onChange={(e) => handleStore({ number: e.target.value })} value={store?.number} placeholder="Número" />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <Input name="bairro" readonly value={store?.neighborhood} placeholder="Bairro" />
                    <Input name="complemento" onChange={(e) => handleStore({ complement: e.target.value })} value={store?.complement} placeholder="Complemento" />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_80px]">
                    <Input name="cidade" readonly value={store?.city} placeholder="Cidade" />
                    <Input name="estado" readonly value={store?.state} placeholder="UF" />
                  </div>
                </div>
              </div>

              <div className={panelMode === "simple" ? "" : "border-t border-zinc-100 pt-5"}>
                {panelMode !== "simple" && (
                  <h4 className="mb-4 text-sm font-semibold text-zinc-900">Segmento</h4>
                )}
                {segmentsLoading ? <p className="text-sm text-zinc-400">Carregando...</p> :
                 segmentsError ? <p className="text-sm text-red-500">{segmentsError}</p> :
                 <Select onChange={(e) => handleStore({ segment: e.target.value })} value={store?.segment} placeholder="Selecione seu segmento" name="lojaTipo" options={segments.map((item) => ({ name: item.name, value: item.id }))} />
                }
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end">
              <button
                type="submit"
                disabled={saving}
                className={submitButtonClass}
              >
                <Save size={14} />
                Salvar alterações
              </button>
            </div>
          </form>
        );

      case "horarios":
        return (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-6">
            {panelMode !== "simple" && (
            <div className="mb-5 rounded-xl border border-amber-100 bg-amber-50/80 p-4">
              <h3 className="text-lg font-semibold text-zinc-900">Horário de funcionamento</h3>
              <p className="mt-1 text-sm leading-6 text-zinc-600">
                Ajuste os dias em que sua loja atende e os horários de abertura e fechamento. No celular, cada dia fica em um card separado para evitar aperto na edição.
              </p>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-amber-200 bg-white/80 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    Dias ativos
                  </div>
                  <div className="mt-1 text-lg font-semibold text-zinc-900">
                    {openDaysCount} de {days.length}
                  </div>
                </div>
                <div className="rounded-xl border border-amber-200 bg-white/80 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    Edição no celular
                  </div>
                  <div className="mt-1 text-sm font-medium text-zinc-900">
                    Um dia por vez
                  </div>
                </div>
                <div className="rounded-xl border border-amber-200 bg-white/80 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-zinc-400">
                    Dica rápida
                  </div>
                  <div className="mt-1 text-sm font-medium text-zinc-900">
                    Abra só o dia que vai editar
                  </div>
                </div>
              </div>
            </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              {days.map((day, key) => {
                const isOpen = week[key]?.working === "on";
                const isExpanded = !isMobileSchedule || expandedScheduleDay === day.value;
                return (
                  <div
                    key={key}
                    className={`rounded-xl border p-4 transition-colors ${
                      isOpen
                        ? "border-emerald-200 bg-emerald-50/60"
                        : "border-zinc-200 bg-zinc-50/80"
                    }`}
                  >
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex min-w-0 flex-1 items-start gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              handleWeek({ working: isOpen ? "off" : "on" }, day.value);
                              if (!isOpen && isMobileSchedule) {
                                setExpandedScheduleDay(day.value);
                              }
                            }}
                            className={`relative mt-0.5 h-6 w-11 shrink-0 rounded-full transition-colors ${
                              isOpen ? "bg-emerald-500" : "bg-zinc-300"
                            }`}
                            aria-label={isOpen ? `Desativar ${day.name}` : `Ativar ${day.name}`}
                          >
                            <span
                              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                                isOpen ? "left-[22px]" : "left-0.5"
                              }`}
                            />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (!isMobileSchedule) return;
                              setExpandedScheduleDay((current) =>
                                current === day.value ? "" : day.value,
                              );
                            }}
                            className="flex min-w-0 flex-1 items-start justify-between gap-3 text-left"
                          >
                            <div className="min-w-0">
                              <div className="text-base font-semibold text-zinc-900">{day.name}</div>
                              <div className="text-sm text-zinc-500">{getDayStatusText(week[key])}</div>
                            </div>
                            {isMobileSchedule && (
                              <ChevronDown
                                size={16}
                                className={`mt-1 shrink-0 text-zinc-400 transition-transform ${
                                  isExpanded ? "rotate-180" : ""
                                }`}
                              />
                            )}
                          </button>
                        </div>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            isOpen
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-zinc-200 text-zinc-600"
                          }`}
                        >
                          {isOpen ? "Atendendo" : "Fechado"}
                        </span>
                      </div>

                      {isMobileSchedule && (
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedScheduleDay((current) =>
                              current === day.value ? "" : day.value,
                            )
                          }
                          className="inline-flex w-full items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
                        >
                          {isExpanded ? "Ocultar horário" : "Editar horário"}
                        </button>
                      )}
                    </div>

                    {isOpen && isExpanded ? (
                      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-xl border border-white/80 bg-white p-3.5">
                          <label className="mb-2 block text-sm font-medium text-zinc-700">Abre às</label>
                          <TimePick value={week[key]?.open} onChange={(v) => handleWeek({ open: v }, day.value)} />
                        </div>
                        <div className="rounded-xl border border-white/80 bg-white p-3.5">
                          <label className="mb-2 block text-sm font-medium text-zinc-700">Fecha às</label>
                          <TimePick value={week[key]?.close} onChange={(v) => handleWeek({ close: v }, day.value)} />
                        </div>
                      </div>
                    ) : isOpen && panelMode !== "simple" ? (
                      <span className="mt-3 block text-sm text-zinc-500">
                        Toque em “Editar horário” para ajustar este dia no celular.
                      </span>
                    ) : panelMode !== "simple" ? (
                      <span className="mt-3 block text-sm text-zinc-500">
                        Ative este dia para informar os horários de atendimento.
                      </span>
                    ) : null
                    }
                  </div>
                );
              })}
            </div>
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end">
              <button
                type="submit"
                disabled={saving}
                className={submitButtonClass}
              >
                <Save size={14} />
                Salvar horários
              </button>
            </div>
          </form>
        );

      case "entrega":
        return (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-6">
            <div className="grid grid-cols-1 gap-5">
              {panelMode !== "simple" && (
              <div className="rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-white p-2.5 text-blue-600 shadow-sm">
                    <Truck size={18} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-zinc-900">Entrega e pedido mínimo</h3>
                    <p className="mt-1 text-sm leading-6 text-zinc-600">
                      Nesta área você decide se a loja cobra frete, quais regiões atende e se existe valor mínimo para aceitar um pedido.
                    </p>
                  </div>
                </div>
              </div>
              )}

              {panelMode !== "simple" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-zinc-200 bg-white p-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Status da entrega</span>
                  <div className="mt-1 text-sm font-semibold text-zinc-900">
                    {store?.is_delivery_fee_active ? "Entrega ativa" : "Somente retirada ou atendimento local"}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    {store?.is_delivery_fee_active
                      ? "A loja pode cobrar frete e escolher as regiões atendidas."
                      : "Ative só se a loja realmente entregar fora do local do evento ou retirada."}
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Regiões</span>
                  <div className="mt-1 text-sm font-semibold text-zinc-900">
                    {store?.deliveryRegions?.length ? `${store.deliveryRegions.length} faixa(s) selecionada(s)` : "Nenhuma faixa escolhida"}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Use só as faixas em que a entrega é realmente viável sem ajuste manual.
                  </p>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-4">
                  <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Pedido mínimo</span>
                  <div className="mt-1 text-sm font-semibold text-zinc-900">
                    {store?.minimum_order?.enabled && store?.minimum_order?.value
                      ? store.minimum_order.value
                      : "Sem valor mínimo ativo"}
                  </div>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">
                    Bom para evitar pedidos muito pequenos em datas movimentadas.
                  </p>
                </div>
              </div>
              )}

              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
                <label className="block text-sm font-medium text-zinc-700 mb-2">Você possui serviço de entrega?</label>
                <div className={inlineChoiceGroupClass}>
                  <label className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm">
                    <input type="radio" name="is_delivery_fee_active" value="1" checked={!!store?.is_delivery_fee_active} onChange={(e) => handleStore({ is_delivery_fee_active: Number(e.target.value) })} className="text-yellow-500" />
                    <span>
                      <span className="block font-semibold text-zinc-900">Sim</span>
                      {panelMode !== "simple" && (
                        <span className="mt-0.5 block text-xs leading-5 text-zinc-500">A loja calcula frete e atende regiões definidas.</span>
                      )}
                    </span>
                  </label>
                  <label className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm">
                    <input type="radio" name="is_delivery_fee_active" value="0" checked={!store?.is_delivery_fee_active} onChange={(e) => handleStore({ is_delivery_fee_active: Number(e.target.value) })} className="text-yellow-500" />
                    <span>
                      <span className="block font-semibold text-zinc-900">Não</span>
                      {panelMode !== "simple" && (
                        <span className="mt-0.5 block text-xs leading-5 text-zinc-500">A loja trabalha só com retirada ou entrega no próprio local.</span>
                      )}
                    </span>
                  </label>
                </div>
                {panelMode !== "simple" && (
                <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                  Se a loja só trabalha com retirada ou montagem local, deixe desligado.
                </p>
                )}
              </div>

              {!!store?.is_delivery_fee_active && (
                <>
                  <div className="rounded-xl border border-zinc-200 bg-white p-4">
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Valor do KM rodado</label>
                    <Input type="text" value={store?.default_delivery_fee} onChange={(e) => handleStore({ default_delivery_fee: maskMoneyBR(e.target.value) })} />
                    {panelMode !== "simple" && (
                    <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                      Esse valor ajuda a calcular o frete padrão da loja no checkout.
                    </p>
                    )}
                  </div>
                                    {/* Raio de entrega visual */}
                  <div className="rounded-xl border border-zinc-200 bg-white p-4">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Raio de entrega</label>
                      <p className="text-xs leading-5 text-zinc-500">
                        Arraste o pin ou clique no mapa para ajustar o centro. Use o slider para definir o raio.
                      </p>
                    </div>
                    <DeliveryRadiusMap
                      lat={store?.delivery_lat}
                      lng={store?.delivery_lng}
                      radiusKm={store?.delivery_radius_km || 15}
                      storeCep={store?.zipCode}
                      storeCity={store?.city}
                      storeState={store?.state}
                      onUpdate={(lat, lng, radiusKm) => handleStore({
                        delivery_lat: lat,
                        delivery_lng: lng,
                        delivery_radius_km: radiusKm,
                      })}
                    />
                  </div>

                  <div className="rounded-xl border border-zinc-200 bg-white p-4">
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Região de atendimento</label>
                      {panelMode !== "simple" && (
                      <p className="text-xs leading-5 text-zinc-500">
                        Selecione as faixas de CEP que já estão validadas pela operação da loja.
                      </p>
                      )}
                    </div>
                    <MultiSelect name="deliveryRegions" placeholder="Selecione as regiões" value={store?.deliveryRegions} onChange={(values) => handleStore({ deliveryRegions: values })} options={deliveryRegionsOptions} className="min-h-[46px] relative" isMulti={true} />
                    {panelMode !== "simple" && (
                    <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                      Escolha as faixas de CEP onde a loja realmente consegue entregar sem ajuste manual.
                    </p>
                    )}
                    {!store?.deliveryRegions?.length && (
                      <div className="mt-3 rounded-xl border border-amber-100 bg-amber-50 px-3 py-2.5 text-xs leading-5 text-amber-700">
                        Nenhuma região selecionada ainda. Se a entrega estiver ativa, vale marcar pelo menos as faixas que a loja já atende hoje.
                      </div>
                    )}
                  </div>
                </>
              )}

              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
                <label className="block text-sm font-medium text-zinc-700 mb-2">Pedido mínimo</label>
                <div className={`${inlineChoiceGroupClass} mb-3`}>
                  <label className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm">
                    <input type="radio" name="minimum_order_enabled" value="1" checked={!!store?.minimum_order?.enabled} onChange={() => handleStore({ minimum_order: { ...store.minimum_order, enabled: 1 } })} className="text-yellow-500" />
                    <span>
                      <span className="block font-semibold text-zinc-900">Sim</span>
                      {panelMode !== "simple" && (
                        <span className="mt-0.5 block text-xs leading-5 text-zinc-500">A loja define um valor mínimo para aceitar o pedido.</span>
                      )}
                    </span>
                  </label>
                  <label className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm">
                    <input type="radio" name="minimum_order_enabled" value="0" checked={!store?.minimum_order?.enabled} onChange={() => handleStore({ minimum_order: { ...store.minimum_order, enabled: 0, value: 0 } })} className="text-yellow-500" />
                    <span>
                      <span className="block font-semibold text-zinc-900">Não</span>
                      {panelMode !== "simple" && (
                        <span className="mt-0.5 block text-xs leading-5 text-zinc-500">Qualquer valor pode seguir para checkout.</span>
                      )}
                    </span>
                  </label>
                </div>
                {!!store?.minimum_order?.enabled && (
                  <div className="rounded-xl border border-white/80 bg-white p-3.5">
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Valor mínimo</label>
                    <Input type="text" value={store?.minimum_order?.value ?? ""} onChange={(e) => handleStore({ minimum_order: { ...store.minimum_order, value: maskMoneyBR(e.target.value) } })} placeholder="Ex: R$ 50,00" />
                  </div>
                )}
                {panelMode !== "simple" && (
                <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                  Use esse campo quando a loja não quiser aceitar pedidos muito pequenos.
                </p>
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end">
              <button
                type="submit"
                disabled={saving}
                className={submitButtonClass}
              >
                <Save size={14} />
                Salvar alterações
              </button>
            </div>
          </form>
        );

      case "regras":
        return (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-5">
              <FileText size={18} className="text-zinc-400" />
              <h3 className="text-base font-semibold text-zinc-900">Regras de locação</h3>
            </div>

            <div className="grid grid-cols-1 gap-5">
              {panelMode !== "simple" && (
              <div className="rounded-xl border border-amber-100 bg-amber-50/70 p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-white p-2.5 text-amber-600 shadow-sm">
                    <ScrollText size={18} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-base font-semibold text-zinc-900">Organize as regras por tema</h4>
                    <p className="mt-1 text-sm leading-6 text-zinc-600">
                      No celular, vale preencher uma parte por vez: devolução, cancelamento, atraso e observações extras.
                    </p>
                  </div>
                </div>
              </div>
              )}

              {panelMode !== "simple" && !!store?.rental_rules?.enabled && (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <div className="rounded-xl border border-zinc-200 bg-white p-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Devolução</span>
                    <div className="mt-1 text-sm font-semibold text-zinc-900">
                      {store?.rental_rules?.return_period === "custom"
                        ? store?.rental_rules?.return_period_custom || "Personalizado"
                        : store?.rental_rules?.return_period === "same_day"
                          ? "Mesmo dia"
                          : store?.rental_rules?.return_period === "next_day"
                            ? "Dia seguinte"
                            : store?.rental_rules?.return_period}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Prazo principal que o cliente vai enxergar no produto e no checkout.
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-white p-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Cancelamento</span>
                    <div className="mt-1 text-sm font-semibold text-zinc-900">
                      {store?.rental_rules?.cancellation_deadline
                        ? `${store.rental_rules.cancellation_deadline}h antes`
                        : "Sem prazo definido"}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Deixe claro até quando a loja aceita cancelamento sem atrito.
                    </p>
                  </div>
                  <div className="rounded-xl border border-zinc-200 bg-white p-4">
                    <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Avarias</span>
                    <div className="mt-1 text-sm font-semibold text-zinc-900">
                      {store?.rental_rules?.damage_rules ? "Regras configuradas" : "Ainda sem texto"}
                    </div>
                    <p className="mt-1 text-xs leading-5 text-zinc-500">
                      Essa parte ajuda a reduzir dúvida e cobrança manual depois do evento.
                    </p>
                  </div>
                </div>
              )}

              <div className="rounded-xl border border-zinc-200 bg-zinc-50/70 p-4">
                <label className="block text-sm font-medium text-zinc-700 mb-2">Ativar regras de locação?</label>
                <div className={inlineChoiceGroupClass}>
                  <label className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm">
                    <input type="radio" name="rental_enabled" checked={!!store?.rental_rules?.enabled} onChange={() => handleStore({ rental_rules: { ...store.rental_rules, enabled: true } })} className="text-yellow-500" />
                    <span>
                      <span className="block font-semibold text-zinc-900">Sim</span>
                      {panelMode !== "simple" && (
                        <span className="mt-0.5 block text-xs leading-5 text-zinc-500">A loja exibe regras de devolução, cancelamento e avaria.</span>
                      )}
                    </span>
                  </label>
                  <label className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-white px-3 py-3 text-sm">
                    <input type="radio" name="rental_enabled" checked={!store?.rental_rules?.enabled} onChange={() => handleStore({ rental_rules: { ...store.rental_rules, enabled: false } })} className="text-yellow-500" />
                    <span>
                      <span className="block font-semibold text-zinc-900">Não</span>
                      {panelMode !== "simple" && (
                        <span className="mt-0.5 block text-xs leading-5 text-zinc-500">A loja não precisa mostrar regras extras para esse tipo de operação.</span>
                      )}
                    </span>
                  </label>
                </div>
              </div>

              {!!store?.rental_rules?.enabled && (
                <>
                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-zinc-900">Devolução e garantia</h4>
                      {panelMode !== "simple" && (
                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                          Defina quando o item volta para a loja e se existe caução para liberar a locação.
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-zinc-200 bg-white p-4">
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
                      {panelMode !== "simple" && (
                      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                        Defina o padrão que o cliente enxerga na página do produto e no checkout.
                      </p>
                      )}
                      </div>

                      <div className="rounded-xl border border-zinc-200 bg-white p-4">
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Caução / Depósito</label>
                      <div className={`${inlineChoiceGroupClass} mb-2`}>
                        <label className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm">
                          <input type="radio" name="deposit_enabled" checked={!!store?.rental_rules?.deposit_enabled} onChange={() => handleStore({ rental_rules: { ...store.rental_rules, deposit_enabled: true } })} className="text-yellow-500" />
                          <span>
                            <span className="block font-semibold text-zinc-900">Sim</span>
                            {panelMode !== "simple" && (
                              <span className="mt-0.5 block text-xs leading-5 text-zinc-500">A loja pede garantia financeira para liberar o item.</span>
                            )}
                          </span>
                        </label>
                        <label className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm">
                          <input type="radio" name="deposit_enabled" checked={!store?.rental_rules?.deposit_enabled} onChange={() => handleStore({ rental_rules: { ...store.rental_rules, deposit_enabled: false } })} className="text-yellow-500" />
                          <span>
                            <span className="block font-semibold text-zinc-900">Não</span>
                            {panelMode !== "simple" && (
                              <span className="mt-0.5 block text-xs leading-5 text-zinc-500">A liberação do item não depende de caução.</span>
                            )}
                          </span>
                        </label>
                      </div>
                      {!!store?.rental_rules?.deposit_enabled && (
                        <div className="flex flex-col gap-2 sm:flex-row">
                          <select
                            value={store?.rental_rules?.deposit_type ?? "percentage"}
                            onChange={(e) => handleStore({ rental_rules: { ...store.rental_rules, deposit_type: e.target.value } })}
                            className="w-full sm:w-auto px-3 py-3 border border-zinc-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-yellow-400 outline-none"
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
                      {panelMode !== "simple" && (
                      <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                        Use esse campo quando a loja exigir garantia financeira para liberar o item.
                      </p>
                      )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-zinc-900">Cancelamento</h4>
                      {panelMode !== "simple" && (
                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                          Aqui a loja define até quando aceita cancelamento e qual porcentagem cobra quando o prazo já passou.
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="rounded-xl border border-zinc-200 bg-white p-4">
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Prazo de cancelamento</label>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                          type="number"
                          value={store?.rental_rules?.cancellation_deadline ?? ""}
                          onChange={(e) => handleStore({ rental_rules: { ...store.rental_rules, cancellation_deadline: e.target.value } })}
                          placeholder="48"
                          min={0}
                        />
                        <span className="text-sm text-zinc-500 whitespace-nowrap">horas antes</span>
                      </div>
                      {panelMode !== "simple" && (
                      <p className="text-xs text-zinc-400 mt-1">Até quantas horas antes do evento o cliente pode cancelar sem multa</p>
                      )}
                      </div>

                      <div className="rounded-xl border border-zinc-200 bg-white p-4">
                      <label className="block text-sm font-medium text-zinc-700 mb-1.5">Taxa de cancelamento fora do prazo</label>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
                      {panelMode !== "simple" && (
                      <p className="text-xs text-zinc-400 mt-1">Porcentagem cobrada se cancelar fora do prazo</p>
                      )}
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold text-zinc-900">Atrasos e observações</h4>
                      {panelMode !== "simple" && (
                        <p className="mt-1 text-xs leading-5 text-zinc-500">
                          Use essa parte para registrar multa por atraso e textos extras que o cliente precisa ler antes de fechar a compra.
                        </p>
                      )}
                    </div>
                    <div className="rounded-xl border border-zinc-200 bg-white p-4">
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Multa por atraso na devolução</label>
                    <div className={`${inlineChoiceGroupClass} mb-2`}>
                      <label className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm">
                        <input type="radio" name="late_fee_enabled" checked={!!store?.rental_rules?.late_fee_enabled} onChange={() => handleStore({ rental_rules: { ...store.rental_rules, late_fee_enabled: true } })} className="text-yellow-500" />
                        <span>
                          <span className="block font-semibold text-zinc-900">Sim</span>
                          {panelMode !== "simple" && (
                            <span className="mt-0.5 block text-xs leading-5 text-zinc-500">Existe cobrança adicional quando a devolução atrasa.</span>
                          )}
                        </span>
                      </label>
                      <label className="flex items-start gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 text-sm">
                        <input type="radio" name="late_fee_enabled" checked={!store?.rental_rules?.late_fee_enabled} onChange={() => handleStore({ rental_rules: { ...store.rental_rules, late_fee_enabled: false } })} className="text-yellow-500" />
                        <span>
                          <span className="block font-semibold text-zinc-900">Não</span>
                          {panelMode !== "simple" && (
                            <span className="mt-0.5 block text-xs leading-5 text-zinc-500">A loja não aplica multa extra por atraso.</span>
                          )}
                        </span>
                      </label>
                    </div>
                    {!!store?.rental_rules?.late_fee_enabled && (
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
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
                    {panelMode !== "simple" && (
                    <p className="mt-2 text-xs leading-relaxed text-zinc-500">
                      Essa regra ajuda a loja a deixar claro o custo por devolução fora do combinado.
                    </p>
                    )}
                    </div>

                    <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Regras adicionais</label>
                    <TextArea
                      value={store?.rental_rules?.additional_rules ?? ""}
                      onChange={(e) => handleStore({ rental_rules: { ...store.rental_rules, additional_rules: e.target.value } })}
                      placeholder="Escreva aqui regras e termos adicionais da sua loja. Ex: itens devem ser devolvidos limpos, montagem não inclusa, etc."
                      rows={8}
                      className="min-h-[260px] sm:min-h-[220px]"
                    />
                    {panelMode !== "simple" && (
                    <p className="text-xs text-zinc-400 mt-1">Estas regras serão exibidas para o cliente no momento da compra</p>
                    )}
                    </div>

                    <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-4">
                    <label className="block text-sm font-medium text-zinc-700 mb-1.5">Regras em caso de dano ou avaria</label>
                    <TextArea
                      value={store?.rental_rules?.damage_rules ?? ""}
                      onChange={(e) => handleStore({ rental_rules: { ...store.rental_rules, damage_rules: e.target.value } })}
                      placeholder="Explique como funciona a cobrança em caso de dano, perda ou avaria dos itens."
                      rows={8}
                      className="min-h-[260px] sm:min-h-[220px]"
                    />
                    {panelMode !== "simple" && (
                    <p className="text-xs text-zinc-400 mt-1">Este texto também será exibido para o cliente no checkout.</p>
                    )}
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end">
              <button
                type="submit"
                disabled={saving}
                className={submitButtonClass}
              >
                <Save size={14} />
                Salvar regras
              </button>
            </div>
          </form>
        );

      case "contato":
        return (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-zinc-200 p-4 sm:p-6">
            {panelMode !== "simple" && (
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-4 mb-5">
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-white p-2.5 text-emerald-600 shadow-sm">
                  <Share2 size={18} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-semibold text-zinc-900">Links da loja</h3>
                  <p className="mt-1 text-sm leading-6 text-zinc-600">
                    Esses links ficam salvos para consulta no painel. Eles não aparecem na página pública da loja por enquanto.
                  </p>
                </div>
              </div>
            </div>
            )}
            {panelMode !== "simple" && (
            <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Links salvos</span>
                <div className="mt-1 text-sm font-semibold text-zinc-900">
                  {[store?.social_links?.instagram, store?.social_links?.facebook, store?.social_links?.whatsapp, store?.social_links?.website].filter(Boolean).length}/4 salvos
                </div>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Salve só o que fizer sentido para consultar depois no painel.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Contato principal</span>
                <div className="mt-1 text-sm font-semibold text-zinc-900">
                  {store?.social_links?.whatsapp ? "WhatsApp salvo" : "WhatsApp ainda vazio"}
                </div>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Útil para lembrar qual número a loja usa quando precisa falar com cliente.
                </p>
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <span className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Referência rápida</span>
                <div className="mt-1 text-sm font-semibold text-zinc-900">
                  {store?.social_links?.instagram ? "Instagram salvo" : "Instagram ainda vazio"}
                </div>
                <p className="mt-1 text-xs leading-5 text-zinc-500">
                  Serve para você identificar a loja com mais facilidade no dia a dia.
                </p>
              </div>
            </div>
            )}
            <div className="grid grid-cols-1 gap-4">
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-1.5">
                  <Instagram size={16} className="text-pink-500" />
                  Instagram
                </label>
                <Input
                  value={store?.social_links?.instagram ?? ""}
                  onChange={(e) => handleStore({ social_links: { ...store.social_links, instagram: e.target.value } })}
                  placeholder={panelMode === "simple" ? "@sualoja" : "https://instagram.com/sualoja"}
                />
                {panelMode !== "simple" && (
                <p className="mt-2 text-xs text-zinc-500">Se quiser, salve aqui o perfil da loja para consultar depois.</p>
                )}
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-1.5">
                  <Facebook size={16} className="text-blue-600" />
                  Facebook
                </label>
                <Input
                  value={store?.social_links?.facebook ?? ""}
                  onChange={(e) => handleStore({ social_links: { ...store.social_links, facebook: e.target.value } })}
                  placeholder={panelMode === "simple" ? "facebook.com/sualoja" : "https://facebook.com/sualoja"}
                />
                {panelMode !== "simple" && (
                <p className="mt-2 text-xs text-zinc-500">Pode ficar vazio se a loja não usar Facebook ou se esse link não for útil para você.</p>
                )}
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-1.5">
                  <Phone size={16} className="text-green-500" />
                  WhatsApp
                </label>
                <Input
                  value={store?.social_links?.whatsapp ?? ""}
                  onChange={(e) => handleStore({ social_links: { ...store.social_links, whatsapp: e.target.value } })}
                  placeholder={panelMode === "simple" ? "Número principal" : "(11) 99999-9999"}
                />
                {panelMode !== "simple" && (
                <p className="mt-2 text-xs text-zinc-500">Salve o número principal da loja se quiser deixar esse contato fácil de achar.</p>
                )}
              </div>
              <div className="rounded-xl border border-zinc-200 bg-white p-4">
                <label className="flex items-center gap-2 text-sm font-medium text-zinc-700 mb-1.5">
                  <Globe size={16} className="text-zinc-500" />
                  Website
                </label>
                <Input
                  value={store?.social_links?.website ?? ""}
                  onChange={(e) => handleStore({ social_links: { ...store.social_links, website: e.target.value } })}
                  placeholder={panelMode === "simple" ? "sualoja.com.br" : "https://sualoja.com.br"}
                />
                {panelMode !== "simple" && (
                <p className="mt-2 text-xs text-zinc-500">Se a loja não tiver site próprio, esse campo pode ficar vazio.</p>
                )}
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row sm:justify-end">
              <button
                type="submit"
                disabled={saving}
                className={submitButtonClass}
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
      <PageHeader
        title="Minha Loja"
        description={
          panelMode === "simple"
            ? "Atualize o essencial da loja."
            : "Personalize sua loja no Fiestou"
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-6 lg:gap-8">
        <div className="min-w-0">
          {panelMode === "simple" ? (
            <div className="mb-6 space-y-4">
              <div className="rounded-2xl border border-zinc-200 bg-white px-4 py-3">
                <p className="text-sm font-semibold text-zinc-900">
                  {store?.title || "Sem nome definido"}
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {openDaysCount} dia(s) ativos · {deliveryRegionCount} região(ões) · {socialLinksCount} contato(s)
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;

                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                          isActive
                            ? "border-yellow-300 bg-yellow-50"
                            : "border-zinc-200 bg-white hover:border-yellow-200 hover:bg-yellow-50/40"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-zinc-100">
                            <Icon size={18} className={isActive ? "text-yellow-600" : "text-zinc-500"} />
                          </div>
                        </div>
                        <p className="mt-4 text-sm font-semibold text-zinc-900">{tab.label}</p>
                      </button>
                    );
                  })}
                </div>

                <div className="rounded-2xl border border-zinc-200 bg-white p-3">
                  {renderStorePreviewCard(true)}
                </div>
              </div>
            </div>
          ) : (
            <div className="mb-6 grid grid-cols-2 gap-2 sm:flex sm:w-full sm:min-w-0 sm:gap-1 sm:border-b sm:border-zinc-200">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`group flex min-w-0 items-center justify-start gap-2 px-3 py-3 text-sm font-medium rounded-xl border transition-colors sm:shrink-0 sm:justify-center sm:text-base sm:whitespace-nowrap sm:rounded-none sm:border-0 sm:border-b-2 ${
                      isActive
                        ? "border-yellow-300 bg-yellow-50 text-zinc-900 sm:bg-transparent sm:border-yellow-400"
                        : "border-zinc-200 text-zinc-500 hover:text-zinc-700"
                    }`}
                  >
                    <Icon
                      size={17}
                      className={
                        isActive
                          ? "text-yellow-600"
                          : "text-zinc-400 group-hover:text-yellow-600"
                      }
                    />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          )}

          <div className={`mb-6 lg:hidden ${panelMode === "simple" ? "hidden" : ""}`}>
            <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
              <button
                type="button"
                onClick={() => setMobilePreviewOpen((prev) => !prev)}
                className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-semibold text-zinc-900">
                    <Eye size={16} className="text-yellow-700" />
                    Preview da loja
                  </div>
                  <p className="mt-1 text-xs text-zinc-500">
                    Veja capa, foto, status e contato enquanto edita.
                  </p>
                </div>
                {mobilePreviewOpen ? (
                  <ChevronDown size={16} className="shrink-0 text-yellow-700" />
                ) : (
                  <ChevronRight size={16} className="shrink-0 text-yellow-700" />
                )}
              </button>

              {mobilePreviewOpen && (
                <div className="border-t border-zinc-100 p-3">
                  {renderStorePreviewCard(true)}
                </div>
              )}
            </div>
          </div>

          {saveFeedback && (
            <div
              className={`mb-4 rounded-lg border px-4 py-3 text-sm ${
                saveFeedback.type === "success"
                  ? "border-green-200 bg-green-50 text-green-700"
                  : saveFeedback.type === "warning"
                    ? "border-amber-200 bg-amber-50 text-amber-700"
                    : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              <div className="font-medium">{saveFeedback.text}</div>
              <div className="text-xs opacity-80 mt-1">
                Última atualização às{" "}
                {new Date(saveFeedback.at).toLocaleTimeString("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          )}

          {renderTabContent()}
        </div>

        <div className={`${panelMode === "simple" ? "hidden" : "hidden lg:block"}`}>
          {renderStorePreviewCard()}
        </div>
      </div>
    </PainelLayout>
  );
}
