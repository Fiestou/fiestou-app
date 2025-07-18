import Product from "@/src/components/common/Product";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import Template from "@/src/template";
import Api from "@/src/services/api";
import {
  AttributeType,
  CommentType,
  ProductType,
  getPrice,
  getPriceValue,
} from "@/src/models/product";
import {
  dateBRFormat,
  dateFormat,
  getImage,
  getSummary,
  isMobileDevice,
  moneyFormat,
} from "@/src/helper";
import { Button } from "@/src/components/ui/form";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { AddToCart, GetCart } from "@/src/components/pages/carrinho";
import Badge from "@/src/components/utils/Badge";
import {
  AttributeProductOrderType,
  ProductOrderType,
  VariationProductOrderType,
} from "@/src/models/product";
import Img from "@/src/components/utils/ImgBase";
import { StoreType } from "@/src/models/store";
import Newsletter from "@/src/components/common/Newsletter";
import { ColorfulRender, ColorsList } from "@/src/components/ui/form/ColorsUI";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination, Zoom } from "swiper";
import 'swiper/css';
import 'swiper/css/zoom';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import Calendar from "@/src/components/ui/form/CalendarUI";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Modal from "@/src/components/utils/Modal";
import ShareModal from "@/src/components/utils/ShareModal";
import { RelationType } from "@/src/models/relation";
import LikeButton from "@/src/components/ui/LikeButton";
import SidebarCart from "@/src/components/common/SidebarCart";
import FDobleIcon from "@/src/icons/fontAwesome/FDobleIcon";
import Checkbox from "@/src/components/ui/form/CheckboxUI";
import QtdInput from "@/src/components/ui/form/QtdUI";

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
        method: 'get',
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
      revalidate: 60 * 60 * 60,
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

  const imageCover =
    !!product?.gallery && !!product?.gallery?.length ? product?.gallery[0] : {};

  const [share, setShare] = useState(false as boolean);
  const baseUrl = `https://fiestou.com.br/produtos/${product?.id}`;

  const [loadCart, setLoadCart] = useState(false as boolean);
  const [resume, setResume] = useState(false as boolean);
  const [blockdate, setBlockdate] = useState(Array<string>());

  const [productToCart, setProductToCart] = useState<ProductOrderType>({
    product: product?.id,
    attributes: [],
    quantity: 1,
    details: {},
    total: getPriceValue(product).price,
  });

  useEffect(() => {
    setBlockdate(product.unavailableDates ?? []);
  }, [product]);

  const [days, setDays] = useState(1);

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

  const [activeVariations, setActiveVariations] = useState([] as Array<any>);
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

  const [cartModal, setCartModal] = useState(false as boolean);

  const [inCart, setInCart] = useState(false as boolean);
  const [unavailable, setUnavailable] = useState([] as Array<string>);

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

  const sendToCart = (e: any) => {
    e.preventDefault();

    setLoadCart(true);

    if (AddToCart(productToCart)) {
      handleCart();
      setCartModal(true);
    } else {
      setLoadCart(true);
    }
  };

  const handleDetails = (detail: Object) => {
    let details = { ...(productToCart?.details ?? {}), ...detail };

    let days = 1;
    let date_1: any = new Date(details?.dateStart?.toDateString() ?? "");
    let date_2: any = new Date(details?.dateEnd?.toDateString() ?? "");

    const timestampDate1 = date_1.getTime();
    const timestampDate2 = date_2.getTime();

    days = Math.round(
      Math.abs(timestampDate1 - timestampDate2) / (24 * 60 * 60 * 1000)
    );

    setDays(!!days ? days : 1);

    updateOrderTotal({
      ...productToCart,
      details: {
        ...details,
        dateStart: dateFormat(details?.dateStart),
        dateEnd: dateFormat(details?.dateEnd),
        days: days,
        schedulingDiscount: product?.schedulingDiscount,
      },
    });
  };

  const [layout, setLayout] = useState({} as any);

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
                            className={`${item.rate >= value
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
        categorias: (product?.category ?? []).map((cat: any) => cat.slug),
        limit: 10,
      },
    });

    setMatch(request?.data ?? []);
  };

  const renderSlideArrows = (keyRef: string | number) => {
    return (
      <div className="flex h-0 px-1 justify-between absolute md:relative gap-4 top-1/2 md:-top-4 left-0 w-full md:w-fit -translate-y-1/2 z-10">
        <div>
          <Button className={`swiper-${keyRef}-prev p-5 md:p-6 rounded-full`}>
            <Icon
              icon="fa-chevron-left"
              type="far"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-[2px]"
            />
          </Button>
        </div>
        <div>
          <Button className={`swiper-${keyRef}-next p-5 md:p-6 rounded-full`}>
            <Icon
              icon="fa-chevron-right"
              type="far"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ml-[1px]"
            />
          </Button>
        </div>
      </div>
    );
  };

  const renderSlideProducts = (handleMatch: Array<any>, type: string) => {
    return (
      <Swiper
        spaceBetween={16}
        breakpoints={{
          0: {
            slidesPerView: 1,
            centeredSlides: true,
          },
          640: {
            slidesPerView: 2,
            centeredSlides: false,
          },
          1024: {
            slidesPerView: 4,
            centeredSlides: false,
          },
        }}
        modules={[Pagination, Navigation]}
        className="swiper-equal"
        navigation={{
          nextEl: `.swiper-${type}-next`,
          prevEl: `.swiper-${type}-prev`,
        }}
      >
        {!!handleMatch.length &&
          handleMatch.map((item: any, key: any) => (
            <SwiperSlide key={key}>
              <Product product={item} />
            </SwiperSlide>
          ))}
      </Swiper>
    );
  };

  const [productUpdated, setProductUpdated] = useState({} as ProductType);
  const getProductUpdated = async () => {
    let request: any = await api.request({
      method: "get",
      url: "request/product",
      data: {
        slug: product?.slug,
      },
    });

    handleCart(request.data.unavailable);

    setProductUpdated(request.data);
  };

  useEffect(() => {
    if (!!window) {
      getProductUpdated();
      setLayout({ ...layout, isMobile: isMobileDevice() });
    }
    if (!!store?.id) {
      renderMatch();
    }
  }, [store]);

  const renderDetails = () => (
    <>
      <div className="border rounded-lg p-4">
        <div className="text-sm grid gap-1">
          <div className="text-zinc-900">
            Fornecido por:{" "}
            <Link
              href={`/${store?.slug}`}
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
                      <div className="w-fit whitespace-nowrap pt-1">
                        {category.title}:
                      </div>
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
    return <></>;
  }

  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `${product?.title} - Produtos | ${DataSeo?.site_text}`,
        image: !!getImage(imageCover) ? getImage(imageCover) : "",
        description: DataSeo?.site_description,
        url: `produtos/${product?.slug}`,
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
          <Breadcrumbs links={[{ url: `/produtos/${product?.id}`, name: "Produtos" }]} />
        </div>
      </section>
      <section className="">
        <div className="container-medium">
          <div className="md:flex lg:flex-nowrap gap-4 md:gap-6 lg:gap-8 items-start">
            <div className="sticky md:relative top-0 left-0 z-[10] w-full md:w-1/2 md:pb-4">
              {!!product?.gallery && (
                <div className="relative bg-white -mx-4 md:mx-0 md:mb-10">
                  <Swiper
                    onSwiper={(swiper) => setSwiperInstance(swiper)}
                    zoom={true}
                    spaceBetween={0}
                    modules={[Zoom, Pagination, Navigation, Autoplay]}
                    navigation={{
                      prevEl: ".swiper-gallery-prev", // define o botão anterior
                      nextEl: ".swiper-gallery-next", // define o botão próximo
                    }}
                    pagination={{
                      el: ".swiper-pagination",
                    }}
                    autoplay={{
                      delay: 3000,
                      disableOnInteraction: false,
                    }}
                    loop={true}
                    className="border-y md:border md:rounded-md"
                  >
                    {!!product?.gallery?.length &&
                      product?.gallery?.map(
                        (img, key) =>
                          !!img?.details?.sizes["lg"] && (
                            <SwiperSlide key={key}>
                              <div className="w-full">
                                <div className="aspect-square flex justify-center items-center px-1 md:px-2">
                                  {!!getImage(img, "xl") && (
                                    <div className="swiper-zoom-container">
                                      <Img
                                        src={getImage(img, "xl")}
                                        className="w-full rounded-md"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </SwiperSlide>
                          )
                      )}
                  </Swiper>
                  <div className="absolute top-1/2 left-0 -translate-y-1/2 z-[5] p-2">
                    <button
                      type="button"
                      className="swiper-gallery-prev bg-[#ffc820] text-white bg-opacity-50 hover:bg-opacity-70 ease text-sm p-4 rounded-full relative"
                    >
                      <Icon
                        icon="fa-chevron-left"
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      ></Icon>
                    </button>
                  </div>
                  <div className="absolute top-1/2 right-0 -translate-y-1/2 z-[5] p-2">
                    <button
                      type="button"
                      className="swiper-gallery-next bg-[#ffc820] text-white bg-opacity-50 hover:bg-opacity-70 ease text-sm p-4 rounded-full relative"
                    >
                      <Icon
                        icon="fa-chevron-right"
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      ></Icon>
                    </button>
                  </div>
                  <div className="swiper-pagination"></div>
                </div>
              )}
              <div className="hidden md:grid gap-3 py-3">
                {!layout.isMobile && renderDetails()}
                {!layout.isMobile && renderComments()}
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <form onSubmit={(e: any) => sendToCart(e)} method="POST">
                <div className="grid md:flex gap-4 pb-4 lg:gap-10">
                  <div className="w-full pt-2 md:pt-0">
                    <h1 className="font-title font-bold text-zinc-900 text-3xl">
                      {product?.title}
                    </h1>
                    <div className="flex flex-wrap items-center py-4 md:pb-6 gap-4">
                      {!!product?.rate && (
                        <div className="flex gap-1 items-center">
                          <Icon
                            icon="fa-star"
                            type="fa"
                            className="text-xs text-yellow-500"
                          />
                          <span className="font-bold text-zinc-900">
                            {product?.rate}
                          </span>
                          <span className="text-xs">
                            {comments.length}
                            {comments.length > 1 ? " avaliações" : " avaliação"}
                          </span>
                        </div>
                      )}
                      {product?.fragility == "yes" && (
                        <Badge style="light">
                          <Icon icon="fa-fragile" type="far" /> Atenção!
                          Material Frágil
                        </Badge>
                      )}
                      <Badge style="light">
                        {product?.comercialType == "selling"
                          ? "Para venda"
                          : "Para alugar"}
                      </Badge>
                    </div>

                    <div className="grid gap-2">
                      {!!product?.subtitle && (
                        <div
                          onClick={() => setResume(!resume)}
                          className="cursor-pointer break-words w-full whitespace-pre-wrap font-semibold text-zinc-900"
                        >
                          {product?.subtitle}
                          {resume && (
                            <div className="inline-block w-0">
                              <Icon
                                icon="fa-chevron-up"
                                type="far"
                                className="text-xs pl-1"
                              />
                            </div>
                          )}
                        </div>
                      )}

                      {!!product?.description && (
                        <div>
                          <div
                            className="break-words whitespace-pre-wrap inline-block"
                            dangerouslySetInnerHTML={{
                              __html: resume
                                ? product?.description
                                : getSummary(product?.description, 100),
                            }}
                          ></div>
                          {!resume && (
                            <div
                              onClick={() => setResume(true)}
                              className="pt-2 text-cyan-500 underline cursor-pointer"
                            >
                              ler mais
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="w-fit md:text-right leading-tight pt-4 md:pt-0">
                    <div className="whitespace-nowrap">
                      {getPrice(product).priceFromFor &&
                        !!getPrice(product).priceLow ? (
                        <div className="text-sm">
                          de
                          <span className="line-through mx-1">
                            R$ {getPrice(product).priceHigh}
                          </span>
                          por
                        </div>
                      ) : (
                        <div className="text-sm">a partir de</div>
                      )}
                      <h3 className="font-bold text-4xl lg:text-3xl text-zinc-800">
                        R${" "}
                        {!!product?.schedulingTax &&
                          product?.schedulingTax > getPriceValue(product).price
                          ? moneyFormat(product?.schedulingTax)
                          : moneyFormat(getPriceValue(product).price)}
                      </h3>
                    </div>
                  </div>
                </div>

                <div className="grid gap-6">
                  {!!product?.attributes &&
                    (product?.attributes ?? [])?.map((attribute, index) => (
                      <div key={index} className="md:pt-4">
                        <div className="font-title text-zinc-900 font-bold py-4 text-sm lg:text-lg">
                          {attribute.title}
                        </div>
                        <div className="border-b">
                          {attribute?.variations &&
                            attribute?.variations.map((item: any, key) => (
                              <label
                                key={key}
                                className="flex border-t py-2 gap-4 items-center"
                              >
                                {attribute.selectType == "radio" && (
                                  <div className="w-fit">
                                    <div
                                      onClick={() => {
                                        updateOrder(
                                          {
                                            id: item.id,
                                            title: item.title ?? "",
                                            price: item.price,
                                            quantity: 1,
                                          },
                                          attribute
                                        );
                                      }}
                                    >
                                      <Checkbox
                                        checked={!!activeVariations[item.id]}
                                        type="radio"
                                      />
                                    </div>
                                  </div>
                                )}

                                {attribute.selectType == "checkbox" && (
                                  <div className="w-fit">
                                    <div
                                      onClick={() => {
                                        updateOrder(
                                          {
                                            id: item.id,
                                            title: item.title ?? "",
                                            price: item.price,
                                            quantity: 1,
                                          },
                                          attribute
                                        );
                                      }}
                                    >
                                      <Checkbox
                                        checked={!!activeVariations[item.id]}
                                        type="checkbox"
                                      />
                                    </div>
                                  </div>
                                )}

                                {!!item?.image && getImageAttr(item?.image) && (
                                  <div
                                    onClick={() =>
                                      navegateImageCarousel(item?.image)
                                    }
                                    className="aspect-[4/3] cursor-pointer bg-zinc-100 w-[4.5rem] relative"
                                  >
                                    <Img
                                      src={getImage(
                                        getImageAttr(item?.image),
                                        "thumb"
                                      )}
                                      className="rounded absolute w-full h-full inset-0 object-contain"
                                    />
                                  </div>
                                )}

                                <div
                                  className="w-full py-1 cursor-pointer"
                                  onClick={() => {
                                    updateOrder(
                                      {
                                        id: item.id,
                                        title: item.title ?? "",
                                        price: item.price,
                                        quantity: 1,
                                      },
                                      attribute
                                    );
                                  }}
                                >
                                  {item.title}
                                </div>

                                <div className="w-fit py-1 whitespace-nowrap">
                                  {!!item?.price
                                    ? `R$ ${moneyFormat(item.price)}`
                                    : ""}
                                </div>

                                {attribute.selectType == "quantity" && (
                                  <div className="w-fit">
                                    <QtdInput
                                      value={0}
                                      emitQtd={(value: number) =>
                                        updateOrder(
                                          {
                                            id: item.id,
                                            title: item.title ?? "",
                                            price: item.price,
                                            quantity: value ?? 1,
                                          },
                                          attribute
                                        )
                                      }
                                      className="max-w-[8rem]"
                                    />
                                  </div>
                                )}
                              </label>
                            ))}
                        </div>
                      </div>
                    ))}

                  <div className="md:flex justify-between items-end gap-2">
                    <div className="w-full">
                      <h4 className="font-title text-zinc-900 font-bold py-4 text-sm md:text-lg">
                        Para quando você precisa?
                      </h4>
                      <div className="calendar relative">
                        <div className="text-xs m-4">
                          {!!productToCart?.details?.dateStart
                            ? dateBRFormat(productToCart?.details?.dateStart)
                            : "Selecione a data:"}
                        </div>
                        <Calendar
                          required
                          unavailable={unavailable ?? []}
                          blockdate={blockdate}
                          onChange={(emit: any) => handleDetails(emit)}
                          availability={product?.availability ?? 1}
                        />
                        {!productUpdated?.title && (
                          <div className="absolute z-10 bg-white opacity-60 w-full h-full top-0 left-0"></div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-white relative w-full mb-6">
                    {!!productToCart?.total && (
                      <div className="leading-tight w-full">
                        <div>
                          <strong className="text-zinc-950">
                            {(product?.availability ?? 1) >= 1 && (
                              <div className="flex gap-2 items-center">
                                <div className="w-[1.25rem] flex justify-center">
                                  <Icon
                                    icon="fa-truck"
                                    type="far"
                                    className="text-yellow-400 text-base"
                                  />
                                </div>
                                Entrega
                              </div>
                            )}
                          </strong>
                          <br />{" "}
                          <p>
                            Esse produto é entregue em até{" "}
                            <strong>{product?.availability ?? 1}{" "}</strong>
                            dia
                            {Number(product?.availability ?? 1) > 1 ? "s" : ""}.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="bg-white drop-shadow-2xl md:drop-shadow-none fixed z-[20] md:-mx-4 md:relative w-full md:w-auto left-0 bottom-0 flex justify-between">
                    {!!productToCart?.total && (
                      <>
                        <div className="leading-tight self-center w-full px-4">
                          <div className="text-sm text-zinc-900">
                            Total:
                          </div>
                          <div className="font-bold text-zinc-900 text-lg whitespace-nowrap">
                            R$ {moneyFormat(productToCart.total)}
                          </div>
                        </div>

                        <div className="text-center p-4">
                          {!inCart ? (
                            <Button>
                              Adicionar
                            </Button>
                          ) : (
                            <Button
                              href="/carrinho"
                              className="whitespace-nowrap"
                            >
                              Acessar carrinho
                            </Button>
                          )}
                          <style jsx global>{`
                            html {
                              padding-bottom: ${layout.isMobile
                              ? "6rem"
                              : "0rem"};
                            }
                          `}</style>
                        </div>
                      </>
                    )}
                  </div>

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
                  {(!!product?.weight ||
                    !!product?.length ||
                    !!product?.width ||
                    !!product?.height) && (
                      <div className="border-t pt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {!!product?.weight && (
                          <div className="border flex flex-col rounded p-4">
                            <div className="text-xl text-zinc-900">
                              <Icon icon="fa-weight" />
                            </div>
                            <div className="pt-4">
                              Peso:{" "}
                              <span className="font-bold text-zinc-900">
                                {product?.weight}kg
                              </span>
                            </div>
                          </div>
                        )}
                        {!!product?.length && (
                          <div className="border flex flex-col rounded p-4">
                            <div className="text-xl text-zinc-900">
                              <Icon icon="fa-ruler" />
                            </div>
                            <div className="pt-4">
                              Comp:{" "}
                              <span className="font-bold text-zinc-900">
                                {product?.length}cm
                              </span>
                            </div>
                          </div>
                        )}
                        {!!product?.width && (
                          <div className="border flex flex-col rounded p-4">
                            <div className="text-xl text-zinc-900">
                              <Icon icon="fa-ruler-horizontal" />
                            </div>
                            <div className="pt-4">
                              Larg:{" "}
                              <span className="font-bold text-zinc-900">
                                {product?.width}cm
                              </span>
                            </div>
                          </div>
                        )}
                        {!!product?.height && (
                          <div className="border flex flex-col rounded p-4">
                            <div className="text-xl text-zinc-900">
                              <Icon icon="fa-ruler-vertical" />
                            </div>
                            <div className="pt-4">
                              Alt:{" "}
                              <span className="font-bold text-zinc-900">
                                {product?.height}cm
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  <div className="border grid gap-2 rounded-md p-3 text-[.85rem] leading-none">
                    <div className="flex gap-2 items-center">
                      <div className="w-[1.25rem] flex justify-center">
                        <Icon
                          icon="fa-shield-check"
                          type="fa"
                          className="text-yellow-400 text-base"
                        />
                      </div>
                      <div>
                        <strong className="text-zinc-950">
                          Pagamento seguro:
                        </strong>{" "}
                        Receba o item no dia marcado ou devolvemos o dinheiro
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="w-[1.25rem] flex justify-center">
                        <Icon
                          icon="fa-undo"
                          type="far"
                          className="text-yellow-400 text-base"
                        />
                      </div>
                      <div>
                        <strong className="text-zinc-950">
                          Cancelamento fácil:
                        </strong>{" "}
                        1 dia antes da entrega, pode cancelar o pedido.
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <div className="w-[1.25rem] flex justify-center">
                        <Icon
                          icon="fa-badge-check"
                          type="fa"
                          className="text-yellow-400 text-base"
                        />
                      </div>
                      <div>
                        <strong className="text-zinc-950">
                          Parceiro confiável:
                        </strong>{" "}
                        Garantia do Fiestou da entrega.
                      </div>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className="grid gap-3 py-3">
            {layout.isMobile && <div>{renderDetails()}</div>}
            {layout.isMobile && <div>{renderComments()}</div>}
          </div>
        </div>
      </section>

      {!!product?.combinations && (
        <section className="pt-8 md:pt-16 ">
          <div className="container-medium relative ">
            <div className="grid md:flex items-center justify-between gap-2">
              <div className="flex w-full items-center gap-2">
                <div>
                  <FDobleIcon icon="fa-puzzle-piece" size="sm" />
                </div>
                <h4 className="font-title font-bold text-zinc-900 text-3xl title-underline">
                  Combina com
                </h4>
              </div>
              <div>{renderSlideArrows("combinations")}</div>
            </div>
            <div className="mt-6 md:mt-8">
              <div className="relative overflow-hidden rounded-xl">
                {renderSlideProducts(
                  product?.combinations ?? [],
                  "combinations"
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {!!match.length && (
        <section className="pt-8 md:pt-16  ">
          <div className="container-medium relative">
            <div className="grid md:flex items-center justify-between gap-2">
              <div className="flex w-full items-center gap-2">
                <div>
                  <FDobleIcon icon="fa-puzzle-piece" size="sm" />
                </div>
                <h4 className="font-title font-bold text-zinc-900 text-3xl title-underline">
                  Veja também
                </h4>
              </div>
              <div>{renderSlideArrows("match")}</div>
            </div>
            <div className="mt-6 md:mt-8">
              <div className="relative overflow-hidden rounded-xl">
                {renderSlideProducts(match, "match")}
              </div>
            </div>
          </div>
        </section>
      )}

      <div className="pt-16 "></div>

      <SidebarCart
        status={cartModal}
        close={() => setCartModal(false as boolean)}
      />

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
