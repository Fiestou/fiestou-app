import React, { useState } from "react";
import { IoClose } from "react-icons/io5";

interface CreateGroupProps {
  open: boolean;
  onRequestClose: () => void;
  onSaveClick: (data: GroupData) => void;
  data?: GroupData;
}

interface GroupData {
  id?: number;
  title: string;
  description: string;
}

const GroupModal: React.FC<CreateGroupProps> = (props) => {
  if (!props.open) return null;
  const [title, setTitle] = useState<string>(props.data?.title || '');
  const [description, setDescription] = useState<string>(props.data?.description || '');

  const returnData: GroupData = {
    id: props.data?.id || undefined,
    title: title,
    description: description
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] relative gap-3 flex flex-col">
        <h1 className="text-[30px] font-semibold mb-4 text-black underline decoration-1 decoration-gray-400 underline-offset-4">
          {
            props.data?.id ? 'Editar Grupo' : 'Adicionar Grupo'
          }
        </h1>
        <button
          onClick={props.onRequestClose}
          className="absolute top-3 right-3  text-gray-600 hover:text-gray-800"
        >
          <IoClose size={25} />
        </button>
        <div className="flex flex-col w-full">
          <label className="flex flex-row flex-1 w-full text-black">
            Título / Grupo <p className="text-red-500">*</p>
          </label>
          <input
            value={title}
            onChange={(event) => { setTitle(event.target.value) }}
            className="flex-1 w-full border-[1px] border-gray-500 rounded-md p-2" placeholder="Digite aqui" />
        </div>
        <div className="flex flex-col w-full">
          <label className="flex flex-row flex-1 w-full text-black">
            Descrição <p className="text-red-500">*</p>
          </label>
          <textarea
            value={description}
            onChange={(event) => { setDescription(event.target.value) }}
            className="flex-1 w-full border-[1px] border-gray-500 min-h-[90px] rounded-md p-2" placeholder="Digite aqui" />
        </div>
        <div className="flex w-full justify-end gap-3">
          <button className="flex justify-center w-[100px] items-center p-2 text-yellow-400 border-2 border-yellow-400 rounded-md active:bg-yellow-400 active:text-white">
            Cancelar
          </button>
          <button
            onClick={() => props.onSaveClick(returnData)}
            className="flex justify-center w-[100px] items-center p-2 bg-yellow-400 text-white border-2 border-yellow-400 rounded-md active:bg-white active:text-yellow-400">
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupModal;
