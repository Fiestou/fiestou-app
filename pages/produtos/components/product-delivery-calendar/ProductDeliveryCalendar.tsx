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
  required?: boolean;
}

export default function ProductDeliveryCalendar({
  product,
  productToCart,
  unavailable = [],
  blockdate = [],
  handleDetails,
}: ProductDeliveryCalendarProps) {
  if (!productToCart) return null;

  const hasSelectedDate = !!productToCart?.details?.dateStart;

  return (
    <div className="md:flex justify-between items-end gap-2">
      <div className="w-full">
        <h4 className="font-title text-zinc-900 font-bold py-4 text-sm md:text-lg">
          Para quando você precisa?
        </h4>

        <div
          className={`calendar relative rounded-lg border transition-colors
            ${
              hasSelectedDate
                ? "border-yellow-400 bg-yellow-50"
                : "border-zinc-300 bg-zinc-100"
            }
          `}
        >
          {/* <div
            className={`text-xs m-4 font-medium
              ${
                hasSelectedDate
                  ? "text-yellow-700"
                  : "text-zinc-500"
              }
            `}
          >
            {hasSelectedDate
              ? dateBRFormat(productToCart.details!.dateStart!)
              : "Selecione a data:"}
          </div> */}

          <Calendar
            required
            unavailable={unavailable}
            blockdate={blockdate}
            onChange={handleDetails}
            availability={product?.availability ?? 1}
          />
        </div>
      </div>
    </div>
  );
}
