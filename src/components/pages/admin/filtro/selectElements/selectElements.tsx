import React, { useRef, useEffect } from "react";
import { X } from "lucide-react";
import { categorie } from "@/src/store/filter";

interface SelectElementsProps {
    relatedElements:    categorie[];
    open: boolean;
    onRequestOpen: () => void;
    onRequestClose: () => void;
    selectedList:categorie[];
    onChageSelectList: (data: categorie[]) => void;
}

const SelectElements: React.FC<SelectElementsProps> = (props) => {
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
            props.onRequestClose();
        }
    };

    useEffect(() => {
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    const onCheckClick = (checked: boolean, value: categorie) => {
        props.onChageSelectList(
          checked
            ? [...props.selectedList, { ...value, checked: true }] 
            : props.selectedList.filter((item) => item.id !== value.id)
        );
      };
      
      const onCheckAllClick = (checked: boolean) => {
        props.onChageSelectList(
          checked
            ? props.relatedElements.map((item) => ({ ...item, checked: true })) 
            : []
        );
      };


    const isAllSelected =
        props.relatedElements.length > 0 &&
        props.relatedElements.every((item) =>
            props.selectedList.some((selected) => selected.id === item.id)
        );

    return (
        <div className="flex flex-col w-full justify-start items-start relative" ref={dropdownRef}>
            <button
                className="flex flex-row w-full justify-start p-2 items-center rounded-md border-[1.5px] border-black gap-2 flex-wrap"
                onClick={() => props.onRequestOpen()}
            >
                {props.selectedList.length > 0 ? (
                    props.selectedList.map((value) => (
                        <div
                            className="h-[30px] p-2 rounded-md flex items-center justify-center bg-yellow-300 text-black gap-1"
                            key={value.id}
                        >
                            <img src={value.icon} alt="icon" className="w-5 h-5" />
                            {value.name}
                            <button
                                onClick={(event) => {
                                    event.stopPropagation();
                                    props.onChageSelectList(
                                        props.selectedList.filter((item) => item.id !== value.id)
                                    );
                                }}
                            >
                                <X color="rgb(100, 100, 100)" size={20} />
                            </button>
                        </div>
                    ))
                ) : (
                    "Selecione ..."
                )}
            </button>

            {props.open && (
                <div className="absolute left-0 top-10 flex flex-col gap-1 w-full overflow-y-auto max-h-[200px] bg-white text-black p-2 rounded-md text-center transition-opacity duration-300 opacity-100 translate-y-2 z-10">
                    <div className="w-full h-8 flex items-center justify-start gap-2">
                        <input
                            type="checkbox"
                            id="check-all-box"
                            onChange={(event) => onCheckAllClick(event.target.checked)}
                            checked={isAllSelected}
                            className="w-5 h-5 accent-yellow-500"
                        />
                        <label htmlFor="check-all-box">Selecionar todos</label>
                    </div>
                    {props.relatedElements.map((value) => (
                        <div key={value.id} className="w-full h-8 flex items-center justify-start gap-2">
                            <input
                                type="checkbox"
                                id={`check-${value.id}`}
                                onChange={(event) => onCheckClick(event.target.checked, value)}
                                checked={props.selectedList.some((item) => item.id === value.id)}
                                className="w-5 h-5 accent-yellow-500"
                            />
                            <img src={value.icon} alt="icon" className="w-5 h-5" />
                            <label htmlFor={`check-${value.id}`}>{value.name}</label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SelectElements;