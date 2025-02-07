import Img from "@/src/components/utils/ImgBase";
import {
  getFirstName,
  getImage,
  getSocial,
  isMobileDevice,
} from "@/src/helper";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HeaderType } from "@/src/default/header/index";
import { UserType } from "@/src/models/user";
import Cookies from "js-cookie";
import { Button } from "@/src/components/ui/form";
import User from "./utils/User";
import Login from "./utils/Login";
import BIcon from "@/src/icons/bootstrapIcons/BIcon";
import FIcon from "@/src/icons/fontAwesome/FIcon";

export default function Default({
  params,
  user,
}: {
  params: HeaderType;
  user: UserType;
}) {
  const content = params.content;

  const bgScroll =
    params.background != "bg-transparent" ? params.background : "bg-cyan-500 ";

  const [cart, setCart] = useState([]);

  const [menuModal, setMenuModal] = useState(false as boolean);

  const [layout, setLayout] = useState({} as any);

  useEffect(() => {
    if (!!Cookies.get("fiestou.cart")) {
      setCart(JSON.parse(Cookies.get("fiestou.cart") ?? ""));
    }
    if (!!window) {
      setLayout({ ...layout, isMobile: isMobileDevice() });
    }
  }, []);

  return (
    <>
      <header
        className={`${
          params.position == "fixed" ? "fixed top-0 left-0" : "relative"
        } w-full z-[99] ${params.background}`}
      >
        <div
          className={`${
            params.scroll
              ? `${bgScroll} lg:py-0`
              : `${params.background} lg:py-2`
          } ease absolute h-full w-full inset-0`}
        ></div>
        <div className="ease container-medium relative text-white pl-4 pr-2 lg:px-4">
          <div className="flex justify-between gap-2 lg:gap-16 items-center py-2">
            <div className="w-full lg:w-[120px] order-1">
              <div
                className={`max-w-[72px] md:max-w-[120px] ${
                  params.position == "fixed" &&
                  params.scroll &&
                  "lg:max-w-[100px]"
                } ease`}
              >
                <Link passHref href="/">
                  <div className="aspect aspect-video -mt-2">
                    <Img
                      src={
                        !!content?.header_logo
                          ? getImage(content.header_logo)
                          : "/images/logo.png"
                      }
                      size="md"
                      className="w-full h-full object-contain"
                    />
                  </div>
                </Link>
              </div>
            </div>

            <div className="hidden lg:grid z-10 bottom-0 left-0 order-2">
              <div className="w-full flex gap-6">
                {!!content?.menu_links &&
                  content.menu_links.map((item: any, key: any) => (
                    <div key={key}>
                      <Link passHref href={item.menu_link}>
                        <div
                          className={`whitespace-nowrap ease ${
                            params.pathname == ``
                              ? "text-yellow-300 font-bold"
                              : "hover:text-yellow-300"
                          }`}
                        >
                          {item.menu_title}
                        </div>
                      </Link>
                    </div>
                  ))}
              </div>
            </div>

            <div className="w-fit order-3 lg:order-4 flex items-center gap-4 md:gap-8"> 
              {!!user?.id ? <User user={user} /> : <Login content={content} />}
            </div>

            <div className="relative w-fit order-3 lg:order-5 text-center">
              <Button
                href="/carrinho"
                style="btn-transparent"
                className="py-2 px-1 text-white hover:text-yellow-300 ease relative"
              >
                <Icon icon="fa-shopping-cart" className="text-xl lg:text-3xl" />
                {!!cart.length && (
                  <div className="absolute bg-zinc-900 -mr-2 rounded-full right-0 top-0 p-[.65rem] md:p-3 text-white">
                    <span className="text-xs md:text-sm font-normal md:font-semibold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      {cart.length}
                    </span>
                  </div>
                )}
              </Button>
            </div>

            <div className="w-fit order-4 relative lg:hidden text-right">
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
        {!params.scroll && (
          <div className="container-medium relative">
            <hr className="border-white opacity-50" />
          </div>
        )}
      </header>

      {menuModal && (
        <div
          dangerouslySetInnerHTML={{
            __html: `<style>
          body, html{
          overflow:hidden}
        </style>`,
          }}
        ></div>
      )}

      <div
        className={`${
          menuModal ? "grid" : "hidden"
        } fixed z-[60] top-0 left-0 w-full`}
      >
        <div className="fixed text-white left-0 top-0 w-full h-screen bg-cyan-500  text-right flex flex-col items-start">
          <div className="min-h-[78vh] w-full flex text-2xl flex-col items-start pt-20">
            {!!content?.menu_links &&
              content.menu_links.map((item: any, key: any) => (
                <div className="w-full py-2 px-4" key={key}>
                  <Link passHref href={item.menu_link}>
                    <div
                      className={`leading-tight whitespace-nowrap flex justify-between ease ${
                        params.pathname == ``
                          ? "text-yellow-300 font-bold"
                          : "hover:text-yellow-300"
                      }`}
                    >
                      <div className="">
                        {!!item.menu_icon && <FIcon icon={item.menu_icon} />}
                      </div>
                      <div>{item.menu_title}</div>
                    </div>
                  </Link>
                </div>
              ))}
          </div>

          {!!params?.content?.social && (
            <div className="fixed bottom-0 left-0 w-full">
              <div className="border-t opacity-20 w-[90%] mx-auto"></div>
              <div className="w-full py-4 flex gap-4 justify-center text-xl">
                {params.content.social.map((item: any) => (
                  <Link
                    href={item.social_link ?? "#"}
                    key={item.id}
                    className="hover:text-yellow-300 ease"
                  >
                    {getSocial(item.social_link ?? item.social_title ?? "#") ==
                    "tiktok" ? (
                      <BIcon icon="bi-tiktok" />
                    ) : (
                      <FIcon
                        icon={`fa-${getSocial(
                          item.social_link ?? item.social_title ?? "#"
                        )}`}
                        type="fab"
                      />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
