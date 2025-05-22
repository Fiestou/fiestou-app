import Icon from "@/src/icons/fontAwesome/FIcon";

interface OptionType {
  name?: string;
  value: any;
  disabled?: boolean;
  icon?: string;
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
      <div className="relative bg-white">
        <Icon
          icon="fa-chevron-down"
          className="text-xs absolute right-0 top-1/2 -translate-y-1/2 pr-2"
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
          defaultValue={attr?.value}
          onChange={(e) => (!!attr?.onChange ? attr?.onChange(e) : {})}
          {...(!!attr?.required ? { required: true } : {})}
        >
          {!!attr?.placeholder ? (
            <option value="">{attr?.placeholder}</option>
          ) : (
            <></>
          )}

          {!!attr.options.length &&
            attr.options.map((item, key) => (
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
