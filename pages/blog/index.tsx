import Api from "@/src/services/api";
import Template from "@/src/template";
import Link from "next/link";
import { useState } from "react";
import Img from "@/src/components/utils/ImgBase";
import { Button, Input, Label } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { clean, cleanText, getExtenseData, getImage } from "@/src/helper";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import PostItem from "@/src/components/common/PostItem";

export async function getStaticProps(ctx: any) {
  const api = new Api();

  let request: any = await api.call(
    {
      url: "request/graph",
      data: [
        {
          model: "blog as posts",
        },
        {
          model: "page",
          filter: [
            {
              key: "slug",
              value: "blog",
              compare: "=",
            },
          ],
        },
        {
          model: "page as HeaderFooter",
          filter: [
            {
              key: "slug",
              value: "menu",
              compare: "=",
            },
          ],
        },
        {
          model: "page as DataSeo",
          filter: [
            {
              key: "slug",
              value: "seo",
              compare: "=",
            },
          ],
        },
      ],
    },
    ctx
  );

  const content = request?.data?.query?.page ?? [];
  const HeaderFooter = request?.data?.query?.HeaderFooter ?? [];
  const DataSeo = request?.data?.query?.DataSeo ?? [];
  const Scripts = request?.Scripts ?? [];
  const posts = request?.data?.query?.posts ?? [];

  return {
    props: {
      posts: posts,
      content: content[0] ?? {},
      DataSeo: DataSeo[0] ?? {},
      Scripts: Scripts[0] ?? {},
      HeaderFooter: HeaderFooter[0] ?? {},
    },
    revalidate: 60,
  };
}

export default function Post({
  posts,
  content,
  HeaderFooter,
  DataSeo,
  Scripts,
}: {
  posts: Array<any>;
  content: any;
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
}) {
  return (
    <Template
      metaPage={{
        title: `Blog | ${DataSeo?.site_text}`,
        image: !!getImage(DataSeo?.site_image)
          ? getImage(DataSeo?.site_image)
          : "",
        url: `blog`,
      }}
      header={{
        template: "default",
        position: "fixed",
        content: HeaderFooter,
      }}
      footer={{
        template: "default",
        content: HeaderFooter,
      }}
    >
      <section className="bg-cyan-500 pt-24 md:pt-32 relative">
        <div className="container-medium relative pb-4 md:pb-10 text-white">
          <div className="flex">
            <div className="w-full">
              <div className="pb-4">
                <Breadcrumbs links={[{ url: "/sobre", name: "Sobre" }]} />
              </div>
              <h1
                className="font-title font-bold text-4xl md:text-5xl mb-4"
                dangerouslySetInnerHTML={{ __html: content.blog_text }}
              ></h1>
              <div
                className="text-lg md:text-2xl font-semibold"
                dangerouslySetInnerHTML={{ __html: content.blog_description }}
              ></div>
            </div>
            {!!getImage(content.blog_icons) && (
              <div className="w-fit">
                <Img
                  src={getImage(content.blog_icons)}
                  className="w-auto max-w-full"
                />
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="py-10 md:py-20 relative overflow-hidden">
        <div className="container-medium grid gap-6 md:gap-10">
          <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {!!posts.length &&
              posts.map((post: any, key: any) => (
                <div key={key} className="w-full pb-6">
                  <PostItem post={post} />
                </div>
              ))}
          </div>
        </div>
      </section>
    </Template>
  );
}
