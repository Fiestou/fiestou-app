import { moneyFormat } from "@/src/helper";

interface OrderItem {
  name?: string;
  quantity: number;
  unitPrice: number;
  addons?: Array<{
    name: string;
    quantity: number;
    price: number;
    total?: number;
  }>;
  metadata?: {
    product?: {
      name?: string;
      title?: string;
    };
  };
}

interface OrderTotalSectionProps {
  items: OrderItem[];
  subtotal: number;
  deliveryPrice?: number;
  total: number;
}

export default function OrderTotalSection({
  items,
  subtotal,
  deliveryPrice,
  total,
}: OrderTotalSectionProps) {
  return (
    <div className="grid gap-2">
      <div className="text-zinc-900 font-bold mb-2">Total da compra</div>
      <div className="grid gap-2 text-sm">
        {/* Itens do pedido */}
        {items.map((item, idx) => {
          const productData = item?.metadata?.product || item;
          const itemName = (productData as any)?.name || (productData as any)?.title || item.name || 'Produto';
          return (
            <div key={idx}>
              <div className="flex gap-2">
                <div className="w-full">
                  {item.quantity > 1 ? `${item.quantity}x ` : ''}{itemName}
                </div>
                <div className="whitespace-nowrap">
                  R$ {moneyFormat(item.unitPrice * item.quantity)}
                </div>
              </div>
              {/* Adicionais do item */}
              {item.addons && item.addons.length > 0 && item.addons.map((addon, addonIdx) => (
                <div key={addonIdx} className="flex gap-2 text-zinc-500 pl-3">
                  <div className="w-full text-xs">
                    + {addon.quantity > 1 ? `${addon.quantity}x ` : ''}{addon.name}
                  </div>
                  <div className="whitespace-nowrap text-xs">
                    R$ {moneyFormat(addon.total || (addon.price * addon.quantity))}
                  </div>
                </div>
              ))}
            </div>
          );
        })}

        <div className="border-t border-dashed border-zinc-300 my-1"></div>

        <div className="flex gap-2">
          <div className="w-full">Subtotal</div>
          <div className="whitespace-nowrap">
            R$ {moneyFormat(subtotal)}
          </div>
        </div>
        <div className="flex gap-2">
          <div className="w-full">Frete</div>
          <div className="whitespace-nowrap">
            {deliveryPrice ? `R$ ${moneyFormat(deliveryPrice)}` : "Grátis"}
          </div>
        </div>
      </div>
    </div>
  );
}
