import { useEffect, useState, useRef } from "react";
import { Button } from "../ui/form";
import { getImage, moneyFormat } from "@/src/helper";
import Img from "../utils/ImgBase";
import Link from "next/link";
import { GetCart, RemoveToCart, AddToCart } from "../pages/carrinho";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Api from "@/src/services/api";

interface CartPreviewProps {
  isMobile?: boolean;
  onClose?: () => void;
}

interface UndoState {
  item: any;
  index: number;
  productData: any;
}

export default function CartPreview({ isMobile = false, onClose }: CartPreviewProps) {
  const [cart, setCart] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [undoState, setUndoState] = useState<UndoState | null>(null);
  const undoTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadCart();
  }, []);

  // Bloqueia scroll do body no mobile quando modal está aberto
  useEffect(() => {
    if (isMobile) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "auto";
      };
    }
  }, [isMobile]);

  // Fecha com tecla ESC
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const loadCart = async () => {
    setLoading(true);
    const cartData = GetCart();

    if (cartData.length === 0) {
      setCart([]);
      setLoading(false);
      return;
    }

    // Busca produtos do backend (mesma lógica da página de carrinho)
    try {
      const api = new Api();
      const productIds = cartData.map((item: any) => item.product);

      const request = await api.request({
        method: "get",
        url: "request/products",
        data: {
          whereIn: productIds,
        },
      });

      const products = request?.data ?? [];

      // Enriquece o carrinho com dados completos do produto
      const enrichedCart = cartData.map((item: any) => {
        const product = products.find((p: any) => p.id === item.product);
        return {
          ...item,
          product: product || null,
        };
      });

      setCart(enrichedCart);
    } catch (error) {
      console.error("Erro ao carregar produtos do carrinho:", error);
      setCart(cartData);
    } finally {
      setLoading(false);
    }
  };

  // Limpa o timer quando o componente desmonta
  useEffect(() => {
    return () => {
      if (undoTimerRef.current) {
        clearTimeout(undoTimerRef.current);
      }
    };
  }, []);

  const handleRemove = (index: number) => {
    // Cancela timer anterior se existir
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
    }

    // Salva o item antes de remover
    const itemToRemove = cart[index];

    // Remove do carrinho
    RemoveToCart(index);

    // Mostra toast de undo
    setUndoState({
      item: itemToRemove,
      index: index,
      productData: itemToRemove.product
    });

    // Timer de 5 segundos para esconder o toast
    undoTimerRef.current = setTimeout(() => {
      setUndoState(null);
    }, 5000);

    // Recarrega carrinho
    loadCart();
  };

  const handleUndo = () => {
    if (!undoState) return;

    // Cancela o timer
    if (undoTimerRef.current) {
      clearTimeout(undoTimerRef.current);
      undoTimerRef.current = null;
    }

    // Restaura o item (remove a parte do produto enriquecido)
    const { product, ...itemToRestore } = undoState.item;
    AddToCart(itemToRestore);

    // Limpa o estado de undo
    setUndoState(null);

    // Recarrega o carrinho
    loadCart();
  };

  const totalItems = cart.reduce((acc, item) => acc + (item.quantity || 1), 0);
  const totalValue = cart.reduce((acc, item) => acc + (Number(item.total) || 0), 0);

  // Calcula total de frete somando individualmente de cada item
  const totalDeliveryFee = cart.reduce((acc, item) => {
    const feeValue = Number(item?.details?.deliveryFee);
    if (Number.isFinite(feeValue) && feeValue > 0) {
      return acc + feeValue;
    }
    return acc;
  }, 0);

  const totalWithDelivery = totalValue + totalDeliveryFee;

  // Mobile: Modal fullscreen
  if (isMobile) {
    return (
      <>
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black/50 z-[100]"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl z-[101] max-h-[80vh] flex flex-col shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-200">
            <h4 className="font-bold text-zinc-900 text-lg">
              {loading ? "Carregando..." : cart.length === 0 ? "Carrinho vazio" : `${totalItems} ${totalItems === 1 ? "item" : "itens"} no carrinho`}
            </h4>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-zinc-100"
            >
              <Icon icon="fa-times" className="text-zinc-600" />
            </button>
          </div>

          {loading ? (
            <p className="text-zinc-500 text-center py-8">Carregando...</p>
          ) : cart.length === 0 ? (
            <p className="text-zinc-500 text-center py-8">Carrinho vazio</p>
          ) : (
            <>
              {/* Lista de produtos */}
              <div className="flex-1 overflow-y-auto">
                {cart.map((item: any, index: number) => {
                  const product = item.product || {};
                  const store = product.store || {};

                  return (
                    <div key={index} className="p-4 border-b border-zinc-100 relative">
                      <button
                        onClick={() => handleRemove(index)}
                        className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center z-10"
                      >
                        <Icon icon="fa-times" className="text-xs" />
                      </button>

                      <div className="flex gap-3">
                        <div className="w-20 h-20 bg-zinc-100 rounded flex-shrink-0">
                          {product.gallery?.[0] && (
                            <Img
                              src={getImage(product.gallery[0], "sm")}
                              className="w-full h-full object-contain rounded"
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold text-sm text-zinc-900 line-clamp-2 pr-6">
                            {product.title || "Produto"}
                          </h5>

                          {store.companyName && (
                            <div className="flex items-center gap-2 mt-1">
                              {store.profile && (
                                <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                                  <Img
                                    src={getImage(store.profile, "thumb")}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                              <p className="text-xs text-cyan-600 truncate">
                                {store.companyName}
                              </p>
                            </div>
                          )}

                          <div className="flex items-center justify-between mt-2">
                            <p className="text-xs text-zinc-500">
                              Qtd: {item.quantity || 1}
                            </p>
                            <p className="text-sm font-bold text-zinc-900">
                              R$ {moneyFormat(item.total || 0)}
                            </p>
                          </div>

                          {/* Frete individual do item */}
                          {item?.details?.deliveryFee && Number(item.details.deliveryFee) > 0 && (
                            <div className="mt-2 pt-2 border-t border-zinc-100">
                              <div className="flex justify-between items-center text-xs">
                                <div className="flex flex-col gap-0.5">
                                  <span className="text-zinc-500">Frete</span>
                                  {item?.details?.deliveryZipCode && (
                                    <span className="text-zinc-400 text-[10px]">
                                      CEP: {item.details.deliveryZipCode.replace(/^(\d{5})(\d{3})$/, '$1-$2')}
                                    </span>
                                  )}
                                </div>
                                <span className="text-cyan-600 font-medium">
                                  R$ {moneyFormat(item.details.deliveryFee)}
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="p-4 bg-zinc-50 border-t border-zinc-200">
                <div className="space-y-2 mb-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-zinc-600">Subtotal:</span>
                    <span className="text-sm font-semibold text-zinc-900">
                      R$ {moneyFormat(totalValue)}
                    </span>
                  </div>

                  {/* Total de frete */}
                  {totalDeliveryFee > 0 && (
                    <>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-zinc-600">Total Frete:</span>
                        <span className="text-sm font-semibold text-cyan-600">
                          R$ {moneyFormat(totalDeliveryFee)}
                        </span>
                      </div>

                      <div className="flex justify-between items-center pt-2 border-t border-zinc-300">
                        <span className="text-sm font-bold text-zinc-700">Total:</span>
                        <span className="text-lg font-bold text-cyan-600">
                          R$ {moneyFormat(totalWithDelivery)}
                        </span>
                      </div>
                    </>
                  )}

                  {totalDeliveryFee === 0 && (
                    <div className="flex justify-between items-center pt-2 border-t border-zinc-300">
                      <span className="text-sm font-bold text-zinc-700">Total:</span>
                      <span className="text-lg font-bold text-zinc-900">
                        R$ {moneyFormat(totalValue)}
                      </span>
                    </div>
                  )}
                </div>

                <Link href="/carrinho" onClick={onClose}>
                  <Button className="w-full">Ver carrinho completo</Button>
                </Link>
              </div>
            </>
          )}
        </div>

        {/* Toast de Undo - Mobile */}
        {undoState && (
          <div className="fixed bottom-20 left-4 right-4 z-[102]">
            <div className="bg-zinc-900 text-white rounded-lg p-4 shadow-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Icon icon="fa-check-circle" className="text-green-400" />
                <span className="text-sm">Item removido</span>
              </div>
              <button
                onClick={handleUndo}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 rounded text-sm font-medium transition-colors"
              >
                Desfazer
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  // Desktop: Dropdown
  if (loading) {
    return (
      <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-zinc-200 p-4 z-50">
        <p className="text-zinc-500 text-center py-8">Carregando...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="absolute top-full right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-zinc-200 p-4 z-50">
        <p className="text-zinc-500 text-center py-8">Carrinho vazio</p>
      </div>
    );
  }

  return (
    <div className="absolute top-full right-0 pt-2 w-96 z-50">
      <div className="bg-white rounded-lg shadow-xl border border-zinc-200 overflow-hidden">
      <div className="p-4 border-b border-zinc-200">
        <h4 className="font-bold text-zinc-900">
          {totalItems} {totalItems === 1 ? "item" : "itens"} no carrinho
        </h4>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {cart.slice(0, 3).map((item: any, index: number) => {
          const product = item.product || {};
          const store = product.store || {};

          return (
            <div key={index} className="p-4 border-b border-zinc-100 hover:bg-zinc-50 relative group">
              <button
                onClick={() => handleRemove(index)}
                className="absolute top-2 right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                title="Remover item"
              >
                <Icon icon="fa-times" className="text-xs" />
              </button>

              <div className="flex gap-3">
                <div className="w-20 h-20 bg-zinc-100 rounded flex-shrink-0">
                  {product.gallery?.[0] && (
                    <Img
                      src={getImage(product.gallery[0], "sm")}
                      className="w-full h-full object-contain rounded"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-semibold text-sm text-zinc-900 line-clamp-2 pr-6">
                    {product.title || "Produto"}
                  </h5>

                  {store.companyName && (
                    <div className="flex items-center gap-2 mt-1">
                      {store.profile && (
                        <div className="w-4 h-4 rounded-full overflow-hidden flex-shrink-0">
                          <Img
                            src={getImage(store.profile, "thumb")}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <p className="text-xs text-cyan-600 truncate">
                        {store.companyName}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-zinc-500">
                      Qtd: {item.quantity || 1}
                    </p>
                    <p className="text-sm font-bold text-zinc-900">
                      R$ {moneyFormat(item.total || 0)}
                    </p>
                  </div>

                  {/* Frete individual do item */}
                  {item?.details?.deliveryFee && Number(item.details.deliveryFee) > 0 && (
                    <div className="mt-2 pt-2 border-t border-zinc-100">
                      <div className="flex justify-between items-center text-xs">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-zinc-500">Frete</span>
                          {item?.details?.deliveryZipCode && (
                            <span className="text-zinc-400 text-[10px]">
                              CEP: {item.details.deliveryZipCode.replace(/^(\d{5})(\d{3})$/, '$1-$2')}
                            </span>
                          )}
                        </div>
                        <span className="text-cyan-600 font-medium">
                          R$ {moneyFormat(item.details.deliveryFee)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {cart.length > 3 && (
          <div className="p-3 text-center text-sm text-zinc-500">
            + {cart.length - 3} {cart.length - 3 === 1 ? "outro item" : "outros itens"}
          </div>
        )}
      </div>

      <div className="p-4 bg-zinc-50 border-t border-zinc-200">
        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-600">Subtotal:</span>
            <span className="text-sm font-semibold text-zinc-900">
              R$ {moneyFormat(totalValue)}
            </span>
          </div>

          {/* Total de frete */}
          {totalDeliveryFee > 0 && (
            <>
              <div className="flex justify-between items-center">
                <span className="text-sm text-zinc-600">Total Frete:</span>
                <span className="text-sm font-semibold text-cyan-600">
                  R$ {moneyFormat(totalDeliveryFee)}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-zinc-300">
                <span className="text-sm font-bold text-zinc-700">Total:</span>
                <span className="text-lg font-bold text-cyan-600">
                  R$ {moneyFormat(totalWithDelivery)}
                </span>
              </div>
            </>
          )}

          {totalDeliveryFee === 0 && (
            <div className="flex justify-between items-center pt-2 border-t border-zinc-300">
              <span className="text-sm font-bold text-zinc-700">Total:</span>
              <span className="text-lg font-bold text-zinc-900">
                R$ {moneyFormat(totalValue)}
              </span>
            </div>
          )}
        </div>

        <Link href="/carrinho">
          <Button className="w-full">Ver carrinho completo</Button>
        </Link>
      </div>
      </div>

      {/* Toast de Undo */}
      {undoState && (
        <div className="absolute bottom-full right-0 mb-2 w-full px-2">
          <div className="bg-zinc-900 text-white rounded-lg p-3 shadow-xl flex items-center justify-between gap-3 animate-slide-up">
            <div className="flex items-center gap-2">
              <Icon icon="fa-check-circle" className="text-green-400" />
              <span className="text-sm">Item removido</span>
            </div>
            <button
              onClick={handleUndo}
              className="px-3 py-1 bg-cyan-500 hover:bg-cyan-600 rounded text-sm font-medium transition-colors"
            >
              Desfazer
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
