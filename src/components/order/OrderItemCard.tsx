import Link from "next/link";
import Img from "@/src/components/utils/ImgBase";
import { Button } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { getImage, moneyFormat } from "@/src/helper";
import { getStoreUrl } from "@/src/urlHelpers";

interface OrderItemCardProps {
  item: {
    productId?: number;
    name?: string;
    quantity: number;
    unitPrice: number;
    addons?: Array<{
      name: string;
      quantity: number;
      price: number;
      total?: number;
    }>;
    metadata?: {
      product?: {
        title?: string;
        sku?: string;
        gallery?: any[];
        store?: {
          title?: string;
          slug?: string;
        };
      };
      details?: string;
    };
  };
  onRate?: (product: any) => void;
}

export default function OrderItemCard({ item, onRate }: OrderItemCardProps) {
  const productData = item?.metadata?.product;

  return (
    <div>
      <div className="flex items-center gap-6">
        <div className="w-fit">
          <div className="aspect-square bg-zinc-200 w-[6rem] rounded-xl">
            {!!productData?.gallery?.length && (
              <Img
                src={getImage(productData.gallery[0], "thumb")}
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>
        <div className="grid gap-1 w-full">
          <div className="font-title text-lg font-bold text-zinc-900">
            <Link href={`/produtos/${item?.productId}`}>
              {item.name || productData?.title}
            </Link>
          </div>
          <div className="text-sm">
            <div>
              Quantidade: {item.quantity} | Valor unitário: R$ {moneyFormat(item.unitPrice)}
            </div>
            {!!productData?.sku && (
              <>
                sku #{productData.sku} <br />
              </>
            )}
            {productData?.store?.title && (
              <>
                Fornecido por:
                <Link
                  href={getStoreUrl(productData.store)}
                  className="text-zinc-900 pl-2 font-semibold underline"
                >
                  {productData.store.title}
                </Link>
              </>
            )}
          </div>

          {/* Adicionais/Extras do produto */}
          {!!item.addons && item.addons.length > 0 && (
            <div className="mt-3 bg-zinc-50 rounded-lg p-3">
              <div className="text-xs font-semibold text-zinc-600 mb-2">
                Adicionais:
              </div>
              <div className="grid gap-1">
                {item.addons.map((addon, addonKey) => (
                  <div key={addonKey} className="flex justify-between text-sm">
                    <span className="text-zinc-700">
                      {addon.quantity > 1 ? `${addon.quantity}x ` : ''}{addon.name}
                    </span>
                    <span className="text-zinc-900 font-medium">
                      + R$ {moneyFormat(addon.total || (addon.price * addon.quantity))}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Detalhes/Observações do item */}
          {!!item.metadata?.details && (
            <div className="mt-2 text-xs text-zinc-500 italic">
              {item.metadata.details}
            </div>
          )}

          {onRate && (
            <div className="mt-2">
              <Button
                type="button"
                onClick={() => onRate({ ...productData, id: item.productId })}
                style="btn-transparent"
                className="whitespace-nowrap text-sm font-semibold text-zinc-900 p-0 ease hover:text-yellow-500"
              >
                <Icon icon="fa-comment" />
                avaliar produto
              </Button>
            </div>
          )}
        </div>
      </div>
      <div className="py-6">
        <hr />
      </div>
    </div>
  );
}
