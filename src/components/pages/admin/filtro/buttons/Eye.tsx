import React from "react";
import { Eye } from 'lucide-react';

interface EyeProps {
    onClick: () => void;
}

const EyeButton: React.FC<EyeProps> = (props) => {

    return(
        <button
            className="flex text-black justify-center items-center active:text-yellow-300"
        >
            <Eye size={25}/>
        </button>
    );
};

export default EyeButton;