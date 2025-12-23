import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { AuthContext, getUser } from "@/src/contexts/AuthContext";
import { useContext, useEffect, useState } from "react";
import { getFirstName, replaceWord } from "@/src/helper";
import { UserType } from "@/src/models/user";
import Api from "@/src/services/api";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import { Button } from "@/src/components/ui/form";
import { GetStaticPropsContext } from "next";

interface MenuItem {
  title: string;
  icon: string;
  field: string;
  endpoint: string;
}

export async function getStaticProps(ctx: GetStaticPropsContext) {
  const api = new Api();

  /* TO DO - TIPAR E ARRANCAR any */
  let request: any = await api.content({method: 'get', url: `dashboard` });

  const DataSeo = request?.data?.DataSeo ?? {};
  const HeaderFooter = request?.data?.HeaderFooter ?? {};
  const Dashboard = request?.data?.Dashboard ?? {};
  console.log('Dashboard', Dashboard);
  console.log('HeaderFooter', HeaderFooter);
  console.log('DataSeo', DataSeo);
  return {
    props: {
      HeaderFooter: HeaderFooter,
      DataSeo: DataSeo,
      Dashboard: Dashboard,
    },
  };
}

export const menuDashboard: MenuItem[] = [
  {
    title: "Pedidos",
    icon: "fa-box-open",
    field: "board_order_desc",
    endpoint: "dashboard/pedidos",
  },
  {
    title: "Meus dados",
    icon: "fa-user-circle",
    field: "board_user_desc",
    endpoint: "dashboard/meus-dados",
  },
  {
    title: "Favoritos",
    icon: "fa-heart",
    field: "board_likes_desc",
    endpoint: "dashboard/favoritos",
  },
  {
    title: "Endereços",
    icon: "fa-map-marker-check",
    field: "board_address_desc",
    endpoint: "dashboard/enderecos",
  },
];

/* TO DO - TIPAR E ARRANCAR any */
export default function Dashboard({ HeaderFooter, Dashboard }: any) {
  const { UserLogout } = useContext(AuthContext);

  const [user, setUser] = useState({} as UserType);

  useEffect(() => {
    if (!!window) {
      setUser(getUser);
    }
  }, []);

  const getDescription = (field: string) => {
    return Dashboard[field];
  };

  return (
    <Template
      header={{
        template: "default",
        position: "solid",
        content: HeaderFooter,
      }}
    >
      <section className="">
        <div className="container-medium pb-6 pt-10 md:pb-10">
          <div className="flex items-end">
            <div className="w-full">
              <div className="pb-4">
                <Breadcrumbs
                  links={[{ url: "/dashboard", name: "Dashboard" }]}
                />
              </div>
              <div className="font-title font-bold text-4xl md:text-5xl text-zinc-900">
                {!!user?.name &&
                  replaceWord(
                    Dashboard?.board_text ?? "",
                    "{first_name}",
                    getFirstName(user.name)
                  )}
              </div>
            </div>
          </div>
        </div>
      </section>
      <section>
        {!!Dashboard?.board_desc && (
          <div className="pt-4">{Dashboard?.board_desc ?? ""}</div>
        )}
        <div className="container-medium pb-14">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            {menuDashboard.map((item) => (
              <Link key={item.title} href={`/${item.endpoint}`} passHref>
                <div className="hover:bg-yellow-300 group h-full bg-zinc-100 ease rounded-xl p-4 md:p-6 relative">
                  <div className="flex justify-between items-center">
                    <div className="aspect-square w-[1.5rem] md:w-[2.5rem] relative">
                      <Icon
                        icon={item.icon}
                        className="absolute text-zinc-900 text-2xl md:text-4xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                      />
                    </div>
                  </div>
                  <div className="mt-3 text-zinc-900">
                    <h3 className="font-bold md:text-lg pb-1">{item.title}</h3>
                    <p className="text-[.85rem] md:text-base ease text-zinc-500 group-hover:text-zinc-900">
                      {getDescription(item.field) || "Sem descrição"}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <section>
        <div className="pt-4 md:pt-6 flex justify-center">
          <Button
            onClick={() => UserLogout()}
            className="md:text-lg px-4 py-2 md:py-4 md:px-8"
          >
            Sair da conta
          </Button>
        </div>
      </section>
    </Template>
  );
}
