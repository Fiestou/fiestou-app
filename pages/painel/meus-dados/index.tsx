import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";
import UserEdit from "@/src/components/shared/UserEdit";
import { useRouter } from "next/router";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import HelpCard from "@/src/components/common/HelpCard";
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
      ],
    },
    ctx
  );

  let page: any = request?.data?.query?.page[0] ?? {};

  return {
    props: {
      user: user,
      page: page,
    },
  };
}

export default function MeusDados({
  user,
  page,
}: {
  user: UserType;
  page: any;
}) {
  const router = useRouter();

  return !router.isFallback ? (
    <Template
      header={{
        template: "painel",
        position: "solid",
      }}
      footer={{
        template: "clean",
      }}
    >
      <section className="">
        <div className="container-medium pt-12">
          <div className="pb-4">
            <Breadcrumbs
              links={[
                { url: "/painel", name: "Painel" },
                { url: "/painel/meus-dados", name: "Meus dados" },
              ]}
            />
          </div>
          <div className="grid md:flex gap-4 items-center w-full">
            <div className="w-full flex items-center">
              <Link passHref href="/painel/meus-dados">
                <Icon
                  icon="fa-long-arrow-left"
                  className="mr-6 text-2xl text-zinc-900"
                />
              </Link>
              <div className="text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900 w-full">
                <span className="font-title font-bold">Meus dados</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="pt-6">
        <div className="container-medium pb-12">
          <div className="grid lg:flex gap-10 lg:gap-20">
            <div className="w-full grid gap-8">
              <UserEdit user={user} />
            </div>
            <div className="w-full md:max-w-[18rem] lg:max-w-[24rem]">
              <HelpCard list={page.help_list} />
            </div>
          </div>
        </div>
      </section>
    </Template>
  ) : (
    <></>
  );
}
