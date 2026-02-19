import Img from "@/src/components/utils/ImgBase";
import Link from "next/link";
import { getImage } from "@/src/helper";

function parseGallery(value: any): any[] {
  if (Array.isArray(value)) return value;
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  if (value && typeof value === "object") {
    return Object.values(value);
  }
  return [];
}

export const OrderItemsList = ({ products }: { products: Array<any> }) => {
  return (
    <div className="grid pb-4 md:pb-8">
      <h4 className="text-xl md:text-2xl text-zinc-800">Itens do pedido</h4>

      {products?.map((product: any, key: number) => {
        const gallery = parseGallery(product?.gallery);
        const imageUrl =
          getImage(product?.gallery, "thumb") ||
          getImage(gallery?.[0], "thumb") ||
          getImage(product?.image, "thumb") ||
          "";
        const productId = Number(product?.id) || 0;

        return (
          <div key={key} className="py-6">
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
                    <Link href={`/produtos/${productId}`}>{product.title}</Link>
                  ) : (
                    <span>{product.title}</span>
                  )}
                </div>

                <div className="text-sm">
                  {!!product.sku && (
                    <>
                      sku #{product.sku} <br />
                    </>
                  )}
                  Fornecido por:
                  <div className="text-zinc-900 pl-2 inline-block font-semibold underline">
                    {product?.store?.title}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
