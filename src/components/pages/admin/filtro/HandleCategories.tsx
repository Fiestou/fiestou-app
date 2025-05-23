import { RelationType } from "@/src/models/relation";
import { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import HandleCategory from "./HandleCategory";
import Modal from "@/src/components/utils/Modal";
import { Button, Input, Label, Select } from "@/src/components/ui/form";
import FileManager from "@/src/components/ui/form/FileManager";
import { shortId } from "@/src/helper";
import HandleFormCategory from "./HandleFormCategory";
import Api from "@/src/services/api";

const formInitial = {
  edit: "",
  loading: false,
};

export default function HandleCategories({
  list,
  parent,
  emitEdit,
}: {
  list: Array<any>;
  parent?: any;
  emitEdit: Function;
}) {
  const api = new Api();

  const [form, setForm] = useState(formInitial);
  const handleForm = (value: Object) => {
    setForm({ ...form, ...value });
  };

  const [newCategory, setNewCategory] = useState({} as any);
  const handleNew = (value: any) => {
    setNewCategory({ ...newCategory, ...value });
  };

  const [modalNew, setModalNew] = useState(false as boolean);

  const closeModal = () => {
    setNewCategory({});
    setModalNew(false);
  };

  const handleCategories = (reorderList: any) => {
    emitEdit(reorderList);
  };

  const submitNewCategory = async (e: any) => {
    e.preventDefault();

    handleForm({ loading: true });

    const handle: RelationType = {
      id: newCategory.id ?? null,
      title: newCategory.title ?? "",
      slug: newCategory.slug ?? newCategory.title,
      multiple: newCategory.multiple ?? true,
      parent: parent ?? "",
      order: !!list?.length ? list.length + 1 : 0,
      feature: newCategory.feature ?? false,
      closest: newCategory.closest ?? [],
      image: !!newCategory.image?.medias.length
        ? newCategory.image.medias[0].id
        : 0,
    };

    const request: any = await api.bridge({
      method: 'post',
      url: "categories/register",
      data: handle,
    });


    if (request.response) {
      const data = request.data;

      emitEdit([...list, data]);
      closeModal();
    }

    handleForm({ loading: false });
  };

  const handleUpdateChild = (child: any) => {
    const handleList = list.map((item: any) => {
      return item.id == child.id ? child : item;
    });

    emitEdit(handleList);
  };

  const handleRemove = async (child: any) => {
    const request: any = await api.bridge({
      method: 'post',
      url: "categories/remove",
      data: { id: child.id },
    });

    if (request.response) {
      const handleList = list.filter((item: any) => item.id != child.id);
      emitEdit(handleList);
    }
  };

  return (
    <>
      <div className="bg-gray-100 rounded-lg px-2 py-1 items-start">
        {!!list?.length && (
          <ReactSortable
            group={shortId()}
            list={list}
            setList={handleCategories}
            animation={150}
            handle=".item-sort"
            className=""
          >
            {list.map((item: any, key: any) => (
              <div
                key={key}
                className="bg-white border my-1 relative hover:border-gray-400 ease rounded"
              >
                <HandleCategory
                  item={item}
                  emitEdit={(child: any) => handleUpdateChild(child)}
                  emitRemove={(child: any) => handleRemove(child)}
                />
              </div>
            ))}
          </ReactSortable>
        )}
        <div>
          <button
            onClick={() => {
              setNewCategory({
                parent: parent,
              });
              setModalNew(true);
            }}
            className={
              !!parent
                ? "text-sm underline px-2"
                : "bg-white w-full p-2 mb-1 rounded border hover:border-gray-400 ease text-gray-950 font-semibold"
            }
          >
            Adicionar
          </button>
        </div>
      </div>

      <Modal status={modalNew} close={() => closeModal()}>
        <form
          onSubmit={(e: any) => submitNewCategory(e)}
          className="grid gap-2"
        >
          <h4 className="text-xl text-zinc-900 w-full border-b pb-2">
            Adicionar categoria
          </h4>

          <HandleFormCategory
            item={newCategory}
            emit={(handle: any) => handleNew(handle)}
          />

          <div className="mt-5 flex items-center">
            <div className="w-full">
              <Button
                onClick={() => closeModal()}
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
                className="text-sm py-[.65rem] h-full px-4 md:px-6"
              >
                Enviar
              </Button>
            </div>
          </div>
        </form>
      </Modal>
    </>
  );
}
