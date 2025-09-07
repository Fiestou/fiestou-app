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
      url.includes("admin") || url.includes("carrinho") || url.includes("checkout");

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
          <span className="hidden md:inline-block">Chame no whats</span>
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
    return (
      <div className="pt-10 md:py-10">
        {whatsapp && getWhatsapp()}
      </div>
    );
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
              <div
                className="mx-auto max-w-[16rem] md:ml-0 md:max-w-[20rem] py-6"
              >Clicou👆, Marcou🗓, Fiestou🍾! Marketplace ideal para festas. <br /><br /> CNPJ: 62.363.954/0001-16</div>
            </div>

            <div className="w-full grid gap-10 items-start md:grid-cols-2 xl:grid-cols-4">
              <div className="flex flex-col items-center gap-4">
                <div className="text-zinc-900 font-bold">Fiestou</div>
                <Link href="/sobre-nos" className="hover:text-yellow-500 ease">
                  <div>Sobre nós</div>
                </Link>
                <Link href="/contato" className="hover:text-yellow-500 ease">
                  <div>Contato</div>
                </Link>
                <Link href="/blog" className="hover:text-yellow-500 ease">
                  <div>Blog</div>
                </Link>
                <Link href="/faq" className="hover:text-yellow-500 ease">
                  <div>FAQ</div>
                </Link>
              </div>
              <div className="flex flex-col items-center gap-4">
                <div className="text-zinc-900 font-bold">Produtos e Serviços</div>
                <Link href="/produtos/termos" className="hover:text-yellow-500 ease">
                  <div>Termos de aluguel</div>
                </Link>
                <Link href="/produtos/listagem/?busca=&ordem=desc&range=1000&categoria%5B%5D=Decoração" className="hover:text-yellow-500 ease">
                  <div>Decorações</div>
                </Link>
              </div>
              <div className="flex flex-col items-center text-center gap-4">
                <div className="text-zinc-900 font-bold">Cadastrar</div>
                <Link href="/cadastro/cliente" className="hover:text-yellow-500 ease">
                  <div>Como cliente</div>
                </Link>
                <Link href="/cadastro/parceiro" className="hover:text-yellow-500 ease">
                  <div>Como parceiro</div>
                </Link>
                <Link href="/politicas-de-privacidade" className="hover:text-yellow-500 ease">
                  <div>Políticas de Privacidade</div>
                </Link>
              </div>

              <div className="flex flex-col items-center gap-4 ">
                <div className="text-zinc-900 font-bold">Siga nas redes</div>

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
                    <span>Youtube</span>
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
