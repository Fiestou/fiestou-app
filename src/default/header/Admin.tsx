import { useEffect, useState } from "react";
import Img from "@/src/components/utils/ImgBase";
import Link from "next/link";
import { HeaderType } from "@/src/default/header/index";
import { UserType } from "@/src/models/user";
import { getFirstName } from "@/src/helper";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { AuthCheck } from "@/src/contexts/AuthContext";

const menu = [
  {
    title: "Início",
    endpoint: "/admin/",
  },
  {
    title: "Pedidos",
    endpoint: "/admin/pedidos",
  },
  // {
  //   title: "Produtos",
  //   endpoint: "/admin/produtos",
  // },
  {
    title: "Solicitações de Saque",
    endpoint: "/admin/saques",
  },
  {
    title: "Filtro",
    endpoint: "/admin/filtro",
  },
  {
    title: "Parceiros",
    endpoint: "/admin/parceiros",
  },
  {
    title: "Usuários",
    endpoint: "/admin/usuarios",
  },
  {
    title: "Entregadores",
    endpoint: "/admin/entregadores",
  },
  {
    title: "Conteúdo da Plataforma",
    endpoint: "/admin/conteudo",
  },
  {
    title: "Comunicados",
    endpoint: "/admin/comunicados",
  },
  {
    title: "Teste de Mensagem",
    endpoint: "/admin/teste",
  },
  {
    title: "Blog",
    endpoint: "/admin/blog",
  },
  {
    title: "Regras de Negócio",
    endpoint: "/admin/sistema",
  },
  {
    title: "Configurações de Entrega",
    endpoint: "/admin/configuracoes-entrega",
  },
  {
    title: "Configurações do Sistema",
    endpoint: "/admin/configuracoes",
  },
];

export default function Admin({
  params,
  user,
}: {
  params: HeaderType;
  user: UserType;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    AuthCheck();

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <div
        className={`fixed w-full max-w-[16rem] top-0 left-0 bg-zinc-900 px-4 text-white h-full z-50 transition-transform duration-300 ${
          !isSidebarOpen ? "-translate-x-full" : ""
        }`}
      >
        <div
          dangerouslySetInnerHTML={{
            __html: `<style>
                      html {
                        padding-left: ${
                          isSidebarOpen ? "16rem" : "0"
                        } !important;
                      }
                      .content-container {
                        width: calc(100% - ${isSidebarOpen ? "16rem" : "0"});
                        margin-left: ${isSidebarOpen ? "16rem" : "0"};
                        overflow-x: auto;
                      }
                      main {
                        min-width: fit-content;
                      }
                      .container-medium{
                        max-width: 64rem
                      }
                      @media (max-width: 768px) {
                        .breadcrumb-container {
                          min-width: 500px;
                        }
                      }
                    </style>`,
          }}
        ></div>
        <div className="flex flex-col gap-10 items-start justify-between min-h-screen">
          <div className="w-full">
            <div className="max-w-[120px] lg:max-w-[100px] mx-auto py-4">
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

            <hr className="mb-6 opacity-10" />

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

      {/* Sidebar Buttons */}
      <button
        onClick={toggleSidebar}
        className="fixed top-1 left-4 z-50 p-2 bg-zinc-900 text-white rounded-full shadow-lg"
      >
        <Icon icon={isSidebarOpen ? "fa-arrow-left" : "fa-bars"} />
      </button>
    </>
  );
}
