import React from "react";
import { IoEyeOutline } from "react-icons/io5";

interface EyeProps {
    onClick: () => void;
}

const Eye: React.FC<EyeProps> = (props) => {

    return(
        <button
            className="flex text-black justify-center items-center active:text-yellow-300"
        >
            <IoEyeOutline size={25}/>
        </button>
    );
};

export default Eye;