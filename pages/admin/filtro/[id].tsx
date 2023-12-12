import { Button, Input, Label, Select } from "@/src/components/ui/form";
import FileManager from "@/src/components/ui/form/FileManager";
import Img from "@/src/components/utils/ImgBase";
import Modal from "@/src/components/utils/Modal";
import { getImage } from "@/src/helper";
import Icon from "@/src/icons/fontAwesome/FIcon";
import { RelationType } from "@/src/models/relation";
import Api from "@/src/services/api";
import Template from "@/src/template";
import { NextApiRequest, NextApiResponse } from "next";
import Link from "next/link";
import { useState } from "react";

const requestCategories = (id: any) => {
  return [
    {
      with: { childs: "category" },
      model: `category as categories`,
      orderBy: "`order` ASC",
      filter: [
        {
          key: "parent",
          value: id,
          compare: "=",
        },
      ],
    },
    {
      with: { childs: "category" },
      model: "category as closest",
      orderBy: "`order` ASC",
      filter: [
        {
          key: "parent",
          value: "",
          compare: "=",
        },
      ],
    },
  ];
};

export async function getServerSideProps(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const api = new Api();
  const { id } = req.query;

  let request: any = await api.call(
    {
      url: "request/graph",
      data: [
        {
          model: "category as parentMain",
          id: id,
        },
        ...requestCategories(id),
      ],
    },
    req
  );

  const parentMain = request?.data?.query?.parentMain ?? [];

  return {
    props: {
      parentMain: {},
      categories: [],
      closest: [],
    },
  };
}

const formInitial: any = {
  edit: [],
  loading: false,
};

