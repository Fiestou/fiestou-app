import Img from "@/src/components/utils/ImgBase";
import Link from "next/link";
import { HeaderType } from "@/src/default/header/index";
import { UserType } from "@/src/models/user";
import { getFirstName } from "@/src/helper";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { useState } from "react";

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
  const [dropdown, setDropdown] = useState(false);

  return (
    <>
      <header
        className={`${
          params.position == "fixed"
            ? "fixed top-0 left-0 z-10"
            : "bg-zinc-900 relative"
        } w-full`}
      >
        <div
          className={`${
            params.scroll ? "lg:py-0" : "lg:py-2 opacity-0"
          } ease bg-zinc-900 absolute h-full w-full inset-0`}
        ></div>
        <div className="ease px-4 text-white relative">
          <div className="flex gap-16 items-center">
            <div className="w-full lg:w-[200px]">
              <div
                className={`max-w-[120px] ${
                  params.position == "fixed" &&
                  params.scroll &&
                  "lg:max-w-[100px]"
                } ease`}
              >
                <div className="w-full relative pt-[30%] lg:pt-[60%]">
                  <Link passHref href="/">
                    <Img
                      src="/images/logo.png"
                      size="md"
                      className="absolute -mt-1 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                    />
                  </Link>
                </div>
              </div>
            </div>

            <div className="w-full flex items-center justify-center gap-8">
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

            <div className="w-fit relative">
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
        <div className="container-medium opacity-50">
          <hr className="border-white" />
        </div>
      </header>
    </>
  );
}
