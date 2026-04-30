import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import axios from "axios";
import {
  FileText,
  Image as ImageIconLucide,
  DollarSign,
  Package,
  Layers,
  Palette,
  Truck,
  Link2,
  ArrowLeft,
  ExternalLink,
  Loader2,
  CheckCircle2,
  Save,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

import Api from "@/src/services/api";
import { ProductType } from "@/src/models/product";
import { RelationType } from "@/src/models/relation";
import { Variable } from "@/src/components/pages/painel/produtos/produto";
import { getStore } from "@/src/contexts/AuthContext";
import CategorieCreateProdutct from "@/src/components/common/createProduct/categorieCreateProdutct";
import PblalvoCreateProdutct from "@/src/components/common/createProduct/PblalvoCreateProdutct ";

import NameAndDescription from "../components/name-and-description/NameAndDescriptionProps";
import ProductGallery from "../components/product-image/ProductGalleryProps";
import ProductPrice from "../components/product-price/ProductPrice";
import ProductCommercialType from "../components/product-type/ProductType";
import ProductStock from "../components/product-stock/ProductStock";
import UnavailablePeriods from "../components/unavailable-periods/UnavailablePeriods";
import ProductDimensions from "../components/product-dimensions/ProductDimensions";
import ProductFeatures from "../components/product-features/ProductFeatures";
import TransportSection from "../components/transport-section/TransportSection";
import ProductBundle from "@/src/components/pages/painel/produtos/product-bundle/ProductBundle";
import { PainelLayout, PageHeader } from "@/src/components/painel";
import usePainelPageMode from "@/src/components/painel/usePainelPageMode";

function SectionCard({
  icon,
  title,
  iconColor = "bg-amber-50 text-amber-600",
  children,
  className = "",
  collapsible = false,
  open = true,
  onToggle,
  summary,
}: {
  icon: React.ReactNode;
  title: string;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
  collapsible?: boolean;
  open?: boolean;
  onToggle?: () => void;
  summary?: string;
}) {
  return (
    <div className={`min-w-0 w-full max-w-full bg-white rounded-2xl border border-zinc-200 shadow-sm ${className}`}>
      {collapsible ? (
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left sm:px-5 sm:py-4"
        >
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${iconColor}`}
          >
            {icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-semibold text-zinc-900 sm:text-base">
              {title}
            </h3>
            {!!summary && (
              <p className="mt-1 text-xs leading-relaxed text-zinc-500 sm:text-sm">
                {summary}
              </p>
            )}
          </div>
          <div className="shrink-0 text-zinc-400">
            {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </div>
        </button>
      ) : (
        <div className="flex items-center gap-3 border-b border-zinc-100 px-4 py-3.5 sm:px-5 sm:py-4">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconColor}`}
          >
            {icon}
          </div>
          <h3 className="text-sm font-semibold text-zinc-900 sm:text-base">
            {title}
          </h3>
        </div>
      )}
      {(!collapsible || open) && (
        <div className={collapsible ? "border-t border-zinc-100 p-4 sm:p-5" : "p-4 sm:p-5"}>
          {children}
        </div>
      )}
    </div>
  );
}

const formInitial = {
  sended: false,
  loading: false,
  dropdown: 0,
};

const REQUIRED_PRODUCT_SECTION_IDS = ["basic", "gallery", "pricing"] as const;

