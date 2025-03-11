import FileManager from "@/src/components/ui/form/FileManager";
import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { FaTrash } from 'react-icons/fa';
import SelectElements from "../selectElements/selectElements";
import { Element } from "@/pages/admin/filtro/types/response";

interface ElementModalProps {
    open: boolean;
    onRequestClose: () => void;
    groupId: number;
    relatedElements: ElementChild[];
    onSaveClick: (data: ReturnElementData) => void;
    data?: Element | null
}

export interface ElementChild {
    name: string;
    id: number;
    icon: string;
    checked: boolean;
}

export interface ReturnElementData {
    id?: string,
    id_group: number,
    icon: string,
    name: string,
    description: string,
    childElements: number[]
}

const ElementModal: React.FC<ElementModalProps> = (props) => {
    if (!props.open) return null;
    const [icon, setIcon] = useState<string>('');
    const [name, setName] = useState<string>('');
    const [description, setDescription] = useState<string>('');
    const [openSelect, setOpenSelect] = useState<boolean>(false);
    const [selectedList, setSelectedList] = useState<ElementChild[]>([]);

    const data: ReturnElementData = {
        id_group: props.groupId,
        icon: icon,
        name: name,
        description: description,
        childElements: selectedList
            .filter((value) => value.checked)
            .map((value) => value.id)
    }

    useEffect(() => {
        console.log(props.data)
        if (props.data) {
            setIcon(props.data.icon);
            setName(props.data.name);
            setDescription(props.data.description);
            if (props.data.descendents) {
                setSelectedList(props.data.descendents);
            }
        }
    }, [props.data])

    useEffect(() => {
        console.log(selectedList)
    }, [selectedList])

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] relative gap-5 flex flex-col">
                <h1 className="text-[30px] font-semibold mb-4 text-black underline decoration-[1.5px] decoration-gray-400 underline-offset-8">
                    Criar Elemento
                </h1>
                <button
                    onClick={props.onRequestClose}
                    className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
                >
                    <IoClose size={25} />
                </button>

                <div className="flex flex-row w-full gap-3 justify-center items-center">
                    {icon !== '' ? (
                        <button onClick={() => { setIcon('') }} className="relative p-2 bg-transparent border-none cursor-pointer group">
                            <img
                                src={icon}
                                alt="icon"
                                className="w-6 h-6 transition-opacity duration-200 group-hover:opacity-0"
                            />
                            <FaTrash
                                className="absolute inset-0 m-auto text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-4 h-4"
                            />
                        </button>
                    ) : (
                        <FileManager
                            multiple={false}
                            value={icon}
                            onChange={(value: any) => {
                                if (value) {
                                    setIcon(value.medias[0].base_url + value.medias[0].permanent_url)
                                }
                            }}
                            options={{
                                dir: "categories",
                                type: "thumb",
                            }}
                            className="py-[.6rem] text-sm p-2 z-50"
                        />
                    )}
                    <input
                        value={name}
                        onChange={(event) => { setName(event.target.value) }}
                        className="flex-1 w-full border-[1px] border-black rounded-md p-2"
                        placeholder="Insira o nome do elemento"
                    />
                </div>
                <div className="flex flex-col w-full items-start justify-start gap-2">
                    <h2 className="text-[20px] font-semibold text-black underline-offset-4">
                        Descrição
                    </h2>
                    <textarea
                        value={description}
                        onChange={(event) => { setDescription(event.target.value) }}
                        className="flex-1 w-full border-[1px] border-gray-500 min-h-[90px] rounded-md p-2" placeholder="Digite aqui a descrição do elemento" />
                </div>
                <div className="flex flex-col w-full justify-start items-start">
                    <h2 className="text-[20px] font-semibold text-black underline-offset-4">
                        Selecione os elementos relacionados
                    </h2>
                    <p>Categoria</p>
                </div>

                <SelectElements
                    selectedList={selectedList}
                    onRequestClose={() => {
                        setOpenSelect(false);
                    }}
                    onRequestOpen={() => setOpenSelect(!openSelect)}
                    open={openSelect}
                    relatedElements={props.relatedElements}
                />

                <div className="flex w-full justify-end gap-3">
                    <button onClick={props.onRequestClose}
                        className={`flex ${!openSelect && ('z-10')} justify-center w-[100px] items-center p-2 text-yellow-400 border-2 border-yellow-400 rounded-md active:bg-yellow-400 active:text-white`}>
                        Cancelar
                    </button>
                    <button onClick={() => props.onSaveClick(data)}
                        className={`flex ${!openSelect && ('z-10')} justify-center w-[100px] items-center p-2 bg-yellow-400 text-white border-2 border-yellow-400 rounded-md active:bg-white active:text-yellow-400`}>
                        Salvar
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ElementModal;
