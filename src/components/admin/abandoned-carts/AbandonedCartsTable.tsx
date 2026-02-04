import { useState } from "react";
import { AbandonedCart, AbandonedCartDetail } from "@/src/hooks/useAbandonedCarts";
import { moneyFormat } from "@/src/helper";
import SendEmailModal from "./SendEmailModal";

interface Props {
  carts: AbandonedCart[];
  onSendEmail: (id: number, subject: string, message: string) => Promise<{ success: boolean; error?: string }>;
  getCartDetail: (id: number) => Promise<AbandonedCartDetail | null>;
}

export default function AbandonedCartsTable({ carts, onSendEmail, getCartDetail }: Props) {
  const [selectedCart, setSelectedCart] = useState<AbandonedCart | null>(null);
  const [cartDetail, setCartDetail] = useState<AbandonedCartDetail | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const handleOpenModal = async (cart: AbandonedCart) => {
    setSelectedCart(cart);
    setLoadingDetail(true);

    const detail = await getCartDetail(cart.id);
    setCartDetail(detail);
    setLoadingDetail(false);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedCart(null);
    setCartDetail(null);
    setShowModal(false);
  };

  const handleSend = async (subject: string, message: string) => {
    if (!selectedCart) return;
    const result = await onSendEmail(selectedCart.id, subject, message);
    if (result.success) {
      handleCloseModal();
    }
    return result;
  };

  if (!carts.length) {
    return (
      <div className="text-center py-8 text-zinc-500">
        Nenhum carrinho abandonado encontrado
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-zinc-100">
              <th className="text-left p-3 font-semibold">Cliente</th>
              <th className="text-left p-3 font-semibold">Email</th>
              <th className="text-center p-3 font-semibold">Itens</th>
              <th className="text-right p-3 font-semibold">Total</th>
              <th className="text-center p-3 font-semibold">Abandonado há</th>
              <th className="text-center p-3 font-semibold">Status</th>
              <th className="text-center p-3 font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {carts.map((cart) => (
              <tr key={cart.id} className="border-b hover:bg-zinc-50">
                <td className="p-3">{cart.user_name}</td>
                <td className="p-3 text-sm text-zinc-600">{cart.user_email}</td>
                <td className="p-3 text-center">{cart.items_count}</td>
                <td className="p-3 text-right font-medium">
                  R$ {moneyFormat(cart.total)}
                </td>
                <td className="p-3 text-center text-sm text-zinc-500">
                  {cart.hours_abandoned}h
                </td>
                <td className="p-3 text-center">
                  {cart.notified_at ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Notificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                      Pendente
                    </span>
                  )}
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => handleOpenModal(cart)}
                    className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Enviar Email
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && selectedCart && (
        <SendEmailModal
          cart={selectedCart}
          cartDetail={cartDetail}
          onClose={handleCloseModal}
          onSend={handleSend}
        />
      )}
    </>
  );
}
