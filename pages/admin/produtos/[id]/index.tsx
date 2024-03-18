import { v4 as uid } from "uuid";
import Image from "next/image";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { Input, TextArea } from "@/src/components/ui/form";
import { useState } from "react";
import Api from "@/src/services/api";
import { useRouter } from "next/router";
import { NextApiRequest, NextApiResponse } from "next";
import { ProductType } from "@/src/models/product";

import Img from "@/src/components/utils/ImgBase";
import { getImage } from "@/src/helper";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export async function getServerSideProps(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const api = new Api();
  const query = req.query;
  let request: any = await api.get({
    url: "request/product",
    data: {
      id: query?.id ?? 0,
    },
  });

  if (!request?.response) {
    return {
      redirect: {
        permanent: false,
        destination: "/admin/produtos",
      },
    };
  }

  const product: any = request?.data ?? {};

  return {
    props: {
      product: product,
      store: product?.store?.id ?? 0,
    },
  };
}

export default function Form({
  product,
  store,
}: {
  product: ProductType;
  store: number;
}) {
  const api = new Api();
  const router = useRouter();

  const [data, setData] = useState(product as ProductType);

  const handleGallery = product?.gallery ?? [];

  // console.log(handleGallery);

  return (
    !router.isFallback && (
      <Template
        header={{
          template: "admin",
          position: "solid",
        }}
      >
        <section className="">
          <div className="container-medium py-6 lg:py-12">
            <div className="pb-4">
              <Breadcrumbs
                links={[
                  { url: "/admin", name: "Admin" },
                  { url: "/admin/produtos", name: "Produtos" },
                ]}
              />
            </div>
            <div className="flex items-center">
              <Link passHref href="/admin/produtos">
                <Icon
                  icon="fa-long-arrow-left"
                  className="mr-4 md:mr-6 text-2xl text-zinc-900"
                />
              </Link>
              <div className="font-title font-bold text-2xl md:text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900 w-full">
                Produto
              </div>
            </div>
          </div>
        </section>
        <section className="">
          <div className="container-medium pb-12">
            <div className="flex gap-20">
              <div className="w-full grid gap-8">
                <div className="grid gap-6">
                  <div className="border-t pt-4 pb-2">
                    <h4 className="text-2xl text-zinc-900 mb-2">
                      Nome e descrição
                    </h4>
                    <div className="grid gap-2">
                      <div className="form-group">
                        <label className="text-zinc-900 font-bold">
                          Título
                        </label>
                        <Input readonly value={data.title} />
                      </div>

                      <div className="form-group">
                        <label className="text-zinc-900 font-bold">
                          Descrição
                        </label>
                        <TextArea readonly value={data.description} />
                      </div>

                      <div className="form-group">
                        <label className="text-zinc-900 font-bold">Fotos</label>

                        <div className="grid gap-4 grid-cols-5 mt-4">
                          {!!handleGallery.length &&
                            handleGallery
                              .filter((item) => !!item.base_url)
                              .map((item: any, key: any) => (
                                <div key={key} className="w-full group">
                                  <div className="relative rounded-md bg-zinc-100 overflow-hidden aspect-square">
                                    <Img
                                      src={getImage(item, "thumb")}
                                      className="absolute object-contain h-full inset-0 w-full"
                                    />
                                  </div>
                                </div>
                              ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 pb-2">
                    <h4 className="text-2xl text-zinc-900 mb-2">
                      Grupo de variações/adicionais
                    </h4>

                    {!!data?.attributes &&
                      data?.attributes.map((attribute, key) => (
                        <div key={key}>
                          <div className="pt-2 pb-4 text-sm">
                            <h4 className="font-semibold mb-1 text-zinc-900 cursor-pointer whitespace-nowrap">
                              {attribute.title}
                            </h4>
                            <div className="grid grid-cols-2">
                              <div className="grid grid-cols-2">
                                <div className="">Tipo de seleção:</div>
                                <div>
                                  {attribute.selectType == "radio" &&
                                    " Seleção única"}
                                  {attribute.selectType == "checkbox" &&
                                    " Seleção aberta"}
                                  {attribute.selectType == "quantity" &&
                                    " Por quandidade"}
                                </div>
                                {(attribute?.selectType == "checkbox" ||
                                  attribute?.selectType == "quantity") && (
                                  <>
                                    <div className="">Limite de seleção:</div>
                                    <div className="">{attribute.limit}</div>
                                  </>
                                )}
                                <div className="">Preços:</div>
                                <div>
                                  {attribute.priceType == "on"
                                    ? " Incluir valores"
                                    : " Apenas seleção"}
                                </div>
                              </div>
                              <div className="">
                                {attribute?.variations.map((variation, key) => (
                                  <div key={key}>
                                    <div className="flex items-center">
                                      <div className="w-full">
                                        <div className="flex gap-2">
                                          <div className="w-full">
                                            {!!variation?.title
                                              ? variation?.title
                                              : `Variação ${key + 1}`}
                                          </div>
                                          {attribute?.priceType == "on" && (
                                            <div className="w-fit">
                                              {variation.priceSale}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>

                  <div className="border-t pt-4 pb-2">
                    <h4 className="text-2xl text-zinc-900 mb-2">Preço</h4>
                    <div className="grid gap-2">
                      <div className="grid gap-2 grid-cols-2">
                        <div className="form-group">
                          <label className="text-zinc-900 font-bold">
                            Preço de venda
                          </label>
                          <Input
                            value={`R$ ${product?.price ?? "00,00"}`}
                            readonly
                          />
                        </div>

                        <div className="form-group">
                          <label className="text-zinc-900 font-bold">
                            Preço promocional
                          </label>
                          <Input
                            value={`R$ ${product?.priceSale ?? "00,00"}`}
                            readonly
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 pb-2">
                    <h4 className="text-2xl text-zinc-900 mb-2">Estoque</h4>
                    <div className="grid gap-2">
                      <div className="flex gap-2">
                        <div className="w-full grid gap-2 grid-cols-2">
                          <div className="form-group">
                            <label className="text-zinc-900 font-bold">
                              SKU
                            </label>
                            <Input value={product?.sku} readonly />
                          </div>
                          <div className="form-group">
                            <label className="text-zinc-900 font-bold">
                              Código do produto
                            </label>
                            <Input readonly value={product?.code} />
                          </div>
                        </div>
                      </div>
                      <div className="form-group">
                        <label className="text-zinc-900 font-bold">
                          Quantidade
                        </label>
                        <div className="grid grid-cols-2 gap-6">
                          <Input
                            value={
                              product?.quantityType == "manage"
                                ? "Gerenciar estoque"
                                : "Sob demanda"
                            }
                            readonly
                          />

                          {(!product?.quantityType ||
                            product?.quantityType == "manage") && (
                            <Input value={product?.quantity ?? "1"} readonly />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 pb-2">
                    <h4 className="text-2xl text-zinc-900 mb-2">
                      Peso e dimensões
                    </h4>
                    <div className="grid gap-6 grid-cols-4">
                      <div className="form-group">
                        <label className="text-zinc-900 font-bold">Peso</label>
                        <Input value={product?.weight} readonly />
                      </div>
                      <div className="form-group">
                        <label className="text-zinc-900 font-bold">
                          Comprimento
                        </label>
                        <Input value={product?.length} readonly />
                      </div>

                      <div className="form-group">
                        <label className="text-zinc-900 font-bold">
                          Largura
                        </label>
                        <Input value={product?.width} readonly />
                      </div>

                      <div className="form-group">
                        <label className="text-zinc-900 font-bold">
                          Altura
                        </label>
                        <Input value={product?.height} readonly />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 pb-2">
                    <h4 className="text-2xl text-zinc-900 mb-2">
                      Características
                    </h4>
                    <div className="grid gap-2">
                      <div className="form-group">
                        <label className="text-zinc-900 font-bold">
                          Categoria
                        </label>
                        <div className="flex flex-wrap gap-1">
                          {data.category?.map((item: any) => (
                            <div
                              className="bg-zinc-100 rounded-md py-2 px-4"
                              key={item.id}
                            >
                              {item.title}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="text-zinc-900 font-bold">
                          Adicionar Tag
                        </label>
                        <Input readonly value={data.tags} />
                      </div>

                      <div className="flex gap-2">
                        <div className="w-full">
                          <div className="form-group">
                            <label className="text-zinc-900 font-bold">
                              Tipo comercial
                            </label>
                            <Input readonly value={data.comercialType} />
                          </div>
                        </div>

                        {data.comercialType == "renting" && (
                          <div className="w-full grid grid-cols-2 gap-6">
                            <div className="form-group">
                              <label className="text-zinc-900 font-bold">
                                Valor
                              </label>
                              <Input readonly value={data.schedulingTax} />
                            </div>
                            <div className="form-group">
                              <label className="text-zinc-900 font-bold">
                                Tempo
                              </label>
                              <Input value={data.schedulingPeriod} readonly />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-4 pb-2">
                    <h4 className="text-2xl text-zinc-900 mb-2">Transporte</h4>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="form-group">
                        <label className="text-zinc-900 font-bold">
                          Este produto é frágil?
                        </label>
                        <Input readonly value={data.fragility ?? "Sim"} />
                      </div>

                      <div className="form-group">
                        <label className="text-zinc-900 font-bold">
                          Veículo recomendado
                        </label>
                        <Input readonly value={data.vehicle} />
                      </div>

                      <div className="form-group">
                        <label className="text-zinc-900 font-bold">
                          Taxa de entrega
                        </label>
                        <Input
                          readonly
                          value={data.freeTax}
                          placeholder="R$ 00,00"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t pt-2 pb-2">
                    <div className="grid gap-2">
                      <div className="form-group">
                        <label className="text-zinc-900 font-bold">
                          Exibir na minha loja
                        </label>
                        {data.status ?? "visible"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="w-full max-w-[24rem]">
                <div className="rounded-2xl border p-8">
                  Acompanhe sua entrega
                </div>
              </div>
            </div>
          </div>
        </section>
      </Template>
    )
  );
}
