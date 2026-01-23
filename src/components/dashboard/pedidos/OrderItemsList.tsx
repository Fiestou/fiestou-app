import Img from "@/src/components/utils/ImgBase";
import Link from "next/link";
import { getImage } from "@/src/helper";

export const OrderItemsList = ({ products }: { products: Array<any> }) => {
  return (
    <div className="grid pb-4 md:pb-8">
      <h4 className="text-xl md:text-2xl text-zinc-800">Itens do pedido</h4>

      {products?.map((product: any, key: number) => {
        const gallery = Array.isArray(product.gallery)
          ? product.gallery
          : JSON.parse(product.gallery ?? "[]");

        return (
          <div key={key} className="py-6">
            <div className="flex items-center gap-6">
              <div className="w-fit">
                <div className="aspect-square bg-zinc-200 w-[6rem] rounded-xl">
                  {gallery.length > 0 && (
                    <Img
                      src={getImage(gallery[0]?.url, "thumb")}
                      className="w-full h-full object-contain"
                    />
                  )}
                </div>
              </div>

              <div className="grid gap-1 w-full">
                <div className="font-title text-lg font-bold text-zinc-900">
                  <Link href={`/produtos/${product.id}`}>{product.title}</Link>
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
