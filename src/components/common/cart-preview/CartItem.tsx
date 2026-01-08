import Icon from "@/src/icons/fontAwesome/FIcon";
import Img from "@/src/components/utils/ImgBase";
import { getImage, moneyFormat } from "@/src/helper";
import CartAttributes from "./CartAttributes";

interface CartItemProps {
  item: any;
  index: number;
  onRemove: (index: number) => void;
  size?: "small" | "medium";
  showRemoveButton?: boolean;
}

export default function CartItem({
  item,
  index,
  onRemove,
  size = "medium",
  showRemoveButton = true,
}: CartItemProps) {
  const product = item.product || {};
  const store = product.store || {};

  const deliveryFeeValue = Number(item?.details?.deliveryFee);
  const hasDeliveryFee =
    Number.isFinite(deliveryFeeValue) && deliveryFeeValue > 0;
  const rawDeliveryZip =
    item.details?.deliveryZipCode ??
    item.details?.deliveryZipCodeFormatted ??
    "";
  const formattedDeliveryZip = rawDeliveryZip
    ? rawDeliveryZip.toString().replace(/^(\d{5})(\d{3})$/, "$1-$2")
    : "";

  const imageSize = size === "small" ? "w-20 h-20" : "w-20 h-20";
  const titleSize = size === "small" ? "text-sm" : "text-sm";
  const detailsSize = size === "small" ? "text-xs" : "text-xs";

  return (
    <div
      className={`p-4 border-b border-zinc-100 ${
        size === "medium" ? "hover:bg-zinc-50" : ""
      } relative `}
    >
      <button
        onClick={() => onRemove(index)}
        className={`absolute top-2 right-2 w-${
          size === "small" ? "8" : "6"
        } h-${
          size === "small" ? "8" : "6"
        } bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center z-10`}
        title="Remover item"
      >
        <Icon icon="fa-trash-alt" className="text-xs" />
      </button>

      <div className="flex gap-3">
        {/* Imagem */}
        <div className={`${imageSize} bg-zinc-100 rounded flex-shrink-0`}>
          {product.gallery?.[0] && (
            <Img
              src={getImage(product.gallery[0], "sm")}
              className="w-full h-full object-contain rounded"
            />
          )}
        </div>

        {/* Detalhes */}
        <div className="flex-1 min-w-0">
          <h5
            className={`font-semibold ${titleSize} text-zinc-900 line-clamp-2 pr-6`}
          >
            {product.title || "Produto"}
          </h5>

          {/* Loja */}
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
              <p className={`${detailsSize} text-cyan-600 truncate`}>
                {store.companyName}
              </p>
            </div>
          )}

          {/* Atributos/Adicionais */}
          {item.attributes &&
            Array.isArray(item.attributes) &&
            item.attributes.length > 0 && (
              <CartAttributes attributes={item.attributes} size={size} />
            )}

          {/* Quantidade e Preço */}
          <div className="flex items-center justify-between mt-2">
            <p className={`${detailsSize} text-zinc-500`}>
              Qtd: {item.quantity || 1}
            </p>
            <p className={`${titleSize} font-bold text-zinc-900`}>
              R$ {moneyFormat(item.total || 0)}
            </p>
          </div>

          {/* Frete */}
          {hasDeliveryFee && (
            <div className="mt-2 pt-2 border-t border-zinc-100">
              <div
                className={`flex justify-between items-center ${detailsSize}`}
              >
                <div className="flex flex-col gap-0.5">
                  <span className="text-zinc-500">Frete</span>
                  {formattedDeliveryZip && (
                    <span className="text-zinc-400 text-[10px]">
                      CEP: {formattedDeliveryZip}
                    </span>
                  )}
                </div>
                <span className="text-cyan-600 font-medium">
                  R$ {moneyFormat(deliveryFeeValue)}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
