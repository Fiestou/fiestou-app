import Img from "@/src/components/utils/ImgBase";
import FIcon from "@/src/icons/fontAwesome/FIcon";
import BIcon from "@/src/icons/bootstrapIcons/BIcon";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/form";

export interface FooterType {
  template?: string | "default";
  position?: string | "solid";
  pathname?: string | "";
  content?: any;
}

export function Footer(props: FooterType) {
  const pathname = usePathname() || "";
  const content = props.content;
  const [params, setParams] = useState({
    template: "",
    position: "fixed",
    pathname: pathname,
    scroll: false,
    ...props,
  });
  const [whatsapp, setWhatsapp] = useState(false as boolean);
  const getWhatsapp = () => {
    const url = window.location.href;
    const isHidden =
      url.includes("admin") ||
      url.includes("carrinho") ||
      url.includes("checkout");

    if (isHidden) return null;

    return (
      <div
        id="whatsapp-button"
        className="fixed z-20 m-2 md:m-4 bottom-0 right-0"
      >
        <Button
          target="_blank"
          href="https://api.whatsapp.com/send?phone=558399812030&text=Olá, preciso tirar uma dúvida"
          style="btn-success"
          className="py-2 px-4 md:px-5"
        >
          <FIcon icon="fa-whatsapp" type="fab" className="font-light text-xl" />
          <span className="hidden md:inline-block h-3">Chame no whats</span>
        </Button>
      </div>
    );
  };

  useEffect(() => {
    if (!!window) {
      setWhatsapp(true);
    }
  }, []);

  if (params.template === "clean") {
    return <div className="pt-10 md:py-10">{whatsapp && getWhatsapp()}</div>;
  }

  if (params.template == "default") {
    return (
      <div>
        {whatsapp && getWhatsapp()}
        <div className="container-medium py-14">
          <div className="grid md:flex items-start text-center md:text-left gap-4 md:gap-4">
            <div className="w-full md:max-w-[24rem]">
              <div className="w-full max-w-[150px] inline-block">
                <Link passHref href="/">
                  <Img
                    src="/images/logo.png"
                    size="md"
                    className="w-full h-full object-contain"
                  />
                </Link>
              </div>
              <div className="mx-auto max-w-[16rem] md:ml-0 md:max-w-[20rem] py-6">
                Clicou👆, Marcou🗓, Fiestou🍾! Marketplace ideal para festas.{" "}
                <br />
                <br /> CNPJ: 62.363.954/0001-16
              </div>
            </div>

            <div className="w-full grid gap-10 items-start md:grid-cols-2 xl:grid-cols-4">
              <div className="flex flex-col items-center gap-4">
                <span className="text-zinc-900 font-bold">Fiestou</span>
                <Link href="/sobre" className="hover:text-yellow-500 ease">
                  <span>Sobre nós</span>
                </Link>
                <Link href="/contato" className="hover:text-yellow-500 ease">
                  <span>Contato</span>
                </Link>
                <Link href="/blog" className="hover:text-yellow-500 ease">
                  <span>Blog</span>
                </Link>
                <Link href="/faq" className="hover:text-yellow-500 ease">
                  <span>FAQ</span>
                </Link>
              </div>
              <div className="flex flex-col items-center gap-4">
                <span className="text-zinc-900 font-bold">
                  Produtos e Serviços
                </span>
                <Link
                  href="/comunicados/termos-de-aluguel"
                  className="hover:text-yellow-500 ease"
                >
                  <span>Termos de aluguel</span>
                </Link>
                <Link
                  href="/produtos/listagem/?order=desc&range=1000&page=1&category=50"
                  className="hover:text-yellow-500 ease"
                >
                  <span>Decorações</span>
                </Link>
              </div>
              <div className="flex flex-col items-center text-center gap-4">
                <span className="text-zinc-900 font-bold">Cadastrar</span>
                <Link
                  href="/parceiros/seja-parceiro"
                  className="hover:text-yellow-500 ease"
                >
                  <span>Como parceiro</span>
                </Link>
                <Link
                  href="/cadastre-se"
                  className="hover:text-yellow-500 ease"
                >
                  <span>Como cliente</span>
                </Link>
                <Link
                  href="/comunicados/politica-de-privacidade"
                  className="hover:text-yellow-500 ease"
                >
                  <span>Políticas de Privacidade</span>
                </Link>
              </div>

              <div className="flex flex-col items-center gap-4 ">
                <span className="text-zinc-900 font-bold">Siga nas redes</span>

                <Link
                  href="https://web.facebook.com/Fiestou.com.br#"
                  target="_blank"
                  className="group hover:text-yellow-500 ease"
                >
                  <div className="flex justify-center items-center gap-2">
                    <FIcon
                      icon="fa-facebook"
                      type="fab"
                      className="text-zinc-900 group-hover:text-yellow-500 ease"
                    />
                    <span>Facebook</span>
                  </div>
                </Link>

                <Link
                  href="https://www.instagram.com/fiestou.com.br/"
                  target="_blank"
                  className="group hover:text-yellow-500 ease"
                >
                  <div className="flex justify-center items-center gap-2">
                    <FIcon
                      icon="fa-instagram"
                      type="fab"
                      className="text-zinc-900 group-hover:text-yellow-500 ease"
                    />
                    <span>Instagram</span>
                  </div>
                </Link>

                <Link
                  href="https://pin.it/1zZ5jI3PS"
                  target="_blank"
                  className="group hover:text-yellow-500 ease"
                >
                  <div className="flex justify-center items-center gap-2">
                    <FIcon
                      icon="fa-pinterest"
                      type="fab"
                      className="text-zinc-900 group-hover:text-yellow-500 ease"
                    />
                    <span>Pinterest</span>
                  </div>
                </Link>

                <Link
                  href="https://www.youtube.com/channel/UCOs0m-bltMn5n3ewKBLWVaQ"
                  target="_blank"
                  className="group hover:text-yellow-500 ease"
                >
                  <div className="flex justify-center items-center gap-2">
                    <FIcon
                      icon="fa-youtube"
                      type="fab"
                      className="text-zinc-900 group-hover:text-yellow-500 ease"
                    />
                    <span>YouTube</span>
                  </div>
                </Link>

                <Link
                  href="https://www.tiktok.com/@fiestou.com"
                  target="_blank"
                  className="group hover:text-yellow-500 ease"
                >
                  <div className="flex justify-center items-center gap-2">
                    <BIcon
                      icon="bi-tiktok"
                      className="text-zinc-900 group-hover:text-yellow-500 ease"
                    />
                    <span>TikTok</span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="container-medium border-y py-4">
          <div className="flex flex-col md:flex-row items-center justify-center md:justify-between gap-6">
            <Img
              src="/images/pagarme/selo-horizontal.png"
              className="w-full max-w-[18rem]"
            />

            <Img
              src="/images/pagarme/flags.png"
              className="w-full max-w-[24rem]"
            />
          </div>
        </div>

        <div className="container-medium">
          <div className="py-4 text-sm grid md:flex justify-center text-center">
            <div>
              <span>
                © {new Date().getFullYear()} Fiestou. Todos os direitos
                reservados.
              </span>
              <span className="hidden md:inline-block px-1">|</span>
              <span>
                <button id="lgpd_reset" className="hover:underline">
                  LGPD
                </button>
              </span>
              <span className="hidden md:inline-block px-1">|</span>
            </div>

            <div>
              Desenvolvido por
              <a
                href="https://www.fiestou.com.br/"
                target="_blank"
                className="hover:underline hover:text-yellow-600 ease font-semibold pl-1"
                rel="noreferrer"
              >
                Fiestou
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
