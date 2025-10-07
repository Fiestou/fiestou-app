import { useEffect, useState } from "react";
import Input from "./InputUI";
import Button from "./ButtonUI";
import Icon from "@/src/icons/fontAwesome/FIcon";

import { RelationType } from "@/src/models/relation";
import Img from "@/src/components/utils/ImgBase";
import { getImage } from "@/src/helper";

interface OptionsType {
  name: string;
  onChange?: Function;
  onSearch?: Function;
  className?: string;
  id?: string;
  value?: Array<RelationType>;
  list?: Array<RelationType>;
  childs?: string;
  combinations?: string;
}

export default function Options(attrs: OptionsType) {
  const [dropdown, setDropdown] = useState(false);

  const [list, setList] = useState(attrs.value ?? []);
  const addList = (item: any) => {
    const handle = list;

    if (!handle?.find((itm) => itm.id == item.id)) handle?.push(item);

    setList(handle);
    !!attrs?.onChange ? attrs?.onChange(handle) : {};
  };

  const removeItem = (remove: any) => {
    const handle = list?.filter((item) => item.slug != remove.slug);

    setList(handle);
    !!attrs?.onChange ? attrs?.onChange(handle) : {};
  };

  const renderCategoriesForm = (item: any, disabled?: any) => {
    return (
      <>
        <div
          className={`${
            !!list?.find((itm) => itm.id == item.id) ? "opacity-50" : ""
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
            <div className="pl-1"></div>
          )}
          <div className="w-full">{item?.title}</div>
        </div>
      </>
    );
  };

  useEffect(() => {
    setList(attrs.value ?? []);
  }, [attrs]);

  return (
    <>
      <div className="rounded-md border border-zinc-300 relative">
        <div className="flex flex-wrap gap-1 p-1">
          <input
            type="text"
            className="p-2 rounded-md w-full"
            placeholder="Selecione suas opções"
            onFocus={() => setDropdown(true)}
            onBlur={() => setTimeout(() => setDropdown(false), 120)}
            onChange={(e: any) =>
              !!attrs?.onSearch ? attrs?.onSearch(e.target.value) : {}
            }
          />
          {!!list &&
            list.map((item: RelationType, key: any) => (
              <div
                key={key}
                className="bg-zinc-100 border border-zin-300 px-4 py-2 rounded-md items-center w-fit flex gap-3"
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
        {dropdown && !!attrs?.list?.length && (
          <div className="absolute bottom-0 left-0 w-full z-10">
            <div className="absolute top-0 left-0 w-full bg-white rounded border border-zinc-300 py-2">
              {!!attrs?.list &&
                attrs?.list.map((item: RelationType, key: any) => (
                  <div key={key}>{renderCategoriesForm(item)}</div>
                ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
