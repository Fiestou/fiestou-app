import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Image from "next/image";
import Link from "next/link";
import Cookies from "js-cookie";
import Api from "@/src/services/api";
import { useEffect, useState } from "react";
import { ProductType, getPrice } from "@/src/models/product";
import { NextApiRequest, NextApiResponse } from "next";
import {
  dateBRFormat,
  findDates,
  getImage,
  getSummary,
  moneyFormat,
} from "@/src/helper";
import { Button } from "@/src/components/ui/form";
import { RemoveToCart } from "@/src/components/pages/carrinho";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Img from "@/src/components/utils/ImgBase";

export async function getServerSideProps({
  req,
  res,
}: {
  req: NextApiRequest;
  res: NextApiResponse;
}) {
  const api = new Api();

  const parse = req.cookies["fiestou.cart"] ?? "";
  const cart = !!parse ? JSON.parse(parse) : [];

  let request: any = await api.content({
    url: "default",
  });

  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};

  request = await api.get({
    url: "request/products",
    data: {
      whereIn: cart.map((item: any) => item.product),
    },
  });

  const products = request?.data ?? [];

  cart.map((item: any, key: any) => {
    let handle = products.find((prod: any) => prod.id == item.product);

    if (!!handle) {
      cart[key]["product"] = handle;
    }
  });

  return {
    props: {
      cart: cart,
      products: products,
      DataSeo: DataSeo,
      Scripts: Scripts,
    },
  };
}