export default function CreateProduct() {
  const router = useRouter();
  const { id } = router.query;
  const api = useMemo(() => new Api(), []);
  const panelMode = usePainelPageMode();

  const [loadingContent, setLoadingContent] = useState(true);
  const [subimitStatus, setSubimitStatus] = useState("");
  const [placeholder, setPlaceholder] = useState(true);
  const [form, setForm] = useState(formInitial);
  const [submitError, setSubmitError] = useState("");
  const [productsFind, setProductsFind] = useState<RelationType[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [wizardMode, setWizardMode] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [editorModeReady, setEditorModeReady] = useState(false);
  const [mobileViewport, setMobileViewport] = useState(false);
  const [mobileFullSection, setMobileFullSection] = useState("basic");
  const [data, setData] = useState({
    suggestions: true,
    fragility: "no",
    status: 1,
  } as ProductType);

  const toPositiveNumber = (value: unknown): number | null => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const routeProductId = toPositiveNumber(Array.isArray(id) ? id[0] : id);
  const isNewProduct = !routeProductId;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(max-width: 767px)");
    const syncViewport = () => setMobileViewport(media.matches);

    syncViewport();

    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", syncViewport);
      return () => media.removeEventListener("change", syncViewport);
    }

    media.addListener(syncViewport);
    return () => media.removeListener(syncViewport);
  }, []);

  const getPublicProductLink = (slug?: string, productId?: number | null) => {
    const safeSlug = (slug || "").toString().trim();
    const safeId = toPositiveNumber(productId);

    if (safeSlug && safeId) return `/produtos/${safeSlug}-${safeId}`;
    if (safeId) return `/produtos/${safeId}`;
    if (safeSlug) return `/produtos/${safeSlug}`;
    return "/produtos";
  };

  const revalidateProductCache = async (slug?: string, productId?: number | null) => {
    if (process.env.NODE_ENV !== "production") {
      return;
    }

    const safeSlug = (slug || "").toString().trim();
    const safeId = toPositiveNumber(productId);

    const routes = new Set<string>(["/", "/produtos", "/produtos/pagina/1"]);

    if (safeSlug) {
      routes.add(`/produtos/${safeSlug}`);
    }

    if (safeId) {
      routes.add(`/produtos/${safeId}`);
      routes.add(`/produtos/${safeSlug ? `${safeSlug}-${safeId}` : safeId}`);
    }

    await Promise.allSettled(
      Array.from(routes).map((route) =>
        axios.get("/api/cache/", {
          params: { route },
        })
      )
    );
  };

  const parseRealMoneyNumber = (value: string): number => {
    if (!value) return 0;
    const cleaned = value.replace(/[^\d.,]/g, "");
    const withDotReplaced = cleaned.replace(/\./g, "");
    const final = withDotReplaced.replace(",", ".");
    return parseFloat(final) || 0;
  };

  const formatRealMoney = (value: string): string => {
    const numValue = parseRealMoneyNumber(value);
    return numValue.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const setFormValue = (value: any) =>
    setForm((prev) => ({
      ...prev,
      ...value,
    }));

  const coerceIds = (raw: any): string[] => {
    if (raw == null) return [];
    let arr: any[] = Array.isArray(raw)
      ? raw
      : typeof raw === "string"
      ? raw.split(/[|,]/g)
      : [raw];

    const out: string[] = [];
    const seen = new Set<string>();

    for (const v of arr) {
      const idRaw =
        v && typeof v === "object"
          ? v.id ?? v.value ?? v.key ?? v.ID ?? v.Id
          : v;
      if (idRaw == null) continue;
      const s = String(idRaw).trim();
      if (!s || s === "undefined" || s === "null") continue;
      if (!seen.has(s)) {
        seen.add(s);
        out.push(s);
      }
    }
    return out;
  };

  const handleData = useCallback((value: Record<string, any>) => {
    setSubmitError("");
    setData((prev) => {
      if (!value || typeof value !== "object" || Array.isArray(value))
        return prev;

      let next = { ...prev };

      if ("category" in value) {
        const incoming = coerceIds(value.category);
        if (incoming.length) {
          const prevCat = coerceIds(prev.category ?? []);
          next.category = Array.from(new Set([...prevCat, ...incoming]));
        }
      }

      const { category: _ignored, ...rest } = value;
      next = { ...next, ...rest };

      return JSON.stringify(prev) === JSON.stringify(next) ? prev : next;
    });
  }, []);

  const sanitize = (obj: Record<string, any>) => {
    const out: Record<string, any> = {};
    Object.entries(obj).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (typeof v === "string") {
        const t = v.trim();
        if (t === "") return;
        out[k] = t;
      } else {
        out[k] = v;
      }
    });
    return out;
  };

  const buildPayload = () => {
    const categoryPipe = coerceIds(data.category ?? []).join("|");
    const combinationIds = Array.isArray(data.combinations)
      ? data.combinations.map((c: any) => Number(c?.id)).filter(Boolean)
      : [];

    const payload: any = {
      ...data,
      attributes: data.attributes,
      category: categoryPipe,
      combinations: combinationIds,
      suggestions: data.suggestions ? 1 : 0,
      status: data?.status ?? 1,
    };

    if (data.id) payload.id = Number(data.id);
    if (data.store) payload.store = Number(data.store);

    return sanitize(payload);
  };

  const SearchProducts = async (search: string): Promise<any[]> => {
    if (search.length >= 3) {
      const request: any = await api.request({
        method: "get",
        url: "request/products",
        data: {
          store: Cookies.get("fiestou.store"),
          busca: search,
          limit: 100,
        },
      });

      if (request.response && !!request?.data.length) {
        const handle = request?.data?.map((item: any) => ({
          id: item.id,
          slug: item.slug,
          image: [],
          title: item.title,
        }));
        setProductsFind(handle);
        return handle;
      }
    }
    return [];
  };

  const getProduct = useCallback(async () => {
    if (!routeProductId) return;
    try {
      const request: any = await api.bridge({
        method: "get",
        url: `stores/${Cookies.get("fiestou.store")}/products/${routeProductId}`,
      });

      let handle = request.data ?? {};
      handle = {
        ...handle,
        assembly: handle.assembly ?? "on",
        store: getStore(),
      };

      const suggestions =
        handle.suggestions == null
          ? true
          : handle.suggestions === 1 ||
            handle.suggestions === "1" ||
            handle.suggestions === true ||
            handle.suggestions === "true";

      setData({ ...handle, color: handle.color, suggestions });

      setColors(
        handle?.color?.split
          ? handle.color.split("|")
          : handle?.color
          ? [handle.color]
          : []
      );
    } finally {
      setPlaceholder(false);
      setLoadingContent(false);
    }
  }, [api, routeProductId]);

  useEffect(() => {
    if (!routeProductId) {
      setPlaceholder(false);
      setLoadingContent(false);
      return;
    }

    getProduct();
  }, [getProduct, routeProductId]);

  useEffect(() => {
    if (!router.isReady || typeof window === "undefined") {
      return;
    }

    const queryModeRaw = router.query.modo;
    const queryMode = Array.isArray(queryModeRaw)
      ? queryModeRaw[0]
      : queryModeRaw;
    const savedMode = localStorage.getItem("fiestou.product.editor.mode");
    const queryModeValue = String(queryMode || "").toLowerCase();
    const isMobileViewport = window.matchMedia("(max-width: 1023px)").matches;
    const shouldUseWizard =
      queryModeValue === "assistido" ||
      queryModeValue === "wizard" ||
      ((queryModeValue !== "completo" && queryModeValue !== "full") &&
        panelMode === "simple") ||
      (queryModeValue !== "completo" &&
        queryModeValue !== "full" &&
        (isMobileViewport
          ? (isNewProduct || savedMode !== "full")
          : savedMode === "wizard"));

    setWizardMode(shouldUseWizard);
    setEditorModeReady(true);
  }, [isNewProduct, panelMode, router.isReady, router.query.modo]);

  useEffect(() => {
    if (typeof window === "undefined" || !editorModeReady) {
      return;
    }
    localStorage.setItem(
      "fiestou.product.editor.mode",
      wizardMode ? "wizard" : "full"
    );
    if (!wizardMode) {
      setWizardStep(0);
    }
  }, [editorModeReady, wizardMode]);

  useEffect(() => {
    if (!mobileViewport || wizardMode) {
      return;
    }
    setMobileFullSection("basic");
  }, [mobileViewport, wizardMode]);

  const isMobileAccordion = mobileViewport && !wizardMode;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.loading) return;

    try {
      const payload = buildPayload();
      const productTitle = String(payload?.title || "").trim();

      setSubmitError("");

      if (!productTitle) {
        setSubimitStatus("register_failed");
        setSubmitError("Preencha o nome do produto para salvar.");
        if (wizardMode) {
          setWizardStep(0);
        } else {
          setMobileFullSection("basic");
        }
        return;
      }

      setFormValue({ loading: true });
      setSubimitStatus("register_content");

      const request: any = await api.bridge({
        method: "post",
        url: "products/register",
        data: payload,
      });

      if (!request?.success) {
        setSubimitStatus("register_failed");
        setFormValue({ loading: false });
        const titleError =
          request?.errors?.title?.[0] ||
          request?.data?.errors?.title?.[0] ||
          null;
        setSubmitError(
          titleError
            ? "Preencha o nome do produto para salvar."
            : request?.message || "Não foi possível salvar o produto agora."
        );
        if (titleError) {
          if (wizardMode) {
            setWizardStep(0);
          } else {
            setMobileFullSection("basic");
          }
        }
        return;
      }

      setFormValue({ sended: request.response });
      setSubimitStatus("clean_cache");

      const savedProduct = request?.product ?? request?.data ?? {};
      const productId = toPositiveNumber(savedProduct?.id ?? payload?.id ?? data?.id);
      const productSlug = (
        savedProduct?.slug ??
        payload?.slug ??
        data?.slug ??
        ""
      )
        .toString()
        .trim();

      await revalidateProductCache(productSlug, productId);

      setSubimitStatus("register_complete");
      setLoadingContent(false);
      setTimeout(() => {
        router.push({ pathname: "/painel/produtos" });
      }, 500);
    } catch (err: any) {
      console.error(err);
      setSubimitStatus("register_failed");
      setFormValue({ loading: false });
      setSubmitError(err?.message || "Não foi possível salvar o produto agora.");
    }
  };

  const isEditing = !!data?.id;
  const pageTitle = isEditing ? `Editar: ${data?.title || "Produto"}` : "Novo Produto";

  const basicSection = (
    <SectionCard
      icon={<FileText size={20} />}
      title="Informações principais"
      iconColor="bg-amber-50 text-amber-600"
      collapsible={isMobileAccordion}
      open={!isMobileAccordion || mobileFullSection === "basic"}
      onToggle={() =>
        setMobileFullSection((prev) => (prev === "basic" ? "" : "basic"))
      }
      summary={panelMode === "simple" ? undefined : "Nome, descrição e visibilidade."}
    >
      <NameAndDescription
        data={data}
        handleData={(updated) =>
          setData((prev) => ({ ...prev, ...updated }))
        }
      />
      <div className="mt-4 pt-4 border-t border-zinc-100">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-base font-semibold text-zinc-700">
            {data?.status === 1 || data?.status === undefined ? (
              <Eye size={16} className="text-emerald-500" />
            ) : (
              <EyeOff size={16} className="text-zinc-400" />
            )}
            Visibilidade
          </div>
          <select
            value={data?.status ?? 1}
            onChange={(e) =>
              setData((prev) => ({ ...prev, status: Number(e.target.value) }))
            }
            className="text-base border border-zinc-200 rounded-lg px-3 py-2 bg-white"
          >
            <option value={1}>Visível na loja</option>
            <option value={-1}>Oculto</option>
          </select>
        </div>
      </div>
    </SectionCard>
  );

  const gallerySection = (
    <SectionCard
      icon={<ImageIconLucide size={20} />}
      title="Imagens do produto"
      iconColor="bg-amber-50 text-amber-600"
      collapsible={isMobileAccordion}
      open={!isMobileAccordion || mobileFullSection === "gallery"}
      onToggle={() =>
        setMobileFullSection((prev) => (prev === "gallery" ? "" : "gallery"))
      }
      summary={panelMode === "simple" ? undefined : "Galeria principal e fotos complementares."}
    >
      <ProductGallery data={data} handleData={handleData} />
    </SectionCard>
  );

  const pricingSection = (
    <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
      <SectionCard
        icon={<DollarSign size={20} />}
        title="Preço"
        iconColor="bg-amber-50 text-amber-600"
        collapsible={isMobileAccordion}
        open={!isMobileAccordion || mobileFullSection === "pricing"}
        onToggle={() =>
          setMobileFullSection((prev) => (prev === "pricing" ? "" : "pricing"))
        }
        summary={panelMode === "simple" ? undefined : "Valor, promoção e tipo comercial."}
      >
        <ProductPrice data={data} handleData={handleData} />
        <div className="mt-4">
          <ProductCommercialType data={data} handleData={handleData} />
        </div>
      </SectionCard>

      <SectionCard
        icon={<Package size={20} />}
        title="Estoque"
        iconColor="bg-amber-50 text-amber-600"
        collapsible={isMobileAccordion}
        open={!isMobileAccordion || mobileFullSection === "stock"}
        onToggle={() =>
          setMobileFullSection((prev) => (prev === "stock" ? "" : "stock"))
        }
        summary={panelMode === "simple" ? undefined : "Disponibilidade e quantidade."}
      >
        <ProductStock
          data={data}
          handleData={(updated) =>
            setData((prev) => ({ ...prev, ...updated }))
          }
        />
      </SectionCard>
    </div>
  );

  const attributesSection = (
    <div id="variacoes-section">
      <SectionCard
        icon={<Layers size={20} />}
        title="Personalizações e extras"
        iconColor="bg-amber-50 text-amber-600"
        collapsible={isMobileAccordion}
        open={!isMobileAccordion || mobileFullSection === "attributes"}
        onToggle={() =>
          setMobileFullSection((prev) =>
            prev === "attributes" ? "" : "attributes"
          )
        }
        summary={panelMode === "simple" ? undefined : "Opções, extras e escolhas do cliente."}
      >
        <Variable
          product={data}
          emitAttributes={(param) =>
            handleData({ attributes: param })
          }
        />
      </SectionCard>
    </div>
  );

  const featuresSection = (
    <SectionCard
      icon={<Palette size={20} />}
      title="Categorias e vitrine"
      iconColor="bg-amber-50 text-amber-600"
      collapsible={isMobileAccordion}
      open={!isMobileAccordion || mobileFullSection === "features"}
      onToggle={() =>
        setMobileFullSection((prev) => (prev === "features" ? "" : "features"))
      }
      summary={panelMode === "simple" ? undefined : "Público, categorias e tags."}
    >
      <ProductFeatures data={data} handleData={handleData} />

      <div className="mt-6 pt-4 border-t border-zinc-100">
        <PblalvoCreateProdutct
          value={coerceIds(data?.category ?? [])}
          onToggle={(id: number, selected: boolean) => {
            setData((prev) => {
              const prevCat = coerceIds(prev?.category ?? []);
              const s = new Set(prevCat.map(String));
              selected ? s.add(String(id)) : s.delete(String(id));
              return { ...prev, category: Array.from(s) };
            });
          }}
        />
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-100">
        <CategorieCreateProdutct
          value={data?.category ?? []}
          onRemove={(id) =>
            setData((prev) => {
              const curr = (
                Array.isArray(prev?.category) ? prev.category : []
              )
                .map(Number)
                .filter(Number.isFinite);
              const next = curr.filter((x) => x !== Number(id));
              return curr.length === next.length
                ? prev
                : { ...prev, category: next };
            })
          }
          onChange={(ids) =>
            setData((prev) => ({ ...prev, category: ids }))
          }
        />
      </div>
    </SectionCard>
  );

  const logisticsSection = (
    <SectionCard
      icon={<Truck size={20} />}
      title="Entrega, transporte e medidas"
      iconColor="bg-amber-50 text-amber-600"
      collapsible={isMobileAccordion}
      open={!isMobileAccordion || mobileFullSection === "logistics"}
      onToggle={() =>
        setMobileFullSection((prev) =>
          prev === "logistics" ? "" : "logistics"
        )
      }
      summary={panelMode === "simple" ? undefined : "Dimensões, montagem e transporte."}
    >
      <ProductDimensions data={data} handleData={handleData} />
      <div className="mt-4">
        <TransportSection
          data={data}
          handleData={handleData}
          realMoneyNumber={formatRealMoney}
        />
      </div>
    </SectionCard>
  );

  const unavailableSection = (
    <SectionCard
      icon={<Layers size={20} />}
      title="Datas indisponíveis"
      iconColor="bg-amber-50 text-amber-600"
      collapsible={isMobileAccordion}
      open={!isMobileAccordion || mobileFullSection === "unavailable"}
      onToggle={() =>
        setMobileFullSection((prev) =>
          prev === "unavailable" ? "" : "unavailable"
        )
      }
      summary={panelMode === "simple" ? undefined : "Bloqueie datas em que o produto não pode ser reservado."}
    >
      <UnavailablePeriods data={data} handleData={handleData} productId={data.id} />
    </SectionCard>
  );

  const bundleSection = (
    <SectionCard
      icon={<Link2 size={20} />}
      title="Produtos para vender junto"
      iconColor="bg-amber-50 text-amber-600"
      collapsible={isMobileAccordion}
      open={!isMobileAccordion || mobileFullSection === "bundle"}
      onToggle={() =>
        setMobileFullSection((prev) => (prev === "bundle" ? "" : "bundle"))
      }
      summary={panelMode === "simple" ? undefined : "Sugestões relacionadas para aumentar o pedido."}
    >
      <ProductBundle
        data={data}
        handleData={handleData}
        productsFind={productsFind}
        SearchProducts={SearchProducts}
      />
    </SectionCard>
  );

  const productSections = [
    {
      id: "basic",
      title: "Informações principais",
      description: "Nome, descrição e visibilidade",
      required: true,
      content: basicSection,
    },
    {
      id: "gallery",
      title: "Imagens",
      description: "Galeria principal do produto",
      required: true,
      content: gallerySection,
    },
    {
      id: "pricing",
      title: "Preço e Estoque",
      description: "Defina valor e disponibilidade",
      required: true,
      content: pricingSection,
    },
    {
      id: "attributes",
      title: "Personalizações e extras",
      description: "Opções, extras e escolhas do cliente",
      required: false,
      content: attributesSection,
    },
    {
      id: "features",
      title: "Categorias e vitrine",
      description: "Público, categorias e tags",
      required: false,
      content: featuresSection,
    },
    {
      id: "logistics",
      title: "Entrega, transporte e medidas",
      description: "Dimensões, montagem e transporte",
      required: false,
      content: logisticsSection,
    },
    {
      id: "unavailable",
      title: "Datas indisponíveis",
      description: "Bloqueie datas sem atendimento",
      required: false,
      content: unavailableSection,
    },
    {
      id: "bundle",
      title: "Produtos para vender junto",
      description: "Sugestões relacionadas para aumentar o pedido",
      required: false,
      content: bundleSection,
    },
  ];

  const safeWizardStep = Math.min(wizardStep, productSections.length - 1);
  const currentWizard = productSections[safeWizardStep];
  const requiredSections = productSections.filter((section) => section.required);
  const optionalSections = productSections.filter((section) => !section.required);
  const firstOptionalSectionIndex = productSections.findIndex(
    (section) => !section.required,
  );
  const isOptionalWizardStep = !currentWizard.required;
  const requiredWizardStepPosition = Math.max(
    0,
    requiredSections.findIndex((section) => section.id === currentWizard.id) + 1,
  );
  const essentialProgressPercent = isOptionalWizardStep
    ? 100
    : Math.max(
        0,
        (requiredWizardStepPosition / REQUIRED_PRODUCT_SECTION_IDS.length) * 100,
      );
  const isFirstWizardStep = safeWizardStep === 0;
  const isLastWizardStep = safeWizardStep === productSections.length - 1;
  const editorSummaryCards = [
    {
      label: "Essencial",
      value: `${requiredSections.length} etapa(s)`,
    },
    {
      label: "Opcional",
      value: `${optionalSections.length} ajuste(s)`,
    },
    {
      label: "Modo",
      value: wizardMode ? "Assistente" : "Completo",
    },
  ];

  if (loadingContent) {
    return (
      <PainelLayout>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="animate-spin text-zinc-400" size={32} />
        </div>
      </PainelLayout>
    );
  }

  return (
    <PainelLayout>
      <PageHeader
        title={pageTitle}
        description={isEditing ? "Edite o produto." : "Preencha o essencial."}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {isEditing && (data?.slug || data?.id) && (
              <Link
                href={getPublicProductLink(data?.slug, data?.id)}
                target="_blank"
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2.5 text-sm sm:text-base font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                <ExternalLink size={16} />
                Ver produto
              </Link>
            )}
            <Link
              href="/painel/produtos"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 py-2.5 text-sm sm:text-base font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar
            </Link>
          </div>
        }
      />

      {panelMode === "simple" && (
        <div className="mb-5 space-y-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {editorSummaryCards.map((card) => (
                <div
                  key={card.label}
                  className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3"
                >
                  <p className="text-xs font-medium text-zinc-400">{card.label}</p>
                  <p className="mt-1 text-sm font-semibold text-zinc-900">
                    {card.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {requiredSections.map((section, index) => (
              <button
                key={`simple-required-section-${section.id}`}
                type="button"
                onClick={() => {
                  setWizardMode(true);
                  setWizardStep(index);
                }}
                className={`rounded-2xl border px-4 py-4 text-left transition-colors ${
                  currentWizard.id === section.id && wizardMode
                    ? "border-yellow-300 bg-yellow-50"
                    : "border-zinc-200 bg-white hover:border-yellow-200 hover:bg-yellow-50/40"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-zinc-900">
                    {section.title}
                  </p>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                    Essencial
                  </span>
                </div>
              </button>
            ))}

            {optionalSections.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setWizardMode(true);
                  setWizardStep(Math.max(firstOptionalSectionIndex, 0));
                }}
                className="rounded-2xl border border-zinc-200 bg-white px-4 py-4 text-left transition-colors hover:border-yellow-200 hover:bg-yellow-50/40"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-zinc-900">
                    Ajustes opcionais
                  </p>
                  <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] font-semibold text-zinc-600">
                    {optionalSections.length}
                  </span>
                </div>
              </button>
            )}
          </div>

          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-emerald-900">
              Salve com nome, imagens e preço.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="min-w-0 w-full">
        {placeholder ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3, 4, 5].map((key) => (
              <div
                key={key}
                className="bg-white rounded-xl border border-zinc-200 animate-pulse h-32"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 min-w-0 w-full">
            <div className="min-w-0 w-full max-w-full bg-white border border-zinc-200 rounded-xl p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-zinc-900">
                    {panelMode === "simple" ? "Modo" : "Modo de edição"}
                  </p>
                  {panelMode !== "simple" && (
                    <p className="text-sm text-zinc-600">
                      Use o assistente ou abra tudo de uma vez.
                    </p>
                  )}
                </div>
                <div className="grid w-full grid-cols-2 rounded-xl border border-zinc-200 bg-zinc-50 p-1 min-w-0 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setWizardMode(false)}
                    className={`w-full px-3 py-2 rounded-lg text-sm leading-tight font-semibold transition-colors ${
                      !wizardMode
                        ? "bg-white text-zinc-900 shadow-sm border border-zinc-200"
                        : "text-zinc-600 hover:text-zinc-800"
                    }`}
                  >
                    Modo completo
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setWizardMode(true);
                      setWizardStep(0);
                    }}
                    className={`w-full px-3 py-2 rounded-lg text-sm leading-tight font-semibold transition-colors ${
                      wizardMode
                        ? "bg-yellow-100 text-yellow-800 shadow-sm border border-yellow-300"
                        : "text-zinc-600 hover:text-zinc-800"
                    }`}
                  >
                    Assistente guiado
                  </button>
                </div>
              </div>
              {panelMode !== "simple" && (
                <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                  <p className="text-sm font-semibold text-emerald-900">
                    Nome, imagens e preço já bastam para salvar.
                  </p>
                </div>
              )}
            </div>

            {!!submitError && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {submitError}
              </div>
            )}

            {wizardMode ? (
              <>
                <div className="min-w-0 w-full max-w-full bg-white border border-zinc-200 rounded-xl p-4 sm:p-5">
                  {isOptionalWizardStep ? (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                          <CheckCircle2 size={22} />
                        </div>
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                            Cadastro essencial concluído
                          </p>
                          <h3 className="text-lg font-semibold text-zinc-900">
                            Produto pronto para salvar
                          </h3>
                          <p className="mt-1 text-sm text-zinc-600">
                            Se quiser, ajuste extras, categorias, entrega e agenda.
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-xl border border-zinc-200 bg-zinc-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Etapas essenciais concluídas
                        </p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                          {requiredSections.map((section) => (
                            <button
                              key={section.id}
                              type="button"
                              onClick={() =>
                                setWizardStep(
                                  productSections.findIndex((item) => item.id === section.id),
                                )
                              }
                              className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-white px-3 py-2 text-left text-sm font-medium text-zinc-800"
                            >
                              <CheckCircle2 size={16} className="text-emerald-600" />
                              <span>{section.title}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="mt-4">
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                          Ajustes opcionais
                        </p>
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {optionalSections.map((section) => {
                            const sectionIndex = productSections.findIndex(
                              (item) => item.id === section.id,
                            );
                            const isCurrent = section.id === currentWizard.id;

                            return (
                              <button
                                key={section.id}
                                type="button"
                                onClick={() => setWizardStep(sectionIndex)}
                                className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                                  isCurrent
                                    ? "border-yellow-300 bg-yellow-50"
                                    : "border-zinc-200 bg-white hover:border-zinc-300"
                                }`}
                              >
                                <div className="flex items-center justify-between gap-3">
                                  <div className="text-sm font-semibold text-zinc-900">
                                    {section.title}
                                  </div>
                                  <span
                                    className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                      isCurrent
                                        ? "bg-yellow-100 text-yellow-800"
                                        : "bg-zinc-100 text-zinc-600"
                                    }`}
                                  >
                                    {isCurrent ? "Aberto" : "Opcional"}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wider text-yellow-700">
                            Etapa essencial {requiredWizardStepPosition} de {requiredSections.length}
                          </p>
                          <h3 className="text-lg font-semibold text-zinc-900">
                            {currentWizard.title}
                          </h3>
                        </div>
                      </div>
                      <div className="mt-3 h-2 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-yellow-400 transition-all"
                          style={{ width: `${essentialProgressPercent}%` }}
                        />
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        {requiredSections.map((section, index) => {
                          const sectionIndex = productSections.findIndex(
                            (item) => item.id === section.id,
                          );
                          const isActive = section.id === currentWizard.id;
                          const isDone = index + 1 < requiredWizardStepPosition;

                          return (
                            <button
                              key={section.id}
                              type="button"
                              onClick={() => setWizardStep(sectionIndex)}
                              className={`rounded-xl border px-3 py-2 text-left text-sm font-semibold transition-colors ${
                                isActive
                                  ? "border-yellow-300 bg-yellow-50 text-yellow-800"
                                  : isDone
                                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                                  : "border-zinc-200 bg-white text-zinc-600"
                              }`}
                            >
                              {index + 1}. {section.title}
                            </button>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {currentWizard.content}

                <div className="sticky bottom-3 z-20 min-w-0 w-full max-w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-lg supports-[padding:max(0px)]:pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col-reverse sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setWizardStep((prev) => Math.max(0, prev - 1))
                    }
                    disabled={isFirstWizardStep}
                    className="w-full sm:w-auto px-5 py-2.5 text-sm font-semibold text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Etapa anterior
                  </button>

                  <div className="flex w-full sm:w-auto items-center gap-2 sm:ml-auto">
                    {isOptionalWizardStep ? (
                      <>
                        {!isLastWizardStep && (
                          <button
                            type="button"
                            onClick={() =>
                              setWizardStep((prev) =>
                                Math.min(productSections.length - 1, prev + 1)
                              )
                            }
                            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-2.5 border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-800 font-semibold text-sm rounded-lg transition-colors"
                          >
                            Próximo ajuste
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={form.loading}
                          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
                        >
                          {form.loading ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Save size={18} />
                          )}
                          {form.loading ? "Salvando..." : "Salvar produto"}
                        </button>
                      </>
                    ) : !isLastWizardStep ? (
                      <button
                        type="button"
                        onClick={() =>
                          setWizardStep((prev) =>
                            Math.min(productSections.length - 1, prev + 1)
                          )
                        }
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-semibold text-sm rounded-lg transition-colors"
                      >
                        {safeWizardStep === firstOptionalSectionIndex - 1
                          ? "Ver ajustes opcionais"
                          : "Próxima etapa"}
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={form.loading}
                        className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
                      >
                        {form.loading ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <Save size={18} />
                        )}
                        {form.loading ? "Salvando..." : "Salvar Produto"}
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <>
                {productSections.map((section) => (
                  <React.Fragment key={section.id}>{section.content}</React.Fragment>
                ))}

                <div className="sticky bottom-3 z-20 min-w-0 w-full max-w-full rounded-xl border border-zinc-200 bg-white p-4 shadow-lg supports-[padding:max(0px)]:pb-[max(1rem,env(safe-area-inset-bottom))] flex flex-col-reverse sm:flex-row sm:flex-wrap sm:items-center justify-between gap-3">
                  <Link
                    href="/painel/produtos"
                    className="w-full sm:w-auto px-6 py-2.5 text-center text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={form.loading}
                    className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
                  >
                    {form.loading ? (
                      <Loader2 size={18} className="animate-spin" />
                    ) : (
                      <Save size={18} />
                    )}
                    {form.loading ? "Salvando..." : "Salvar Produto"}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </form>

      {form.loading && (
        <div className="fixed inset-0 z-[100] bg-white/90 backdrop-blur-sm flex justify-center items-center">
          <div className="text-center space-y-4">
            <div className="text-lg font-medium text-zinc-800">
              {subimitStatus === "upload_images"
                ? "Enviando imagens..."
                : subimitStatus === "register_content"
                ? "Salvando produto..."
                : subimitStatus === "clean_cache"
                ? "Limpando cache..."
                : subimitStatus === "register_complete"
                ? "Salvo com sucesso!"
                : subimitStatus === "register_failed"
                ? "Erro ao salvar"
                : ""}
            </div>
            <div>
              {subimitStatus === "register_complete" ? (
                <CheckCircle2 size={40} className="text-emerald-500 mx-auto" />
              ) : subimitStatus === "register_failed" ? (
                <div className="text-red-500 text-sm">
                  {submitError || "Tente novamente"}
                </div>
              ) : (
                <Loader2 size={40} className="animate-spin text-yellow-500 mx-auto" />
              )}
            </div>
          </div>
        </div>
      )}
    </PainelLayout>
  );
}
