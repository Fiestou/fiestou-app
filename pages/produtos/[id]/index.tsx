import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import Template from "@/src/template";
import Api from "@/src/services/api";
import {
  AttributeType,
  CommentType,
  ProductType,
  getPriceValue,
} from "@/src/models/product";
import {
  dateFormat,
  getAllowedRegionsDescription,
  getImage,
  isCEPInRegion,
  isMobileDevice,
} from "@/src/helper";
import { Button } from "@/src/components/ui/form";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { AddToCart, GetCart } from "@/src/components/pages/carrinho";
import {
  AttributeProductOrderType,
  ProductOrderType,
  VariationProductOrderType,
} from "@/src/models/product";
import { StoreType } from "@/src/models/store";
import Newsletter from "@/src/components/common/Newsletter";
import { ColorfulRender, ColorsList } from "@/src/components/ui/form/ColorsUI";
import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Modal from "@/src/components/utils/Modal";
import ShareModal from "@/src/components/utils/ShareModal";
import { RelationType } from "@/src/models/relation";
import LikeButton from "@/src/components/ui/LikeButton";
import RelatedProducts from "../components/related-products/RelatedProducts";
import { getProductUrl, getStoreUrl } from "@/src/urlHelpers";
import ProductCombinations from "../components/product-combinations/ProductCombinations";
import TrustedPartnerBadge from "../components/trusted-partner-badge/TrustedPartnerBadge";
import EasyCancelBadge from "../components/easy-cancel-badge/EasyCancelBadge";
import SafePaymentBadge from "../components/safe-payment-badge/SafePaymentBadge";
import ProductDimensions from "../components/product-dimensions/ProductDimensions";
import BottomCart from "../components/bottom-cart/BottomCart";
import ProductDeliveryBadge from "../components/product-delivery-badge/ProductDeliveryBadge";
import ProductDeliveryCalendar from "../components/product-delivery-calendar/ProductDeliveryCalendar";
import ProductShippingCalculator from "../components/product-shipping-calculator/ProductShippingCalculator";
import ProductAttributes from "../components/product-attributes/ProductAttributes";
import ProductPriceDisplay from "../components/product-price-display/ProductPriceDisplay";
import ProductDescription from "../components/product-description/ProductDescription";
import ProductBadges from "../components/product-badges/ProductBadges";
import ProductGallery from "../components/product-gallery/ProductGallery";

export const getStaticPaths = async (ctx: any) => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export async function getStaticProps(ctx: any) {
  const api = new Api();
  const { id } = ctx.params;

  let request: any = await api.request(
    {
      method: "get",
      url: "request/product",
      data: {
        id: id,
      },
    },
    ctx
  );

  if (!request?.response) {
    return {
      notFound: true,
    };
  } else {
    const product = request.data;
    const comments = product?.comments ?? [];
    const store = product?.store ?? {};

    request = await api.content(
      {
        method: "get",
        url: "products",
      },
      ctx
    );

    const categories = request?.data?.categories ?? {};
    const HeaderFooter = request?.data?.HeaderFooter ?? {};
    const DataSeo = request?.data?.DataSeo ?? {};
    const Scripts = request?.data?.Scripts ?? {};

    return {
      props: {
        product: product,
        comments: comments ?? [],
        store: store,
        categories: categories ?? {},
        HeaderFooter: HeaderFooter,
        DataSeo: DataSeo,
        Scripts: Scripts,
      },
      revalidate: 60 * 60 * 3,
    };
  }
}

