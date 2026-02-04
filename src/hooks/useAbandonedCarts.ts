import { useEffect, useState, useCallback } from "react";
import Api from "@/src/services/api";

export interface AbandonedCart {
  id: number;
  user_id: number;
  user_name: string;
  user_email: string;
  items_count: number;
  total: number;
  last_activity_at: string;
  notified_at: string | null;
  hours_abandoned: number;
}

export interface AbandonedCartStats {
  total: number;
  pending: number;
  notified: number;
  total_value: number;
}

export interface AbandonedCartDetail {
  id: number;
  user: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
  };
  items: any[];
  total: number;
  last_activity_at: string;
  notified_at: string | null;
}

export function useAbandonedCarts(status: string = "all", hours: number = 10) {
  const api = new Api();
  const [carts, setCarts] = useState<AbandonedCart[]>([]);
  const [stats, setStats] = useState<AbandonedCartStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCarts = useCallback(async () => {
    try {
      setLoading(true);
      const request: any = await api.bridge({
        method: "get",
        url: `admin/abandoned-carts?status=${status}&hours=${hours}`,
      });

      if (request.response) {
        setCarts(request.data);
      } else {
        setError("Falha ao carregar carrinhos");
      }
    } catch (err) {
      setError("Erro ao carregar carrinhos abandonados");
    } finally {
      setLoading(false);
    }
  }, [status, hours]);

  const fetchStats = useCallback(async () => {
    try {
      const request: any = await api.bridge({
        method: "get",
        url: `admin/abandoned-carts/stats?hours=${hours}`,
      });

      if (request.response) {
        setStats(request.data);
      }
    } catch (err) {
      console.error("Erro ao carregar estatísticas");
    }
  }, [hours]);

  const getCartDetail = async (id: number): Promise<AbandonedCartDetail | null> => {
    try {
      const request: any = await api.bridge({
        method: "get",
        url: `admin/abandoned-carts/${id}`,
      });

      if (request.response) {
        return request.data;
      }
      return null;
    } catch (err) {
      return null;
    }
  };

  const sendEmail = async (
    id: number,
    subject: string,
    message: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const request: any = await api.bridge({
        method: "post",
        url: `admin/abandoned-carts/${id}/send-email`,
        data: { subject, message },
      });

      if (request.response) {
        await fetchCarts();
        await fetchStats();
        return { success: true };
      }
      return { success: false, error: request.message || "Erro ao enviar" };
    } catch (err: any) {
      return { success: false, error: err.message || "Erro ao enviar email" };
    }
  };

  useEffect(() => {
    fetchCarts();
    fetchStats();
  }, [fetchCarts, fetchStats]);

  return {
    carts,
    stats,
    loading,
    error,
    refresh: fetchCarts,
    getCartDetail,
    sendEmail,
  };
}
