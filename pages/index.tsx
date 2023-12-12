import Newsletter from "@/src/components/common/Newsletter";
import { Button, Input, Label } from "@/src/components/ui/form";
import Img from "@/src/components/utils/ImgBase";
import { getImage } from "@/src/helper";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { ProductType } from "@/src/models/product";
import Api, { defaultQuery } from "@/src/services/api";
import Template from "@/src/template";
import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Product from "@/src/components/common/Product";
import { RelationType } from "@/src/models/relation";

export async function getStaticProps(ctx: any) {
  const api = new Api();
  let request: any = await api.get({ url: "content/home" }, ctx);

  console.log(request, "<< home");

  const categories = request?.data?.categories ?? [];
  const content = request?.data?.content ?? {};
  const products = request?.data?.products ?? [];
  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};

  return {
    props: {
      categories: categories,
      products: products,
      content: content,
      HeaderFooter: HeaderFooter,
      DataSeo: DataSeo,
      Scripts: Scripts,
    },
    revalidate: 60 * 60,
  };
}

export default function Home({
  content,
  categories,
  products,
  HeaderFooter,
  DataSeo,
  Scripts,
}: {
  content: any;
  categories: Array<RelationType>;
  products: Array<ProductType>;
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
}) {
  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `${DataSeo?.site_text} - ${DataSeo?.site_description}`,
        image: !!getImage(DataSeo?.site_image)
          ? getImage(DataSeo?.site_image)
          : "",
        description: DataSeo?.site_description,
      }}
      header={{
        template: "default",
        position: "fixed",
        background: "bg-transparent",
        content: HeaderFooter,
      }}
      footer={{
        template: "default",
        content: HeaderFooter,
      }}
    >
      <section className="bg-cyan-500 pt-16 md:pt-24 relative">
        {getImage(content.main_cover, "default") && (
          <>
            {/* <div className="absolute inset-0 w-full h-full top-0 left-0 bg-zinc-900"></div> */}
            {!!content.main_cover && (
              <Img
                size="7xl"
                src={getImage(content.main_cover, "default")}
                className="hidden md:block absolute inset-0 object-cover w-full h-full top-0 left-0"
              />
            )}
            {!!content.main_cover_mobile && (
              <Img
                size="7xl"
                src={getImage(content.main_cover_mobile, "default")}
                className="md:hidden absolute inset-0 object-cover w-full h-full top-0 left-0"
              />
            )}
          </>
        )}
        <div className="container-medium relative py-4 md:py-14 text-white">
          <div className="grid text-center md:text-left">
            <h1
              className="font-title text-underline font-bold text-4xl lg:text-6xl mb-2 md:mb-4"
              dangerouslySetInnerHTML={{ __html: content.main_text }}
            ></h1>
            <div
              className="text-lg text-underline md:text-3xl md:max-w-xl"
              dangerouslySetInnerHTML={{ __html: content.main_description }}
            ></div>
            <div className="pt-4 md:pt-6">
              <Button
                href={content?.main_redirect?.url ?? "#"}
                className="md:text-lg px-4 py-2 md:py-4 md:px-8"
              >
                {content?.main_redirect?.label ?? ""}
              </Button>
            </div>
          </div>
          <div className="md:py-32"></div>
          <form action="/produtos/listagem" method="GET">
            <div className="max-w-4xl mx-auto flex gap-2 mt-48 md:mt-24">
              <Input
                name="busca"
                placeholder="O que você precisa?"
                className="border-0 pl-5"
                placeholderStyle="placeholder-zinc-900"
              />
              <Button className="px-4 text-xl">
                <Icon icon="fa-search" className="m-1" type="far" />
              </Button>
            </div>
          </form>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container-medium">
          <div className="max-w-2xl mx-auto text-center pb-6 md:pb-14">
            <span>{content.works_title}</span>
            <h2
              className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2"
              dangerouslySetInnerHTML={{ __html: content.works_text }}
            ></h2>
          </div>
          <div className="flex flex-wrap md:flex-nowrap items-center md:pt-6 -mx-[1rem] xl:-mx-[4rem]">
            <div className="hidden md:block order-1 w-1/2 text-right md:text-center md:w-fit p-2">
              <Button className="swiper-prev p-5 rounded-full">
                <Icon
                  icon="fa-arrow-left"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              </Button>
            </div>
            <div className="order-3 md:order-2 w-full relative overflow-hidden">
              <Swiper
                spaceBetween={16}
                modules={[Navigation]}
                navigation={{
                  prevEl: ".swiper-prev", // define o botão anterior
                  nextEl: ".swiper-next", // define o botão próximo
                }}
                breakpoints={{
                  0: {
                    slidesPerView: 1.5,
                    centeredSlides: true,
                  },
                  640: {
                    slidesPerView: 2.5,
                    centeredSlides: false,
                  },
                  1024: {
                    slidesPerView: 4,
                    centeredSlides: false,
                  },
                }}
                className="swiper-equal"
              >
                {!!content.works_steps &&
                  content.works_steps.map((item: any, key: any) => (
                    <SwiperSlide key={key}>
                      <div className="border h-full rounded-lg">
                        <div className="aspect-square bg-zinc-100">
                          {!!item?.step_cover && (
                            <Img
                              src={getImage(item?.step_cover)}
                              className="w-full h-full object-cover"
                            />
                          )}
                        </div>
                        <div className="p-4 md:p-5">
                          <h3 className="font-title text-zinc-900 font-bold">
                            {item?.step_text}
                          </h3>
                        </div>
                      </div>
                    </SwiperSlide>
                  ))}
              </Swiper>
            </div>
            <div className="hidden md:block order-2 md:order-3 w-1/2 text-left md:text-center md:w-fit p-2">
              <Button className="swiper-next p-5 rounded-full">
                <Icon
                  icon="fa-arrow-right"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="xl:py-14">
        <div className="max-w-[88rem] py-12 md:py-20 mx-auto bg-zinc-100">
          <div className="container-medium">
            <div className="max-w-xl mx-auto text-center pb-14">
              <span>{content.categories_title}</span>
              <h2
                className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2"
                dangerouslySetInnerHTML={{ __html: content.categories_text }}
              ></h2>
              <div
                className="pt-4"
                dangerouslySetInnerHTML={{
                  __html: content.categories_description,
                }}
              ></div>
            </div>
            <div className="bg-white py-4 md:py-10 rounded-xl overflow-hidden relative">
              <Swiper
                spaceBetween={16}
                breakpoints={{
                  0: {
                    slidesPerView: 2.5,
                  },
                  640: {
                    slidesPerView: 3.5,
                  },
                  1024: {
                    slidesPerView: 5,
                  },
                }}
              >
                {!!categories &&
                  categories
                    .filter((item: any) => !!item?.feature)
                    .map((item: any, key: any) => (
                      <SwiperSlide key={key}>
                        <Link passHref href={`/categoria/${item?.slug}`}>
                          <div className="group grid gap-2 text-center">
                            <div className="w-full max-w-[10rem] mx-auto">
                              <div className="aspect-square">
                                {!!getImage(item?.image, "thumb") && (
                                  <Img
                                    src={getImage(item?.image, "thumb")}
                                    className="w-full h-full object-contain"
                                  />
                                )}
                              </div>
                            </div>
                            <div className="pb-2">
                              <h3 className="font-title font-bold text-zinc-900 group-hover:text-yellow-400 ease whitespace-nowrap">
                                {item?.title}
                              </h3>
                            </div>
                          </div>
                        </Link>
                      </SwiperSlide>
                    ))}
              </Swiper>
            </div>
            <div className="text-center mt-10">
              <Button href="/produtos">Ver todos os produtos</Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container-medium">
          <div className="max-w-2xl mx-auto text-center pb-6 md:pb-14">
            <span>{content.feature_title}</span>
            <h2
              className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2"
              dangerouslySetInnerHTML={{ __html: content.feature_text }}
            ></h2>
          </div>
          <div className="flex flex-wrap md:flex-nowrap items-center md:pt-6 -mx-[1rem] xl:-mx-[4rem]">
            <div className="hidden md:block order-1 w-1/2 text-right md:text-center md:w-fit p-2">
              <Button className="swiper-products-prev p-5 rounded-full">
                <Icon
                  icon="fa-arrow-left"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              </Button>
            </div>
            <div className="order-3 md:order-2 w-full relative overflow-hidden">
              <Swiper
                spaceBetween={16}
                modules={[Navigation]}
                navigation={{
                  prevEl: ".swiper-products-prev", // define o botão anterior
                  nextEl: ".swiper-products-next", // define o botão próximo
                }}
                loop={true}
                breakpoints={{
                  0: {
                    slidesPerView: 1.5,
                    centeredSlides: true,
                  },
                  640: {
                    slidesPerView: 2.5,
                    centeredSlides: false,
                  },
                  1024: {
                    slidesPerView: 3,
                    centeredSlides: false,
                  },
                }}
                className="swiper-equal"
              >
                {!!products.length &&
                  products.map((item: any, key: any) => (
                    <SwiperSlide key={key}>
                      <Product product={item} />
                    </SwiperSlide>
                  ))}
              </Swiper>
            </div>
            <div className="hidden md:block order-2 md:order-3 w-1/2 text-left md:text-center md:w-fit p-2">
              <Button className="swiper-products-next p-5 rounded-full">
                <Icon
                  icon="fa-arrow-right"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              </Button>
            </div>
          </div>
          <div className="text-center mt-10">
            <Button href="/produtos">Ver todos os produtos</Button>
          </div>
        </div>
      </section>

      <section className="xl:py-14">
        <div className="max-w-[88rem] py-12 md:py-20 mx-auto bg-zinc-100">
          <div className="container-medium">
            <div className="max-w-4xl mx-auto text-center pb-8 md:pb-14">
              <span>{content.partner_title}</span>
              <h2
                className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2"
                dangerouslySetInnerHTML={{ __html: content.partner_text }}
              ></h2>
            </div>
            <div className="flex justify-center gap-2 md:gap-12">
              {!!content.partner_list &&
                content.partner_list.map((item: any, key: any) => (
                  <Link
                    key={key}
                    href={item?.partner_item_link}
                    title={item?.partner_item_title}
                  >
                    <div className="aspect-square max-w-[10rem] border rounded-xl border-zinc-300 bg-white">
                      {!!getImage(item?.partner_item_image) && (
                        <Img
                          src={getImage(item?.partner_item_image)}
                          className="w-full h-full object-contain"
                        />
                      )}
                    </div>
                  </Link>
                ))}
            </div>
            <div className="bg-white mt-6 lg:mt-20 rounded-xl grid lg:flex items-center relative overflow-hidden">
              <div className="w-full grid gap-6 p-6 md:p-16">
                <h4
                  className="font-title font-bold max-w-[30rem] text-zinc-900 text-5xl"
                  dangerouslySetInnerHTML={{
                    __html: content.partner_text_secondary,
                  }}
                ></h4>
                <div
                  className="max-w-[20rem]"
                  dangerouslySetInnerHTML={{
                    __html: content.partner_description_secondary,
                  }}
                ></div>
                <div className="md:pt-4">
                  <Button href="/parceiros/seja-parceiro">
                    Eu quero ser parceiro
                  </Button>
                </div>
              </div>
              <div className="w-full">
                <div className="aspect-[2/2]">
                  {!!getImage(content.partner_image) && (
                    <Img
                      src={getImage(content.partner_image)}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14">
        <div className="container-medium">
          <div className="lg:flex justify-center">
            <div className="w-full">
              <div className="max-w-xl pb-14">
                <span>{content.quotes_title}</span>
                <h2
                  className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-4"
                  dangerouslySetInnerHTML={{
                    __html: content.quotes_text,
                  }}
                ></h2>
                <div
                  className="pt-4"
                  dangerouslySetInnerHTML={{
                    __html: content.quotes_description,
                  }}
                ></div>
                <div className="pt-10">
                  <Img
                    src="/images/loop-arrow.png"
                    className="w-auto rotate-90 md:rotate-0"
                  />
                </div>
              </div>
            </div>
            <div className="w-full lg:max-w-[30rem]">
              {!!content.quotes_list && (
                <>
                  <div>
                    {content.quotes_list.length > 1 ? (
                      <Swiper
                        pagination={{
                          el: ".swiper-quotes-pagination",
                          type: "fraction",
                        }}
                        spaceBetween={16}
                        modules={[Pagination, Navigation]}
                        navigation={{
                          nextEl: ".swiper-quotes-next", // define o botão próximo
                          prevEl: ".swiper-quotes-prev", // define o botão anterior
                        }}
                        breakpoints={{
                          0: {
                            slidesPerView: 1,
                          },
                        }}
                      >
                        {!!content.quotes_list.map &&
                          content.quotes_list.map((item: any, key: any) => (
                            <SwiperSlide key={key}>
                              <div className="w-full">
                                <div className="flex gap-4 items-center">
                                  {item?.quote_image && (
                                    <div className="max-w-[2.5rem] overflow-hidden relative rounded-full">
                                      <div className="aspect-square bg-zinc-200">
                                        <Img
                                          src={getImage(item?.quote_image)}
                                          className="w-full h-full object-cover"
                                        />
                                      </div>
                                    </div>
                                  )}
                                  <div>
                                    <div className="font-bold text-zinc-900">
                                      {item?.quote_name}
                                    </div>
                                    <div className="text-sm">
                                      {item?.quote_work}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-xl py-8">
                                  “{item?.quote_text}”
                                </div>
                              </div>
                            </SwiperSlide>
                          ))}
                      </Swiper>
                    ) : (
                      content.quotes_list.map((item: any, key: any) => (
                        <div key={key} className="w-full">
                          <div className="flex gap-4 items-center">
                            {item?.quote_image && (
                              <div className=" max-w-[2.5rem] overflow-hidden relative rounded-full">
                                <div className="aspect-square bg-zinc-200">
                                  <Img
                                    src={getImage(item?.quote_image)}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-zinc-900">
                                {item?.quote_name}
                              </div>
                              <div className="text-sm">{item?.quote_work}</div>
                            </div>
                          </div>
                          <div className="text-xl py-8">
                            “{item?.quote_text}”
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {content.quotes_list.length > 1 && (
                    <div className="flex gap-2 pt-4 items-center">
                      <span className="swiper-quotes-pagination w-auto pr-3"></span>
                      <Button className="swiper-quotes-prev p-4 rounded-full">
                        <Icon
                          icon="fa-arrow-left"
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        />
                      </Button>
                      <Button className="swiper-quotes-next p-4 rounded-full">
                        <Icon
                          icon="fa-arrow-right"
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        />
                      </Button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <Newsletter />
    </Template>
  );
}
