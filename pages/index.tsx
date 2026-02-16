import dynamic from "next/dynamic";
import Template from "@/src/template";
import Api from "@/src/services/api";
import { ProductType } from "@/src/models/product";
import Filter from "@/src/components/common/filters/Filter";
import MainSlider from "@/src/components/home/main-slider/MainSlider";
import ProductSection from "@/src/components/home/product-section/ProductSection";
import LazyRender from "@/src/components/common/LazyRender";
import { categoriesData } from "@/src/data/categories/categories";
import { partnersData } from "@/src/data/partners/partners";
import { testimonialsData } from "@/src/data/testimonials/testimonials";
import { getImage } from "@/src/helper";

const StepsSection = dynamic(
  () => import("@/src/components/home/steps-section/StepsSection"),
  { ssr: false },
);
const CategoriesSection = dynamic(
  () => import("@/src/components/home/categories-section/CategoriesSection"),
  { ssr: false },
);
const PartnersSection = dynamic(
  () => import("@/src/components/home/partners-section/PartnersSection"),
  { ssr: false },
);
const TestimonialsSection = dynamic(
  () => import("@/src/components/home/testimonials-section/TestimonialsSection"),
  { ssr: false },
);
const BlogSection = dynamic(
  () => import("@/src/components/home/blog-section/BlogSection"),
  { ssr: false },
);
const Newsletter = dynamic(
  () => import("@/src/components/common/Newsletter"),
  { ssr: false },
);

const toNullable = (value: any) => (value === undefined ? null : value);

const slimImagePayload = (image: any) => {
  if (!image) return null;
  if (typeof image === "string") return image;

  if (Array.isArray(image?.medias)) {
    const medias = image.medias.map(slimImagePayload).filter(Boolean);
    return medias.length ? { medias } : null;
  }

  const detailsSizes = image?.details?.sizes;
  const simpleSizes = image?.sizes;
  const next: Record<string, any> = {};

  if (image?.base_url) next.base_url = image.base_url;
  if (image?.permanent_url) next.permanent_url = image.permanent_url;
  if (image?.extension) next.extension = image.extension;
  if (detailsSizes) next.details = { sizes: detailsSizes };
  if (image?.url) next.url = image.url;
  if (simpleSizes) next.sizes = simpleSizes;

  return Object.keys(next).length ? next : null;
};

const slimProductForCard = (product: any) => {
  const storeData = typeof product?.store === "object" ? product.store : {};
  const firstGallery =
    Array.isArray(product?.gallery) && product.gallery.length
      ? product.gallery[0]
      : null;
  const slimGallery = slimImagePayload(firstGallery);
  const hasAttrs =
    Array.isArray(product?.attributes) ? product.attributes.length > 0 : !!product?.attributes;

  return {
    id: toNullable(product?.id),
    title: toNullable(product?.title),
    slug: toNullable(product?.slug),
    comercialType: toNullable(product?.comercialType),
    rate: toNullable(product?.rate),
    price: toNullable(product?.price),
    priceSale: toNullable(product?.priceSale),
    gallery: slimGallery ? [slimGallery] : [],
    ...(hasAttrs ? { attributes: [] } : {}),
    store: {
      id: toNullable(storeData?.id),
      slug: toNullable(storeData?.slug),
      title: toNullable(storeData?.title ?? storeData?.companyName),
      logo: slimImagePayload(storeData?.logo),
      image: slimImagePayload(storeData?.image ?? storeData?.profile),
    },
  };
};

const slimBlogPost = (post: any) => ({
  id: toNullable(post?.id),
  slug: toNullable(post?.slug),
  title: toNullable(post?.title),
  image: slimImagePayload(post?.image),
  created_at: toNullable(post?.created_at),
});

type HomeProps = {
  HomeData: any;
  Products: ProductType[];
  Categories: any[];
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
  Blog: any[];
};

