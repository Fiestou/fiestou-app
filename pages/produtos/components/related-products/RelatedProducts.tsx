"use client";

import { useEffect, useRef, useState } from "react";
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
import { getAutomaticRecommendations } from "@/src/services/recommendations";

type RelatedProductsProps = {
  product: ProductType;
  store: StoreType;
};

type RelatedProductsResult = {
  title: string;
  items: ProductType[];
  strategy: string[];
  hasPersonalization: boolean;
};

const RELATED_CACHE_LIMIT = 120;
const relatedCache = new Map<string, RelatedProductsResult>();
const relatedInFlight = new Map<string, Promise<RelatedProductsResult>>();

const toStoreId = (store: StoreType) => {
  const raw = Number((store as any)?.id ?? 0);
  return Number.isFinite(raw) ? raw : 0;
};

const toCacheKey = (productId: number, storeId: number) => `${productId}:${storeId}`;

const toProductStoreId = (product: any) => {
  const rawStore = product?.store;
  if (typeof rawStore === "number" || typeof rawStore === "string") {
    const storeId = Number(rawStore);
    return Number.isFinite(storeId) ? storeId : 0;
  }

  const storeId = Number(rawStore?.id ?? 0);
  return Number.isFinite(storeId) ? storeId : 0;
};

const writeRelatedCache = (cacheKey: string, value: RelatedProductsResult) => {
  relatedCache.set(cacheKey, value);

  if (relatedCache.size > RELATED_CACHE_LIMIT) {
    const firstKey = relatedCache.keys().next().value;
    if (firstKey) {
      relatedCache.delete(firstKey);
    }
  }
};

const normalizeRecommendationItems = (
  items: any[],
  productId: number,
): ProductType[] => {
  if (!Array.isArray(items) || !items.length) return [];

  const usedIds = new Set<number>();

  return items
    .filter((item) => {
      const id = Number(item?.id ?? 0);
      if (!id || id === productId) return false;
      if (usedIds.has(id)) return false;
      usedIds.add(id);
      return true;
    })
    .slice(0, 10) as ProductType[];
};

const resolveRecommendationTitle = ({
  items,
  storeId,
  hasPersonalization,
  strategy,
}: {
  items: ProductType[];
  storeId: number;
  hasPersonalization: boolean;
  strategy: string[];
}) => {
  if (!items.length) return "Veja também";

  const normalizedStrategy = strategy.map((value) =>
    String(value || "").toLowerCase(),
  );

  if (hasPersonalization && normalizedStrategy.includes("search_intent")) {
    return "Baseado no seu interesse";
  }

  if (hasPersonalization) {
    return "Recomendados para você";
  }

  const itemsFromSameStore = items.filter(
    (item) => toProductStoreId(item) > 0 && toProductStoreId(item) === storeId,
  ).length;

  if (storeId > 0 && itemsFromSameStore >= Math.min(3, items.length)) {
    return "Mais dessa loja";
  }

  return "Veja também";
};

