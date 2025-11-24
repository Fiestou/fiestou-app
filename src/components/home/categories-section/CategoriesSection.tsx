"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Button } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Img from "@/src/components/utils/ImgBase";
import { getImage } from "@/src/helper";

import "swiper/css";

interface CategoryItem {
  slug: string;
  image: any;
  imageHover?: any;
  title: string;
  feature?: boolean;
  id?: string | number;
  name?: string;
  description?: string;
}

interface CategoriesSectionProps {
  title?: string;
  description?: string;
  categories?: CategoryItem[];
}

export default function CategoriesSection({
  title = "Comece escolhendo o tipo de festa",
  description = "",
  categories = [],
}: CategoriesSectionProps) {
  const categoriesFiltered = categories?.filter((item) => item?.feature);

  return (
    <section className="xl:py-14">
      <div className="max-w-[88rem] py-12 md:py-20 mx-auto bg-zinc-100">
        <div className="container-medium">
          <div className="max-w-xl mx-auto text-center pb-14">
            <h2 className="font-title text-zinc-900 font-bold text-4xl md:text-5xl mt-2">
              {title}
            </h2>

            {!!description && (
              <p className="text-zinc-700 text-lg mt-4">{description}</p>
            )}
          </div>

          <div className="bg-white py-4 md:py-10 rounded-xl overflow-hidden relative">
            <Swiper
              spaceBetween={16}
              breakpoints={{
                0: { slidesPerView: 2.5 },
                640: { slidesPerView: 3.5 },
                1024: { slidesPerView: 5 },
              }}
            >
              {categoriesFiltered?.map((item, key) => (
                <SwiperSlide key={key}>
                  <Link
                    href={`/produtos/listagem/?order=desc&range=1000&page=1&category=${item.slug}`}
                  >
                    <div className="group grid gap-2 text-center cursor-pointer">
                      <div className="w-full max-w-[10rem] mx-auto aspect-square relative">
                        <Img
                          src={
                            item?.image?.includes("/images")
                              ? item.image
                              : getImage(item?.image, "thumb")
                          }
                          alt={item?.title}
                          title={item?.title}
                          className="w-full h-full object-contain transition-opacity duration-300 group-hover:opacity-0"
                        />

                        {item?.imageHover && (
                          <Img
                            src={
                              item?.imageHover?.includes("/images")
                                ? item.imageHover
                                : getImage(item?.imageHover, "thumb")
                            }
                            alt={item?.title}
                            title={item?.title}
                            className="w-full h-full object-contain absolute top-0 left-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                          />
                        )}
                      </div>

                      <div className="pb-2">
                        <h3 className="font-title font-bold text-zinc-900 group-hover:text-yellow-400 whitespace-nowrap">
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
            <Button href="/produtos">
              <Icon icon="fa-shopping-bag" type="far" />
              Ver todos
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
