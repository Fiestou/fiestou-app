"use client";

import React from "react";
import UnavailableDates from "@/src/components/ui/form/UnavailableDates";

interface ProductType {
  unavailableDates?: string[];
  schedulingPeriod?: number;
}

interface UnavailablePeriodsProps {
  data: ProductType;
  handleData: (updated: Partial<ProductType>) => void;
  productId?: number | string;
}

const UnavailablePeriods: React.FC<UnavailablePeriodsProps> = ({
  data,
  handleData,
  productId,
}) => {
  return (
    <div>
      <p className="text-sm text-zinc-500 mb-4">
        Selecione as datas em que o produto não estará disponível para locação.
      </p>
      <UnavailableDates
        initialDates={data?.unavailableDates}
        onChange={(dates) => handleData({ unavailableDates: dates })}
        minDate={new Date()}
        schedulingPeriod={data?.schedulingPeriod}
        productId={productId}
      />
    </div>
  );
};
export default UnavailablePeriods;
