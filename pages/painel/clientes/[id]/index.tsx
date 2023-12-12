import Api from "@/src/services/api";
import { UserType } from "@/src/models/user";
import UserEdit from "@/src/components/shared/UserEdit";
import { useRouter } from "next/router";
import HelpCard from "@/src/components/common/HelpCard";
import Template from "@/src/template";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import { Button, Select } from "@/src/components/ui/form";
import { print_r } from "@/src/helper";
import { useEffect, useState } from "react";
import UserEditAdmin from "@/src/components/shared/UserEditAdmin";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

export async function getServerSideProps(ctx: any) {
  const { id } = ctx.query;
  const store = ctx.req.cookies["fiestou.store"] ?? 0;

  return {
    props: {
      id: id,
      store: store,
    },
  };
}

export default function Cliente({ id, store }: { id: number; store: number }) {
  const api = new Api();

  const [user, setUser] = useState({} as UserType);

  const getUser = async () => {
    let request: any = await api.bridge({
      url: "stores/customers",
      data: {
        id: id,
        store: store,
      },
    });

    setUser(request.data);
  };

  useEffect(() => {
    if (!!window) {
      getUser();
    }
  }, []);

  return (
    <Template
      header={{
        template: "painel",
        position: "solid",
      }}
      footer={{
        template: "clean",
      }}
    >
      <section className="pb-6">
        <div className="container-medium pt-12">
          <div className="pb-4">
            <Breadcrumbs
              links={[
                { url: "/painel", name: "Painel" },
                { url: "/painel/clientes", name: "Clientes" },
              ]}
            />
          </div>
          <div className="grid md:flex gap-4 items-center w-full">
            <div className="w-full flex items-center">
              <Link passHref href="/painel/clientes">
                <Icon
                  icon="fa-long-arrow-left"
                  className="mr-6 text-2xl text-zinc-900"
                />
              </Link>
              <div className="text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900 w-full">
                <span className="font-title font-bold">Cliente</span>
              </div>
            </div>
          </div>
        </div>
      </section>
      <UserEditAdmin user={user} />
    </Template>
  );
}
