import { v4 as uid } from "uuid";
import { AttributeType, ProductType } from "@/src/models/product";
import { Button, Input, Label, Select } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { useEffect, useState } from "react";
import { getImage, realMoneyNumber, shortId } from "@/src/helper";
import React from "react";

export default function Variations({
  product,
  attribute,
  emitVariations,
}: {
  product: ProductType;
  attribute: AttributeType;
  emitVariations: Function;
}) {
  const [active, setActive] = useState("" as any);

  const handleSelected = (value: string) => {
    setActive(false);
  };

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
          <div key={key} className="group border-t focus-within:z-100">
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
                        value={variation?.title ?? ""}
                        onBlur={(e: any) =>
                          !e.target.value
                            ? updateVariation(
                              { title: `Variação ${key + 1}` },
                              variation.id
                            )
                            : {}
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
                  {/* <div className="w-fit relative group-focus-within:z-10">
                    {!!variation?.image && !!product?.gallery?.length ? (
                      (product?.gallery ?? [])
                        .filter((item: any) => item.id == variation.image)
                        .map((image: any, index) => (
                          <div
                            key={index}
                            className="w-[4rem] h-[46px] cursor-pointer relative bg-gray-100 rounded-md"
                          >
                            <img
                              onClick={() => setActive(variation.id)}
                              src={getImage(image, "thumb")}
                              className="rounded-md absolute object-contain w-full h-full inset-0"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                updateVariation({ image: "" }, variation.id);
                                setActive("");
                              }}
                              className={`bg-white -m-1 cursor-pointer shadow text-xs absolute right-0 top-0 px-1 rounded`}
                            >
                              <Icon icon="fa-times" type="far" />
                            </button>
                          </div>
                        ))
                    ) : (
                      <div
                        onClick={() => setActive(variation.id)}
                        className="w-[4rem] h-[46px] cursor-pointer relative bg-gray-100 rounded-md"
                      >
                        <Icon
                          icon="fa-image"
                          className={`cursor-pointer text-lg absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2`}
                          type="far"
                        />
                      </div>
                    )}

                    {!!active && variation.id == active && (
                      <>
                        <div
                          onClick={() => setActive("")}
                          className="fixed inset-0 z-[5]"
                        ></div>
                        <div className="absolute z-10 grid bg-white text-sm rounded-md shadow-md w-full p-1">
                          {Array.isArray(product?.gallery) &&
                            product.gallery.map((image: any, key) => (
                              <div
                                key={key}
                                onClick={() => {
                                  updateVariation({ image: image.id }, variation.id);
                                  setActive("");
                                }}
                                className="p-1 flex items-center gap-1 cursor-pointer rounded ease hover:bg-gray-100"
                              >
                                <img src={getImage(image, "thumb")} className="rounded" />
                              </div>
                            ))}
                        </div>
                      </>
                    )}
                  </div> */}
                  <div
                    className={`${collapseTrash == variation.id ? "hidden" : ""
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
                    <div className="w-fit flex items-center gap-2">
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
                        style="btn-danger"
                        className="text-sm py-1 px-2"
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