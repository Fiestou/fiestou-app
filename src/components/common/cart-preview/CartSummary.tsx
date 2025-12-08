import { moneyFormat } from "@/src/helper";

interface CartSummaryProps {
  cart: any[];
  totalValue: number;
  totalDeliveryFee: number;
  isMobile?: boolean;
}

export default function CartSummary({
  cart,
  totalValue,
  totalDeliveryFee,
  isMobile = false
}: CartSummaryProps) {
  // Calcula total de adicionais
  const calculateAddons = () => {
    let totalAddons = 0;
    cart.forEach((item: any) => {
      if (item.attributes && Array.isArray(item.attributes)) {
        item.attributes.forEach((attr: any) => {
          (attr.variations || []).forEach((v: any) => {
            if (v.quantity > 0 && v.price) {
              const price = typeof v.price === 'string' ? parseFloat(v.price.replace(',', '.')) : Number(v.price);
              totalAddons += price * (v.quantity || 1) * (item.quantity || 1);
            }
          });
        });
      }
    });
    return totalAddons;
  };

  const totalAddons = calculateAddons();
  const totalWithDelivery = totalValue + totalDeliveryFee;

  return (
    <div className="space-y-2 mb-3">
      {/* Subtotal */}
      <div className="flex justify-between items-center">
        <span className="text-sm text-zinc-600">Subtotal:</span>
        <span className="text-sm font-semibold text-zinc-900">
          R$ {moneyFormat(totalValue)}
        </span>
      </div>

      {/* Adicionais */}
      {totalAddons > 0 && (
        <div className="flex justify-between items-center">
          <span className="text-sm text-zinc-600">Adicionais:</span>
          <span className="text-sm font-semibold text-cyan-600">
            R$ {moneyFormat(totalAddons)}
          </span>
        </div>
      )}

      {/* Total de frete */}
      {totalDeliveryFee > 0 && (
        <>
          <div className="flex justify-between items-center">
            <span className="text-sm text-zinc-600">Total Frete:</span>
            <span className="text-sm font-semibold text-cyan-600">
              R$ {moneyFormat(totalDeliveryFee)}
            </span>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-zinc-300">
            <span className="text-sm font-bold text-zinc-700">Total:</span>
            <span className="text-lg font-bold text-cyan-600">
              R$ {moneyFormat(totalWithDelivery)}
            </span>
          </div>
        </>
      )}

      {/* Total sem frete */}
      {totalDeliveryFee === 0 && (
        <div className="flex justify-between items-center pt-2 border-t border-zinc-300">
          <span className="text-sm font-bold text-zinc-700">Total:</span>
          <span className="text-lg font-bold text-zinc-900">
            R$ {moneyFormat(totalValue)}
          </span>
        </div>
      )}
    </div>
  );
}
