import Api from "@/src/services/api";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";

export async function getStaticProps(ctx: any) {
  const api = new Api();
  let request: any = await api.call(
    {
      url: "request/graph",
      data: [
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

  const HeaderFooter = request?.data?.query?.HeaderFooter ?? [];
  const DataSeo = request?.data?.query?.DataSeo ?? [];

  return {
    props: {
      HeaderFooter: HeaderFooter[0] ?? {},
      DataSeo: DataSeo[0] ?? {},
    },
    revalidate: 60 * 60 * 60,
  };
}

export default function page404({
  HeaderFooter,
  DataSeo,
}: {
  content: any;
  HeaderFooter: any;
  DataSeo: any;
}) {
  return (
    <Template
      metaPage={{
        title: `404`,
        description: "Página não encontrada",
      }}
      header={{
        template: "default",
        position: "relative",
        content: HeaderFooter,
      }}
      footer={{
        template: "default",
        content: HeaderFooter,
      }}
    >
      <section className="py-20 md:py-32">
        <div className="container-medium text-center">
          <div className="h-[25vh] flex flex-col items-center justify-center gap-4 text-zinc-950">
            <Icon icon="fa-frown" className="text-yellow-400 text-4xl" />
            <h5 className="text-4xl md:text-[4rem] font-bold">404</h5>
            <div>Página não encontrada</div>
          </div>
        </div>
      </section>
    </Template>
  );
}
