import React, { useEffect, useState, useRef } from "react";
import Api from "@/src/services/api";
import ElementModal, { ReturnElementData } from "./modals/ElementModal";
import { toast } from "react-toastify";
import DeleteModal from "./modals/DeleteModal";
import { categorie } from "@/src/store/filter";
import { ElementsResponse, GenericResponse } from "@/src/types/filtros";
import Icon from "@/src/icons/fontAwesome/FIcon";

interface FilterGroupCardProps {
  title: string;
  description: string;
  relatedElements: categorie[];
  onEditClick: (id: number) => void;
  elements: categorie[];
  isTargetGroup?: boolean;
  id: number;
  onAddElementClick?: (currentGroupId: number) => void;
  onDeleteGroup: () => void;
  onRefresh?: () => void;
  allIcons?: string[];
}

const FilterGroupCard: React.FC<FilterGroupCardProps> = (props) => {
  const api = new Api();

  const [menuOpen, setMenuOpen] = useState(false);
  const [updateElement, setUpdateElement] = useState<categorie | null>(null);
  const [openElementModal, setOpenElementModal] = useState(false);
  const [openDeleteModal, setOpenDeleteModal] = useState(false);
  const [localElements, setLocalElements] = useState<categorie[]>([]);
  const [elementsRelatedDetails, setElementsRelatedDetail] = useState<categorie[]>([]);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const onSaveElement = async (data: ReturnElementData) => {
    let request: ElementsResponse;
    setUpdateElement(null);

    if (data.id) {
      request = await api.bridge<ElementsResponse>({
        method: "put",
        url: `element/update/${data.group_id}/${data.id}`,
        data: data,
      });
      if (request.response) {
        setLocalElements((prev) =>
          prev.map((el) =>
            el.id === data.id
              ? { ...el, name: data.name, icon: data.icon, element_related_id: data.element_related_id }
              : el
          )
        );
        toast.success("Elemento atualizado");
      }
    } else {
      request = await api.bridge<ElementsResponse>({
        method: "post",
        url: `element/register/${data.group_id}`,
        data: data,
      });

      if (request.response && request.data instanceof Object) {
        const newElement = request.data as unknown as categorie;
        setLocalElements((prev) => [
          ...prev,
          {
            id: newElement.id,
            name: newElement.name,
            icon: newElement.icon,
            element_related_id: newElement.element_related_id,
            group_id: newElement.group_id,
          },
        ]);
        toast.success("Elemento adicionado");
      } else {
        toast.error("Erro ao salvar o elemento.");
        return;
      }
    }

    if (!request.response) {
      toast.error("Erro ao salvar o elemento.");
      return;
    }

    setOpenElementModal(false);
  };

  const onDeleteGroup = async () => {
    const request = await api.bridge<GenericResponse>({
      method: "delete",
      url: `group/delete/${props.id}`,
    });

    if (request.response) {
      toast.success("Grupo removido");
      props.onDeleteGroup();
    } else {
      toast.error("Erro ao deletar o grupo.");
    }

    setOpenDeleteModal(false);
  };

  const onDeleteElement = async (elementId: number) => {
    const request = await api.bridge<GenericResponse>({
      method: "delete",
      url: `group/${props.id}/element/${elementId}`,
    });

    if (request.response) {
      setLocalElements((prev) => prev.filter((el) => el.id !== elementId));
      toast.success("Elemento removido");
    } else {
      toast.error("Erro ao deletar o elemento.");
    }
  };

  useEffect(() => {
    if (props.elements) setLocalElements(props.elements);
  }, []);

  useEffect(() => {
    if (!openElementModal) setUpdateElement(null);
  }, [openElementModal]);

  useEffect(() => {
    const related = props.relatedElements.filter((el) =>
      updateElement?.element_related_id?.includes(el.id)
    );
    setElementsRelatedDetail(related);
  }, [updateElement]);

  const openDetails = (elementId: number) => {
    props.onAddElementClick && props.onAddElementClick(props.id);
    if (localElements.length <= 0) return;
    const el = localElements.find((e) => e.id === elementId) || null;
    setUpdateElement(el);
    setOpenElementModal(true);
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  return (
    <div className="bg-white border rounded-xl p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-zinc-900">{props.title}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-500">
              {localElements.length} {localElements.length === 1 ? "elemento" : "elementos"}
            </span>
          </div>
          {props.description && (
            <p className="text-sm text-zinc-400 mt-1">{props.description}</p>
          )}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 transition-colors text-zinc-400"
          >
            <Icon icon="fa-ellipsis-v" type="far" className="text-sm" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 bg-white border rounded-lg shadow-lg py-1 z-10 min-w-[140px]">
              <button
                onClick={() => {
                  props.onEditClick(props.id);
                  setMenuOpen(false);
                }}
                className="w-full text-left px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50 flex items-center gap-2"
              >
                <Icon icon="fa-pen" type="far" className="text-xs text-zinc-400" />
                Editar grupo
              </button>
              {!props.isTargetGroup && (
                <button
                  onClick={() => {
                    setOpenDeleteModal(true);
                    setMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Icon icon="fa-trash" type="far" className="text-xs" />
                  Excluir grupo
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {localElements.map((element) => (
          <div
            key={element.id}
            className="group flex items-center gap-2 px-3 py-2 bg-zinc-50 border rounded-lg hover:border-zinc-300 transition-colors"
          >
            <button
              onClick={() => openDetails(element.id)}
              className="flex items-center gap-2"
            >
              {element.icon && (
                <img
                  alt={element.name}
                  src={element.icon}
                  className="w-5 h-5 object-contain"
                />
              )}
              <span className="text-sm text-zinc-700">{element.name}</span>
            </button>
            <button
              onClick={() => onDeleteElement(element.id)}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-zinc-300 hover:text-red-500 ml-1"
            >
              <Icon icon="fa-times" type="far" className="text-xs" />
            </button>
          </div>
        ))}

        <button
          onClick={() => {
            setOpenElementModal(true);
            props.onAddElementClick && props.onAddElementClick(props.id);
          }}
          className="flex items-center gap-2 px-3 py-2 border border-dashed border-zinc-300 rounded-lg text-sm text-zinc-400 hover:border-zinc-400 hover:text-zinc-600 transition-colors"
        >
          <Icon icon="fa-plus" type="far" className="text-xs" />
          Adicionar
        </button>
      </div>

      <ElementModal
        data={updateElement}
        localElementsRelatedDetails={elementsRelatedDetails}
        onSaveClick={onSaveElement}
        grouptargeadc={props.isTargetGroup}
        groupId={props.id || 0}
        relatedElements={props.relatedElements}
        onRequestClose={() => setOpenElementModal(false)}
        open={openElementModal}
        existingIcons={props.allIcons}
      />

      <DeleteModal
        onSaveClick={onDeleteGroup}
        onRequestClose={() => setOpenDeleteModal(false)}
        open={openDeleteModal}
        title={"Excluir grupo?"}
        info={"Os elementos e relações desse grupo serão perdidos."}
      />
    </div>
  );
};

export default FilterGroupCard;
