import { dateBRFormat } from "@/src/helper";

interface BoletoPaymentProps {
  boleto: {
    status?: boolean;
    pdf?: string;
    due_at?: string;
    line?: string;
  };
}

export default function BoletoPayment({ boleto }: BoletoPaymentProps) {
  if (!boleto?.status) return null;

  return (
    <div className="bg-white rounded-xl p-4 text-center mb-4">
      <div className="mb-4">
        <div className="text-sm">Vencimento para:</div>
        <div className="text-xl text-zinc-900 font-bold">
          {dateBRFormat(boleto?.due_at)}
        </div>
      </div>

      <div className="w-full max-w-[16rem] mx-auto grid gap-2">
        <div>Disponível para download</div>
        <div>
          <a
            rel="noreferrer"
            href={boleto?.pdf}
            target="_blank"
            className="font-semibold inline-block mx-auto py-2 px-4 border rounded-md hover:underline border-cyan-600 text-cyan-600 hover:border-cyan-800 hover:text-cyan-800 ease"
          >
            Baixar boleto
          </a>
        </div>
      </div>

      {boleto?.line && (
        <div className="mt-4 px-4 py-3 bg-zinc-100 rounded">
          <div className="text-xs text-zinc-500 mb-1">Linha digitável:</div>
          <div className="text-sm break-all font-mono">{boleto.line}</div>
        </div>
      )}
    </div>
  );
}
