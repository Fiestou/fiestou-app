import React, { useState, useEffect, useRef } from "react";
import Icon from "@/src/icons/fontAwesome/FIcon";

interface OptionType {
  name?: string;
  value: any;
}

interface SelectType {
  name: string;
  onChange?: (value: any) => void;
  options: Array<OptionType>;
  className?: string;
  id?: string;
  value?: any;
  placeholder?: string;
  errorMessage?: string | boolean;
  required?: boolean;
  disabled?: boolean;
  isMulti?: boolean;
}

export default function MultiSelect(attr: SelectType) {
  const isMulti = !!attr.isMulti;
  const [selected, setSelected] = useState<any[]>(
    isMulti && Array.isArray(attr.value) ? attr.value : []
  );
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isMulti && Array.isArray(attr.value)) {
      setSelected(attr.value);
    }
  }, [attr.value, isMulti]);

  useEffect(() => {
    if (!dropdownOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const handleSelectOption = (value: any) => {
    let newSelected;
    if (selected.includes(value)) {
      newSelected = selected.filter((v) => v !== value);
    } else {
      newSelected = [...selected, value];
    }
    setSelected(newSelected);
    attr.onChange && attr.onChange(newSelected);
  };

  const handleRemove = (value: any) => {
    const newSelected = selected.filter((v) => v !== value);
    setSelected(newSelected);
    attr.onChange && attr.onChange(newSelected);
  };

  const getOptionName = (value: any) => {
    const found = attr.options.find((opt) => opt.value === value);
    return found ? found.name : value;
  };

  // Para modo simples, usar select nativo
  if (!isMulti) {
    return (
      <>
        <div className="relative bg-white">
          <Icon
            icon="fa-chevron-down"
            className="text-xs absolute right-0 top-1/2 -translate-y-1/2 pr-2 pointer-events-none"
            type="far"
          />
          <select
            name={attr?.name}
            id={attr?.id ?? attr?.name}
            disabled={attr?.disabled}
            className={`relative appearance-none bg-transparent ${
              attr?.className
            } ${
              attr?.errorMessage ? "border-red-500 placeholder-red-300" : ""
            } form-control focus:border-zinc-800 hover:border-zinc-400 ${
              !!attr?.disabled
                ? "opacity-50 bg-zinc-100 placeholder-zinc-500"
                : "focus:border-zinc-800  hover:border-zinc-400"
            } ease`}
            value={attr?.value}
            onChange={e => attr.onChange && attr.onChange(e.target.value)}
            {...(!!attr?.required ? { required: true } : {})}
          >
            {!!attr?.placeholder && (
              <option value="">{attr?.placeholder}</option>
            )}
            {attr.options.map((item, key) => (
              <option key={key} value={item.value ?? item.name}>
                {item.name}
              </option>
            ))}
          </select>
        </div>
        {attr?.errorMessage && (
          <div className="text-red-500 text-xs pt-1 font-semibold">
            {attr?.errorMessage}
          </div>
        )}
      </>
    );
  }

  // Modo multi customizado
  return (
    <>
      <div
        ref={wrapperRef}
        className={`relative bg-white border rounded px-2 py-1 flex items-center min-h-[46px] ${
          attr?.errorMessage ? "border-red-500" : "border-zinc-300"
        } ${attr?.className ?? ""} ${
          !!attr?.disabled ? "opacity-50 bg-zinc-100" : ""
        }`}
        tabIndex={0}
        style={{ cursor: attr?.disabled ? "not-allowed" : "pointer" }}
        onClick={() => !attr?.disabled && setDropdownOpen((open) => !open)}
      >
        {selected.length > 0 ? (
          <div className="flex flex-wrap gap-2 items-center flex-1">
            {selected.map((val) => (
              <span
                key={val}
                className="inline-flex items-center gap-1 bg-yellow-300 rounded px-2 py-1 text-xs font-medium"
              >
                {getOptionName(val)}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); handleRemove(val); }}
                  className="ml-1 text-xs hover:text-zinc-600 focus:outline-none"
                  tabIndex={-1}
                >
                  <Icon icon="fa-times" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <span className="text-zinc-400 text-sm flex-1 select-none">
            {attr?.placeholder}
          </span>
        )}
        <Icon
          icon="fa-chevron-down"
          className="text-xs absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none"
          type="far"
        />
        {dropdownOpen && (
          <div className="absolute left-0 top-full mt-1 w-full bg-white border border-zinc-200 rounded shadow-lg z-10 max-h-60 overflow-auto">
            {attr.options.length === 0 && (
              <div className="px-4 py-2 text-zinc-400 text-sm">Sem opções</div>
            )}
            {attr.options.map((item, key) => {
              const isSelected = selected.includes(item.value);
              return (
                <div
                  key={key}
                  className={`px-4 py-2 cursor-pointer flex items-center gap-2 hover:bg-theme-yellow-100 ${
                    isSelected ? "bg-theme-yellow-200" : ""
                  }`}
                  onClick={e => {
                    e.stopPropagation();
                    handleSelectOption(item.value);
                  }}
                >
                  <span className={`relative w-4 h-4 flex items-center justify-center rounded border border-zinc-300 ${isSelected ? "bg-yellow-300" : "bg-white"}`}>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="absolute w-full h-full opacity-0 cursor-pointer"
                    />
                    {isSelected && (
                      <Icon icon="fa-check" className="text-xs text-zinc-800" />
                    )}
                  </span>
                  <span>{item.name}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {attr?.errorMessage && (
        <div className="text-red-500 text-xs pt-1 font-semibold">
          {attr?.errorMessage}
        </div>
      )}
    </>
  );
}
