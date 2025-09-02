import Icon from "@/src/icons/fontAwesome/FIcon";
import { iconsLib } from "@/src/icons/fontAwesome/fontAwesomeIcons";
import { useState } from "react";
import Button from "./ButtonUI";

interface SelectIconType {
  name: string;
  onChange?: Function;
  className?: string;
  id?: string;
  value?: string;
  placeholder?: string;
  errorMessage?: string | boolean;
  required?: boolean;
  disabled?: boolean;
}

export default function SelectIcon(attr: SelectIconType) {
  const [dropdown, setDropdown] = useState(false as boolean);

  const perPage = 72;
  const [page, setPage] = useState(0 as number);
  const [selected, setSelected] = useState(attr?.value ?? ("" as string));
  const handleSelected = (icon: string) => {
    setSelected(icon);
    if (!!attr?.onChange) attr?.onChange(icon);
  };

  return (
    <label className="relative group w-full block">
      <div className="flex h-[3.1rem] w-full rounded-md ease border border-zinc-300 focus:border-zinc-800 hover:border-zinc-400">
        <div className="w-full p-3 text-center">
          {attr?.placeholder ?? "Selecionar"}
        </div>
        {!!selected && (
          <div className="py-5 px-6 relative text-lg border-l">
            <Icon
              icon={selected}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            />
          </div>
        )}
        <input
          onFocus={() => setDropdown(true)}
          className="absolute top-0 left-0 w-full h-full opacity-0 cursor-pointer"
        />
      </div>
      {dropdown && (
        <div className="absolute hidden group-focus-within:block bottom-0 left-0 w-full">
          <div className="absolute top-0 left-0 w-full">
            <div className="border rounded-md p-4 bg-white -mt-1 mb-7">
              <div className="grid grid-cols-12 gap-2 mb-2">
                {Object.entries(iconsLib).map(
                  (icon: any, key: any) =>
                    key >= page * perPage &&
                    key < page * perPage + perPage && (
                      <Button
                        key={key}
                        type="button"
                        style="btn-light"
                        onClick={() => {
                          handleSelected(icon[0]);
                          setTimeout(() => setDropdown(false), 1);
                        }}
                        className="relative aspect-square p-0"
                      >
                        <Icon
                          icon={icon[0]}
                          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
                        />
                      </Button>
                    )
                )}
              </div>
              <div className="flex gap-2">
                {page > 0 && (
                  <Button
                    type="button"
                    style="btn-outline-light"
                    onClick={() => setPage(page - 1)}
                    className="py-3 w-full"
                  >
                    <Icon icon="fa-chevron-left" type="far" />
                  </Button>
                )}

                {page * perPage < Object.values(iconsLib).length && (
                  <Button
                    type="button"
                    style="btn-outline-light"
                    onClick={() => setPage(page + 1)}
                    className="py-3 w-full"
                  >
                    <Icon icon="fa-chevron-right" type="far" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </label>
  );
}
