import Icon from "@/src/icons/fontAwesome/FIcon";
import { useEffect, useState } from "react";
import { Button } from "../ui/form";

interface Modal {
  status: boolean;
  title?: string;
  style?: string;
  size?: string;
  children?: React.ReactNode;
  close: Function;
  className?: string;
}

export default function Modal(attr: Modal) {
  const [status, setStatus] = useState(attr.status as boolean);

  const style: any = {
    success: "bg-green-400 text-white",
    light: "bg-zinc-100 text-zinc-900",
  };

  const size: any = {
    xs: "max-w-sm",
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-xl",
    xl: "max-w-2xl",
  };

  const onClose = () => {
    setStatus(false);
    setTimeout(() => {
      attr.close();
    }, 200);
  };

  useEffect(() => {
    setStatus(attr.status);
  }, [attr.status]);

  return (
    <>
      <div
        className={`fixed top-0 left-0 w-full z-[100] ${
          attr.status ? "h-[100svh] overflow-y-scroll" : "h-0 overflow-hidden"
        }`}
      >
        <div className="absolute flex min-h-[100svh] w-full py-10 lg:py-20">
          <div
            onClick={() => onClose()}
            className={`${
              status ? "opacity-75" : "opacity-0"
            } ease w-full absolute inset-0 min-h-[100svh] bg-zinc-900`}
          ></div>

          <div
            className={`${status ? "" : "-mb-10 opacity-0"} ${
              size[attr.size ?? "xl"]
            } relative ease w-full mx-auto px-4`}
          >
            <div className="relative rounded-xl bg-white text-zinc-950 p-4 md:p-6">
              <div
                className={`w-full flex items-start ${
                  !!attr?.title ? "border-b mb-2" : ""
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
