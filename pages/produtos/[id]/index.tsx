import Icon from "@/src/icons/fontAwesome/FIcon";
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
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { AddToCart } from "@/src/components/pages/carrinho";
import {
  ProductOrderType,
  VariationProductOrderType,
} from "@/src/models/product";
import { StoreType } from "@/src/models/store";
import Newsletter from "@/src/components/common/Newsletter";
import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { toast } from "react-toastify";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Modal from "@/src/components/utils/Modal";
import ShareModal from "@/src/components/utils/ShareModal";
import LikeButton from "@/src/components/ui/LikeButton";
import RelatedProducts from "../components/related-products/RelatedProducts";
import { getProductUrl } from "@/src/urlHelpers";
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
import ProductDetails from "../components/product-details/ProductDetails";
import ProductComments from "../components/product-comments/ProductComments";

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
  const [share, setShare] = useState(false as boolean);
  const baseUrl = `https://fiestou.com.br${getProductUrl(product, store)}`;
  const [loadCart, setLoadCart] = useState(false as boolean);
  const [blockdate, setBlockdate] = useState(Array<string>());
  const [cep, setCep] = useState("");
  const [cepError, setCepError] = useState(false);
  const [cepErrorMessage, setCepErrorMessage] = useState<string | null>(null);
  const [loadingCep, setLoadingCep] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState<number | null>(null);
  const [inCart, setInCart] = useState(false as boolean);
  const [unavailable, setUnavailable] = useState([] as Array<string>);
  const [isMobile, setIsMobile] = useState(false);
  const layout = { isMobile };
  const router = useRouter();
  const imageCover =
    !!product?.gallery && !!product?.gallery?.length ? product?.gallery[0] : {};

  const [productToCart, setProductToCart] = useState<ProductOrderType>({
    product: product?.id,
    attributes: [],
    quantity: 1,
    details: {},
    total: getPriceValue(product).price,
  });
  const [hasSelectedDate, setHasSelectedDate] = useState(false);

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

  const updateOrderTotal = (order: ProductOrderType) => {
    let price = 0;

    order.attributes.forEach((attr: any) =>
      attr.variations.forEach((v: any) => {
        const p =
          typeof v.price === "string"
            ? Number(v.price.replace(",", "."))
            : Number(v.price);

        price += (p || 0) * (v.quantity || 1);
      })
    );

    let total = getPriceValue(product).price + price;

    if (order.details?.days) {
      total *= order.details.days;
    }

    if (product?.schedulingDiscount) {
      total -= (total * product.schedulingDiscount) / 100;
    }

    total *= order.quantity;

    setProductToCart((prev) => ({ ...prev, total }));
  };

  const updateOrder = (
    value: VariationProductOrderType,
    attr: AttributeType
  ) => {
    setProductToCart((prev) => {
      const attributes = [...prev.attributes];

      const attrIndex = attributes.findIndex((a) => a.id === attr.id);

      if (attrIndex === -1) {
        attributes.push({
          id: attr.id,
          title: attr.title,
          variations: [],
        });
      }

      const index = attributes.findIndex((a) => a.id === attr.id);
      let variations = [...attributes[index].variations];

      // ✅ RADIO
      if (attr.selectType === "radio") {
        variations = [value];
      }

      // ✅ CHECKBOX
      if (attr.selectType === "checkbox") {
        const exists = variations.find((v) => v.id === value.id);
        variations = exists
          ? variations.filter((v) => v.id !== value.id)
          : variations.concat(value);
      }

      // ✅ QUANTITY (🔥 O QUE FALTAVA)
      if (attr.selectType === "quantity") {
        const existsIndex = variations.findIndex((v) => v.id === value.id);

        const qty = Number(value.quantity ?? 0);

        if (qty > 0) {
          const updatedValue = { ...value, quantity: qty };

          if (existsIndex >= 0) {
            variations[existsIndex] = updatedValue;
          } else {
            variations.push(updatedValue);
          }
        } else {
          variations = variations.filter((v) => v.id !== value.id);
        }
      }

      attributes[index] = { ...attributes[index], variations };

      return { ...prev, attributes };
    });
  };

  const sendToCart = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!hasAllAttributesSelected) {
      toast.error("Selecione todas as opções do produto");
      return;
    }

    if (!hasRequiredDate) {
      toast.error("Selecione a data de entrega");
      return;
    }

    setLoadCart(true);

    const success = AddToCart(productToCart);

    if (success) {
      setInCart(true);
      toast.success("Produto adicionado ao carrinho 🛒");
      router.push("/produtos?openCart=1");
    } else {
      toast.error("Não foi possível adicionar ao carrinho 🛒");
    }

    setLoadCart(false);
  };

  interface DetailsType {
    dateStart?: Date;
    dateEnd?: Date;
    days?: number;
    schedulingDiscount?: number;
    [key: string]: any;
  }

  const handleDetails = (detail: DetailsType) => {
    setProductToCart((prev) => {
      const mergedDetails: DetailsType = {
        ...(prev.details ?? {}),
        ...detail,
      };

      let days = 1;

      const dateStart = mergedDetails?.dateStart
        ? new Date(mergedDetails.dateStart)
        : null;

      const dateEnd = mergedDetails?.dateEnd
        ? new Date(mergedDetails.dateEnd)
        : null;

      if (dateStart && dateEnd) {
        days = Math.max(
          1,
          Math.round(
            Math.abs(dateEnd.getTime() - dateStart.getTime()) /
              (24 * 60 * 60 * 1000)
          )
        );
      }

      // ✅ Marca que a data foi escolhida
      setHasSelectedDate(!!mergedDetails?.dateStart);

      const detailsWithDates = {
        ...mergedDetails,
        dateStart: dateFormat(mergedDetails?.dateStart),
        dateEnd: dateFormat(mergedDetails?.dateEnd),
        days,
        schedulingDiscount: product?.schedulingDiscount,
      };

      const updatedOrder: ProductOrderType = {
        ...prev,
        details: detailsWithDates,
      };

      // 🔥 recalcula o total corretamente
      updateOrderTotal(updatedOrder);

      return updatedOrder;
    });
  };

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

  useEffect(() => {
    if (typeof window === "undefined") return;

    const fetchUpdated = async () => {
      setIsMobile((prev: any) => ({ ...prev, isMobile: isMobileDevice() }));
    };

    fetchUpdated();
  }, [store, product?.id, router.query?.slug]);

  useEffect(() => {
    updateOrderTotal(productToCart);
  }, [
    productToCart.attributes,
    productToCart.quantity,
    productToCart.details?.days,
  ]);

  // versão mobile do detalhes
  const renderDetails = () => (
    <ProductDetails product={product} store={store} categories={categories} />
  );

  if (isFallback) {
    return null;
  }

  const formatCep = (v: string) =>
    v
      .replace(/\D/g, "")
      .replace(/(\d{5})(\d)/, "$1-$2")
      .slice(0, 9);

  // 1️⃣ Normaliza os atributos do produto
  const productAttributes = Array.isArray(product?.attributes)
    ? product.attributes
    : [];

  // 2️⃣ Produto tem atributos?
  const productHasAttributes = productAttributes.length > 0;

  // 3️⃣ Se tem atributos, TODOS devem estar selecionados
  const hasAllAttributesSelected = !productHasAttributes
    ? true
    : productAttributes.every((attribute) => {
        const selected = productToCart.attributes.find(
          (attr: any) => attr.id === attribute.id
        );

        if (!selected) return false;

        if (attribute.selectType === "quantity") {
          return selected.variations.some((v: any) => Number(v.quantity) > 0);
        }

        return selected.variations.length > 0;
      });

  const hasRequiredDate = Boolean(hasSelectedDate);

  const canAddToCart = useMemo(() => {
    return hasAllAttributesSelected && hasRequiredDate;
  }, [hasAllAttributesSelected, hasRequiredDate]);

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
      <section>
        <div className="container-medium py-4 md:py-6">
          <Breadcrumbs
            links={[{ url: getProductUrl(product, store), name: "Produtos" }]}
          />
        </div>
      </section>

      <section>
        <div className="container-medium">
          <div className="w-full grid grid-cols-1 gap-1 md:grid-cols-2 md:gap-8">
            {/* WRAPPER ÚNICO */}

            <div className="w-full gap-4 ">
              <ProductGallery
                product={product}
                store={store}
                categories={categories}
                layout={layout}
                renderDetails={renderDetails}
              />

              <div className="hidden md:block">
                <ProductDetails
                  product={product}
                  store={store}
                  categories={categories}
                />
              </div>
              <div className="grid gap-4 mt-6">
                <div className="hidden md:block">
                  <ProductDimensions product={product} />
                </div>

                <div className="border gap-2 rounded-md p-3 text-[.85rem] leading-none pt-6 hidden md:block">
                  <SafePaymentBadge />
                  <EasyCancelBadge />
                  <TrustedPartnerBadge />
                </div>

                <div className="w-full hidden md:block">
                  <ProductComments comments={comments} />
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 border-t pt-6 ">
                <div className="hidden md:block">
                  <div className="flex gap-4">
                    {/* FAVORITAR */}
                    <div className="flex items-center gap-2">
                      <span>Favoritar</span>
                      <LikeButton id={product?.id} style="btn-outline-light" />
                    </div>

                    {/* COMPARTILHAR */}
                    <div className="flex items-center gap-2">
                      <span>Compartilhar:</span>

                      <Button
                        onClick={() => setShare(true)}
                        type="button"
                        style="btn-outline-light"
                        className="p-4"
                      >
                        <Icon icon="fa-share-alt" type="far" className="mx-1" />
                      </Button>
                    </div>

                    {/* MODAL (fora do fluxo visual) */}
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
                </div>
              </div>
            </div>

            <div>
              <div className="w-full">
                <form onSubmit={sendToCart} method="POST">
                  {/* Cabeçalho do produto */}
                  <div className="grid md:flex gap-4 pb-4 lg:gap-10">
                    <div className="w-full pt-2 md:pt-0">
                      <div className="flex flex-col md:flex-row gap-2 justify-between md:items-center">
                        <h1 className="font-title font-bold text-zinc-900 text-lg md:text-xl">
                          {product?.title}
                        </h1>

                        <ProductPriceDisplay product={product} />
                      </div>

                      <ProductBadges product={product} comments={comments} />
                      <ProductDescription product={product} />
                    </div>
                  </div>

                  <div className="grid gap-6">
                    {/* DETALHES DO PRODUTO - Esconder na versão desktop */}
                    <div className="block md:hidden">
                      <ProductDimensions product={product} />
                    </div>
                    {/* ATRIBUTOS */}
                    <ProductAttributes
                      attributes={product?.attributes ?? []}
                      activeVariations={productToCart.attributes}
                      updateOrder={updateOrder}
                      getImageAttr={getImage}
                      navegateImageCarousel={() => {}}
                    />
                    {/* INPUTS HIDDEN — ATRIBUTOS OBRIGATÓRIOS */}
                    {productAttributes.map((attribute) => {
                      const selectedAttr = productToCart.attributes.find(
                        (attr: any) => attr.id === attribute.id
                      );

                      const hasSelection =
                        !!selectedAttr && selectedAttr.variations.length > 0;

                      return (
                        <input
                          key={attribute.id}
                          type="text"
                          name={`attribute-${attribute.id}`}
                          value={hasSelection ? "ok" : ""}
                          readOnly
                          className="hidden"
                        />
                      );
                    })}
                    {/* INPUT HIDDEN — DATA */}
                    {product?.schedulingEnabled && (
                      <input
                        type="text"
                        name="deliveryDate"
                        value={productToCart?.details?.dateStart ?? ""}
                        readOnly
                      />
                    )}
                    {/* CALENDÁRIO (SEM FORM) */}
                    <ProductDeliveryCalendar
                      product={product}
                      productToCart={productToCart}
                      unavailable={unavailable}
                      blockdate={blockdate}
                      handleDetails={handleDetails}
                      required={!!product?.schedulingEnabled}
                    />
                    {/* Constulte o Frete */}
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
                    <div className="block md:hidden">
                      <ProductDeliveryBadge
                        product={product}
                        productToCart={productToCart}
                      />
                    </div>

                    {/* Categorias na versão mobile */}
                    <div className="block md:hidden">
                      <ProductDetails
                        product={product}
                        store={store}
                        categories={categories}
                      />
                    </div>

                    {/* Adicionar os comentário aqui */}
                    <div className="block md:hidden">
                      <ProductComments comments={comments} />
                    </div>

                    <div className="border gap-4 rounded-md p-3 text-[.85rem] block md:hidden">
                      <SafePaymentBadge />
                      <EasyCancelBadge />
                      <TrustedPartnerBadge />
                    </div>
                    {/* Carrinho e total */}
                    <BottomCart
                      disabled={!canAddToCart}
                      productToCart={productToCart}
                      inCart={inCart}
                      isMobile={layout.isMobile}
                      canAddToCart={canAddToCart}
                    />
                    {/* Disponível para Entrega */}
                    <div className="hidden md:block">
                      <ProductDeliveryBadge
                        product={product}
                        productToCart={productToCart}
                      />
                    </div>
                    {/* Favotirar e compartilhar */}
                    <div className="flex items-center justify-center gap-6 border-t pt-6">
                      <div className="block md:hidden">
                        <div className="flex gap-4">
                          {/* FAVORITAR */}
                          <div className="flex items-center gap-2">
                            <span>Favoritar</span>
                            <LikeButton
                              id={product?.id}
                              style="btn-outline-light"
                            />
                          </div>

                          {/* COMPARTILHAR */}
                          <div className="flex items-center gap-2">
                            <span>Compartilhar:</span>

                            <Button
                              onClick={() => setShare(true)}
                              type="button"
                              style="btn-outline-light"
                              className="p-4"
                            >
                              <Icon
                                icon="fa-share-alt"
                                type="far"
                                className="mx-1"
                              />
                            </Button>
                          </div>

                          {/* MODAL (fora do fluxo visual) */}
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
                      </div>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {!!product?.combinations?.length && (
        <ProductCombinations
          product={product}
          combinations={product.combinations}
        />
      )}

      {(product?.suggestions ?? "1") === "1" && (
        <RelatedProducts product={product} store={store} />
      )}

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
        />
      )}
    </Template>
  );
}
