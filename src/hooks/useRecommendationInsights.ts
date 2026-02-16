import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Api from "@/src/services/api";

export interface RecommendationActorRow {
  actor_key: string;
  actor_type: "user" | "guest";
  user_id: number | null;
  user_name: string | null;
  user_email: string | null;
  visitor_id: string | null;
  view_count: number;
  cart_count: number;
  favorite_count: number;
  events_count: number;
  total_score: number;
  products_count: number;
  first_event_at: string | null;
  last_event_at: string | null;
}

export interface RecommendationStats {
  total_actors: number;
  guest_actors: number;
  logged_actors: number;
  interactions_total: number;
  products_tracked: number;
  stores_tracked: number;
  last_event_at: string | null;
  top_products: Array<any>;
  top_stores: Array<any>;
}

export interface RecommendationActorProfile {
  actor_key: string;
  actor_type: "user" | "guest";
  user: {
    id: number | null;
    name: string | null;
    email: string | null;
  };
  visitor_id: string | null;
  totals: {
    products_count: number;
    view_count: number;
    cart_count: number;
    favorite_count: number;
    events_count: number;
    total_score: number;
    first_event_at: string | null;
    last_event_at: string | null;
  };
  top_stores: Array<any>;
  products: Array<any>;
}

export function useRecommendationInsights(
  type: string = "all",
  search: string = "",
  page: number = 1,
  perPage: number = 20,
) {
  const api = useMemo(() => new Api(), []);
  const actorsRequestRef = useRef(0);
  const statsRequestRef = useRef(0);

  const [actors, setActors] = useState<RecommendationActorRow[]>([]);
  const [stats, setStats] = useState<RecommendationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    total: 0,
    per_page: perPage,
    current_page: page,
    last_page: 1,
  });

  const fetchActors = useCallback(async (options?: { silent?: boolean }) => {
    const requestId = ++actorsRequestRef.current;
    const silent = !!options?.silent;
    if (silent) {
      setRefreshing(true);
    } else {
      setLoading(true);
      setError(null);
    }

    try {
      const request: any = await api.bridge({
        method: "get",
        url: `admin/recommendations?type=${encodeURIComponent(
          type,
        )}&search=${encodeURIComponent(search)}&page=${page}&per_page=${perPage}`,
      });

      if (!request?.response) {
        if (requestId !== actorsRequestRef.current) return;
        setError(request?.message ?? "Falha ao carregar atores de recomendação.");
        setActors([]);
        return;
      }

      if (requestId !== actorsRequestRef.current) return;
      setActors(Array.isArray(request?.data) ? request.data : []);
      setPagination(
        request?.pagination ?? {
          total: 0,
          per_page: perPage,
          current_page: page,
          last_page: 1,
        },
      );
    } catch (err) {
      if (requestId !== actorsRequestRef.current) return;
      setError("Erro ao carregar dados de recomendação.");
      setActors([]);
    } finally {
      if (requestId === actorsRequestRef.current) {
        if (silent) {
          setRefreshing(false);
        } else {
          setLoading(false);
        }
      }
    }
  }, [api, type, search, page, perPage]);

  const fetchStats = useCallback(async () => {
    const requestId = ++statsRequestRef.current;
    try {
      const request: any = await api.bridge({
        method: "get",
        url: "admin/recommendations/stats",
      });

      if (requestId === statsRequestRef.current && request?.response) {
        setStats(request.data);
      }
    } catch (err) {
      // Stats não deve quebrar a listagem
    }
  }, [api]);

  const getProfile = useCallback(async (actorKey: string) => {
    try {
      const request: any = await api.bridge({
        method: "get",
        url: `admin/recommendations/profile?actor_key=${encodeURIComponent(actorKey)}`,
      });

      if (request?.response) {
        return request.data as RecommendationActorProfile;
      }
      return null;
    } catch (err) {
      return null;
    }
  }, [api]);

  const refresh = useCallback(async (options?: { silent?: boolean }) => {
    await Promise.all([fetchActors(options), fetchStats()]);
  }, [fetchActors, fetchStats]);

  useEffect(() => {
    fetchActors();
  }, [fetchActors]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    actors,
    stats,
    loading,
    refreshing,
    error,
    pagination,
    refresh,
    getProfile,
  };
}
