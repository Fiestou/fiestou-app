import React from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import FileManager from "@/src/components/ui/form/FileManager";

interface CardProps {
    title: string;
    description: string;
    onEditClick: () => void;
    onDeleteClick: () => void;
    onElementClick: (id: string) => void;
    elements: ElementsCard[]
}

export interface ElementsCard {
    text: string;
    icon: string;
    id: string;
}

const Card: React.FC<CardProps> = (props) => {
    return(
        <div className="flex flex-col justify-center items-center relative border-2 border-black rounded-md h-15 w-full p-4 text-black gap-3">
            <button className="absolute top-0 right-0 flex justify-center items-center w-10 h-10 ">
                <BsThreeDotsVertical size={25} />
            </button>

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

            <div className="flex justify-center items-center flex-1 w-full">

                {props.elements.length > 0 ? (
                    props.elements.map((element, index)=>
                        (
                            <div 
                                className="flex justify-center items-center text-black border-2 border-black rounded-md"
                                key={index}  
                            >
                                <label className="flex-3 w-full flex justify-center items-center">
                                    {element.text}
                                </label>

                                <div className="flex-1 w-ful flex justify-center items-centerl">
                                    <img 
                                        src={element.icon}
                                        className="w-5 h-5"
                                        
                                    />
                                </div>
                            </div>
                    ))
                ) : (
                    <button className="flex p-2 rounded-md justify-center items-center text-black bg-yellow-300 active:bg-yellow-200" >
                        Adicionar elemento
                    </button>
                )}
            </div>
        </div>

    )
}

export default Card;