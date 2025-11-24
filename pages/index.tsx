"use client";

import { useEffect, useState } from "react";
import Template from "@/src/template";
import Api, { getHomeStatus } from "@/src/services/api";
import { ProductType } from "@/src/models/product";

import Newsletter from "@/src/components/common/Newsletter";
import Filter from "@/src/components/common/filters/Filter";
import MainSlider from "@/src/components/home/main-slider/MainSlider";
import ProductSection from "@/src/components/home/product-section/ProductSection";
import StepsSection from "@/src/components/home/steps-section/StepsSection";
import CategoriesSection from "@/src/components/home/categories-section/CategoriesSection";
import PartnersSection from "@/src/components/home/partners-section/PartnersSection";
import TestimonialsSection from "@/src/components/home/testimonials-section/TestimonialsSection";
import BlogSection from "@/src/components/home/blog-section/BlogSection";
import { categoriesData } from "@/src/data/categories/categories";
import Loading from "@/src/components/common/loading/Loading";
import { partnersData } from "@/src/data/partners/partners";
import { testimonialsData } from "@/src/data/testimonials/testimonials";

export default function Home() {
  const api = new Api();

  const [HomeData, setHomeData] = useState<any>(null);
  const [Products, setProducts] = useState<ProductType[]>([]);
  const [Categories, setCategories] = useState<any[]>([]);
  const [HeaderFooter, setHeaderFooter] = useState<any>({});
  const [DataSeo, setDataSeo] = useState<any>({});
  const [Scripts, setScripts] = useState<any>({});
  const [Blog, setBlog] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getHomeStatus();

        setHomeData(data?.Home ?? {});
        setProducts(data?.Products ?? []);
        setCategories(data?.Categories ?? []);
        setHeaderFooter(data?.HeaderFooter ?? {});
        setDataSeo(data?.DataSeo ?? {});
        setScripts(data?.Scripts ?? {});
        setBlog(data?.Blog ?? []);
      } catch (error) {
        console.error("Erro ao carregar dados da Home:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return <Loading />;
  }

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
      <StepsSection />
      <CategoriesSection categories={categoriesData} />
      <TestimonialsSection testimonials={testimonialsData} />;
      <PartnersSection partners={partnersData} />
      <TestimonialsSection testimonials={testimonialsData} />
      <PartnersSection partners={partnersData} />
    </Template>
  );
}
