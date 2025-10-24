import React from "react";

interface InputType extends React.InputHTMLAttributes<HTMLInputElement> {
  prevent?: boolean;
  placeholderStyle?: string;
  errorMessage?: string | boolean;
  help?: string;
  readonly?: boolean;
}

export default function Input(attr: InputType) {
  return (
    <>
      <input
        name={attr.name}
        id={attr.id ?? attr.name}
        type={attr.type ?? "text"}
        placeholder={attr.placeholder}
        readOnly={attr.readOnly}
        className={`${attr.className ?? ""} ${
          attr.errorMessage
            ? "border-red-500 placeholder-red-300"
            : attr.placeholderStyle ?? "placeholder-zinc-300"
        } form-control ease ${
          attr.readOnly
            ? "opacity-50 bg-zinc-100 placeholder-zinc-500"
            : "focus:border-zinc-800 hover:border-zinc-400"
        }`}
        value={attr.value}
        defaultValue={attr.defaultValue}
        min={attr.min}
        max={attr.max}
        size={attr.size}
        required={attr.required}
        onChange={(e) => attr.onChange?.(e)}
        onKeyUp={(e) => (!attr.prevent ? attr.onKeyUp?.(e) : null)}
        onKeyPress={(e) => attr.onKeyPress?.(e)}
        onKeyDown={(e) => attr.onKeyDown?.(e)}
        onBlur={(e) => (!attr.prevent ? attr.onBlur?.(e) : null)}
      />

      {attr.help && (
        <div className="text-zinc-400 text-xs pt-[2px]">{attr.help}</div>
      )}
      {attr.errorMessage && (
        <div className="text-red-500 text-xs pt-1 font-semibold">
          {attr.errorMessage}
        </div>
      )}
    </>
  );
}

Input.displayName = "Input";

