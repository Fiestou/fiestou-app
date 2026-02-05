import { KeyboardEvent, useState } from "react";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { Button } from "@/src/components/ui/form";
import Img from "@/src/components/utils/ImgBase";
import { dateBRFormat, moneyFormat } from "@/src/helper";
import { formatCep } from "@/src/components/utils/FormMasks";
import { CartResume, calculateAddonsTotal, StoreMinimumSummary } from "@/src/services/cart";
import { CartType } from "@/src/models/cart";

interface CartSummaryProps {
  resume: CartResume;
  listCart: CartType[];
  deliveryZipInput: string;
  deliveryLoading: boolean;
  deliveryError: string | null;
  onZipChange: (value: string) => void;
  onCalculateDelivery: () => void;
  checkoutHref?: string;
  checkoutButtonText?: string;
  showCheckoutButton?: boolean;
  minimumOrderSummary?: StoreMinimumSummary[];
}

export default function CartSummary({
  resume,
  listCart,
  deliveryZipInput,
  deliveryLoading,
  deliveryError,
  onZipChange,
  onCalculateDelivery,
  checkoutHref = "checkout",
  checkoutButtonText = "Confirmar e combinar entrega",
  showCheckoutButton = true,
  minimumOrderSummary = [],
}: CartSummaryProps) {
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      onCalculateDelivery();
    }
  };

  const totalAddons = calculateAddonsTotal(listCart);
  const hasMinimumOrderBlock = minimumOrderSummary.some(
    (s) => s.enabled && s.minimumValue > 0 && s.missing > 0,
  );

  return (
    <div className="w-full md:max-w-[28rem] md:mb-[2rem] relative">
      <div className="rounded-2xl bg-zinc-100 p-4 md:p-8">
        <h5 className="font-title pb-6 text-zinc-900 md:text-xl font-bold">
          Resumo
        </h5>

        <div className="grid gap-2">
          {/* Data da locação */}
          <div className="flex justify-between">
            <div className="font-bold text-sm text-zinc-900 flex items-center">
              <Icon icon="fa-calendar" className="text-sm mr-2 opacity-75" />
              Data da locação
            </div>
            <div className="whitespace-nowrap">
              {dateBRFormat(resume.startDate)}{" "}
              {resume.endDate != resume.startDate
                ? `- ${dateBRFormat(resume.endDate)}`
                : ""}
            </div>
          </div>

          <div className="border-t"></div>

          {/* Subtotal */}
          <div className="flex">
            <div className="w-full whitespace-nowrap">
              Subtotal ({listCart.length}{" "}
              {listCart.length == 1 ? "item" : "itens"})
            </div>
            <div className="whitespace-nowrap">
              R$ {moneyFormat(resume.subtotal)}
            </div>
          </div>

          {/* Total de adicionais */}
          {totalAddons > 0 && (
            <>
              <div className="border-t"></div>
              <div className="flex justify-between">
                <div className="w-full whitespace-nowrap text-zinc-600">
                  Adicionais
                </div>
                <div className="whitespace-nowrap text-cyan-600 font-semibold">
                  R$ {moneyFormat(totalAddons)}
                </div>
              </div>
            </>
          )}

          <div className="border-t"></div>

          {/* Calcular frete */}
          <div className="grid gap-2">
            <div className="font-bold text-sm text-zinc-900">Calcular frete</div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                className="border rounded px-3 py-2 w-full sm:flex-1"
                placeholder="Digite seu CEP"
                value={deliveryZipInput}
                maxLength={9}
                onChange={(e) => onZipChange(formatCep(e.target.value))}
                onKeyDown={handleKeyDown}
                disabled={deliveryLoading}
              />
              <Button
                type="button"
                style="btn-light"
                className="sm:w-auto w-full"
                loading={deliveryLoading}
                disable={deliveryLoading}
                onClick={onCalculateDelivery}
              >
                Calcular
              </Button>
            </div>
            {deliveryError ? (
              <span className="text-sm text-red-500">{deliveryError}</span>
            ) : !resume.deliveryEntries.length ? (
              <span className="text-xs text-zinc-500">
                Informe o CEP para calcular o frete antes de continuar para o
                checkout.
              </span>
            ) : null}
          </div>

          <div className="border-t"></div>
          {(resume.deliveryZipCodes.length > 0 ||
            resume.delivery > 0 ||
            resume.deliveryEntries.length > 0) && (
            <div className="grid gap-2">
              <div className="flex justify-between">
                <div className="font-bold text-sm text-zinc-900 flex items-center">
                  <Icon icon="fa-truck" className="text-sm mr-2 opacity-75" />
                  Frete
                  {resume.deliveryZipCodes.length
                    ? ` (${resume.deliveryZipCodes
                        .map((zip) => formatCep(zip))
                        .join(", ")})`
                    : ""}
                </div>
                <div className="whitespace-nowrap">
                  R$ {moneyFormat(resume.delivery)}
                </div>
              </div>

              {resume.deliveryEntries.length > 0 && (
                <div className="grid gap-2 text-sm">
                  {resume.deliveryEntries.map((entry) => {
                    const label = entry.storeName || "Entrega parceira";
                    const initials = label
                      .split(" ")
                      .filter(Boolean)
                      .slice(0, 2)
                      .map((word) => word[0]?.toUpperCase())
                      .join("");

                    return (
                      <div
                        key={entry.key}
                        className="flex items-center justify-between gap-3 rounded border border-dashed border-zinc-200 px-3 py-2 bg-white"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {entry.storeLogoUrl ? (
                            <Img
                              src={entry.storeLogoUrl}
                              alt={label}
                              className="w-8 h-8 rounded-full object-cover border border-zinc-200"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-zinc-200 text-xs font-semibold flex items-center justify-center text-zinc-600">
                              {initials || "?"}
                            </div>
                          )}
                          <span className="truncate text-zinc-700">{label}</span>
                        </div>
                        <span className="font-semibold text-zinc-900">
                          R$ {moneyFormat(entry.price)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="border-t"></div>
            </div>
          )}

          <div className="flex gap-2 mb-4">
            <div className="w-full text-zinc-900 font-bold">Total</div>
            <div className="text-2xl text-zinc-900 font-bold whitespace-nowrap">
              R$ {moneyFormat(resume.total)}
            </div>
          </div>

          {showCheckoutButton && (
            <div className="grid fixed md:relative bottom-0 left-0 w-full p-1 md:p-0">
              <Button
                style="btn-success"
                href={checkoutHref}
                className="py-6 mb-2 md:mb-0"
                disable={!resume.deliveryEntries.length || hasMinimumOrderBlock}
              >
                {checkoutButtonText}
              </Button>
              {hasMinimumOrderBlock ? (
                <span className="text-xs text-red-500 text-center md:text-left">
                  Pedido mínimo não atingido.
                </span>
              ) : !resume.deliveryEntries.length ? (
                <span className="text-xs text-red-500 text-center md:text-left">
                  Calcule o frete para prosseguir.
                </span>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
