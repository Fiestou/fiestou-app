export interface BalanceData {
  cash?: number;
  payments?: number;
  promises?: number;
  orders?: number;
}

export interface OrderData {
  id: number;
  total: number;
  created_at: string;
  user: {
    name: string;
  };
  order: {
    id: number;
    metadata?: {
      payment_status?: string;
    };
  };
}