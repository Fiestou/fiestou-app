// pages/api/fiscal/status.ts
// Consulta status de uma NFS-e na Spedy

import type { NextApiRequest, NextApiResponse } from "next";
import { consultarNfse } from "@/src/services/spedy";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nfeId } = req.query;

  if (!nfeId || typeof nfeId !== "string") {
    return res.status(400).json({ error: "nfeId é obrigatório" });
  }

  try {
    const resultado = await consultarNfse(nfeId);

    return res.status(200).json({
      success: true,
      nfeId: resultado.id,
      status: resultado.status,
      numero: resultado.numero,
      serie: resultado.serie,
      chave: resultado.chave,
      dataEmissao: resultado.data_emissao,
      valorTotal: resultado.valor_total,
      motivoStatus: resultado.motivo_status,
      ambiente: resultado.ambiente,
      provider: "spedy",
    });
  } catch (error: any) {
    console.error("Erro ao consultar NFS-e:", error?.response?.data || error.message);

    return res.status(500).json({
      success: false,
      error: "Falha ao consultar nota fiscal",
      details: error?.response?.data?.message || error.message,
    });
  }
}
