import React from "react";
import { BsThreeDotsVertical } from "react-icons/bs";

interface CardProps {
    title: string;
    description: string;
    onEditClick: () => void;
    onDeleteClick: () => void;
    elements: ElementsCard[]
}

export interface ElementsCard {
    onClick: (id: string) => void;
    text: string;
    icon: string;
}

const Card: React.FC<CardProps> = (props) => {
    return(
        <div className="flex flex-col justify-center items-center relative border-2 border-black rounded-md h-15 w-full p-4 text-black">
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
                
            </div>

        </div>

    )
}

export default Card;