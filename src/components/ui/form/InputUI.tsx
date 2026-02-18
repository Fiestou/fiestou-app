import React from "react";

interface InputType extends React.InputHTMLAttributes<HTMLInputElement> {
  prevent?: boolean;
  placeholderStyle?: string;
  errorMessage?: string | boolean;
  help?: string;
  readOnly?: boolean;
}

export default function Input(attr: InputType) {
  const hasControlledValue = Object.prototype.hasOwnProperty.call(attr, "value");
  const valueProps = hasControlledValue
    ? { value: attr.value ?? "" }
    : { defaultValue: attr.defaultValue };

  return (
    <>
      <input
        name={attr.name}
        id={attr.id ?? attr.name}
        type={attr.type ?? "text"}
        placeholder={attr.placeholder}
        readOnly={attr.readOnly}
        className={`
          w-full rounded-md border border-zinc-300 px-4 py-3
          font-sans text-base leading-relaxed text-zinc-900
          placeholder:font-sans placeholder:text-base placeholder:leading-relaxed placeholder:text-zinc-400
          ${attr.className ?? ""}
          ${
            attr.errorMessage
              ? "border-red-500 placeholder:text-red-300"
              : attr.placeholderStyle ?? ""
          }
          ${
            attr.readOnly
              ? "opacity-50 bg-zinc-100 placeholder:text-zinc-500"
              : "focus:border-zinc-800 hover:border-zinc-400"
          }
        `}
        {...valueProps}
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
