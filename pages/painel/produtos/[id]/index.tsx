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
  iconColor = "bg-zinc-100 text-zinc-600",
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
    <div className={`bg-white rounded-xl border border-zinc-200 shadow-sm ${className}`}>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconColor}`}>
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
  const [data, setData] = useState({
    suggestions: true,
    status: 1,
  } as ProductType);

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
    if (!id) return;
    const request: any = await api.bridge({
      method: "get",
      url: `stores/${Cookies.get("fiestou.store")}/products/${id}`,
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
    setPlaceholder(false);
  };

  useEffect(() => {
    if (!id) {
      setLoadingContent(false);
      return;
    }

    setLoadingContent(false);
    getProduct();
  }, [id]);

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

      await axios.get(
        `/api/cache?route=/products/${request?.data?.slug ?? payload.slug}`
      );

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
          <div className="flex items-center gap-3">
            {isEditing && data?.slug && (
              <Link
                href={`/produtos/${data.slug}`}
                target="_blank"
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
              >
                <ExternalLink size={16} />
                Ver produto
              </Link>
            )}
            <Link
              href="/painel/produtos"
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-600 bg-white border border-zinc-200 rounded-lg hover:bg-zinc-50 transition-colors"
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
          <div className="grid gap-5">
            <SectionCard
              icon={<FileText size={18} />}
              title="Informações Básicas"
              iconColor="bg-cyan-50 text-cyan-600"
            >
              <NameAndDescription
                data={data}
                handleData={(updated) =>
                  setData((prev) => ({ ...prev, ...updated }))
                }
              />
              <div className="mt-4 pt-4 border-t border-zinc-100">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
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
                    className="text-sm border border-zinc-200 rounded-lg px-3 py-1.5 bg-white"
                  >
                    <option value={1}>Visível na loja</option>
                    <option value={-1}>Oculto</option>
                  </select>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              icon={<Image size={18} />}
              title="Imagens do Produto"
              iconColor="bg-yellow-50 text-yellow-600"
            >
              <ProductGallery data={data} handleData={handleData} />
            </SectionCard>

            <div className="grid lg:grid-cols-2 gap-5">
              <SectionCard
                icon={<DollarSign size={18} />}
                title="Preço"
                iconColor="bg-emerald-50 text-emerald-600"
              >
                <ProductPrice data={data} handleData={handleData} />
                <div className="mt-4">
                  <ProductCommercialType data={data} handleData={handleData} />
                </div>
              </SectionCard>

              <SectionCard
                icon={<Package size={18} />}
                title="Estoque"
                iconColor="bg-purple-50 text-purple-600"
              >
                <ProductStock
                  data={data}
                  handleData={(updated) =>
                    setData((prev) => ({ ...prev, ...updated }))
                  }
                />
              </SectionCard>
            </div>

            <SectionCard
              icon={<Layers size={18} />}
              title="Variações e Adicionais"
              iconColor="bg-blue-50 text-blue-600"
            >
              <Variable
                product={data}
                emitAttributes={(param) =>
                  handleData({ attributes: param })
                }
              />
            </SectionCard>

            <SectionCard
              icon={<Palette size={18} />}
              title="Características"
              iconColor="bg-orange-50 text-orange-600"
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

            <SectionCard
              icon={<Truck size={18} />}
              title="Logística e Transporte"
              iconColor="bg-slate-100 text-slate-600"
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

            <SectionCard
              icon={<Layers size={18} />}
              title="Períodos de Indisponibilidade"
              iconColor="bg-red-50 text-red-600"
            >
              <UnavailablePeriods data={data} handleData={handleData} productId={data.id} />
            </SectionCard>

            <SectionCard
              icon={<Link2 size={18} />}
              title="Venda Combinada"
              iconColor="bg-teal-50 text-teal-600"
            >
              <ProductBundle
                data={data}
                handleData={handleData}
                productsFind={productsFind}
                SearchProducts={SearchProducts}
              />
            </SectionCard>

            <div className="sticky bottom-0 z-20 bg-white border border-zinc-200 rounded-xl shadow-lg p-4 flex items-center justify-between">
              <Link
                href="/painel/produtos"
                className="px-6 py-2.5 text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={form.loading}
                className="inline-flex items-center gap-2 px-8 py-2.5 bg-yellow-500 hover:bg-yellow-600 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50"
              >
                {form.loading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Save size={16} />
                )}
                {form.loading ? "Salvando..." : "Salvar Produto"}
              </button>
            </div>
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
