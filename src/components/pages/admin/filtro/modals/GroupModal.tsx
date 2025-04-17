import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Checkbox from "@/src/components/ui/form/CheckboxUI";
import axios from "axios";

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
  segment?: boolean | number;
  parent_id?: number;
  isFather?: boolean;
}

const GroupModal: React.FC<CreateGroupProps> = (props) => {
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isMainSegment, setIsMainSegment] = useState<boolean>(false);

  useEffect(() => {
    if (props.data) {
      setTitle(props.data.name);
      setDescription(props.data.description);
      setIsMainSegment(Boolean(props.data.segment));
    } else {
      setTitle('');
      setDescription('');
      setIsMainSegment(false);
    }
  }, [props.data, props.open]);

  const toggleSegment = () => {
    const newValue = !isMainSegment;
    setIsMainSegment(newValue);
  };

  // Função para debug direto na API
  const testSegmentUpdate = async () => {
    if (!props.data?.id) return;
    
    try {
      // Teste 1: Enviar como número (1/0)
      console.log("TESTE 1: Enviando segment como número");
      const test1 = await axios.put(`/api/app/group/update/${props.data.id}`, {
        segment: 1,
        name: title,
        description: description
      });
      console.log("Resultado do teste 1:", test1.data);
      
      // Teste 2: Enviar como booleano (true/false)
      console.log("TESTE 2: Enviando segment como booleano");
      const test2 = await axios.put(`/api/app/group/update/${props.data.id}`, {
        segment: true,
        name: title,
        description: description
      });
      console.log("Resultado do teste 2:", test2.data);
      
      // Teste 3: Enviar como string ("1"/"0")
      console.log("TESTE 3: Enviando segment como string");
      const test3 = await axios.put(`/api/app/group/update/${props.data.id}`, {
        segment: "1",
        name: title,
        description: description
      });
      console.log("Resultado do teste 3:", test3.data);
      
      // Teste 4: Forçar com _segment
      console.log("TESTE 4: Enviando com _segment");
      const test4 = await axios.put(`/api/app/group/update/${props.data.id}`, {
        segment: 1,
        _segment: 1,
        name: title,
        description: description
      });
      console.log("Resultado do teste 4:", test4.data);
      
      // Avisar que os testes terminaram
      alert("Testes concluídos! Verifique o console e os logs do backend.");
    } catch (error) {
      console.error("Erro durante os testes:", error);
    }
  };

  // Função normal de salvar
  const handleSave = () => {
    // Criar dados para salvar
    const dataToSave: GroupData = {
      id: props.data?.id,
      name: title,
      description: description,
      segment: isMainSegment ? 1 : 0,
      parent_id: props.data?.parent_id,
      isFather: !props.data?.parent_id
    };
    
    console.log("Dados a serem enviados:", dataToSave);
    props.onSaveClick(dataToSave);
  };

  return !props.open ? null : (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] relative gap-3 flex flex-col">
        <h1 className="text-[30px] font-semibold mb-4 text-black underline decoration-1 decoration-gray-400 underline-offset-4">
          {props.data?.id ? 'Editar Grupo' : 'Adicionar Grupo'}
        </h1>
        <button
          onClick={props.onRequestClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
        >
          <X size={25} />
        </button>
        
        {/* Campos normais */}
        <div className="flex flex-col w-full">
          <label className="flex flex-row flex-1 w-full text-black">
            Título / Grupo <p className="text-red-500">*</p>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 w-full border-[1px] border-gray-500 rounded-md p-2"
            placeholder="Digite aqui"
          />
        </div>
        
        <div className="flex flex-col w-full">
          <label className="flex flex-row flex-1 w-full text-black">
            Descrição
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 w-full border-[1px] border-gray-500 min-h-[90px] rounded-md p-2"
            placeholder="Digite aqui"
          />
        </div>
        
        {/* Checkbox para segmento */}
        <div className="flex w-full justify-between items-center">
          <div className="flex items-center">
            <div className="relative flex items-start">
              <div
                className="flex items-center h-5 relative cursor-pointer"
                onClick={toggleSegment}
              >
                <Checkbox type="checkbox" checked={isMainSegment} />
              </div>
              <label 
                className="ml-2 text-sm text-gray-700 cursor-pointer"
                onClick={toggleSegment}
              >
                Tornar grupo <strong>segmento principal</strong>
              </label>
            </div>
          </div>
          
          {/* Botões de ação */}
          <div className="flex gap-3">
            <button
              onClick={testSegmentUpdate}
              className="flex justify-center w-auto px-4 items-center p-2 bg-blue-500 text-white border-2 border-blue-500 rounded-md"
            >
              Testar API
            </button>
            
            <button
              onClick={props.onRequestClose}
              className="flex justify-center w-[100px] items-center p-2 text-yellow-400 border-2 border-yellow-400 rounded-md active:bg-yellow-400 active:text-black"
            >
              Cancelar
            </button>
            
            <button
              onClick={handleSave}
              className="flex justify-center w-[100px] items-center p-2 bg-yellow-400 text-black border-2 border-yellow-400 rounded-md active:bg-white active:text-yellow-400"
            >
              Salvar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupModal;