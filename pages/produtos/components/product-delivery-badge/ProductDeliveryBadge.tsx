"use client";

import Icon from "@/src/icons/fontAwesome/FIcon";
import { ProductType } from "@/src/models/product";

interface ProductDeliveryBadgeProps {
  product: ProductType;
  productToCart: { total: number } | null;
}

export default function ProductDeliveryBadge({ product, productToCart }: ProductDeliveryBadgeProps) {
  const availability = product?.availability ?? 1;
  const deliveryType = product?.delivery_type ?? "delivery";

  if (!productToCart?.total) return null;

  if (deliveryType === "pickup") {
    return (
      <div className="bg-white relative w-full mb-6">
        <div className="leading-tight w-full">
          <div className="flex gap-2 items-center mb-2">
            <div className="w-[1.25rem] flex justify-center">
              <Icon icon="fa-store" type="far" className="text-blue-500 text-base" />
            </div>
            <strong className="text-zinc-950">Retirada na loja</strong>
          </div>
          <p>Esse produto deve ser retirado na loja do parceiro.</p>
        </div>
      </div>
    );
  }

  if (deliveryType === "both") {
    return (
      <div className="bg-white relative w-full mb-6">
        <div className="leading-tight w-full">
          <div className="flex gap-2 items-center mb-2">
            <div className="w-[1.25rem] flex justify-center">
              <Icon icon="fa-truck" type="far" className="text-yellow-400 text-base" />
            </div>
            <strong className="text-zinc-950">Entrega ou Retirada</strong>
          </div>
          <p>
            Entrega em até <strong>{availability}</strong> dia{availability > 1 ? "s" : ""} ou retire na loja.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white relative w-full mb-6">
      <div className="leading-tight w-full">
        {availability >= 1 && (
          <div className="flex gap-2 items-center mb-2">
            <div className="w-[1.25rem] flex justify-center">
              <Icon icon="fa-truck" type="far" className="text-yellow-400 text-base" />
            </div>
            <strong className="text-zinc-950">Entrega</strong>
          </div>
        )}
        <p>
          Esse produto é entregue em até <strong>{availability}</strong> dia
          {availability > 1 ? "s" : ""}.
        </p>
      </div>
    </div>
  );
}
