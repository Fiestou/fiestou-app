"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper";
import { Button } from "@/src/components/ui/form";
import Link from "next/link";
import Img from "@/src/components/utils/ImgBase";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { getImage } from "@/src/helper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface MainSliderProps {
  slides?: Array<any>;
}

export default function MainSlider({ slides = [] }: MainSliderProps) {
  const renderImageSlider = (slide: any, key: number) => {
    const desktopImage = getImage(slide?.main_slide_cover, "default");
    const mobileImage = getImage(slide?.main_slide_cover_mobile, "default");
    const firstSlide = key === 0;

    if (!desktopImage && !mobileImage) return null;

    return (
      <>
        {desktopImage && (
          <Img
            size="7xl"
            src={desktopImage}
            loading={firstSlide ? "eager" : "lazy"}
            fetchPriority={firstSlide ? "high" : "auto"}
            className="hidden md:block absolute w-full bottom-0 left-0"
          />
        )}
        {mobileImage && (
          <Img
            size="7xl"
            src={mobileImage}
            loading={firstSlide ? "eager" : "lazy"}
            fetchPriority={firstSlide ? "high" : "auto"}
            className="md:hidden absolute w-full bottom-0 left-0"
          />
        )}
      </>
    );
  };

  return (
    <section className="group relative">
      <Swiper
        spaceBetween={0}
        modules={[Pagination, Navigation, Autoplay]}
        navigation={{
          nextEl: ".swiper-main-next",
          prevEl: ".swiper-main-prev",
        }}
        autoplay={
          slides.length > 1
            ? { delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }
            : false
        }
        loop={slides.length > 1}
        breakpoints={{ 0: { slidesPerView: 1 } }}
      >
        {slides?.map((slide: any, key: number) => (
          <SwiperSlide key={key}>
            <div
              className="bg-cyan-500 pt-16 md:pt-24 relative"
              style={{ backgroundColor: "#2dc3ff" }}
            >
              {key > 0 && !!slide?.main_slide_redirect?.url ? (
                <Link href={slide?.main_slide_redirect?.url}>
                  {renderImageSlider(slide, key)}
                </Link>
              ) : (
                renderImageSlider(slide, key)
              )}

              <div className="min-h-[70vh] md:min-h-[80vh]">
                <div className="container-medium relative py-4 md:py-14 text-white">
                  <div className="grid text-center md:text-left">
                    {!!slide?.main_slide_text && (
                      <h1
                        className="font-title text-underline font-bold text-4xl lg:text-6xl mb-2 md:mb-4"
                        dangerouslySetInnerHTML={{
                          __html: slide?.main_slide_text,
                        }}
                      />
                    )}

                    {!!slide?.main_slide_description && (
                      <div
                        className="text-lg text-underline md:text-3xl md:max-w-xl"
                        dangerouslySetInnerHTML={{
                          __html: slide?.main_slide_description,
                        }}
                      />
                    )}

                    {!!slide?.main_slide_redirect?.url &&
                      !!slide?.main_slide_redirect?.label && (
                        <div className="pt-4 md:pt-6">
                          <Button
                            href={slide?.main_slide_redirect?.url}
                            className="md:text-lg px-4 py-2 md:py-4 md:px-8"
                          >
                            {slide?.main_slide_redirect?.label}
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {slides?.length > 1 && (
        <div className="opacity-0 group-hover:opacity-100 hidden sm:flex ease absolute px-4 top-1/2 left-0 w-full -translate-y-1/2 items-center h-0 justify-between z-10">
          <div>
            <Button
              className="swiper-main-prev p-6 rounded-full"
              alt="Seta para esquerda"
              title="Seta para esquerda"
            >
              <Icon
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -ml-[2px]"
                icon="fa-chevron-left"
                type="far"
              />
            </Button>
          </div>
          <div>
            <Button
              className="swiper-main-next p-6 rounded-full"
              alt="Seta para direita"
              title="Seta para direita"
            >
              <Icon
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 ml-[1px]"
                icon="fa-chevron-right"
                type="far"
              />
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
