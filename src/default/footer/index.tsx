import Img from "@/src/components/utils/ImgBase";
import { getUser } from "@/src/contexts/AuthContext";
import { getImage, getSocial } from "@/src/helper";
import FIcon from "@/src/icons/fontAwesome/FIcon";
import BIcon from "@/src/icons/bootstrapIcons/BIcon";
import { UserType } from "@/src/models/user";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

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

  if (params.template == "clean") {
    return <div className="pt-10 md:py-10"></div>;
  }

  if (params.template == "default") {
    return (
      <div>
        <div className="container-medium pt-14">
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
        <div className="max-w-[88rem] mx-auto pt-10">
          <hr />
        </div>
        <div className="container-medium">
          <div className="grid md:flex py-4 text-sm md:flex-wrap justify-center md:justify-between items-center gap-4 md:gap-10">
            <div className="w-full md:w-fit md:flex text-center">
              <div>
                © {new Date().getFullYear()} Fiestou. Todos os direitos
                reservados.
              </div>
              <div className="hidden md:block px-1">|</div>
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
            <div className="max-w-[20rem] flex justify-center items-center gap-2 md:gap-4 lg:gap-6">
              <div className="w-[5rem]">
                <a
                  href="https://aws.amazon.com/pt/"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Img src="/images/aws.png" size="md" />
                </a>
              </div>
              <div className="w-[5rem]">
                <a href="https://vercel.com/" target="_blank" rel="noreferrer">
                  <Img src="/images/vercel.png" size="md" />
                </a>
              </div>
              <div className="w-[4rem]">
                <a
                  href="https://stripe.com/br"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Img src="/images/stripe.png" size="md" />
                </a>
              </div>
            </div>
            {/* <div>Politica de privacidade</div>
            <div>Termos de serviços</div>
            <div>Configurações de Cookies</div> */}
          </div>
        </div>
      </div>
    );
  }

  return <></>;
}
