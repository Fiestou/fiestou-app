import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "../ui/form";
import Api from "@/src/services/api";
import { dateBRFormat, getImage } from "@/src/helper";
import Img from "../utils/ImgBase";
import Icon from "@/src/icons/fontAwesome/FIcon";
import {
  extractCartProductIds,
  getCartFromCookies,
  hydrateCartProducts,
  subscribeToCartChanges,
} from "@/src/services/cart";

export interface SidebarCartType {
  status: boolean;
  close: Function;
}

export default function SidebarCart(attr: SidebarCartType) {
  const [status, setStatus] = useState(attr.status as boolean);
  const [effect, setEffect] = useState(false as boolean);
  const [placeholder, setPlaceholder] = useState(true as boolean);
  const [products, setProducts] = useState([] as any);
  const closeTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

  const onClose = () => {
    setEffect(false);
    closeTimer.current = setTimeout(() => {
      attr.close();
      setStatus(false);
      setPlaceholder(false);
    }, 200);
  };

  const onOpen = useCallback(async () => {
    const api = new Api();

    setEffect(true);
    setStatus(true);
    setPlaceholder(true);

    const cart = getCartFromCookies();
    const productIds = extractCartProductIds(cart);

    if (!productIds.length) {
      setProducts([]);
      setPlaceholder(false);
      return;
    }

    let request: any = await api.request({
      method: "get",
      url: "request/products",
      data: {
        whereIn: productIds,
      },
    });

    const products = request?.data ?? [];
    setProducts(hydrateCartProducts(cart, products));
    setPlaceholder(false);
  }, []);

  useEffect(() => {
    if (!!window && !!attr.status) {
      onOpen();
    }
  }, [attr.status, onOpen]);

  useEffect(() => {
    if (!status) return;
    return subscribeToCartChanges(() => {
      onOpen();
    });
  }, [onOpen, status]);

  return (
    <>
      <div
        className={`fixed top-0 left-0 w-full z-[100] overflow-hidden ${
          status ? "h-[100svh]" : "h-0"
        }`}
      >
        <div className="absolute flex h-[100vh] w-full">
          <div
            onClick={() => onClose()}
            className={`${
              effect ? "opacity-75" : "opacity-0"
            } ease w-full absolute inset-0 min-h-[100svh] bg-zinc-900`}
          ></div>
          <div
            className={`${
              effect ? "mr-0" : "-mr-10 opacity-0"
            } ml-auto relative ease self-end md:self-center w-full max-w-[20rem] md:max-w-[24rem]`}
          >
            <div className="relative flex flex-col bg-white h-[100vh]">
              <div className="flex items-center border-b justify-between px-4 py-2">
                <button
                  type="button"
                  onClick={() => onClose()}
                  className="text-xl p-1 text-zinc-900"
                >
                  <Icon
                    icon="fa-chevron-left"
                    className="text-zinc-500 text-base"
                  />
                </button>
                <h4 className="text-xl text-left text-zinc-900">Resumo</h4>
                <div className="px-3"></div>
              </div>
              <div className="h-full p-4 flex flex-col overflow-y-auto gap-2">
                {placeholder
                  ? [1, 2, 3, 4].map((item) => (
                      <div
                        key={item}
                        className="py-10 rounded-md bg-zinc-200 animate-pulse"
                      ></div>
                    ))
                  : products.map((item: any, key: any) => (
                      <div key={key} className="flex items-start gap-3">
                        <div className="w-full max-w-[4rem] pt-1">
                          <div className="aspect-square bg-zinc-200 rounded">
                            <Img
                              src={getImage(item.product.gallery)}
                              className="h-full w-full object-contain"
                            />
                          </div>
                        </div>
                        <div className="w-full">
                          <h4 className="font-bold text-zinc-900">
                            {item.product.title}
                          </h4>
                          <div className="text-sm">
                            {dateBRFormat(item.details.dateStart)}
                            {!!item.details.dateEnd
                              ? ` até ${dateBRFormat(item.details.dateEnd)}`
                              : ""}
                          </div>
                          <div className="text-sm text-zinc-400">
                            {item.product.store?.companyName ?? ""}
                          </div>
                        </div>
                        <div>
                          <div className="whitespace-nowrap text-sm font-bold text-zinc-900">
                            x{item.quantity}
                          </div>
                        </div>
                      </div>
                    ))}
              </div>
              <div className="py-5"></div>
            </div>

            {status && (
              <div
                className={`${
                  effect ? "mr-0" : "-mr-10 opacity-0"
                } ml-auto fixed right-0 bottom-0 ease w-full max-w-[20rem] md:max-w-[24rem]`}
              >
                <div className="p-4 grid">
                  <Button href="/carrinho">Ir ao carrinho</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {status && (
        <style global jsx>{`
          html,
          body {
            overflow: hidden !important;
          }
        `}</style>
      )}
    </>
  );
}
