import Img from "@/src/components/utils/ImgBase";
import Icon from "@/src/icons/fontAwesome/FIcon";
import HandleCategories from "./HandleCategories";
import { getImage } from "@/src/helper";
import { useEffect, useState } from "react";
import { Button, Input, Label, Select } from "@/src/components/ui/form";
import FileManager from "@/src/components/ui/form/FileManager";
import Modal from "@/src/components/utils/Modal";
import HandleFormCategory from "./HandleFormCategory";
import Api from "@/src/services/api";
import { RelationType } from "@/src/models/relation";

const formInitial = {
  edit: "",
  loading: false,
};

export default function HandleCategory({
  item,
  emitEdit,
  emitRemove,
}: {
  item: any;
  emitEdit: Function;
  emitRemove: Function;
}) {
  const api = new Api();

  const [form, setForm] = useState(formInitial);
  const handleForm = (value: Object) => {
    setForm({ ...form, ...value });
  };

  const [modalEdit, setModalEdit] = useState(false as boolean);
  const [itemRemove, setItemRemove] = useState(false as boolean);

  const [itemEdit, setItemEdit] = useState({} as any);
  const handleEdit = (value: any) => {
    setItemEdit({ ...item, ...value });
  };

  const handleItemEdit = (value: any) => {
    emitEdit({ ...item, ...value });
  };

  const submitEdit = async (e: any) => {
    e.preventDefault();

    handleForm({ loading: true });

    const handle: RelationType = {
      id: itemEdit.id ?? null,
      title: itemEdit.title ?? "",
      slug: itemEdit.slug ?? itemEdit.title,
      multiple: itemEdit.multiple ?? true,
      parent: itemEdit.parent ?? "",
      feature: itemEdit.feature ?? false,
      closest: itemEdit.closest ?? [],
      image: !!itemEdit.image?.medias.length ? itemEdit.image.medias[0].id : 0,
    };

    const request: any = await api.bridge({
      method: "post",
      url: "categories/register",
      data: handle,
    });

    if (request.response) {
      const data = request.data;

      emitEdit(data);
      closeModal();
    }

    handleForm({ loading: false });
  };

  const closeModal = () => {
    setItemEdit(item);
    setModalEdit(false);
  };

  useEffect(() => {
    setItemEdit(Object.assign({}, item));
  }, [item]);

  return (
    <>
      <div className="group px-3 py-2 flex items-center gap-2 relative">
        <div className="item-sort grid text-xs cursor-move">
          <Icon icon="fa-caret-up" type="fa" />
          <Icon icon="fa-caret-down" type="fa" className="-mt-1" />
        </div>
        {!!getImage(item?.image) && (
          <div className="aspect-[1/1] max-w-[2rem]">
            <Img
              className="w-full h-full object-contain"
              src={getImage(item.image)}
            />
          </div>
        )}
        <div className="w-full">{item.title}</div>
        {itemRemove ? (
          <div className="relative w-full z-[10]">
            <div className="bg-white top-0 right-0 -mt-2 -mr-2 absolute w-full max-w-[32rem] p-3 border rounded-lg">
              <div className="pb-4 text-sm">
                Ao excluir este item também serão excluídos todos
                relacionamentos desta categoria com produtos e todas as
                subcategorias. Deseja continuar com esta ação?
              </div>
              <div className="flex justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setItemRemove(false)}
                  className="text-sm cursor-pointer hover:text-cyan-600 hover:underline"
                >
                  cancelar
                </button>
                <div
                  onClick={() => {
                    emitRemove(item);
                    setItemRemove(false);
                  }}
                  className="text-sm whitespace-nowrap cursor-pointer hover:text-red-800 text-red-500 hover:underline"
                >
                  confirmar e excluir
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div
              className="text-sm cursor-pointer hover:text-cyan-600 hover:underline"
              onClick={() => setItemRemove(itemEdit.id)}
            >
              excluir
            </div>
            <div
              className="text-sm cursor-pointer hover:text-cyan-600 hover:underline"
              onClick={() => setModalEdit(true)}
            >
              editar
            </div>
          </>
        )}
      </div>
      <div className={`px-2 pb-2`}>
        <HandleCategories
          list={itemEdit?.childs}
          parent={itemEdit.id}
          emitEdit={(reorderList: any) =>
            handleItemEdit({ childs: reorderList })
          }
        />
      </div>

      {modalEdit && (
        <Modal status={modalEdit} close={() => closeModal()}>
          <form onSubmit={(e: any) => submitEdit(e)} className="grid gap-2">
            <h4 className="text-xl text-zinc-900 w-full border-b pb-2">
              Editando categoria
            </h4>
            <HandleFormCategory
              item={itemEdit}
              emit={(handle: any) => handleEdit(handle)}
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
                  Salvar
                </Button>
              </div>
            </div>
          </form>
        </Modal>
      )}
    </>
  );
}
