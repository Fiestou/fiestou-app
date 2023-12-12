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
import { getImage, handleTags, justNumber, slugfy } from "@/src/helper";
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

  const [form, setForm] = useState(formInitial);
  const setFormValue = (value: any) => {
    setForm((form) => ({ ...form, ...value }));
  };

  const [tags, setTags] = useState("" as string);
  const [categories, setCategories] = useState([] as Array<any>);

  const [data, setData] = useState({} as ProductType);
  const handleData = (value: Object) => {
    setData((data) => ({ ...data, ...value }));
  };

  const [handleGallery, setHandleGallery] = useState([] as Array<any>);
  const handleGalleryPreview = async (e: any) => {
    let files = e.target.files ?? [];
    let gallery: any = handleGallery;

    for (let i = 0; i < files.length; i++) {
      let file = e.target.files[i];

      let base64: any = await new Promise((resolve, reject) => {
        let reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });

      gallery = [...gallery, { base64, fileName: file.name }];
    }

    setHandleGallery(gallery);
    return gallery;
  };

  const removeGalleryItem = (obj: any) => {
    const handle = handleGallery.map((item: any) => {
      return obj == item
        ? {
            ...item,
            remove: true,
          }
        : item;
    });

    setHandleGallery(handle);
    handleData({ gallery: handle });
  };

  const [colors, setColors] = useState([] as Array<any>);
  const handleColors = (value: any) => {
    handleData({ color: value.join("|") });
    setColors(value);
  };

  const [productsFind, setProductsFind] = useState([] as Array<RelationType>);
  const SearchProducts = async (search: string) => {
    if (search.length >= 3) {
      let request: any = await api.get({
        url: "request/products",
        data: {
          store: Cookies.get("fiestou.store"),
          busca: search,
          limit: 10,
        },
      });

      if (request.response && !!request?.data.length) {
        let handle = request?.data?.map((item: any) => {
          return {
            id: item.id,
            slug: item.slug,
            image: getImage(item.gallery[0]) ?? [],
            title: item.title,
          } as RelationType;
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

    const handle = request.data ?? {};

    console.log(handle);

    setProduct(handle);
    setData(handle);
    setColors(
      !!handle?.color && handle?.color?.split("|").length
        ? handle?.color?.split("|")
        : [handle?.color]
    );
    setHandleGallery(handle?.gallery ?? []);
    setCategories(handle?.category ?? []);
  };

  useEffect(() => {
    if (!!window) {
      getProduct();
    }
  }, []);

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setFormValue({ loading: true });

    const uploadFiles = handleGallery.filter(
      (item) => !item?.remove && !item?.id
    );

    const removeFiles = handleGallery
      .filter((item) => !!item?.remove && !!item?.id)
      .map((item, key) => item.id);

    if (!!removeFiles.length) {
      await api
        .media({
          dir: "products",
          app: data?.store,
          index: data?.store,
          method: "remove",
          medias: removeFiles,
        })
        .then((res: any) => res);
    }

    let gallery = handleGallery.filter((item) => !item?.remove && !!item?.id);

    if (!!uploadFiles.length) {
      const upload = await api
        .media({
          dir: "products",
          app: data?.store,
          index: data?.store,
          method: "upload",
          medias: uploadFiles,
        })
        .then((data: any) => data);

      if (upload.response && !!upload.medias) {
        upload.medias.map((item: any, key: any) => {
          let media = item.media;
          media["details"] = JSON.parse(media.details);

          gallery.push({
            id: media.id,
            base_url: media.base_url,
            permanent_url: media.permanent_url,
            details: media.details,
            preview: media.base_url + media.details?.sizes["lg"],
          });
        });
      }
    }

    setHandleGallery(gallery);

    let request: any = await api.bridge({
      url: "products/register",
      data: {
        ...data,
        gallery: gallery.map((item) => item.id),
      },
    });

    if (request.response) {
      setFormValue({ sended: request.response });
      router.push({ pathname: "/painel/produtos" });
    } else {
      await api
        .media({
          dir: "products",
          app: data?.store,
          index: data?.store,
          method: "remove",
          medias: gallery.map((item) => item.id),
        })
        .then((res: any) => res);

      setFormValue({ loading: false, sended: request.response });
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
          <div className="pb-4">
            <Breadcrumbs
              links={[
                { url: "/painel", name: "Painel" },
                { url: "/painel/produtos", name: "Produtos" },
              ]}
            />
          </div>
          <div className="flex items-center">
            <Link passHref href="/painel/produtos">
              <Icon
                icon="fa-long-arrow-left"
                className="mr-4 md:mr-6 text-2xl text-zinc-900"
              />
            </Link>
            <div className="font-title font-bold text-2xl md:text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900 w-full">
              {data.title ? "Editar produto" : "Novo produto"}
            </div>
          </div>
        </div>
      </section>
      <section className="">
        <div className="container-medium pb-12">
          <form onSubmit={(e) => handleSubmit(e)} method="POST">
            <div className="grid lg:flex gap-10 lg:gap-20">
              <div className="w-full grid gap-8">
                <div className="grid gap-6">
                  <div className="border-t pt-4 pb-2">
                    <h4 className="text-2xl text-zinc-900 mb-2">
                      Nome e descrição
                    </h4>
                    <div className="grid gap-2">
                      <div className="form-group">
                        <Label>Título</Label>
                        <Input
                          type="text"
                          name="titulo"
                          onChange={(e: any) =>
                            handleData({ title: e.target.value })
                          }
                          value={data.title}
                          required
                          placeholder="Digite o nome completo"
                        />
                        <Input
                          type="text"
                          name="slug"
                          onChange={(e: any) =>
                            handleData({ slug: slugfy(e.target.value) })
                          }
                          value={slugfy(data.slug ?? data.title)}
                          required
                          placeholder="Configure a slug para o link"
                          className="mt-2 text-sm p-2 bg-zinc-100 border-0"
                        />
                      </div>

                      <div className="form-group">
                        <Label>Subtítulo</Label>
                        <Input
                          type="text"
                          name="subtitulo"
                          onChange={(e: any) =>
                            handleData({ subtitle: e.target.value })
                          }
                          value={data.subtitle}
                          required
                          placeholder="Digite o subtítulo"
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
                        <Label>Fotos</Label>
                        <FileInput
                          name="cover"
                          id="cover"
                          onChange={async (e: any) =>
                            handleData({
                              gallery: await handleGalleryPreview(e),
                            })
                          }
                          multiple
                          loading={form.loading}
                          remove={(e: any) => {}}
                          aspect="aspect-[4/2] md:aspect-[8/2]"
                        />
                        <div className="grid gap-4 grid-cols-5 mt-4">
                          {!!handleGallery.length &&
                            handleGallery
                              .filter((item) => !item.remove)
                              .map((item: any, key: any) => (
                                <div key={key} className="w-full group">
                                  <div className="relative rounded-md bg-zinc-100 overflow-hidden aspect-square">
                                    <Img
                                      src={
                                        !!item.base_url
                                          ? getImage(item, "thumb")
                                          : item.base64
                                      }
                                      className="absolute object-contain h-full inset-0 w-full"
                                    />
                                    <button
                                      onClick={() => removeGalleryItem(item)}
                                      className="opacity-0 group-hover:opacity-100 ease absolute top-0 right-0 m-1 p-3 rounded-full bg-zinc-200 hover:bg-red-600 text-zinc-500 hover:text-white"
                                      type="button"
                                    >
                                      <Icon
                                        icon="fa-times"
                                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                                      />
                                    </button>
                                  </div>
                                </div>
                              ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 pb-2">
                    <h4 className="text-2xl text-zinc-900 mb-2">Preço</h4>
                    <div className="grid gap-2">
                      <div className="grid gap-2 grid-cols-2">
                        <div className="form-group">
                          <Label>Preço de venda</Label>
                          <Input
                            onChange={(e: any) =>
                              handleData({ price: parseInt(e.target.value) })
                            }
                            {...(!!data?.price ? { value: data?.price } : {})}
                            required
                            type="text"
                            name="preco_venda"
                            placeholder="0,00"
                          />
                        </div>

                        <div className="form-group">
                          <Label>Preço promocional</Label>
                          <Input
                            onChange={(e: any) =>
                              handleData({
                                priceSale: parseInt(e.target.value),
                              })
                            }
                            {...(!!data?.priceSale
                              ? { value: data?.priceSale }
                              : {})}
                            type="text"
                            name="preco_promo"
                            placeholder="0,00"
                          />
                        </div>
                      </div>
                    </div>
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
                        <div className="w-full grid gap-2 sm:grid-cols-3">
                          <div className="form-group">
                            <Label>SKU</Label>
                            <Input
                              onChange={(e: any) =>
                                handleData({ sku: e.target.value })
                              }
                              value={data?.sku}
                              type="text"
                              name="sku"
                              placeholder="#0000"
                            />
                          </div>
                          <div className="form-group">
                            <Label>Código do produto</Label>
                            <Input
                              onChange={(e: any) =>
                                handleData({ code: e.target.value })
                              }
                              value={data?.code}
                              type="text"
                              name="codigo"
                              placeholder="1234"
                            />
                          </div>
                          <div className="form-group">
                            <Label>Disponibilidade</Label>
                            <Input
                              onChange={(e: any) =>
                                handleData({ availability: e.target.value })
                              }
                              value={data?.availability ?? 1}
                              min={1}
                              type="number"
                              name="disponibilidade"
                              placeholder="Em dias"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <Label>Quantidade</Label>
                        <div className="grid md:flex gap-3">
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
                          {(!data?.quantityType ||
                            data?.quantityType == "manage") && (
                            <Input
                              onChange={(e: any) =>
                                handleData({ quantity: e.target.value })
                              }
                              value={data?.quantity ?? "1"}
                              min="0"
                              className="text-center"
                              type="number"
                              name="quantidade"
                              placeholder="Digite a quantidade"
                              required
                            />
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
                        <Input
                          onChange={(e: any) =>
                            handleData({ weight: e.target.value })
                          }
                          value={data?.weight}
                          type="text"
                          name="peso"
                          placeholder="0,00 (kg)"
                        />
                      </div>
                      <div className="form-group">
                        <Label>Comprimento</Label>
                        <Input
                          onChange={(e: any) =>
                            handleData({ length: e.target.value })
                          }
                          value={data?.length}
                          type="text"
                          name="comprimento"
                          placeholder="0,00 (m)"
                        />
                      </div>

                      <div className="form-group">
                        <Label>Largura</Label>
                        <Input
                          onChange={(e: any) =>
                            handleData({ width: e.target.value })
                          }
                          value={data?.width}
                          type="text"
                          name="largura"
                          placeholder="0,00 (m)"
                        />
                      </div>

                      <div className="form-group">
                        <Label>Altura</Label>
                        <Input
                          onChange={(e: any) =>
                            handleData({ height: e.target.value })
                          }
                          value={data?.height}
                          type="text"
                          name="altura"
                          placeholder="0,00 (m)"
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
                          <div className="text-xs pt-1 pl-2">(máx 6 tags)</div>
                        </div>
                        <div className="relative">
                          <div className="w-full">
                            <Input
                              onChange={(e: any) => setTags(e.target.value)}
                              type="text"
                              name="tags"
                              defaultValue={tags}
                              className="pr-28"
                              placeholder="Exemplo: Fazenda, Desenho animado, Galinha"
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
                                <small className="font-medium pl-2">
                                  (em %)
                                </small>
                              </Label>
                              <Input
                                name="desconto_aluguel"
                                onChange={(e: any) =>
                                  handleData({
                                    schedulingDiscount: justNumber(
                                      e.target.value
                                    ),
                                  })
                                }
                                value={justNumber(data.schedulingDiscount)}
                                type="text"
                                placeholder="Ex: 10%"
                                required
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 pb-2">
                    <h4 className="text-2xl text-zinc-900 pb-6">Up Sell</h4>

                    <div className="grid gap-8">
                      <div className="">
                        <Label>Combinações</Label>
                        <Options
                          name="tipo_produto"
                          value={data?.combinations ?? []}
                          onSearch={(search: string) => SearchProducts(search)}
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
                    <h4 className="text-2xl text-zinc-900 mb-2">Transporte</h4>
                    <div className="grid md:grid-cols-3 gap-2">
                      <div className="form-group">
                        <Label>Este produto é frágil?</Label>
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
                        <Label>Veículo recomendado</Label>
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
                        <Input
                          value={data.freeTax}
                          type="text"
                          name="taxa_entrega"
                          onChange={(e: any) =>
                            handleData({
                              freeTax: e.target.value,
                            })
                          }
                          placeholder="R$ 00,00"
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
              <div className="w-full md:max-w-[18rem] lg:max-w-[24rem]">
                <HelpCard list={content.help_list} />
              </div>
            </div>
          </form>
        </div>
      </section>
    </Template>
  );
}
