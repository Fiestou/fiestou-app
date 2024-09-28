import Api from "@/src/services/api";
import Template from "@/src/template";
import Link from "next/link";
import { useState } from "react";
import Img from "@/src/components/utils/ImgBase";
import { Button, Input, Label } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { cleanText, getExtenseData, getImage } from "@/src/helper";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import PostItem from "@/src/components/common/PostItem";
import Newsletter from "@/src/components/common/Newsletter";

export const getStaticPaths = async (ctx: any) => {
  // const api = new Api();

  // let request: any = await api.content({ url: `post` });

  // const paths = request.data
  //   .filter((slug: any) => !!slug)
  //   .map((slug: any) => {
  //     return { params: { slug: slug } };
  //   });

  return {
    paths: [],
    fallback: "blocking",
  };
};

export async function getStaticProps(ctx: any) {
  const api = new Api();

  const { slug } = ctx.params;

  let request: any = await api.content({ url: `post/${slug}` });

  const Post = request?.data?.Post ?? {};
  const Related = request?.data?.Related ?? [];
  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};

  return {
    props: {
      Post: Post,
      Related: Related,
      HeaderFooter: HeaderFooter,
      DataSeo: DataSeo,
      Scripts: Scripts,
    },
  };
}

export default function Post({
  Post,
  Related,
  HeaderFooter,
  DataSeo,
  Scripts,
}: {
  Post: any;
  Related: Array<any>;
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
}) {
  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `${Post?.title} | Blog | ${DataSeo?.site_text}`,
        image: !!getImage(Post?.image) ? getImage(Post?.image) : "",
        url: `blog/${Post?.slug}`,
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
                links={[{ url: "/blog", name: "Blog" }]}
              />
            </div>
            <h1 className="font-title font-bold text-4xl md:text-5xl mb-4">
              {Post?.title}
            </h1>
            <div className="text-base font-medium opacity-70">
              {getExtenseData(Post?.created_at)}
            </div>
          </div>
        </div>
      </section>

      {!!getImage(Post?.image, "xl") && (
        <section className="relative px-4">
          <div className="absolute left-0 w-full h-1/2 bg-cyan-500 "></div>
          <div className="w-full mx-auto max-w-[56rem] relative rounded-xl overflow-hidden">
            <div className="aspect-[4/2] bg-zinc-100">
              <Img
                size="7xl"
                src={getImage(Post?.image, "xl")}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
      )}

      <section className="my-10 pb-20">
        <div className="container-medium">
          <div className="content-editor mx-auto max-w-[40rem] grid gap-4">
            {!!Post?.blocks?.length &&
              Post?.blocks.map((item: any, key: any) => (
                <div
                  key={key}
                  dangerouslySetInnerHTML={{ __html: item.content }}
                ></div>
              ))}
          </div>
        </div>
      </section>

      <section className="xl:pb-14">
        <div className="container-medium">
          <div className="max-w-2xl mx-auto text-center pb-6 md:pb-14">
            <h2 className="font-title text-zinc-900 font-bold text-2xl md:text-4xl mt-2">
              Veja também
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-4 md:gap-6">
            {!!Related?.length &&
              Related.map((post: any, key: any) => (
                <div key={key}>
                  <PostItem post={post} />
                </div>
              ))}
          </div>
          <div className="text-center my-10">
            <Button href="/blog">Mais postagens</Button>
          </div>
        </div>
      </section>

      <Newsletter />
    </Template>
  );
}
