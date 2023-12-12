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
    endpoint: "/painel/",
  },
  {
    title: "pedidos",
    endpoint: "/painel/pedidos",
  },
  {
    title: "produtos",
    endpoint: "/painel/produtos",
  },
  {
    title: "clientes",
    endpoint: "/painel/clientes",
  },
  // {
  //   title: "chat",
  //   endpoint: "/painel/chat",
  // },
  {
    title: "conta",
    endpoint: "/painel/conta",
  },
  {
    title: "meus dados",
    endpoint: "/painel/meus-dados",
  },
  {
    title: "personalizar loja",
    endpoint: "/painel/loja",
  },
];

export default function Painel({
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
          params.position == "fixed" ? "fixed top-0 left-0 z-10" : "relative"
        } w-full bg-zinc-900 relative`}
      >
        <div
          className={`${
            params.scroll ? "lg:py-0" : "lg:py-2 opacity-0"
          } ease bg-zinc-900 absolute h-full w-full inset-0`}
        ></div>
        <div className="ease container-medium relative text-white px-4">
          <div className="flex gap-4 lg:gap-16 items-center py-2">
            <div className="w-full lg:w-[200px]">
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

            <div className="w-full hidden lg:flex items-center gap-8">
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
              <Link
                passHref
                href="/painel"
                className="hover:text-yellow-300 ease"
              >
                <div className="flex items-center gap-4 leading-tight cursor-pointer">
                  <div>
                    <Icon icon="fa-user-circle" className="text-4xl" />
                  </div>
                  <div className="w-fit font-semibold font-title">
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
