import Img from "@/src/components/utils/ImgBase";
import { getImage, getSocial } from "@/src/helper";
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

    return url.includes("admin") ||
      url.includes("carrinho") ||
      url.includes("checkout") ? (
      <></>
    ) : (
      <div
        id="whatsapp-button"
        className={`fixed z-20 m-2 md:m-4 bottom-0 right-0`}
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

  if (params.template == "clean") {
    return <div className="pt-10 md:py-10">{whatsapp && getWhatsapp()}</div>;
  }

  if (params.template == "default") {
    return (
      <div>
        {whatsapp && getWhatsapp()}
        <div className="container-medium py-14">
          <div className="grid md:flex items-start text-center md:text-left gap-4 md:gap-8">
            <div className="w-full md:max-w-[24rem]">
              <div className="w-full max-w-[150px] inline-block">
                <Link passHref href="/">
                  <Img
                    src={
                      !!content?.footer_logo
                        ? getImage(content.footer_logo)
                        : "/images/logo.png"
                    }
                    size="md"
                    className="w-full"
                  />
                </Link>
              </div>
              <div
                className="mx-auto max-w-[16rem] md:ml-0 md:max-w-[20rem] py-6"
                dangerouslySetInnerHTML={{ __html: content?.footer_text ?? "" }}
              ></div>
            </div>
            <div className="w-full grid gap-10 items-start md:grid-cols-2 xl:grid-cols-4">
              {!!content?.column_links &&
                content.column_links.map((col: any, key: any) => (
                  <div key={key} className="grid gap-4">
                    <div className="text-zinc-900 font-bold">
                      {col.column_title}
                    </div>
                    {col.column_list_links.map((item: any, index: any) => (
                      <Link
                        href={item.column_list_link ?? "#"}
                        key={index}
                        className="hover:text-yellow-500 ease"
                      >
                        <div>{item.column_list_title}</div>
                      </Link>
                    ))}
                  </div>
                ))}
              <div className="grid gap-4">
                <div className="text-zinc-900 font-bold">Siga nas redes</div>
                {!!content?.social &&
                  content.social.map((item: any, key: any) => (
                    <Link
                      href={item.social_link ?? "#"}
                      key={key}
                      target="_blank"
                      className="group hover:text-yellow-500 ease"
                    >
                      <div className="flex justify-center md:justify-start items-center gap-2">
                        <div className="h-0 flex items-center">
                          <div className="relative p-2">
                            {getSocial(
                              item.social_link ?? item.social_title ?? "#"
                            ) == "tiktok" ? (
                              <BIcon
                                icon="bi-tiktok"
                                className="text-zinc-900 group-hover:text-yellow-500 ease absolute mt-[1px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                              />
                            ) : (
                              <FIcon
                                icon={`fa-${getSocial(
                                  item.social_link ?? item.social_title ?? "#"
                                )}`}
                                type="fab"
                                className="text-zinc-900 group-hover:text-yellow-500 ease absolute mt-[1px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                              />
                            )}
                          </div>
                        </div>
                        <span>{item.social_title}</span>
                      </div>
                    </Link>
                  ))}
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
                href="https://8pdev.studio/"
                target="_blank"
                className="hover:underline hover:text-rose-600 ease font-semibold pl-1"
                rel="noreferrer"
              >
                oitop
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <></>;
}
