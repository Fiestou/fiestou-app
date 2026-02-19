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

function parseObject(value: any): Record<string, any> {
  if (!value) return {};
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? parsed
        : {};
    } catch {
      return {};
    }
  }
  return typeof value === "object" && !Array.isArray(value) ? value : {};
}

export default function OrderItemCard({ item, onRate }: OrderItemCardProps) {
  const metadata = parseObject(item?.metadata);
  const rawItem = parseObject(metadata?.raw_item);
  const rawProduct = parseObject(rawItem?.product);
  const metadataProduct = parseObject(metadata?.product);
  const directProduct = parseObject((item as any)?.product);

  const productData = {
    ...rawProduct,
    ...metadataProduct,
    ...directProduct,
  };

  const productId =
    Number(
      (item as any)?.productId ??
        (item as any)?.product_id ??
        productData?.id ??
        rawItem?.product_id
    ) || 0;

  const quantity =
    Number((item as any)?.quantity ?? rawItem?.quantity ?? 1) || 1;
  const unitPrice =
    Number(
      (item as any)?.unitPrice ??
        (item as any)?.unit_price ??
        rawItem?.unit_price ??
        rawItem?.unitPrice ??
        0
    ) || 0;

  const itemName =
    (item as any)?.name ||
    (item as any)?.title ||
    productData?.title ||
    productData?.name ||
    "Produto";

  const imageUrl =
    getImage(productData?.gallery, "thumb") ||
    getImage(productData?.image, "thumb") ||
    getImage(rawProduct?.gallery, "thumb") ||
    getImage(rawProduct?.image, "thumb") ||
    "";

  return (
    <div>
      <div className="flex items-center gap-6">
        <div className="w-fit">
          <div className="aspect-square bg-zinc-200 w-[6rem] rounded-xl">
            {!!imageUrl && (
              <Img
                src={imageUrl}
                className="w-full h-full object-cover rounded-xl"
              />
            )}
          </div>
        </div>
        <div className="grid gap-1 w-full">
          <div className="font-title text-lg font-bold text-zinc-900">
            {productId ? (
              <Link href={`/produtos/${productId}`}>{itemName}</Link>
            ) : (
              <span>{itemName}</span>
            )}
          </div>
          <div className="text-sm">
            <div>
              Quantidade: {quantity} | Valor unitário: R$ {moneyFormat(unitPrice)}
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
                  href={getStoreUrl(productData.store as any)}
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
          {!!item.metadata?.details && typeof item.metadata.details === 'string' && (
            <div className="mt-2 text-xs text-zinc-500 italic">
              {item.metadata.details}
            </div>
          )}

          {onRate && (
            <div className="mt-2">
              <Button
                type="button"
                onClick={() =>
                  onRate({
                    ...productData,
                    id: productId || (item as any)?.productId,
                  })
                }
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
