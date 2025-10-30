"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Zoom, Pagination, Navigation, Autoplay } from "swiper";
import "swiper/css";
import "swiper/css/zoom";
import "swiper/css/navigation";
import "swiper/css/pagination";
import Img from "@/src/components/utils/ImgBase";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { ProductType } from "@/src/models/product";
import { getImage } from "@/src/helper";

interface ProductGalleryProps {
  product: ProductType;
  layout: { isMobile: boolean };
  renderDetails?: () => JSX.Element;
  renderComments?: () => JSX.Element;
}

export default function ProductGallery({
  product,
  layout,
  renderDetails,
  renderComments,
}: ProductGalleryProps) {
  const [swiperInstance, setSwiperInstance] = useState<any>(null);

  if (!product?.gallery || !product.gallery.length) return null;

  return (
    <div className="sticky md:relative top-0 left-0 z-[10] w-full md:w-1/2 md:pb-4">
      <div className="relative bg-white -mx-4 md:mx-0 md:mb-10">
        {/* Carrossel de imagens */}
        <Swiper
          onSwiper={(swiper) => setSwiperInstance(swiper)}
          zoom={true}
          spaceBetween={0}
          modules={[Zoom, Pagination, Navigation, Autoplay]}
          navigation={{
            prevEl: ".swiper-gallery-prev",
            nextEl: ".swiper-gallery-next",
          }}
          pagination={{ el: ".swiper-pagination" }}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          loop={true}
          className="border-y md:border md:rounded-md"
        >
          {product?.gallery?.length &&
            product?.gallery?.map(
              (img, key) =>
                !!img?.details?.sizes["lg"] && (
                  <SwiperSlide key={key}>
                    {" "}
                    <div className="w-full">
                      {" "}
                      <div className="aspect-square flex justify-center items-center px-1 md:px-2">
                        {" "}
                        {!!getImage(img) && (
                          <div className="swiper-zoom-container">
                            {" "}
                            <Img
                              src={getImage(img)}
                              className="w-full rounded-md"
                            />{" "}
                          </div>
                        )}{" "}
                      </div>{" "}
                    </div>{" "}
                  </SwiperSlide>
                )
            )}{" "}
        </Swiper>

        {/* Botões do carrossel */}
        <div className="absolute top-1/2 left-0 -translate-y-1/2 z-[5] p-2">
          <button
            type="button"
            className="swiper-gallery-prev bg-[#ffc820] text-white bg-opacity-50 hover:bg-opacity-70 ease text-sm p-4 rounded-full relative"
          >
            <Icon
              icon="fa-chevron-left"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
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
            />
          </button>
        </div>
        <div className="swiper-pagination bg-fuchsia-950"></div>
      </div>

      {/* versão mobile */}
      <div className="hidden md:grid gap-3 py-3">
        {!layout.isMobile && renderDetails && renderDetails()}
        {!layout.isMobile && renderComments && renderComments()}
      </div>
    </div>
  );
}
