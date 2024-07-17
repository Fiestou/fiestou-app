import { v4 as uid } from "uuid";
import { AttributeType } from "@/src/models/product";
import { Button, Input, Label, Select } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { useEffect, useState } from "react";
import { realMoneyNumber, shortId } from "@/src/helper";

export default function Variations({
  attribute,
  emitVariations,
}: {
  attribute: AttributeType;
  emitVariations: Function;
}) {
  const [collapseStatus, setCollapseStatus] = useState("");
  const [collapseTrash, setCollapseTrash] = useState("");

  const [variations, setVariations] = useState([] as Array<any>);

  const addVariation = () => {
    let rebuilt = variations;
    const add: any = {
      id: shortId(),
      title: `Variação ${variations.length + 1}`,
      price: 0,
    };
    rebuilt.push(add);
    emitVariations(rebuilt);
    setCollapseStatus(add.id);
  };

  const removeVariation = (id: string) => {
    let removed = variations.filter((variation, key) => id != variation.id);

    emitVariations(removed);
  };

  const updateVariation = (value: any, id: string) => {
    let update = variations.map((variation, key) =>
      id == variation.id
        ? {
            ...variation,
            ...value,
          }
        : variation
    );
    emitVariations(update);
  };

  useEffect(() => {
    setVariations(attribute?.variations);
  }, [attribute]);

  return (
    <>
      <div className="pb-2">
        <h4 className="text-zinc-900 font-bold">Variações</h4>
      </div>

      <div className="">
        {variations.map((variation, key) => (
          <div key={key} className="border-t">
            <div className="flex items-center">
              <div className="w-full">
                <div className="flex gap-2 py-2">
                  <div className="w-full">
                    <div className="form-group mt-0">
                      <input
                        className="text-sm p-3 form-control"
                        onChange={(e: any) =>
                          updateVariation(
                            { title: e.target.value },
                            variation.id
                          )
                        }
                        value={
                          !!variation?.title
                            ? variation?.title
                            : `Variação ${key + 1}`
                        }
                        type="text"
                        name="titulo"
                        placeholder="Ex: Brigadeiro, Grande, Leite ninho, etc..."
                      />
                    </div>
                  </div>
                  {attribute?.priceType == "on" && (
                    <div className="w-fit">
                      <div className="form-group mt-0">
                        <input
                          className="text-sm p-3 form-control"
                          onChange={(e: any) =>
                            updateVariation(
                              { price: realMoneyNumber(e.target.value) },
                              variation.id
                            )
                          }
                          value={variation.price ?? ""}
                          type="text"
                          name="preco_promo"
                          placeholder="R$ 0,00"
                        />
                      </div>
                    </div>
                  )}
                  <div
                    className={`${
                      collapseTrash == variation.id ? "hidden" : ""
                    } w-fit`}
                  >
                    <Button
                      type="button"
                      style="btn-white"
                      className="text-sm h-full px-2"
                      onClick={() => setCollapseTrash(variation.id)}
                    >
                      <Icon icon="fa-trash" />
                    </Button>
                  </div>
                  {collapseTrash == variation.id && (
                    <div className="w-fit flex gap-2">
                      <Button
                        type="button"
                        style="btn-white"
                        className="font-semibold text-sm py-1 px-2"
                        onClick={() => setCollapseTrash("")}
                      >
                        cancelar
                      </Button>
                      <Button
                        type="button"
                        style="btn-white"
                        className="text-sm py-1 px-2 text-red-700"
                        onClick={() => removeVariation(variation.id)}
                      >
                        remover
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid border-t pt-2">
        <Button
          type="button"
          onClick={() => addVariation()}
          style="btn-white"
          className="text-sm whitespace-nowrap py-2 px-4"
        >
          <Icon icon="fa-plus" />
          Add variação
        </Button>
      </div>
    </>
  );
}
