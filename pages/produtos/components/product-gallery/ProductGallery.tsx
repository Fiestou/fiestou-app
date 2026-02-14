"use client";

import { useState } from "react";
import Img from "@/src/components/utils/ImgBase";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { ProductType } from "@/src/models/product";
import { getImage } from "@/src/helper";
import { StoreType } from "@/src/models/store";

interface ProductGalleryProps {
  product: ProductType;
  store: StoreType;
  categories: any[];
  layout: { isMobile: boolean };
  renderDetails?: () => JSX.Element;
  renderComments?: () => JSX.Element;
}

export default function ProductGallery({ product }: ProductGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!product?.gallery?.length) return null;

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? product.gallery.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev === product.gallery.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div>
      <div className="relative bg-white -mx-4 md:mx-0 border-y md:border md:rounded-md overflow-hidden">
        <div className="w-full h-[300px] md:h-[450px] flex items-center justify-center bg-gray-50">
          {product.gallery.map((img, index) => (
            <div
              key={index}
              className={`w-full h-full ${index === currentIndex ? 'block' : 'hidden'}`}
            >
              {!!img?.details?.sizes?.lg && (
                <Img
                  src={getImage(img)}
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          ))}
        </div>

        {product.gallery.length > 1 && (
          <>
            <div className="absolute top-1/2 left-0 -translate-y-1/2 z-[5] p-2">
              <button
                type="button"
                onClick={goToPrevious}
                className="bg-[#ffc820] text-white bg-opacity-50 hover:bg-opacity-70 ease text-sm p-4 rounded-full relative"
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
                onClick={goToNext}
                className="bg-[#ffc820] text-white bg-opacity-50 hover:bg-opacity-70 ease text-sm p-4 rounded-full relative"
              >
                <Icon
                  icon="fa-chevron-right"
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                />
              </button>
            </div>
          </>
        )}

        {product.gallery.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-[5]">
            {product.gallery.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition ${
                  index === currentIndex
                    ? 'bg-[#ffc820] w-6'
                    : 'bg-white bg-opacity-50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
