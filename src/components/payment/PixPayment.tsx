import Icon from "@/src/icons/fontAwesome/FIcon";
import { CopyClipboard } from "@/src/helper";
import { PixType } from "@/src/models/order";

interface PixPaymentProps {
  pix: PixType;
  expire: string;
}

export default function PixPayment({ pix, expire }: PixPaymentProps) {
  if (!pix?.status) return null;

  const handleCopy = () => {
    try {
      if (pix?.code) {
        navigator.clipboard.writeText(String(pix.code));
        return;
      }
    } catch (e) {
      // fallthrough to helper
    }
    CopyClipboard("pix-code");
  };

  return (
    <div className="bg-white rounded-xl p-4 mb-4">
      <div className="text-center mb-4">
        <div className="text-sm">Expira em:</div>
        <div className="text-3xl text-zinc-900 font-bold">{expire}</div>
      </div>

      <div className="w-full max-w-[16rem] mx-auto">
        {!!pix.qrcode ? (
          <img src={pix.qrcode} className="w-full" alt="QR Code PIX" />
        ) : (
          <div className="aspect-square border rounded" />
        )}
      </div>

      <div className="px-3 pt-6">
        <div className="px-4 py-3 bg-zinc-100 rounded">
          <div className="text-sm line-clamp-3 break-all">{pix.code}</div>
        </div>
        <div className="text-center">
          <input
            type="text"
            id="pix-code"
            value={pix.code ?? ""}
            readOnly
            className="absolute h-0 w-0 opacity-0 overflow-hidden"
          />
          <button
            type="button"
            onClick={handleCopy}
            className="font-semibold pt-3 pb-2 text-cyan-600"
          >
            <Icon icon="fa-copy" className="mr-2" />
            COPIAR
          </button>
        </div>
      </div>
    </div>
  );
}
