"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { formatCep } from "@/src/components/utils/FormMasks";

interface ProductShippingCalculatorProps {
  cep: string;
  setCep: (cep: string) => void;
  formatCep: (v: string) => string;
  loadingCep: boolean;
  handleCheckCep: () => void;
  cepError: boolean;
  deliveryFee: number | null;
}

export default function ProductShippingCalculator({
  cep,
  setCep,
  loadingCep,
  handleCheckCep,
  cepError,
  deliveryFee,
}: ProductShippingCalculatorProps) {
  const formatMoney = (value: any): string => {
    const num =
      typeof value === "string"
        ? parseFloat(value.replace(/\./g, "").replace(",", "."))
        : Number(value);
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num);
  };

  return (
    <div className="mb-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon type="far" icon="fa-box" className="text-yellow-400" />
        <span className="font-bold text-zinc-900">Consulte o frete</span>
      </div>

      <div className="relative w-full">
        <input
          type="text"
          className="border rounded px-3 py-2 w-full pr-12"
          placeholder="Digite seu CEP"
          value={cep}
          onChange={(e) => setCep(formatCep(e.target.value))}
          onBlur={handleCheckCep}
          maxLength={9}
          disabled={loadingCep}
        />

        <Button
          type="button"
          loading={loadingCep}
          className="absolute top-1/2 right-2 -translate-y-1/2 bg-zinc-200 border rounded flex items-center justify-center px-3 py-1 hover:bg-zinc-300 transition-all"
          disable={loadingCep}
          onClick={handleCheckCep}
          style="height: 80%; width: 2.5rem;"
          aria-label="Buscar CEP"
        >
          {loadingCep ? (
            <svg
              className="animate-spin h-5 w-5 text-zinc-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          ) : (
            <span className="flex items-center justify-center w-full h-full">
              <Icon icon="fa-search" className="text-zinc-600 text-base" />
            </span>
          )}
        </Button>
      </div>

      {cepError && (
        <div className="text-red-500 text-sm mt-2">
          Infelizmente, a entrega deste produto não está disponível para sua
          região.
        </div>
      )}

      {!cepError && !!deliveryFee && deliveryFee > 0 && (
        <div className="flex gap-2 flex-col text-sm mt-2">
          <div>
            <Icon
              icon="fa-truck"
              type="far"
              className="text-yellow-400 text-base"
            />{" "}
            <span className="font-bold">Normal</span>
          </div>
          <span className="text-zinc-600 text-sm">
            Frete: R$ {formatMoney(deliveryFee)}.
          </span>
        </div>
      )}

      {!cepError && deliveryFee === 0 && (
        <div className="flex gap-2 flex-col text-sm mt-2">
          <div>
            <Icon
              icon="fa-truck"
              type="far"
              className="text-yellow-400 text-base"
            />
            <span className="text-green-600 text-sm ml-2 font-bold">
              Frete Grátis
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
