import Api from "@/src/services/api";
import Template from "@/src/template";
import Link from "next/link";
import { useState } from "react";
import Img from "@/src/components/utils/ImgBase";
import { Button, Input, Label } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { cleanText, getExtenseData, getImage } from "@/src/helper";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export const getStaticPaths = async (ctx: any) => {
  const api = new Api();

  let request: any = await api.call(
    {
      url: "request/graph",
      data: [
        {
          model: "communicate as posts",
        },
      ],
    },
    ctx
  );

  const posts = request?.data?.query?.posts ?? [];

  const paths = posts
    .filter((post: any) => !!post.slug)
    .map((post: any) => {
      return { params: { slug: post.slug } };
    });

  return {
    paths: paths,
    fallback: true,
  };
};

export async function getStaticProps(ctx: any) {
  const api = new Api();

  const { slug } = ctx.params;

  let request: any = await api.call(
    {
      url: "request/graph",
      data: [
        {
          model: "communicate as post",
          filer: [
            {
              key: "slug",
              value: slug,
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
        {
          model: "page as Scripts",
          filter: [
            {
              key: "slug",
              value: "scripts",
              compare: "=",
            },
          ],
        },
      ],
    },
    ctx
  );

  const post = request?.data?.query?.post ?? [];
  const HeaderFooter = request?.data?.query?.HeaderFooter ?? [];
  const DataSeo = request?.data?.query?.DataSeo ?? [];
  const Scripts = request?.data?.query?.Scripts ?? [];

  return {
    props: {
      post: post[0] ?? {},
      HeaderFooter: HeaderFooter[0] ?? {},
      DataSeo: DataSeo[0] ?? {},
      Scripts: Scripts[0] ?? {},
    },
  };
}

export default function Post({
  post,
  HeaderFooter,
  DataSeo,
  Scripts,
}: {
  post: any;
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
}) {
  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `${post?.title} | ${DataSeo?.site_text}`,
        image: !!getImage(DataSeo?.site_image)
          ? getImage(DataSeo?.site_image)
          : "",
        url: `comunicados/${post?.slug}`,
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
      <section className="bg-cyan-500  pt-24 md:pt-40 relative">
        <div className="container-medium relative pb-4 md:pb-10 text-white">
          <div className="grid text-center">
            <div className="pb-4">
              <Breadcrumbs
                justify="justify-center"
                links={[
                  { url: "/comunicados/" + post?.slug, name: "Comunicados" },
                ]}
              />
            </div>
            <h1 className="font-title font-bold text-4xl md:text-5xl mb-4">
              {post?.title}
            </h1>
            <div className="text-base font-medium opacity-70">
              {getExtenseData(post?.created_at)}
            </div>
          </div>
        </div>
      </section>

      {!!getImage(post?.image) && (
        <section className="relative">
          <div className="absolute w-full h-1/2 bg-cyan-500 "></div>
          <div className="w-full mx-auto max-w-[56rem] relative rounded-xl overflow-hidden">
            <div className="aspect-[4/2] bg-zinc-100">
              <Img
                size="7xl"
                src={getImage(post?.image)}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
      )}

      <section className="my-10 pb-20">
        <div className="container-medium">
          <div className="mx-auto max-w-[40rem] grid gap-4">
            {post?.blocks.map((item: any, key: any) => (
              <div
                key={key}
                dangerouslySetInnerHTML={{ __html: item.content }}
              ></div>
            ))}
          </div>
        </div>
      </section>
    </Template>
  );
}
