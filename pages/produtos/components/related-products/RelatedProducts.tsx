"use client";

import { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import Api from "@/src/services/api";
import Product from "@/src/components/common/Product";
import { Button } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import FDobleIcon from "@/src/icons/fontAwesome/FDobleIcon";
import { ProductType } from "@/src/models/product";
import { StoreType } from "@/src/models/store";

type RelatedProductsProps = {
  product: ProductType;
  store: StoreType;
  categories?: any[];
};

export default function RelatedProducts({
  product,
  store,
  categories,
}: RelatedProductsProps) {
  const [match, setMatch] = useState<ProductType[]>([]);

  // Busca os produtos relacionados
  const fetchRelatedProducts = async () => {
    const api = new Api();
    let request: any = await api.request({
      method: "get",
      url: "request/products",
      data: {
        ignore: product.id,
        store: store?.id ?? 0,
        tags: (product?.tags ?? ",").split(",").filter((item) => !!item),
        categorias: (product?.category ?? [])
          .map((prodCat: any) => {
            let slug = null;
            if (Array.isArray(categories)) {
              // Safety check
              categories.forEach((parent: any) => {
                parent.childs?.forEach((child: any) => {
                  if (child.id === prodCat.id) {
                    slug = child.slug;
                  }
                });
              });
            }
            return slug;
          })
          .filter((slug: any) => !!slug),
        limit: 10,
      },
    });

    setMatch(request?.data ?? []);
  };

  useEffect(() => {
    if (product?.id) fetchRelatedProducts();
  }, [product?.id]);

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

  const renderSlideProducts = (products: ProductType[], type: string) => (
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
      {!!products.length &&
        products.map((item: any, key: any) => (
          <SwiperSlide key={key}>
            <Product product={item} />
          </SwiperSlide>
        ))}
    </Swiper>
  );

  if (!match.length) return null;

  return (
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
            {match.length ? (
              renderSlideProducts(match, "match")
            ) : (
              <p className="text-center text-zinc-500">
                Nenhum produto relacionado encontrado
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
