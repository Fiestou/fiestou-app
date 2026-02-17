import { ProductType } from "@/src/models/product";
import Product from "./Product";
import { ColorsList, ColorfulRender } from "@/src/components/ui/form/ColorsUI";
import Img from "@/src/components/utils/ImgBase";

interface CategoryFilter {
  name: string;
  icon?: string;
}

interface ActiveFilters {
  colors?: string[];
  categories?: CategoryFilter[];
  tags?: string[];
}

interface SuggestedProductsProps {
  products: ProductType[];
  filters: ActiveFilters;
  title?: string;
}

export default function SuggestedProducts({
  products,
  filters,
  title = "Você também pode gostar",
}: SuggestedProductsProps) {
  if (!products || products.length === 0) return null;

  const { colors = [], categories = [], tags = [] } = filters;
  const hasFilters = colors.length > 0 || categories.length > 0 || tags.length > 0;

  // Encontra os objetos de cor correspondentes aos nomes
  const selectedColors = colors
    .map((colorName) =>
      ColorsList.find(
        (c) => c.value.toLowerCase() === colorName.toLowerCase()
      )
    )
    .filter(Boolean);

  return (
    <section className="container-medium py-8 border-t border-zinc-200 mt-8">
      <div className="flex flex-col gap-3 mb-6">
        <h2 className="text-xl font-semibold font-title">{title}</h2>

        {hasFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-zinc-500">Produtos com:</span>

            {/* Cores */}
            {selectedColors.length > 0 && (
              <div className="flex items-center gap-1">
                {selectedColors.map((color: any, index: number) => (
                  <div
                    key={`color-${index}`}
                    className="p-1 border border-zinc-200 rounded-md"
                    title={color.value}
                  >
                    {ColorfulRender(color)}
                  </div>
                ))}
              </div>
            )}

            {/* Categorias */}
            {categories.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {categories.map((cat, index) => (
                  <span
                    key={`cat-${index}`}
                    className="px-2 py-1 text-sm border border-zinc-200 bg-white text-zinc-700 rounded-lg flex items-center gap-1.5"
                  >
                    {cat.icon && (
                      <Img
                        src={cat.icon}
                        alt={cat.name}
                        className="w-4 h-4 object-contain"
                      />
                    )}
                    {cat.name}
                  </span>
                ))}
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag, index) => (
                  <span
                    key={`tag-${index}`}
                    className="px-2 py-1 text-sm border border-zinc-200 bg-white text-zinc-700 rounded-lg"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.slice(0, 8).map((item, key) => (
          <div key={key}>
            <Product product={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