export default function RelatedProducts({ product, store }: RelatedProductsProps) {
  const [match, setMatch] = useState<ProductType[]>([]);
  const [title, setTitle] = useState("Veja também");
  const [loading, setLoading] = useState(true);
  const requestIdRef = useRef(0);

  const fetchFallbackProducts = async (
    productId: number,
    storeId: number,
  ): Promise<ProductType[]> => {
    const api = new Api();
    try {
      const request: any = await api.request({
        method: "get",
        url: "request/products",
        data: {
          store: storeId || 0,
          limit: 12,
          ordem: "desc",
        },
      });

      const related = Array.isArray(request?.data) ? request.data : [];
      return normalizeRecommendationItems(related, productId);
    } catch {
      return [];
    }
  };

  const fetchRelatedProducts = async (
    productId: number,
  ): Promise<RelatedProductsResult> => {
    const response: any = await getAutomaticRecommendations({
      productId,
      limit: 10,
      exclude: [productId],
    });

    if (response?.response && Array.isArray(response?.data) && response.data.length > 0) {
      const items = normalizeRecommendationItems(response.data, productId);
      if (!items.length) {
        return {
          title: "Veja também",
          items: [],
          strategy: [],
          hasPersonalization: false,
        };
      }

      const strategy = Array.isArray(response?.meta?.strategy)
        ? response.meta.strategy.map((value: unknown) => String(value))
        : [];
      const hasPersonalization = Boolean(response?.meta?.has_personalization);
      const title = resolveRecommendationTitle({
        items,
        storeId: toStoreId(store),
        hasPersonalization,
        strategy,
      });

      return {
        title,
        items,
        strategy,
        hasPersonalization,
      };
    }

    return {
      title: "Veja também",
      items: [],
      strategy: [],
      hasPersonalization: false,
    };
  };

  const resolveRelatedProducts = async (
    productId: number,
    storeId: number,
  ): Promise<RelatedProductsResult> => {
    const cacheKey = toCacheKey(productId, storeId);
    const cached = relatedCache.get(cacheKey);
    if (cached) return cached;

    const inFlight = relatedInFlight.get(cacheKey);
    if (inFlight) return inFlight;

    const request = (async () => {
      let baseResult: RelatedProductsResult = {
        title: "Veja também",
        items: [],
        strategy: [],
        hasPersonalization: false,
      };

      try {
        baseResult = await fetchRelatedProducts(productId);
      } catch {
        baseResult = {
          title: "Veja também",
          items: [],
          strategy: [],
          hasPersonalization: false,
        };
      }

      if (!baseResult.items.length) {
        const fallback = await fetchFallbackProducts(productId, storeId);
        const fallbackTitle = resolveRecommendationTitle({
          items: fallback,
          storeId,
          hasPersonalization: false,
          strategy: [],
        });
        baseResult = {
          title: fallbackTitle,
          items: fallback,
          strategy: ["legacy_fallback"],
          hasPersonalization: false,
        };
      }

      writeRelatedCache(cacheKey, baseResult);
      return baseResult;
    })();

    relatedInFlight.set(cacheKey, request);

    try {
      return await request;
    } finally {
      relatedInFlight.delete(cacheKey);
    }
  };

  useEffect(() => {
    const productId = Number(product?.id ?? 0);
    const storeId = toStoreId(store);
    if (!productId) {
      setLoading(false);
      return;
    }

    let active = true;
    const currentRequestId = ++requestIdRef.current;
    const cacheKey = toCacheKey(productId, storeId);
    const cached = relatedCache.get(cacheKey);

    if (cached) {
      setTitle(cached.title);
      setMatch(cached.items);
      setLoading(false);
    } else {
      setLoading(true);
    }

    const load = async () => {
      let result: RelatedProductsResult;
      try {
        result = await resolveRelatedProducts(productId, storeId);
      } catch {
        result = {
          title: "Veja também",
          items: [],
          strategy: [],
          hasPersonalization: false,
        };
      }

      if (!active || currentRequestId !== requestIdRef.current) {
        return;
      }

      setTitle(result.title);
      setMatch(result.items);
      setLoading(false);
    };

    load();

    return () => {
      active = false;
    };
  }, [product?.id, store?.id]);

  if (loading && !match.length) {
    return (
      <section className="pt-8 md:pt-16">
        <div className="container-medium">
          <div className="h-9 w-56 rounded-md bg-zinc-100 animate-pulse" />
          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="h-72 rounded-xl bg-zinc-100 animate-pulse" />
            <div className="h-72 rounded-xl bg-zinc-100 animate-pulse hidden md:block" />
            <div className="h-72 rounded-xl bg-zinc-100 animate-pulse hidden lg:block" />
            <div className="h-72 rounded-xl bg-zinc-100 animate-pulse hidden lg:block" />
          </div>
        </div>
      </section>
    );
  }

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
          <SwiperSlide key={item?.id ?? key}>
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
              <FDobleIcon icon="fa-eye" size="sm" />
            </div>
            <h4 className="font-title font-bold text-zinc-900 text-3xl title-underline">
              {title}
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
