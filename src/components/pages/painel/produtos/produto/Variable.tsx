import { v4 as uid } from "uuid";
import { AttributeType, ProductType } from "@/src/models/product";
import { Button, Input, Label, Select } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { useEffect, useState } from "react";
import Variations from "./Variations";
import { shortId } from "@/src/helper";
import SelectDropdown from "@/src/components/ui/form/SelectDropdown";

export default function Variable({
  product,
  emitAttributes,
}: {
  product: ProductType;
  emitAttributes: Function;
}) {
  const [modalAttrStatus, setModalAttrStatus] = useState("");
  const [collapseTrash, setCollapseTrash] = useState("");

  const [attributes, setAttributes] = useState([] as Array<AttributeType>);

  const addAttribute = () => {
    let rebuilt = attributes;
    let add: AttributeType = {
      id: shortId(),
      title: `Rascunho ${attributes.length + 1}`,
      variations: [],
      selectType: "radio",
      limit: 0,
      priceType: "on",
    };
    rebuilt.push(add);
    emitAttributes(rebuilt);
    setModalAttrStatus(add.id);
  };

  const removeAttribute = (id: string) => {
    let removed = attributes.filter((attribute, key) => id != attribute.id);
    emitAttributes(removed);
  };

  const updateAttribute = (value: Object, id: string) => {
    let updated = attributes.map((attribute, key) => {
      return id == attribute.id
        ? {
            ...attribute,
            ...value,
          }
        : attribute;
    });
    emitAttributes(updated);
  };

  useEffect(() => {
    if (JSON.stringify(attributes) !== JSON.stringify(product?.attributes ?? [])) {
      setAttributes(product?.attributes ?? []);
    }
  }, [product?.attributes]);

  return (
    <div className="border-t pt-4 pb-2">
      <h4 className="text-2xl text-zinc-900 mb-2">
        Grupo de variações/adicionais
      </h4>

      {!!attributes?.length &&
        attributes.map((attribute, key) => (
          <div key={key}>
            <div className="border-b py-2">
              <div className="flex items-center">
                <div className="w-full">
                  <h4
                    className="font-semibold text-sm text-zinc-900 cursor-pointer whitespace-nowrap"
                    onClick={() =>
                      modalAttrStatus == attribute.id
                        ? setModalAttrStatus("")
                        : setModalAttrStatus(attribute.id)
                    }
                  >
                    {attribute.title}
                  </h4>

                  <div className="text-sm grid gap-1 opacity-70 w-full">
                    {attribute?.variations?.length} opções
                  </div>
                </div>
                <div
                  className={`${
                    collapseTrash == attribute.id ? "" : "hidden"
                  } w-fit flex gap-2`}
                >
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
                    onClick={() => removeAttribute(attribute.id)}
                  >
                    remover
                  </Button>
                </div>
                <div
                  className={`${
                    collapseTrash == attribute.id ? "hidden" : ""
                  } w-fit flex gap-2`}
                >
                  <Button
                    type="button"
                    style="btn-white"
                    className="font-semibold text-sm py-1 px-2 border"
                    onClick={() =>
                      modalAttrStatus == attribute.id
                        ? setModalAttrStatus("")
                        : setModalAttrStatus(attribute.id)
                    }
                  >
                    {modalAttrStatus == attribute.id ? "confirmar" : "editar"}
                  </Button>
                  <Button
                    type="button"
                    style="btn-white"
                    className="text-sm py-1 px-2 border"
                    onClick={() => setCollapseTrash(attribute.id)}
                  >
                    <Icon icon="fa-trash" />
                  </Button>
                </div>
              </div>
              {/* 
            {!!attribute?.variations?.length && (
              <div className="text-sm grid gap-1 opacity-70 w-full">
                {attribute?.variations.map((item, key) => (
                  <div key={key} className="">
                    {item.title}
                  </div>
                ))}
              </div>
            )}
            */}
            </div>
            <div
              className={`fixed top-0 left-0 w-full z-10 ${
                modalAttrStatus == attribute.id
                  ? "h-screen overflow-y-scroll"
                  : "h-0 overflow-hidden"
              }`}
            >
              <div className="absolute w-full min-h-full pt-10 md:pb-10 flex items-end md:items-start">
                <div
                  onClick={() => setModalAttrStatus("")}
                  className="absolute inset-0 min-h-screen bg-zinc-900 bg-opacity-75"
                ></div>

                <div className="relative w-full max-w-2xl mx-auto rounded-t-xl md:rounded-xl bg-white p-4 pb-14 md:p-6">
                  <div className="flex items-center">
                    <h4 className="text-xl text-zinc-900 w-full pb-2">
                      Editando Grupo
                    </h4>
                    <Button
                      type="button"
                      style="btn-white"
                      onClick={() => setModalAttrStatus("")}
                      className="text-sm p-2"
                    >
                      concluir
                    </Button>
                  </div>
                  <div className="form-group">
                    <Label>Título</Label>
                    <input
                      value={attribute?.title ?? ""}
                      onBlur={(e: any) =>
                        !e.target.value
                          ? updateAttribute(
                              { title: `Grupo ${key + 1}` },
                              attribute.id
                            )
                          : {}
                      }
                      onChange={(e: any) =>
                        updateAttribute({ title: e.target.value }, attribute.id)
                      }
                      name="titulo_atrbt"
                      placeholder="Ex: Tamanho, Cor, Material"
                      required
                      className="form-control"
                    />
                  </div>
                  <div className="flex gap-6">
                    <div className="w-full form-group">
                      <Label style="light">Tipo de seleção</Label>
                      <SelectDropdown
                        name="tipo_selecao"
                        onChange={(value: any) =>
                          updateAttribute({ selectType: value }, attribute.id)
                        }
                        value={attribute.selectType ?? "radio"}
                        options={[
                          {
                            icon: "fa-dot-circle",
                            value: "radio",
                            name: "Seleção única",
                          },
                          {
                            icon: "fa-check-square",
                            value: "checkbox",
                            name: "Seleção múltipla",
                          },
                          {
                            icon: "fa-sort-numeric-up-alt",
                            value: "quantity",
                            name: "Por quandidade",
                          },
                        ]}
                      />
                    </div>
                    {attribute?.selectType == "checkbox" && (
                      <div className="w-1/4 form-group">
                        <Label style="light">Limite de seleção</Label>
                        <input
                          type="number"
                          value={attribute.limit ?? ""}
                          onChange={(e: any) =>
                            updateAttribute(
                              { limit: e.target.value },
                              attribute.id
                            )
                          }
                          name="limite_atrbt"
                          className="text-sm p-3 form-control"
                        />
                      </div>
                    )}
                    <div className="w-full form-group">
                      <Label style="light">Preços</Label>
                      <SelectDropdown
                        name="tipo_preco"
                        onChange={(value: any) =>
                          updateAttribute({ priceType: value }, attribute.id)
                        }
                        value={attribute.priceType ?? ""}
                        options={[
                          {
                            icon: "fa-usd-circle",
                            value: "on",
                            name: "Incluir valores",
                          },
                          {
                            icon: "fa-check",
                            value: "off",
                            name: "Apenas seleção",
                          },
                        ]}
                      />
                    </div>
                  </div>
                  <div className="pt-6">
                    <Variations
                      product={product}
                      attribute={attribute}
                      emitVariations={(param: any) =>
                        updateAttribute({ variations: param }, attribute.id)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

      <div className="grid pt-2">
        <Button
          type="button"
          onClick={() => addAttribute()}
          style="btn-white"
          className="text-sm whitespace-nowrap py-2 px-4"
        >
          <Icon icon="fa-plus" />
          Add grupo
        </Button>
      </div>
      {/*  */}
      <style global jsx>{`
        body,
        html {
          overflow-y: ${!!modalAttrStatus ? "hidden" : ""};
        }
      `}</style>
    </div>
  );
}
