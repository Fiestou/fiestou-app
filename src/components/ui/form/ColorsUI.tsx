import { useEffect, useState } from "react";

interface ColorType {
  name?: string;
  onChange?: Function;
  maxSelect?: string | number;
  value?: Array<any> | string;
}

export const ColorsList = [
  { code: "noColor", value: "sem cor" },
  { code: "bg-zinc-50", value: "branco" },
  { code: "bg-pink-400", value: "rosa" },
  { code: "bg-red-500", value: "vermelho" },
  { code: "bg-orange-500", value: "laranja" },
  { code: "bg-orange-200", value: "bege" },
  { code: "bg-yellow-400", value: "amarelo" },
  { code: "bg-green-500", value: "verde" },
  // { code: "bg-cyan-300", value: "azul" },
  { code: "bg-blue-500", value: "azul escuro" },
  { code: "bg-purple-500", value: "violeta" },
  { code: "bg-zinc-900", value: "preto" },
  { code: "bg-amber-800", value: "marrom" },
  { code: "bg-zinc-300", value: "cinza" },
  { code: "colorFull", value: "colorido" },
];

export const ColorfulRender = (item: any) => {
  switch (item?.code) {
    case "noColor":
      return (
        <div className="p-3 rounded-full relative overflow-hidden bg-zinc-100">
          <div className="absolute -rotate-45 ml-3 w-[3rem] pt-[2px] left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-red-500"></div>
        </div>
      );

    case "colorFull":
      return (
        <div className="p-3 rounded-full relative overflow-hidden bg-zinc-100">
          <div className="d-flex absolute w-full h-full top-0 left-0">
            {ColorsList.map(
              (color: any, key: any) =>
                key > 1 && (
                  <div key={key} className={`${color?.code} w-full pt-1`}></div>
                )
            )}
          </div>
        </div>
      );

    default:
      return (
        <div
          className={`${item?.code} ${
            item?.value == "branco" ? "border" : ""
          } p-3 rounded-full`}
        ></div>
      );
  }
};

export default function Colors(attr: ColorType) {
  const [value, setValue] = useState([] as any);

  useEffect(() => {
    setValue(
      typeof attr?.value == "string"
        ? [attr?.value]
        : attr?.value ?? ([] as any)
    );
  }, [attr]);

  const HandleColors = (color: string) => {
    var handle: any = value;
    var index = handle.indexOf(color);

    if (index !== -1) {
      handle.splice(index, 1);
    } else {
      handle.push(color);
    }

    handle = value.slice(0, parseInt((attr?.maxSelect ?? "100000").toString()));

    setValue(handle);
    !!attr?.onChange ? attr?.onChange(handle) : {};
  };

  return (
    <>
      <div className="relative w-0 h-0 overflow-hidden">
        {!!value &&
          value.map((item: any, key: any) => (
            <input
              key={key}
              type="checkbox"
              defaultChecked
              value={item}
              name={attr.name ?? "color"}
            />
          ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {ColorsList.map((item: any, key: any) => (
          <div
            key={key}
            onClick={(e: any) => HandleColors(item.value)}
            className={`${
              value?.indexOf(item.value) > -1
                ? "border-zinc-800"
                : "border-zinc-200"
            } group p-2 border hover:border-zinc-400 ease rounded-md cursor-pointer relative`}
          >
            {ColorfulRender(item)}
            <div className="hidden group-hover:block absolute text-xs bottom-0 left-1/2 -translate-x-1/2 whitespace-nowrap -mb-1 bg-white shadow px-1 rounded">
              {item.value}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
