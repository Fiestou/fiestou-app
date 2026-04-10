export default function PromotionToggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="pb-6">
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`w-full rounded-2xl border px-4 py-3 text-left transition-colors ${
          checked
            ? "border-emerald-200 bg-emerald-50"
            : "border-zinc-200 bg-white"
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-900">
              Somente produtos em promoção
            </div>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Mostra só itens com preço promocional ativo.
            </p>
          </div>
          <span
            className={`mt-0.5 inline-flex h-6 min-w-[2.75rem] items-center rounded-full px-1 transition-colors ${
              checked ? "bg-emerald-500 justify-end" : "bg-zinc-300 justify-start"
            }`}
          >
            <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
          </span>
        </div>
      </button>
    </div>
  );
}
