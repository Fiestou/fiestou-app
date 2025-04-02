import { useEffect, useState } from "react";

interface InputType {
  name?: string;
  onChange?: Function;
  onKeyUp?: Function;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: Function;
  prevent?: boolean;
  type?: string;
  className?: string;
  id?: string;
  defaultValue?: string | number;
  value?: string | number;
  placeholder?: string;
  placeholderStyle?: string;
  errorMessage?: string | boolean;
  focus?: any;
  help?: string;
  required?: boolean;
  readonly?: boolean;
  min?: string | number;
  max?: string | number;
  size?: number;
}

export default function Input(attr: InputType) {
  const onKeyUp = !!attr?.onKeyUp ? attr?.onKeyUp : attr?.onChange;
  const onBlur = !!attr?.onBlur ? attr?.onBlur : attr?.onChange;

  return (
    <>
      <input
        name={attr?.name}
        id={attr?.id ?? attr?.name}
        type={attr?.type ?? "text"}
        placeholder={attr?.placeholder}
        readOnly={attr?.readonly}
        className={`${attr?.className ?? ""} ${
          attr?.errorMessage
            ? "border-red-500 placeholder-red-300"
            : attr?.placeholderStyle ?? "placeholder-zinc-300"
        } form-control ease ${
          !!attr?.readonly
            ? "opacity-50 bg-zinc-100 placeholder-zinc-500"
            : "focus:border-zinc-800  hover:border-zinc-400"
        }`}
        {...(!!attr?.defaultValue
          ? { defaultValue: attr?.defaultValue }
          : !!attr?.value
          ? { value: attr?.value ?? "" }
          : {})}
        {...(!!attr?.min ? { min: attr?.min } : {})}
        {...(!!attr?.max ? { max: attr?.max } : {})}
        {...(!!attr?.size ? { size: attr?.size } : {})}
        {...(!!attr?.focus ? { focus: attr?.focus } : {})}
        onChange={(e) => (!!attr?.onChange ? attr?.onChange(e) : {})}
        onKeyUp={(e) => (!!onKeyUp && !attr?.prevent ? onKeyUp(e) : {})}
        onKeyPress={(e) => (attr?.onKeyPress ? attr?.onKeyPress(e) : {})}
        onBlur={(e) => (!!onBlur && !attr?.prevent ? onBlur(e) : {})}
        {...(!!attr?.required ? { required: true } : {})}
      />
      {attr?.help && (
        <div className="text-zinc-400 text-xs pt-[2px]">{attr?.help}</div>
      )}
      {attr?.errorMessage && (
        <div className="text-red-500 text-xs pt-1 font-semibold">
          {attr?.errorMessage}
        </div>
      )}
    </>
  );
}
