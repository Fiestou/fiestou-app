import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Template from "@/src/template";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ProductType } from "@/src/models/product";
import Api from "@/src/services/api";
import { NextApiRequest, NextApiResponse } from "next";
import { Button, Label, Select, TextArea } from "@/src/components/ui/form";
import {
  decimalNumber,
  handleTags,
  justNumber,
  realMoneyNumber,
  slugfy,
} from "@/src/helper";
import HelpCard from "@/src/components/common/HelpCard";
import Cookies from "js-cookie";
import Colors from "@/src/components/ui/form/ColorsUI";
import Options from "@/src/components/ui/form/OptionsUI";
import { RelationType } from "@/src/models/relation";
import { Variable } from "@/src/components/pages/painel/produtos/produto";
import router from "next/router";
import CategorieCreateProdutct from "@/src/components/common/createProduct/categorieCreateProdutct";
import { getStore, getUser } from "@/src/contexts/AuthContext";
import axios from "axios";
import Gallery from "@/src/components/pages/painel/produtos/produto/Gallery";
import UnavailableDates from "@/src/components/ui/form/UnavailableDates";
import React from "react";
import PblalvoCreateProdutct from "@/src/components/common/createProduct/PblalvoCreateProdutct ";
import NameAndDescription from "../components/NameAndDescriptionProps/NameAndDescriptionProps";
import { ProductGallery } from "../components/ProductGalleryProps/ProductGalleryProps";

export async function getServerSideProps(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const api = new Api();
  const { id } = req.query;

  const request: any = await api.call(
    {
      method: "post",
      url: "request/graph",
      data: [
        {
          model: "page",
          filter: [
            {
              key: "slug",
              value: "product",
              compare: "=",
            },
          ],
        },
      ],
    },
    req
  );

  let content: any = request?.data?.query?.page ?? {};

  return {
    props: {
      id: id,
      content: content[0] ?? {},
    },
  };
}

const formInitial = {
  sended: false,
  loading: false,
  dropdown: 0,
};

const schedulingPeriod = [
  {
    value: "day",
    name: "por dia",
  },
  {
    value: "night",
    name: "por noite",
  },
  {
    value: "hour",
    name: "por hora",
  },
];

