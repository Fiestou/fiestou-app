import { useEffect, useState } from "react";
import Input from "./InputUI";
import Button from "./ButtonUI";
import Icon from "@/src/icons/fontAwesome/FIcon";

import { RelationType } from "@/src/models/relation";
import Img from "@/src/components/utils/ImgBase";
import { getImage } from "@/src/helper";

interface OptionsType {
  name: string;
  onChange?: (value: RelationType[]) => void;
  onSearch?: (value: string) => Promise<RelationType[] | void> | void;
  className?: string;
  id?: string;
  value?: RelationType[];
  list?: RelationType[];
  childs?: string;
  combinations?: string;
}

export default function Options(attrs: OptionsType) {
  const [dropdown, setDropdown] = useState(false);
  const [list, setList] = useState<RelationType[]>(Array.isArray(attrs.value) ? attrs.value : []);

  // ✅ Adiciona item sem mutar o array original
  const addList = (item: RelationType) => {
    setList((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      if (safePrev.find((itm) => itm.id === item.id)) return safePrev; // evita duplicata
      const updated = [...safePrev, item];
      attrs.onChange?.(updated);
      return updated;
    });
  };

  // ✅ Remove item pelo slug
  const removeItem = (remove: RelationType) => {
    setList((prev) => {
      const safePrev = Array.isArray(prev) ? prev : [];
      const updated = safePrev.filter((item) => item.slug !== remove.slug);
      attrs.onChange?.(updated);
      return updated;
    });
  };

  const renderCategoriesForm = (item: RelationType) => {
    const safeList = Array.isArray(list) ? list : [];
    const isSelected = safeList.some((itm) => itm.id === item.id);

    return (
      <div
        key={item.id}
        className={`${
          isSelected ? "opacity-50" : ""
        } hover:bg-zinc-100 cursor-pointer flex items-center gap-2 p-2`}
        onClick={() => addList(item)}
      >
        {!!getImage(item?.image) ? (
          <div className="p-4 relative">
            <Img
              src={getImage(item?.image)}
              className="h-full w-full object-contain absolute inset-0"
            />
          </div>
        ) : (
          <div className="pl-1" />
        )}
        <div className="w-full">{item?.title}</div>
      </div>
    );
  };

  // ✅ Atualiza lista quando props mudam
  useEffect(() => {
    if (Array.isArray(attrs.value)) {
      setList(attrs.value);
    } else {
      setList([]);
    }
  }, [attrs.value]);

  return (
    <div className="rounded-md border border-zinc-300 relative">
      <div className="flex flex-wrap gap-1 p-1">
        <input
          type="text"
          className="p-2 rounded-md w-full"
          placeholder="Selecione suas opções"
          onFocus={() => setDropdown(true)}
          onBlur={() => setTimeout(() => setDropdown(false), 120)}
          onChange={async (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;

            if (attrs.onSearch) {
              const result = await attrs.onSearch(value);
              if (Array.isArray(result)) {
                setDropdown(true);
              }
            }
          }}
        />

        {/* ✅ Renderização segura da lista */}
        {Array.isArray(list) &&
          list.map((item: RelationType, key: number) => (
            <div
              key={key}
              className="bg-zinc-100 border border-zinc-300 px-4 py-2 rounded-md items-center w-fit flex gap-3"
            >
              {!!getImage(item.image) && (
                <div className="p-2 relative">
                  <Img
                    src={getImage(item.image)}
                    className="absolute inset-0 top-0 left-0"
                  />
                </div>
              )}
              <div className="whitespace-nowrap">{item.title}</div>
              <div
                className="cursor-pointer hover:text-zinc-900"
                onClick={() => removeItem(item)}
              >
                <Icon icon="fa-times" />
              </div>
            </div>
          ))}
      </div>

      {/* Dropdown */}
      {dropdown && Array.isArray(attrs.list) && attrs.list.length > 0 && (
        <div className="absolute bottom-0 left-0 w-full z-10">
          <div className="absolute top-0 left-0 w-full bg-white rounded border border-zinc-300 py-2 max-h-64 overflow-y-auto">
            {attrs.list.map((item: RelationType) => renderCategoriesForm(item))}
          </div>
        </div>
      )}
    </div>
  );
}
