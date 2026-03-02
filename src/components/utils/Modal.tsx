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
  const isVisible = attr.status || status;

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
              shadow-xl transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
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
        ) : isVisible ? (
          <div
            className="fixed inset-0 z-[100] pointer-events-auto"
          >
            <div
              onClick={() => onClose()}
              className={`absolute inset-0 bg-zinc-900 transition-opacity duration-300 ${
                status ? "opacity-60" : "opacity-0"
              }`}
            />

            <div className="absolute inset-0 flex items-end sm:items-center justify-center p-2 sm:p-4 md:p-6">
              <div
                className={`${
                  status
                    ? "translate-y-0 scale-100 opacity-100"
                    : "translate-y-4 scale-[0.99] opacity-0"
                } ${dialogSize[attr.size ?? "xl"]} w-full max-h-[94svh] rounded-2xl bg-white text-zinc-950 shadow-2xl transform-gpu transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden`}
              >
                <div className="flex items-start gap-3 border-b border-zinc-100 px-4 py-3 sm:px-5 sm:py-4">
                  {!!attr?.title && (
                    <h4 className="text-lg sm:text-xl font-semibold text-zinc-900 w-full pr-8">
                      {attr?.title}
                    </h4>
                  )}
                  <button
                    type="button"
                    onClick={() => onClose()}
                    className="ml-auto rounded-full p-2 text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 transition-colors"
                    aria-label="Fechar"
                  >
                    <Icon icon="fa-times" />
                  </button>
                </div>
                <div
                  className={`overflow-y-auto px-4 py-4 sm:px-5 sm:py-5 ${
                    !!attr?.title ? "" : "pt-5"
                  } ${withStyle}`}
                >
                  {attr?.children}
                </div>
              </div>
            </div>
          </div>
        ) : null}

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
