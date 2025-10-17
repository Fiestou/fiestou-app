import React, {
  useEffect,
  useState,
  forwardRef,
  useImperativeHandle,
} from "react";
import { Input, Button } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";

type Props = {
  count: number;
  stick: boolean;
  filterAreaRef: React.RefObject<HTMLDivElement>;
  busca?: string;
  onOpenFilters: () => void;
  onSearch: (value: string) => void;
};

export type InputSearchStoreRef = {
  triggerSearch: (value?: string) => void;
};

const InputSearchStore = forwardRef<InputSearchStoreRef, Props>(
  ({ count, stick, filterAreaRef, busca, onOpenFilters, onSearch }, ref) => {
    const [search, setSearch] = useState(busca ?? "");

    useEffect(() => {
      setSearch(busca ?? "");
    }, [busca]);

    const handleSubmit = () => {
      onSearch(search.trim());
    };

    useEffect(() => {
      if (search.trim() === "") {
        onSearch("");
      }
    }, [search]);

    useImperativeHandle(ref, () => ({
      triggerSearch: (value?: string) => {
        if (value) setSearch(value);
        onSearch((value ?? search).trim());
      },
    }));

    return (
      <div className="w-full flex gap-4">
        <div className="w-full relative">
          <Input
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearch(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder="Pesquisar..."
            className="h-full w-full"
          />
          <button
            type="button"
            onClick={handleSubmit}
            className="absolute right-0 top-0 h-full px-4 py-2"
          >
            <Icon icon="fa-search" className="text-zinc-900" type="far" />
          </button>
        </div>

        <div>
          <Button
            type="button"
            onClick={onOpenFilters}
            style="btn-outline-light"
            className="whitespace-nowrap relative z-10 border text-zinc-900 font-semibold px-8"
          >
            Filtrar <Icon icon="fa-sliders-h" className="ml-1" />
            {count > 0 && (
              <div className="absolute bg-yellow-300 text-zinc-950 top-0 right-0 translate-x-1/2 -translate-y-1/2 p-3 rounded-full">
                <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-xs">
                  {count}
                </span>
              </div>
            )}
          </Button>
        </div>
      </div>
    );
  }
);

InputSearchStore.displayName = "InputSearchStore";
export default InputSearchStore;
