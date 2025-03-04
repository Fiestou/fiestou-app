import React from "react";

interface NewGroupProps {
    onClick: () => void;
    text: string;
    icon: React.ReactElement;
}

const NewGroup: React.FC<NewGroupProps> = (props) => {

    return(
        <button
            className="flex border-2 border-solid border-black text-black rounded-lg justify-center items-center h-10 w-full active:bg-yellow-300 active:text-white active:border-white"
        >
            <label
                className="flex-[3] w-full font-bold"
            >
                {props.text}
            </label>
            <div 
                className="flex-[1] w-full"
            >
                {props.icon}
            </div>
        </button>
    );
};

export default NewGroup;