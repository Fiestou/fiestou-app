import Api from "@/src/services/api";
import Template from "@/src/template";
import Img from "@/src/components/utils/ImgBase";
import { Button } from "@/src/components/ui/form";
import { getExtenseData, getImage } from "@/src/helper";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import PostItem from "@/src/components/common/PostItem";
import Newsletter from "@/src/components/common/Newsletter";
import { useEffect, useMemo, useState } from "react";

export const getStaticPaths = async () => {
  const api = new Api();

  try {
    const request: any = await api.content({ url: "post" });
    const slugs = Array.isArray(request?.data)
      ? request.data
          .map((item: any) => (typeof item === "string" ? item : item?.slug))
          .filter(Boolean)
      : [];

    const paths = slugs.map((slug: string) => ({ params: { slug } }));

    return {
      paths,
      fallback: "blocking",
    };
  } catch (error) {
    console.error("Erro em getStaticPaths:", error);
    return {
      paths: [],
      fallback: "blocking",
    };
  }
};

export async function getStaticProps(ctx: any) {
  const api = new Api();
  const { slug } = ctx.params;

  try {
    const request: any = await api.content({ method: "get", url: `post/${slug}` });

    const postRaw = request?.data?.Post ?? {};
    const Post = {
      id: postRaw?.id ?? null,
      slug: postRaw?.slug ?? "",
      title: postRaw?.title ?? "",
      image: postRaw?.image ?? null,
      created_at: postRaw?.created_at ?? null,
      blocks: [],
    };
    const PostBlocksCount = Array.isArray(postRaw?.blocks)
      ? postRaw.blocks.length
      : 0;
    const relatedRaw = request?.data?.Related ?? [];
    const Related = Array.isArray(relatedRaw)
      ? relatedRaw.map((post: any) => ({
          id: post?.id,
          slug: post?.slug,
          title: post?.title,
          image: post?.image,
          created_at: post?.created_at,
        }))
      : [];
    const HeaderFooter = request?.data?.HeaderFooter ?? {};
    const DataSeo = request?.data?.DataSeo ?? {};
    const Scripts = request?.data?.Scripts ?? {};

    // Se o post não existir, retorna 404
    if (!Post?.slug) {
      return { notFound: true };
    }

    return {
      props: {
        Post,
        PostBlocksCount,
        Related,
        HeaderFooter,
        DataSeo,
        Scripts,
      },
      revalidate: 60, // ISR: atualiza a cada 1 min
    };
  } catch (error) {
    console.error("Erro em getStaticProps:", error);
    return { notFound: true };
  }
}

export default function Post({
  Post,
  PostBlocksCount,
  Related,
  HeaderFooter,
  DataSeo,
  Scripts,
}: {
  Post: any;
  PostBlocksCount: number;
  Related: Array<any>;
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
}) {
  const api = useMemo(() => new Api(), []);
  const [blocks, setBlocks] = useState<any[]>(
    Array.isArray(Post?.blocks) ? Post.blocks : [],
  );
  const [loadingBlocks, setLoadingBlocks] = useState(
    PostBlocksCount > 0 && blocks.length === 0,
  );

  useEffect(() => {
    if (!Post?.slug) return;
    if (PostBlocksCount === 0) {
      setLoadingBlocks(false);
      return;
    }
    if (blocks.length > 0) {
      setLoadingBlocks(false);
      return;
    }

    let cancelled = false;

    const loadBlocks = async () => {
      try {
        const request: any = await api.content({
          method: "get",
          url: `post/${Post.slug}`,
        });

        if (cancelled) return;
        const loadedBlocks = Array.isArray(request?.data?.Post?.blocks)
          ? request.data.Post.blocks
          : [];
        setBlocks(loadedBlocks);
      } catch {
        if (!cancelled) {
          setBlocks([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingBlocks(false);
        }
      }
    };

    loadBlocks();

    return () => {
      cancelled = true;
    };
  }, [Post?.slug, PostBlocksCount, api, blocks.length]);

  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `${Post?.title ?? "Post"} | Blog | ${DataSeo?.site_text ?? ""}`,
        image: getImage(Post?.image) || "",
        url: `blog/${Post?.slug ?? ""}`,
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
      <section className="bg-cyan-500 pt-24 md:pt-40 relative">
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
          <div className="absolute left-0 w-full h-1/2 bg-cyan-500"></div>
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
            {loadingBlocks && (
              <div className="grid gap-3 animate-pulse">
                <div className="h-4 w-4/5 rounded bg-zinc-200" />
                <div className="h-4 w-full rounded bg-zinc-200" />
                <div className="h-4 w-5/6 rounded bg-zinc-200" />
                <div className="h-4 w-3/4 rounded bg-zinc-200" />
              </div>
            )}

            {!loadingBlocks && !blocks.length && PostBlocksCount > 0 && (
              <p className="text-zinc-500 text-center">
                Não foi possível carregar o conteúdo deste post agora.
              </p>
            )}

            {!!blocks?.length &&
              blocks
                .slice()
                .reverse()
                .map((item: any, key: number) => (
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
              Related.slice()
                .reverse()
                .map((post: any, key: number) => (
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
