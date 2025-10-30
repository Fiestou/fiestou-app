"use client";

import Icon from "@/src/icons/fontAwesome/FIcon";

export default function SafePaymentBadge() {
  return (
    <div className="flex gap-2 items-center">
      <div className="w-[1.25rem] flex justify-center">
        <Icon
          icon="fa-shield-check"
          type="fa"
          className="text-yellow-400 text-base"
        />
      </div>
      <div>
        <strong className="text-zinc-950">Pagamento seguro:</strong>{" "}
        Receba o item no dia marcado ou devolvemos o dinheiro.
      </div>
    </div>
  );
}
