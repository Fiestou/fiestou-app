"use client";

import Icon from "@/src/icons/fontAwesome/FIcon";
import Badge from "@/src/components/utils/Badge";
import { ProductType, CommentType } from "@/src/models/product";

interface ProductBadgesProps {
  product: ProductType;
  comments: CommentType[];
}

const typeConfig: Record<string, { bg: string; icon: string; label: string }> = {
  venda: { bg: "bg-red-200", icon: "fa-tag", label: "Venda" },
  aluguel: { bg: "bg-blue-200", icon: "fa-clock", label: "Aluguel" },
  comestivel: { bg: "bg-amber-200", icon: "fa-utensils", label: "Comestível" },
  servicos: { bg: "bg-purple-200", icon: "fa-briefcase", label: "Serviços" },
};

export default function ProductBadges({
  product,
  comments,
}: ProductBadgesProps) {
  if (!product) return null;

  const t = typeConfig[(product.comercialType as string)] || null;

  return (
    <div className="flex flex-col items-start py-2 md:pb-4 gap-1">
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

      {product.fragility === "yes" && (
        <div className="bg-yellow-100 border border-yellow-300 px-2 py-1 rounded-md flex items-center gap-1.5">
          <Icon icon="fa-wine-glass-alt" type="fas" className="text-yellow-600" />
          <span className="text-yellow-800 text-sm font-medium">Atenção! Material Frágil</span>
        </div>
      )}

      {t && (
        <div className="flex gap-1">
          <span>Disponível para:</span>
          <Badge
            style="light"
            className={`${t.bg} px-1 flex gap-1 items-center`}
          >
            <Icon icon={t.icon} className="text-xs" type="far" />
            <span>{t.label}</span>
          </Badge>
        </div>
      )}
    </div>
  );
}
