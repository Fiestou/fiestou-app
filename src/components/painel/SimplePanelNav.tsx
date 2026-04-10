import Link from "next/link";
import { useRouter } from "next/router";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Wallet,
  Store,
  Users,
} from "lucide-react";

const ITEMS = [
  {
    label: "Painel",
    href: "/painel",
    icon: LayoutDashboard,
  },
  {
    label: "Pedidos",
    href: "/painel/pedidos",
    icon: ShoppingBag,
  },
  {
    label: "Produtos",
    href: "/painel/produtos",
    icon: Package,
  },
  {
    label: "Clientes",
    href: "/painel/clientes",
    icon: Users,
  },
  {
    label: "Financeiro",
    href: "/painel/financeiro",
    icon: Wallet,
  },
  {
    label: "Minha Loja",
    href: "/painel/loja",
    icon: Store,
  },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/painel") return pathname === "/painel" || pathname === "/painel/";
  return pathname.startsWith(href);
}

export default function SimplePanelNav() {
  const router = useRouter();
  const pathname = router.pathname;
  const currentItem = ITEMS.find((item) => isActive(pathname, item.href));

  return (
    <section className="mb-4 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Menu</p>
        </div>
        {currentItem && (
          <span className="rounded-full bg-yellow-50 px-3 py-1 text-xs font-medium text-yellow-800">
            {currentItem.label}
          </span>
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-6">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(pathname, item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-h-[84px] flex-col items-center justify-center rounded-xl border px-3 py-3 text-center transition-colors ${
                active
                  ? "border-yellow-300 bg-yellow-50 text-zinc-900"
                  : "border-zinc-200 bg-zinc-50/60 text-zinc-700 hover:border-zinc-300 hover:bg-white"
              }`}
            >
              <Icon size={20} className="mb-2 text-yellow-700" />
              <span className="text-sm font-medium leading-tight">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
