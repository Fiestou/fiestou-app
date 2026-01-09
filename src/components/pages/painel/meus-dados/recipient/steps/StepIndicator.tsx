import { Step } from "../helpers";

interface Props {
  steps: Step[];
  currentIndex: number;
}

export default function StepIndicator({ steps, currentIndex }: Props) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {steps.map((step, i) => (
        <div key={step.id} className="flex items-center gap-2 text-sm">
          <span
            className={`w-6 h-6 rounded-full flex items-center justify-center border ${
              i === currentIndex ? "bg-zinc-900 text-white" : i < currentIndex ? "bg-green-500 text-white" : "bg-white text-zinc-600"
            }`}
          >
            {i + 1}
          </span>
          <span className={i === currentIndex ? "font-semibold" : "text-zinc-500"}>{step.label}</span>
          {i !== steps.length - 1 && <span className="text-zinc-300">/</span>}
        </div>
      ))}
    </div>
  );
}
