import Api from "@/src/services/api";
import Template from "@/src/template";
import Img from "@/src/components/utils/ImgBase";
import { getExtenseData, getImage } from "@/src/helper";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export const getStaticPaths = async (ctx: any) => {
  const api = new Api();

  let request: any = await api.content({method: 'get', url: `communicate` });

  const paths = request.data
    .filter((slug: any) => !!slug)
    .map((slug: any) => {
      return { params: { slug: slug } };
    });

  return {
    paths: paths,
    fallback: true,
  };
};

export async function getStaticProps(ctx: any) {
  const api = new Api();

  const { slug } = ctx.params;

  let request: any = await api.content({method: 'get', url: `communicate/${slug}` });

  const Communicate = request?.data?.Communicate ?? {};
  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};

  return {
    props: {
      Communicate: Communicate,
      HeaderFooter: HeaderFooter,
      DataSeo: DataSeo,
      Scripts: Scripts,
    },
  };
}

export default function Communicate({
  Communicate,
  HeaderFooter,
  DataSeo,
  Scripts,
}: {
  Communicate: any;
  HeaderFooter: any;
  DataSeo: any;
  Scripts: any;
}) {
  return (
    <Template
      scripts={Scripts}
      metaPage={{
        title: `${Communicate?.title} | ${DataSeo?.site_text}`,
        image: !!getImage(DataSeo?.site_image)
          ? getImage(DataSeo?.site_image)
          : "",
        url: `comunicados/${Communicate?.slug}`,
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
                  {
                    url: "/comunicados/" + Communicate?.slug,
                    name: "Comunicados",
                  },
                ]}
              />
            </div>
            <h1 className="font-title font-bold text-4xl md:text-5xl mb-4">
              {Communicate?.title}
            </h1>
            <div className="text-base font-medium opacity-70">
              {getExtenseData(Communicate?.created_at)}
            </div>
          </div>
        </div>
      </section>

      {!!getImage(Communicate?.image) && (
        <section className="relative">
          <div className="absolute w-full h-1/2 bg-cyan-500 "></div>
          <div className="w-full mx-auto max-w-[56rem] relative rounded-xl overflow-hidden">
            <div className="aspect-[4/2] bg-zinc-100">
              <Img
                size="7xl"
                src={getImage(Communicate?.image)}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>
      )}

      <section className="my-10 pb-20">
        <div className="container-medium">
          <div className="mx-auto max-w-[40rem] grid gap-4">
            {Communicate?.blocks.map((item: any, key: any) => (
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
