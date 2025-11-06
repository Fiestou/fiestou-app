import { AttributeType, ProductType } from "@/src/models/product";
import { Button, Label } from "@/src/components/ui/form";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { useEffect, useState } from "react";
import Variations from "./Variations";
import SelectDropdown from "@/src/components/ui/form/SelectDropdown";
import { shortId } from "@/src/helper";

// Normaliza qualquer formato vindo do back para AttributeType[]
function normalizeAttributes(input: unknown): AttributeType[] {
  if (!input) return [];
  if (Array.isArray(input)) return input as AttributeType[];
  if (typeof input === "string") {
    try {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? (parsed as AttributeType[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

export default function Variable({
  product,
  emitAttributes,
}: {
  product: ProductType;
  emitAttributes: (attrs: AttributeType[] | string) => void;
}) {
  const [modalAttrStatus, setModalAttrStatus] = useState("");
  const [collapseTrash, setCollapseTrash] = useState("");
  const [attributes, setAttributes] = useState<AttributeType[]>([]);

  // Mantém o state SEMPRE como array
  useEffect(() => {
    const next = normalizeAttributes(product?.attributes ?? []);
    if (JSON.stringify(next) !== JSON.stringify(attributes)) {
      setAttributes(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.attributes]);

  // 🔧 Helper para emitir sempre o valor correto para o pai
  const emitSerializedAttributes = (attrs: AttributeType[]) => {
    try {
      // se o pai usa FormData, ele deve receber string JSON
      emitAttributes(JSON.stringify(attrs));
    } catch {
      emitAttributes(attrs);
    }
  };

  const addAttribute = () => {
    const add: AttributeType = {
      id: shortId(),
      title: `Rascunho ${attributes.length + 1}`,
      variations: [],
      selectType: "radio",
      limit: 0,
      priceType: "on",
    };
    setAttributes((prev) => {
      const next = [...prev, add];
      emitSerializedAttributes(next);
      return next;
    });
    setModalAttrStatus(add.id);
  };

  const removeAttribute = (id: string) => {
    setAttributes((prev) => {
      const next = prev.filter((a) => a.id !== id);
      emitSerializedAttributes(next);
      return next;
    });
  };

  const updateAttribute = (value: Partial<AttributeType>, id: string) => {
    setAttributes((prev) => {
      const next = prev.map((a) => (a.id === id ? { ...a, ...value } : a));
      emitSerializedAttributes(next);
      return next;
    });
  };

  return (
    <div className="border-t pt-4 pb-2">
      <h4 className="text-2xl text-zinc-900 mb-2">
        Grupo de variações/adicionais
      </h4>

      {!!attributes?.length &&
        attributes.map((attribute, key) => (
          <div key={attribute.id ?? key}>
            <div className="border-b py-2">
              <div className="flex items-center">
                <div className="w-full">
                  <h4
                    className="font-semibold text-sm text-zinc-900 cursor-pointer whitespace-nowrap"
                    onClick={() =>
                      setModalAttrStatus((cur) =>
                        cur === attribute.id ? "" : attribute.id
                      )
                    }
                  >
                    {attribute.title}
                  </h4>

                  <div className="text-sm grid gap-1 opacity-70 w-full">
                    {attribute?.variations?.length ?? 0} opções
                  </div>
                </div>

                <div
                  className={`${
                    collapseTrash === attribute.id ? "" : "hidden"
                  } w-fit flex gap-2`}
                >
                  <Button
                    type="button"
                    style="btn-white"
                    className="font-semibold text-sm py-1 px-2"
                    onClick={() => setCollapseTrash("")}
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    style="btn-danger"
                    className="text-sm py-1 px-2"
                    onClick={() => removeAttribute(attribute.id)}
                  >
                    Confirmar
                  </Button>
                </div>

                <div
                  className={`${
                    collapseTrash === attribute.id ? "hidden" : ""
                  } w-fit flex gap-2`}
                >
                  <Button
                    type="button"
                    style="btn-white"
                    className="font-semibold text-sm py-1 px-2 border"
                    onClick={() =>
                      setModalAttrStatus((cur) =>
                        cur === attribute.id ? "" : attribute.id
                      )
                    }
                  >
                    {modalAttrStatus === attribute.id ? "confirmar" : "editar"}
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
            </div>

            {/* Modal */}
            <div
              className={`fixed top-0 left-0 w-full z-10 ${
                modalAttrStatus === attribute.id
                  ? "h-screen overflow-y-scroll"
                  : "h-0 overflow-hidden"
              }`}
            >
              <div className="absolute w-full min-h-full pt-10 md:pb-10 flex items-end md:items-start">
                <div
                  onClick={() => setModalAttrStatus("")}
                  className="absolute inset-0 min-h-screen bg-zinc-900 bg-opacity-75"
                />
                <div className="relative w-full max-w-2xl mx-auto rounded-t-xl md:rounded-xl bg-white p-4 pb-14 md:p-6">
                  <div className="flex items-center">
                    <h4 className="text-xl text-zinc-900 w-full pb-2">
                      Editando Grupo
                    </h4>
                    <Button
                      type="button"
                      style="btn-white"
                      onClick={() => setModalAttrStatus("")}
                      className="cursor-pointer font-semibold text-zinc-900 bg-zinc-200 hover:bg-zinc-300 hover:text-green-600 px-4 py-2 rounded-md transition-colors duration-200"
                    >
                      Concluir
                    </Button>
                  </div>

                  <div className="form-group">
                    <Label>Título</Label>
                    <input
                      value={attribute?.title ?? ""}
                      onBlur={(e) =>
                        !e.currentTarget.value
                          ? updateAttribute(
                              { title: `Grupo ${key + 1}` },
                              attribute.id
                            )
                          : undefined
                      }
                      onChange={(e) =>
                        updateAttribute(
                          { title: e.currentTarget.value },
                          attribute.id
                        )
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
                            name: "Por quantidade",
                          },
                        ]}
                      />
                    </div>

                    {attribute?.selectType === "checkbox" && (
                      <div className="w-1/4 form-group">
                        <Label style="light">Limite de seleção</Label>
                        <input
                          type="number"
                          value={attribute.limit ?? 0}
                          onChange={(e) =>
                            updateAttribute(
                              { limit: Number(e.currentTarget.value) || 0 },
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
                        value={attribute.priceType ?? "on"}
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
          onClick={addAttribute}
          style="btn-white"
          className="text-sm whitespace-nowrap py-2 px-4"
        >
          <Icon icon="fa-plus" />
          Add grupo
        </Button>
      </div>

      {/* trava scroll quando modal está aberto */}
      <style global jsx>{`
        body,
        html {
          overflow-y: ${!!modalAttrStatus ? "hidden" : ""};
        }
      `}</style>
    </div>
  );
}
