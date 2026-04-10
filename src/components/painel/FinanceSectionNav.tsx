import Link from "next/link";
import { useRouter } from "next/router";
import { Landmark, ShieldCheck, Wallet, LucideIcon } from "lucide-react";

type FinanceNavItem = {
  label: string;
  shortLabel: string;
  href: string;
  description: string;
  icon: LucideIcon;
};

const ITEMS: FinanceNavItem[] = [
  {
    label: "Financeiro",
    shortLabel: "Visão geral",
    href: "/painel/financeiro",
    description: "Saldo, recebimentos e antecipações",
    icon: Wallet,
  },
  {
    label: "Cadastro financeiro",
    shortLabel: "Cadastro",
    href: "/painel/dados_do_recebedor",
    description: "Titular, documento e endereço",
    icon: ShieldCheck,
  },
  {
    label: "Conta bancária",
    shortLabel: "Conta bancária",
    href: "/painel/conta",
    description: "Conta onde sua loja recebe",
    icon: Landmark,
  },
];

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function FinanceSectionNav() {
  const router = useRouter();
  const pathname = router.asPath.split("#")[0]?.split("?")[0] || "/";

  return (
    <section className="mb-5 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-zinc-500">
            Área Financeira
          </h2>
          <p className="mt-1 text-sm leading-relaxed text-zinc-600">
            Acompanhe o cadastro financeiro, os recebimentos e a conta bancária da loja.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-2xl border p-3 text-center transition-all ${
                active
                  ? "border-yellow-300 bg-yellow-50 text-zinc-900 shadow-sm"
                  : "border-zinc-200 bg-zinc-50/70 text-zinc-700 hover:border-zinc-300 hover:bg-white"
              }`}
            >
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
                <Icon
                  size={20}
                  className={active ? "text-yellow-600" : "text-zinc-600"}
                />
              </div>
              <div className="mt-2 text-sm font-semibold leading-tight">
                <span className="sm:hidden">{item.shortLabel}</span>
                <span className="hidden sm:inline">{item.label}</span>
              </div>
              <p className="mt-1 hidden text-[11px] leading-4 text-zinc-500 sm:block">
                {item.description}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
