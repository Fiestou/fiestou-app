import { Button } from "../../../../ui/form";

export default function Footer({
  count, onClear, onSubmit,
}: { count: number; onClear: () => void; onSubmit?: () => void; }) {
  return (
    <div className="flex justify-between items-center pt-4 w-full bg-white">
      <Button type="button" className="text-sm" style="btn-link" onClick={onClear} >
        Limpar filtro
      </Button>
      <Button type="button" onClick={onSubmit}>
        Ver resultados {!!count && `(${count})`}
      </Button>
    </div>
  );
}
