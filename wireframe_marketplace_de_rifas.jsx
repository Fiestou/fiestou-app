import { useEffect, useState } from "react";
import Image from "next/image";

// Nota de correção:
// Em Next.js, arquivos dentro de /public devem ser referenciados por caminho absoluto
// começando com "/" (sem import). O import anterior de "../public/logo rifa.jpg"
// causava erro de build. Agora usamos o caminho "/logo%20rifa.jpg" (com espaço codificado).

export default function RaffleMarketplaceUI() {
  const [winners, setWinners] = useState([
    { id: 1, name: "João M.", prize: "PlayStation 5", when: "ontem 20:14" },
    { id: 2, name: "Maria S.", prize: "Honda Biz 2024", when: "há 2 dias" },
    { id: 3, name: "Pedro R.", prize: "iPhone 14", when: "há 3 dias" },
    { id: 4, name: "Carla P.", prize: "Smart TV 55\"", when: "há 5 dias" },
  ]);

  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setWinners((prev) => {
        const [first, ...rest] = prev;
        return [...rest, first];
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const cards = new Array(8).fill(0).map((_, i) => ({ id: i + 1 }));

  return (
    <div className="min-h-screen bg-[#F9F9F9] text-zinc-800 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3">
            {logoError ? (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-[#1E3A8A]" />
                <span className="text-xl font-bold text-[#1E3A8A]">Sort</span>
              </div>
            ) : (
              <Image
                src="/logo%20rifa.jpg" // arquivo deve estar em /public
                alt="Sort Logo"
                width={40}
                height={40}
                className="rounded"
                onError={() => setLogoError(true)}
                priority
              />
            )}
            {!logoError && <span className="text-xl font-bold text-[#1E3A8A]">Sort</span>}
          </div>
          <div className="relative w-full max-w-md">
            <input
              className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#1E3A8A]"
              placeholder="Busque sua rifa"
            />
          </div>
          <div className="ml-4 flex items-center gap-4 text-[#1E3A8A]">
            <div className="h-6 w-6 rounded bg-[#10B981]" />
            <div className="h-6 w-6 rounded bg-[#10B981]" />
            <div className="h-6 w-6 rounded bg-[#10B981]" />
          </div>
        </div>
      </header>

      {/* Winners ticker */}
      <div className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center gap-3 py-2">
            <span className="inline-flex h-6 items-center justify-center rounded bg-[#1E3A8A] px-2 text-xs font-semibold text-white">
              Últimos ganhadores
            </span>
            <div className="flex flex-1 overflow-hidden">
              <div className="animate-marquee flex min-w-full gap-6 whitespace-nowrap py-1 [animation-duration:18s]">
                {winners.map((w) => (
                  <div key={w.id} className="flex items-center gap-2 text-sm text-zinc-600">
                    <div className="h-5 w-5 rounded-full bg-[#10B981]" />
                    <span className="font-semibold text-[#1E3A8A]">{w.name}</span>
                    <span>ganhou</span>
                    <span className="font-semibold text-[#10B981]">{w.prize}</span>
                    <span className="text-zinc-400">({w.when})</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero banner */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-6 md:grid-cols-3">
          <div className="col-span-2 rounded-2xl border border-zinc-200 bg-gradient-to-r from-[#1E3A8A] to-[#10B981] p-6 text-white">
            <h1 className="mb-2 text-2xl font-bold">Rifa do Jeep Compass 2025 🚙</h1>
            <p className="mb-4 text-sm">Mais de 1.200 pessoas já garantiram sua sorte</p>
            <button className="rounded-xl bg-[#FBBF24] px-6 py-2 font-semibold text-[#1E3A8A] shadow hover:bg-yellow-400">
              Participar agora
            </button>
          </div>
          <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            <h2 className="mb-3 text-lg font-semibold text-[#1E3A8A]">Destaques</h2>
            <div className="space-y-3">
              <div className="h-16 w-full rounded-lg bg-zinc-200" />
              <div className="h-16 w-full rounded-lg bg-zinc-200" />
              <div className="h-16 w-full rounded-lg bg-zinc-200" />
            </div>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="border-b border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-wrap items-center gap-2">
            {["Mais populares", "Últimas adicionadas", "Quase esgotando"].map((f) => (
              <button
                key={f}
                className="rounded-full border border-zinc-300 bg-white px-4 py-1.5 text-sm text-[#1E3A8A] hover:bg-zinc-100"
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Grid de rifas */}
      <main className="mx-auto max-w-7xl px-4 py-6">
        <h2 className="mb-4 text-lg font-semibold text-[#1E3A8A]">Rifas disponíveis</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((c) => (
            <div key={c.id} className="rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">
              <div className="mb-3 aspect-video w-full rounded-xl bg-zinc-100" />
              <h3 className="mb-1 text-base font-semibold text-[#1E3A8A]">Prêmio #{c.id}</h3>
              <p className="mb-2 text-sm text-zinc-600">Cota: R$ 20,00</p>
              <div className="mb-2 h-2 w-full rounded-full bg-zinc-100">
                <div className="h-2 w-2/3 rounded-full bg-[#10B981]" />
              </div>
              <p className="mb-3 text-xs text-zinc-500">75% vendido</p>
              <button className="w-full rounded-xl bg-[#10B981] px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600">
                Participar
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-zinc-500">
          © 2025 Sort – Faça sua sorte | Pagamentos 100% seguros
        </div>
      </footer>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee { animation: marquee linear infinite; }
      `}</style>
    </div>
  );
}

/* --- Guia de Identidade Visual ---
Logo: Sort (trevo verde + ticket azul escuro + estrela amarela)
Cores principais:
- Azul escuro: #1E3A8A
- Verde: #10B981
- Amarelo: #FBBF24
- Fundo: #F9F9F9
Fontes sugeridas: Inter, Poppins ou Montserrat (sans-serif, modernas e legíveis)
*/
