import FileManager from "@/src/components/ui/form/FileManager";
import React, { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { FaTrash } from 'react-icons/fa';

interface ElementModalProps {
    open: boolean;
    onRequestClose: () => void;
    groupId: number;
    elementsChilds: ElementChild[];
}

interface ElementChild {
    text: string;
    id: number;
}

const ElementModal: React.FC<ElementModalProps> = (props) => {
    if (!props.open) return;
    const [icon, setIcon] = useState<string>('');
    const [openSelect, setOpenSelect] = useState<boolean>(false);
    const [selectedList, setSelectedList] = useState<ElementChild[]>([]);

    useEffect(() => {
        console.log(icon)
    }, [icon])

    const onCheckClick = (checked: boolean, value: ElementChild) => {
        if (checked && !selectedList.includes(value)){
            setSelectedList([...selectedList, value])
        }else if(!checked && selectedList.includes(value)){
            setSelectedList(selectedList.filter(item => item !== value))
        }
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] relative gap-5 flex flex-col">
                <h1 className="text-[30px] font-semibold mb-4 text-black underline decoration-[1.5px] decoration-gray-400 underline-offset-8">
                    Criar Elemento
                </h1>
                <button
                    onClick={props.onRequestClose}
                    className="absolute top-3 right-3  text-gray-600 hover:text-gray-800"
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
                            className="py-[.6rem] text-sm p-2"
                        />
                    )}

                    <input className="flex-1 w-full border-[1px] border-black rounded-md p-2" placeholder="Insira o nome do elemento" />
                </div>
                <div className="flex flex-col mt-4 w-full justify-start items-start">
                    <h2 className="text-[20px] font-semibold text-black underline-offset-4">
                        Selecione os elementos relacionados
                    </h2>
                    <p>
                        Categoria
                    </p>
                </div>
                <div className="flex flex-col w-full justify-start items-start relative">
                    <button
                        className="flex flex-row w-full justify-start p-2 items-center rounded-md border-[1.5px] border-black gap-2 flex-wrap"
                        onClick={() => setOpenSelect(!openSelect)}
                    >
                        { selectedList.length > 0 ?  (
                            selectedList.map((value)=>(
                                <div className="h-[30px] p-2 rounded-md flex items-center justify-center bg-yellow-300 text-black">
                                    {value.text}
                                </div>
                            ))
                        ):('Selecione ...')  }
                    </button>

                    <div
                        className={`absolute left-0 top-8 flex flex-col gap-1 w-full overflow-y-auto max-h-[100px] bg-white text-black p-2 rounded-md text-center 
                                    transition-opacity duration-300 
                                     ${openSelect ? "opacity-100 translate-y-2" : "opacity-0 translate-y-2"}`}
                    >
                        {props.elementsChilds.map((value, index) => (
                            <div key={index} className="w-full h-8 flex items-center justify-start gap-2">
                                <input type="checkbox" id={`check-${index}`} onChange={(event)=>{
                                    onCheckClick(event.target.checked, value);
                                }} 
                                className="w-5 h-5 accent-yellow-500" 
                                /> 
                                <label htmlFor={`check-${index}`}>{value.text}</label>
                            </div>
                        ))}
                    </div>

                </div>
            </div>
        </div>
    )
}

export default ElementModal;