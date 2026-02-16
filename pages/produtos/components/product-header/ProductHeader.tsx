import { ProductType } from "@/src/models/product";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Badge from "@/src/components/utils/Badge";

interface ProductHeaderProps {
  product: ProductType;
  comments: any[];
}

export default function ProductHeader({ product, comments }: ProductHeaderProps) {
  return (
    <div className="flex flex-wrap items-center py-4 md:pb-6 gap-4">
      {!!product?.rate && (
        <div className="flex gap-1 items-center">
          <Icon icon="fa-star" type="fa" className="text-xs text-yellow-500" />
          <span className="font-bold text-zinc-900">{product.rate}</span>
          <span className="text-xs">
            {comments.length}
            {comments.length > 1 ? " avaliações" : " avaliação"}
          </span>
        </div>
      )}

      {product?.fragility === "yes" && (
        <div className="bg-yellow-100 border border-yellow-300 px-2 py-1 rounded-md flex items-center gap-1.5">
          <Icon icon="fa-wine-glass-alt" type="fas" className="text-yellow-600" />
          <span className="text-yellow-800 text-sm font-medium">Material Frágil</span>
        </div>
      )}

      {(() => {
        const labels: Record<string, string> = {
          venda: "Venda",
          aluguel: "Aluguel",
          comestivel: "Comestível",
          servicos: "Serviços",
        };
        const ct = product?.comercialType as string;
        if (!ct) return null;
        return <Badge style="light">{labels[ct] || ct}</Badge>;
      })()}
    </div>
  );
}
