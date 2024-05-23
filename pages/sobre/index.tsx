import Api from "@/src/services/api";
import Template from "@/src/template";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { useRouter } from "next/router";
import ButtonLoader from "@/src/components/utils/ButtonLoader";
import Img from "@/src/components/utils/ImgBase";
import { Button, Input, Label } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Newsletter from "@/src/components/common/Newsletter";
import { clean, getImage } from "@/src/helper";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export async function getStaticProps(ctx: any) {
  const api = new Api();

  let request: any = await api.content({ url: `about` });

  const About = request?.data?.About ?? {};
  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};

  return {
    props: {
      About: About,
      HeaderFooter: HeaderFooter,
      DataSeo: DataSeo,
      Scripts: Scripts,
    },
    revalidate: 60 * 60 * 60,
  };
}

export default function Sobre({
  About,
  HeaderFooter,
  DataSeo,
  Scripts,
}: {
  About: any;
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
}) {
  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `Sobre | ${DataSeo?.site_text}`,
        image: !!getImage(DataSeo?.site_image)
          ? getImage(DataSeo?.site_image)
          : "",
        description: clean(About?.main_description),
        url: `sobre`,
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
      <section className="bg-cyan-500  pt-24 md:pt-32 relative">
        <div className="container-medium relative pb-4 md:pb-10 text-white">
          <div className="flex">
            <div className="w-full">
              <div className="pb-4">
                <Breadcrumbs links={[{ url: "/sobre", name: "Sobre" }]} />
              </div>
              <h1
                className="font-title font-bold text-4xl md:text-5xl mb-4"
                dangerouslySetInnerHTML={{ __html: About?.main_text }}
              ></h1>
              <div
                className="text-lg md:text-2xl font-semibold"
                dangerouslySetInnerHTML={{ __html: About?.main_description }}
              ></div>
            </div>
            {!!getImage(About?.main_icons) && (
              <div className="w-fit">
                <Img
                  src={getImage(About?.main_icons)}
                  className="w-auto max-w-full"
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="py-10 md:py-20 relative overflow-hidden">
        <div className="container-medium">
          <div className="max-w-3xl mx-auto text-center pb-6 md:pb-14">
            <h2
              className="font-title text-zinc-900 font-bold text-3xl md:text-5xl mt-2"
              dangerouslySetInnerHTML={{ __html: About?.works_text }}
            ></h2>
          </div>
          <div className="">
            <Swiper
              spaceBetween={16}
              modules={[Navigation]}
              breakpoints={{
                0: {
                  slidesPerView: 1.25,
                },
                640: {
                  slidesPerView: 2.5,
                },
                1024: {
                  slidesPerView: 3,
                },
              }}
              className="swiper-equal swiper-visible"
            >
              {!!About?.works_text &&
                About?.works_list.map((item: any, key: any) => (
                  <SwiperSlide key={key}>
                    <div className="border h-full rounded-lg p-6 md:p-10">
                      <div className="p-8 text-yellow-400 relative">
                        <Icon
                          icon={item.work_image ?? "fa-hand-point-up"}
                          className="text-6xl absolute top-1/2 left-0 -translate-y-1/2"
                        />
                        <Icon
                          icon={item.work_image ?? "fa-hand-point-up"}
                          type="fa"
                          className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2"
                        />
                      </div>
                      <div className="pt-6">
                        <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">
                          {item.work_title}
                        </h3>
                        <div>{item.work_description}</div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
            </Swiper>
          </div>
        </div>
      </section>

      <section>
        <div className="md:py-6">
          <div className="max-w-[88rem] pt-10 pb-6 md:py-20 mx-auto bg-zinc-100">
            <div className="container-medium grid lg:flex gap-6 md:gap-10 items-center">
              <div className="w-full grid gap-4 md:gap-8">
                <h4
                  className="font-title font-bold max-w-[30rem] text-4xl text-zinc-900"
                  dangerouslySetInnerHTML={{ __html: About?.about_title }}
                ></h4>
                <div
                  className="max-w-[30rem] md:text-lg"
                  dangerouslySetInnerHTML={{ __html: About?.about_text }}
                ></div>
              </div>
              {!!About?.about_image && (
                <div className="w-full">
                  <Img
                    src={getImage(About?.about_image)}
                    className="w-full rounded-xl"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-10 md:pt-20 relative overflow-hidden">
        <div className="container-medium">
          <div className="max-w-3xl mx-auto text-center pb-6 md:pb-14">
            <span>{About?.args_title}</span>
            <h2
              className="font-title text-zinc-900 font-bold text-3xl md:text-5xl mt-2"
              dangerouslySetInnerHTML={{ __html: About?.args_text }}
            ></h2>
          </div>
          <div className="">
            <Swiper
              spaceBetween={16}
              modules={[Navigation]}
              breakpoints={{
                0: {
                  slidesPerView: 1.25,
                },
                640: {
                  slidesPerView: 2.5,
                },
                1024: {
                  slidesPerView: 3,
                },
              }}
              className="swiper-equal swiper-visible"
            >
              {!!About?.args_list &&
                About?.args_list.map((item: any, key: any) => (
                  <SwiperSlide key={key}>
                    <div className="border h-full rounded-lg p-6 md:p-10">
                      <div className="p-8 text-yellow-400 relative">
                        <Icon
                          icon={item.arg_image ?? "fa-hand-point-up"}
                          className="text-6xl absolute top-1/2 left-0 -translate-y-1/2"
                        />
                        <Icon
                          icon={item.arg_image ?? "fa-hand-point-up"}
                          type="fa"
                          className="text-5xl mt-1 opacity-20 absolute top-1/2 left-0 -translate-y-1/2"
                        />
                      </div>
                      <div className="pt-6">
                        <h3 className="font-title text-zinc-900 text-2xl font-bold pb-4">
                          {item.arg_title}
                        </h3>
                        <div>{item.arg_description}</div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
            </Swiper>
          </div>
        </div>
      </section>

      <Newsletter />
    </Template>
  );
}
