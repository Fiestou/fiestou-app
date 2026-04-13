// pages/api/fiscal/emit.ts
// Emite NF-e via NuvemFiscal para um pedido específico

import type { NextApiRequest, NextApiResponse } from "next";
import {
  emitirNfe,
  consultarEmpresa,
} from "@/src/services/nuvemfiscal";
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

    const orderResponse: any = await api.connect({
      method: "get",
      url: `${process.env.INTERNAL_API_REST || process.env.API_REST}order/${orderId}`,
    });

    const order = orderResponse?.data?.order || orderResponse?.order || orderResponse?.data || orderResponse;

    if (!order || !order.id) {
      return res.status(404).json({ error: "Pedido não encontrado" });
    }

    // Determinar emitente (dados da loja)
    const store = order.store || {};
    const cnpjEmitente = store.document?.replace(/\D/g, "") || "";

    if (!cnpjEmitente || cnpjEmitente.length < 11) {
      return res.status(400).json({
        error: "Loja não possui CNPJ/CPF cadastrado. Configure os dados fiscais primeiro.",
      });
    }

    // Determinar destinatário (cliente)
    const customer = order.customer || order.user || {};
    const delivery = order.delivery || {};
    const deliveryAddress = delivery.address || order.delivery_address || {};

    // Montar itens
    const orderItems = order.items || order.listItems || [];
    const itensNfe = orderItems.map((item: any, index: number) => {
      const unitPrice = Number(item.unit_price || item.unitPrice || item.valor_unitario || 0);
      const qty = Number(item.quantity || item.quantidade || 1);
      const total = Number(item.total || unitPrice * qty);

      return {
        numero_item: index + 1,
        codigo_produto: String(item.product_id || item.productId || item.id || index + 1),
        descricao: String(item.name || item.nome || item.description || "Produto Fiestou").substring(0, 120),
        ncm: "95051000",     // Artigos para festas (padrão)
        cfop: 5102,          // Venda dentro do estado (padrão)
        unidade: "UN",
        quantidade: qty,
        valor_unitario: unitPrice,
        valor_total: total,
      };
    });

    if (itensNfe.length === 0) {
      return res.status(400).json({ error: "Pedido não possui itens" });
    }

    const valorTotal = Number(order.total || 0);

    // Determinar ambiente (sandbox por padrão)
    const ambiente = (process.env.NUVEMFISCAL_ENVIRONMENT === "production" ? 1 : 2) as 1 | 2;

    // Emitir NF-e
    const resultado = await emitirNfe({
      ambiente,
      emitente: {
        cnpj: cnpjEmitente,
        razao_social: store.companyName || store.title || "Empresa Emitente",
        inscricao_estadual: store.inscricaoEstadual || undefined,
        regime_tributario: 1, // Simples Nacional (padrão)
        endereco: {
          logradouro: store.street || "Rua não informada",
          numero: store.number || "S/N",
          complemento: store.complement || "",
          bairro: store.neighborhood || "Centro",
          codigo_municipio: 2507507, // João Pessoa (padrão)
          nome_municipio: store.city || "Joao Pessoa",
          uf: store.state || "PB",
          cep: (store.zipCode || store.zipcode || "58000000").replace(/\D/g, ""),
        },
      },
      destinatario: {
        cpf_cnpj: customer.document || customer.cpf || "00000000000",
        nome: customer.name || "Consumidor Final",
        email: customer.email || undefined,
        indicador_ie: 9, // Não contribuinte
        endereco: {
          logradouro: deliveryAddress.street || deliveryAddress.logradouro || "Não informado",
          numero: deliveryAddress.number || deliveryAddress.numero || "S/N",
          complemento: deliveryAddress.complement || deliveryAddress.complemento || "",
          bairro: deliveryAddress.neighborhood || deliveryAddress.bairro || "Não informado",
          codigo_municipio: deliveryAddress.cityCode || 2507507,
          nome_municipio: deliveryAddress.city || deliveryAddress.cidade || "Joao Pessoa",
          uf: deliveryAddress.state || deliveryAddress.uf || "PB",
          cep: (deliveryAddress.zipcode || deliveryAddress.cep || "58000000").replace(/\D/g, ""),
        },
      },
      itens: itensNfe,
      frete: {
        modalidade: 9, // Sem frete (por conta do emitente)
      },
      natureza_operacao: "VENDA DE MERCADORIAS",
      valor_total: valorTotal,
      informacoes_complementares: `Pedido Fiestou #${orderId}`,
      referencia_externa: `fiestou-order-${orderId}`,
    });

    // Salvar referência da NF-e no metadata do pedido
    if (resultado?.id) {
      try {
        await api.connect({
          method: "post",
          url: `${process.env.INTERNAL_API_REST || process.env.API_REST}orders/register-meta`,
          data: {
            id: orderId,
            metadata: {
              nuvemfiscal_nfe_id: resultado.id,
              nuvemfiscal_status: resultado.status || "processando",
              nuvemfiscal_ambiente: ambiente,
              nuvemfiscal_emitido_em: new Date().toISOString(),
            },
          },
        });
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
    console.error("Erro ao emitir NF-e:", error?.response?.data || error.message);

    return res.status(500).json({
      success: false,
      error: "Falha ao emitir nota fiscal",
      details: error?.response?.data?.message || error?.response?.data || error.message,
    });
  }
}
