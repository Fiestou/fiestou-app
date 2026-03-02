import { useMemo } from "react";
import Icon from "@/src/icons/fontAwesome/FIcon";

interface QtdType {
  value: number;
  min?: number;
  max?: number;
  emitQtd: Function;
  className?: string;
}

export default function QtdInput(attr: QtdType) {
  const minValue = useMemo(() => {
    const parsed = Number(attr?.min ?? 0);
    return Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  }, [attr?.min]);

  const maxValue = useMemo(() => {
    const parsed = Number(attr?.max);
    if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
    return Math.max(minValue, parsed);
  }, [attr?.max, minValue]);

  const quantity = useMemo(() => {
    const parsed = Number(attr?.value ?? 0);
    if (!Number.isFinite(parsed)) return minValue;
    if (maxValue !== undefined) return Math.min(maxValue, Math.max(minValue, parsed));
    return Math.max(minValue, parsed);
  }, [attr?.value, minValue, maxValue]);

  const normalize = (value: number) => {
    const parsed = Number.isFinite(value) ? Math.floor(value) : minValue;
    const nonNegative = Math.max(minValue, parsed);
    return maxValue !== undefined ? Math.min(maxValue, nonNegative) : nonNegative;
  };

  const emit = (value: number) => {
    attr.emitQtd(normalize(value));
  };

  const onUp = () => {
    emit(quantity + 1);
  };

  const onDown = () => {
    emit(quantity - 1);
  };

  const onChange = (value: number) => {
    emit(value);
  };

  return (
    <div className={`w-full border rounded ${attr?.className}`}>
      <div className="flex px-2 py-1">
        <button
          type="button"
          onClick={onDown}
          disabled={quantity <= minValue}
        >
          <Icon icon="fa-minus" className="text-cyan-500" />
        </button>
        <div className="w-full grid">
          <input
            type="text"
            onChange={(e: any) => onChange(parseInt(e.target.value, 10))}
            value={!!quantity ? quantity : 0}
            className="text-center w-full appearance-none"
          />
        </div>
        <button
          type="button"
          onClick={onUp}
          disabled={maxValue !== undefined && quantity >= maxValue}
        >
          <Icon icon="fa-plus" className="text-cyan-500" />
        </button>
      </div>
    </div>
  );
}
