"use client";

import Icon from "@/src/icons/fontAwesome/FIcon";

type TrustedPartnerBadgeProps = {
  icon?: string;
  iconType?: "fa" | "far" | "fas";
  color?: string;
  title?: string;
  description?: string;
};

export default function TrustedPartnerBadge({
  icon = "fa-badge-check",
  iconType = "fa",
  color = "text-yellow-400",
  title = "Parceiro confiável:",
  description = "Garantia do Fiestou da entrega.",
}: TrustedPartnerBadgeProps) {
  return (
    <div className="flex gap-2 items-center">
      <div className="w-[1.25rem] flex justify-center">
        <Icon icon={icon} type={iconType} className={`${color} text-base`} />
      </div>
      <div>
        <strong className="text-zinc-950">{title}</strong> {description}
      </div>
    </div>
  );
}
