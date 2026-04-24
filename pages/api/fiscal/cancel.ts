// pages/api/fiscal/cancel.ts
// Cancela uma NFS-e via Spedy

import type { NextApiRequest, NextApiResponse } from "next";
import { cancelarNfse } from "@/src/services/spedy";
import Api from "@/src/services/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nfeId, justificativa, orderId } = req.body;

  if (!nfeId) {
    return res.status(400).json({ error: "nfeId é obrigatório" });
  }

  if (!justificativa || justificativa.length < 15) {
    return res.status(400).json({
      error: "Justificativa é obrigatória e deve ter ao menos 15 caracteres",
    });
  }

  try {
    const resultado = await cancelarNfse(nfeId, justificativa);

    // Atualizar metadata do pedido se orderId informado
    if (orderId) {
      try {
        const api = new Api();
        await api.bridge({
          method: "post",
          url: "orders/register-meta",
          data: {
            id: orderId,
            metadata: {
              fiscal_status: "cancelada",
              fiscal_cancelado_em: new Date().toISOString(),
              fiscal_justificativa: justificativa,
            },
          },
        }, { req });
      } catch (metaErr) {
        console.error("Erro ao atualizar metadata fiscal:", metaErr);
      }
    }

    return res.status(200).json({
      success: true,
      status: resultado.status || "cancelada",
      nfeId,
    });
  } catch (error: any) {
    console.error("Erro ao cancelar NFS-e:", error?.response?.data || error.message);

    return res.status(500).json({
      success: false,
      error: "Falha ao cancelar nota fiscal",
      details: error?.response?.data?.message || error.message,
    });
  }
}
