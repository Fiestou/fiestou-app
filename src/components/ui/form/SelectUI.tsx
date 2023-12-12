interface OptionType {
  name?: string;
  value: any;
}

interface SelectType {
  name: string;
  onChange?: Function;
  options: Array<OptionType>;
  className?: string;
  id?: string;
  value?: any;
  placeholder?: string;
  errorMessage?: string | boolean;
  required?: boolean;
  disabled?: boolean;
}

export default function Select(attr: SelectType) {
  return (
    <>
      <select
        name={attr?.name}
        id={attr?.id ?? attr?.name}
        placeholder={attr?.placeholder}
        disabled={attr?.disabled}
        className={`${attr?.className} ${
          attr?.errorMessage ? "border-red-500 placeholder-red-300" : ""
        } form-control focus:border-zinc-800 hover:border-zinc-400 ${
          !!attr?.disabled
            ? "opacity-50 bg-zinc-100 placeholder-zinc-500"
            : "focus:border-zinc-800  hover:border-zinc-400"
        } ease`}
        defaultValue={attr?.value}
        onChange={(e) => (!!attr?.onChange ? attr?.onChange(e) : {})}
        {...(!!attr?.required ? { required: true } : {})}
      >
        {!!attr?.placeholder ?? <option value="">{attr?.placeholder}</option>}

        {attr.options &&
          attr.options.map((item, key) => (
            <option key={key} value={item.value ?? item.name}>
              {item.name}
            </option>
          ))}
      </select>
      {attr?.errorMessage && (
        <div className="text-red-500 text-xs pt-1 font-semibold">
          {attr?.errorMessage}
        </div>
      )}
    </>
  );
}
