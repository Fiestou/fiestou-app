import { useRouter } from "next/router";
import { useContext } from "react";
import { Menu, LogOut, ChevronRight } from "lucide-react";
import { AuthContext } from "@/src/contexts/AuthContext";
import { UserType } from "@/src/models/user";
import Link from "next/link";

const BREADCRUMB_MAP: Record<string, string> = {
  painel: "Dashboard",
  pedidos: "Pedidos",
  produtos: "Produtos",
  novo: "Novo Produto",
  clientes: "Clientes",
  loja: "Minha Loja",
  conta: "Minha Conta",
  saques: "Saques",
  dados_do_recebedor: "Dados do Recebedor",
  chat: "Chat",
};

function Breadcrumbs() {
  const router = useRouter();
  const segments = router.asPath.split("/").filter(Boolean);

  return (
    <div className="flex items-center gap-1.5 text-sm">
      {segments.map((seg, i) => {
        const isLast = i === segments.length - 1;
        const isId = /^\d+$/.test(seg) || seg.startsWith("[");
        const label = isId ? `#${seg}` : BREADCRUMB_MAP[seg] || seg;
        const href = "/" + segments.slice(0, i + 1).join("/");

        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight size={14} className="text-zinc-300" />}
            {isLast ? (
              <span className="text-zinc-900 font-medium">{label}</span>
            ) : (
              <Link href={href} className="text-zinc-400 hover:text-zinc-600 transition-colors">
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </div>
  );
}

export default function TopBar({
  user,
  onMenuClick,
}: {
  user: UserType;
  onMenuClick: () => void;
}) {
  const { UserLogout } = useContext(AuthContext);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-zinc-200">
      <div className="h-1 bg-gradient-to-r from-yellow-400 via-cyan-400 to-yellow-400" />
      <div className="flex items-center justify-between h-12 px-4 lg:px-8">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 transition-colors"
          >
            <Menu size={20} />
          </button>
          <Breadcrumbs />
        </div>

        <button
          onClick={() => UserLogout()}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  );
}
