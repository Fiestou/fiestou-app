import { StoreType } from "@/src/models/store";
import Api from "@/src/services/api";
import Product from "@/src/components/common/Product";
import { Button } from "@/src/components/ui/form";
import Badge from "@/src/components/utils/Badge";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { NextApiRequest } from "next";
import Filter from "@/src/components/common/Filter";
import { getImage } from "@/src/helper";
import Img from "@/src/components/utils/ImgBase";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import ShareModal from "@/src/components/utils/ShareModal";
import Modal from "@/src/components/utils/Modal";
import { useState } from "react";
import { useRouter } from "next/router";

export const getStaticPaths = async (req: NextApiRequest) => {
  const api = new Api();
  let request: any = await api.get({
    url: "request/stores",
  });

  const stores = request?.data ?? [];

  const paths = stores
    .filter((post: any) => !!post.slug)
    .map((post: any) => {
      return { params: { slug: post.slug } };
    });

  return {
    paths: paths,
    fallback: "blocking",
  };
};

export async function getStaticProps(ctx: any) {
  const api = new Api();
  const { slug } = ctx.params;
  let request: any = await api.get({
    url: "content/default",
  });

  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};

  let store: any = await api.get({
    url: "request/store",
    data: {
      slug: slug,
    },
  });

  if (!store?.data) {
    return {
      notFound: true,
    };
  } else {
    store = store.data;

    let products: any = await api.get({
      url: "request/products",
      data: {
        store: store,
        limit: 15,
      },
    });

    return {
      props: {
        products: products.data ?? [],
        store: store,
        HeaderFooter: HeaderFooter,
        Scripts: Scripts,
        DataSeo: DataSeo,
      },
      revalidate: 60 * 60 * 60,
    };
  }
}

export default function Store({
  products,
  store,
  HeaderFooter,
  DataSeo,
  Scripts,
}: {
  products: Array<any>;
  store: StoreType;
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
}) {
  const { isFallback } = useRouter();

  const [listProducts, setListProducts] = useState(products as Array<any>);
  const [share, setShare] = useState(false as boolean);
  const [page, setPage] = useState(0 as number);
  const [loading, setLoading] = useState(false as boolean);

  const getProducts = async () => {
    setLoading(true);

    let number = page + 1;
    setPage(number);

    const api = new Api();

    let limit = 15;
    let offset = number * 15;

    let request: any = await api.get({
      url: "request/products",
      data: {
        store: store?.slug,
        limit: limit,
        offset: offset,
      },
    });

    const handle = request.data;

    if (!handle?.length) {
      setPage(-1);
    } else {
      setListProducts([...listProducts, ...handle]);
    }

    setLoading(false);
  };

  const baseUrl = `https://fiestou.com.br/${store?.slug}`;

  if (isFallback) {
    return <></>;
  }

  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `${store?.title} - ${DataSeo?.site_text} - ${DataSeo?.site_description}`,
        image: !!getImage(store?.cover, "default")
          ? getImage(store?.cover)
          : !!getImage(DataSeo?.site_image)
          ? getImage(DataSeo?.site_image)
          : "",
        description: !!store?.description
          ? store?.description
          : DataSeo?.site_description,
      }}
      header={{
        template: "default",
        position: "fixed",
        content: HeaderFooter,
      }}
      footer={{
        template: "default",
        content: HeaderFooter,
      }}
    >
      <section className="pb-10 pt-[4.25rem]">
        <div className="container-medium">
          <div className="py-4 md:py-6">
            <Breadcrumbs links={[{ url: "/parceiros", name: "Parceiros" }]} />
          </div>
          <div className="aspect-[6/2.5] rounded-lg md:rounded-2xl relative overflow-hidden -mb-10 md:mb-6 bg-zinc-100">
            {!!getImage(store?.cover, "default") && (
              <Img
                src={getImage(store?.cover, "default")}
                size="7xl"
                className="absolute object-cover h-full inset-0 w-full"
              />
            )}
          </div>
          <div className="grid md:flex gap-4 md:gap-6">
            <div className="w-full">
              <div className="grid md:flex justify-center md:justify-start gap-2 md:gap-6 items-center">
                <div className="text-center">
                  <div className="rounded-full p-10 border relative overflow-hidden inline-block">
                    {!!getImage(store?.profile, "thumb") && (
                      <Img
                        src={getImage(store?.profile, "thumb")}
                        size="xs"
                        className="absolute object-cover h-full inset-0 w-full"
                      />
                    )}
                  </div>
                </div>
                <div className="w-full md:grid text-zinc-900">
                  <div className="text-center md:text-left md:flex flex-wrap items-center gap-2">
                    <h1 className="font-title font-bold text-2xl md:text-4xl md:mb-1">
                      {store?.title}
                    </h1>
                    <div>
                      <Badge style="success" className="text-xs md:text-sm">
                        Aberto agora
                      </Badge>
                    </div>
                  </div>
                  <div className="flex justify-center md:justify-start items-center gap-1">
                    <Icon
                      icon="fa-star"
                      type="fa"
                      className="text-yellow-500"
                    />
                    <strong>5.0</strong>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full md:w-fit">
              <div className="flex justify-center gap-2">
                <div className="">
                  <Button
                    onClick={() => setShare(true)}
                    style="btn-white"
                    className="py-2 md:py-3 px-5 flex h-full border-0"
                  >
                    <Icon icon="fa-share-alt"></Icon>
                    <span className="hidden md:block">Compartilhar</span>
                  </Button>
                  <Modal
                    title="Compartilhe:"
                    status={share}
                    size="sm"
                    close={() => setShare(false)}
                  >
                    <ShareModal
                      url={baseUrl}
                      title={`${store?.title} - Fiestou`}
                    />
                  </Modal>
                </div>
                <div className="">
                  <Button
                    style="btn-white"
                    className="py-2 md:py-3 px-5 flex h-full border-0"
                  >
                    <Icon icon="fa-heart"></Icon>
                    <span className="hidden md:block">Salvar</span>
                  </Button>
                </div>
                <div className="hidden">
                  <Button
                    style="btn-white"
                    className="py-2 md:py-3 px-5 flex h-full border-0"
                  >
                    <Icon icon="fa-comment-alt-lines"></Icon>
                    <span className="hidden md:block">Mensagem</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {!!store?.description && (
            <div className="lg:w-1/2 mt-4 md:mt-6">
              {store?.description}
              {/* <div className="text-zinc-900 font-bold underline mt-4">
                Ver mais
              </div> */}
            </div>
          )}
        </div>
      </section>

      <div className="container-medium">
        <h3 className="font-title title-underline text-zinc-900 font-bold text-2xl md:text-4xl">
          Produtos
        </h3>
      </div>

      <Filter store={store?.slug} />

      <section className="py-4 md:pb-20">
        <div className="container-medium">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 py-6">
            {!!listProducts?.length &&
              listProducts.map((item, key) => (
                <Product key={key} product={item}></Product>
              ))}
          </div>
          {page != -1 && (
            <div className="text-center">
              <Button
                onClick={() => {
                  getProducts();
                }}
                loading={loading}
              >
                Carregar mais
              </Button>
            </div>
          )}
        </div>
      </section>
    </Template>
  );
}
