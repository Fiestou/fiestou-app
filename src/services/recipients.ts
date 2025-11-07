import { RecipientEntity, RecipientStatusResponse } from "@/src/models/recipient";
import Api from "@/src/services/api";

const api = new Api();

/**
 * Busca o status do cadastro PagMe da loja autenticada
 */
export async function getRecipientStatus(): Promise<RecipientStatusResponse> {
  try {
    const response: any = await api.bridge({
      method: "get",
      url: "recipients/status",
    });

    if (response?.data?.data) {
      return {
        completed: response.data.data.completed || false,
        recipient: response.data.data.recipient || null,
      };
    }

    return { completed: false, recipient: null };
  } catch (error) {
    console.error("Erro ao buscar status do recipient:", error);
    return { completed: false, recipient: null };
  }
}

/**
 * Salva ou atualiza dados do recipient
 */
export async function saveRecipientDraft(data: RecipientEntity): Promise<RecipientEntity> {
  try {
    const response: any = await api.bridge({
      method: "post",
      url: "recipients/save",
      data: data,
    });

    if (response?.data?.data) {
      return response.data.data;
    }

    throw new Error("Erro ao salvar recipient");
  } catch (error) {
    console.error("Erro ao salvar recipient:", error);
    throw error;
  }
}
