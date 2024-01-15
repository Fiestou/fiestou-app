import Api from "@/src/services/api";
import Template from "@/src/template";
import Link from "next/link";
import { useState } from "react";
import Img from "@/src/components/utils/ImgBase";
import { Button, Input, Label } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { clean, cleanText, getExtenseData, getImage } from "@/src/helper";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

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
              posts.map((item: any, key: any) => (
                <div key={key} className="w-full pb-6">
                  <Link href={`/blog/${item.slug}`}>
                    <div className="aspect-[4/3] bg-zinc-100 relative overflow-hidden rounded-lg">
                      <Img
                        src={getImage(item?.image)}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </Link>
                  <div className="grid gap-2 pt-4">
                    <div>
                      <Link href={`/blog/${item.slug}`}>
                        <div className="text-zinc-900 hover:text-yellow-500 ease font-bold text-xl">
                          {item.title}
                        </div>
                      </Link>
                      <div className="text-sm text-zinc-400">
                        {getExtenseData(item.created_at)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>
    </Template>
  );
}
