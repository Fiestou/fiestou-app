import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Wallet,
  Store,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  X,
  CreditCard,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const iconSize = 20;

const NAV_GROUPS: NavGroup[] = [
  {
    title: "PRINCIPAL",
    items: [
      {
        label: "Dashboard",
        href: "/painel",
        icon: <LayoutDashboard size={iconSize} />,
      },
      {
        label: "Pedidos",
        href: "/painel/pedidos",
        icon: <ShoppingBag size={iconSize} />,
      },
      {
        label: "Produtos",
        href: "/painel/produtos",
        icon: <Package size={iconSize} />,
      },
    ],
  },
  {
    title: "GESTAO",
    items: [
      {
        label: "Clientes",
        href: "/painel/clientes",
        icon: <Users size={iconSize} />,
      },
      {
        label: "Saques",
        href: "/painel/saques",
        icon: <Wallet size={iconSize} />,
      },
      {
        label: "Dados do Recebedor",
        href: "/painel/dados_do_recebedor",
        icon: <CreditCard size={iconSize} />,
      },
    ],
  },
  {
    title: "CONFIGURACOES",
    items: [
      {
        label: "Minha Loja",
        href: "/painel/loja",
        icon: <Store size={iconSize} />,
      },
      {
        label: "Minha Conta",
        href: "/painel/conta",
        icon: <UserCircle size={iconSize} />,
      },
    ],
  },
];

function isActive(pathname: string, href: string) {
  if (href === "/painel") return pathname === "/painel" || pathname === "/painel/";
  return pathname.startsWith(href);
}

export default function Sidebar({
  collapsed,
  onToggle,
  mobileOpen,
  onMobileClose,
}: {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const router = useRouter();
  const pathname = router.pathname;

  const sidebarContent = (
    <div className="flex flex-col h-full">
      <div className="px-4 py-3 flex items-center justify-between border-b border-zinc-100">
        {!collapsed ? (
          <span className="text-xs font-bold tracking-[0.15em] text-cyan-700 uppercase font-display">
            Painel Lojista
          </span>
        ) : (
          <span className="text-xs font-bold text-cyan-700 mx-auto">PL</span>
        )}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1 rounded-md hover:bg-zinc-100 text-zinc-500"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-6">
            {!collapsed && (
              <div className="px-3 mb-2 text-[11px] font-semibold tracking-wider text-zinc-400">
                {group.title}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onMobileClose}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                      ${active
                        ? "bg-yellow-50 text-yellow-700 shadow-sm"
                        : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                      }
                      ${collapsed ? "justify-center" : ""}
                    `}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className={active ? "text-yellow-600" : "text-zinc-400 group-hover:text-zinc-600"}>
                      {item.icon}
                    </span>
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="hidden lg:block px-3 py-4 border-t border-zinc-100">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm text-zinc-400 hover:bg-zinc-50 hover:text-zinc-600 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Recolher</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden transition-opacity"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`
          fixed top-12 left-0 z-50 bg-white border-r border-zinc-200
          transition-all duration-300 lg:translate-x-0
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          ${collapsed ? "lg:w-[72px]" : "lg:w-[260px]"}
          w-[280px]
        `}
        style={{ height: "calc(100vh - 48px)" }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

export { NAV_GROUPS };
