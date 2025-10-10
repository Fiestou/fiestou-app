"use client";

import React, { useState } from "react";
import { Label } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import UnavailableDates from "@/src/components/ui/form/UnavailableDates";

interface ProductType {
  unavailableDates?: string[]; // ou Date[] dependendo de como você armazena
}

interface UnavailablePeriodsProps {
  data: ProductType;
  handleData: (updated: Partial<ProductType>) => void;
}

const UnavailablePeriods: React.FC<UnavailablePeriodsProps> = ({
  data,
  handleData,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Atualiza o estado no componente pai sempre que o usuário alterar as datas
  const handleUnavailableDatesChange = (dates: string[] | Date[]) => {
    handleData({ unavailableDates: dates as string[] });
  };

  return (
    <div className="border-t pt-4 pb-2">
      <h4 className="text-2xl text-zinc-900 mb-2">
        Períodos de Indisponibilidade
      </h4>

      <div className="grid gap-2">
        <div className="form-group">
          <Label>
            Selecione as datas em que o produto não estará disponível.
            <div className="relative inline-block ml-2">
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                onClick={() => setShowTooltip((prev) => !prev)}
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <Icon icon="fa-exclamation-circle" className="text-sm" />
              </button>

              {showTooltip && (
                <div className="absolute left-0 bottom-full mb-2 z-50 w-64 p-3 bg-gray-600 text-white text-xs rounded-lg shadow-lg whitespace-normal break-words">
                  <div className="relative">
                    Essa funcionalidade é indicada para quando o produto é alugado fora da
                    plataforma Fiestou.
                    <div className="absolute top-full right-4 w-2 h-2 bg-gray-600 transform rotate-45 translate-y-[-1px]"></div>
                  </div>
                </div>
              )}
            </div>
          </Label>

          <UnavailableDates
            initialDates={data?.unavailableDates}
            onChange={handleUnavailableDatesChange}
            minDate={new Date()}
          />
        </div>
      </div>
    </div>
  );
};
export default UnavailablePeriods;