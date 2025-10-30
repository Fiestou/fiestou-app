import Icon from "@/src/icons/fontAwesome/FIcon";

export default function ProductTrustBadges() {
  return (
    <div className="flex flex-col gap-2 text-xs border-t pt-4">
      <div className="flex gap-2 items-center">
        <div className="w-5 flex justify-center">
          <Icon icon="fa-shield-check" type="fa" className="text-yellow-400 text-base" />
        </div>
        <div>
          <strong className="text-zinc-950">Pagamento seguro:</strong>{" "}
          Receba o item no dia marcado ou devolvemos o dinheiro
        </div>
      </div>
    </div>
  );
}
