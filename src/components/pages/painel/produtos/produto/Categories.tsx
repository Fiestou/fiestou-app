import Checkbox from "@/src/components/ui/form/CheckboxUI";
import Img from "@/src/components/utils/ImgBase";
import { getImage } from "@/src/helper";
import { AssociatedElement, RelationType } from "@/src/models/relation";
import Api from "@/src/services/api";
import { useEffect, useState } from "react";

export default function Categories({
  checked,
  emit,
}: {
  checked: Array<number>;
  emit: Function;
}) {
  const api = new Api();

  const [selected, setSelected] = useState([] as Array<number>);
  const [categories, setCategories] = useState([] as Array<any>);
  const [allCategories, setAllCategories] = useState([] as any);

  const recursiveList = (items: any, recursive: Array<number>) => {
    items.map((item: any) => {
      recursive = [...recursive, item];
    });

    items
      .filter((item: any) => !!item.childs.length)
      .map((item: any) => {
        recursive = recursiveList(item.childs, recursive);
      });

    return recursive;
  };

  const getCategories = async () => {
    let request: any = await api.bridge({
      method: 'post',
      url: "categories/list",
    });

    const handle = request.data;

    let childs: any = {};
    handle.map((item: any) => {
      childs[item.id] = recursiveList(item.childs ?? [], []);
    });

    setAllCategories(childs);
    setCategories(handle);
  };

  const handleRelationship = (id: number, master: RelationType) => {
    if (!!window) {
      const masterEl: any = document.getElementById(`master_${master.id}`);
      const limit = masterEl.getElementsByClassName("limit_checked").length;

      let handle: any = [];

      if (master && master.metadata && master.metadata.limitSelect) {
        handle = !!selected.find((item: any) => item == id)
          ? selected.filter((item: any) => item != id)
          : limit < parseInt(master.metadata.limitSelect)
          ? [...selected, id]
          : selected;
      } else {
        handle = !!selected.find((item: any) => item == id)
          ? selected.filter((item: any) => item != id)
          : [...selected, id];
      }

      setSelected(handle);
      emit(handle);
    }
  };

  const renderCategories = (
    master: RelationType,
    childs?: AssociatedElement[]
  ) => {
    return (
      !!childs?.length && (
        <div className="grid gap-2">
          {childs.map((item: RelationType) => {
            return (
              <div key={item.id} className="grid gap-2">
                <div className="bg-white px-3 py-2 gap-2 rounded flex items-center relative">
                  <div
                    className=""
                    onClick={() => {
                      handleRelationship(Number(item.id) || 0, master)
                    }}
                  >
                    <Checkbox
                      checked={
                        !!selected.filter((id: any) => id == item.id).length
                      }
                      type={"checkbox"}
                    />
                  </div>
                  {/* <div>{JSON.stringify(selected)}</div> */}
                  <div className="aspect-[1/1] max-w-[1.5rem]">
                    {!!getImage(item.image) && (
                      <Img
                        className="w-full h-full object-contain"
                        src={getImage(item.image)}
                      />
                    )}
                  </div>
                  <div>
                    {item.title}
                    {!!selected.filter((id: any) => id == item.id).length && (
                      <div className="limit_checked"></div>
                    )}
                  </div>
                </div>
                {!!item?.childs?.length && (
                  <div className="pl-4">
                    {renderCategories(master, item.childs || [])}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )
    );
  };

  useEffect(() => {
    if (!!window) {
      if (!categories.length) {
        getCategories();
      }

      const handleSelected = checked.map((item: any) => item.id);
      setSelected(handleSelected);
      emit(handleSelected);
    }
  }, [checked]);

  return !!categories.length ? (
    <div className="border-t pt-4 pb-2 ">
      {categories.map((master: RelationType, key) => (
        <div
          key={key}
          id={`master_${master.id}`}
          className="group relative pt-4 pb-2 focus-within:z-10"
        >
          <div className="flex items-end">
            <h4 className="text-2xl w-full text-zinc-900 mb-2">
              {master.title}
            </h4>
            {master.metadata?.limitSelect && (
              <div className="pb-2 whitespace-nowrap text-xs">
                Máx {master.metadata?.limitSelect}
              </div>
            )}
          </div>
          <div className="h-auto bottom-0 left-0 w-full">
            <div className="bg-zinc-100 overflow-y-auto border rounded-md max-h-[20rem] p-4 top-0 left-0 w-full">
              {renderCategories(master, master.childs)}
            </div>
          </div>
        </div>
      ))}
    </div>
  ) : (
    <></>
  );
}
