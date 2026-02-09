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
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [isMainSegment, setIsMainSegment] = useState<boolean>(false);

  useEffect(() => {
    if (props.data) {
      setTitle(props.data.name);
      setDescription(props.data.description);
      setIsMainSegment(!!props.data.segment);
    } else {
      setTitle("");
      setDescription("");
      setIsMainSegment(false);
    }
  }, [props.data]);

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
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[520px] mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-zinc-900">
            {props.data?.id ? "Editar Grupo" : "Novo Grupo"}
          </h2>
          <button
            onClick={props.onRequestClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 grid gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Nome do grupo <span className="text-red-500">*</span>
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-zinc-400 transition-colors"
              placeholder="Ex: Categorias, Material, Tamanho..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-700 mb-1.5">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2.5 border rounded-lg text-sm outline-none focus:border-zinc-400 transition-colors min-h-[80px] resize-none"
              placeholder="Descreva a função desse grupo..."
            />
          </div>
          <div
            className="flex items-center cursor-pointer select-none"
            onClick={() => setIsMainSegment((prev) => !prev)}
          >
            <Checkbox checked={isMainSegment} />
            <span className="ml-2 text-sm text-zinc-600">
              Tornar grupo <strong>segmento principal</strong>
            </span>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-zinc-50 rounded-b-xl">
          <button
            onClick={props.onRequestClose}
            className="px-4 py-2.5 text-sm text-zinc-600 hover:text-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim()}
            className="px-5 py-2.5 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-800 transition-colors disabled:opacity-40"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroupModal;
