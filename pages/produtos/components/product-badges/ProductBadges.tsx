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
    <div className="flex flex-wrap items-center py-4 md:pb-6 gap-4">
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
        <Badge style="light">
          <Icon icon="fa-fragile" type="far" /> Atenção! Material Frágil
        </Badge>
      )}

      {/* Tipo comercial */}
      <div>
        <span>Disponível para:</span>
        <Badge style="light">
          {(product.comercialType as string).charAt(0).toUpperCase() +
            (product.comercialType as string).slice(1)}
        </Badge>
      </div>
    </div>
  );
}
