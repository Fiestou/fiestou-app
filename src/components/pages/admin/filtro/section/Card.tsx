import React, { useEffect, useState, useRef } from "react";
import { Element, ElementResponse, ElementsResponse, GenericResponse, GroupResponse, GroupsResponse } from "@/src/types/filtros/response";
import Api from "@/src/services/api";
import ElementModal, { ReturnElementData } from "../modals/ElementModal";
import { toast } from "react-toastify";
import { X, Trash2, Pencil, EllipsisVertical, Plus } from "lucide-react";
import DeleteModal from "../modals/DeleteModal";
import { elements } from "chart.js";

interface CardProps {
    title: string;
    description: string;
    relatedElements: Element[];
    onEditClick: (id: number) => void;
    elements: Element[];
    grouptargeadc?: boolean;
    id: number;
    onAddElementClick?: (currentGroupId: number) => void;
    onDeleteGroup: () => void;
}


const Card: React.FC<CardProps> = (props) => {
    const api = new Api();

    const [isTooltipVisible, setTooltipVisible] = useState(false);
    const [updateElement, setUpdateElement] = useState<Element | null>(null);
    const [openElementModal, setOpenElementModal] = useState(false);
    const [openGroupDeleteModal, setGroupOpenDeleteModal] = useState(false);
    const [hoveredElement, setHoveredElement] = useState<number | null>(null);
    const [localElements, setLocalElements] = useState<Element[]>([]);
    const [elementsRelatedDetails, setElementsRelatedDetail] = useState<Element[]>([]);
    const tooltipRef = useRef<HTMLDivElement | null>(null);



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
                    prev.map((el) => (el.id === data.id ? { ...el, name: data.name, icon: data.icon , element_related_id: data.element_related_id} : el))
                );
            }
        } else {
            request = await api.bridge<ElementsResponse>({
                method: "post",
                url: `element/register/${data.group_id}`,
                data: data
            });

            //MELHORAR NO FUTURO
            if (request.response && request.data instanceof Object) {
                const newElement = request.data as unknown as Element;
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
                toast.success("Elemento adicionado com sucesso");
            } else {
                toast.error("Não foi possível salvar o elemento.");
            }

        }

        if (!request.response) {
            toast.error("Não foi possível salvar o elemento.");
            return;
        }

        setOpenElementModal(false);
        toast.success("Elemento adicionado com sucesso");
    };

    const onSaveDeleteGroup = async () => {
        const request = await api.bridge<GenericResponse>({
            method: "delete",
            url: `group/delete/${props.id}`,
        });

        if (request.response) {
            toast.success("Card deletado com sucesso");
            props.onDeleteGroup();
        } else {
            toast.error("Erro ao deletar o grupo.");
        }

        setGroupOpenDeleteModal(false);
    };

    const onSaveDeleteElementsGroup = async (elementId: number) => {
        const request = await api.bridge<GenericResponse>({
            method: "delete",
            url: `group/${props.id}/element/${elementId}`,
        });

        if (request.response) {
            setLocalElements((prev) => prev.filter((el) => el.id !== elementId));
            toast.success("Elemento deletado com sucesso");
        } else {
            toast.error("Erro ao deletar o elemento.");
        }
    };

    useEffect(() => {
        if (props.elements) {
            setLocalElements(props.elements);
        }
    }, []);

    useEffect(() => {
        if (!openElementModal) {
            setUpdateElement(null);
        }
    }, [openElementModal]);

    useEffect(() => {
        const elementsRelated = props.relatedElements.filter((el) =>
            updateElement?.element_related_id?.includes(el.id)
        );

        setElementsRelatedDetail(elementsRelated);
    }, [updateElement])

    const DetailsElement = async (elementId: number) => {

        props.onAddElementClick && props.onAddElementClick(props.id)

        if (localElements.length <= 0) return;

        const elemento = localElements.find((el) => el.id === elementId) || null;

        setUpdateElement(elemento);
        setOpenElementModal(true);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                setTooltipVisible(false);
            }
        }

        if (isTooltipVisible) {
            document.addEventListener("mousedown", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isTooltipVisible]);

    console.log("props.relatedElementsasdasdasdasdx", props.grouptargeadc);

    return (
        <div className="flex flex-col justify-center items-center relative border-2 border-black rounded-md h-15 w-full p-4 text-black gap-3">
            <button
                className="absolute top-0 right-0 flex justify-center items-center w-10 h-10"
                onClick={() => setTooltipVisible(!isTooltipVisible)}
            >
                <EllipsisVertical size={25} />
            </button>
            {isTooltipVisible && (
                <div
                    ref={tooltipRef}
                    className="absolute top-8 right-4 bg-white text-black text-sm p-2 rounded-md whitespace-nowrap border-2 border-black flex flex-col gap-2"
                >
                    <button
                        onClick={() => props.onEditClick(props.id)}
                        className="flex p-1 gap-2 justify-center items-center text-black hover:bg-gray-200 rounded-md"
                    >
                        <div className="flex-1 w-full flex justify-center items-center cursor-pointer">
                            <Pencil size={20} />
                        </div>
                        <label className="flex-2 w-full flex justify-start items-start cursor-pointer">Editar</label>
                    </button>
                    {!props.grouptargeadc && (
                        <button
                            onClick={() => setGroupOpenDeleteModal(true)}
                            className="flex p-1 gap-2 justify-start items-start text-black hover:bg-gray-200 rounded-md"
                        >
                            <div className="flex-1 w-full flex justify-start items-center cursor-pointer">
                                <Trash2 size={20} />
                            </div>
                            <label className="flex-2 w-full flex justify-center items-center cursor-pointer">Excluir</label>
                        </button>
                    )}
                    
                </div>
            )}

            <div className="flex justify-center items-center flex-1 w-full">
                <h1 className="font-bold text-xl">{props.title}</h1>
            </div>

            <div className="flex justify-center items-start flex-1 w-full min-h-10">
                <p>{props.description}</p>
            </div>

            <div className="flex justify-center items-center flex-1 w-full gap-1 flex-wrap">
                {localElements.length > 0 ? (
                    localElements
                        .map((element) => (
                            <div
                                className="flex p-1 gap-1 justify-center items-center text-black border-2 border-black rounded-md"
                                key={element.id}
                                onMouseEnter={() => setHoveredElement(element.id)}
                                onMouseLeave={() => setHoveredElement(null)}
                            >
                                <button
                                    onClick={() => { { DetailsElement(element.id) } }}
                                    className="flex gap-2 justify-center items-center"
                                    id={`button-element-${element.id}`}
                                >
                                    <div className="flex-1 w-full flex justify-center items-center">
                                        <img alt={"icon"} src={element.icon} className="max-w-[25px] max-h-[25px]" />
                                    </div>
                                    <label
                                        htmlFor={`button-element-${element.id}`}
                                        className="flex-2 w-full flex justify-center items-center cursor-pointer"
                                    >
                                        {element.name}
                                    </label>
                                </button>

                                {hoveredElement === element.id && (
                                    <button onClick={() => onSaveDeleteElementsGroup(element.id)}>
                                        <X color="rgb(100, 100, 100)" size={20} />
                                    </button>
                                )}
                            </div>
                        ))
                        .concat(
                            <button
                              key="add-element-button"
                              onClick={() => {
                                setOpenElementModal(true);
                                props.onAddElementClick && props.onAddElementClick(props.id);
                              }}
                              className="flex justify-center items-center p-[6px] rounded-md bg-yellow-300 border-2 border-black active:bg-yellow-300 active:text-white active:border-white"
                            >
                              <Plus size={20} />
                            </button>
                          )                          
                ) : (
                    <button
                        onClick={() => setOpenElementModal(true)}
                        className="flex p-2 rounded-md justify-center items-center text-black bg-yellow-300 active:bg-yellow-200"
                    >
                        Adicionar elemento
                    </button>
                )}
            </div>

            <ElementModal
                data={updateElement}
                localElementsRelatedDetails={elementsRelatedDetails}
                onSaveClick={onSaveElement}
                grouptargeadc={props.grouptargeadc}
                groupId={props.id || 0}
                relatedElements={props.relatedElements}
                onRequestClose={() => setOpenElementModal(false)}
                open={openElementModal}
            />

            <DeleteModal
                onSaveClick={onSaveDeleteGroup}
                onRequestClose={() => setGroupOpenDeleteModal(false)}
                open={openGroupDeleteModal}
                title={"Tem certeza que deseja excluir?"}
                info={"Você pode perder as relações desse grupo"}
            />
        </div>
    );
};

export default Card;
