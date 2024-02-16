import Icon from "@/src/icons/fontAwesome/FIcon";
import Button from "@/src/components/ui/form/ButtonUI";
import { useState } from "react";
import { v4 as uid } from "uuid";
import Label from "./LabelUI";
import HandleField from "./HandleField";

interface ListType {
  mainField: string;
  singular?: string;
  plural?: string;
  items: Array<any>;
  className?: string;
  form: Array<any>;
  onChange?: Function;
}

export default function List(attr: ListType) {
  const [modalItemStatus, setModalItemStatus] = useState(-1);
  const [collapseTrash, setCollapseTrash] = useState(-1);

  const [lisItems, setListItem] = useState(attr.items);
  const addItem = () => {
    setListItem([
      ...lisItems,
      {
        id: uid(),
      },
    ]);

    setModalItemStatus(lisItems.length);
  };

  const removeItem = (index: number) => {
    let updated: Array<any> = lisItems.filter(
      (item: any, key: any) => key != index
    );

    setListItem(updated);
    setCollapseTrash(-1);

    if (!!attr?.onChange) attr.onChange(updated);
  };

  const updateItem = (name: any, value: any, index: number) => {
    let updated: Array<any> = lisItems;

    updated[index][name] = value;

    setListItem(updated);

    if (!!attr?.onChange) attr.onChange(updated);
  };

  return (
    <div className="border border-zinc-300 hover:border-zinc-400 focus-within:border-zinc-500 ease rounded-md p-2 grid gap-2">
      {!!lisItems &&
        lisItems.map((item: any, key: any) => (
          <div key={key} className="border-b pb-2 -mx-2 px-2">
            <div className="flex items-center">
              <div className="w-full pl-2">
                <div className="font-semibold text-sm text-zinc-900 cursor-pointer whitespace-nowrap">
                  {!!item[attr.mainField] ? (
                    <div
                      dangerouslySetInnerHTML={{ __html: item[attr.mainField] }}
                    ></div>
                  ) : (
                    `rascunho - ${attr.singular} ${key + 1}`
                  )}
                </div>
              </div>
              <div
                className={`${
                  collapseTrash == key ? "" : "hidden"
                } w-fit flex gap-2`}
              >
                <Button
                  type="button"
                  style="btn-white"
                  className="font-semibold text-sm py-1 px-2"
                  onClick={() => setCollapseTrash(-1)}
                >
                  cancelar
                </Button>
                <Button
                  type="button"
                  style="btn-danger"
                  className="text-sm py-1 px-2"
                  onClick={() => removeItem(key)}
                >
                  remover
                </Button>
              </div>
              <div
                className={`${
                  collapseTrash == key ? "hidden" : ""
                } w-fit flex gap-2`}
              >
                <Button
                  type="button"
                  style="btn-white"
                  className="font-semibold text-sm py-1 px-2 border"
                  onClick={() =>
                    modalItemStatus == key
                      ? setModalItemStatus(-1)
                      : setModalItemStatus(key)
                  }
                >
                  {modalItemStatus == key ? "confirmar" : "editar"}
                </Button>
                <Button
                  type="button"
                  style="btn-white"
                  className="text-sm py-1 px-2 border"
                  onClick={() => setCollapseTrash(key)}
                >
                  <Icon icon="fa-trash" />
                </Button>
              </div>
            </div>
            <div
              className={`fixed top-0 left-0 w-full z-20 bg-zinc-900 bg-opacity-75 ${
                modalItemStatus == key
                  ? "h-full min-h-screen overflow-y-scroll"
                  : "h-0 overflow-hidden"
              }`}
            >
              <div
                onClick={() => setModalItemStatus(-1)}
                className="absolute inset-0 w-full h-full"
              ></div>

              <div className="relative max-w-2xl mt-10 md:mt-20 mx-auto rounded-xl bg-white p-4 md:p-6">
                <div className="flex items-center pb-2">
                  <h4 className="text-xl text-zinc-900 w-full pb-2">
                    Editando {attr.singular ?? ""}
                  </h4>
                  <Button
                    type="button"
                    style="btn-yellow"
                    onClick={() => setModalItemStatus(-1)}
                    className="text-sm py-2 px-3"
                  >
                    concluir
                  </Button>
                </div>
                <div className="grid gap-2">
                  {attr.form &&
                    attr.form.map((field: any, index: any) => (
                      <div key={index} className="form-group">
                        <Label style="float">{field.label}</Label>
                        <HandleField
                          {...field}
                          value={lisItems[key][field.name]}
                          emitChange={(value: any) => {
                            updateItem(field.name, value, key);
                          }}
                        />
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      <div className="grid">
        <Button
          type="button"
          onClick={() => addItem()}
          style="btn-white"
          className="text-sm whitespace-nowrap py-2 px-4"
        >
          <Icon icon="fa-plus" />
          Add {attr.singular ?? ""}
        </Button>
      </div>
      <style global jsx>{`
        body,
        html {
          overflow-y: ${modalItemStatus > -1 ? "hidden" : ""};
        }
      `}</style>
    </div>
  );
}
