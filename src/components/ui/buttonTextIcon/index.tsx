import { ReactNode, useState } from "react";

interface ButtonTextIconProps {
    icon?: ReactNode;
    title: string;
    onSelect?: (value: boolean) => void;
    active?: boolean;
    disabled?: boolean;
}

export default function ButtonTextIcon({
    icon,
    title,
    disabled = false,
    onSelect,
    active = false,
}: ButtonTextIconProps) {
    const [isActive, setIsActive] = useState(active);

    const handleClick = () => {
        if (!disabled) {
            setIsActive(true);
            onSelect?.(!active);
        }
    };

    return (
        <button
            disabled={disabled}
            onClick={handleClick}
            type="button"
            data-selected={active}
            aria-pressed={active}
            className={`p-4 flex flex-col justify-center items-center shadow-lg rounded-lg gap-4 w-[246px] h-[148px] transition-colors duration-200
                ${isActive ? "bg-yellow-400 text-black" : "bg-gray-100 text-gray-500 hover:bg-gray-200"}
                ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
        >
            <p className="text-lg font-medium">{title}</p>
            {icon}
        </button>
    );
}
