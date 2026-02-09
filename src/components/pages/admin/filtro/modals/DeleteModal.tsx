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
    <div className="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[420px] mx-4">
        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-zinc-900">Confirmar</h2>
          <button
            onClick={props.onRequestClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 text-zinc-400"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-6 text-center">
          <p className="text-zinc-900 font-medium">{props.title}</p>
          <p className="text-sm text-red-500 mt-2">{props.info}</p>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-zinc-50 rounded-b-xl">
          <button
            onClick={props.onRequestClose}
            className="px-4 py-2.5 text-sm text-zinc-600 hover:text-zinc-800 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => props.onSaveClick()}
            className="px-5 py-2.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
