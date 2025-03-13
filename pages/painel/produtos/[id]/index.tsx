import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Template from "@/src/template";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { useEffect, useState } from "react";
import { ProductType } from "@/src/models/product";
import Api from "@/src/services/api";
import { NextApiRequest, NextApiResponse } from "next";
import {
  Button,
  Input,
  Label,
  Select,
  TextArea,
} from "@/src/components/ui/form";
import {
  decimalNumber,
  getImage,
  handleTags,
  justNumber,
  justValidateNumber,
  moneyFormat,
  realMoneyNumber,
  slugfy,
} from "@/src/helper";
import FileInput from "@/src/components/ui/form/FileInputUI";
import HelpCard from "@/src/components/common/HelpCard";
import Cookies from "js-cookie";
import Colors from "@/src/components/ui/form/ColorsUI";
import Options from "@/src/components/ui/form/OptionsUI";
import { RelationType } from "@/src/models/relation";
import { Variable } from "@/src/components/pages/painel/produtos/produto";
import Img from "@/src/components/utils/ImgBase";
import router from "next/router";
import Categories from "@/src/components/pages/painel/produtos/produto/Categories";
import { getStore, getUser } from "@/src/contexts/AuthContext";
import axios from "axios";
import Gallery from "@/src/components/pages/painel/produtos/produto/Gallery";

export async function getServerSideProps(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const api = new Api();
  const { id } = req.query;

  const request: any = await api.call(
    {
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
  const setFormValue = (value: any) => {
    setForm((form) => ({ ...form, ...value }));
  };

  const [tags, setTags] = useState("" as string);
  const [categories, setCategories] = useState([] as Array<any>);

  const [data, setData] = useState({} as ProductType);
  const handleData = (value: Object) => {
    console.log(value);
    setData({ ...data, ...value });
  };

  const [colors, setColors] = useState([] as Array<any>);
  const handleColors = (value: any) => {
    handleData({ color: value.join("|") });
    setColors(value);
  };

  const [productsFind, setProductsFind] = useState([] as Array<RelationType>);
  const SearchProducts = async (search: string) => {
    if (search.length >= 3) {
      let request: any = await api.request({
        method: "get",
        url: "request/products",
        data: {
          store: Cookies.get("fiestou.store"),
          busca: search,
          limit: 10,
        },
      }) as RelationType[];

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

  const [product, setProduct] = useState({} as ProductType);
  const getProduct = async () => {
    let request: any = await api.bridge({
      url: "products/form",
      data: { id: id },
    });

    let handle = request.data ?? {};
    handle = {
      ...handle,
      assembly: !!handle.assembly ? handle.assembly : "on",
      store: getStore(),
    };

    setProduct(handle);
    setData(handle);
    setColors(
      !!handle?.color && handle?.color?.split("|").length
        ? handle?.color?.split("|")
        : [handle?.color]
    );

    setCategories(handle?.category ?? []);

    setPlaceholder(false);
  };

  useEffect(() => {
    if (!!window) {
      getProduct();
    }
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setFormValue({ loading: true });

    setSubimitStatus("register_content");

    let request: any = await api.bridge({
      url: "products/register",
      data: data,
    });

    if (request.response) {
      setFormValue({ sended: request.response });

      setSubimitStatus("clean_cache");

      await axios.get(`/api/cache?route=/produtos/${request.data.slug}`);

      setSubimitStatus("register_complete");

      setTimeout(() => {
        router.push({ pathname: "/painel/produtos" });
      }, 1000);
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
                    <div className="border-t pt-4 pb-2">
                      <h4 className="text-2xl text-zinc-900 mb-2">
                        Nome e descrição
                      </h4>
                      <div className="grid gap-2">
                        <div className="form-group">
                          <Label>Título</Label>
                          <input
                            type="text"
                            name="titulo"
                            onChange={(e: any) =>
                              handleData({ title: e.target.value })
                            }
                            value={data?.title ?? ""}
                            required
                            placeholder="Digite o nome completo"
                            className="form-control"
                          />
                          <input
                            type="text"
                            name="slug"
                            onChange={(e: any) =>
                              handleData({ slug: slugfy(e.target.value) })
                            }
                            value={slugfy(data.slug ?? data.title)}
                            required
                            placeholder="Configure a slug para o link"
                            className="mt-2 text-sm p-2 rounded-md bg-zinc-100 border-0"
                          />
                        </div>

                        <div className="form-group">
                          <Label>Subtítulo</Label>
                          <input
                            type="text"
                            name="subtitulo"
                            onChange={(e: any) =>
                              handleData({ subtitle: e.target.value })
                            }
                            value={data?.subtitle ?? ""}
                            required
                            placeholder="Digite o subtítulo"
                            className="form-control"
                          />
                        </div>

                        <div className="form-group">
                          <Label>Descrição</Label>
                          <TextArea
                            name="descricao"
                            onChange={(e: any) =>
                              handleData({ description: e.target.value })
                            }
                            value={data.description}
                            required
                            placeholder="Adicione a descrição detalhada do produto"
                          />
                        </div>

                        <div className="form-group">
                          <Gallery
                            product={data.id}
                            emitProduct={(productID: number) =>
                              handleData({ id: productID })
                            }
                          />
                        </div>
                      </div>
                    </div>

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
                        <>
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
                        </>
                      )}
                    </div>

                    <Variable
                      product={data}
                      emitAttributes={(param: any) => {
                        handleData({ attributes: param });
                      }}
                    />

                    <Categories
                      checked={categories}
                      emit={(value: any) => handleData({ category: value })}
                    />

                    <div className="border-t pt-4 pb-2">
                      <h4 className="text-2xl text-zinc-900 mb-2">Estoque</h4>
                      <div className="grid gap-2">
                        <div className="flex gap-2">
                          <div className="w-full grid gap-2 sm:grid-cols-2">
                            <div className="form-group">
                              <Label>SKU</Label>
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
                            {/* <div className="form-group">
                              <Label>Código do produto</Label>
                              <input
                                onChange={(e: any) =>
                                  handleData({ code: e.target.value })
                                }
                                value={data?.code}
                                type="text"
                                name="codigo"
                                placeholder="1234"
                                className="form-control"
                              />
                            </div> */}
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
                        {/* ColorsList */}
                        <div className="">
                          <Label>Cor</Label>
                          <Colors
                            value={colors}
                            onChange={(value: any) => handleColors(value)}
                          />
                          <div className="text-sm text-zinc-400 whitespace-nowrap">
                            {colors?.length ?? 0} de 3
                          </div>
                        </div>
                        {/* ---- */}

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
                          <Label>Taxa de entrega</Label>
                          <input
                            value={
                              !!data?.freeTax
                                ? realMoneyNumber(data?.freeTax)
                                : ""
                            }
                            type="text"
                            name="taxa_entrega"
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
