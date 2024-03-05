import { RelationType } from "@/src/models/relation";
import { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import HandleCategory from "./HandleCategory";
import Modal from "@/src/components/utils/Modal";
import { Input, Label, Select } from "@/src/components/ui/form";

export default function HandleCategories({ list }: { list: Array<any> }) {
  const [listCategories, setListCategories] = useState([] as Array<any>);

  const [modal, setModal] = useState(false as boolean);
  const [triggerOrder, setTriggerOrder] = useState(-1 as number);

  const [editRelation, setEditRelation] = useState({} as RelationType);
  const handleEditRelation = (value: Object) => {
    setEditRelation({ ...editRelation, ...value });
  };

  useEffect(() => {
    setListCategories(list);
  }, [list]);

  return (
    <>
      <div className="bg-gray-100 rounded-lg p-2 items-start">
        <ReactSortable
          group={"test"}
          list={listCategories}
          setList={setListCategories}
          className="grid gap-2"
        >
          {listCategories.map((item: any, key: any) => (
            <div
              key={key}
              className="bg-white border relative hover:border-gray-400 ease rounded"
            >
              <HandleCategory item={item} />
            </div>
          ))}
        </ReactSortable>

        <div
          onClick={() => setModal(true)}
          className="cursor-pointer hover:text-cyan-600 text-sm pt-2 px-1 underline"
        >
          Adicionar
        </div>
      </div>

      {modal && (
        <Modal close={() => setModal(false)} status={false}>
          <form onSubmit={(e) => {}} className="grid gap-2">
            <div className="form-group">
              <Label style="float">Nome</Label>
              <Input
                defaultValue={editRelation?.title}
                onChange={(e: any) =>
                  handleEditRelation({
                    title: e.target.value,
                  })
                }
                required
                className="py-2"
              />
            </div>
            <div className="form-group">
              <Label style="float">Destacar categoria</Label>
              <Select
                onChange={(e: any) =>
                  handleEditRelation({
                    feature: e.target.value == "on",
                  })
                }
                className="py-2"
                name="destaque"
                value={!!editRelation?.feature ? "on" : "off"}
                options={[
                  {
                    name: "Não",
                    value: "off",
                  },
                  {
                    name: "Sim",
                    value: "on",
                  },
                ]}
              />
            </div>

            {!editRelation?.parent && (
              <div className="flex gap-4">
                <div className="form-group w-full">
                  <Label style="float">Quantidade de seleção</Label>
                  <Select
                    onChange={(e: any) =>
                      handleEditRelation({
                        multiple: e.target.value,
                      })
                    }
                    className="py-2"
                    name="destaque"
                    value={!!editRelation?.multiple}
                    options={[
                      {
                        name: "Múltipla",
                        value: true,
                      },
                      {
                        name: "Única",
                        value: false,
                      },
                    ]}
                  />
                </div>

                {!!editRelation?.multiple && (
                  <div className="form-group w-full max-w-[4rem]">
                    <Label style="float">Máx</Label>
                    <Input
                      defaultValue={metadataRelation?.limitSelect}
                      onChange={(e: any) =>
                        handleMetadataRelation({
                          limitSelect: e.target.value,
                        })
                      }
                      required
                      className="py-2"
                    />
                  </div>
                )}
                <div className="form-group w-full max-w-[12rem]">
                  <Label style="float">Tamanho do elemento</Label>
                  <Select
                    onChange={(e: any) =>
                      handleMetadataRelation({
                        style: e.target.value,
                      })
                    }
                    className="py-2"
                    name="estilo"
                    value={metadataRelation?.style}
                    options={[
                      {
                        name: "Pequeno",
                        value: "md",
                      },
                      {
                        name: "Médio",
                        value: "lg",
                      },
                      {
                        name: "Grande",
                        value: "xl",
                      },
                    ]}
                  />
                </div>
              </div>
            )}

            <div className="form-group">
              <FileManager
                multiple={false}
                value={editRelation?.image ?? []}
                onChange={(value: any) => {
                  handleEditRelation({
                    image: value,
                  });
                }}
                options={{
                  dir: "categories",
                  type: "thumb",
                }}
                className="py-[.6rem] text-sm"
              />
            </div>

            <div className="mt-5 flex items-center">
              <div className="w-full">
                <Button
                  onClick={() => {
                    setModal(false);
                    setEditRelation({} as RelationType);
                  }}
                  type="button"
                  style="btn-outline-light"
                  className="text-sm py-[.65rem] h-full px-4 border-0"
                  title="Cancelar"
                >
                  cancelar
                </Button>
              </div>
              <div className="w-fit">
                <Button
                  loading={form.loading}
                  style="btn-yellow"
                  className="text-sm py-[.65rem] h-full px-4"
                >
                  salvar
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
