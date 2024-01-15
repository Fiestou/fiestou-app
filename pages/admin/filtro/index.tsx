import Image from "next/image";
import Link from "next/link";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Template from "@/src/template";
import { Button, Label, Select } from "@/src/components/ui/form";
import { NextApiRequest, NextApiResponse } from "next";
import Api from "@/src/services/api";
import { getImage } from "@/src/helper";
import { useEffect, useState } from "react";
import Img from "@/src/components/utils/ImgBase";
import Modal from "@/src/components/utils/Modal";
import Input from "@/src/components/ui/form/InputUI";
import FileManager from "@/src/components/ui/form/FileManager";
import { RelationType } from "@/src/models/relation";

const formInitial = {
  edit: "",
  loading: false,
};

export default function Categorias() {
  const api = new Api();

  const [listRelation, setListRelation] = useState([] as Array<RelationType>);

  const [form, setForm] = useState(formInitial);
  const handleForm = (value: Object) => {
    setForm({ ...form, ...value });
  };

  const [itemRemove, setItemRemove] = useState(0 as number);
  const sendRemove = async () => {
    setItemRemove(0);

    const request: any = await api.bridge({
      url: "categories/remove",
      data: {
        id: itemRemove,
      },
    });

    if (request.response) {
      setListRelation(request?.data);
      setModalRelation(false);
    }

    handleForm({ loading: false });

    return request;
  };

  const [modalRelation, setModalRelation] = useState(false as boolean);

  const [editRelation, setEditRelation] = useState({} as RelationType);
  const handleEditRelation = (value: Object) => {
    setEditRelation({ ...editRelation, ...value });
  };

  const [metadataRelation, setMetadataRelation] = useState({} as any);
  const handleMetadataRelation = (value: Object) => {
    setMetadataRelation({ ...metadataRelation, ...value });
  };

  const sendRelation = async (relation: RelationType) => {
    const rel: RelationType = {
      id: relation?.id ?? 0,
      title: relation?.title ?? "",
      slug: relation?.slug ?? relation?.title,
      multiple: relation?.multiple ?? true,
      parent: relation?.parent ?? "",
      feature: relation?.feature ?? false,
      closest: relation?.closest ?? [],
      metadata: metadataRelation,
      image: !!relation?.image.length ? relation?.image[0].id : "",
    };

    const request: any = await api.bridge({
      url: "categories/register",
      data: rel,
    });

    console.log(relation, "rel");

    if (request.response) {
      setListRelation(request?.data);
      setModalRelation(false);
    }

    handleForm({ loading: false });

    return request;
  };

  const saveRelation = async (e: any) => {
    e.preventDefault();

    handleForm({ loading: true });

    const request: any = await sendRelation(editRelation);

    if (request.response) {
      setEditRelation({} as RelationType);
    }

    handleForm({ loading: false });
  };

  const renderCategory = (item: any) => {
    return (
      <div key={item.id}>
        <div className="px-3 py-2 rounded bg-zinc-100 hover:bg-zinc-200 ease flex gap-2 items-center justify-between">
          {!!getImage(item.image) && (
            <div className="aspect-[1/1] max-w-[2rem]">
              <Img
                className="w-full h-full object-contain"
                src={getImage(item.image)}
              />
            </div>
          )}
          <div className="w-full">{item.title}</div>
          {!!itemRemove ? (
            <div className="relative w-full z-[10]">
              {itemRemove == item.id && (
                <div className="bg-white top-0 right-0 -mt-2 -mr-2 absolute w-full max-w-[32rem] p-3 border rounded-lg">
                  <div className="pb-4 text-sm">
                    Ao excluir este item também serão excluídos todos
                    relacionamentos desta categoria com produtos e todas as
                    subcategorias. Deseja continuar com esta ação?
                  </div>
                  <div className="flex justify-between gap-4">
                    <button
                      type="button"
                      onClick={() => setItemRemove(0)}
                      className="text-sm cursor-pointer hover:text-cyan-600 hover:underline"
                    >
                      cancelar
                    </button>
                    <div
                      onClick={() => sendRemove()}
                      className="text-sm whitespace-nowrap cursor-pointer hover:text-red-800 text-red-500 hover:underline"
                    >
                      confirmar e excluir
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <div
                className="text-sm cursor-pointer hover:text-cyan-600 hover:underline"
                onClick={() => setItemRemove(item.id)}
              >
                excluir
              </div>
              <div
                className="text-sm cursor-pointer hover:text-cyan-600 hover:underline"
                onClick={() => {
                  setModalRelation(true);
                  setEditRelation(item);
                  setMetadataRelation(item.metadata);
                }}
              >
                editar
              </div>
            </>
          )}
        </div>
        <div className="relative pl-3 py-2 flex">
          <div className="flex flex-col">
            <div className="hover:border-cyan-400 rounded-bl cursor-pointer h-full ease pl-4 pt-3 border-l border-b"></div>
            <div className="pt-2"></div>
          </div>
          <div className="w-full">
            <div className="">
              {!!item?.childs &&
                item?.childs.map((child: RelationType) =>
                  renderCategory(child)
                )}
            </div>
            <div
              onClick={() => {
                setModalRelation(true);
                setEditRelation({
                  title: "",
                  parent: item.id,
                });
              }}
              className="cursor-pointer hover:text-cyan-600 text-sm px-2 underline"
            >
              Adicionar
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getCategories = async () => {
    const api = new Api();

    let request: any = await api.bridge({
      url: "categories/list",
    });

    if (!!request?.response) {
      setListRelation(request.data);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  return !!listRelation?.length ? (
    <Template
      header={{
        template: "admin",
        position: "solid",
      }}
    >
      <section className="">
        <div className="container-medium pt-12">
          <div className="flex">
            <div className="w-full">Produtos {">"} Title</div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <div className="underline">Precisa de ajuda?</div>{" "}
              <Icon icon="fa-question-circle" />
            </div>
          </div>
          <div className="flex mt-10 pb-6">
            <div className="w-full">
              <div className="font-title font-bold text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900">
                Configurar filtro
              </div>
            </div>
            <div className="flex gap-6 w-fit">
              <Button
                onClick={() => {
                  setModalRelation(true);
                  setEditRelation({} as RelationType);
                }}
                style="btn-outline-light"
                className="whitespace-nowrap"
              >
                Novo filtro
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section className="">
        <div className="container-medium pb-12">
          <div className="grid gap-2">
            {listRelation.map((item: RelationType, key: any) =>
              renderCategory(item)
            )}
          </div>
        </div>
      </section>
      {modalRelation && (
        <Modal
          title={!!editRelation.id ? "Editando" : "Adicionando"}
          status={modalRelation}
          close={() => setModalRelation(false)}
        >
          <form onSubmit={(e) => saveRelation(e)} className="grid gap-2">
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
                    setModalRelation(false);
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
    </Template>
  ) : (
    <></>
  );
}
