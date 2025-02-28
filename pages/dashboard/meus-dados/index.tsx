import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";
import UserEdit from "@/src/components/shared/UserEdit";
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

  let user = JSON.parse(ctx.req.cookies["fiestou.user"]);

  request = await api.bridge(
    {
      method: "get",
      url: "users/get",
      data: {
        ref: user.email,
        person: "client",
      },
    },
    ctx
  );

  user = request?.data ?? {};

  request = await api.content({
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
  const [message, setMessage] = useState<string>('');

  useEffect(()=>{
    if (typeof window !== 'undefined') setMessage(localStorage.getItem('message') || '')
  }, [])

  useEffect(()=>{
    if(message){
      setTimeout(()=>{
        setMessage('')
        if (typeof window !== 'undefined') localStorage.setItem('message', '') 
      }, 10000)
    }
  }, [message])
  
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
                {message && (
                    <div className="py-3 pl-4 bg-red-50 text-red-600 rounded-md text-center mt-2">
                    {message}
                  </div>
                )}
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