export default function Carrinho({
  cart,
  DataSeo,
  Scripts,
}: {
  cart: any;
  DataSeo: any;
  Scripts: any;
}) {
  const [listCart, setListCart] = useState(cart);

  const [dates, setDates] = useState(
    listCart.map((item: any) => item.details.dateStart)
  );

  const [subtotal, setSubtotal] = useState(
    listCart.reduce((acumulador: number, item: any) => {
      return acumulador + parseFloat(item.total);
    }, 0) as number
  );

  const [resume, setResume] = useState({
    subtotal: subtotal,
    total: subtotal,
    startDate: findDates(dates).minDate,
    endDate: findDates(dates).maxDate,
  } as any);

  const removeItemCart = (key: number) => {
    let listHandle = listCart.filter(
      (item: any, index: number) => index != key
    );

    let subtotalHandle = listHandle.reduce((acumulador: number, item: any) => {
      return acumulador + item.total;
    }, 0);

    let datesHandle = listHandle.map((item: any) => item.details.dateStart);

    setListCart(listHandle);
    setDates(datesHandle);
    setSubtotal(subtotalHandle);

    setResume({
      subtotal: subtotalHandle,
      total: subtotalHandle,
      startDate: findDates(datesHandle).minDate,
      endDate: findDates(datesHandle).maxDate,
    } as any);

    RemoveToCart(key);
  };

  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `Carrinho | ${DataSeo?.site_text}`,
        url: `carrinho`,
      }}
      header={{
        template: "clean",
        position: "solid",
      }}
      footer={{
        template: "clean",
      }}
    >
      {!!listCart.length ? (
        <>
          <section className="py-6 md:py-10">
            <div className="container-medium">
              <div className="grid md:flex gap-4 md:gap-10 items-start">
                <div className="grid gap-6 w-full">
                  <div className="pb-4 md:pb-6 border-b">
                    <div className="pb-4">
                      <Breadcrumbs
                        links={[
                          { url: "/produtos", name: "Produtos" },
                          { url: "/carrinho", name: "Carrinho" },
                        ]}
                      />
                    </div>
                    <div className="flex items-center">
                      <Link passHref href="/produtos">
                        <Icon
                          icon="fa-long-arrow-left"
                          className="mr-4 md:mr-6 text-2xl text-zinc-900"
                        />
                      </Link>
                      <div className="font-title font-bold text-3xl md:text-4xl flex gap-4 items-center text-zinc-900">
                        Meu carrinho
                      </div>
                    </div>
                  </div>

                  {!!listCart.length &&
                    listCart.map((item: any, key: any) => (
                      <div
                        key={key}
                        className="border-b pb-6 flex gap-2 md:gap-4"
                      >
                        <div className="w-full max-w-[4rem] pt-1">
                          <div className="aspect aspect-square rounded-md relative overflow-hidden bg-zinc-200">
                            {!!item?.product?.gallery?.length &&
                              !!getImage(
                                item?.product?.gallery[0],
                                "thumb"
                              ) && (
                                <Img
                                  src={getImage(
                                    item?.product?.gallery[0],
                                    "thumb"
                                  )}
                                  size="md"
                                  className="absolute object-cover h-full inset-0 w-full"
                                />
                              )}
                          </div>
                        </div>
                        <div className="w-full">
                          <div className="flex gap-10 items-start">
                            <div className="w-full">
                              <h5 className="font-title font-bold text-zinc-900 text-xl">
                                {item.product.title}
                              </h5>
                              <div className="mt-2 text-sm flex flex-wrap gap-1">
                                {!!item.product?.subtitle && (
                                  <div>
                                    <div
                                      className="break-words whitespace-pre-wrap inline-block"
                                      dangerouslySetInnerHTML={{
                                        __html: item.product?.subtitle,
                                      }}
                                    ></div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="w-fit text-right flex items-center gap-4">
                              {/* <b className="pt-[2px] text-zinc-900">
                                {item.quantity}x
                              </b> */}
                              <h3 className="font-bold text-xl whitespace-nowrap leading-tight text-zinc-900">
                                R$ {moneyFormat(item.total)}
                              </h3>
                            </div>
                          </div>
                          <div className="flex items-end">
                            <div className="w-full text-sm text-zinc-600 pt-2">
                              <div className="flex gap-1">
                                Data:
                                <span>
                                  {dateBRFormat(item.details.dateStart)}
                                </span>
                              </div>
                              <div className="flex gap-1">
                                Fornecido por:
                                <span className="font-semibold text-zinc-900">
                                  {item.product.store.title}
                                </span>
                              </div>
                            </div>
                            <div>
                              <Button
                                style="btn-link"
                                className="text-sm text-zinc-500 font-bold p-0"
                                onClick={() => removeItemCart(key)}
                              >
                                Remover
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  <Button
                    href="/produtos"
                    style="btn-link"
                    className="hover:text-yellow-400 font-medium text-xs md:text-sm ease mb-4"
                  >
                    Acessar mais produtos
                  </Button>
                </div>

                <div className="w-full md:max-w-[28rem] md:mb-[2rem] relative">
                  <div className="rounded-2xl bg-zinc-100 p-4 md:p-8">
                    <h5 className="font-title pb-6 text-zinc-900 md:text-xl font-bold">
                      Resumo
                    </h5>

                    <div className="grid gap-2">
                      <div className="flex justify-between">
                        <div className="font-bold text-sm text-zinc-900 flex items-center">
                          <Icon
                            icon="fa-calendar"
                            className="text-sm mr-2 opacity-75"
                          />
                          Data da locação
                        </div>
                        <div className="whitespace-nowrap">
                          {dateBRFormat(resume.startDate)}{" "}
                          {resume.endDate != resume.startDate
                            ? `- ${dateBRFormat(resume.endDate)}`
                            : ""}
                        </div>
                      </div>

                      <div className="border-t"></div>

                      <div className="flex">
                        <div className="w-full whitespace-nowrap">
                          Subtotal ({listCart.length}{" "}
                          {listCart.length == 1 ? "item" : "itens"})
                        </div>
                        <div className="whitespace-nowrap">
                          R$ {moneyFormat(resume.subtotal)}
                        </div>
                      </div>

                      <div className="border-t"></div>

                      <div className="flex gap-2 mb-4">
                        <div className="w-full text-zinc-900 font-bold">
                          Total
                        </div>
                        <div className="text-2xl text-zinc-900 font-bold whitespace-nowrap">
                          R$ {moneyFormat(resume.total)}
                        </div>
                      </div>

                      <div className="grid fixed md:relative bottom-0 left-0 w-full p-1 md:p-0">
                        <Button
                          style="btn-success"
                          href="checkout"
                          className="py-6 mb-4 md:mb-0"
                        >
                          Confirmar e combinar entrega
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section className="pt-12">
          <div className="container-medium grid gap-10 text-center">
            <div className="font-title font-semibold text-2xl mt-10 text-zinc-900">
              Você ainda não adicionou itens ao carrinho
            </div>
            <div>
              <Button href="/produtos">Ver produtos</Button>
            </div>
          </div>
        </section>
      )}
    </Template>
  );
}
