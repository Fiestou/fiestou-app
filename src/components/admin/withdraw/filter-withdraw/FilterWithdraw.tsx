import { useState } from "react";
import Icon from "@/src/icons/fontAwesome/FIcon";

interface FilterWithdrawProps {
  value: string; // valor atual do filtro
  onChange: (newValue: string) => void; // callback para o pai
}

export default function FilterWithdraw({ value, onChange }: FilterWithdrawProps) {
  const [open, setOpen] = useState(false);

  const options = [
    { label: "Todos", value: "todos" },
    { label: "Aprovado", value: "1" },
    { label: "Em análise", value: "0" },
    { label: "Negado", value: "2" },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="rounded-xl whitespace-nowrap border py-4 text-zinc-900 font-semibold px-8 flex items-center"
      >
        Filtrar
        <Icon icon="fa-chevron-down" type="far" className="text-xs ml-2" />
      </button>

      {open && (
        <div className="absolute mt-2 bg-white shadow-xl rounded-xl w-full z-10 border p-2">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value);
                setOpen(false);
              }}
              className={`w-full text-left px-4 py-2 rounded-md hover:bg-zinc-100 ${
                value === opt.value ? "bg-zinc-200 font-semibold" : ""
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
