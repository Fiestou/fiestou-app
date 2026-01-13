import Icon from "@/src/icons/fontAwesome/FIcon";
import Img from "@/src/components/utils/ImgBase";
import { moneyFormat } from "@/src/helper";

export type DeliverySummaryEntry = {
  storeId: number | null;
  storeName: string;
  storeSlug?: string;
  price: number;
  storeLogoUrl?: string | null;
};

interface DeliveryPriceSummaryProps {
  entries: DeliverySummaryEntry[];
  missingStoresNames: string[];
  formattedZip: string;
  loading: boolean;
}

export default function DeliveryPriceSummary({
  entries,
  missingStoresNames,
  formattedZip,
  loading,
}: DeliveryPriceSummaryProps) {
  if (!formattedZip && entries.length === 0) {
    return (
      <span className="text-sm text-zinc-500">
        Informe um CEP válido para calcular o frete.
      </span>
    );
  }

  if (loading) {
    return <span className="text-sm text-zinc-500">Calculando frete...</span>;
  }

  if (!entries.length) {
    return (
      <span className="text-sm text-red-500">
        Não conseguimos calcular o frete para este CEP.
      </span>
    );
  }

  return (
    <div className="grid gap-2">
      {entries.map((entry) => {
        const initials = entry.storeName
          .split(" ")
          .filter(Boolean)
          .slice(0, 2)
          .map((word) => word[0]?.toUpperCase())
          .join("");

        return (
          <div
            key={entry.storeId ?? entry.storeName}
            className="flex items-center justify-between gap-3 rounded border border-dashed border-zinc-200 px-3 py-2 bg-white"
          >
            <div className="flex items-center gap-3 min-w-0">
              {entry.storeLogoUrl ? (
                <Img
                  src={entry.storeLogoUrl}
                  alt={entry.storeName}
                  className="w-8 h-8 rounded-full object-cover border border-zinc-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-200 text-xs font-semibold flex items-center justify-center text-zinc-600">
                  {initials || "?"}
                </div>
              )}
              <span className="truncate text-zinc-700">{entry.storeName}</span>
            </div>
            <div className="flex items-center gap-2 font-semibold text-zinc-900">
              <Icon icon="fa-truck" className="text-sm text-yellow-600" />
              <span>R$ {moneyFormat(entry.price)}</span>
            </div>
          </div>
        );
      })}

      {!!missingStoresNames.length && (
        <span className="text-xs text-red-500">
          Ainda precisamos do frete para: {missingStoresNames.join(", ")}.
        </span>
      )}
    </div>
  );
}