export default function Form({
  content,
  id,
}: {
  content: any;
  id: string | number;
}) {
  const api = new Api();
  const [subimitStatus, setSubimitStatus] = useState("" as string);
  const [placeholder, setPlaceholder] = useState(true as boolean);
  const [form, setForm] = useState(formInitial);
  const [productsFind, setProductsFind] = useState([] as Array<RelationType>);
  const [colors, setColors] = useState([]);
  const setFormValue = (value: any) => {
    setForm((form) => ({ ...form, ...value }));
  };
  const [tags, setTags] = useState("" as string);
  const [data, setData] = useState({} as ProductType);
  const [showTooltip, setShowTooltip] = useState(false);
  const [product, setProduct] = useState({} as ProductType);

  const handleUnavailableDatesChange = (dates: string[]) => {
    handleData({ unavailableDates: dates });
  };


  const handleColors = (value: any) => {
    handleData({ color: value.join("|") });
    setColors(value);
  };

  const coerceIds = (raw: any): string[] => {
    if (raw == null) return [];
    let arr: any[] = [];
    if (Array.isArray(raw)) arr = raw;
    else if (typeof raw === "string") arr = raw.split(/[|,]/g);
    else arr = [raw];

    const out: string[] = [];
    const seen = new Set<string>();
    for (const v of arr) {
      const idRaw = v && typeof v === "object" ? (v.id ?? v.value ?? v.key ?? v.ID ?? v.Id) : v;
      if (idRaw == null) continue;
      const s = String(idRaw).trim();
      if (!s || s === "undefined" || s === "null") continue;
      if (!seen.has(s)) { seen.add(s); out.push(s); }
    }
    return out;
  };

  const handleData = useCallback((value: Record<string, any>) => {
    setData((prev) => {
      // ✅ blindagem: só aceita objeto plain
      console.log(value);
      if (
        value == null ||
        typeof value !== "object" ||
        Array.isArray(value)
      ) {
        console.warn("handleData: valor inválido (esperado objeto):", value);
        return prev;
      }

      let next = { ...prev };

      if ("category" in value) {
        const incoming = coerceIds(value.category);
        if (incoming.length) {
          const prevCat = coerceIds(prev.category ?? []);
          const merged = Array.from(new Set([...prevCat, ...incoming]));
          next.category = merged;
        }
        // se vier vazio, mantém o que já tinha
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
        if (t === "") return; // opcional: manter strings vazias? remova se quiser enviar ""
        out[k] = t;
      } else {
        out[k] = v;
      }
    });
    return out;
  };

  const buildPayload = () => {
    const categoryPipe = coerceIds(data.category ?? []).join("|");
    return sanitize({ ...data, category: categoryPipe });
  };


  const SearchProducts = async (search: string) => {
    if (search.length >= 3) {
      let request: any = (await api.request({
        method: "get",
        url: "request/products",
        data: {
          store: Cookies.get("fiestou.store"),
          busca: search,
          limit: 10,
        },
      })) as RelationType[];

      if (request.response && !!request?.data.length) {
        let handle = request?.data?.map((item: any) => {
          return {
            id: item.id,
            slug: item.slug,
            image: [],
            title: item.title,
          };
        });

        setProductsFind(handle);
      }
    }
  };

  const getProduct = async () => {
    const request: any = await api.bridge({
      method: "get",
      url: `stores/${Cookies.get("fiestou.store")}/products/${id}`,
    });

    let handle = request.data ?? {};
    handle = {
      ...handle,
      assembly: handle.assembly ? handle.assembly : "on",
      store: getStore(),
    };
    setProduct(handle);
    setData({ ...handle }); // ✅ NÃO faça outro setData depois!

    setColors(
      handle?.color && handle.color.split
        ? handle.color.split("|")
        : handle?.color
          ? [handle.color]
          : []
    );

    setPlaceholder(false);
  };

  useEffect(() => {
    if (!!window) {
      getProduct();
    }
  }, []);

  // useEffect(() => {
  //   console.log(data.category, "datinha");
  // }, [data]);


  // NameAndDescription Props

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // evita double-submit
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

      if (!request?.response) {
        // falhou de forma “limpa” (sem exception), trate como erro
        setSubimitStatus("register_failed");
        return;
      }

      setFormValue({ sended: request.response });
      setSubimitStatus("clean_cache");

      // bust cache da página pública
      await axios.get(`/api/cache?route=/produtos/${request?.data?.slug ?? payload.slug}`);

      setSubimitStatus("register_complete");

      setTimeout(() => {
        router.push({ pathname: "/painel/produtos" });
      }, 500);
    } catch (err) {
      console.error(err);
      setSubimitStatus("register_failed");
      // aqui você pode acionar um toast/alert
    } finally {
      // se quiser manter o loader até redirecionar, não desligue aqui.
      // Se preferir desligar sempre, descomente a linha abaixo:
      // setFormValue({ loading: false });
    }
  };


  return (
    <Template
      header={{
        template: "painel",
        position: "solid",
      }}
      footer={{
        template: "clean",
      }}
    >
      <section className="">
        <div className="container-medium py-6 lg:py-12">
          <div className="flex justify-between">
            <div className="pb-4">
              <Breadcrumbs
                links={[
                  { url: "/painel", name: "Painel" },
                  { url: "/painel/produtos", name: "Produtos" },
                ]}
              />
            </div>
            {!!data?.id && (
              <Link
                href={`/produtos/${data.slug}`}
                target="_blank"
                className="whitespace-nowrap flex items-center gap-2 ease hover:text-zinc-950 font-semibold"
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
        </div>
      </section>

      <section className="">
        <div className="container-medium pb-12">
          <form onSubmit={(e) => handleSubmit(e)} method="POST">
            <div className="grid lg:flex items-start gap-10 lg:gap-20">
              {placeholder ? (
                <div className="w-full grid gap-4 cursor-wait">
                  {[1, 2, 3, 4, 5, 6].map((key: number) => (
                    <div
                      key={key}
                      className="bg-zinc-200 rounded-md animate-pulse py-8"
                    ></div>
                  ))}
                </div>
              ) : (
                <div className="w-full grid gap-8">
                  <div className="grid gap-6">

                    {/* NameAndDescriptionProps */}
                    <NameAndDescription
                      data={data}
                      handleData={(updated: Partial<ProductType>) => {
                        setData((prev) => ({ ...prev, ...updated }));
                      }}
                    />

                    {/* ProductGalleryProps */}
                    <ProductGallery data={data} handleData={handleData} />

                    <div className="border-t pt-4 pb-2">
                      <h4 className="text-2xl text-zinc-900 mb-2">Preço</h4>
                      <div className="grid gap-2">
                        <div className="grid gap-2 grid-cols-2">
                          <div className="form-group">
                            <Label>Preço de venda/aluguel</Label>
                            <input
                              onChange={(e: any) =>
                                handleData({
                                  price: realMoneyNumber(e.target.value),
                                })
                              }
                              value={
                                !!data?.price
                                  ? realMoneyNumber(data?.price)
                                  : ""
                              }
                              required
                              type="text"
                              className="form-control"
                              name="preco_venda"
                              placeholder="0.00"
                            />
                          </div>

                          <div className="form-group">
                            <Label>Preço promocional</Label>
                            <input
                              onChange={(e: any) =>
                                handleData({
                                  priceSale: realMoneyNumber(e.target.value),
                                })
                              }
                              value={
                                !!data?.priceSale
                                  ? realMoneyNumber(data?.priceSale)
                                  : ""
                              }
                              type="text"
                              className="form-control"
                              name="preco_promo"
                              placeholder="0.00"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 items-start">
                      <div className="w-full">
                        <Label>Tipo comercial</Label>
                        <Select
                          name="tipo_comercial"
                          onChange={(e: any) =>
                            handleData({ comercialType: e.target.value })
                          }
                          value={data.comercialType}
                          options={[
                            {
                              value: "",
                              name: "Selecione...",
                            },
                            {
                              value: "selling",
                              name: "Venda",
                            },
                            {
                              value: "renting",
                              name: "Aluguel",
                            },
                          ]}
                        />
                      </div>

                      {data.comercialType == "renting" && (
                        <React.Fragment>
                          <div className="w-full">
                            <Label>Tempo</Label>
                            <Select
                              name="periodo"
                              onChange={(e: any) =>
                                handleData({
                                  schedulingPeriod: e.target.value,
                                })
                              }
                              value={data?.schedulingPeriod}
                              options={schedulingPeriod}
                              required
                            />
                          </div>
                          <div className="w-full">
                            <Label>
                              Desconto
                              <small className="font-medium pl-2">(em %)</small>
                            </Label>
                            <input
                              name="desconto_aluguel"
                              onChange={(e: any) =>
                                handleData({
                                  schedulingDiscount: justNumber(
                                    e.target.value
                                  ),
                                })
                              }
                              value={data?.schedulingDiscount ?? ""}
                              type="text"
                              placeholder="Ex: 10%"
                              required
                              className="form-control"
                            />
                          </div>
                        </React.Fragment>
                      )}
                    </div>

                    <Variable
                      product={data}
                      emitAttributes={(param: any) => {
                        handleData({ attributes: param });
                      }}
                    />

                    <div className="border-t pt-4 pb-2">
                      <h4 className="text-2xl text-zinc-900 mb-2">Estoque</h4>
                      <div className="grid gap-2">
                        <div className="flex gap-2">
                          <div className="w-full grid gap-2 sm:grid-cols-2">
                            <div className="form-group">
                              <div className="flex items-center">
                                <Label>SKU</Label>
                                <span className="pl-2 text-xs">(código do produto)</span>
                              </div>
                              <input
                                onChange={(e: any) =>
                                  handleData({ sku: e.target.value })
                                }
                                value={data?.sku ?? ""}
                                type="text"
                                name="sku"
                                placeholder="#0000"
                                className="form-control"
                              />
                            </div>
                            <div className="form-group">
                              <div className="flex items-center">
                                <Label>Disponibilidade</Label>
                                <span className="pl-2 text-xs">(em dias)</span>
                              </div>

                              <input
                                onChange={(e: any) =>
                                  handleData({
                                    availability: justNumber(e.target.value),
                                  })
                                }
                                value={data?.availability ?? 1}
                                min={1}
                                type="number"
                                name="disponibilidade"
                                placeholder="Em dias"
                                className="form-control"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="form-group">
                          <Label>Quantidade</Label>
                          <div className="grid md:flex gap-3">
                            <div className="w-full">
                              <Select
                                onChange={(e: any) => {
                                  handleData({ quantityType: e.target.value });
                                }}
                                value={data?.quantityType ?? "manage"}
                                name="quantidade_tipo"
                                options={[
                                  {
                                    name: "Selecione...",
                                    value: "",
                                  },
                                  {
                                    name: "Gerenciar estoque",
                                    value: "manage",
                                  },
                                  {
                                    name: "Sob demanda",
                                    value: "ondemand",
                                  },
                                ]}
                              />
                            </div>
                            {(!data?.quantityType ||
                              data?.quantityType == "manage") && (
                                <div className="w-full">
                                  <input
                                    onChange={(e: any) =>
                                      handleData({
                                        quantity: justNumber(e.target.value),
                                      })
                                    }
                                    value={justNumber(data?.quantity)}
                                    min={0}
                                    className="form-control text-center"
                                    type="number"
                                    name="quantidade"
                                    placeholder="Digite a quantidade"
                                    required
                                  />
                                </div>
                              )}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 pb-2">
                      <h4 className="text-2xl text-zinc-900 mb-2">
                        Períodos de Indisponibilidade
                      </h4>
                      <div className="grid gap-2">
                        <div className="form-group">
                          <Label>
                            Selecione as datas em que o produto não estará disponível.
                            <div className="relative inline-block ml-2">
                              <button
                                type="button"
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                                onClick={() => setShowTooltip(!showTooltip)}
                                onMouseEnter={() => setShowTooltip(true)}
                                onMouseLeave={() => setShowTooltip(false)}
                              >
                                <Icon icon="fa-exclamation-circle" className="text-sm" />
                              </button>

                              {showTooltip && (
                                <div className="absolute left-0 bottom-full mb-2 z-50 w-64 p-3 bg-gray-600 text-white text-xs rounded-lg shadow-lg whitespace-normal break-words">
                                  <div className="relative">
                                    Essa funcionalidade é indicada para quando o produto é alugado fora da plataforma Fiestou.
                                    <div className="absolute top-full right-4 w-2 h-2 bg-gray-600 transform rotate-45 translate-y-[-1px]"></div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </Label>
                          <UnavailableDates
                            initialDates={data.unavailableDates}
                            onChange={handleUnavailableDatesChange}
                            minDate={new Date()}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 pb-2">
                      <h4 className="text-2xl text-zinc-900 mb-2">
                        Peso e dimensões
                      </h4>
                      <div className="grid gap-2 grid-cols-2 md:grid-cols-4">
                        <div className="form-group">
                          <Label>Peso</Label>
                          <input
                            onChange={(e: any) =>
                              handleData({
                                weight: decimalNumber(e.target.value),
                              })
                            }
                            value={data?.weight ?? ""}
                            type="text"
                            name="peso"
                            placeholder="0.00 (kg)"
                            className="form-control"
                          />
                        </div>
                        <div className="form-group">
                          <Label>Comprimento</Label>
                          <input
                            onChange={(e: any) =>
                              handleData({
                                length: decimalNumber(e.target.value),
                              })
                            }
                            value={data?.length ?? ""}
                            type="text"
                            name="comprimento"
                            placeholder="0.00 (m)"
                            className="form-control"
                          />
                        </div>

                        <div className="form-group">
                          <Label>Largura</Label>
                          <input
                            onChange={(e: any) =>
                              handleData({
                                width: decimalNumber(e.target.value),
                              })
                            }
                            value={data?.width ?? ""}
                            type="text"
                            name="largura"
                            placeholder="0.00 (m)"
                            className="form-control"
                          />
                        </div>

                        <div className="form-group">
                          <Label>Altura</Label>
                          <input
                            onChange={(e: any) =>
                              handleData({
                                height: decimalNumber(e.target.value),
                              })
                            }
                            value={data?.height ?? ""}
                            type="text"
                            name="altura"
                            placeholder="0.00 (m)"
                            className="form-control"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 pb-2">
                      <h4 className="text-2xl text-zinc-900 pb-6">
                        Características
                      </h4>
                      <div className="grid gap-8">
                        <div className="">
                          <Label>Cor</Label>
                          <Colors
                            value={colors}
                            onChange={handleColors}
                          />
                          <div className="text-sm text-zinc-400 whitespace-nowrap">
                            {(colors?.filter(Boolean).length ?? 0)} de 3
                          </div>
                        </div>

                        <div className="">
                          <div className="flex items-center">
                            <Label>Adicionar Tag</Label>
                            <div className="text-xs pt-1 pl-2">
                              (máx 6 tags)
                            </div>
                          </div>
                          <div className="relative">
                            <div className="w-full">
                              <input
                                onChange={(e: any) => setTags(e.target.value)}
                                type="text"
                                name="tags"
                                value={tags ?? ""}
                                placeholder="Exemplo: Fazenda, Desenho animado, Galinha"
                                className="form-control pr-28"
                              />
                            </div>
                            <div className="absolute right-0 top-1/2 -translate-y-1/2">
                              <Button
                                onClick={(e: any) => {
                                  handleData({
                                    tags: handleTags(data?.tags ?? "", tags),
                                  });
                                  setTags("");
                                }}
                                type="button"
                                style="btn-link"
                                className="px-4"
                              >
                                confirmar
                              </Button>
                            </div>
                          </div>
                          {!!data?.tags && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {data.tags
                                .split(",")
                                .filter((item) => !!item)
                                .map(
                                  (item: any, key: any) =>
                                    key < 6 && (
                                      <div
                                        className="bg-zinc-100 border border-zin-300 px-4 py-2 rounded-md items-center flex gap-3"
                                        key={key}
                                      >
                                        <span className="text-sm md:text-base">
                                          {item}
                                        </span>
                                        <div
                                          onClick={() =>
                                            handleData({
                                              tags: handleTags(
                                                data?.tags?.replace(item, "") ??
                                                "",
                                                ""
                                              ),
                                            })
                                          }
                                          className="cursor-pointer hover:text-zinc-900"
                                        >
                                          <Icon icon="fa-times" />
                                        </div>
                                      </div>
                                    )
                                )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Mantém */}
                    <PblalvoCreateProdutct
                      value={coerceIds(data?.category ?? [])}
                      onToggle={(id, selected) => {
                        setData((prev) => {
                          const prevCat = coerceIds(prev?.category ?? []);
                          const s = new Set(prevCat.map(String));
                          selected ? s.add(String(id)) : s.delete(String(id));
                          return { ...prev, category: Array.from(s) };
                        });
                      }}
                    />

                    {/* Mantém */}
                    <CategorieCreateProdutct
                      value={data?.category ?? []}
                      onRemove={(id) => {
                        setData((prev) => {
                          const curr = (Array.isArray(prev?.category) ? prev.category : []).map(Number).filter(Number.isFinite);
                          const next = curr.filter((x) => x !== Number(id));
                          return curr.length === next.length ? prev : { ...prev, category: next };
                        });
                      }}
                      onChange={(ids) => {
                        // quando o usuário confirmar no modal de filtro, vem a LISTA completa
                        setData((prev) => ({ ...prev, category: ids }));
                      }}
                    />


                    <div className="border-t pt-4 pb-2">
                      <h4 className="text-2xl text-zinc-900 pb-6">
                        Venda combinada
                      </h4>

                      <div className="grid gap-8">
                        <div className="">
                          <Label>Combinações</Label>
                          <Options
                            name="tipo_produto"
                            value={data?.combinations ?? []}
                            onSearch={(search: string) =>
                              SearchProducts(search)
                            }
                            list={productsFind}
                            onChange={(emit: any) =>
                              handleData({
                                combinations: emit,
                              })
                            }
                          />
                        </div>

                        <div className="">
                          <Label>Mostrar produtos relacionados?</Label>
                          <Select
                            value={data?.suggestions ?? "yes"}
                            name="sugestoes"
                            options={[
                              { name: "Sim", value: "yes" },
                              { name: "Não", value: "no" },
                            ]}
                            onChange={(e: any) =>
                              handleData({
                                suggestions: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-4 pb-2">
                      <h4 className="text-2xl text-zinc-900 mb-2">
                        Transporte
                      </h4>
                      <div className="grid md:grid-cols-4 gap-4">
                        <div className="form-group">
                          <Label>Produto frágil?</Label>
                          <Select
                            value={data.fragility ?? "yes"}
                            name="fragilidade"
                            options={[
                              { name: "Sim", value: "yes" },
                              { name: "Não", value: "no" },
                            ]}
                            onChange={(e: any) =>
                              handleData({
                                fragility: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="form-group">
                          <Label>Veículo</Label>
                          <Select
                            value={data.vehicle}
                            name="veiculo"
                            options={[
                              {
                                name: "Moto",
                                value: "motorbike",
                              },
                              {
                                name: "Carro",
                                value: "car",
                              },
                              {
                                name: "Caminhonete",
                                value: "pickup",
                              },
                              {
                                name: "Caminhão",
                                value: "truck",
                              },
                            ]}
                            onChange={(e: any) =>
                              handleData({
                                vehicle: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="form-group">
                          <Label>Valor de KM rodado</Label>
                          <input
                            value={!!data?.freeTax ? data?.freeTax : ""}
                            type="text"
                            name="freeTax"
                            onChange={(e: any) =>
                              handleData({
                                freeTax: realMoneyNumber(e.target.value),
                              })
                            }
                            placeholder="R$ 00.00"
                            className="form-control"
                          />
                        </div>

                        <div className="form-group">
                          <Label>Montagem</Label>
                          <Select
                            value={data.assembly}
                            name="montagem"
                            options={[
                              {
                                name: "Fornecer",
                                value: "on",
                              },
                              {
                                name: "Não fornecer",
                                value: "off",
                              },
                            ]}
                            onChange={(e: any) =>
                              handleData({
                                assembly: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>

                    <div className="border-t pt-2 pb-2">
                      <div className="grid gap-2">
                        <div className="form-group">
                          <Label>Exibir na minha loja</Label>
                          <Select
                            name="status"
                            value={data.status ?? "visible"}
                            options={[
                              {
                                name: "Sim",
                                value: "visible",
                              },
                              {
                                name: "Não",
                                value: "hidden",
                              },
                            ]}
                            onChange={(e: any) =>
                              handleData({
                                status: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-full">
                      <Link
                        passHref
                        href="/painel/produtos/"
                        className="text-zinc-900"
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
        </div>
      </section>

      {form.loading && (
        <div className="fixed inset-0 bg-white flex justify-center items-center">
          <div className="grid text-center gap-4">
            <div className="text-zinc-900">
              {subimitStatus == "upload_images"
                ? "Enviando imagens..."
                : subimitStatus == "register_content"
                  ? "Salvando produto..."
                  : subimitStatus == "clean_cache"
                    ? "Limpando cache..."
                    : subimitStatus == "register_complete"
                      ? "Salvo com sucesso!"
                      : ""}
            </div>
            <div className="text-2xl">
              {subimitStatus == "register_complete" ? (
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