export async function getStaticProps(ctx: any) {
  const api = new Api();

  try {
    const request: any = await api.content(
      {
        method: "get",
        url: "home",
      },
      ctx,
    );

    const data = request?.data ?? {};
    const homeRaw = data?.Home ?? {};
    const mainSlideRaw = Array.isArray(homeRaw?.main_slide) ? homeRaw.main_slide : [];

    return {
      props: {
        HomeData: {
          main_slide: mainSlideRaw.map((slide: any) => ({
            id: toNullable(slide?.id),
            main_slide_cover: slimImagePayload(slide?.main_slide_cover),
            main_slide_cover_mobile: slimImagePayload(slide?.main_slide_cover_mobile),
            main_slide_text: toNullable(slide?.main_slide_text),
            main_slide_description: toNullable(slide?.main_slide_description),
            main_slide_redirect: {
              url: toNullable(slide?.main_slide_redirect?.url),
              label: toNullable(slide?.main_slide_redirect?.label),
            },
          })),
        },
        Products: Array.isArray(data?.Products)
          ? data.Products.map(slimProductForCard)
          : [],
        Categories: data?.Categories ?? [],
        HeaderFooter: data?.HeaderFooter ?? {},
        DataSeo: {
          site_text: data?.DataSeo?.site_text ?? "",
          site_description: data?.DataSeo?.site_description ?? "",
          site_image: getImage(data?.DataSeo?.site_image) ?? "",
        },
        Scripts: data?.Scripts ?? {},
        Blog: Array.isArray(data?.Blog) ? data.Blog.map(slimBlogPost) : [],
      },
      revalidate: 60,
    };
  } catch (error) {
    console.error("Erro ao carregar dados da Home:", error);
    return {
      props: {
        HomeData: {},
        Products: [],
        Categories: [],
        HeaderFooter: {},
        DataSeo: {},
        Scripts: {},
        Blog: [],
      },
      revalidate: 60,
    };
  }
}

export default function Home({
  HomeData,
  Products,
  Categories,
  HeaderFooter,
  DataSeo,
  Scripts,
  Blog,
}: HomeProps) {
  const featuredCategories =
    Array.isArray(Categories) && Categories.length ? Categories : categoriesData;

  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `${DataSeo?.site_text} - ${DataSeo?.site_description}`,
        image: DataSeo?.site_image ?? "",
        description: DataSeo?.site_description,
      }}
      header={{
        template: "default",
        position: "fixed",
        background: "bg-transparent",
        content: HeaderFooter,
      }}
      footer={{
        template: "default",
        content: HeaderFooter,
      }}
    >
      <MainSlider slides={HomeData?.main_slide} />
      <div className="relative pb-16 -mt-7">
        <div className="absolute w-full">
          <Filter />
        </div>
      </div>
      <ProductSection products={Products} />

      <LazyRender
        minHeight={340}
        placeholder={<div className="h-[340px] w-full animate-pulse bg-zinc-50" />}
      >
        <StepsSection />
      </LazyRender>

      <LazyRender
        minHeight={560}
        placeholder={<div className="h-[560px] w-full animate-pulse bg-zinc-50" />}
      >
        <CategoriesSection categories={featuredCategories} />
      </LazyRender>

      <LazyRender
        minHeight={420}
        placeholder={<div className="h-[420px] w-full animate-pulse bg-zinc-50" />}
      >
        <TestimonialsSection testimonials={testimonialsData} />
      </LazyRender>

      <LazyRender
        minHeight={520}
        placeholder={<div className="h-[520px] w-full animate-pulse bg-zinc-50" />}
      >
        <PartnersSection partners={partnersData} />
      </LazyRender>

      <LazyRender
        minHeight={540}
        placeholder={<div className="h-[540px] w-full animate-pulse bg-zinc-50" />}
      >
        <BlogSection Blog={Blog} />
      </LazyRender>

      <LazyRender
        minHeight={260}
        placeholder={<div className="h-[260px] w-full animate-pulse bg-zinc-50" />}
      >
        <Newsletter />
      </LazyRender>
    </Template>
  );
}
