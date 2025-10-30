"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import axios from "axios";

import Template from "@/src/template";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import HelpCard from "@/src/components/common/HelpCard";
import { Button } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Api from "@/src/services/api";
import { ProductType } from "@/src/models/product";
import { RelationType } from "@/src/models/relation";
import { Variable } from "@/src/components/pages/painel/produtos/produto";
import { getStore } from "@/src/contexts/AuthContext";
import CategorieCreateProdutct from "@/src/components/common/createProduct/categorieCreateProdutct";

import NameAndDescription from "../components/name-and-description/NameAndDescriptionProps";
import ProductGallery from "../components/product-image/ProductGalleryProps";
import ProductPrice from "../components/product-price/ProductPrice";
import ProductCommercialType from "../components/product-type/ProductType";
import ProductStock from "../components/product-stock/ProductStock";
import UnavailablePeriods from "../components/unavailable-periods/UnavailablePeriods";
import ProductDimensions from "../components/product-dimensions/ProductDimensions";
import ProductFeatures from "../components/product-features/ProductFeatures";
import TransportSection from "../components/transport-section/TransportSection";
import VisibilitySection from "../components/visibility-section/VisibilitySection";
import PblalvoCreateProdutct from "@/src/components/common/createProduct/PblalvoCreateProdutct ";
import ProductBundle from "@/src/components/pages/painel/produtos/product-bundle/ProductBundle";

const formInitial = {
  sended: false,
  loading: false,
  dropdown: 0,
};

export default function CreateProduct() {
  const router = useRouter();
  const { id } = router.query;
  const api = new Api();

  const [content, setContent] = useState<any>({});
  const [loadingContent, setLoadingContent] = useState(true);
  const [subimitStatus, setSubimitStatus] = useState("");
  const [placeholder, setPlaceholder] = useState(true);
  const [form, setForm] = useState(formInitial);
  const [productsFind, setProductsFind] = useState<RelationType[]>([]);
  const [colors, setColors] = useState<string[]>([]);
  const [data, setData] = useState({ suggestions: true } as ProductType);
  const [product, setProduct] = useState({} as ProductType);

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

    return sanitize({
      ...data,
      category: categoryPipe,
      combinations: combinationIds,
      suggestions: data.suggestions ? 1 : 0,
    });
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

    setProduct({ ...handle, suggestions });
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

    (async () => {
      try {
        setLoadingContent(true);
        const request: any = await api.call({
          method: "post",
          url: "request/graph",
          data: [
            {
              model: "page",
              filter: [{ key: "slug", value: "product", compare: "=" }],
            },
          ],
        });

        const pages = request?.data?.query?.page ?? [];
        setContent(pages[0] ?? {});
      } catch (err) {
        console.error("Erro carregando conteúdo:", err);
      } finally {
        setLoadingContent(false);
      }
    })();

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

  if (loadingContent)
    return <div className="container-medium py-6">Carregando...</div>;

  return (
    <Template
      header={{ template: "painel", position: "solid" }}
      footer={{ template: "clean" }}
    >
      <section className="container-medium py-6 lg:py-12">
        <div className="flex justify-between pb-4">
          <Breadcrumbs
            links={[
              { url: "/painel", name: "Painel" },
              { url: "/painel/produtos", name: "Produtos" },
            ]}
          />
          {!!data?.id && (
            <Link
              href={`/produtos/${data.slug}`}
              target="_blank"
              className="flex items-center gap-2 font-semibold hover:text-zinc-950"
            >
              Acessar produto
              <Icon icon="fa-link" className="text-xs mt-1" />
            </Link>
          )}
        </div>

        <div className="flex items-center">
          <Link passHref href="/painel/produtos">
            <Icon
              icon="fa-long-arrow-left"
              className="mr-4 md:mr-6 text-2xl text-zinc-900"
            />
          </Link>
          <div className="font-title font-bold text-2xl md:text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900 w-full">
            {data.id ? "Editar produto" : "Novo produto"}
          </div>
        </div>
      </section>

      <section className="container-medium pb-12">
        <form onSubmit={handleSubmit} method="POST">
          <div className="grid lg:flex items-start gap-10 lg:gap-20">
            {placeholder ? (
              <div className="w-full grid gap-4 cursor-wait">
                {[1, 2, 3, 4, 5, 6].map((key) => (
                  <div
                    key={key}
                    className="bg-zinc-200 rounded-md animate-pulse py-8"
                  />
                ))}
              </div>
            ) : (
              <div className="w-full grid gap-8">
                <div className="grid gap-6">
                  <NameAndDescription
                    data={data}
                    handleData={(updated) =>
                      setData((prev) => ({ ...prev, ...updated }))
                    }
                  />
                  <ProductGallery data={data} handleData={handleData} />
                  <ProductPrice data={data} handleData={handleData} />
                  <ProductCommercialType data={data} handleData={handleData} />
                  <Variable
                    product={data}
                    emitAttributes={(param) =>
                      handleData({ attributes: param })
                    }
                  />
                  <ProductStock
                    data={data}
                    handleData={(updated) =>
                      setData((prev) => ({ ...prev, ...updated }))
                    }
                  />
                  <UnavailablePeriods data={data} handleData={handleData} />
                  <ProductDimensions data={data} handleData={handleData} />
                  <ProductFeatures data={data} handleData={handleData} />
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
                  <ProductBundle
                    data={data}
                    handleData={handleData}
                    productsFind={productsFind}
                    SearchProducts={SearchProducts}
                  />
                  <TransportSection
                    data={data}
                    handleData={handleData}
                    realMoneyNumber={formatRealMoney}
                  />
                  <VisibilitySection data={data} handleData={handleData} />
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-full ">
                    <Link
                      passHref
                      href="/painel/produtos/"
                      className="border border-red-500 py-4 px-[26px] rounded-[7px] bg-red-500 text-white hover:bg-red-600 transition duration-300"
                    >
                      Cancelar
                    </Link>
                  </div>
                  <div>
                    <Button loading={form.loading} className="px-10">
                      Salvar
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <div className="w-full md:max-w-[18rem] lg:max-w-[24rem]">
              <HelpCard list={content.help_list} />
            </div>
          </div>
        </form>
      </section>

      {form.loading && (
        <div className="fixed inset-0 bg-white flex justify-center items-center">
          <div className="grid text-center gap-4">
            <div className="text-zinc-900">
              {subimitStatus === "upload_images"
                ? "Enviando imagens..."
                : subimitStatus === "register_content"
                ? "Salvando produto..."
                : subimitStatus === "clean_cache"
                ? "Limpando cache..."
                : subimitStatus === "register_complete"
                ? "Salvo com sucesso!"
                : ""}
            </div>
            <div className="text-2xl">
              {subimitStatus === "register_complete" ? (
                <Icon icon="fa-check-circle" className="text-green-500" />
              ) : (
                <Icon
                  icon="fa-spinner-third"
                  className="animate-spin text-yellow-500"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </Template>
  );
}
