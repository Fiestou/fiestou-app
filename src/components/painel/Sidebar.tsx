import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  Wallet,
  Store,
  ChevronLeft,
  ChevronRight,
  X,
  FileText,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  children?: Array<{
    label: string;
    href: string;
  }>;
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
        label: "Painel de vendas",
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
    title: "GESTÃO",
    items: [
      {
        label: "Clientes",
        href: "/painel/clientes",
        icon: <Users size={iconSize} />,
      },
      {
        label: "Financeiro",
        href: "/painel/financeiro",
        icon: <Wallet size={iconSize} />,
        children: [
          {
            label: "Visão geral",
            href: "/painel/financeiro",
          },
          {
            label: "Cadastro financeiro",
            href: "/painel/dados_do_recebedor",
          },
          {
            label: "Conta bancária",
            href: "/painel/conta",
          },
        ],
      },
      {
        label: "Fiscal",
        href: "/painel/fiscal",
        icon: <FileText size={iconSize} />,
      },
    ],
  },
  {
    title: "CONFIGURAÇÕES",
    items: [
      {
        label: "Minha Loja",
        href: "/painel/loja",
        icon: <Store size={iconSize} />,
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
          <span className="text-sm font-bold tracking-[0.1em] text-yellow-700 uppercase font-display">
            Painel Lojista
          </span>
        ) : (
          <span className="text-sm font-bold text-yellow-700 mx-auto">PL</span>
        )}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1.5 rounded-md hover:bg-zinc-100 text-yellow-700"
        >
          <X size={20} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.title} className="mb-6">
            {!collapsed && (
              <div className="px-3 mb-2 text-xs font-semibold tracking-wider text-zinc-600">
                {group.title}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(pathname, item.href);
                const showChildren = !collapsed && Array.isArray(item.children) && item.children.length > 0;
                return (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      onClick={onMobileClose}
                      className={`group flex items-center gap-3 px-3 py-3 rounded-lg text-base font-medium transition-all duration-200
                        ${active
                          ? "bg-yellow-50 text-yellow-800 shadow-sm border border-yellow-200"
                          : "text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 border border-transparent"
                        }
                        ${collapsed ? "justify-center" : ""}
                      `}
                      title={collapsed ? item.label : undefined}
                    >
                      <span className={active ? "text-yellow-600" : "text-yellow-600 group-hover:text-yellow-700"}>
                        {item.icon}
                      </span>
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </Link>

                    {showChildren && (
                      <div className="mt-1 ml-4 space-y-1 border-l border-zinc-200 pl-3">
                        {item.children!.map((child) => {
                          const childActive = isActive(pathname, child.href);
                          return (
                            <Link
                              key={child.href}
                              href={child.href}
                              onClick={onMobileClose}
                              className={`flex items-center rounded-lg px-3 py-2 text-sm transition-colors ${
                                childActive
                                  ? "bg-zinc-900 text-white"
                                  : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                              }`}
                            >
                              <span className="truncate">{child.label}</span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="hidden lg:block px-3 py-4 border-t border-zinc-100">
        <button
          onClick={onToggle}
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-base text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors border border-zinc-200"
        >
          {collapsed ? <ChevronRight size={18} className="text-yellow-700" /> : <ChevronLeft size={18} className="text-yellow-700" />}
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
          w-[88vw] max-w-[320px]
        `}
        style={{
          height: "calc(100dvh - 48px)",
          maxHeight: "calc(100dvh - 48px)",
        }}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

export { NAV_GROUPS };
