import { Button } from "../../../../ui/form";

export default function Footer({
  count, onClear, onSubmit,
}: { count: number; onClear: () => void; onSubmit?: () => void; }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <Button
        type="button"
        className="text-sm justify-center sm:justify-start"
        style="btn-link"
        onClick={onClear}
      >
        Limpar filtro
      </Button>
      <Button
        type="button"
        onClick={onSubmit}
        className="w-full justify-center sm:w-auto"
      >
        Ver resultados {!!count && `(${count})`}
      </Button>
    </div>
  );
}
