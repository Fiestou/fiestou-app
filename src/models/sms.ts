import { OrderType } from "./order";

// src/models/sms.ts
export interface SmsOrderPayload {
  id?: number; // usado só no código SMS (#123)
  user: {
    id: number;
    email: string;
    name: string;
    phone: string;
  };

  deliveryStatus?: string;
  deliverySchedule?: string;
  deliveryPrice?: number;
  deliveryTo?: string;

  total: number;
  platformCommission?: string;
  status?: number;

  listItems?: any[];

  freights?: {
    zipcode: string;
    productsIds: number[];
  };

  // Campos opcionais para permitir compatibilidade
  deliveryAddress?: any;
}
