import React, { useState, useEffect } from "react";

interface NewGroupProps {
    onClick: () => void;
    text: string;
    icon: React.ReactElement;
}

const NewGroup: React.FC<NewGroupProps> = (props) => {
    const [isMobile, setIsMobile] = useState(false); 

    useEffect(() => {
        setIsMobile(window.innerWidth <= 768);

        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <button
            onClick={props.onClick}
            className={`flex border-2 border-solid border-black text-black rounded-lg justify-center items-center w-full 
                ${isMobile ? "h-8" : "h-10"} 
                active:bg-yellow-300 active:text-white active:border-white`}
        >
            {!isMobile && (
                <label className="flex-[5] w-full font-bold cursor-pointer">
                    {props.text}
                </label>
            )}
            <div className="flex-[1] w-full">
                {props.icon}
            </div>
        </button>
    );
};

export default NewGroup;