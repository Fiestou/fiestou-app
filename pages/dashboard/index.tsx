import Image from "next/image";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { AuthContext, getUser } from "@/src/contexts/AuthContext";
import { useContext, useEffect, useState } from "react";
import { getFirstName, replaceWord } from "@/src/helper";
import { UserType } from "@/src/models/user";
import Api from "@/src/services/api";
import { signOut } from "next-auth/react";
import Breadcrumbs from "@/src/components/common/Breadcrumb";

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
        {
          model: "page as UserMenuForm",
          filter: [
            {
              key: "slug",
              value: "client-menu",
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
  const UserMenuForm = request?.data?.query?.UserMenuForm ?? [];

  return {
    props: {
      HeaderFooter: HeaderFooter[0] ?? {},
      DataSeo: DataSeo[0] ?? {},
      UserMenuForm: UserMenuForm[0] ?? {},
    },
  };
}

export const menuDashboard = [
  {
    title: "Pedidos",
    icon: "fa-box-open",
    field: "board_order_desc",
    endpoint: "pedidos",
  },
  {
    title: "Meus dados",
    icon: "fa-user-circle",
    field: "board_user_desc",
    endpoint: "meus-dados",
  },
  {
    title: "Favoritos",
    icon: "fa-heart",
    field: "board_likes_desc",
    endpoint: "favoritos",
  },
  {
    title: "Endereços",
    icon: "fa-map-marker-check",
    field: "board_address_desc",
    endpoint: "enderecos",
  },
  {
    title: "Chat",
    icon: "fa-comment-alt-dots",
    field: "board_chat_desc",
    endpoint: "chat",
    blocked: true,
  },
  // {
  //   title: "Cartões salvos",
  //   icon: "fa-credit-card",
  //   description:
  //     "Lorem ipsum dolor sit amet consectetur. Sagittis lectus morbi.",
  //   endpoint: "cartoes",
  // },
];

export default function Dashboard({ HeaderFooter, UserMenuForm }: any) {
  const { UserLogout } = useContext(AuthContext);

  const [user, setUser] = useState({} as UserType);

  useEffect(() => {
    if (!!window) {
      setUser(getUser);
    }
  }, []);

  const getDescription = (field: string) => {
    return UserMenuForm[field];
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
                {replaceWord(
                  UserMenuForm?.board_text ?? "",
                  "{first_name}",
                  getFirstName(user.name)
                )}
              </div>
              {!!UserMenuForm?.board_desc && (
                <div className="pt-4">{UserMenuForm?.board_desc ?? ""}</div>
              )}
            </div>
          </div>
        </div>
      </section>
      <section>
        <div className="container-medium pb-14">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6">
            {menuDashboard.map((item, key) => (
              <Link
                passHref
                href={!!item?.blocked ? "#" : `/dashboard/${item.endpoint}`}
                key={key}
              >
                <div
                  className={`${
                    !!item?.blocked ? "" : "hover:bg-yellow-300"
                  } group h-full bg-zinc-100 ease rounded-xl p-4 md:p-6 relative`}
                >
                  <div className="flex justify-between">
                    <div className="aspect-square w-[1.5rem] md:w-[2.5rem] relative">
                      <Icon
                        className="absolute text-zinc-900 top-1/2 left-1/2 text-2xl md:text-4xl -translate-x-1/2 -translate-y-1/2"
                        icon={item.icon}
                      />
                    </div>
                  </div>
                  <div className="mt-3 text-zinc-900">
                    <div className="font-bold md:text-lg pb-1">
                      {item.title}
                    </div>
                    <div className="text-[.85rem] md:text-base ease text-zinc-500 group-hover:text-zinc-900">
                      {getDescription(item.field)}
                    </div>
                  </div>
                  {!!item?.blocked && (
                    <div className="absolute top-0 left-0 bg-white w-full h-full bg-opacity-75">
                      <div className="absolute top-0 right-0 m-2 bg-yellow-300 text-yellow-600 px-2 py-1 rounded-md text-xs uppercase font-semibold">
                        em breve
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="text-center py-10">
          <div
            onClick={() => UserLogout()}
            className="font-semibold cursor-pointer text-zinc-900 underline hover:text-yellow-500 ease whitespace-nowrap"
          >
            Sair da conta
          </div>
        </div>
      </section>
    </Template>
  );
}
