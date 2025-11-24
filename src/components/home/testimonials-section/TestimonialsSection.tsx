"use client";

import Img from "@/src/components/utils/ImgBase";
import { Button } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper";

interface Testimonial {
  name: string;
  role: string;
  image: string;
  quote: string;
}

interface TestimonialsSectionProps {
  testimonials?: Testimonial[];
}

export default function TestimonialsSection({
  testimonials = [],
}: TestimonialsSectionProps) {
  return (
    <section className="py-14">
      <div className="container-medium">
        <div className="lg:flex justify-center">
          <div className="w-full">
            <div className="max-w-xl pb-14">
              <h2 className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-4">
                Veja quem recomenda
              </h2>
              <div className="pt-10">
                <Img
                  src="/images/loop-arrow.png"
                  className="w-auto rotate-90 md:rotate-0"
                />
              </div>
            </div>
          </div>

          <div className="w-full lg:max-w-[30rem]">
            <Swiper
              pagination={{
                el: ".swiper-quotes-pagination",
                type: "fraction",
              }}
              spaceBetween={16}
              modules={[Pagination, Navigation, Autoplay]}
              navigation={{
                nextEl: ".swiper-quotes-next",
                prevEl: ".swiper-quotes-prev",
              }}
              autoplay={{
                delay: 3000,
                disableOnInteraction: false,
              }}
              loop={true}
            >
              {testimonials.map((item, index) => (
                <SwiperSlide key={index}>
                  <div className="w-full">
                    <div className="flex gap-4 items-center">
                      <div className="max-w-[2.5rem] overflow-hidden relative rounded-full">
                        <div className="aspect-square bg-zinc-200">
                          <Img
                            src={item.image}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900">{item.name}</p>
                        <p className="text-sm">{item.role}</p>
                      </div>
                    </div>
                    <p className="text-xl py-8">{item.quote}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

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
          </div>
        </div>
      </div>
    </section>
  );
}
