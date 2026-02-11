import { StoreType, DayType } from "@/src/models/store";
import Api from "@/src/services/api";
import Product from "@/src/components/common/Product";
import { Button } from "@/src/components/ui/form";
import Badge from "@/src/components/utils/Badge";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { NextApiRequest } from "next";

import { getImage } from "@/src/helper";
import Img from "@/src/components/utils/ImgBase";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import ShareModal from "@/src/components/utils/ShareModal";
import Modal from "@/src/components/utils/Modal";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { FilterQueryType } from "@/src/types/filtros";
import Filter from "@/src/components/common/filters/Filter";
import { getStoreUrl } from "@/src/urlHelpers";
import { MapPin, Truck, Instagram, Facebook, Phone, Globe, Clock, ExternalLink } from "lucide-react";


export interface Store {
  title: string;
  slug?: string;
}

export interface Product {
  title: string;
  subtitle?: string;
  price: number;
  cover?: string;
  store: Store;
  slug?: string;
}

export const getStaticPaths = async (req: NextApiRequest) => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export async function getStaticProps(ctx: any) {
  const api = new Api();
  const { slug } = ctx.params;

  let request: any = await api.content({
    method: 'get',
    url: `default`,
  });

  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};

  let store: any = await api.request({
    method: "get",
    url: "request/store",
    data: {
      slug: slug,
    },
  });
  if (!store?.data || store.data === false || store.data?.response === false) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  } else {
    store = store.data;

    let products: any = await api.request({
      method: "get",
      url: "request/products",
      data: {
        store: store.id,
        user: store.user,
        limit: 16,
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
  const [handleParams, setHandleParams] = useState({} as FilterQueryType);
  const [mounted, setMounted] = useState(false);

  const socialLinks = (() => {
    const meta = typeof store?.metadata === "string" ? (() => { try { return JSON.parse(store.metadata); } catch { return {}; } })() : (store?.metadata ?? {});
    return meta?.social_links ?? {};
  })();

  const openClose: DayType[] = (() => {
    if (Array.isArray(store?.openClose)) return store.openClose;
    if (typeof store?.openClose === "string") { try { return JSON.parse(store.openClose); } catch { return []; } }
    return [];
  })();

  const isStoreOpen = () => {
    if (!openClose.length) return null;
    const now = new Date();
    const dayIndex = now.getDay();
    const currentDay = openClose[dayIndex];
    if (!currentDay || currentDay.working !== "on") return false;
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    return currentTime >= (currentDay.open || "00:00") && currentTime <= (currentDay.close || "23:59");
  };

  const storeOpen = mounted ? isStoreOpen() : null;
  const hasSocial = socialLinks.instagram || socialLinks.facebook || socialLinks.whatsapp || socialLinks.website;

  // Função para buscar produtos com filtros e paginação
  const fetchProducts = async (params: any) => {
    setLoading(true);
    const api = new Api();
    const limit = 16;
    const offset = 0; // sempre começa do início ao filtrar

    const request: any = await api.request({
      method: "get",
      url: "request/products",
      data: {
        ...params,
        store: store?.id,
        user: store?.user,
        limit,
        offset,
      },
    });

    const items = request.data ?? [];
    setLoading(false);

    return {
      items,
      total: items.length,
      page: 0,
      pageSize: limit,
      pages: Math.ceil((items.length || 1) / limit),
    };
  };

  // Função para atualizar a lista de produtos ao filtrar
  const handleFilterResults = (data: any) => {
    setListProducts(data.items);
    setPage(data.page);
  };

  const getProducts = async (reset = false, params = handleParams, pageNumber = page) => {
    setLoading(true);

    let number = reset ? 0 : pageNumber + 1;
    if (reset) {
      setPage(0);
      setListProducts([]); 
    } else {
      setPage(number);
    }

    const api = new Api();
    let limit = 16;
    let offset = number * 16;

   

    let request: any = await api.request({
      method: "get",
      url: "request/products",
      data: {
        ...params,
        store: store?.id,
        user: store?.user,
        limit: limit,
        offset: offset,
      },
    });

    const handle = request?.data;

    if (!handle?.length) {
      setPage(-1);
    } else {
      // Se reset, substitui. Se não, adiciona.
      setListProducts(reset ? handle : [...listProducts, ...handle]);
    }

    setLoading(false);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    getProducts();
  }, []);

  const baseUrl = `${process.env.APP_URL}${getStoreUrl(store)}`;
  const storeImage = getImage(store?.cover, "default") || getImage(DataSeo?.site_image) || "";
  const storeDescription = store?.description || DataSeo?.site_description;

  const storeJsonLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "name": store?.title,
    "description": storeDescription,
    "image": storeImage,
    "url": baseUrl,
    ...(store?.street && store?.city && {
      "address": {
        "@type": "PostalAddress",
        "streetAddress": `${store.street}${store.number ? `, ${store.number}` : ''}`,
        "addressLocality": store.city,
        "addressRegion": store.state,
        "postalCode": store.zipCode,
        "addressCountry": "BR"
      }
    })
  };

  if (isFallback) {
    return null;
  }


  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `${store?.title} - ${DataSeo?.site_text} - ${DataSeo?.site_description}`,
        image: storeImage,
        description: storeDescription,
        url: getStoreUrl(store),
        canonical: baseUrl,
        jsonLd: storeJsonLd,
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
            <Breadcrumbs
              links={[
                { url: "/parceiros", name: "Parceiros" },
                { url: getStoreUrl(store), name: store?.title },
              ]}
            />
          </div>
          <div className="aspect-[6/2.5] rounded-lg md:rounded-2xl relative overflow-hidden -mb-10 md:mb-6 bg-zinc-100">
            {!!getImage(store?.cover, "lg") && (
              <Img
                src={getImage(store?.cover, "lg")}
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
                    {storeOpen !== null && (
                      <Badge style={storeOpen ? "success" : "default"} className="text-xs md:text-sm">
                        {storeOpen ? "Aberto agora" : "Fechado"}
                      </Badge>
                    )}
                  </div>
                  <div className="flex justify-center md:justify-start items-center gap-3 mt-1 flex-wrap">
                    {store?.city && (
                      <span className="flex items-center gap-1 text-sm text-zinc-500">
                        <MapPin size={14} />
                        {store.city}, {store.state}
                      </span>
                    )}
                    {store?.hasDelivery && (
                      <span className="flex items-center gap-1 text-sm text-zinc-500">
                        <Truck size={14} />
                        Entrega disponivel
                      </span>
                    )}
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
                {socialLinks.whatsapp && (
                  <a
                    href={`https://wa.me/55${socialLinks.whatsapp.replace(/\D/g, "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 md:py-3 px-5 flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Phone size={16} />
                    <span className="hidden md:block">WhatsApp</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {!!store?.description && (
            <div className="lg:w-1/2 mt-4 md:mt-6 text-zinc-700">
              {store?.description}
            </div>
          )}

          {hasSocial && (
            <div className="flex items-center gap-3 mt-4">
              {socialLinks.instagram && (
                <a href={socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-pink-500 transition-colors">
                  <Instagram size={18} />
                  <span className="hidden md:inline">Instagram</span>
                </a>
              )}
              {socialLinks.facebook && (
                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-blue-600 transition-colors">
                  <Facebook size={18} />
                  <span className="hidden md:inline">Facebook</span>
                </a>
              )}
              {socialLinks.website && (
                <a href={socialLinks.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-800 transition-colors">
                  <Globe size={18} />
                  <span className="hidden md:inline">Site</span>
                </a>
              )}
            </div>
          )}

          <div className="mt-6 md:mt-8">
            {(store?.street || store?.city) && (
              <div className="bg-zinc-50 rounded-xl p-4 md:p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <MapPin size={16} className="text-zinc-400" />
                      <span className="font-medium text-sm text-zinc-900">Endereco</span>
                    </div>
                    <p className="text-sm text-zinc-600">
                      {store?.street}{store?.number ? `, ${store.number}` : ''}
                      {store?.complement ? ` - ${store.complement}` : ''}
                      {' - '}
                      {store?.neighborhood}{store?.city ? `, ${store.city}` : ''}
                      {store?.state ? ` - ${store.state}` : ''}
                    </p>
                  </div>
                  {store?.city && store?.state && (
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                        `${store.street || ''} ${store.number || ''}, ${store.neighborhood || ''}, ${store.city} - ${store.state}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 whitespace-nowrap"
                    >
                      <ExternalLink size={14} />
                      Ver no mapa
                    </a>
                  )}
                </div>
              </div>
            )}

          </div>
        </div>
      </section>

      <div className="container-medium">
        <h3 className="font-title title-underline text-zinc-900 font-bold text-2xl md:text-4xl">
          Produtos
        </h3>
      </div>

      <div className="relative pt-5">
        <Filter
          store={store?.id}
          context="store"
          fetchProducts={fetchProducts}
          onResults={handleFilterResults}
        />
      </div>

      <section className="py-4 md:pb-20">
        <div className="container-medium">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 py-6">
            {!!listProducts?.length &&
              listProducts.map((item, key) => (
                <Product
                  key={key}
                  product={item}
                  {...(store?.title ? { storeTitle: store.title } : {})}
                />
              ))}
          </div>
          {page != -1 && (
            <div className="text-center">
              <Button
                onClick={() => {
                  getProducts(false, handleParams, page);
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