import { CreateRecipientResponse, RecipientEntity, RecipientStatusResponse, RecipientType } from "../models/Recipient";
import Api from "./api";

const api = new Api();

export async function getRecipientStatus(): Promise<RecipientStatusResponse> {
  try {
    const response: any = await api.bridge({
      method: "get",
      url: "info/recipients/status",
    });

    if (response?.data) {
      return {
        completed: response.data.completed || false,
        recipient: response.data.recipient || null,
      };
    }

    return { completed: false, recipient: null };
  } catch (error) {
    console.error("Erro ao buscar status do recipient:", error);
    return { completed: false, recipient: null };
  }
}

/**
 * Salva o recipient no banco local
 */
export async function saveRecipient(payload: RecipientEntity): Promise<RecipientType> {
  const res = await api.bridge<CreateRecipientResponse>({
    method: "post",
    url: "recipients",
    data: payload,
  });

  if (!res?.response) {
    throw new Error(res?.message || "Erro ao salvar dados do recebedor");
  }

  if (!res.data) {
    throw new Error("Resposta sem dados do recebedor");
  }

  return res.data as RecipientType;
}

/**
 * Envia o recipient para a Pagar.me
 */
export async function registerRecipientInPagarme(payload?: Partial<RecipientEntity>): Promise<RecipientType> {
  const res = await api.bridge<CreateRecipientResponse>({
    method: "post",
    url: "recipient/register",
    data: payload || {},
  });

  if (!res?.response) {
    throw new Error(res?.message || "Erro ao cadastrar recebedor na Pagar.me");
  }

  if (!res.data) {
    throw new Error("Resposta sem dados do recebedor");
  }

  return res.data as RecipientType;
}

/**
 * Fluxo completo: salva no banco local E envia para a Pagar.me
 */
export async function createRecipient(payload: RecipientEntity): Promise<RecipientType> {
  // Primeiro salva no banco local
  await saveRecipient(payload);

  // Depois envia para a Pagar.me
  return registerRecipientInPagarme();
}
