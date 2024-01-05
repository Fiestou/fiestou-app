import Img from "@/src/components/utils/ImgBase";
import Link from "next/link";
import { HeaderType } from "@/src/default/header/index";
import { UserType } from "@/src/models/user";
import { getFirstName } from "@/src/helper";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { useEffect } from "react";
import { AuthCheck } from "@/src/contexts/AuthContext";

const menu = [
  {
    title: "início",
    endpoint: "/admin/",
  },
  {
    title: "produtos",
    endpoint: "/admin/produtos",
  },
  {
    title: "solicitações de saque",
    endpoint: "/admin/saques",
  },
  {
    title: "filtro",
    endpoint: "/admin/filtro",
  },
  {
    title: "parceiros",
    endpoint: "/admin/parceiros",
  },
  {
    title: "usuários",
    endpoint: "/admin/usuarios",
  },
  {
    title: "entregadores",
    endpoint: "/admin/entregadores",
  },
  {
    title: "conteúdo",
    endpoint: "/admin/conteudo",
  },
  {
    title: "regras de negócio",
    endpoint: "/admin/sistema",
  },
];

export default function Admin({
  params,
  user,
}: {
  params: HeaderType;
  user: UserType;
}) {
  useEffect(() => {
    AuthCheck();
  }, []);

  return (
    <>
      <div className="fixed w-full max-w-[14rem] top-0 left-0 bg-zinc-900 px-4 text-white">
        <div
          dangerouslySetInnerHTML={{
            __html: `<style>
                      html {
                        padding-left: 14rem !important;
                      }
                      .container-medium{
                        max-width: 64rem
                      }
                    </style>`,
          }}
        ></div>
        <div className="flex flex-col gap-10 items-start justify-between min-h-screen">
          <div className="w-full">
            <div className="max-w-[120px] lg:max-w-[100px] mx-auto">
              <div className="relative">
                <Link passHref href="/">
                  <Img
                    src="/images/logo.png"
                    size="md"
                    className="h-full w-full object-contain"
                  />
                </Link>
              </div>
            </div>
          </div>

          <div className="grid gap-4">
            {menu.map((item, key) => (
              <Link passHref key={key} href={item.endpoint}>
                <div
                  className={`whitespace-nowrap leading-tight ease ${
                    params.pathname == `${item.endpoint}/`
                      ? "text-yellow-300 font-bold"
                      : "hover:text-yellow-300"
                  }`}
                >
                  {item.title}
                </div>
              </Link>
            ))}
          </div>

          <div className="pb-4">
            <Link passHref href="/painel">
              <div className="flex items-center gap-4 leading-tight cursor-pointer hover:text-yellow-300 ease">
                <div>
                  <Icon icon="fa-user-circle" className="text-4xl" />
                </div>
                <div className="font-semibold font-title">
                  <div className="whitespace-nowrap">
                    Olá, {getFirstName(user.name)}
                  </div>
                  <div className="whitespace-nowrap">Meu painel</div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
