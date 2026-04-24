// pages/api/fiscal/emit.ts
// Emite NFS-e via Spedy para um pedido específico

import type { NextApiRequest, NextApiResponse } from "next";
import {
  emitirNfse,
  consultarEmpresa,
} from "@/src/services/spedy";
import Api from "@/src/services/api";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId } = req.body;

  if (!orderId) {
    return res.status(400).json({ error: "orderId é obrigatório" });
  }

  try {
    // Buscar dados completos do pedido via bridge
    const api = new Api();
    const authHeader = req.headers.authorization || "";

    const orderResponse: any = await api.bridge({
      method: "post",
      url: "orders/get",
      data: { id: orderId }
    }, { req });

    const order = orderResponse?.data?.order || orderResponse?.order || orderResponse?.data || orderResponse;

    if (!order || !order.id) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // Determinar emitente (dados da loja)
    const store = order.store || {};
    const cnpjEmitente = store.document?.replace(/\D/g, "") || "03778130000148"; // Fallback para Sandbox

    if (!cnpjEmitente || cnpjEmitente.length < 11) {
      return res.status(400).json({
        error: "Loja não possui CNPJ/CPF cadastrado. Configure os dados fiscais primeiro.",
      });
    }

    // Determinar destinatário (cliente)
    const customer = order.customer || order.user || {};
    const delivery = order.delivery || {};
    const deliveryAddress = delivery.address || order.delivery_address || {};

    // Montar valores
    const valorTotal = Number(order.total || 0);
    const taxaFiestou = Number(order.fees_amount || order.taxes || (valorTotal * 0.10)); // Fallback 10%
    
    const isInternal = store.is_internal_store === true;
    const ambiente = (process.env.SPEDY_ENVIRONMENT === "production" ? 1 : 2) as 1 | 2;

    let nfseParams;

    if (isInternal) {
      // LOJA INTERNA: Emite NFS-e pro Consumidor, CTISS 772920200, Valor Full
      nfseParams = {
        ambiente,
        referencia: `fiestou-direta-${orderId}`,
        emitente: {
          cpf_cnpj: cnpjEmitente,
        },
        tomador: {
          cpf_cnpj: customer.document || customer.cpf || "00000000000",
          razao_social: customer.name || "Consumidor Final",
          email: customer.email || undefined,
          endereco: {
            logradouro: deliveryAddress.street || deliveryAddress.logradouro || "Não informado",
            numero: deliveryAddress.number || deliveryAddress.numero || "S/N",
            complemento: deliveryAddress.complement || deliveryAddress.complemento || "",
            bairro: deliveryAddress.neighborhood || deliveryAddress.bairro || "Não informado",
            codigo_municipio: deliveryAddress.cityCode || "2507507",
            cidade: deliveryAddress.city || deliveryAddress.cidade || "João Pessoa",
            uf: deliveryAddress.state || deliveryAddress.uf || "PB",
            cep: (deliveryAddress.zipcode || deliveryAddress.cep || "58000000").replace(/\D/g, ""),
          }
        },
        servico: {
          valor_servicos: valorTotal,
          codigo_tributacao_municipio: "772920200", // Aluguel
          item_lista_servico: "7.02", 
          discriminacao: `Locação de Equipamentos. Pedido #${orderId}`,
          codigo_municipio: "2507507",
        }
      };
    } else {
      // LOJISTA PARCEIRO: Emite NFS-e pro Lojista, CTISS 749010400, Valor Taxa
      nfseParams = {
        ambiente,
        referencia: `fiestou-taxa-${orderId}`,
        emitente: {
          cpf_cnpj: cnpjEmitente, // Fiestou
        },
        tomador: {
          cpf_cnpj: store.document || "00000000000",
          razao_social: store.companyName || store.title || "Lojista Parceiro",
          email: store.email || undefined,
          endereco: {
            logradouro: store.street || "Não informado",
            numero: store.number || "S/N",
            complemento: store.complement || "",
            bairro: store.neighborhood || "Centro",
            codigo_municipio: store.cityCode || "2507507",
            cidade: store.city || "João Pessoa",
            uf: store.state || "PB",
            cep: (store.zipCode || store.zipcode || "58000000").replace(/\D/g, ""),
          }
        },
        servico: {
          valor_servicos: taxaFiestou, // APENAS A COMISSÃO
          codigo_tributacao_municipio: "749010400", // Agenciamento
          item_lista_servico: "10.02",
          discriminacao: `Taxa de Intermediação de Negócios na plataforma Fiestou. Pedido #${orderId}`,
          codigo_municipio: "2507507",
        }
      };
    }

    // Emitir NFS-e
    const resultado = await emitirNfse(nfseParams);

    // Salvar referência da NFS-e no metadata do pedido
    if (resultado?.id) {
      try {
        await api.bridge({
          method: "post",
          url: "orders/register-meta",
          data: {
            id: orderId,
            metadata: {
              fiscal_nfse_id: resultado.id,
              fiscal_status: resultado.status || "processando",
              fiscal_ambiente: ambiente,
              fiscal_emitido_em: new Date().toISOString(),
              fiscal_provider: "spedy",
            },
          },
        }, { req });
      } catch (metaErr) {
        console.error("Erro ao salvar metadata fiscal:", metaErr);
      }
    }

    return res.status(200).json({
      success: true,
      nfeId: resultado.id,
      status: resultado.status,
      numero: resultado.numero,
      chave: resultado.chave,
      ambiente: ambiente === 1 ? "producao" : "sandbox",
    });
  } catch (error: any) {
    console.error("Erro ao emitir NFS-e:", error?.response?.data || error.message);

    return res.status(500).json({
      success: false,
      error: "Falha ao emitir nota fiscal",
      details: error?.response?.data?.message || error?.response?.data || error.message,
    });
  }
}
