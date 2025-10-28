"use client";

import Calendar from "@/src/components/ui/form/CalendarUI";
import { ProductType } from "@/src/models/product";
import { dateBRFormat } from "@/src/helper";

interface ProductDeliveryCalendarProps {
  product: ProductType;
  productToCart: { details?: { dateStart?: string } } | null;
  unavailable?: Array<string>;
  blockdate?: Array<string>;
  handleDetails: (date: any) => void;
  productUpdated?: { title?: string };
}

export default function ProductDeliveryCalendar({
  product,
  productToCart,
  unavailable = [],
  blockdate = [],
  handleDetails,
  productUpdated,
}: ProductDeliveryCalendarProps) {
  if (!productToCart) return null;

  return (
    <div className="md:flex justify-between items-end gap-2">
      <div className="w-full">
        <h4 className="font-title text-zinc-900 font-bold py-4 text-sm md:text-lg">
          Para quando você precisa?
        </h4>
        <div className="calendar relative">
          <div className="text-xs m-4">
            {!!productToCart?.details?.dateStart
              ? dateBRFormat(productToCart?.details?.dateStart)
              : "Selecione a data:"}
          </div>
          <Calendar
            required
            unavailable={unavailable}
            blockdate={blockdate}
            onChange={handleDetails}
            availability={product?.availability ?? 1}
          />
          {!productUpdated?.title && (
            <div className="absolute z-10 bg-white opacity-60 w-full h-full top-0 left-0"></div>
          )}
        </div>
      </div>
    </div>
  );
}
