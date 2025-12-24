import Link from "next/link";
import { ProductType } from "@/src/models/product";
import { StoreType } from "@/src/models/store";
import { RelationType } from "@/src/models/relation";
import { getStoreUrl } from "@/src/urlHelpers";
import { ColorfulRender, ColorsList } from "@/src/components/ui/form/ColorsUI";

interface ProductDetailsProps {
  product: ProductType;
  store: StoreType;
  categories: any[];
  mobileMode?: boolean;
}

export default function ProductDetails({
  product,
  store,
  categories,
  mobileMode = false,
}: ProductDetailsProps) {
  return (
    <div className={mobileMode ? "block" : "hidden"}>
      <div className="text-sm grid gap-1">
        {/* Loja */}
        <div className="text-zinc-900">
          Fornecido por:{" "}
          <Link href={getStoreUrl(store)} className="font-bold hover:underline">
            {store?.title}
          </Link>
        </div>

        {/* Montagem */}
        <div>
          Este parceiro {product?.assembly === "on" ? "" : "não"} disponibiliza
          montagem
        </div>

        <div className="py-2">
          <div className="border-t border-dashed" />
        </div>

        <div className="grid gap-3">
          {/* Cores */}
          {!!product?.color && (
            <div className="flex items-center gap-3 text-zinc-900">
              <div className="w-fit whitespace-nowrap">Cores:</div>
              <div className="w-full flex items-center flex-wrap gap-1">
                {ColorsList.map(
                  (color) =>
                    product.color?.includes(color.value) && (
                      <Link
                        key={color.value}
                        href={`/produtos/listagem/?cores=${color.value}`}
                      >
                        {ColorfulRender(color)}
                      </Link>
                    )
                )}
              </div>
            </div>
          )}

          {/* Categorias */}
          <div className="w-fit whitespace-nowrap">Categorias:</div>

          {!!categories?.length &&
            categories.map(
              (category: any) =>
                !!category?.childs &&
                category.childs.some((child: any) =>
                  (product?.category ?? []).some(
                    (cat: any) => cat.id === child.id
                  )
                ) && (
                  <div key={category.id} className="flex gap-2 text-zinc-950">
                    <div className="w-full flex items-center flex-wrap gap-1">
                      {category.childs
                        .filter((child: any) =>
                          (product?.category ?? []).some(
                            (cat: any) => cat.id === child.id
                          )
                        )
                        .map((child: RelationType) => (
                          <Link
                            key={child.id}
                            href={`/produtos/listagem/?categoria=${child.slug}`}
                            className="bg-zinc-100 hover:bg-zinc-200 py-1 px-2 rounded ease"
                          >
                            {child.title}
                          </Link>
                        ))}
                    </div>
                  </div>
                )
            )}

          {/* Tags */}
          {!!product?.tags && (
            <div className="flex items-center gap-1 text-zinc-900">
              <div className="w-fit whitespace-nowrap">Tags:</div>
              <div className="w-full flex items-center flex-wrap gap-1">
                {product.tags
                  .split(",")
                  .filter(Boolean)
                  .map((tag) => (
                    <Link
                      key={tag}
                      href={`/produtos/listagem/?busca=${tag}`}
                      className="bg-zinc-100 hover:bg-zinc-200 py-1 px-2 rounded ease"
                    >
                      {tag}
                    </Link>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
