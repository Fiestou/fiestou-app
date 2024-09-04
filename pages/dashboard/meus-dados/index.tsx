import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";
import UserEdit from "@/src/components/shared/UserEdit";
import { useRouter } from "next/router";
import HelpCard from "@/src/components/common/HelpCard";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export async function getServerSideProps(ctx: any) {
  const api = new Api();
  let request: any = {};

  let user = JSON.parse(ctx.req.cookies["fiestou.user"]);

  request = await api.bridge(
    {
      url: "users/get",
      data: {
        ref: user.email,
      },
    },
    ctx
  );

  user = request?.data ?? {};

  request = await api.call(
    {
      url: "request/graph",
      data: [
        {
          model: "page",
          filter: [
            {
              key: "slug",
              value: "account",
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

  const page: any = request?.data?.query?.page[0] ?? {};
  const HeaderFooter = request?.data?.query?.HeaderFooter ?? [];
  const DataSeo = request?.data?.query?.DataSeo ?? [];

  return {
    props: {
      user: user,
      page: page,
      HeaderFooter: HeaderFooter[0] ?? {},
      DataSeo: DataSeo[0] ?? {},
    },
  };
}

export default function MeusDados({
  user,
  page,
  HeaderFooter,
}: {
  user: UserType;
  page: any;
  HeaderFooter: any;
}) {
  const router = useRouter();

  return (
    !router.isFallback && (
      <Template
        header={{
          template: "default",
          position: "solid",
          content: HeaderFooter,
        }}
      >
        <section className="">
          <div className="container-medium pt-12 pb-8 md:py-12">
            <div className="pb-4">
              <Breadcrumbs
                links={[
                  { url: "/dashboard", name: "Dashboard" },
                  { url: "/dashboard/meus-dados", name: "Meus dados" },
                ]}
              />
            </div>
            <div className="flex items-center">
              <Link passHref href="/dashboard">
                <Icon
                  icon="fa-long-arrow-left"
                  className="mr-6 text-2xl text-zinc-900"
                />
              </Link>
              <div className="font-title font-bold text-3xl md:text-4xl flex gap-4 items-center text-zinc-900 w-full">
                Meus dados
              </div>
            </div>
          </div>
        </section>

        <section className="">
          <div className="container-medium pb-12">
            <div className="grid md:flex gap-10 md:gap-24">
              <div className="w-full grid gap-8">
                <UserEdit user={user} />
              </div>
              <div className="w-full max-w-[24rem]">
                <HelpCard list={page.help_list} />
              </div>
            </div>
          </div>
        </section>
      </Template>
    )
  );
}
