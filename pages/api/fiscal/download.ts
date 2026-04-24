// pages/api/fiscal/download.ts
// Faz proxy de download do PDF ou XML da NFS-e via Spedy

import type { NextApiRequest, NextApiResponse } from "next";
import { downloadNfsePdf, downloadNfseXml } from "@/src/services/spedy";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { nfeId, format } = req.query;

  if (!nfeId || typeof nfeId !== "string") {
    return res.status(400).json({ error: "nfeId é obrigatório" });
  }

  const tipo = (format as string)?.toLowerCase() || "pdf";

  try {
    if (tipo === "xml") {
      const xml = await downloadNfseXml(nfeId);
      res.setHeader("Content-Type", "application/xml");
      res.setHeader("Content-Disposition", `attachment; filename=nfse-${nfeId}.xml`);
      return res.status(200).send(xml);
    }

    // PDF por padrão
    const pdf = await downloadNfsePdf(nfeId);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=nfse-${nfeId}.pdf`);
    return res.status(200).send(pdf);
  } catch (error: any) {
    console.error("Erro ao baixar NFS-e:", error?.response?.data || error.message);

    return res.status(500).json({
      success: false,
      error: "Falha ao baixar nota fiscal",
      details: error?.response?.data?.message || error.message,
    });
  }
}
