import { Label } from "../../../../ui/form";
// import { moneyFormat } from "@/src/helper";

export default function PriceRange({
  value, onChange, min = 10, max = 1000, step = 10,
}: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number; }) {
  return (
    <div className="pb-6">
      <Label>Faixa de preço</Label>
      <div className="grid gap-2 py-1">
        <div className="text-sm">Exibir produtos até R$ {value /* moneyFormat(value) */}</div>
        <div>
          <div className="flex text-sm justify-between">
            <span>R$ {min}</span><span>R$ {max}</span>
          </div>
          <div className="range-control">
            <input
              defaultValue={value}
              min={min} max={max} step={step}
              type="range" name="range" className="w-full"
              onChange={(e) => onChange(parseInt(e.target.value, 10))}
            />
            <span style={{ width: `${(100 * value) / max}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
