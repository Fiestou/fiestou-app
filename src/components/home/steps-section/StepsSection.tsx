"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper";
import { Button } from "@/src/components/ui/form";
import Img from "@/src/components/utils/ImgBase";
import Icon from "@/src/icons/fontAwesome/FIcon";

import "swiper/css";
import "swiper/css/navigation";

import { stepsData } from "@/src/data/steps/stepsData";

export default function StepsSection() {
  return (
    <section className="py-12 md:py-20">
      <div className="container-medium">
        <div className="max-w-2xl mx-auto text-center pb-6 md:pb-14">
          <h2 className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2">
            Veja como é muito fácil montar sua festa!
          </h2>
        </div>

        <div className="flex flex-wrap md:flex-nowrap items-center md:pt-6 -mx-[1rem] xl:-mx-[4rem]">
          <div className="hidden md:block order-1 w-1/2 text-right md:text-center md:w-fit p-2">
            <Button
              className="swiper-prev p-5 rounded-full"
              alt="Voltar"
              title="Voltar"
            >
              <Icon
                icon="fa-arrow-left"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            </Button>
          </div>

          <div className="order-3 md:order-2 w-full relative overflow-hidden rounded-[.5rem]">
            <Swiper
              modules={[Navigation]}
              navigation={{ prevEl: ".swiper-prev", nextEl: ".swiper-next" }}
              spaceBetween={16}
              className="swiper-equal"
              breakpoints={{
                0: { slidesPerView: 1.5, centeredSlides: true },
                640: { slidesPerView: 2.5, centeredSlides: false },
                1024: { slidesPerView: 4, centeredSlides: false },
              }}
            >
              {stepsData.map((step, index) => (
                <SwiperSlide key={index}>
                  <div className="border h-full rounded-lg">
                    <div className="aspect-square bg-zinc-100">
                      <Img
                        className="w-full h-full object-cover"
                        src={step.img}
                        alt={step.alt}
                        title={step.title}
                      />
                    </div>
                    <div className="p-4 md:p-5 text-center">
                      <h4 className="font-title text-zinc-900 font-bold">
                        {step.title}
                      </h4>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>

          <div className="hidden md:block order-2 md:order-3 w-1/2 text-left md:text-center md:w-fit p-2">
            <Button
              className="swiper-next p-5 rounded-full"
              alt="Avançar"
              title="Avançar"
            >
              <Icon
                icon="fa-arrow-right"
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
