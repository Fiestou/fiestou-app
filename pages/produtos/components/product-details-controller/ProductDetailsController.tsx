import { dateFormat } from "@/src/helper";
import { ProductOrderType } from "@/src/models/product";

interface DetailsType {
  dateStart?: Date;
  dateEnd?: Date;
  days?: number;
  schedulingDiscount?: number;
  [key: string]: any;
}

interface Props {
  product: any;
  setProductToCart: React.Dispatch<React.SetStateAction<ProductOrderType>>;
  updateOrderTotal: (order: ProductOrderType) => void;
  onDateSelected: (selected: boolean) => void;
  onHandleDetailsReady: (fn: (detail: DetailsType) => void) => void;
}

export default function ProductDetailsController({
  product,
  setProductToCart,
  updateOrderTotal,
  onDateSelected,
  onHandleDetailsReady,
}: Props) {
  const handleDetails = (detail: DetailsType) => {
    setProductToCart((prev) => {
      const mergedDetails = { ...(prev.details ?? {}), ...detail };

      let days = 1;
      const start = mergedDetails.dateStart
        ? new Date(mergedDetails.dateStart)
        : null;
      const end = mergedDetails.dateEnd
        ? new Date(mergedDetails.dateEnd)
        : null;

      if (start && end) {
        days = Math.max(
          1,
          Math.round(
            Math.abs(end.getTime() - start.getTime()) / (24 * 60 * 60 * 1000)
          )
        );
      }

      onDateSelected(!!mergedDetails.dateStart);

      const updatedOrder: ProductOrderType = {
        ...prev,
        details: {
          ...mergedDetails,
          dateStart: dateFormat(mergedDetails.dateStart),
          dateEnd: dateFormat(mergedDetails.dateEnd),
          days,
          schedulingDiscount: product?.schedulingDiscount,
        },
      };

      updateOrderTotal(updatedOrder);
      return updatedOrder;
    });
  };

  // 🔥 entrega a função pro pai
  onHandleDetailsReady(handleDetails);

  return null; // não renderiza nada
}
