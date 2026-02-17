import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Api from "@/src/services/api";

export interface RecommendationNetworkLocation {
  country_code: string | null;
  region_code?: string | null;
  region_name: string | null;
  city_name: string | null;
  label: string;
  last_seen_at: string | null;
}

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
  unique_ip_count: number;
  countries: string[];
  regions: string[];
  last_location: RecommendationNetworkLocation | null;
  last_network_event_at: string | null;
}

export interface RecommendationStats {
  total_actors: number;
  guest_actors: number;
  logged_actors: number;
  interactions_total: number;
  products_tracked: number;
  stores_tracked: number;
  unique_ips: number;
  countries_tracked: number;
  regions_tracked: number;
  last_event_at: string | null;
  top_products: Array<any>;
  top_stores: Array<any>;
  top_regions: Array<{
    country_code: string | null;
    region_code: string | null;
    region_name: string | null;
    city_name: string | null;
    label: string;
    actors_count: number;
    unique_ip_count: number;
    events_count: number;
    last_seen_at: string | null;
  }>;
}

export interface RecommendationSearchSource {
  source: string;
  searches: number;
  zero_results: number;
  zero_results_rate: number;
  last_search_at: string | null;
}

export interface RecommendationSearchTerm {
  term: string;
  normalized_term: string;
  searches: number;
  zero_results: number;
  zero_results_rate: number;
  average_results: number;
  unique_actors: number;
  last_search_at: string | null;
}

export interface RecommendationSearchStats {
  totals: {
    searches: number;
    unique_actors: number;
    unique_terms: number;
    zero_results_searches: number;
    zero_results_rate: number;
    average_results: number;
    last_search_at: string | null;
  };
  top_sources: RecommendationSearchSource[];
  top_zero_result_terms: RecommendationSearchTerm[];
  terms: RecommendationSearchTerm[];
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
  network: {
    unique_ip_count: number;
    countries: string[];
    regions: string[];
    last_seen_at: string | null;
    last_location: RecommendationNetworkLocation | null;
    recent_locations: RecommendationNetworkLocation[];
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
  const searchStatsRequestRef = useRef(0);

  const [actors, setActors] = useState<RecommendationActorRow[]>([]);
  const [stats, setStats] = useState<RecommendationStats | null>(null);
  const [searchStats, setSearchStats] = useState<RecommendationSearchStats | null>(null);
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

  const fetchSearchStats = useCallback(async () => {
    const requestId = ++searchStatsRequestRef.current;
    try {
      const request: any = await api.bridge({
        method: "get",
        url: "admin/recommendations/search-stats?per_page=12&page=1",
      });

      if (requestId === searchStatsRequestRef.current && request?.response) {
        setSearchStats(request.data as RecommendationSearchStats);
      }
    } catch (err) {
      // Insights de busca não devem quebrar a tela.
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
    await Promise.all([fetchActors(options), fetchStats(), fetchSearchStats()]);
  }, [fetchActors, fetchStats, fetchSearchStats]);

  useEffect(() => {
    fetchActors();
  }, [fetchActors]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchSearchStats();
  }, [fetchSearchStats]);

  return {
    actors,
    stats,
    searchStats,
    loading,
    refreshing,
    error,
    pagination,
    refresh,
    getProfile,
  };
}
