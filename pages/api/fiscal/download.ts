// pages/api/fiscal/download.ts
// Faz proxy de download do PDF ou XML da NF-e

import type { NextApiRequest, NextApiResponse } from "next";
import { downloadNfePdf, downloadNfeXml } from "@/src/services/nuvemfiscal";

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
      const xml = await downloadNfeXml(nfeId);
      res.setHeader("Content-Type", "application/xml");
      res.setHeader("Content-Disposition", `attachment; filename=nfe-${nfeId}.xml`);
      return res.status(200).send(xml);
    }

    // PDF por padrão
    const pdf = await downloadNfePdf(nfeId);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=nfe-${nfeId}.pdf`);
    return res.status(200).send(pdf);
  } catch (error: any) {
    console.error("Erro ao baixar NF-e:", error?.response?.data || error.message);

    return res.status(500).json({
      success: false,
      error: "Falha ao baixar nota fiscal",
      details: error?.response?.data?.message || error.message,
    });
  }
}
