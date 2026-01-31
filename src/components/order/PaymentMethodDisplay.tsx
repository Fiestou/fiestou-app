import Img from "@/src/components/utils/ImgBase";

interface PaymentMethodDisplayProps {
  paymentMethod?: string;
  transactionType?: string;
  installments?: number | string;
}

export default function PaymentMethodDisplay({
  paymentMethod,
  transactionType,
  installments,
}: PaymentMethodDisplayProps) {
  // Verifica PIX - tanto payment_method quanto transaction_type (fallback para pedidos antigos)
  if (paymentMethod === "pix" || transactionType === "pix") {
    return (
      <div className="text-sm flex items-center gap-2">
        <Img src="/images/pagarme/pix-icon.png" className="w-[1.75rem]" />
        <div className="w-full">PIX</div>
      </div>
    );
  }

  // Verifica Boleto - tanto payment_method quanto transaction_type (fallback para pedidos antigos)
  if (paymentMethod === "boleto" || transactionType === "boleto") {
    return (
      <div className="text-sm flex items-center gap-2">
        <Img src="/images/pagarme/document-icon.png" className="w-[1.75rem]" />
        <div className="w-full">Boleto bancário</div>
      </div>
    );
  }

  // Cartão de crédito (fallback)
  return (
    <div className="text-sm flex items-center gap-2">
      <Img src="/images/pagarme/card-icon.png" className="w-[1.75rem]" />
      <div className="w-full">
        Cartão de crédito{installments ? ` em ${installments}x` : ""}
      </div>
    </div>
  );
}
