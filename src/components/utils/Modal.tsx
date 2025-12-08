import Icon from "@/src/icons/fontAwesome/FIcon";
import { useEffect, useState } from "react";

interface ModalProps {
  status: boolean;
  title?: string;
  style?: "success" | "light";
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  children?: React.ReactNode;
  close: () => void;
  className?: string;
  /** quando true, mostra como drawer lateral direito (estilo da loja) */
  storeView?: boolean;
  /** quando true, modal ocupa tela inteira (fullscreen) */
  fullscreen?: boolean;
}

export default function Modal(attr: ModalProps) {
  const [status, setStatus] = useState<boolean>(attr.status);

  const styles: Record<string, string> = {
    success: "bg-green-400 text-white",
    light: "bg-zinc-100 text-zinc-900",
  };

  // tamanhos para MODAL centralizado (max-width)
  const dialogSize: Record<NonNullable<ModalProps["size"]>, string> = {
    xs: "max-w-sm",
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-xl",
    xl: "max-w-2xl",
  };

  // larguras para DRAWER lateral
  const drawerSize: Record<NonNullable<ModalProps["size"]>, string> = {
    xs: "w-full sm:w-[18rem]",
    sm: "w-full sm:w-[22rem]",
    md: "w-full sm:w-[26rem]",
    lg: "w-full sm:w-[30rem]",
    xl: "w-full sm:w-[36rem]",
  };

  const onClose = () => {
    setStatus(false);
    setTimeout(() => {
      attr.close();
    }, 200); // acompanha a duration da animação
  };

  useEffect(() => {
    setStatus(attr.status);
  }, [attr.status]);

  const withStyle = attr.style ? styles[attr.style] : "";

  return (
    <>
      {/* ====== VARIAÇÃO FULLSCREEN (sem overlay) ====== */}
      {attr.fullscreen ? (
        <div
          className={`fixed inset-0 flex flex-col bg-white z-[100] overflow-hidden
            transition-opacity duration-200 ease-in-out
            ${status ? "opacity-100" : "opacity-0 pointer-events-none"}
            ${attr.className ?? ""}`}
          role="dialog"
          aria-modal="true"
          style={{ display: attr.status ? 'flex' : 'none' }}
        >
            {/* Header fixo */}
            <div className="relative p-4 md:p-6 border-b bg-white z-10 shadow-sm">
              {attr.title && (
                <h4 className="text-xl md:text-2xl font-bold text-zinc-900 pr-12">
                  {attr.title}
                </h4>
              )}
              <button
                type="button"
                onClick={onClose}
                className="text-xl md:text-2xl absolute right-4 md:right-6 top-4 md:top-6 p-2 hover:bg-zinc-100 rounded-full transition-colors"
                aria-label="Fechar"
              >
                <Icon icon="fa-times" />
              </button>
            </div>

            {/* Conteúdo com scroll */}
            <div className={`flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 ${withStyle}`}>
              <div className="max-w-5xl mx-auto">
                {attr.children}
              </div>
            </div>
          </div>
        ) : attr.storeView ? (
          <div
            className={`fixed right-0 top-0 h-[100svh] flex flex-col bg-white z-10 ${drawerSize[attr.size ?? "xl"]} 
              shadow-xl transition-transform duration-200 ease-in-out
              ${status ? "translate-x-0" : "translate-x-full"}
              ${attr.className ?? ""}`}
            role="dialog"
            aria-modal="true"
          >
            {/* Header */}
            <div className="relative p-4 md:p-6 border-b">
              {attr.title && (
                <h4 className="text-xl text-zinc-900">{attr.title}</h4>
              )}
              <button
                type="button"
                onClick={onClose}
                className="text-xl absolute right-0 top-0 p-5"
                aria-label="Fechar"
              >
                <Icon icon="fa-times" />
              </button>
            </div>

            {/* Conteúdo */}
            <div className={`flex-1 overflow-y-auto p-4 md:p-6 ${withStyle}`}>
              {attr.children}
            </div>
          </div>
        ) : (
          <div
            className={`fixed top-0 left-0 w-full z-[100] ${attr.status ? "h-[100svh] overflow-y-scroll" : "h-0 overflow-hidden"
              }`}
          >
            <div className="absolute flex min-h-[100svh] w-full py-10 lg:py-20">
              <div
                onClick={() => onClose()}
                className={`${status ? "opacity-75" : "opacity-0"
                  } ease w-full absolute inset-0 min-h-[100svh] bg-zinc-900`}
              ></div>

              <div
                className={`${status ? "" : "-mb-10 opacity-0"} ${drawerSize[attr.size ?? "xl"]
                  } relative ease w-full mx-auto px-4`}
              >
                <div className="relative rounded-xl bg-white text-zinc-950 p-4 md:p-6">
                  <div
                    className={`w-full flex items-start ${!!attr?.title ? "border-b mb-2" : ""
                      }`}
                  >
                    {!!attr?.title && (
                      <h4 className="text-xl text-zinc-900 w-full pb-2">
                        {attr?.title}
                      </h4>
                    )}
                    <button
                      type="button"
                      onClick={() => onClose()}
                      className="text-xl -mt-1 absolute right-0 top-0 p-5"
                    >
                      <Icon icon="fa-times" />
                    </button>
                  </div>
                  <div className={`${!!attr?.title ? "pt-3" : ""}`}>
                    {attr?.children}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

      {/* trava scroll do body enquanto aberto */}
      {attr.status && (
        <style global jsx>{`
          body {
            overflow: hidden;
          }
        `}</style>
      )}
    </>
  );
}
