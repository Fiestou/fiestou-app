"use client";

import { useEffect, useMemo, useState } from "react";
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

export default function ProductGallery({ product, layout }: ProductGalleryProps) {
  const galleryItems = useMemo(
    () =>
      (Array.isArray(product?.gallery) ? product.gallery : [])
        .map((image, index) => {
          const src = getImage(image, "lg") || getImage(image);
          const thumb = getImage(image, "thumb") || src;

          if (!src) {
            return null;
          }

          return {
            id: `gallery-item-${index}`,
            src,
            thumb,
          };
        })
        .filter(Boolean) as Array<{ id: string; src: string; thumb: string }>,
    [product?.gallery]
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [isPortraitLightbox, setIsPortraitLightbox] = useState(false);

  useEffect(() => {
    if (!galleryItems.length) {
      setCurrentIndex(0);
      setLightboxOpen(false);
      return;
    }

    setCurrentIndex((prev) => Math.min(prev, galleryItems.length - 1));
  }, [galleryItems.length]);

  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLightboxOpen(false);
        return;
      }

      if (galleryItems.length <= 1) {
        return;
      }

      if (event.key === "ArrowLeft") {
        setCurrentIndex((prev) =>
          prev === 0 ? galleryItems.length - 1 : prev - 1
        );
      }

      if (event.key === "ArrowRight") {
        setCurrentIndex((prev) =>
          prev === galleryItems.length - 1 ? 0 : prev + 1
        );
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [galleryItems.length, lightboxOpen]);

  useEffect(() => {
    if (!lightboxOpen || typeof window === "undefined") {
      return;
    }

    const mediaQuery = window.matchMedia("(orientation: portrait)");
    const syncOrientation = () => {
      setIsPortraitLightbox(mediaQuery.matches);
    };

    syncOrientation();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", syncOrientation);
      return () => mediaQuery.removeEventListener("change", syncOrientation);
    }

    mediaQuery.addListener(syncOrientation);
    return () => mediaQuery.removeListener(syncOrientation);
  }, [lightboxOpen]);

  if (!galleryItems.length) return null;

  const currentImage = galleryItems[currentIndex] ?? galleryItems[0];
  const isMobileGallery = !!layout?.isMobile;
  const showMobileLightboxThumbs =
    galleryItems.length > 1 && !isPortraitLightbox;

  const goToPrevious = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? galleryItems.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setCurrentIndex((prev) =>
      prev === galleryItems.length - 1 ? 0 : prev + 1
    );
  };

  const imageLabel = product?.title
    ? `${product.title} - imagem ${currentIndex + 1}`
    : `Imagem ${currentIndex + 1}`;

  return (
    <>
      <div className="relative bg-white -mx-4 md:mx-0 border-y md:border md:rounded-md overflow-hidden">
        {isMobileGallery ? (
          <button
            type="button"
            onClick={() => setLightboxOpen(true)}
            className="group relative block h-[300px] w-full bg-gray-50 md:h-[450px]"
            aria-label="Abrir galeria de fotos do produto"
          >
            <div className="flex h-full w-full items-center justify-center">
              <Img
                src={currentImage.src}
                alt={imageLabel}
                className="h-full w-full object-contain"
                loading="eager"
                fetchPriority="high"
              />
            </div>
            <span className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-zinc-900 shadow-lg transition-transform duration-200 group-active:scale-[0.98]">
              <Icon icon="fa-expand" className="text-yellow-600" />
              Ver fotos
            </span>
          </button>
        ) : (
          <div className="w-full h-[300px] md:h-[450px] flex items-center justify-center bg-gray-50">
            <Img
              src={currentImage.src}
              alt={imageLabel}
              className="w-full h-full object-contain"
              loading="eager"
              fetchPriority="high"
            />
          </div>
        )}

        {galleryItems.length > 1 && (
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

        {galleryItems.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-[5]">
            {galleryItems.map((_, index) => (
              <button
                key={galleryItems[index].id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition ${
                  index === currentIndex
                    ? "bg-[#ffc820] w-6"
                    : "bg-white bg-opacity-50"
                }`}
              />
            ))}
          </div>
        )}
      </div>
      {lightboxOpen && isMobileGallery && (
        <div
          className="fixed inset-0 z-[120] bg-zinc-950/92 backdrop-blur-md"
          role="dialog"
          aria-modal="true"
          aria-label="Galeria de fotos do produto"
        >
          <div className="flex h-[100svh] flex-col overflow-hidden px-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-[calc(env(safe-area-inset-top)+0.75rem)]">
            <div className="relative flex-1 min-h-0">
              <div className="absolute inset-x-0 top-0 z-10 flex items-start justify-between gap-3 px-1">
                <div className="min-w-0 rounded-2xl border border-white/10 bg-black/35 px-3 py-2 text-white shadow-lg backdrop-blur-sm">
                  <p className="text-sm font-semibold">
                    Foto {currentIndex + 1} de {galleryItems.length}
                  </p>
                  {!!product?.title && (
                    <p className="truncate text-xs text-white/70">{product.title}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxOpen(false)}
                  className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white shadow-lg backdrop-blur-sm"
                  aria-label="Fechar galeria"
                >
                  <Icon icon="fa-times" className="text-base" />
                </button>
              </div>

              <div
                className={`flex h-full justify-center ${
                  showMobileLightboxThumbs
                    ? "items-center pb-20 pt-16"
                    : "items-start pb-2 pt-14"
                }`}
              >
                <div
                  className={`relative flex w-full items-center justify-center overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 shadow-2xl ${
                    showMobileLightboxThumbs
                      ? "h-full"
                      : "max-h-[calc(100svh-6rem)]"
                  }`}
                >
                  <Img
                    src={currentImage.src}
                    alt={imageLabel}
                    className={
                      showMobileLightboxThumbs
                        ? "max-h-full max-w-full object-contain"
                        : "h-auto max-h-[calc(100svh-8rem)] w-full object-contain"
                    }
                    loading="eager"
                    fetchPriority="high"
                  />

                  {galleryItems.length > 1 && (
                    <>
                      <button
                        type="button"
                        onClick={goToPrevious}
                        className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white shadow-lg backdrop-blur-sm"
                        aria-label="Foto anterior"
                      >
                        <Icon icon="fa-chevron-left" className="text-sm" />
                      </button>
                      <button
                        type="button"
                        onClick={goToNext}
                        className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/35 text-white shadow-lg backdrop-blur-sm"
                        aria-label="Próxima foto"
                      >
                        <Icon icon="fa-chevron-right" className="text-sm" />
                      </button>
                    </>
                  )}

                  {showMobileLightboxThumbs && (
                    <div className="absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/65 via-black/25 to-transparent px-3 pb-3 pt-8">
                      <div className="flex gap-2 overflow-x-auto pb-1">
                        {galleryItems.map((item, index) => {
                          const selected = index === currentIndex;

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setCurrentIndex(index)}
                              className={`relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-2xl border transition ${
                                selected
                                  ? "border-yellow-400 ring-2 ring-yellow-400/40"
                                  : "border-white/15 opacity-80"
                              }`}
                              aria-label={`Abrir foto ${index + 1}`}
                            >
                              <Img
                                src={item.thumb}
                                alt={`${product?.title || "Produto"} - miniatura ${index + 1}`}
                                className="h-full w-full object-cover"
                              />
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      {lightboxOpen && (
        <style jsx global>{`
          body {
            overflow: hidden;
          }
        `}</style>
      )}
    </>
  );
}
