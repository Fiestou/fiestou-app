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

export async function registerRecipientInPagarme(payload: Partial<RecipientEntity>): Promise<RecipientType> {
  const res = await api.bridge<CreateRecipientResponse>({
    method: "post",
    url: "recipient/register",
    data: payload,
  });

  if (!res?.response) {
    throw new Error(res?.message || "Erro ao cadastrar recebedor na Pagar.me");
  }

  if (!res.data) {
    throw new Error("Resposta sem dados do recebedor");
  }

  return res.data as RecipientType;
}

export async function createRecipient(payload: RecipientEntity): Promise<RecipientType> {
  return registerRecipientInPagarme(payload);
}
