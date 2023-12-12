import Image from "next/image";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { Button } from "@/src/components/ui/form";
import { NextApiRequest, NextApiResponse } from "next";
import Api from "@/src/services/api";
import { ProductType, getPrice } from "@/src/models/product";
import { moneyFormat } from "@/src/helper";
import { useEffect, useState } from "react";
import Img from "@/src/components/utils/ImgBase";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Cookies from "js-cookie";

export async function getServerSideProps(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const api = new Api();

  const store: any = await api.graph(
    {
      url: "content/graph",
      data: [
        {
          model: "store",
        },
      ],
    },
    req
  );

  const hasStore = !!store?.data?.query?.store ?? false;

  let products: any = [];

  if (hasStore) {
    let request: any = await api.graph(
      {
        url: "content/graph",
        data: [
          {
            model: "product as products",
          },
        ],
      },
      req
    );

    products = request?.data?.query?.products ?? [];
  }

  return {
    props: {
      hasStore: hasStore,
    },
  };
}

export default function Produtos({ hasStore }: { hasStore: boolean }) {
  const api = new Api();

  const [products, setProducts] = useState([] as Array<any>);
  const getProducts = async () => {
    let request: any = await api.get({
      url: "request/products",
    });

    setProducts(request.data ?? []);
  };

  useEffect(() => {
    if (!!window) {
      getProducts();
    }
  }, []);

  return (
    <Template
      header={{
        template: "admin",
        position: "solid",
      }}
      footer={{
        template: "clean",
      }}
    >
      <section className="">
        <div className="container-medium pt-12">
          <div className="pb-4">
            <Breadcrumbs
              links={[
                { url: "/admin", name: "Admin" },
                { url: "/admin/produtos", name: "Produtos" },
              ]}
            />
          </div>
          <div className="lg:flex items-center">
            <Link passHref href="/admin">
              <Icon
                icon="fa-long-arrow-left"
                className="mr-4 lg:mr-6 text-2xl text-zinc-900"
              />
            </Link>
            <div className="grid md:flex gap-4 items-center w-full">
              <div className="w-full">
                <div className="font-title font-bold text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900">
                  Produtos
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="pt-6">
        <div className="container-medium pb-12">
          <div className="border border-t-0 grid md:grid-cols-2 lg:block w-full">
            <div className="hidden lg:flex border-t bg-zinc-100 p-4 lg:p-8 gap-4 lg:gap-8 font-bold text-zinc-900 font-title">
              <div className="w-full">Produto</div>
              <div className="w-[32rem] max-w-[6rem]">Estoque</div>
              <div className="w-[32rem]">Preço</div>
              <div className="w-[32rem]">Exibição</div>
              <div className="w-[32rem]">Tipo</div>
              <div className="w-[32rem]">Ações</div>
            </div>
            {!!products.length &&
              products.map((item, key) => (
                <div
                  key={key}
                  className="grid grid-cols-2 lg:flex border-t p-4 lg:p-8 gap-2 lg:gap-8 text-zinc-900 hover:bg-zinc-50 bg-opacity-5 ease items-center"
                >
                  <div className="col-span-2 w-full flex items-center gap-4">
                    <div className="aspect-square relative overflow-hidden w-[4rem] rounded-md bg-zinc-100">
                      {!!item?.gallery?.length ? (
                        <Img
                          src={
                            item?.gallery[0]?.base_url +
                            item?.gallery[0]?.details?.sizes["sm"]
                          }
                          size="xs"
                          className="absolute object-cover h-full inset-0 w-full"
                        />
                      ) : (
                        <Icon
                          icon="fa-image"
                          className="text-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-25"
                        />
                      )}
                    </div>
                    <div className="font-semibold">{item.title}</div>
                  </div>
                  <div className="w-full lg:w-[32rem] lg:max-w-[6rem] text-center">
                    {item?.details?.quantity ? (
                      <div className="rounded-md bg-zinc-100 py-2">
                        {item?.details?.quantity}
                      </div>
                    ) : (
                      <div className="rounded-md bg-zinc-100 py-3 px-2 text-xs whitespace-nowrap">
                        sem estoque
                      </div>
                    )}
                  </div>
                  <div className="w-full lg:w-[32rem] text-center">
                    <div className="rounded-md bg-zinc-100">
                      <div className="w-full py-2">
                        R$ {getPrice(item).price}
                      </div>
                    </div>
                  </div>
                  <div className="w-full lg:w-[32rem] text-center">
                    <div className="rounded-md bg-zinc-100 py-2">
                      {!!item.status ? "Exibindo" : "Oculto"}
                    </div>
                  </div>
                  <div className="w-full lg:w-[32rem] text-center">
                    <div className="rounded-md bg-zinc-100 py-2">
                      Para alugar
                    </div>
                  </div>
                  <div className="col-span-2 w-full lg:w-[32rem] text-center grid grid-cols-3 gap-2">
                    <Link
                      href={`/admin/produtos/${item.id}`}
                      className="rounded-md bg-zinc-100 hover:bg-yellow-300 ease py-2 px-3"
                    >
                      <Icon icon="fa-eye" type="far" />
                    </Link>
                    {/* <button className="rounded-md bg-zinc-100 hover:bg-yellow-300 ease py-2 px-3">
                      <Icon icon="fa-trash" type="far" />
                    </button> */}
                  </div>
                </div>
              ))}
          </div>
          <div className="pt-4">Mostrando 1 página de 1 com 4 produtos</div>
        </div>
      </section>
    </Template>
  );
}
