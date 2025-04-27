import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import Checkbox from "@/src/components/ui/form/CheckboxUI";
import { AxiosError } from "axios";
import Api from "@/src/services/api";

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

const GroupModal: React.FC<CreateGroupProps> = ({
  open,
  onRequestClose,
  onSaveClick,
  data,
}) => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isMainSegment, setIsMainSegment] = useState<boolean>(false);

  const apiInstance = new Api();

  useEffect(() => {
    if (data) {
      setTitle(data.name || "");
      setDescription(data.description || "");
      setIsMainSegment(Boolean(data.segment));
    } else {
      setTitle("");
      setDescription("");
      setIsMainSegment(false);
    }
  }, [data, open]);

  const toggleSegment = () => {
    setIsMainSegment((prev) => !prev);
  };

  useEffect(() => {
  }, [isMainSegment]);
  const testSegmentUpdate = async () => {
    if (!data?.id) {
      alert("ID do grupo não encontrado!");
      return;
    }

    const handleUpdate = async (event: React.FormEvent) => {
      event.preventDefault();
    
      try {
        const response = await apiInstance.bridge({
          method: "put",
          url: `group/update/${data.id}`,
          data: {
            name: title,
            description,
            segment: isMainSegment ? 1 : 0,
          },
        });        
        alert("Teste concluído com sucesso! Verifique o console e os logs do backend.");
      } catch (error: unknown) {
        console.error("Erro durante o teste:", error);
        if (error instanceof AxiosError && error.response) {
          console.error("Resposta de erro:", error.response.data);
          console.error("Status:", error.response.status);
        }
      }
    };    
  };

  const handleSave = async () => {
    const dataToSave: GroupData = {
      id: data?.id,
      name: title.trim(),
      description: description.trim(),
      segment: 1,
      parent_id: data?.parent_id,
      isFather: !data?.parent_id,
    };
    
    try {
      const response = await apiInstance.bridge({
        method: "put",
        url: `group/update/${dataToSave.id}`,
        data: dataToSave,
      });
      alert("Grupo salvo com sucesso!");
      onSaveClick(dataToSave);
    } catch (error: unknown) {
      console.error("❌ Erro ao salvar dados:", error);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[600px] relative gap-3 flex flex-col">
        <h1 className="text-[30px] font-semibold mb-4 text-black underline decoration-1 decoration-gray-400 underline-offset-4">
          {data?.id ? "Editar Grupo" : "Adicionar Grupo"}
        </h1>

        <button
          onClick={onRequestClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-800"
        >
          <X size={25} />
        </button>

        <div className="flex flex-col w-full">
          <label className="flex flex-row w-full text-black">
            Título / Grupo <span className="text-red-500">*</span>
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="flex-1 w-full border-[1px] border-gray-500 rounded-md p-2"
            placeholder="Digite aqui"
          />
        </div>

        <div className="flex flex-col w-full">
          <label className="flex flex-row w-full text-black">Descrição</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="flex-1 w-full border-[1px] border-gray-500 min-h-[90px] rounded-md p-2"
            placeholder="Digite aqui"
          />
        </div>

        <div className="flex w-full justify-between items-center">
          <div className="flex items-center">
            <label className="flex items-center cursor-pointer select-none" onClick={toggleSegment}>
              <Checkbox checked={isMainSegment} />
              <span className="ml-2 text-sm text-gray-700">
                Tornar grupo <strong>segmento principal</strong>
              </span>
            </label>
            <input type="hidden" name="segment" value={isMainSegment ? 1 : 0} />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onRequestClose}
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