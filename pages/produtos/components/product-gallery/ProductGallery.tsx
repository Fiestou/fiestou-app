"use client";

import { useState } from "react";
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
import ProductDetails from "../product-details/ProductDetails";
import { StoreType } from "@/src/models/store";

interface ProductGalleryProps {
  product: ProductType;
  store: StoreType;
  categories: any[];
  layout: { isMobile: boolean };
  renderDetails?: () => JSX.Element;
  renderComments?: () => JSX.Element;
}

export default function ProductGallery({
  product,
  layout,
  store,
  categories,
  renderDetails,
  renderComments,
}: ProductGalleryProps) {
  const [swiperInstance, setSwiperInstance] = useState<any>(null);

  if (!product?.gallery?.length) return null;

  return (
    <div className="w-full md:w-1/2 md:pb-4">
      {/* 📱 GALERIA — sticky só no MOBILE */}
      <div className="sticky md:relative top-0 left-0  z-[10]">
        <div className="relative bg-white -mx-4 md:mx-0 md:mb-10 gap-2">
          {/* Swiper */}
          <Swiper
            onSwiper={setSwiperInstance}
            zoom
            loop
            spaceBetween={0}
            modules={[Zoom, Pagination, Navigation, Autoplay]}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            navigation={{
              prevEl: ".swiper-gallery-prev",
              nextEl: ".swiper-gallery-next",
            }}
            pagination={{
              el: ".swiper-pagination",
              clickable: true,
            }}
            className="border-y md:border md:rounded-md"
          >
            {product.gallery.map(
              (img, key) =>
                !!img?.details?.sizes?.lg && (
                  <SwiperSlide key={key}>
                    <div className="w-full">
                      <div className="flex justify-center items-center px-1 md:px-2">
                        <div className="swiper-zoom-container h-[200px] overflow-hidden">
                          <Img
                            src={getImage(img)}
                            className="w-full h-full object-cover rounded-md"
                          />
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                )
            )}
          </Swiper>

          {/* Botões */}
          <div className="absolute top-1/2 left-0 -translate-y-1/2 z-[5] p-2">
            <button className="swiper-gallery-prev bg-[#ffc820] bg-opacity-50 hover:bg-opacity-70 text-white p-4 rounded-full relative">
              <Icon icon="fa-chevron-left" className="absolute center-icon" />
            </button>
          </div>

          <div className="absolute top-1/2 right-0 -translate-y-1/2 z-[5] p-2">
            <button className="swiper-gallery-next bg-[#ffc820] bg-opacity-50 hover:bg-opacity-70 text-white p-4 rounded-full relative">
              <Icon icon="fa-chevron-right" className="absolute center-icon" />
            </button>
          </div>

          <div className="swiper-pagination hidden md:block" />
        </div>
      </div>

      {/* 📱 DETAILS — NUNCA sticky */}
      <ProductDetails product={product} store={store} categories={categories} />
    </div>
  );
}
