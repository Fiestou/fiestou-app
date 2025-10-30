import { Button } from "@/src/components/ui/form";

interface ProductQuantityProps {
  quantity: number;
  onChange: (value: number) => void;
}

export default function ProductQuantity({ quantity, onChange }: ProductQuantityProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        onClick={() => onChange(quantity - 1)}
        className="bg-zinc-200 hover:bg-zinc-300 px-3 py-1 rounded"
      >
        -
      </Button>
      <span className="w-8 text-center font-semibold">{quantity}</span>
      <Button
        type="button"
        onClick={() => onChange(quantity + 1)}
        className="bg-zinc-200 hover:bg-zinc-300 px-3 py-1 rounded"
      >
        +
      </Button>
    </div>
  );
}
