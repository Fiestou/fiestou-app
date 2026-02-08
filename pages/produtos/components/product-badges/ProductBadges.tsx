"use client";

import Icon from "@/src/icons/fontAwesome/FIcon";
import Badge from "@/src/components/utils/Badge";
import { ProductType, CommentType } from "@/src/models/product";

interface ProductBadgesProps {
  product: ProductType;
  comments: CommentType[];
}

export default function ProductBadges({
  product,
  comments,
}: ProductBadgesProps) {
  if (!product) return null;

  return (
    <div className="flex flex-col items-start py-2 md:pb-4 gap-1">
      {/* Avaliações */}
      {!!product.rate && (
        <div className="flex gap-1 items-center">
          <Icon icon="fa-star" type="fa" className="text-xs text-yellow-500" />
          <span className="font-bold text-zinc-900">{product.rate}</span>
          <span className="text-xs">
            {comments.length}
            {comments.length > 1 ? " avaliações" : " avaliação"}
          </span>
        </div>
      )}

      {/* Produto frágil */}
      {product.fragility === "yes" && (
        <div className="bg-yellow-100 border border-yellow-300 px-2 py-1 rounded-md flex items-center gap-1.5">
          <Icon icon="fa-wine-glass-alt" type="fas" className="text-yellow-600" />
          <span className="text-yellow-800 text-sm font-medium">Atenção! Material Frágil</span>
        </div>
      )}

      {/* Tipo comercial */}
      <div className="flex gap-1">
        <span>Disponível para:</span>

        {(product.comercialType as string) === "venda" && (
          <Badge
            style="light"
            className="bg-red-200 px-1 flex gap-1 items-center"
          >
            <Icon icon="fa-tag" className="text-xs" type="far" />
            <span>Venda</span>
          </Badge>
        )}

        {(product.comercialType as string) === "aluguel" && (
          <Badge
            style="light"
            className="bg-blue-200 px-1 flex gap-1 items-center"
          >
            <Icon icon="fa-clock" className="text-xs" type="far" />
            <span>Aluguel</span>
          </Badge>
        )}
      </div>
    </div>
  );
}
