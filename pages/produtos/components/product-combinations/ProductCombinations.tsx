// /pages/produtos/components/ProductCombinations.tsx
"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import { Button } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import FDobleIcon from "@/src/icons/fontAwesome/FDobleIcon";
import Product from "@/src/components/common/Product";

import { RelationType } from "@/src/models/relation";
import { ProductType } from "@/src/models/product";

type ProductCombinationsProps = {
  combinations: RelationType[]; // agora aceita RelationType[]
};

export default function ProductCombinations({ combinations }: ProductCombinationsProps) {
  if (!combinations?.length) return null;

  // normaliza para ProductType[]: se o relation tiver .product usa ele, senão assume que o objeto já é o produto
  const products: ProductType[] = combinations.map((c: any) => {
    if (c?.product) return c.product as ProductType;
    return c as ProductType;
  });

  const renderSlideArrows = (keyRef: string | number) => (
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

  const renderSlideProducts = (productsList: ProductType[], type: string) => (
    <Swiper
      spaceBetween={16}
      breakpoints={{
        0: { slidesPerView: 1, centeredSlides: true },
        640: { slidesPerView: 2, centeredSlides: false },
        1024: { slidesPerView: 4, centeredSlides: false },
      }}
      modules={[Pagination, Navigation]}
      className="swiper-equal"
      navigation={{
        nextEl: `.swiper-${type}-next`,
        prevEl: `.swiper-${type}-prev`,
      }}
    >
      {productsList.map((item: any, key: any) => (
        <SwiperSlide key={key}>
          <Product product={item} />
        </SwiperSlide>
      ))}
    </Swiper>
  );

  return (
    <section className="pt-8 md:pt-16">
      <div className="container-medium relative">
        <div className="grid md:flex items-center justify-between gap-2">
          <div className="flex w-full items-center gap-2">
            <FDobleIcon icon="fa-puzzle-piece" size="sm" />
            <h4 className="font-title font-bold text-zinc-900 text-3xl title-underline">
              Combina com
            </h4>
          </div>
          <div>{renderSlideArrows("combinations")}</div>
        </div>

        <div className="mt-6 md:mt-8">
          <div className="relative overflow-hidden rounded-xl">
            {renderSlideProducts(products, "combinations")}
          </div>
        </div>
      </div>
    </section>
  );
}
