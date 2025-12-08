import { moneyFormat } from "@/src/helper";

interface CartAttributesProps {
  attributes: any[];
  size?: "small" | "medium";
}

export default function CartAttributes({ attributes, size = "medium" }: CartAttributesProps) {
  const attributesWithSelected = attributes
    .map((attr: any) => ({
      ...attr,
      selectedVariations: (attr.variations || []).filter((v: any) => v.quantity > 0)
    }))
    .filter((attr: any) => attr.selectedVariations.length > 0);

  if (attributesWithSelected.length === 0) return null;

  const styles = {
    small: {
      container: "mt-2 pt-2 border-t border-zinc-100",
      attrTitle: "text-[9px] font-bold text-zinc-700 mb-1",
      item: "ml-1 mb-1",
      itemTitle: "text-[10px] text-zinc-600",
      unitPrice: "text-zinc-500 font-medium whitespace-nowrap text-[9px]",
      qty: "text-[9px] text-zinc-500 ml-3 mt-0.5",
      total: "text-cyan-600 font-semibold"
    },
    medium: {
      container: "mt-2 pt-2 border-t border-zinc-100",
      attrTitle: "text-[10px] font-bold text-zinc-700 mb-1",
      item: "ml-1 mb-1",
      itemTitle: "text-[11px] text-zinc-600",
      unitPrice: "text-zinc-500 font-medium whitespace-nowrap text-[10px]",
      qty: "text-[10px] text-zinc-500 ml-3 mt-0.5",
      total: "text-cyan-600 font-semibold"
    }
  };

  const s = styles[size];

  return (
    <div className={s.container}>
      {attributesWithSelected.map((attr: any, attrIdx: number) => (
        <div key={attrIdx} className="mb-2 last:mb-0">
          <p className={s.attrTitle}>{attr.title}</p>
          {attr.selectedVariations.map((variation: any, varIdx: number) => {
            const price = variation.price || variation.priceValue || 0;
            const numPrice = typeof price === 'string' ? parseFloat(price.replace(',', '.')) : Number(price);
            const quantity = variation.quantity || 1;
            const totalPrice = numPrice * quantity;

            return (
              <div key={varIdx} className={s.item}>
                <div className={`flex justify-between items-center gap-2 ${s.itemTitle}`}>
                  <span className="flex items-center gap-1">
                    <span className="text-zinc-400">•</span>
                    <span>{variation.title}</span>
                  </span>
                  {numPrice > 0 && (
                    <span className={s.unitPrice}>
                      R$ {moneyFormat(numPrice)}
                    </span>
                  )}
                </div>
                {quantity > 1 && numPrice > 0 && (
                  <div className={`flex justify-between items-center gap-2 ${s.qty}`}>
                    <span>Qtd: {quantity}</span>
                    <span className={s.total}>
                      R$ {moneyFormat(totalPrice)}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