export default function Produto({
  product,
  comments,
  store,
  categories,
  HeaderFooter,
  DataSeo,
  Scripts,
}: {
  product: ProductType;
  comments: Array<CommentType>;
  store: StoreType;
  categories: any;
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
}) {
  const api = new Api();
  const { isFallback } = useRouter();
  const [swiperInstance, setSwiperInstance] = useState(null as any);

  const [share, setShare] = useState(false as boolean);
  const baseUrl = `https://fiestou.com.br${getProductUrl(product, store)}`;
  const [loadCart, setLoadCart] = useState(false as boolean);
  const [blockdate, setBlockdate] = useState(Array<string>());

  const [days, setDays] = useState(1);
  const [cep, setCep] = useState("");
  const [cepError, setCepError] = useState(false);
  const [cepErrorMessage, setCepErrorMessage] = useState<string | null>(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [cartModal, setCartModal] = useState(false as boolean);
  const [inCart, setInCart] = useState(false as boolean);
  const [unavailable, setUnavailable] = useState([] as Array<string>);
  const [activeVariations, setActiveVariations] = useState([] as Array<any>);
  const [layout, setLayout] = useState({} as any);

  const [productToCart, setProductToCart] = useState<ProductOrderType>({
    product: product?.id,
    attributes: [],
    quantity: 1,
    details: {},
    total: getPriceValue(product).price,
  });

  const imageCover =
    !!product?.gallery && !!product?.gallery?.length ? product?.gallery[0] : {};

  const formatMoney = (value: any): string => {
    const num =
      typeof value === "string"
        ? parseFloat(value.replace(/\./g, "").replace(",", "."))
        : Number(value);
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  useEffect(() => {
    setBlockdate(product.unavailableDates ?? []);
  }, [product]);

  const persistDeliveryInfo = (fee: number | null, sanitizedZip?: string) => {
    setProductToCart((prev) => {
      const nextDetails = { ...(prev?.details ?? {}) };

      if (fee === null || Number.isNaN(fee)) {
        delete nextDetails.deliveryFee;
        delete nextDetails.deliveryZipCode;
        delete nextDetails.deliveryZipCodeFormatted;
        delete nextDetails.deliveryStoreId;
      } else {
        const storeIdRaw =
          typeof store?.id !== "undefined"
            ? store?.id
            : typeof product?.store === "object"
            ? product?.store?.id
            : product?.store;

        const zipSanitized = sanitizedZip ?? cep.replace(/\D/g, "");
        const zipFormatted = formatCep(zipSanitized);

        nextDetails.deliveryFee = fee;
        nextDetails.deliveryZipCode = zipSanitized;
        nextDetails.deliveryZipCodeFormatted = zipFormatted;

        const storeId = Number(storeIdRaw);
        if (Number.isFinite(storeId)) {
          nextDetails.deliveryStoreId = storeId;
        } else {
          delete nextDetails.deliveryStoreId;
        }
      }

      return {
        ...prev,
        details: nextDetails,
      };
    });
  };
  const handleQuantity = (q: any) => {
    const qtd = Number(q);

    updateOrderTotal({
      ...productToCart,
      quantity: !!qtd ? qtd : 1,
    });
  };

  const updateOrderTotal = (orderUpdate: ProductOrderType) => {
    let price = 0;

    orderUpdate.attributes.map((attr: AttributeProductOrderType) =>
      attr.variations.map((variate, key) => {
        const variatePrice =
          typeof variate?.price == "string"
            ? variate?.price.replace(",", ".")
            : variate?.price;
        price += (Number(variatePrice) ?? 1) * (variate?.quantity ?? 1);
      })
    );

    let total = getPriceValue(product).price + price;

    if (!!orderUpdate?.details?.days) {
      total = total * orderUpdate?.details?.days;
    }

    if (!!product?.schedulingDiscount) {
      const schedulingDiscount = product?.schedulingDiscount ?? 1;
      total = total - (total * schedulingDiscount) / 100;
    }

    total = total * orderUpdate.quantity;

    let handle = {
      ...orderUpdate,
      total: total,
    };

    setProductToCart(handle);
  };

  const updateOrder = (
    value: VariationProductOrderType,
    attr: AttributeType
  ) => {
    let handleVariations: any = {};

    let limit = attr?.limit ?? 0;
    let orderUpdate: ProductOrderType = productToCart;

    if (
      !orderUpdate.attributes.filter(
        (fltr: AttributeProductOrderType) => fltr.id == attr.id
      ).length
    ) {
      orderUpdate.attributes.push({
        id: attr.id,
        variations: [],
      });
    }

    orderUpdate.attributes.map(
      (attribute: AttributeProductOrderType, key: number) => {
        if (attribute.id == attr.id) {
          let variations: any = orderUpdate.attributes[key].variations;

          if (attr.selectType == "radio") {
            variations = [value];
          }

          if (attr.selectType == "checkbox") {
            variations = !!variations.filter((item: any) => item.id == value.id)
              .length
              ? variations.filter((item: any) => item.id != value.id)
              : !limit || variations.length < limit
              ? [...variations, value]
              : variations;
          }

          if (attr.selectType == "quantity") {
            variations = !!variations.filter((item: any) => item.id == value.id)
              .length
              ? variations
                  .map((item: any) =>
                    item.id == value.id
                      ? { ...item, quantity: value.quantity }
                      : item
                  )
                  .filter((item: any) => !!item.quantity)
              : [...variations, value];
          }

          orderUpdate.attributes[key].variations = variations;
        }
      }
    );

    orderUpdate.attributes.map((attribute: AttributeProductOrderType) => {
      attribute.variations.map((item: any) => {
        handleVariations[item.id] = item;
      });
    });

    setActiveVariations(handleVariations);
    updateOrderTotal(orderUpdate);
  };

  const handleCart = (dates?: Array<string>) => {
    let handle = GetCart()
      .filter((item: any) => item.product == product.id)
      .map((item: any) => item);

    let handleDates = [...(!!dates ? dates : unavailable)];

    if (!!handle.length) {
      handle = handle[0];

      if (!!handle?.details?.dateEnd) {
        handleDates.push(handle?.details?.dateEnd);
      }

      setInCart(handle);
    }

    if (product?.availability) {
      const today = new Date();
      const minimumDates = Array.from(
        { length: product.availability },
        (_, key) => {
          const date = new Date();
          date.setDate(today.getDate() + key + 1);
          return date.toISOString().split("T")[0];
        }
      );

      handleDates = [...handleDates, ...minimumDates];
    }

    setUnavailable(handleDates);
  };

  const sendToCart = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoadCart(true);

    if (AddToCart(productToCart)) {
      handleCart();
      setCartModal(true);
    } else {
      setLoadCart(true);
    }
  };

  interface DetailsType {
    dateStart?: Date;
    dateEnd?: Date;
    days?: number;
    schedulingDiscount?: number;
    [key: string]: any; // permite outros campos sem erro
  }

  const handleDetails = (detail: DetailsType) => {
    const details: DetailsType = {
      ...(productToCart?.details ?? {}),
      ...detail,
    };

    let days = 1;

    const date_1 = details?.dateStart ? new Date(details.dateStart) : null;
    const date_2 = details?.dateEnd ? new Date(details.dateEnd) : null;

    if (date_1 && date_2) {
      const timestampDate1 = date_1.getTime();
      const timestampDate2 = date_2.getTime();

      days = Math.round(
        Math.abs(timestampDate1 - timestampDate2) / (24 * 60 * 60 * 1000)
      );
    }

    setDays(!!days ? days : 1);

    updateOrderTotal({
      ...productToCart,
      details: {
        ...details,
        dateStart: dateFormat(details?.dateStart),
        dateEnd: dateFormat(details?.dateEnd),
        days,
        schedulingDiscount: product?.schedulingDiscount,
      },
    });
  };

  const renderComments = () => (
    <>
      {!!comments?.length && (
        <div className="mt-4 md:mt-10 bg-zinc-50 p-4 lg:p-8 rounded-xl">
          <div className="font-title font-bold text-zinc-900 mb-4">
            <Icon icon="fa-comments" type="fal" className="mr-2" />
            {comments?.length} comentário
            {comments?.length == 1 ? "" : "s"}
          </div>

          <div className="grid gap-4">
            {comments.map((item: CommentType, key: any) => (
              <div key={key} className="border-t pt-4">
                <div className="flex gap-2 items-center">
                  <div className="w-full">
                    <div className="text-zinc-900 font-bold text-sm">
                      {item.user?.name ?? ""}
                    </div>
                    <div className="flex gap-1 text-xs">
                      {[1, 2, 3, 4, 5].map((value: number) => (
                        <label key={value}>
                          <Icon
                            icon="fa-star"
                            type="fa"
                            className={`${
                              item.rate >= value
                                ? "text-yellow-500"
                                : "text-gray-300"
                            }`}
                          />
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="pt-3 text-sm">{item.text}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const handleCheckCep = async () => {
    setCepError(false);
    setCepErrorMessage(null);
    setLoadingCep(true);
    const api = new Api();

    try {
      const sanitizedCep = cep.replace(/\D/g, "");

      if (!sanitizedCep || sanitizedCep.length !== 8) {
        setCepError(true);
        setCepErrorMessage("Informe um CEP válido para calcular o frete.");
        setLoadingCep(false);
        return;
      }

      if (!isCEPInRegion(sanitizedCep)) {
        setCepError(true);
        setCepErrorMessage(
          `Por enquanto atendemos apenas ${getAllowedRegionsDescription()}.`
        );
        setLoadingCep(false);
        return;
      }

      const response = await api.request<any>({
        method: "get",
        url: `delivery-zipcode/${product?.id}/${sanitizedCep}`,
      });

      if (response?.status && response.status >= 400) {
        let apiMessage =
          response?.data?.error ||
          "Não conseguimos calcular o frete para esse CEP agora.";

        if (typeof apiMessage === "string" && apiMessage.includes("lat/lon")) {
          apiMessage =
            "Não conseguimos localizar esse endereço. Confirme o CEP e número ou escolha outro endereço próximo.";
        }
        setCepError(true);
        setCepErrorMessage(apiMessage);
        setDeliveryFee(null);
        persistDeliveryInfo(null);
        setLoadingCep(false);
        return;
      }

      const rawPrice = response?.data?.price;
      const priceValueRaw =
        rawPrice === null || rawPrice === undefined ? null : Number(rawPrice);
      const priceValue = Number.isFinite(priceValueRaw) ? priceValueRaw : null;

      setDeliveryFee(priceValue);
      persistDeliveryInfo(priceValue, sanitizedCep);

      if (!priceValue && priceValue !== 0) {
        setCepError(true);
        setCepErrorMessage(
          "Não conseguimos calcular o frete para esse CEP agora."
        );
      }
    } catch (e) {
      setCepError(true);
      setCepErrorMessage(
        "Não conseguimos calcular o frete para esse CEP agora. Tente novamente em instantes."
      );
      setDeliveryFee(null);
      persistDeliveryInfo(null);
    }

    setLoadingCep(false);
  };

  const [match, setMatch] = useState([] as Array<any>);
  const renderMatch = async () => {
    const api = new Api();

    let request: any = await api.request({
      method: "get",
      url: "request/products",
      data: {
        ignore: product.id,
        store: store?.id ?? 0,
        tags: (product?.tags ?? ",").split(",").filter((item) => !!item),
        categorias: (product?.category ?? [])
          .map((prodCat: any) => {
            let slug = null;
            if (Array.isArray(categories)) {
              // Safety check
              categories.forEach((parent: any) => {
                parent.childs?.forEach((child: any) => {
                  if (child.id === prodCat.id) {
                    slug = child.slug;
                  }
                });
              });
            }
            return slug;
          })
          .filter((slug: any) => !!slug),
        limit: 10,
      },
    });

    setMatch(request?.data ?? []);
  };

  const [productUpdated, setProductUpdated] = useState({} as ProductType);
  const getProductUpdated = async (identifier?: number | string) => {
    try {
      // monta payload conforme identifer (prioriza id, senão slug vindo do product)
      const payload: any = identifier
        ? { id: identifier }
        : { slug: product?.slug };

      const request: any = await api.request({
        method: "get",
        url: "request/product",
        data: payload,
      });

      // atualiza os dados de calendário / indisponibilidade
      handleCart(request.data.unavailable);

      // atualiza o estado local que tu já tem: productUpdated
      setProductUpdated(request.data);
    } catch (err) {
      console.error("Erro ao atualizar produto:", err);
    }
  };

  const router = useRouter();
  useEffect(() => {
    if (typeof window === "undefined") return;

    const fetchUpdated = async () => {
      // escolhe identificador: id do product (se existir) ou slug da rota
      const identifier = product?.id ?? router.query?.slug;

      if (identifier) {
        // chama a mesma função que agora aceita identifier
        await getProductUpdated(identifier);
      }

      // atualiza layout sem depender da referência antiga de layout
      setLayout((prev: any) => ({ ...prev, isMobile: isMobileDevice() }));

      if (store?.id) {
        renderMatch();
      }
    };

    fetchUpdated();
  }, [store, product?.id, router.query?.slug]);

  // versão mobile do detalhes
  const renderDetails = () => (
    <>
      <div className="border rounded-lg p-4">
        <div className="text-sm grid gap-1">
          <div className="text-zinc-900">
            Fornecido por:{" "}
            <Link
              href={getStoreUrl(store)}
              className="font-bold hover:underline"
            >
              {store?.title}
            </Link>
          </div>
          <div>
            Este parceiro {product?.assembly == "on" ? "" : "não"} disponibiliza
            montagem
          </div>
          <div className="py-2">
            <div className="border-t border-dashed"></div>
          </div>
          <div className="grid gap-3">
            {!!product?.color && (
              <div className="flex items-center gap-3 text-zinc-900">
                <div className="w-fit whitespace-nowrap pt-1">Cores:</div>
                <div className="w-full flex items-center flex-wrap gap-1">
                  {ColorsList.map(
                    (color: any, key: any) =>
                      product?.color?.indexOf(color.value) !== -1 && (
                        <Link
                          key={key}
                          href={`/produtos/listagem/?cores=${color.value}`}
                        >
                          <div>{ColorfulRender(color)}</div>
                        </Link>
                      )
                  )}
                </div>
              </div>
            )}
            <div className="w-fit whitespace-nowrap pt-1">Categorias:</div>
            {!!categories?.length &&
              categories.map(
                (category: any) =>
                  !!category?.childs &&
                  !!category?.childs?.filter((child: any) =>
                    (productUpdated?.category ?? [])
                      .map((cat: any) => cat.id)
                      .includes(child.id)
                  ).length && (
                    <div key={category.id} className="flex gap-2 text-zinc-900">
                      <div className="w-full flex items-center flex-wrap gap-1">
                        {!!category?.childs &&
                          category?.childs
                            ?.filter((child: any) =>
                              (productUpdated?.category ?? [])
                                .map((cat: any) => cat.id)
                                .includes(child.id)
                            )
                            .map((child: RelationType) => (
                              <Link
                                key={child.id}
                                href={`/produtos/listagem/?categoria=${child.slug}`}
                                className="bg-zinc-100 hover:bg-zinc-200 py-1 px-2 rounded ease"
                              >
                                {child.title}
                              </Link>
                            ))}
                      </div>
                    </div>
                  )
              )}

            {!!product?.tags && (
              <div className="flex gap-1 text-zinc-900">
                <div className="w-fit whitespace-nowrap">Tags:</div>
                <div className="w-full flex items-center flex-wrap gap-1">
                  {product?.tags
                    .split(",")
                    .filter((item) => !!item)
                    .map((item, key) => (
                      <Link
                        key={key}
                        href={`/produtos/listagem/?busca=${item}`}
                        className="bg-zinc-100 hover:bg-zinc-200 py-1 px-2 rounded ease"
                      >
                        {item}
                      </Link>
                    ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );

  const getImageAttr = (imageID: any) => {
    let imageGallery = {};

    (product?.gallery ?? [])
      .filter((img: any) => img.id == imageID)
      .map((img: any) => {
        imageGallery = img;
      });

    return imageGallery ?? "";
  };

  const navegateImageCarousel = (imageID: any) => {
    const imageIndex = product?.gallery?.findIndex((img) => img.id === imageID);

    if (imageIndex !== -1 && swiperInstance) {
      swiperInstance.slideTo(imageIndex);
    }
  };

  if (isFallback) {
    return null;
  }

  const formatCep = (v: string) =>
    v
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 9);

  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `${product?.title} - Produtos | ${DataSeo?.site_text}`,
        image: !!getImage(imageCover) ? getImage(imageCover) : "",
        description: DataSeo?.site_description,
        url: getProductUrl(product, store),
      }}
      header={{
        template: "default",
        position: "solid",
        content: HeaderFooter,
      }}
      footer={{
        template: "default",
        content: HeaderFooter,
      }}
    >
      <section className="">
        <div className="container-medium py-4 md:py-6">
          <Breadcrumbs
            links={[{ url: getProductUrl(product, store), name: "Produtos" }]}
          />
        </div>
      </section>

      <section className="">
        <div className="container-medium">
          <div className="md:flex lg:flex-nowrap gap-4 md:gap-6 lg:gap-8 items-start">
            {/* Galeria de imagens */}
            <ProductGallery
              product={productUpdated?.id ? productUpdated : product}
              layout={layout}
              renderDetails={renderDetails}
              renderComments={renderComments}
            />
            {/* Fomulário de compra */}
            <div className="w-full md:w-1/2">
              <form
                onSubmit={(e: React.FormEvent<HTMLFormElement>) =>
                  sendToCart(e)
                }
                method="POST"
              >
                {/* Inicio do produto */}
                <div className="grid md:flex gap-4 pb-4 lg:gap-10">
                  <div className="w-full pt-2 md:pt-0">
                    {/* titulo */}
                    <h1 className="font-title font-bold text-zinc-900 text-3xl">
                      {product?.title}
                    </h1>
                    {/* Venda ou aluguel */}
                    <ProductBadges product={product} comments={comments} />

                    {/* Descrição */}
                    <ProductDescription product={product} />
                  </div>

                  {/* veja o preço aqui */}
                  <ProductPriceDisplay product={product} />
                </div>

                <div className="grid gap-6">
                  {/* Não está aparecendo */}
                  <ProductAttributes
                    attributes={product?.attributes ?? []}
                    activeVariations={activeVariations}
                    updateOrder={updateOrder}
                    getImageAttr={getImageAttr}
                    navegateImageCarousel={navegateImageCarousel}
                  />

                  {/* Consulta de CEP */}
                  <ProductShippingCalculator
                    cep={cep}
                    setCep={setCep}
                    formatCep={formatCep}
                    loadingCep={loadingCep}
                    handleCheckCep={handleCheckCep}
                    cepError={cepError}
                    cepErrorMessage={cepErrorMessage}
                    deliveryFee={deliveryFee}
                  />

                  {/* Calendário */}
                  <ProductDeliveryCalendar
                    product={product}
                    productToCart={productToCart}
                    unavailable={unavailable}
                    blockdate={blockdate}
                    handleDetails={handleDetails}
                    productUpdated={productUpdated}
                  />

                  {/* Entrega */}
                  <ProductDeliveryBadge
                    product={product}
                    productToCart={productToCart}
                  />

                  {/* Carrinho e total */}
                  <BottomCart
                    productToCart={productToCart}
                    inCart={inCart}
                    isMobile={layout.isMobile}
                  />

                  {/* Butões de compartilhar e salvar como favoritos */}
                  <div className="flex gap-4 border-t pt-6">
                    <LikeButton id={product?.id} style="btn-outline-light" />
                    <Button
                      onClick={() => setShare(true)}
                      type="button"
                      style="btn-outline-light"
                      className="p-4"
                    >
                      <Icon icon="fa-share-alt" type="far" className="mx-1" />
                    </Button>
                    <Modal
                      title="Compartilhe:"
                      status={share}
                      size="sm"
                      close={() => setShare(false as boolean)}
                    >
                      <ShareModal
                        url={baseUrl}
                        title={`${store?.title} - Fiestou`}
                      />
                    </Modal>
                  </div>
                  {/* Dimensões do produto */}
                  <ProductDimensions product={product} />
                  <div className="border grid gap-2 rounded-md p-3 text-[.85rem] leading-none">
                    {/* Selo de Pagamento seguro */}
                    <SafePaymentBadge />
                    {/* Selo de cancelamento */}
                    <EasyCancelBadge />
                    {/* Selo de validade */}
                    <TrustedPartnerBadge />
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Tags e cores na verão mobile */}
          <div className="grid gap-3 py-3">
            {layout.isMobile && <div>{renderDetails()}</div>}
            {layout.isMobile && <div>{renderComments()}</div>}
          </div>
        </div>
      </section>

      {/* Produtos que combinam */}
      {!!product?.combinations?.length && (
        <ProductCombinations
          product={product}
          combinations={product.combinations}
        />
      )}

      {/* Produtos relacionados */}
      {(product?.suggestions ?? "1") === "1" && (
        <RelatedProducts product={product} store={store} />
      )}

      {/* Receba novidades e promoções */}
      <Newsletter />

      {layout.isMobile && (
        <div
          dangerouslySetInnerHTML={{
            __html: `<style>
        #whatsapp-button {
          margin-bottom: 4.5rem !important;
        }
      </style>`,
          }}
        ></div>
      )}
    </Template>
  );
}
