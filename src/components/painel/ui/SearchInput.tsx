import { useEffect, useRef, useState } from "react";
import { Search, X } from "lucide-react";

type SearchInputProps = {
  placeholder?: string;
  value?: string;
  onChange: (value: string) => void;
  debounce?: number;
  className?: string;
};

export default function SearchInput({
  placeholder = "Buscar...",
  value: controlledValue,
  onChange,
  debounce = 300,
  className = "",
}: SearchInputProps) {
  const [internal, setInternal] = useState(controlledValue || "");
  const timer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (controlledValue !== undefined) setInternal(controlledValue);
  }, [controlledValue]);

  const handleChange = (val: string) => {
    setInternal(val);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => onChange(val), debounce);
  };

  const clear = () => {
    setInternal("");
    onChange("");
  };

  return (
    <div className={`relative ${className}`}>
      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
      <input
        type="text"
        value={internal}
        onChange={(e) => handleChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-zinc-200 rounded-lg
          placeholder:text-zinc-400 text-zinc-900 outline-none
          focus:ring-2 focus:ring-yellow-400/30 focus:border-yellow-400 transition-all"
      />
      {internal && (
        <button
          onClick={clear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
        >
          <X size={14} />
        </button>
      )}
    </div>
  );
}