export default function Categorias({
  parentMain,
  categories,
  closest,
}: {
  parentMain: any;
  categories: Array<RelationType>;
  closest: Array<RelationType>;
}) {
  const api = new Api();
  const [listRelation, setListRelation] = useState(categories as Array<any>);
  const [listClosest, setListClosest] = useState(closest as Array<any>);

  const [form, setForm] = useState(formInitial);
  const handleForm = (value: Object) => {
    setForm({ ...form, ...value });
  };

  const [editRelation, setEditRelation] = useState({
    parent: parentMain.id,
  } as RelationType);
  const resetEditRelation = () => {
    setEditRelation({
      parent: parentMain.id,
    } as RelationType);
  };
  const handleEditRelation = (value: Object) => {
    setEditRelation({ ...editRelation, ...value });
  };

  const [modalRelation, setModalRelation] = useState(false as boolean);

  const sendRelation = async (relation: any) => {
    const closest = [
      parentMain.id,
      relation?.parent,
      ...(relation?.closest ?? []),
    ];

    console.log(
      closest.filter((value, index) => closest.indexOf(value) === index)
    );

    const rel: any = {
      id: relation?.id ?? 0,
      title: relation?.title ?? "",
      slug: relation?.slug ?? relation?.title,
      parent: relation?.parent,
      feature: relation?.feature ?? false,
      closest:
        closest.filter((value, index) => closest.indexOf(value) === index) ??
        [],
      image: relation?.image ?? {},
    };

    const request: any = await api.graph({
      url: "content/graph",
      data: [
        {
          method: "register",
          model: "category",
          id: rel.id,
          title: rel.title,
          slug: rel.slug,
          parent: relation?.parent,
          content: rel,
        },
        ...requestCategories(parentMain.id),
      ],
    });

    if (request.response) {
      setListRelation(request.data?.query?.categories ?? []);
      setListClosest(request.data?.query?.closest ?? []);
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
      resetEditRelation();
    }

    handleForm({ loading: false });
  };

  const removeRelation = async (relation: RelationType) => {
    const request: any = await api.graph({
      url: "content/graph",
      data: [
        {
          method: "delete",
          model: "category",
          id: relation.id,
        },
        ...requestCategories(parentMain.id),
      ],
    });

    if (request.response) {
      setListRelation(request.data?.query?.categories ?? []);
      setListClosest(request.data?.query?.closest ?? []);
    }

    return request;
  };

  const handleClosestRelation = (e: any) => {
    var closest: Array<number> = editRelation?.closest ?? [];

    var handle: any = e.target.checked
      ? [...closest, parseInt(e.target.value)]
      : closest.filter((item) => item !== parseInt(e.target.value));

    handleEditRelation({
      closest: handle,
    });
  };

  const renderCategoriesForm = (category: any, disabled?: any) => {
    return (
      <>
        <label>
          <div className="py-1 flex gap-2 items-center">
            <div>
              <input
                type="radio"
                name="parent"
                value={category.id}
                {...(editRelation?.parent == category.id
                  ? { checked: true }
                  : {})}
                onChange={(e: any) =>
                  handleEditRelation({ parent: parseInt(category.id) })
                }
                {...(disabled || category.id == editRelation.id
                  ? { disabled: true }
                  : {})}
              />
            </div>
            <div className="pb-[2px]">{category.title}</div>
          </div>
        </label>
        {!!category?.childs?.category?.length &&
          category?.childs?.category?.map((sub: RelationType, subKey: any) => (
            <div key={subKey} className="pl-5">
              {renderCategoriesForm(
                sub,
                disabled || category.id == editRelation.id
              )}
            </div>
          ))}
      </>
    );
  };

  const renderClosestForm = (category: any, father?: any, disabled?: any) => {
    const isChecked = !!editRelation?.closest?.includes(category.id);

    const isDisabled = !!disabled;

    const render =
      !editRelation.id ||
      (category.id != editRelation.id &&
        category.parent != editRelation.id &&
        category.id != editRelation.parent);

    return (
      render && (
        <>
          <label>
            <div className="py-1 flex gap-2 items-center">
              <div>
                <input
                  type="checkbox"
                  defaultValue={category?.id ?? ""}
                  {...(isChecked ? { checked: true } : {})}
                  onChange={(e: any) => handleClosestRelation(e)}
                  {...(isDisabled ? { disabled: true } : {})}
                />
              </div>
              <div className="pb-[2px]">{category.title}</div>
            </div>
          </label>
          {!!category?.childs?.category?.length &&
            category?.childs?.category?.map(
              (sub: RelationType, subKey: any) => (
                <div key={subKey} className="pl-5">
                  {renderClosestForm(sub, category, isDisabled)}
                </div>
              )
            )}
        </>
      )
    );
  };

  const handleCollapse = (slug: string) => {
    var collapse: Array<string> = form.edit;

    console.log(collapse);

    handleForm({
      edit: collapse.includes(slug)
        ? (collapse ?? []).filter((item) => item !== slug)
        : [...collapse, slug],
    });
  };

  const renderCategoriesList = (category: any, father?: any) => {
    return (
      <div className="grid gap-2">
        <div className="cursor-pointer flex gap-4 items-center p-2 rounded-md bg-zinc-50 hover:bg-zinc-100 ease">
          <div onClick={() => handleCollapse(category.slug)}>
            <Icon
              icon={
                form.edit.includes(category.slug)
                  ? "fa-caret-down"
                  : "fa-caret-right"
              }
              type="fa"
            />
          </div>
          <div className="w-full flex gap-2 items-center">
            {!!getImage(category?.image) && (
              <div className="w-[1.5rem] h-[1.5rem] bg-white rounded-md p-[.25rem]">
                <Img
                  src={getImage(category?.image)}
                  className="h-full w-full object-contain"
                />
              </div>
            )}
            <div>{category?.title}</div>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setModalRelation(true);
                setEditRelation({
                  ...category,
                  closest: [
                    ...(category?.closest ?? []),
                    ...(father?.closest ?? []),
                  ],
                });
              }}
              type="button"
              className="text-sm"
            >
              editar
            </button>
            <button
              onClick={() => removeRelation(category)}
              type="button"
              className=""
            >
              <Icon icon="fa-trash-alt" />
            </button>
          </div>
        </div>
        {form.edit.includes(category.slug) && (
          <>
            {!!category?.childs?.category && (
              <div className="grid gap-2">
                {category?.childs?.category?.map(
                  (sub: RelationType, subKey: any) => (
                    <div key={subKey} className="pl-5 relative">
                      <div className="absolute h-[calc(100%-1rem)] border-l border-b pl-2 top-0 left-0 ml-8"></div>
                      <div className="relative">
                        {renderCategoriesList(sub)}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
            <div className="pl-5 relative pb-2">
              <div
                onClick={() => {
                  setModalRelation(true);
                  setEditRelation({
                    parent: category.id,
                    closest: [...category.closest, category.parent],
                  } as RelationType);
                }}
                className="cursor-pointer hover:text-yellow-600 text-sm px-2 underline"
              >
                Adicionar
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
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
          <div className="flex mt-10 pb-6 items-end">
            <div className="w-full">
              <div className="flex items-center">
                <Link passHref href="/admin/filtro">
                  <Icon
                    icon="fa-long-arrow-left"
                    className="mr-6 text-2xl text-zinc-900"
                  />
                </Link>
                <div className="font-title font-bold text-3xl lg:text-4xl flex gap-4 items-center text-zinc-900 w-full">
                  {parentMain.title}
                </div>
              </div>
            </div>
            <div className="flex gap-6 w-fit">
              <Button
                style="btn-outline-light"
                onClick={() => {
                  setModalRelation(true);
                  resetEditRelation();
                }}
                className="whitespace-nowrap"
              >
                Adicionar
              </Button>
            </div>
          </div>
        </div>
      </section>
      <section className="">
        <div className="container-medium pb-12">
          <div className="grid gap-2 -ml-5">
            {!!listRelation &&
              listRelation
                .filter((handle) => handle.parent == parentMain.id)
                .map((handle: any, key) => (
                  <div key={key} className="pl-5 relative">
                    <div className="absolute h-[calc(100%-1rem)] border-l border-b pl-2 top-0 left-0 ml-8"></div>
                    <div className="relative">
                      {renderCategoriesList(handle)}
                    </div>
                  </div>
                ))}
          </div>
        </div>
      </section>

      {!!modalRelation && (
        <Modal
          title={!!editRelation?.id ? "Editar categoria" : "Nova categoria"}
          status={modalRelation}
          close={() => setModalRelation(false)}
        >
          <form onSubmit={(e) => saveRelation(e)} className="grid gap-4">
            <div className="form-group">
              <Label style="float">Nome</Label>
              <Input
                value={editRelation?.title}
                onChange={(e: any) =>
                  handleEditRelation({
                    title: e.target.value,
                  })
                }
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
                value={!!editRelation?.feature ? "on" : "off"}
                className="py-2"
                name="destaque"
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
            <div className="form-group">
              <FileManager
                value={editRelation?.image}
                onChange={(value: any) =>
                  handleEditRelation({
                    image: value,
                  })
                }
                options={{
                  dir: "categories",
                  type: "thumb",
                }}
                className="py-[.6rem] text-sm"
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="form-group">
                <Label style="float">Categorias pai</Label>
                <div className="border rounded-md text-sm px-3 pb-1 pt-4 h-[24rem] overflow-y-scroll">
                  {!!listRelation.length ? (
                    listRelation
                      .filter((handle) => handle.parent == parentMain.id)
                      .map((handle: any, index: any) => (
                        <div key={index}>{renderCategoriesForm(handle)}</div>
                      ))
                  ) : (
                    <div className="text-center p-4 text-sx opacity-50">
                      Ainda não existem categorias neste filtro.
                    </div>
                  )}
                </div>
              </div>
              <div className="form-group">
                <Label style="float">Relacionado à</Label>
                <div className="border rounded-md text-sm px-3 pb-1 pt-4 h-[24rem] overflow-y-scroll">
                  {listClosest &&
                    listClosest
                      .filter((handle) => !handle.parent)
                      .map((handle: any, index: any) => (
                        <div key={index} className="grid gap-1">
                          {renderClosestForm(handle)}
                        </div>
                      ))}
                </div>
              </div>
            </div>
            <div className="mt-5 flex items-center">
              <div className="w-full">
                <Button
                  onClick={() => {
                    setModalRelation(false);
                    resetEditRelation();
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
  );
}
