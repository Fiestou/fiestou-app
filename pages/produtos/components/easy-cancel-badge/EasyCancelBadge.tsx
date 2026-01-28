"use client";

import Icon from "@/src/icons/fontAwesome/FIcon";

export default function EasyCancelBadge() {
  return (
    <div className="flex gap-2 items-center">
      <div className="w-[1.25rem] flex justify-center">
        <Icon icon="fa-undo" type="far" className="text-yellow-400 text-base" />
      </div>
      <div>
        <strong className="text-zinc-950">Cancelamento fácil:</strong> 1 dia
        antes da entrega, pode cancelar o pedido.
      </div>
    </div>
  );
}
