export default function Price({ price, promotionalPrice }: PriceProps) {
  return (
    <div className="mb-4">
      {promotionalPrice && promotionalPrice < price ? (
        <div>
          <span className="text-gray-400 line-through mr-2">{formatCurrency(price)}</span>
          <span className="text-2xl font-semibold">{formatCurrency(promotionalPrice)}</span>
          <span className="ml-3 text-sm text-green-600">-{Math.round((1 - promotionalPrice/price)*100)}%</span>
        </div>
      ) : (
        <div className="text-2xl font-semibold">{formatCurrency(price)}</div>
      )}
    </div>
  );
}
import { formatCurrency } from '../../utils/Currency';

type PriceProps = {
  price: number;
  promotionalPrice?: number | null;
  priceFormatted?: string; // opcional se quiser usar helper
  currency?: string; // "BRL"
};