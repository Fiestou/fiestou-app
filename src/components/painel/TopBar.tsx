import { useRouter } from "next/router";
import { useContext } from "react";
import { Menu, LogOut, ChevronRight, PanelLeftOpen, Grid2x2 } from "lucide-react";
import { AuthContext } from "@/src/contexts/AuthContext";
import { UserType } from "@/src/models/user";
import Link from "next/link";

const BREADCRUMB_MAP: Record<string, string> = {
  painel: "Painel de vendas",
  pedidos: "Pedidos",
  produtos: "Produtos",
  novo: "Novo Produto",
  clientes: "Clientes",
  loja: "Minha Loja",
  conta: "Conta bancária",
  financeiro: "Financeiro",
  saques: "Financeiro",
  dados_do_recebedor: "Cadastro financeiro",
  chat: "Chat",
};

function resolveSegments(routerPath: string) {
  const cleanPath = routerPath.split("#")[0]?.split("?")[0] || "/";
  return cleanPath.split("/").filter(Boolean);
}

function resolveDynamicSegment(seg: string, query: Record<string, string | string[] | undefined>) {
  if (!seg.startsWith("[")) {
    return seg;
  }

  const key = seg.replace(/^\[/, "").replace(/\]$/, "");
  const rawValue = query[key];
  const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;

  return value ? String(value) : seg;
}

function getSegmentLabel(seg: string, previous: string) {
  const isId = /^\d+$/.test(seg) || seg.startsWith("[");
  if (isId) {
    if (previous === "pedidos") return `Pedido #${seg}`;
    if (previous === "produtos") return `Produto #${seg}`;
    if (previous === "clientes") return `Cliente #${seg}`;
    return `#${seg}`;
  }

  return BREADCRUMB_MAP[seg] || seg;
}

function Breadcrumbs() {
  const router = useRouter();
  const segments = resolveSegments(router.asPath).map((segment) =>
    resolveDynamicSegment(segment, router.query as Record<string, string | string[] | undefined>),
  );

  return (
    <div className="flex min-w-0 items-center gap-1 text-sm sm:text-base overflow-x-auto whitespace-nowrap max-w-[calc(100vw-8.5rem)] sm:max-w-[65vw] lg:max-w-none">
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        const previous = segments[i - 1] || "";
        const label = getSegmentLabel(seg, previous);
        const href = "/" + segments.slice(0, i + 1).join("/");

        return (
          <span key={i} className="flex min-w-0 items-center gap-1">
            {i > 0 && <ChevronRight size={13} className="shrink-0 text-zinc-400" />}
            {isLast ? (
              <span className="min-w-0 truncate text-zinc-900 font-semibold">{label}</span>
            ) : (
              <Link href={href} className="shrink-0 text-zinc-600 hover:text-zinc-900 transition-colors">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
}

function SimpleTitle() {
  const router = useRouter();
  const segments = resolveSegments(router.asPath).map((segment) =>
    resolveDynamicSegment(segment, router.query as Record<string, string | string[] | undefined>),
  );
  const current = segments[segments.length - 1] || "painel";
  const previous = segments[segments.length - 2] || "";
  const label = getSegmentLabel(current, previous);

  return (
    <div className="min-w-0">
      <p className="truncate text-sm font-semibold text-zinc-900 sm:text-base">
        {label}
      </p>
    </div>
  );
}

export default function TopBar({
  user,
  panelMode,
  onTogglePanelMode,
  onMenuClick,
}: {
  user: UserType;
  panelMode: "simple" | "full";
  onTogglePanelMode: () => void;
  onMenuClick: () => void;
}) {
  const { UserLogout } = useContext(AuthContext);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
      <div className="h-1 bg-gradient-to-r from-yellow-400 via-cyan-400 to-yellow-400" />
      <div className="flex items-center justify-between h-12 sm:h-14 px-3 sm:px-4 lg:px-8 gap-3">
        <div className="flex min-w-0 items-center gap-2 sm:gap-4">
          {panelMode === "full" && (
            <button
              onClick={onMenuClick}
              className="lg:hidden shrink-0 p-2 rounded-lg text-yellow-700 hover:bg-yellow-50 transition-colors border border-zinc-200"
            >
              <Menu size={20} />
            </button>
          )}
          {panelMode === "simple" ? <SimpleTitle /> : <Breadcrumbs />}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            onClick={onTogglePanelMode}
            className="flex items-center gap-2 rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-700 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
          >
            {panelMode === "simple" ? (
              <>
                <PanelLeftOpen size={16} className="text-yellow-700" />
                <span className="hidden md:inline">Ver completo</span>
              </>
            ) : (
              <>
                <Grid2x2 size={16} className="text-yellow-700" />
                <span className="hidden md:inline">Modo simples</span>
              </>
            )}
          </button>

          <button
            onClick={() => UserLogout()}
            className="flex shrink-0 items-center gap-2 px-3 py-2 text-sm sm:text-base text-zinc-700 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-zinc-200"
          >
            <LogOut size={16} className="text-yellow-700" />
            <span className="hidden sm:inline">Sair</span>
          </button>
        </div>
      </div>
    </header>
  );
}
