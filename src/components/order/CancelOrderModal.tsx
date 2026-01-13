import Modal from "@/src/components/utils/Modal";
import { Button } from "@/src/components/ui/form";

interface CancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function CancelOrderModal({
  isOpen,
  onClose,
  onConfirm,
}: CancelOrderModalProps) {
  return (
    <Modal title="Cancelar pedido" status={isOpen} close={onClose}>
      <div className="grid gap-6">
        <div className="text-center">
          Ao cancelar seu pedido, uma taxa de serviço poderá ser cobrada e seus
          itens voltarão para o estoque. Deseja mesmo continuar?
        </div>
        <div className="grid gap-2 justify-center">
          <Button
            type="button"
            style="btn-danger"
            className="text-sm"
            onClick={onConfirm}
          >
            Continuar e cancelar pedido
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="text-center text-sm mx-auto block mt-4 hover:underline text-zinc-950 ease"
          >
            Voltar
          </button>
        </div>
      </div>
    </Modal>
  );
}
