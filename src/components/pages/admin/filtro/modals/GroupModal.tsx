import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Checkbox from "@/src/components/ui/form/CheckboxUI";
 
interface CreateGroupProps {
  open: boolean;
  onRequestClose: () => void;
  onSaveClick: (data: GroupData) => void;
  data?: GroupData | null;
}
 
export interface GroupData {
  id?: number;
  name: string;
  description: string;
  segment?: boolean;
}
 
const GroupModal: React.FC<CreateGroupProps> = (props) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isMainSegment, setIsMainSegment] = useState<boolean>(false);
 
  useEffect(()=>{
    if (props.data){
      setTitle(props.data.name);
      setDescription(props.data.description);
      setIsMainSegment(!!props.data.segment); /* Melhorar futuramente */
    }else{
      setTitle('');
      setDescription('');
      setIsMainSegment(false);
    }
  }, [props.data])
  
  const toggleSegment = () => {
    setIsMainSegment((prev) => !prev);
  };

  const handleSave = () => {
    const data = {
      id: props.data?.id || undefined,
      name: title,
      description: description,
      segment: isMainSegment,
      active: true,
    };
    
    props.onSaveClick(data);
  };
 
  return !props.open ? null : (
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
          <X size={25} />
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
            Descrição
          </label>
          <textarea
            value={description}
            onChange={(event) => { setDescription(event.target.value) }}
            className="flex-1 w-full border-[1px] border-gray-500 min-h-[90px] rounded-md p-2" placeholder="Digite aqui" />
        </div>
        <div className="flex items-center mt-2">
          <div 
            className="flex items-center cursor-pointer select-none"
            onClick={toggleSegment}
          >
            <Checkbox checked={isMainSegment} />
            <span className="ml-2 text-sm text-gray-700">
              Tornar grupo <strong>segmento principal</strong>
            </span>
          </div>
        </div>
        <div className="flex w-full justify-end gap-3">
          <button 
            onClick={props.onRequestClose}
            className="flex justify-center w-[100px] items-center p-2 text-yellow-400 border-2 border-yellow-400 rounded-md active:bg-yellow-400 active:text-black">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex justify-center w-[100px] items-center p-2 bg-yellow-400 text-black border-2 border-yellow-400 rounded-md active:bg-white active:text-yellow-400">
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};
 
export default GroupModal;