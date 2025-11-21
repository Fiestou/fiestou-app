import { ProductType } from "@/src/models/product";
import Product from "./Product";
import { ColorsList, ColorfulRender } from "@/src/components/ui/form/ColorsUI";

interface SuggestedProductsProps {
  products: ProductType[];
  colors: string[];
  title?: string;
}

export default function SuggestedProducts({
  products,
  colors,
  title = "Você também pode gostar",
}: SuggestedProductsProps) {
  if (!products || products.length === 0) return null;

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
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <h2 className="text-xl font-semibold font-title">{title}</h2>
        {selectedColors.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-zinc-500">Produtos com as cores:</span>
            <div className="flex gap-1">
              {selectedColors.map((color: any, index: number) => (
                <div
                  key={index}
                  className="p-1 border border-zinc-200 rounded-md"
                  title={color.value}
                >
                  {ColorfulRender(color)}
                </div>
              ))}
            </div>
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
