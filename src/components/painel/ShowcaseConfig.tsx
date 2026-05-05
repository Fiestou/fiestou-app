import { useState, useEffect, useMemo, useRef } from "react";
import { Shuffle, Hand, TrendingUp, Search, X, GripVertical } from "lucide-react";
import Img from "@/src/components/utils/ImgBase";
import { getImage, moneyFormat } from "@/src/helper";
import Api from "@/src/services/api";

interface ShowcaseConfigProps {
  storeId: number;
  mode: string;
  selectedIds: number[];
  onUpdate: (mode: string, ids: number[]) => void;
}

const MODES = [
  { id: "random", label: "Aleatório", desc: "3 produtos diferentes a cada visita", icon: Shuffle, color: "cyan" },
  { id: "manual", label: "Escolher", desc: "Você decide quais produtos exibir", icon: Hand, color: "violet" },
  { id: "best_sellers", label: "Mais Vendidos", desc: "Os mais pedidos da sua loja", icon: TrendingUp, color: "emerald" },
];

export default function ShowcaseConfig({ storeId, mode, selectedIds, onUpdate }: ShowcaseConfigProps) {
  const [activeMode, setActiveMode] = useState(mode || "random");
  const [pickedIds, setPickedIds] = useState<number[]>(selectedIds || []);
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const api = useMemo(() => new Api(), []);
  const loaded = useRef(false);

  // Busca todos os produtos da loja pro selector
  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    setLoading(true);

    api.bridge({ method: "get", url: "stores/products" })
      .then((res: any) => {
        const list = res?.data?.products || res?.data || res?.products || [];
        setProducts(Array.isArray(list) ? list : []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleModeChange = (newMode: string) => {
    setActiveMode(newMode);
    onUpdate(newMode, pickedIds);
  };

  const toggleProduct = (id: number) => {
    let next: number[];
    if (pickedIds.includes(id)) {
      next = pickedIds.filter(p => p !== id);
    } else if (pickedIds.length < 3) {
      next = [...pickedIds, id];
    } else {
      return;
    }
    setPickedIds(next);
    onUpdate(activeMode, next);
  };

  const removeProduct = (id: number) => {
    const next = pickedIds.filter(p => p !== id);
    setPickedIds(next);
    onUpdate(activeMode, next);
  };

  const filtered = useMemo(() => {
    if (!search.trim()) return products;
    const q = search.toLowerCase();
    return products.filter((p: any) =>
      (p?.title || p?.name || "").toLowerCase().includes(q)
    );
  }, [products, search]);

  const pickedProducts = useMemo(
    () => pickedIds.map(id => products.find((p: any) => Number(p.id) === id)).filter(Boolean),
    [pickedIds, products]
  );

  const colorMap: Record<string, string> = {
    cyan: "border-cyan-400 bg-cyan-50 text-cyan-700",
    violet: "border-violet-400 bg-violet-50 text-violet-700",
    emerald: "border-emerald-400 bg-emerald-50 text-emerald-700",
  };

  const inactiveClass = "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50";

  return (
    <div className="space-y-4">
      {/* Mode selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {MODES.map(m => {
          const active = activeMode === m.id;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => handleModeChange(m.id)}
              className={`relative p-4 rounded-xl border-2 transition-all text-left ${
                active ? colorMap[m.color] : inactiveClass
              }`}
            >
              {active && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-current flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <m.icon size={20} className="mb-2" />
              <div className="text-sm font-semibold">{m.label}</div>
              <div className={`text-[11px] mt-0.5 ${active ? "opacity-80" : "text-zinc-400"}`}>{m.desc}</div>
            </button>
          );
        })}
      </div>

      {/* Manual selector */}
      {activeMode === "manual" && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-zinc-700">
              Produtos selecionados ({pickedIds.length}/3)
            </span>
            {pickedIds.length >= 3 && (
              <span className="text-[10px] text-emerald-600 font-medium bg-emerald-50 px-2 py-0.5 rounded-full">
                Completo
              </span>
            )}
          </div>

          {/* Selected products */}
          {pickedProducts.length > 0 && (
            <div className="flex gap-2 flex-wrap">
              {pickedProducts.map((prod: any) => {
                const img = getImage(prod?.gallery?.[0], "thumb");
                return (
                  <div key={prod.id} className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1.5 pr-1">
                    <div className="w-8 h-8 rounded bg-zinc-200 overflow-hidden flex-shrink-0">
                      {img && <Img src={img} className="w-full h-full object-cover" />}
                    </div>
                    <span className="text-xs text-zinc-700 font-medium max-w-[120px] truncate">
                      {prod.title || prod.name}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeProduct(Number(prod.id))}
                      className="w-5 h-5 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Search */}
          {pickedIds.length < 3 && (
            <>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Buscar produto..."
                  className="w-full pl-8 pr-3 py-2 text-xs border border-zinc-200 rounded-lg bg-zinc-50 focus:outline-none focus:ring-1 focus:ring-violet-300"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1">
                {loading && (
                  <div className="text-center py-4">
                    <div className="animate-spin w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full mx-auto" />
                  </div>
                )}
                {!loading && filtered.slice(0, 20).map((prod: any) => {
                  const id = Number(prod.id);
                  const picked = pickedIds.includes(id);
                  const img = getImage(prod?.gallery?.[0], "thumb");
                  const price = prod?.priceSale || prod?.price;
                  return (
                    <button
                      key={id}
                      type="button"
                      disabled={picked}
                      onClick={() => toggleProduct(id)}
                      className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-colors ${
                        picked ? "bg-violet-50 border border-violet-200 opacity-60" : "hover:bg-zinc-50 border border-transparent"
                      }`}
                    >
                      <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden flex-shrink-0">
                        {img && <Img src={img} className="w-full h-full object-cover" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-zinc-700 truncate">{prod.title || prod.name}</div>
                        {price > 0 && (
                          <div className="text-[10px] text-zinc-400">{moneyFormat(price)}</div>
                        )}
                      </div>
                      {picked && <span className="text-[10px] text-violet-500 font-medium">Selecionado</span>}
                    </button>
                  );
                })}
                {!loading && filtered.length === 0 && (
                  <p className="text-xs text-zinc-400 text-center py-3">Nenhum produto encontrado.</p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Info for best sellers */}
      {activeMode === "best_sellers" && (
        <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3">
          <p className="text-xs text-emerald-700 leading-relaxed">
            Seus 3 produtos com mais pedidos finalizados aparecem automaticamente.
            Enquanto não houver vendas suficientes, exibimos produtos aleatórios.
          </p>
        </div>
      )}

      {activeMode === "random" && (
        <div className="rounded-xl border border-cyan-100 bg-cyan-50 px-4 py-3">
          <p className="text-xs text-cyan-700 leading-relaxed">
            A cada visita do cliente, 3 produtos diferentes da sua loja serão exibidos.
            Ótimo para dar visibilidade a todo o seu catálogo.
          </p>
        </div>
      )}
    </div>
  );
}
