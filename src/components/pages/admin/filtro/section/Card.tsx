import React, { useEffect, useState } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { GoPlus } from "react-icons/go";
import { FaPen } from "react-icons/fa";
import { FaRegTrashAlt } from "react-icons/fa";
import { Element, ElementResponse, ElementsResponse, GroupResponse } from "@/pages/admin/filtro/types/response";
import Api from "@/src/services/api";
import ElementModal, { ReturnElementData } from "../modals/ElementModal";

interface CardProps {
    title: string;
    description: string;
    onEditClick: () => void;
    onDeleteClick: () => void;
    elements: ElementsCard[];
    id: number;
}

export interface ElementsCard {
    name: string;
    icon: string;
    id: number;
}

const Card: React.FC<CardProps> = (props) => {
    const api = new Api();

    const [isTooltipVisible, setTooltipVisible] = useState(false);
    const [updateElement, setUpdateElement] = useState<Element | null>(null);
    const [openElementModal, setOpenElementModal] = useState(false);
    const [relatedElements, setRelatedElements] = useState<Element[]>([]);

    const onElementClicked = async (elementId: number) => {
        const request = await api.bridge<ElementResponse>({
            method: "get",
            url: `element/get/${elementId}`,
        });

        if (!request.response) {
            //alert
        }

        setUpdateElement(request.data)
        setOpenElementModal(true)
    }

    const getRelatedElements = async () => {
        const request = await api.bridge<ElementsResponse>({
            method: "get",
            url: "element/list",
        });

        if (request.response) {
            setRelatedElements(request.data)
        }
    }

    const onSaveElement = async (data: ReturnElementData) => {
        let request;
        console.log(data)
        if (data.id) {
            request = await api.bridge<GroupResponse>({
                method: "put",
                url: `element/update/${data.id}`,
                data: data
            });
        } else {
            request = await api.bridge<GroupResponse>({
                method: "post",
                url: "element/register",
                data: data
            });
        }

        if (!request.response) {

        }

        setOpenElementModal(false);
    }

    useEffect(() => {
        getRelatedElements();
    }, [])

    useEffect(() => {
        if (openElementModal === false) {
            setUpdateElement(null)
        }
    }, [openElementModal])

    return (
        <div className="flex flex-col justify-center items-center relative border-2 border-black rounded-md h-15 w-full p-4 text-black gap-3">
            <button
                className="absolute top-0 right-0 flex justify-center items-center w-10 h-10"
                onClick={() => setTooltipVisible(!isTooltipVisible)}
            >
                <BsThreeDotsVertical size={25} />
            </button>
            {isTooltipVisible && (
                <div className="absolute top-8 right-4 bg-white text-black text-sm p-2 rounded-md whitespace-nowrap border-2 border-black flex flex-col gap-2">
                    <button className="flex p-1 gap-2 justify-center items-center text-black hover:bg-gray-200 rounded-md">
                        <div className="flex-1 w-ful flex justify-center items-center">
                            <FaPen size={20} />
                        </div>
                        <label className="flex-2 w-full flex justify-start items-start">
                            Editar
                        </label>
                    </button>
                    <button className="flex p-1 gap-2 justify-start items-start text-black  hover:bg-gray-200 rounded-md">
                        <div className="flex-1 w-ful flex justify-start items-center">
                            <FaRegTrashAlt size={20} />
                        </div>
                        <label className="flex-2 w-full flex justify-center items-center">
                            Excluir
                        </label>
                    </button>
                </div>
            )}

            <div className="flex justify-center items-center flex-1 w-full">
                <h1 className="font-bold text-xl">
                    {props.title}
                </h1>
            </div>

            <div className="flex justify-center items-start flex-1 w-full min-h-10">
                <p>
                    {props.description}
                </p>
            </div>

            <div className="flex justify-center items-center flex-1 w-full">
                <h1 className="font-bold text-xl">
                    Elementos
                </h1>
            </div>

            <div className="flex justify-center items-center flex-1 w-full gap-1 flex-wrap">

                {props.elements.length > 0 ? (
                    props.elements.map((element, index) =>
                    (
                        <button
                            className="flex p-1 gap-1 justify-center items-center text-black border-2 border-black rounded-md"
                            key={element.id}
                            onClick={() => { onElementClicked(element.id) }}
                            id={`button-element-${element.id}`}
                        >
                            <div className="flex-1 w-ful flex justify-center items-center">
                                <img
                                    src={element.icon}
                                    className="max-w-[25px] max-h-[25px]" />
                            </div>
                            <label htmlFor={`button-element-${element.id}`} className="flex-2 w-full flex justify-center items-center">
                                {element.name}
                            </label>
                        </button>
                    )).concat(
                        <button
                            onClick={() => setOpenElementModal(true)}
                            className="flex justify-center items-center p-1 rounded-md bg-yellow-300 border-2 border-black active:bg-yellow-300 active:text-white active:border-white">
                            <GoPlus size={25} />
                        </button>
                    )
                ) : (
                    <button onClick={() => setOpenElementModal(true)} className="flex p-2 rounded-md justify-center items-center text-black bg-yellow-300 active:bg-yellow-200" >
                        Adicionar elemento
                    </button>
                )}
            </div>

            <ElementModal
                data={updateElement}
                onSaveClick={onSaveElement}
                groupId={props.id || 0}
                relatedElements={relatedElements}
                onRequestClose={() => { setOpenElementModal(false) }}
                open={openElementModal}
            />
        </div>

    )
}

export default Card;