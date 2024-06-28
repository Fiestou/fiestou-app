import Newsletter from "@/src/components/common/Newsletter";
import { Button, Input } from "@/src/components/ui/form";
import Img from "@/src/components/utils/ImgBase";
import { getImage } from "@/src/helper";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { ProductType } from "@/src/models/product";
import Api from "@/src/services/api";
import Template from "@/src/template";
import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Product from "@/src/components/common/Product";
import { RelationType } from "@/src/models/relation";
import PostItem from "@/src/components/common/PostItem";

export async function getStaticProps(ctx: any) {
  const api = new Api();

  let request: any = await api.content({ url: `home` });

  console.log(request);

  const Categories = request?.data?.Categories ?? [];
  const Home = request?.data?.Home ?? {};
  const Products = request?.data?.Products ?? [];
  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};
  const Blog = request?.data?.Blog ?? [];

  return {
    props: {
      Categories: Categories,
      Products: Products,
      Home: Home,
      Blog: Blog,
      HeaderFooter: HeaderFooter,
      DataSeo: DataSeo,
      Scripts: Scripts,
    },
    revalidate: 60 * 60 * 60,
  };
}

export default function Home({
  Home,
  Categories,
  Products,
  Blog,
  HeaderFooter,
  DataSeo,
  Scripts,
}: {
  Home: any;
  Categories: Array<RelationType>;
  Products: Array<ProductType>;
  Blog: Array<any>;
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
      <section
        className="bg-cyan-500 pt-16 md:pt-24 relative"
        style={{ backgroundColor: "#2dc3ff" }}
      >
        {getImage(Home?.main_cover, "default") && (
          <>
            {!!Home?.main_cover && (
              <Img
                size="7xl"
                src={getImage(Home?.main_cover, "default")}
                className="hidden md:block absolute w-full bottom-0 left-0"
              />
            )}
            {!!Home?.main_cover_mobile && (
              <Img
                size="7xl"
                src={getImage(Home?.main_cover_mobile, "default")}
                className="md:hidden absolute w-full bottom-0 left-0"
              />
            )}
          </>
        )}
        <div className="container-medium relative py-4 md:py-14 text-white">
          <div className="grid text-center md:text-left">
            <h1
              className="font-title text-underline font-bold text-4xl lg:text-6xl mb-2 md:mb-4"
              dangerouslySetInnerHTML={{ __html: Home?.main_text }}
            ></h1>
            <div
              className="text-lg text-underline md:text-3xl md:max-w-xl"
              dangerouslySetInnerHTML={{ __html: Home?.main_description }}
            ></div>
            <div className="pt-4 md:pt-6">
              <Button
                href={Home?.main_redirect?.url ?? "#"}
                className="md:text-lg px-4 py-2 md:py-4 md:px-8"
              >
                <Icon icon="fa-user-plus" type="far" />
                {Home?.main_redirect?.label ?? ""}
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

      <section className="py-14">
        <div className="container-medium">
          <div className="max-w-2xl mx-auto text-center pb-6 md:pb-8">
            <span>{Home?.feature_title}</span>
            <h2
              className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2"
              dangerouslySetInnerHTML={{ __html: Home?.feature_text }}
            ></h2>
          </div>
          <div className="flex flex-wrap md:flex-nowrap items-center md:pt-6">
            {/* <div className="hidden md:block order-1 w-1/2 text-right md:text-center md:w-fit p-2">
              <Button className="swiper-Products-prev p-5 rounded-full">
                <Icon
                  icon="fa-arrow-left"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              </Button>
            </div> */}
            <div className="order-3 md:order-2 grid md:grid-cols-2 lg:grid-cols-4 gap-4 w-full relative overflow-hidden">
              {!!Products.length &&
                Products.map((item: any, key: any) => (
                  <Product key={key} product={item} />
                ))}
            </div>
            {/* <div className="hidden md:block order-2 md:order-3 w-1/2 text-left md:text-center md:w-fit p-2">
              <Button className="swiper-Products-next p-5 rounded-full">
                <Icon
                  icon="fa-arrow-right"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              </Button>
            </div> */}
          </div>
          <div className="text-center mt-10">
            <Button href="/produtos">
              <Icon icon="fa-shopping-bag" type="far" /> Ver todos os produtos
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="container-medium">
          <div className="max-w-2xl mx-auto text-center pb-6 md:pb-14">
            <span>{Home?.works_title}</span>
            <h2
              className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2"
              dangerouslySetInnerHTML={{ __html: Home?.works_text }}
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
                {!!Home?.works_steps &&
                  Home?.works_steps.map((item: any, key: any) => (
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
              <span>{Home?.categories_title}</span>
              <h2
                className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2"
                dangerouslySetInnerHTML={{ __html: Home?.categories_text }}
              ></h2>
              <div
                className="pt-4"
                dangerouslySetInnerHTML={{
                  __html: Home?.categories_description,
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
                {!!Categories &&
                  Categories.filter((item: any) => !!item?.feature).map(
                    (item: any, key: any) => (
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
                    )
                  )}
              </Swiper>
            </div>
            <div className="text-center mt-10">
              <Button href="/produtos">
                <Icon icon="fa-shopping-bag" type="far" />
                Ver todos
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="xl:py-14">
        <div className="max-w-[88rem] py-12 md:py-20 mx-auto bg-zinc-100">
          <div className="container-medium">
            <div className="max-w-4xl mx-auto text-center pb-8 md:pb-14">
              <span>{Home?.partner_title}</span>
              <h2
                className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2"
                dangerouslySetInnerHTML={{ __html: Home?.partner_text }}
              ></h2>
            </div>
            <div className="flex justify-center gap-2 md:gap-12">
              {!!Home?.partner_list &&
                Home?.partner_list.map((item: any, key: any) => (
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
                    __html: Home?.partner_text_secondary,
                  }}
                ></h4>
                <div
                  className="max-w-[20rem]"
                  dangerouslySetInnerHTML={{
                    __html: Home?.partner_description_secondary,
                  }}
                ></div>
                <div className="md:pt-4">
                  <Button href="/parceiros/seja-parceiro">
                    <Icon icon="fa-store" type="far" />
                    Eu quero ser parceiro
                  </Button>
                </div>
              </div>
              <div className="w-full">
                <div className="aspect-[2/2]">
                  {!!getImage(Home?.partner_image) && (
                    <Img
                      src={getImage(Home?.partner_image)}
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
                <span>{Home?.quotes_title}</span>
                <h2
                  className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-4"
                  dangerouslySetInnerHTML={{
                    __html: Home?.quotes_text,
                  }}
                ></h2>
                <div
                  className="pt-4"
                  dangerouslySetInnerHTML={{
                    __html: Home?.quotes_description,
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
              {!!Home?.quotes_list && (
                <>
                  <div>
                    {Home?.quotes_list.length > 1 ? (
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
                        {!!Home?.quotes_list.map &&
                          Home?.quotes_list.map((item: any, key: any) => (
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
                      Home?.quotes_list.map((item: any, key: any) => (
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
                  {Home?.quotes_list.length > 1 && (
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

      <section className="pb-14 xl:py-14">
        <div className="container-medium">
          <div className="max-w-2xl mx-auto text-center pb-6 md:pb-14">
            <span>{Home?.blog_subtitle}</span>
            <h2 className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2">
              {Home?.blog_title}
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-10 md:gap-6">
            {!!Blog?.length &&
              Blog.map((post: any, key: any) => (
                <div key={key}>
                  <PostItem post={post} />
                </div>
              ))}
          </div>
          <div className="text-center mt-10">
            <Button href="/blog">
              <Icon icon="fa-newspaper" type="far" /> Mais postagens
            </Button>
          </div>
        </div>
      </section>

      <Newsletter />
    </Template>
  );
}
