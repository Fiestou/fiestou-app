import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import axios from "axios";
import {
  FileText,
  Image,
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

function SectionCard({
  icon,
  title,
  iconColor = "bg-amber-50 text-amber-600",
  children,
  className = "",
}: {
  icon: React.ReactNode;
  title: string;
  iconColor?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`min-w-0 bg-white rounded-xl border border-zinc-200 shadow-sm ${className}`}>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconColor}`}>
          {icon}
        </div>
        <h3 className="text-base font-semibold text-zinc-900">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

const formInitial = {
  sended: false,
  loading: false,
  dropdown: 0,
};

export default function CreateProduct() {
  const router = useRouter();
  const { id } = router.query;
  const api = new Api();

  const [loadingContent, setLoadingContent] = useState(true);
  const [subimitStatus, setSubimitStatus] = useState("");
  const [placeholder, setPlaceholder] = useState(true);
  const [form, setForm] = useState(formInitial);
  const [productsFind, setProductsFind] = useState<RelationType[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [wizardMode, setWizardMode] = useState(false);
  const [wizardStep, setWizardStep] = useState(0);
  const [data, setData] = useState({
    suggestions: true,
    status: 1,
  } as ProductType);

  const toPositiveNumber = (value: unknown): number | null => {
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
  };

  const routeProductId = toPositiveNumber(Array.isArray(id) ? id[0] : id);

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

  const getProduct = async () => {
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
    }
  };

  useEffect(() => {
    if (!routeProductId) {
      setPlaceholder(false);
      setLoadingContent(false);
      return;
    }

    setLoadingContent(false);
    getProduct();
  }, [routeProductId]);

  useEffect(() => {
    if (!router.isReady || typeof window === "undefined") {
      return;
    }

    const queryModeRaw = router.query.modo;
    const queryMode = Array.isArray(queryModeRaw)
      ? queryModeRaw[0]
      : queryModeRaw;
    const savedMode = localStorage.getItem("fiestou.product.editor.mode");
    const shouldUseWizard =
      String(queryMode || "").toLowerCase() === "assistido" ||
      String(queryMode || "").toLowerCase() === "wizard" ||
      savedMode === "wizard";

    setWizardMode(shouldUseWizard);
  }, [router.isReady, router.query.modo]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    localStorage.setItem(
      "fiestou.product.editor.mode",
      wizardMode ? "wizard" : "full"
    );
    if (!wizardMode) {
      setWizardStep(0);
    }
  }, [wizardMode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.loading) return;

    try {
      setFormValue({ loading: true });
      setSubimitStatus("register_content");

      const payload = buildPayload();

      const request: any = await api.bridge({
        method: "post",
        url: "products/register",
        data: payload,
      });

      if (!request?.success) {
        setSubimitStatus("register_failed");
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
    } catch (err) {
      console.error(err);
      setSubimitStatus("register_failed");
    }
  };

  const isEditing = !!data?.id;
  const pageTitle = isEditing ? `Editar: ${data?.title || "Produto"}` : "Novo Produto";

  const basicSection = (
    <SectionCard
      icon={<FileText size={20} />}
      title="Informações Básicas"
      iconColor="bg-amber-50 text-amber-600"
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
      icon={<Image size={20} />}
      title="Imagens do Produto"
      iconColor="bg-amber-50 text-amber-600"
    >
      <ProductGallery data={data} handleData={handleData} />
    </SectionCard>
  );

  const pricingSection = (
    <div className="grid lg:grid-cols-2 gap-5">
      <SectionCard
        icon={<DollarSign size={20} />}
        title="Preço"
        iconColor="bg-amber-50 text-amber-600"
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
        title="Variações e Adicionais"
        iconColor="bg-amber-50 text-amber-600"
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
      title="Características"
      iconColor="bg-amber-50 text-amber-600"
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
      title="Logística e Transporte"
      iconColor="bg-amber-50 text-amber-600"
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
      title="Períodos de Indisponibilidade"
      iconColor="bg-amber-50 text-amber-600"
    >
      <UnavailablePeriods data={data} handleData={handleData} productId={data.id} />
    </SectionCard>
  );

  const bundleSection = (
    <SectionCard
      icon={<Link2 size={20} />}
      title="Venda Combinada"
      iconColor="bg-amber-50 text-amber-600"
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
      title: "Informações Básicas",
      description: "Nome, descrição e visibilidade",
      content: basicSection,
    },
    {
      id: "gallery",
      title: "Imagens",
      description: "Galeria principal do produto",
      content: gallerySection,
    },
    {
      id: "pricing",
      title: "Preço e Estoque",
      description: "Defina valor e disponibilidade",
      content: pricingSection,
    },
    {
      id: "attributes",
      title: "Variações e Adicionais",
      description: "Monte grupos de escolha do cliente",
      content: attributesSection,
    },
    {
      id: "features",
      title: "Características",
      description: "Categorias e posicionamento",
      content: featuresSection,
    },
    {
      id: "logistics",
      title: "Logística",
      description: "Transporte e dimensões",
      content: logisticsSection,
    },
    {
      id: "unavailable",
      title: "Indisponibilidade",
      description: "Bloqueie períodos não disponíveis",
      content: unavailableSection,
    },
    {
      id: "bundle",
      title: "Venda Combinada",
      description: "Produtos relacionados para oferta",
      content: bundleSection,
    },
  ];

  const safeWizardStep = Math.min(wizardStep, productSections.length - 1);
  const currentWizard = productSections[safeWizardStep];
  const isFirstWizardStep = safeWizardStep === 0;
  const isLastWizardStep = safeWizardStep === productSections.length - 1;

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
        description={isEditing ? "Altere as informações do seu produto" : "Preencha os dados para criar um novo produto"}
        actions={
          <div className="flex flex-wrap items-center gap-3">
            {isEditing && (data?.slug || data?.id) && (
              <Link
                href={getPublicProductLink(data?.slug, data?.id)}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-base font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                <ExternalLink size={16} />
                Ver produto
              </Link>
            )}
            <Link
              href="/painel/produtos"
              className="inline-flex items-center gap-2 px-4 py-2.5 text-base font-semibold text-zinc-700 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
            >
              <ArrowLeft size={16} />
              Voltar
            </Link>
          </div>
        }
      />

      <form onSubmit={handleSubmit}>
        {placeholder ? (
          <div className="grid gap-4">
            {[1, 2, 3, 4, 5].map((key) => (
              <div
                key={key}
                className="bg-white rounded-xl border border-zinc-200 animate-pulse h-32"
              />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 min-w-0">
            <div className="min-w-0 bg-white border border-zinc-200 rounded-xl p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-zinc-900">
                    Modo de cadastro
                  </p>
                  <p className="text-sm text-zinc-600">
                    Use o modo completo ou o assistente guiado para preencher etapa por etapa.
                  </p>
                </div>
                <div className="grid w-full sm:w-auto grid-cols-1 sm:grid-cols-2 rounded-xl border border-zinc-200 p-1 bg-zinc-50 gap-1 min-w-0">
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
            </div>

            {wizardMode ? (
              <>
                <div className="min-w-0 bg-white border border-zinc-200 rounded-xl p-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-yellow-700">
                        Etapa {safeWizardStep + 1} de {productSections.length}
                      </p>
                      <h3 className="text-lg font-semibold text-zinc-900">
                        {currentWizard.title}
                      </h3>
                      <p className="text-sm text-zinc-600">{currentWizard.description}</p>
                    </div>
                  </div>
                  <div className="mt-3 h-2 bg-zinc-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-yellow-400 transition-all"
                      style={{
                        width: `${((safeWizardStep + 1) / productSections.length) * 100}%`,
                      }}
                    />
                  </div>
                  <div className="mt-3 flex gap-2 overflow-x-auto pb-1 max-w-full min-w-0">
                    {productSections.map((section, index) => (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => setWizardStep(index)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-semibold whitespace-nowrap border transition-colors ${
                          index === safeWizardStep
                            ? "bg-yellow-50 border-yellow-300 text-yellow-800"
                            : "bg-white border-zinc-200 text-zinc-600 hover:text-zinc-900"
                        }`}
                      >
                        {index + 1}. {section.title}
                      </button>
                    ))}
                  </div>
                </div>

                {currentWizard.content}

                <div className="z-20 min-w-0 bg-white border border-zinc-200 rounded-xl shadow-lg p-4 flex flex-wrap items-center justify-between gap-3 md:sticky md:bottom-4">
                  <button
                    type="button"
                    onClick={() =>
                      setWizardStep((prev) => Math.max(0, prev - 1))
                    }
                    disabled={isFirstWizardStep}
                    className="px-5 py-2.5 text-sm font-semibold text-zinc-700 border border-zinc-200 rounded-lg hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Etapa anterior
                  </button>

                  <div className="flex items-center gap-2 ml-auto">
                    {!isLastWizardStep ? (
                      <button
                        type="button"
                        onClick={() =>
                          setWizardStep((prev) =>
                            Math.min(productSections.length - 1, prev + 1)
                          )
                        }
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-semibold text-sm rounded-lg transition-colors"
                      >
                        Próxima etapa
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={form.loading}
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
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

                <div className="z-20 min-w-0 bg-white border border-zinc-200 rounded-xl shadow-lg p-4 flex flex-wrap items-center justify-between gap-3 md:sticky md:bottom-4">
                  <Link
                    href="/painel/produtos"
                    className="px-6 py-2.5 text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    disabled={form.loading}
                    className="inline-flex items-center gap-2 px-8 py-2.5 bg-yellow-400 hover:bg-yellow-500 text-zinc-900 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
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
                <div className="text-red-500 text-sm">Tente novamente</div>
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
