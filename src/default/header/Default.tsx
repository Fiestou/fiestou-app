import Img from "@/src/components/utils/ImgBase";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Link from "next/link";
import { useEffect, useState } from "react";
import { HeaderType } from "@/src/default/header/index";
import { UserType } from "@/src/models/user";
import { Button } from "@/src/components/ui/form";
import User from "./utils/User";
import Login from "./utils/Login";
import BIcon from "@/src/icons/bootstrapIcons/BIcon";
import FIcon from "@/src/icons/fontAwesome/FIcon";
import { GetCart } from "@/src/components/pages/carrinho";
import CartPreview from "@/src/components/common/CartPreview";
import { usePathname } from "next/navigation";

export default function Default({
  params,
  user,
}: {
  params: HeaderType;
  user: UserType;
}) {
  const content = params.content;
  const bgScroll =
    params.background != "bg-transparent" ? params.background : "bg-cyan-500";

  const [cart, setCart] = useState<any[]>([]);
  const [showCartPreview, setShowCartPreview] = useState(false);
  const [menuModal, setMenuModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname(); // 👈 pega a rota atual
  const isActive = (route: string) => pathname.startsWith(route);

  useEffect(() => {
    const loadCart = () => {
      const cartData = GetCart();
      setCart(cartData);
    };

    loadCart();
    const interval = setInterval(loadCart, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuModal(false);
    };
    if (menuModal) {
      document.addEventListener("keydown", handleEsc);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => document.removeEventListener("keydown", handleEsc);
  }, [menuModal]);

  return (
    <>
      <header
        className={`${
          params.position == "fixed" ? "fixed top-0 left-0" : "relative"
        } w-full z-[99] ${params.background}`}
      >
        {/* background dinâmico */}
        <div
          className={`${
            params.scroll
              ? `${bgScroll} lg:py-0`
              : `${params.background} lg:py-2`
          } ease absolute h-full w-full inset-0`}
        ></div>

        <div className="ease container-medium relative text-white pl-4 pr-2 lg:px-4">
          <div className="flex justify-between items-center gap-2 lg:gap-16 py-2">
            {/* Logo */}
            <div className="w-full lg:w-[120px] order-1">
              <Link href="/" passHref>
                <div className="aspect-video max-w-[72px] md:max-w-[120px] -mt-2">
                  <Img
                    src="/images/logo.png"
                    size="md"
                    className="w-full h-full object-contain"
                  />
                </div>
              </Link>
            </div>

            {/* Navegação Desktop */}
            <nav className="hidden lg:flex order-2 gap-6">
              <Link
                href="/"
                className={`whitespace-nowrap transition-colors duration-200 ${params.pathname === "/"
                    ? "text-yellow-300 font-bold"
                    : "hover:text-yellow-300"
                }`}
              >
                Início
              </Link>

              <Link
                href="/produtos"
                className={`whitespace-nowrap transition-colors duration-200 ${
                  isActive("/produtos")
                    ? "text-yellow-300 font-bold"
                    : "hover:text-yellow-300"
                }`}
              >
                Produtos
              </Link>

              <Link
                href="/parceiros"
                className={`whitespace-nowrap transition-colors duration-200 ${
                  isActive("/parceiros")
                    ? "text-yellow-300 font-bold"
                    : "hover:text-yellow-300"
                }`}
              >
                Parceiros
              </Link>

              <Link
                href="/faq"
                className={`whitespace-nowrap transition-colors duration-200 ${
                  isActive("/faq")
                    ? "text-yellow-300 font-bold"
                    : "hover:text-yellow-300"
                }`}
              >
                Ajuda
              </Link>

              <Link
                href="/sobre"
                className={`whitespace-nowrap transition-colors duration-200 ${
                  isActive("/sobre")
                    ? "text-yellow-300 font-bold"
                    : "hover:text-yellow-300"
                }`}
              >
                Sobre nós
              </Link>
            </nav>

            {/* Usuário (login ou perfil) */}
            <div className="w-fit order-3 lg:order-4 flex items-center gap-4 md:gap-8">
              {!!user?.id ? <User user={user} /> : <Login content={content} />}
            </div>

            {/* Carrinho */}
            <div
              className="relative w-fit order-3 lg:order-5"
              {...(!isMobile && {
                onMouseEnter: () => setShowCartPreview(true),
                onMouseLeave: () => setShowCartPreview(false),
              })}
            >
              <Button
                {...(isMobile
                  ? {
                      type: "button",
                      onClick: () => setShowCartPreview(!showCartPreview),
                    }
                  : { href: "/carrinho" })}
                style="btn-transparent"
                className="py-2 px-1 text-white hover:text-yellow-300 ease relative"
              >
                <Icon icon="fa-shopping-cart" className="text-xl lg:text-3xl" />
                {!!cart.length && (
                  <div className="absolute bg-zinc-900 -mr-2 rounded-full right-0 top-0 p-[.65rem] md:p-3 text-white">
                    <span className="text-xs md:text-sm font-semibold absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                      {cart.length}
                    </span>
                  </div>
                )}
              </Button>
              {showCartPreview && cart.length > 0 && (
                <CartPreview
                  isMobile={isMobile}
                  onClose={() => setShowCartPreview(false)}
                />
              )}
            </div>

            {/* Botão Mobile */}
            <div className="w-fit order-4 lg:hidden">
              <Button
                style="btn-transparent"
                type="button"
                onClick={() => setMenuModal(!menuModal)}
                className="py-2 px-1 text-white"
              >
                <Icon
                  icon={menuModal ? "fa-times" : "fa-bars"}
                  className="text-xl lg:text-3xl"
                />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Menu Mobile */}
      {menuModal && (
        <div className="fixed z-[60] inset-0 bg-cyan-500 text-white flex flex-col">
          <div className="flex flex-col items-start text-2xl pt-20">
            <Link
              href="/"
              className={`w-full py-3 px-6 flex items-center gap-3 ${params.pathname === "/" ? "text-yellow-300 font-bold" : "hover:text-yellow-300"
              }`}
            >
              <FIcon icon="fa-home" />
              Início
            </Link>

            <Link
              href="/produtos"
              className={`w-full py-3 px-6 flex items-center gap-3 ${
                isActive("/produtos")
                  ? "text-yellow-300 font-bold"
                  : "hover:text-yellow-300"
              }`}
            >
              <FIcon icon="fa-box" />
              Produtos
            </Link>

            <Link
              href="/parceiros"
              className={`w-full py-3 px-6 flex items-center gap-3 ${
                isActive("/parceiros")
                  ? "text-yellow-300 font-bold"
                  : "hover:text-yellow-300"
              }`}
            >
              <FIcon icon="fa-handshake" />
              Parceiros
            </Link>

            <Link
              href="/faq"
              className={`w-full py-3 px-6 flex items-center gap-3 ${
                isActive("/faq")
                  ? "text-yellow-300 font-bold"
                  : "hover:text-yellow-300"
              }`}
            >
              <FIcon icon="fa-question-circle" />
              Ajuda
            </Link>

            <Link
              href="/sobre"
              className={`w-full py-3 px-6 flex items-center gap-3 ${
                isActive("/sobre")
                  ? "text-yellow-300 font-bold"
                  : "hover:text-yellow-300"
              }`}
            >
              <FIcon icon="fa-file-alt" />
              Sobre nós
            </Link>
          </div>

          {/* Social fixo */}
          <div className="mt-auto border-t border-white/20 py-6 flex justify-center gap-6 text-xl">
            <Link
              href="https://www.facebook.com/Fiestou.com.br#"
              className="hover:text-yellow-300"
            >
              <FIcon icon="fa-facebook" type="fab" />
            </Link>
            <Link
              href="https://www.instagram.com/fiestou.com.br/"
              className="hover:text-yellow-300"
            >
              <FIcon icon="fa-instagram" type="fab" />
            </Link>
            <Link
              href="https://pin.it/1zZ5jI3PS"
              className="hover:text-yellow-300"
            >
              <FIcon icon="fa-pinterest" type="fab" />
            </Link>
            <Link
              href="https://www.youtube.com/channel/UCOs0m-bltMn5n3ewKBLWVaQ"
              className="hover:text-yellow-300 gap-4"
            >
              <FIcon icon="fa-youtube" type="fab" />
            </Link>
            <Link
              href="https://www.tiktok.com/@fiestou.com"
              className="hover:text-yellow-300"
            >
              <BIcon icon="bi-tiktok" />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
