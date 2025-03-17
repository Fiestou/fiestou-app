import React from "react";
import { X } from "lucide-react";

interface DeleteModalProps {
    open: boolean;
    onRequestClose: () => void;
    onSaveClick: () => void;
    title: string;
    info: string;
}

const DeleteModal: React.FC<DeleteModalProps> = (props) => {
    return !props.open ? null : (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] relative gap-5 flex flex-col">
                <button
                    onClick={props.onRequestClose}
                    className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
                >
                    <X size={25} />
                </button>
                <div className="flex w-full flex-row text-center text-[28px] justify-center items-center">
                    <h1>
                        {props.title}
                    </h1>
                </div>
                <div className="flex w-full flex-row justify-center items-center">
                    <p className="text-red-500 text-center text-[20px]">
                        {props.info}
                    </p>
                </div>

                <div className="flex w-full flex-row justify-center items-center">

                    <div className="flex w-full justify-center gap-3">
                        <button onClick={props.onRequestClose}
                            className={`flex justify-center w-[100px] items-center p-2 text-yellow-400 border-2 border-yellow-400 rounded-md active:bg-yellow-400 active:text-black`}>
                            Cancelar
                        </button>
                        <button onClick={() => { props.onSaveClick()}}
                            className={`flex justify-center w-[100px] items-center p-2 bg-yellow-400 text-black border-2 border-yellow-400 rounded-md active:bg-white active:text-yellow-400`}>
                            Salvar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default DeleteModal;