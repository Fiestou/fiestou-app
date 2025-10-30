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
        <Badge style="light">
          <Icon icon="fa-fragile" type="far" /> Atenção! Material Frágil
        </Badge>
      )}

      <Badge style="light">
        {(product?.comercialType ?? "")
          .charAt(0)
          .toUpperCase() + (product?.comercialType ?? "").slice(1)}
      </Badge>
    </div>
  );
}
