import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Template from "@/src/template";
import Breadcrumbs from "@/src/components/common/Breadcrumb";
import Icon from "@/src/icons/fontAwesome/FIcon";
import Img from "@/src/components/utils/ImgBase";
import { getImage } from "@/src/helper";
import {
  RecommendationActorProfile,
  RecommendationActorRow,
  useRecommendationInsights,
} from "@/src/hooks/useRecommendationInsights";

const formatDateTime = (value?: string | null) => {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("pt-BR");
};

const formatPercent = (value: number) => `${value.toFixed(1)}%`;

const formatLocation = (
  location?:
    | {
        label?: string | null;
        city_name?: string | null;
        region_name?: string | null;
        country_code?: string | null;
      }
    | null,
) => {
  if (!location) return "Local não informado";
  if (location.label && location.label.trim() !== "") return location.label;

  const parts = [location.city_name, location.region_name, location.country_code]
    .map((value) => (value || "").trim())
    .filter(Boolean);

  if (parts.length === 0) return "Local não informado";
  return parts.join(", ");
};

const toCsvValue = (value: unknown) => {
  const raw = `${value ?? ""}`.replace(/\r?\n/g, " ").trim();
  const escaped = raw.replace(/"/g, '""');
  return `"${escaped}"`;
};

const downloadCsv = (filename: string, lines: string[]) => {
  if (typeof window === "undefined") return;
  const content = `\ufeff${lines.join("\n")}`;
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const href = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = href;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(href);
};

function ActorLabel({ actor }: { actor: RecommendationActorRow }) {
  if (actor.actor_type === "user") {
    return (
      <div>
        <p className="font-semibold text-zinc-900">{actor.user_name || "Usuário"}</p>
        <p className="text-xs text-zinc-500">{actor.user_email || "Sem e-mail"}</p>
      </div>
    );
  }

  return (
    <div>
      <p className="font-semibold text-zinc-900">Visitante</p>
      <p className="text-xs text-zinc-500 break-all">
        {actor.visitor_id || actor.actor_key}
      </p>
    </div>
  );
}

export default function AdminRecomendacoes() {
  const [type, setType] = useState("all");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [insightTab, setInsightTab] = useState<"commerce" | "geo">("commerce");
  const [liveMode, setLiveMode] = useState(true);
  const [lastSyncAt, setLastSyncAt] = useState<Date | null>(null);
  const [selectedProfile, setSelectedProfile] =
    useState<RecommendationActorProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const profileRequestRef = useRef(0);
  const profileSectionRef = useRef<HTMLDivElement | null>(null);

  const {
    actors,
    stats,
    loading,
    refreshing,
    error,
    pagination,
    refresh,
    getProfile,
  } =
    useRecommendationInsights(type, search, page, 20);

  const guestShare = useMemo(() => {
    if (!stats?.total_actors) return 0;
    return (Number(stats.guest_actors || 0) / Number(stats.total_actors || 1)) * 100;
  }, [stats]);

  const interactionsPerActor = useMemo(() => {
    if (!stats?.total_actors) return 0;
    return Number(stats.interactions_total || 0) / Number(stats.total_actors || 1);
  }, [stats]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const openProfile = async (actorKey: string) => {
    const requestId = ++profileRequestRef.current;
    setLoadingProfile(true);
    setProfileError(null);
    const profile = await getProfile(actorKey);

    if (requestId !== profileRequestRef.current) return;

    if (!profile) {
      setSelectedProfile(null);
      setProfileError("Não foi possível carregar o perfil selecionado.");
      setLoadingProfile(false);
      return;
    }

    setSelectedProfile(profile);
    setLoadingProfile(false);
    profileSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  const refreshSelectedProfileSilently = useCallback(async () => {
    const actorKey = selectedProfile?.actor_key;
    if (!actorKey) return;

    const profile = await getProfile(actorKey);
    if (!profile) return;

    setSelectedProfile((prev) =>
      prev?.actor_key === actorKey ? profile : prev,
    );
  }, [getProfile, selectedProfile?.actor_key]);

  const runLiveSync = useCallback(async () => {
    await refresh({ silent: true });

    await refreshSelectedProfileSilently();

    setLastSyncAt(new Date());
  }, [refresh, refreshSelectedProfileSilently]);

  useEffect(() => {
    if (!liveMode) return;

    const timer = setInterval(() => {
      runLiveSync();
    }, 15000);

    return () => clearInterval(timer);
  }, [liveMode, runLiveSync]);

  useEffect(() => {
    if (!liveMode) return;

    const onVisibilityChange = () => {
      if (!document.hidden) {
        runLiveSync();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [liveMode, runLiveSync]);

  const exportActorsCsv = () => {
    if (!actors.length) return;

    const header = [
      "actor_key",
      "actor_type",
      "user_name",
      "user_email",
      "visitor_id",
      "products_count",
      "events_count",
      "view_count",
      "cart_count",
      "favorite_count",
      "total_score",
      "unique_ip_count",
      "countries",
      "regions",
      "last_location",
      "first_event_at",
      "last_event_at",
    ]
      .map(toCsvValue)
      .join(",");

    const lines = actors.map((actor) =>
      [
        actor.actor_key,
        actor.actor_type,
        actor.user_name || "",
        actor.user_email || "",
        actor.visitor_id || "",
        actor.products_count,
        actor.events_count,
        actor.view_count,
        actor.cart_count,
        actor.favorite_count,
        actor.total_score,
        actor.unique_ip_count,
        (actor.countries || []).join(" | "),
        (actor.regions || []).join(" | "),
        formatLocation(actor.last_location),
        actor.first_event_at || "",
        actor.last_event_at || "",
      ]
        .map(toCsvValue)
        .join(",")
    );

    const stamp = new Date().toISOString().slice(0, 10);
    downloadCsv(`recomendacoes-atores-${stamp}.csv`, [header, ...lines]);
  };

  return (
    <Template header={{ template: "admin", position: "solid" }}>
      <section>
        <div className="container-medium pt-8">
          <Breadcrumbs
            links={[
              { url: "/admin", name: "Admin" },
              { url: "/admin/recomendacoes", name: "Recomendações" },
            ]}
          />
        </div>
      </section>

      <section>
        <div className="container-medium py-8 grid gap-6">
          <div className="bg-white border border-zinc-200 rounded-2xl p-5 md:p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="max-w-2xl">
                <h1 className="font-title font-bold text-3xl text-zinc-900">
                  Inteligência de Recomendações
                </h1>
                <p className="text-zinc-500 text-sm mt-2 leading-relaxed">
                  Acompanhe interesse dos clientes por comportamento, afinidade com
                  produtos e distribuição geográfica para evoluir o &quot;Veja também&quot;.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={exportActorsCsv}
                  disabled={!actors.length}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm bg-white border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors text-zinc-700 disabled:opacity-50"
                >
                  <Icon icon="fa-download" type="far" className="text-xs" />
                  Exportar CSV
                </button>
                <button
                  type="button"
                  onClick={() => refresh()}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm bg-zinc-900 border border-zinc-900 rounded-xl hover:bg-zinc-800 transition-colors text-white"
                >
                  <Icon icon="fa-sync" type="far" className="text-xs" />
                  Atualizar
                </button>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-zinc-600">
                Atualização automática:{" "}
                <span className="font-semibold text-zinc-900">
                  {liveMode ? "ativa (15s)" : "desativada"}
                </span>
                {refreshing ? " • sincronizando..." : ""}
                {lastSyncAt ? ` • última: ${lastSyncAt.toLocaleTimeString("pt-BR")}` : ""}
              </p>
              <button
                type="button"
                onClick={() => setLiveMode((prev) => !prev)}
                className={`px-3 py-1.5 rounded-lg text-xs border transition-colors ${
                  liveMode
                    ? "bg-cyan-50 border-cyan-200 text-cyan-700"
                    : "bg-zinc-50 border-zinc-200 text-zinc-700"
                }`}
              >
                {liveMode ? "Desativar live" : "Ativar live"}
              </button>
            </div>
          </div>

          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-3">
              <div className="bg-white border border-zinc-200 rounded-xl p-4">
                <p className="text-xs text-zinc-500">Atores totais</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">{stats.total_actors}</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-4">
                <p className="text-xs text-zinc-500">Logados</p>
                <p className="text-2xl font-bold text-cyan-700 mt-1">{stats.logged_actors}</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-4">
                <p className="text-xs text-zinc-500">Guests</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">{stats.guest_actors}</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-4">
                <p className="text-xs text-zinc-500">Interações</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">{stats.interactions_total}</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-4">
                <p className="text-xs text-zinc-500">Produtos rastreados</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">{stats.products_tracked}</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-4">
                <p className="text-xs text-zinc-500">IPs únicas</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">{stats.unique_ips || 0}</p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-4">
                <p className="text-xs text-zinc-500">Países</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">
                  {stats.countries_tracked || 0}
                </p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-4">
                <p className="text-xs text-zinc-500">Regiões</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">
                  {stats.regions_tracked || 0}
                </p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-4">
                <p className="text-xs text-zinc-500">Interações por ator</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">
                  {interactionsPerActor.toFixed(1)}
                </p>
              </div>
              <div className="bg-white border border-zinc-200 rounded-xl p-4">
                <p className="text-xs text-zinc-500">% Guests</p>
                <p className="text-2xl font-bold text-zinc-900 mt-1">
                  {formatPercent(guestShare)}
                </p>
                <p className="text-xs text-zinc-500 mt-2">
                  Última interação: {formatDateTime(stats.last_event_at)}
                </p>
              </div>
            </div>
          )}

          {stats &&
            (stats.top_products?.length > 0 ||
              stats.top_stores?.length > 0 ||
              stats.top_regions?.length > 0) && (
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 md:p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-semibold text-zinc-900 text-lg">Insights de comportamento</h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Altere a visão para focar em conversão comercial ou distribuição geográfica.
                  </p>
                </div>
                <div className="inline-flex rounded-xl border border-zinc-200 bg-zinc-50 p-1">
                  <button
                    type="button"
                    onClick={() => setInsightTab("commerce")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      insightTab === "commerce"
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-700"
                    }`}
                  >
                    Produtos e lojas
                  </button>
                  <button
                    type="button"
                    onClick={() => setInsightTab("geo")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      insightTab === "geo"
                        ? "bg-white text-zinc-900 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-700"
                    }`}
                  >
                    Geografia e IP
                  </button>
                </div>
              </div>

              {insightTab === "commerce" ? (
                <div className="grid xl:grid-cols-2 gap-4">
                  <div className="border border-zinc-200 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="font-semibold text-zinc-900">Top produtos</h3>
                      <span className="text-xs text-zinc-500">Score acumulado</span>
                    </div>
                    <div className="grid gap-2">
                      {(stats.top_products || []).slice(0, 8).map((row: any) => {
                        const product = row?.product ?? null;
                        const cover = product?.gallery?.[0];
                        const image =
                          getImage(cover, "thumb") ||
                          getImage(cover, "sm") ||
                          getImage(cover);
                        const title = product?.title || `Produto #${row?.product_id}`;

                        return (
                          <div
                            key={`top-product-${row?.product_id}`}
                            className="border border-zinc-200 rounded-lg p-2.5 flex items-center gap-3"
                          >
                            <div className="w-12 h-12 rounded-md bg-zinc-100 overflow-hidden shrink-0">
                              {image ? (
                                <Img src={image} className="w-full h-full object-cover" />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-zinc-900 truncate">
                                {title}
                              </p>
                              <p className="text-xs text-zinc-500">
                                Score {Number(row?.total_score || 0)} •{" "}
                                {Number(row?.events_count || 0)} eventos
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {(stats.top_products || []).length === 0 && (
                        <p className="text-sm text-zinc-500">
                          Ainda sem dados de produtos em destaque.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border border-zinc-200 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="font-semibold text-zinc-900">Top lojas</h3>
                      <span className="text-xs text-zinc-500">Afinidade por loja</span>
                    </div>
                    <div className="grid gap-2">
                      {(stats.top_stores || []).slice(0, 8).map((row: any) => (
                        <div
                          key={`top-store-${row?.store_id}`}
                          className="border border-zinc-200 rounded-lg p-2.5 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-900 truncate">
                              {row?.store_name || `Loja #${row?.store_id}`}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {Number(row?.events_count || 0)} eventos
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-zinc-900 whitespace-nowrap">
                            Score {Number(row?.total_score || 0)}
                          </span>
                        </div>
                      ))}
                      {(stats.top_stores || []).length === 0 && (
                        <p className="text-sm text-zinc-500">
                          Ainda sem dados de lojas em destaque.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid xl:grid-cols-[2fr_1fr] gap-4">
                  <div className="border border-zinc-200 rounded-xl p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="font-semibold text-zinc-900">Top regiões</h3>
                      <span className="text-xs text-zinc-500">Atores e IPs por localidade</span>
                    </div>
                    <div className="grid gap-2">
                      {(stats.top_regions || []).slice(0, 8).map((row: any, index: number) => (
                        <div
                          key={`top-region-${index}-${row?.label || "unknown"}`}
                          className="border border-zinc-200 rounded-lg p-3 flex items-center justify-between gap-3"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-zinc-900 truncate">
                              {row?.label || "Local não informado"}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                              {Number(row?.actors_count || 0)} atores •{" "}
                              {Number(row?.unique_ip_count || 0)} IPs
                            </p>
                          </div>
                          <span className="text-sm font-semibold text-zinc-900 whitespace-nowrap">
                            {Number(row?.events_count || 0)} eventos
                          </span>
                        </div>
                      ))}
                      {(stats.top_regions || []).length === 0 && (
                        <p className="text-sm text-zinc-500">
                          Ainda sem dados de regiões em destaque.
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="border border-zinc-200 rounded-xl p-4 bg-zinc-50">
                    <h3 className="font-semibold text-zinc-900 text-sm">Resumo geográfico</h3>
                    <div className="mt-3 grid gap-2 text-sm">
                      <p className="text-zinc-700">
                        <span className="font-semibold text-zinc-900">{stats.unique_ips || 0}</span>{" "}
                        IPs únicas rastreadas.
                      </p>
                      <p className="text-zinc-700">
                        <span className="font-semibold text-zinc-900">
                          {stats.countries_tracked || 0}
                        </span>{" "}
                        países com tráfego registrado.
                      </p>
                      <p className="text-zinc-700">
                        <span className="font-semibold text-zinc-900">
                          {stats.regions_tracked || 0}
                        </span>{" "}
                        regiões distintas no período.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="grid xl:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] gap-6 items-start">
            <div className="grid gap-4">
              <div className="bg-white border border-zinc-200 rounded-2xl p-4 md:p-5 shadow-sm">
                <div className="flex flex-wrap items-end gap-4">
                  <div>
                    <label className="block text-xs text-zinc-500 mb-1">Tipo de ator</label>
                    <select
                      value={type}
                      onChange={(e) => {
                        setPage(1);
                        setType(e.target.value);
                      }}
                      className="px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none bg-white"
                    >
                      <option value="all">Todos</option>
                      <option value="user">Somente logados</option>
                      <option value="guest">Somente guests</option>
                    </select>
                  </div>
                  <div className="flex-1 min-w-[240px]">
                    <label className="block text-xs text-zinc-500 mb-1">Busca</label>
                    <input
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      placeholder="Nome, e-mail, visitor id, actor key, país ou cidade"
                      className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm outline-none"
                    />
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mt-3">
                  {pagination.total} perfis encontrados com os filtros atuais.
                </p>
              </div>

              {loading && (
                <div className="bg-white border border-zinc-200 rounded-2xl p-8 shadow-sm">
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-zinc-400"></div>
                    <span className="ml-3 text-zinc-500">Carregando...</span>
                  </div>
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-red-600">
                  {error}
                </div>
              )}

              {!loading && !error && (
                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="overflow-auto max-h-[680px]">
                    <table className="min-w-full text-sm">
                      <thead className="sticky top-0 z-10">
                        <tr className="bg-zinc-50 border-b text-zinc-600">
                          <th className="text-left px-4 py-3 font-semibold">Ator</th>
                          <th className="text-left px-4 py-3 font-semibold">Tipo</th>
                          <th className="text-left px-4 py-3 font-semibold">Produtos</th>
                          <th className="text-left px-4 py-3 font-semibold">Eventos</th>
                          <th className="text-left px-4 py-3 font-semibold">Score</th>
                          <th className="text-left px-4 py-3 font-semibold">Última interação</th>
                          <th className="text-left px-4 py-3 font-semibold">Rede</th>
                          <th className="text-left px-4 py-3 font-semibold">Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {actors.map((actor, index) => (
                          <tr
                            key={actor.actor_key}
                            className={`border-b last:border-b-0 ${
                              index % 2 === 0 ? "bg-white" : "bg-zinc-50/40"
                            }`}
                          >
                            <td className="px-4 py-3 align-top">
                              <ActorLabel actor={actor} />
                            </td>
                            <td className="px-4 py-3 align-top">
                              <span
                                className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                                  actor.actor_type === "user"
                                    ? "bg-cyan-100 text-cyan-700"
                                    : "bg-zinc-100 text-zinc-700"
                                }`}
                              >
                                {actor.actor_type === "user" ? "Logado" : "Guest"}
                              </span>
                            </td>
                            <td className="px-4 py-3 align-top">{actor.products_count}</td>
                            <td className="px-4 py-3 align-top">{actor.events_count}</td>
                            <td className="px-4 py-3 align-top font-semibold text-zinc-900">
                              {actor.total_score}
                            </td>
                            <td className="px-4 py-3 align-top">
                              {formatDateTime(actor.last_event_at)}
                            </td>
                            <td className="px-4 py-3 align-top">
                              <p className="text-xs text-zinc-900 font-semibold">
                                {actor.unique_ip_count || 0} IPs
                              </p>
                              <p className="text-xs text-zinc-500 mt-1 max-w-[220px] line-clamp-2">
                                {formatLocation(actor.last_location)}
                              </p>
                            </td>
                            <td className="px-4 py-3 align-top">
                              <button
                                type="button"
                                onClick={() => openProfile(actor.actor_key)}
                                className="px-3 py-1.5 border border-zinc-200 rounded-lg text-xs hover:bg-zinc-50"
                              >
                                Ver perfil
                              </button>
                            </td>
                          </tr>
                        ))}
                        {actors.length === 0 && (
                          <tr>
                            <td colSpan={8} className="px-4 py-8 text-center text-zinc-500">
                              Nenhum perfil encontrado com os filtros atuais.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>

                  <div className="px-4 py-3 border-t border-zinc-200 flex items-center justify-between gap-4 text-sm bg-white">
                    <p className="text-zinc-500">
                      Página {pagination.current_page} de {pagination.last_page} (
                      {pagination.total} registros)
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                        disabled={pagination.current_page <= 1}
                        className="px-3 py-1.5 border border-zinc-200 rounded-lg disabled:opacity-50"
                      >
                        Anterior
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setPage((prev) => Math.min(pagination.last_page, prev + 1))
                        }
                        disabled={pagination.current_page >= pagination.last_page}
                        className="px-3 py-1.5 border border-zinc-200 rounded-lg disabled:opacity-50"
                      >
                        Próxima
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              ref={profileSectionRef}
              className="bg-white border border-zinc-200 rounded-2xl p-4 md:p-5 shadow-sm xl:sticky xl:top-24"
            >
              <div className="flex items-center justify-between gap-3 mb-4">
                <div>
                  <h2 className="font-title font-bold text-xl text-zinc-900">
                    Perfil selecionado
                  </h2>
                  <p className="text-xs text-zinc-500 mt-1">
                    Análise detalhada do ator escolhido na tabela.
                  </p>
                </div>
                {selectedProfile && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProfile(null);
                      setProfileError(null);
                    }}
                    className="px-3 py-1.5 border border-zinc-200 rounded-lg text-xs hover:bg-zinc-50"
                  >
                    Limpar
                  </button>
                )}
              </div>

              {loadingProfile && (
                <div className="text-zinc-500 text-sm py-4">Carregando perfil...</div>
              )}

              {!loadingProfile && !selectedProfile && (
                <div className="text-zinc-500 text-sm py-4">
                  Selecione um ator na tabela para visualizar os detalhes.
                </div>
              )}

              {!loadingProfile && profileError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-600">
                  {profileError}
                </div>
              )}

              {!loadingProfile && selectedProfile && (
                <div className="grid gap-5">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="bg-zinc-50 rounded-lg p-3">
                      <p className="text-xs text-zinc-500">Ator</p>
                      <p className="font-semibold text-zinc-900">
                        {selectedProfile.actor_type === "user"
                          ? selectedProfile.user?.name || "Usuário"
                          : "Visitante"}
                      </p>
                      <p className="text-xs text-zinc-500 break-all mt-1">
                        {selectedProfile.actor_type === "user"
                          ? selectedProfile.user?.email || selectedProfile.actor_key
                          : selectedProfile.visitor_id || selectedProfile.actor_key}
                      </p>
                    </div>
                    <div className="bg-zinc-50 rounded-lg p-3">
                      <p className="text-xs text-zinc-500">Resumo</p>
                      <p className="font-semibold text-zinc-900">
                        {selectedProfile.totals.events_count} eventos
                      </p>
                      <p className="text-xs text-zinc-500 mt-1">
                        {selectedProfile.totals.products_count} produtos • score{" "}
                        {selectedProfile.totals.total_score}
                      </p>
                    </div>
                    <div className="bg-zinc-50 rounded-lg p-3">
                      <p className="text-xs text-zinc-500">Última interação</p>
                      <p className="font-semibold text-zinc-900">
                        {formatDateTime(selectedProfile.totals.last_event_at)}
                      </p>
                    </div>
                    <div className="bg-zinc-50 rounded-lg p-3">
                      <p className="text-xs text-zinc-500">Rede</p>
                      <p className="font-semibold text-zinc-900">
                        {selectedProfile.network?.unique_ip_count || 0} IPs únicas
                      </p>
                      <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                        {formatLocation(selectedProfile.network?.last_location)}
                      </p>
                    </div>
                  </div>

                  {selectedProfile.top_stores?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Top lojas</h3>
                      <div className="grid gap-2">
                        {selectedProfile.top_stores.slice(0, 6).map((store: any) => (
                          <div
                            key={`${store.store_id}-${store.total_score}`}
                            className="border border-zinc-200 rounded-lg p-3"
                          >
                            <p className="font-semibold text-zinc-900 text-sm">{store.store_name}</p>
                            <p className="text-xs text-zinc-500 mt-1">
                              Score {store.total_score} • {store.events_count} eventos
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedProfile.network?.recent_locations?.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-zinc-900 mb-2">Localizações recentes</h3>
                      <div className="grid gap-2">
                        {selectedProfile.network.recent_locations.slice(0, 6).map((location: any, index: number) => (
                          <div
                            key={`network-location-${index}-${location?.label || "unknown"}`}
                            className="border border-zinc-200 rounded-lg p-3"
                          >
                            <p className="font-semibold text-zinc-900 text-sm">
                              {formatLocation(location)}
                            </p>
                            <p className="text-xs text-zinc-500 mt-1">
                              Última atividade: {formatDateTime(location?.last_seen_at)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-zinc-900 mb-2">Top produtos</h3>
                    <div className="grid gap-2 max-h-[360px] overflow-auto pr-1">
                      {selectedProfile.products.slice(0, 20).map((item: any) => {
                        const cover = item?.product?.gallery?.[0];
                        const image = getImage(cover, "thumb");

                        return (
                          <div
                            key={`${item.product_id}-${item.total_score}`}
                            className="border border-zinc-200 rounded-lg p-3 flex gap-3 items-start"
                          >
                            <div className="w-14 h-14 rounded-lg bg-zinc-100 overflow-hidden shrink-0">
                              {image ? (
                                <Img src={image} className="w-full h-full object-cover" />
                              ) : null}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-zinc-900 text-sm line-clamp-2">
                                {item?.product?.title || `Produto #${item.product_id}`}
                              </p>
                              <p className="text-xs text-zinc-500 mt-1">
                                Score {item.total_score} • Views {item.view_count} • Carrinho{" "}
                                {item.cart_count}
                              </p>
                              <p className="text-xs text-zinc-400 mt-1">
                                Último evento: {formatDateTime(item.last_event_at)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      {selectedProfile.products.length === 0 && (
                        <div className="text-sm text-zinc-500">
                          Este perfil ainda não possui produtos rastreados.
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </Template>
  );
}
