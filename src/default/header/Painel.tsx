import Img from "@/src/components/utils/ImgBase";
import Link from "next/link";
import { HeaderType } from "@/src/default/header/index";
import { UserType } from "@/src/models/user";
import { getFirstName } from "@/src/helper";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { useEffect, useState } from "react";
import Api from "@/src/services/api";
import { AuthCheck } from "@/src/contexts/AuthContext";
import { Button } from "@/src/components/ui/form";

export const PARTNER_MENU: Array<{
  name: string;
  icon: string;
  description: string;
  url: string;
}> = [
  {
    name: "Pedidos",
    icon: "fa-box-alt",
    description:
      "",
    url: "/painel/pedidos",
  },
  {
    name: "Produtos",
    icon: "fa-tag",
    description:
      "",
    url: "/painel/produtos",
  },
  {
    name: "Clientes",
    icon: "fa-users",
    description:
      "",
    url: "/painel/clientes",
  },
  // {
  //   name: "Chat",
  //   icon: "fa-comment-alt-dots",
  //   description:
  //     "",
  //   url: "/painel/chat",
  // },
  {
    name: "Conta bancária",
    icon: "fa-university",
    description:
      "",
    url: "/painel/conta",
  },
  {
    name: "Seus dados",
    icon: "fa-user-circle",
    description:
      "",
    url: "/painel/meus-dados",
  },
  {
    name: "Personalizar loja",
    icon: "fa-palette",
    description:
      "",
    url: "/painel/loja",
  },
];

export default function Painel({
  params,
  user,
}: {
  params: HeaderType;
  user: UserType;
}) {
  const api = new Api();

  const [menuModal, setMenuModal] = useState(false);

  useEffect(() => {
    AuthCheck();
  }, []);

  return (
    <>
      <header
        className={`${
          params.position == "fixed" ? "fixed top-0 left-0 z-10" : "relative"
        } w-full bg-zinc-900 relative`}
      >
        <div
          className={`${
            params.scroll ? "lg:py-0" : "lg:py-2 opacity-0"
          } ease bg-zinc-900 absolute h-full w-full inset-0`}
        ></div>
        <div className="ease container-medium relative text-white px-4">
          <div className="flex gap-4 justify-between items-center py-2">
            <div className="w-full">
              <div className="lg:w-[200px]">
                <div
                  className={`max-w-[80px] md:max-w-[120px] ${
                    params.position == "fixed" &&
                    params.scroll &&
                    "lg:max-w-[100px]"
                  } ease`}
                >
                  <Link passHref href="/">
                    <div className="aspect aspect-video -mt-2">
                      <Img
                        src="/images/logo.png"
                        size="md"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </Link>
                </div>
              </div>
            </div>

            <div className="w-fit relative">
              <Link
                passHref
                href="/painel"
                className="hover:text-yellow-300 ease"
              >
                <div className="flex items-center gap-4 leading-tight cursor-pointer">
                  <div>
                    <Icon icon="fa-user-circle" className="text-4xl" />
                  </div>
                  <div className="hidden md:block w-fit font-semibold font-title">
                    <div className="whitespace-nowrap">
                      Olá, {getFirstName(user.name)}
                    </div>
                    <div className="whitespace-nowrap">Meu painel</div>
                  </div>
                </div>
              </Link>
            </div>

            <div className="w-fit lg:hidden relative text-right">
              <Button
                style="btn-transparent"
                type="button"
                onClick={() => setMenuModal(!menuModal)}
                className="py-2 px-1 text-white"
              >
                <Icon
                  icon={menuModal ? "fa-times" : "fa-bars"}
                  className={`${
                    menuModal ? "mx-[.15rem]" : ""
                  } text-xl lg:text-3xl`}
                />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {menuModal && (
        <div className="w-full border-t border-zinc-700 bg-zinc-900 text-white grid items-center gap-8">
          <div className="container-medium">
            <div className="grid gap-4 py-6">
              <Link passHref href="/painel">
                <div
                  className={`whitespace-nowrap flex justify-between leading-tight ease ${
                    params.pathname == `/painel/`
                      ? "text-yellow-300 font-bold"
                      : "hover:text-yellow-300"
                  }`}
                >
                  <div className="w-full lg:max-w-[2rem] h-[2rem] text-[1rem] leading-none relative">
                    <Icon
                      icon="fa-home"
                      className="lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:absolute"
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="font-title text-base whitespace-nowrap lg:text-lg">
                      Início
                    </div>
                  </div>
                </div>
              </Link>
              {PARTNER_MENU.map((item: any, key) => (
                <Link passHref key={key} href={item.url}>
                  <div
                    className={`whitespace-nowrap flex justify-between leading-tight ease ${
                      params.pathname == `${item.url}/`
                        ? "text-yellow-300 font-bold"
                        : "hover:text-yellow-300"
                    }`}
                  >
                    <div className="w-full lg:max-w-[2rem] h-[2rem] text-[1rem] leading-none relative">
                      <Icon
                        icon={item.icon}
                        className="lg:top-1/2 lg:left-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:absolute"
                      />
                    </div>
                    <div className="grid gap-2">
                      <div className="font-title text-base whitespace-nowrap lg:text-lg">
                        {item.name}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
