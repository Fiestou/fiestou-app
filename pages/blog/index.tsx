import Api from "@/src/services/api";
import Template from "@/src/template";
import Img from "@/src/components/utils/ImgBase";
import { getImage } from "@/src/helper";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import PostItem from "@/src/components/common/PostItem";

export async function getStaticProps(ctx: any) {
  const api = new Api();

  let request: any = await api.content({ method: 'get', url: `blog` });

  const Blog = request?.data?.Blog ?? {};
  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};
  const PostsRaw = request?.data?.Posts ?? [];
  const Posts = Array.isArray(PostsRaw)
    ? PostsRaw.map((post: any) => ({
        id: post?.id,
        slug: post?.slug,
        title: post?.title,
        image: post?.image,
        created_at: post?.created_at,
      }))
    : [];

  return {
    props: {
      Posts: Posts,
      Blog: Blog,
      DataSeo: DataSeo,
      Scripts: Scripts,
      HeaderFooter: HeaderFooter,
    },
    revalidate: 60 * 60 * 60,
  };
}

export default function Post({
  Posts,
  Blog,
  HeaderFooter,
  DataSeo,
  Scripts,
}: {
  Posts: Array<any>;
  Blog: any;
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
}) {
  return (
    <Template
      scripts={Scripts}
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
      <section className="bg-cyan-500  pt-24 md:pt-32 relative">
        <div className="container-medium relative pb-4 md:pb-10 text-white">
          <div className="flex">
            <div className="w-full">
              <div className="pb-4">
                <Breadcrumbs links={[{ url: "/blog", name: "Blog" }]} />
              </div>
              <h1
                className="font-title font-bold text-4xl md:text-5xl mb-4"
              >	Inspire sua Festa!</h1>
              <div
                className="text-lg md:text-2xl font-semibold"
                dangerouslySetInnerHTML={{ __html: Blog?.blog_description }}
              ></div>
            </div>
            {!!getImage(Blog?.blog_icons) && (
              <div className="w-fit">
                <Img
                  src={getImage(Blog?.blog_icons)}
                  className="w-auto max-w-full"
                />
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="py-10 md:pb-20 relative overflow-hidden">
        <div className="container-medium grid gap-6 md:gap-10">
          <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {!!Posts.length &&
              Posts.slice().reverse().map((post: any, key: any) => (
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
