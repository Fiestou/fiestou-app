import { Step } from "../helpers";

interface Props {
  steps: Step[];
  currentIndex: number;
}

export default function StepIndicator({ steps, currentIndex }: Props) {
  return (
    <>
      <div className="rounded-xl border border-zinc-200 bg-white px-4 py-3 sm:hidden">
        <div className="flex items-center justify-between gap-3">
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-400">
            Etapa {currentIndex + 1} de {steps.length}
          </span>
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-full bg-zinc-900 px-2 text-xs font-semibold text-white">
            {currentIndex + 1}
          </span>
        </div>
        <div className="mt-2 text-sm font-semibold text-zinc-900">
          {steps[currentIndex]?.label}
        </div>
      </div>

      <div className="hidden gap-2 sm:flex sm:flex-wrap sm:items-center">
        {steps.map((step, i) => (
          <div
            key={step.id}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
              i === currentIndex
                ? "border-zinc-900 bg-zinc-900/5"
                : i < currentIndex
                  ? "border-emerald-200 bg-emerald-50"
                  : "border-zinc-200 bg-white"
            }`}
          >
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${
                i === currentIndex ? "bg-zinc-900 text-white" : i < currentIndex ? "bg-green-500 text-white" : "bg-white text-zinc-600"
              }`}
            >
              {i + 1}
            </span>
            <span className={`min-w-0 break-words leading-tight ${i === currentIndex ? "font-semibold text-zinc-900" : i < currentIndex ? "text-emerald-700" : "text-zinc-500"}`}>
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
