import Icon from "@/src/icons/fontAwesome/FIcon";
import { useEffect, useState } from "react";

export type OptionType = {
  value: string;
  name: string | React.ReactNode; // ← permitir ReactNode
  disabled?: boolean;
  icon?: string;
};

interface SelectDropdownType {
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

export default function SelectDropdown(attr: SelectDropdownType) {
  const handleSelected = (value: string) => {
    !!attr?.onChange ? attr?.onChange(value) : {};

    const activeElement = document.activeElement as HTMLElement;
    if (activeElement?.blur) {
      activeElement.blur();
    }
  };

  return (
    <>
      <div
        className={`group relative bg-white focus-within:z-100 ${
          attr.className || ""
        }`}
      >
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded="false"
          className="text-sm cursor-pointer p-3 min-h-[46px] form-control relative"
        >
          {!!attr.options.length &&
            attr.options
              .filter((item) => item.value === attr.value)
              .map((item, key) => (
                <div key={key} className="flex items-center gap-2">
                  {item.icon && (
                    <Icon icon={item.icon} className="w-[1rem] h-[1rem]" />
                  )}
                  <span>{item.name}</span>
                </div>
              ))}
          <div className="cursor-pointer text-xs absolute group-focus-within:z-10 right-0 top-1/2 -translate-y-1/2 pr-2">
            <Icon
              icon={"fa-chevron-up"}
              className={`hidden group-focus-within:block`}
              type="far"
            />
            <Icon
              icon={"fa-chevron-down"}
              className={`block group-focus-within:hidden`}
              type="far"
            />
          </div>
        </button>
        <ul
          role="listbox"
          className="hidden group-focus-within:grid absolute bg-white text-sm rounded-md shadow-md w-full p-2 z-10"
        >
          {!!attr.options.length &&
            attr.options.map((item, key) => (
              <li
                tabIndex={0}
                role="option"
                onClick={() => {
                  handleSelected(item.value);
                }}
                key={key}
                className="p-1 flex items-center gap-1 cursor-pointer rounded hover:bg-gray-100"
              >
                {item.icon && (
                  <Icon icon={item.icon} className="w-[1rem] h-[1rem]" />
                )}
                <span>{item.name}</span>
              </li>
            ))}
        </ul>
      </div>

      {attr?.errorMessage && (
        <div className="text-red-500 text-xs pt-1 font-semibold">
          {attr?.errorMessage}
        </div>
      )}
    </>
  );
}
