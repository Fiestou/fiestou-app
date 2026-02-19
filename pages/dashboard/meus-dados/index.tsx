import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";
import UserEdit from "@/src/components/shared/UserEdit";
import UserDataSimple from "@/src/components/shared/UserDataSimple";
import { useRouter } from "next/router";
import HelpCard from "@/src/components/common/HelpCard";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import { useEffect, useState } from "react";

export async function getServerSideProps(ctx: any) {
  const api = new Api();
  let request: any = {};

  let cookieUser: any = {};
  try {
    cookieUser = JSON.parse(ctx?.req?.cookies?.["fiestou.user"] ?? "{}");
  } catch {
    cookieUser = {};
  }

  if (cookieUser?.email) {
    request = await api.bridge(
      {
        method: "get",
        url: "users/get",
        data: {
          ref: cookieUser.email,
          person: "client",
        },
      },
      ctx
    );
  }

  const user = request?.data ?? cookieUser ?? {};

  request = await api.content({
    method: "get",
    url: "account/user",
  });

  const Account: any = request?.data?.Account ?? {};
  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const DataSeo = request?.data?.DataSeo ?? {};
  const Scripts = request?.data?.Scripts ?? {};

  return {
    props: {
      user: user,
      page: Account,
      HeaderFooter: HeaderFooter,
      DataSeo: DataSeo,
      Scripts: Scripts,
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
  const [message, setMessage] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setMessage(localStorage.getItem("message") || "");
    }
  }, []);

  useEffect(() => {
    if (message) {
      setTimeout(() => {
        setMessage("");
        if (typeof window !== "undefined") {
          localStorage.setItem("message", "");
        }
      }, 10000);
    }
  }, [message]);

  const isErrorMessage = /erro|falha|inválid|invalido|incorret/i.test(message);

  return (
    !router.isFallback && (
      <Template
        header={{
          template: "default",
          position: "solid",
          content: HeaderFooter,
        }}
      >
        <section>
          <div className="container-medium pt-10 pb-8 md:py-12">
            <div className="pb-4">
              <Breadcrumbs
                links={[
                  { url: "/dashboard", name: "Dashboard" },
                  { url: "/dashboard/meus-dados", name: "Meus dados" },
                ]}
              />
            </div>
            <div className="flex items-start gap-4">
              <Link passHref href="/dashboard" className="pt-1">
                <Icon icon="fa-long-arrow-left" className="text-2xl text-zinc-900" />
              </Link>
              <div className="w-full">
                <h1 className="font-title font-bold text-3xl md:text-4xl text-zinc-900">
                  Meus dados
                </h1>
                <p className="text-sm md:text-base text-zinc-600 mt-2 max-w-2xl leading-relaxed">
                  Atualize seus dados pessoais e endereço para acelerar pagamento e entrega dos próximos pedidos.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="container-medium pb-14">
            <div className="grid xl:grid-cols-[minmax(0,1fr),22rem] gap-8 xl:gap-10 items-start">
              <div className="w-full grid gap-5 md:gap-6">
                {message && (
                  <div
                    className={`py-3 px-4 rounded-lg text-sm font-medium ${
                      isErrorMessage
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-green-50 text-green-700 border border-green-200"
                    }`}
                  >
                    {message}
                  </div>
                )}

                {user.type === "client" ? (
                  <UserDataSimple user={user} />
                ) : (
                  <UserEdit user={user} />
                )}
              </div>

              <div className="w-full xl:max-w-[22rem] xl:sticky xl:top-24">
                <HelpCard list={page?.help_list ?? []} />
              </div>
            </div>
          </div>
        </section>
      </Template>
    )
  );
}
