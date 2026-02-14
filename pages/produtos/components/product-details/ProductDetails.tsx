import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { ProductType } from "@/src/models/product";
import { StoreType } from "@/src/models/store";
import { RelationType } from "@/src/models/relation";
import { getStoreUrl } from "@/src/urlHelpers";
import { ColorfulRender, ColorsList } from "@/src/components/ui/form/ColorsUI";

interface ProductDetailsProps {
  product: ProductType;
  store: StoreType;
  categories: any[];
}

export default function ProductDetails({
  product,
  store,
  categories,
}: ProductDetailsProps) {
  const productCategories = categories
    .filter((category: any) =>
      category?.childs?.some((child: any) =>
        (product?.category ?? []).some((cat: any) => cat.id === child.id)
      )
    )
    .flatMap((category: any) =>
      category.childs.filter((child: any) =>
        (product?.category ?? []).some((cat: any) => cat.id === child.id)
      )
    );

  const productTags = product?.tags
    ? product.tags.split(",").filter(Boolean)
    : [];

  const productColors = product?.color
    ? ColorsList.filter((color) => product.color?.includes(color.value))
    : [];

  return (
    <div className="border rounded-lg p-3 space-y-2.5 text-sm">
      <div className="flex items-start gap-2">
        <Icon icon="fa-store" className="text-cyan-600 text-xs mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <span className="text-zinc-600">Fornecido por </span>
          <Link
            href={getStoreUrl(store)}
            className="font-semibold text-zinc-900 hover:text-cyan-600 transition"
          >
            {store?.title}
          </Link>
        </div>
      </div>

      {product?.assembly === "on" && (
        <div className="flex items-start gap-2">
          <Icon icon="fa-tools" className="text-cyan-600 text-xs mt-0.5 flex-shrink-0" />
          <span className="text-zinc-600">Montagem disponível</span>
        </div>
      )}

      {productColors.length > 0 && (
        <div className="flex items-start gap-2">
          <Icon icon="fa-paint-brush" className="text-cyan-600 text-xs mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-zinc-600 mb-1.5">Cores disponíveis:</div>
            <div className="flex flex-wrap gap-1.5">
              {productColors.map((color) => (
                <Link
                  key={color.value}
                  href={`/produtos/listagem/?cores=${color.value}`}
                  className="hover:scale-110 transition-transform"
                >
                  {ColorfulRender(color)}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {productCategories.length > 0 && (
        <div className="flex items-start gap-2">
          <Icon icon="fa-tags" className="text-cyan-600 text-xs mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-zinc-600 mb-1.5">Categorias:</div>
            <div className="flex flex-wrap gap-1.5">
              {productCategories.map((child: RelationType) => (
                <Link
                  key={child.id}
                  href={`/produtos/listagem/?categoria=${child.slug}`}
                  className="bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs py-1 px-2.5 rounded-full transition"
                >
                  {child.title}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {productTags.length > 0 && (
        <div className="flex items-start gap-2">
          <Icon icon="fa-bookmark" className="text-cyan-600 text-xs mt-0.5 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-zinc-600 mb-1.5">Tags:</div>
            <div className="flex flex-wrap gap-1.5">
              {productTags.map((tag) => (
                <Link
                  key={tag}
                  href={`/produtos/listagem/?busca=${tag}`}
                  className="bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-xs py-1 px-2.5 rounded-full transition"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
