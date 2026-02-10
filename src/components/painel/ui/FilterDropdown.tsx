import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

type FilterOption = {
  label: string;
  value: string;
};

type FilterDropdownProps = {
  label: string;
  options: FilterOption[];
  value?: string;
  onChange: (value: string) => void;
  className?: string;
};

export default function FilterDropdown({
  label,
  options,
  value,
  onChange,
  className = "",
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2.5 text-sm bg-white border border-zinc-200 rounded-lg
          hover:border-zinc-300 transition-colors text-zinc-700"
      >
        <span className="text-zinc-400">{label}:</span>
        <span className="font-medium">{selected?.label || "Todos"}</span>
        <ChevronDown size={14} className={`text-zinc-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-zinc-200 rounded-lg shadow-lg z-20 py-1">
          <button
            onClick={() => { onChange(""); setOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-zinc-50 transition-colors
              ${!value ? "text-yellow-700 font-medium" : "text-zinc-700"}`}
          >
            Todos
            {!value && <Check size={14} className="text-yellow-600" />}
          </button>
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-zinc-50 transition-colors
                ${value === opt.value ? "text-yellow-700 font-medium" : "text-zinc-700"}`}
            >
              {opt.label}
              {value === opt.value && <Check size={14} className="text-yellow-600" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
