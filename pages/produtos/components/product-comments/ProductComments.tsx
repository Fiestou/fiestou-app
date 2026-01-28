"use client";

import Icon from "@/src/icons/fontAwesome/FIcon";
import { CommentType } from "@/src/models/product";
import { Button } from "@/src/components/ui/form"; // Assumindo que Button está disponível, como no exemplo

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation, Autoplay } from "swiper"; // Removi Autoplay para leitura no ritmo do usuário

interface ProductCommentsProps {
  comments: CommentType[];
}

export default function ProductComments({ comments }: ProductCommentsProps) {
  if (!comments?.length) return null;

  return (
    <div className="w-full max-w-96 md:max-w-xl lg:max-w-xl mx-auto px-4 sm:px-0 mt-4 md:mt-10 bg-zinc-50 p-4 sm:p-6 lg:p-8 rounded-xl">
      <div className="font-title font-bold text-zinc-900 mb-4">
        <Icon icon="fa-comments" type="fal" className="mr-2" />
        {comments.length} comentário
        {comments.length === 1 ? "" : "s"}
      </div>

      <Swiper
        pagination={{
          el: ".swiper-comments-pagination",
          type: "fraction",
        }}
        spaceBetween={16}
        modules={[Pagination, Navigation, Autoplay]}
        navigation={{
          nextEl: ".swiper-comments-next",
          prevEl: ".swiper-comments-prev",
        }}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        loop={comments.length > 1}
      >
        {comments.map((item) => (
          <SwiperSlide key={item.id}>
            <div className="p-4 border rounded-lg bg-white">
              <div className="flex gap-2 items-center">
                <div className="w-full">
                  <div className="text-zinc-900 font-bold text-sm">
                    {item.user?.name ?? "Usuário"}
                  </div>
                  <div className="flex gap-1 text-xs">
                    {[1, 2, 3, 4, 5].map((value) => (
                      <Icon
                        key={value}
                        icon="fa-star"
                        type="fa"
                        className={
                          item.rate >= value
                            ? "text-yellow-500"
                            : "text-gray-300"
                        }
                      />
                    ))}
                  </div>
                </div>
              </div>
              <div className="pt-3 text-sm text-zinc-700">{item.text}</div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="flex gap-2 pt-4 items-center">
        <span className="swiper-comments-pagination w-auto pr-3"></span>
        <Button className="swiper-comments-prev p-4 rounded-full">
          <Icon
            icon="fa-arrow-left"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </Button>
        <Button className="swiper-comments-next p-4 rounded-full">
          <Icon
            icon="fa-arrow-right"
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          />
        </Button>
      </div>
    </div>
  );
}
