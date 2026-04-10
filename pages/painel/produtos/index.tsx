import Link from "next/link";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Plus,
  FileUp,
  Pencil,
  Trash2,
  Package,
  SlidersHorizontal,
  Check,
  Clock,
  Tag,
  UtensilsCrossed,
  Briefcase,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Api from "@/src/services/api";
import { ProductType } from "@/src/models/product";
import { getImage, moneyFormat } from "@/src/helper";
import Img from "@/src/components/utils/ImgBase";
import {
  PainelLayout,
  PageHeader,
  DataTable,
  Badge,
  EmptyState,
  SearchInput,
} from "@/src/components/painel";
import type { Column } from "@/src/components/painel";
import Modal from "@/src/components/utils/Modal";
import usePainelPageMode from "@/src/components/painel/usePainelPageMode";

export async function getServerSideProps(ctx: any) {
  const store = ctx.req.cookies["fiestou.store"] ?? 0;
  return {
    props: { store },
  };
}

const STATUS_OPTIONS = [
  {
    label: "Ativos",
    value: "1",
    description: "Produtos visíveis para compra e aluguel",
    tone: "emerald",
  },
  {
    label: "Inativos",
    value: "0",
    description: "Produtos pausados ou fora de vitrine",
    tone: "zinc",
  },
];

const TYPE_OPTIONS = [
  {
    label: "Aluguel",
    value: "aluguel",
    description: "Produto alugado por período",
  },
  {
    label: "Venda",
    value: "venda",
    description: "Produto vendido definitivamente",
  },
  {
    label: "Comestível",
    value: "comestivel",
    description: "Alimentos e bebidas",
  },
  {
    label: "Serviços",
    value: "servicos",
    description: "Prestação de serviço",
  },
];

const STOCK_OPTIONS = [
  {
    label: "Com estoque",
    value: "in_stock",
    description: "Itens prontos para atender o pedido",
    tone: "emerald",
  },
  {
    label: "Sem estoque",
    value: "out_of_stock",
    description: "Itens que precisam de reposição",
    tone: "amber",
  },
];

const STRUCTURE_OPTIONS = [
  {
    label: "Com opções",
    value: "with_variations",
    description: "Produto com adicionais ou variações",
    tone: "yellow",
  },
  {
    label: "Sem opções",
    value: "without_variations",
    description: "Produto simples, sem seleção extra",
    tone: "zinc",
  },
];

const PAGE_SIZE = 15;

const TYPE_META: Record<
  string,
  {
    label: string;
    icon: LucideIcon;
    className: string;
    iconClassName: string;
  }
> = {
  aluguel: {
    label: "Aluguel",
    icon: Clock,
    className: "border-blue-200 bg-blue-50 text-blue-800",
    iconClassName: "bg-blue-100 text-blue-700",
  },
  venda: {
    label: "Venda",
    icon: Tag,
    className: "border-emerald-200 bg-emerald-50 text-emerald-800",
    iconClassName: "bg-emerald-100 text-emerald-700",
  },
  comestivel: {
    label: "Comestível",
    icon: UtensilsCrossed,
    className: "border-amber-200 bg-amber-50 text-amber-800",
    iconClassName: "bg-amber-100 text-amber-700",
  },
  servicos: {
    label: "Serviços",
    icon: Briefcase,
    className: "border-violet-200 bg-violet-50 text-violet-800",
    iconClassName: "bg-violet-100 text-violet-700",
  },
};

function ProductThumb({ row }: { row: ProductType }) {
  const [failed, setFailed] = useState(false);
  const imgUrl = useMemo(
    () => getImage(row.gallery, "sm") || getImage(row.gallery, "thumb") || "",
    [row.gallery]
  );

  return (
    <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden flex items-center justify-center flex-shrink-0">
      {imgUrl && !failed ? (
        <Img
          src={imgUrl}
          alt={row.title || "Imagem do produto"}
          size="xs"
          className="w-full h-full object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <Package size={18} className="text-zinc-300" />
      )}
    </div>
  );
}

type SingleFilterOption = {
  label: string;
  value: string;
  description?: string;
  tone?: "emerald" | "amber" | "yellow" | "zinc";
};

const CARD_TONE_STYLES: Record<
  NonNullable<SingleFilterOption["tone"]>,
  {
    active: string;
    idle: string;
    badge: string;
  }
> = {
  emerald: {
    active: "border-emerald-200 bg-emerald-50 text-emerald-900 shadow-sm",
    idle: "border-zinc-200 bg-white text-zinc-700 hover:border-emerald-200 hover:bg-emerald-50/50",
    badge: "bg-emerald-100 text-emerald-700",
  },
  amber: {
    active: "border-amber-200 bg-amber-50 text-amber-900 shadow-sm",
    idle: "border-zinc-200 bg-white text-zinc-700 hover:border-amber-200 hover:bg-amber-50/50",
    badge: "bg-amber-100 text-amber-700",
  },
  yellow: {
    active: "border-yellow-200 bg-yellow-50 text-yellow-900 shadow-sm",
    idle: "border-zinc-200 bg-white text-zinc-700 hover:border-yellow-200 hover:bg-yellow-50/50",
    badge: "bg-yellow-100 text-yellow-700",
  },
  zinc: {
    active: "border-zinc-300 bg-zinc-100 text-zinc-900 shadow-sm",
    idle: "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50",
    badge: "bg-zinc-100 text-zinc-700",
  },
};

function normalizeCommercialType(value: unknown) {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (["aluguel", "renting", "rent"].includes(normalized)) {
    return "aluguel";
  }

  if (["venda", "selling", "sale"].includes(normalized)) {
    return "venda";
  }

  if (["comestivel", "comestível", "food", "foods"].includes(normalized)) {
    return "comestivel";
  }

  if (["servicos", "serviços", "servico", "serviço", "service", "services"].includes(normalized)) {
    return "servicos";
  }

  return normalized;
}

function parseAttributes(raw: any): any[] {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
}

function hasSelectableVariations(row: ProductType) {
  const attrs = parseAttributes((row as any)?.attributes);
  return attrs.some((attr: any) => Array.isArray(attr?.variations) && attr.variations.length > 0);
}

function SingleSelectCardGrid({
  title,
  description,
  value,
  onChange,
  options,
  counts,
  compact = false,
}: {
  title: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  options: SingleFilterOption[];
  counts: Record<string, number>;
  compact?: boolean;
}) {
  const visibleOptions = options.filter(
    (option) => option.value === value || (counts[option.value] ?? 0) > 0
  );

  if (!visibleOptions.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
      <div className="mb-3">
        <div className="text-sm font-semibold text-zinc-900">{title}</div>
        {!compact && <p className="mt-1 text-xs leading-5 text-zinc-500">{description}</p>}
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {visibleOptions.map((option) => {
          const active = value === option.value;
          const tone = CARD_TONE_STYLES[option.tone ?? "zinc"];

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(active ? "" : option.value)}
              className={`rounded-2xl border px-4 py-3 text-left transition-all ${active ? tone.active : tone.idle}`}
              aria-pressed={active}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-xs font-semibold ${tone.badge}`}
                >
                  {counts[option.value] ?? 0}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-semibold leading-5">{option.label}</div>
                    {active && <Check size={16} className="shrink-0 text-current" />}
                  </div>
                  {option.description && !compact && (
                    <div className={`mt-1 text-xs leading-5 ${active ? "text-current/80" : "text-zinc-500"}`}>
                      {option.description}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function TypeFilterGrid({
  value,
  onChange,
  counts,
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  counts: Record<string, number>;
  compact?: boolean;
}) {
  const visibleTypes = TYPE_OPTIONS.filter(
    (item) => item.value === value || (counts[item.value] ?? 0) > 0
  );

  if (!visibleTypes.length) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-zinc-200 bg-zinc-50/70 p-4">
      <div className="mb-3">
        <div className="text-sm font-semibold text-zinc-900">Tipo comercial</div>
        {!compact && (
          <p className="mt-1 text-xs leading-5 text-zinc-500">
            Separe aluguel, venda, comestível e serviços sem depender da busca.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {visibleTypes.map((item) => {
          const active = value === item.value;
          const meta = TYPE_META[item.value];
          const Icon = meta.icon;

          return (
            <button
              key={item.value}
              type="button"
              onClick={() => onChange(active ? "" : item.value)}
              className={`rounded-2xl border px-3 py-3 text-center transition-all ${
                active
                  ? meta.className
                  : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300 hover:bg-zinc-50"
              }`}
              aria-pressed={active}
            >
              <span
                className={`mx-auto mb-2 inline-flex h-11 w-11 items-center justify-center rounded-2xl ring-1 shadow-sm ${
                  active ? meta.iconClassName : "bg-zinc-100 text-zinc-600 ring-zinc-200"
                }`}
              >
                <Icon size={20} strokeWidth={2.2} />
              </span>
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-sm font-semibold leading-tight">{item.label}</span>
                {active && <Check size={14} className="text-current" />}
              </div>
              <div className={`mt-1 text-[11px] leading-4 ${active ? "text-current/80" : "text-zinc-500"}`}>
                {!compact ? item.description : null}
              </div>
              <div className="mt-2 text-[11px] font-semibold text-current/80">
                {counts[item.value] ?? 0} produto{(counts[item.value] ?? 0) === 1 ? "" : "s"}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function ProductsFilterModal({
  open,
  onClose,
  count,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  stockFilter,
  onStockFilterChange,
  variationFilter,
  onVariationFilterChange,
  onClear,
  counts,
  compact = false,
}: {
  open: boolean;
  onClose: () => void;
  count: number;
  statusFilter: string;
  onStatusFilterChange: (value: string) => void;
  typeFilter: string;
  onTypeFilterChange: (value: string) => void;
  stockFilter: string;
  onStockFilterChange: (value: string) => void;
  variationFilter: string;
  onVariationFilterChange: (value: string) => void;
  onClear: () => void;
  counts: {
    status: Record<string, number>;
    type: Record<string, number>;
    stock: Record<string, number>;
    structure: Record<string, number>;
  };
  compact?: boolean;
}) {
  return (
    <Modal
      title={compact ? "Filtros" : "Filtrar catálogo"}
      status={open}
      close={onClose}
      size="xl"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={onClear}
            className="rounded-xl border border-zinc-200 px-4 py-3 text-sm font-semibold text-zinc-600 transition-colors hover:bg-zinc-50"
          >
            Limpar filtros
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-yellow-400 px-4 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:bg-yellow-500"
          >
            Ver {count} produto{count === 1 ? "" : "s"}
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        {!compact && (
          <div className="rounded-2xl border border-yellow-100 bg-yellow-50 px-4 py-3 text-sm text-zinc-700">
            Ajuste os filtros do seu catálogo e feche quando encontrar o recorte certo.
          </div>
        )}

        <SingleSelectCardGrid
          title="Status"
          description="Veja rápido o que está ativo na vitrine e o que ficou pausado."
          value={statusFilter}
          onChange={onStatusFilterChange}
          options={STATUS_OPTIONS}
          counts={counts.status}
          compact={compact}
        />

        <TypeFilterGrid
          value={typeFilter}
          onChange={onTypeFilterChange}
          counts={counts.type}
          compact={compact}
        />

        <SingleSelectCardGrid
          title="Estoque"
          description="Separe produtos prontos para venda dos que precisam de reposição."
          value={stockFilter}
          onChange={onStockFilterChange}
          options={STOCK_OPTIONS}
          counts={counts.stock}
          compact={compact}
        />

        <SingleSelectCardGrid
          title="Estrutura"
          description="Ache produtos simples ou itens com adicionais, tamanhos e escolhas extras."
          value={variationFilter}
          onChange={onVariationFilterChange}
          options={STRUCTURE_OPTIONS}
          counts={counts.structure}
          compact={compact}
        />
      </div>
    </Modal>
  );
}

export default function Produtos({ store }: { store: any }) {
  const api = useMemo(() => new Api(), []);
  const panelMode = usePainelPageMode();

  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [variationFilter, setVariationFilter] = useState("");
  const [selectedRows, setSelectedRows] = useState<Set<string | number>>(new Set());
  const [bulkLoading, setBulkLoading] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("page", "1");
      params.set("limit", "200");

      const res: any = await api.bridge({
        method: "get",
        url: "stores/products?" + params.toString(),
      });

      const raw = res?.data ?? res ?? {};
      const items: ProductType[] = raw.items ?? raw.data ?? (Array.isArray(raw) ? raw : []);
      setProducts(items);
    } catch (err) {
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [api, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const filteredProducts = products.filter((p) => {
    if (statusFilter && String(p.status) !== statusFilter) return false;
    if (typeFilter && normalizeCommercialType(p.comercialType) !== typeFilter) return false;
    if (stockFilter === "in_stock" && Number(p.quantity ?? 0) <= 0) return false;
    if (stockFilter === "out_of_stock" && Number(p.quantity ?? 0) > 0) return false;
    if (variationFilter === "with_variations" && !hasSelectableVariations(p)) return false;
    if (variationFilter === "without_variations" && hasSelectableVariations(p)) return false;
    return true;
  });

  const activeProductsCount = useMemo(
    () => products.filter((product) => Number(product.status) === 1).length,
    [products]
  );

  const outOfStockCount = useMemo(
    () => products.filter((product) => Number(product.quantity ?? 0) <= 0).length,
    [products]
  );

  const inactiveProductsCount = useMemo(
    () => products.filter((product) => Number(product.status) !== 1).length,
    [products]
  );

  const withVariationsCount = useMemo(
    () => products.filter((product) => hasSelectableVariations(product)).length,
    [products]
  );

  const withoutVariationsCount = useMemo(
    () => products.filter((product) => !hasSelectableVariations(product)).length,
    [products]
  );

  const typeCounts = useMemo(() => {
    return products.reduce<Record<string, number>>((acc, product) => {
      const typeKey = normalizeCommercialType(product.comercialType);
      if (typeKey) {
        acc[typeKey] = (acc[typeKey] ?? 0) + 1;
      }
      return acc;
    }, {});
  }, [products]);

  const activeStructuredFiltersCount = useMemo(
    () => [statusFilter, typeFilter, stockFilter, variationFilter].filter(Boolean).length,
    [statusFilter, typeFilter, stockFilter, variationFilter]
  );

  const hasActiveFilters = Boolean(
    search || statusFilter || typeFilter || stockFilter || variationFilter
  );

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("");
    setTypeFilter("");
    setStockFilter("");
    setVariationFilter("");
  };

  const clearStructuredFilters = () => {
    setStatusFilter("");
    setTypeFilter("");
    setStockFilter("");
    setVariationFilter("");
  };

  const activeFilterChips = useMemo(
    () =>
      [
        search
          ? {
              key: "search",
              label: `Busca: ${search}`,
              clear: () => setSearch(""),
            }
          : null,
        statusFilter
          ? {
              key: "status",
              label: `Status: ${
                STATUS_OPTIONS.find((item) => item.value === statusFilter)?.label ?? statusFilter
              }`,
              clear: () => setStatusFilter(""),
            }
          : null,
        typeFilter
          ? {
              key: "type",
              label: `Tipo: ${
                TYPE_OPTIONS.find((item) => item.value === typeFilter)?.label ?? typeFilter
              }`,
              clear: () => setTypeFilter(""),
            }
          : null,
        stockFilter
          ? {
              key: "stock",
              label: `Estoque: ${
                STOCK_OPTIONS.find((item) => item.value === stockFilter)?.label ?? stockFilter
              }`,
              clear: () => setStockFilter(""),
            }
          : null,
        variationFilter
          ? {
              key: "structure",
              label: `Estrutura: ${
                STRUCTURE_OPTIONS.find((item) => item.value === variationFilter)?.label ??
                variationFilter
              }`,
              clear: () => setVariationFilter(""),
            }
          : null,
      ].filter(Boolean) as Array<{ key: string; label: string; clear: () => void }>,
    [search, statusFilter, typeFilter, stockFilter, variationFilter]
  );

  const removeProduct = async (item: ProductType) => {
    if (!confirm(`Remover "${item.title}"?`)) return;

    try {
      const req: any = await api.bridge({
        method: "post",
        url: "products/remove",
        data: { id: item.id },
      });

      if (req?.response) {
        const removedId = req.data ?? item.id;
        setProducts((prev) => prev.filter((p) => p.id !== removedId));
        setSelectedRows((prev) => {
          const next = new Set(prev);
          next.delete(item.id);
          return next;
        });
      }
    } catch {}
  };

  const bulkAction = async (action: "activate" | "deactivate" | "delete") => {
    if (selectedRows.size === 0) return;
    setBulkLoading(true);

    const ids = Array.from(selectedRows);
    try {
      if (action === "delete") {
        for (const id of ids) {
          await api.bridge({
            method: "post",
            url: "products/remove",
            data: { id },
          });
        }
        setProducts((prev) => prev.filter((p) => !selectedRows.has(p.id)));
      }
      // TODO: implementar ativar/desativar em massa quando API suportar
      setSelectedRows(new Set());
    } catch {} finally {
      setBulkLoading(false);
    }
  };

  const formatPrice = (price: number, priceSale?: number) => {
    const hasDiscount = priceSale != null && priceSale > 0 && priceSale < price;
    return (
      <div className="flex flex-col">
        {hasDiscount && (
          <span className="text-xs text-zinc-400 line-through">
            R$ {moneyFormat(price)}
          </span>
        )}
        <span className="font-medium text-zinc-900">
          R$ {moneyFormat(hasDiscount ? priceSale : price)}
        </span>
      </div>
    );
  };

  const columns: Column<ProductType>[] = [
    {
      key: "gallery",
      label: "Imagem",
      className: "w-16",
      render: (row) => <ProductThumb row={row} />,
    },
    {
      key: "title",
      label: "Nome",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-zinc-900 truncate max-w-[220px] text-base">{row.title}</p>
          {row.subtitle && (
            <p className="text-sm text-zinc-500 truncate max-w-[220px]">{row.subtitle}</p>
          )}
        </div>
      ),
    },
    {
      key: "variations",
      label: "Variações",
      className: "w-44",
      render: (row) => {
        const hasVariations = hasSelectableVariations(row);
        return (
          <Link
            href={`/painel/produtos/${row.id}#variacoes-section`}
            className={`inline-flex items-center gap-2 text-sm font-semibold px-2.5 py-1.5 rounded-lg border transition-colors ${
              hasVariations
                ? "bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100"
                : "bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100"
            }`}
            title={
              hasVariations
                ? "Editar variações deste produto"
                : "Produto sem variações cadastradas"
            }
          >
            <SlidersHorizontal size={15} />
            {hasVariations ? "Editável" : "Sem opções"}
          </Link>
        );
      },
    },
    {
      key: "price",
      label: "Preço",
      sortable: true,
      render: (row) => formatPrice(row.price, row.priceSale),
    },
    {
      key: "quantity",
      label: "Estoque",
      sortable: true,
      className: "w-24",
      render: (row) => (
        <span className={`text-base font-semibold ${row.quantity ? "text-zinc-700" : "text-red-500"}`}>
          {row.quantity ?? 0}
        </span>
      ),
    },
    {
      key: "comercialType",
      label: "Tipo",
      className: "w-28",
      render: (row) => {
        if (!row.comercialType) return <span className="text-zinc-300">-</span>;
        const typeKey = normalizeCommercialType(row.comercialType);
        const meta = TYPE_META[typeKey];

        if (!meta) {
          return <Badge variant="neutral">{row.comercialType}</Badge>;
        }

        const Icon = meta.icon;
        return (
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-semibold ${meta.className}`}
          >
            <span
              className={`inline-flex h-4 w-4 items-center justify-center rounded-full ${meta.iconClassName}`}
            >
              <Icon size={10} />
            </span>
            {meta.label}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      className: "w-28",
      render: (row) => (
        <Badge variant={Number(row.status) === 1 ? "success" : "danger"} dot>
          {Number(row.status) === 1 ? "Ativo" : "Inativo"}
        </Badge>
      ),
    },
    {
      key: "actions",
      label: "Ações",
      className: "w-28",
      render: (row) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/painel/produtos/${row.id}`}
            className="p-2 rounded-lg hover:bg-yellow-50 text-yellow-700 hover:text-yellow-800 transition-colors border border-transparent hover:border-yellow-200"
          >
            <Pencil size={15} />
          </Link>
          <button
            onClick={() => removeProduct(row)}
            className="p-2 rounded-lg hover:bg-red-50 text-zinc-500 hover:text-red-600 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  const headerActions = (
    <>
      <Link
        href="/painel/produtos/importar"
        className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg px-4 py-3 text-base font-semibold transition-colors flex items-center gap-2"
      >
        <FileUp size={16} />
        Importar
      </Link>
      <Link
        href="/painel/produtos/novo"
        className="bg-yellow-400 hover:bg-yellow-500 text-zinc-900 rounded-lg px-4 py-3 text-base font-semibold transition-colors flex items-center gap-2"
      >
        <Plus size={16} />
        Novo Produto
      </Link>
    </>
  );

  const selectionBanner =
    selectedRows.size > 0 ? (
      <div className="flex flex-wrap items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4">
        <span className="text-base font-semibold text-zinc-700">
          {selectedRows.size} selecionado{selectedRows.size > 1 ? "s" : ""}
        </span>
        <div className="h-4 w-px bg-zinc-300" />
        <button
          onClick={() => bulkAction("activate")}
          disabled={bulkLoading}
          className="text-base text-emerald-700 hover:text-emerald-800 font-semibold disabled:opacity-50"
        >
          Ativar
        </button>
        <button
          onClick={() => bulkAction("deactivate")}
          disabled={bulkLoading}
          className="text-base text-amber-700 hover:text-amber-800 font-semibold disabled:opacity-50"
        >
          Desativar
        </button>
        <button
          onClick={() => bulkAction("delete")}
          disabled={bulkLoading}
          className="text-base text-red-600 hover:text-red-700 font-semibold disabled:opacity-50"
        >
          Excluir
        </button>
      </div>
    ) : null;

  const productsTableContent =
    !loading && filteredProducts.length === 0 ? (
      <div className="bg-white rounded-xl border border-zinc-200">
        <EmptyState
          icon={<Package size={32} />}
          title="Nenhum produto encontrado"
          description={
            search || statusFilter || typeFilter || stockFilter || variationFilter
              ? "Tente ajustar os filtros ou a busca"
              : "Adicione seu primeiro produto para comecar"
          }
          action={
            !search && !statusFilter && !typeFilter && !stockFilter && !variationFilter ? (
              <Link
                href="/painel/produtos/novo"
                className="bg-yellow-400 hover:bg-yellow-500 text-zinc-900 rounded-lg px-4 py-2 text-sm font-medium transition-colors inline-flex items-center gap-2"
              >
                <Plus size={16} />
                Novo Produto
              </Link>
            ) : undefined
          }
        />
      </div>
    ) : (
      <DataTable
        columns={columns}
        data={filteredProducts}
        keyField="id"
        selectable
        selectedRows={selectedRows}
        onSelectionChange={setSelectedRows}
        pageSize={PAGE_SIZE}
        loading={loading}
        emptyMessage="Nenhum produto encontrado"
      />
    );

  if (panelMode === "simple") {
    return (
      <PainelLayout>
        <PageHeader
          title="Produtos"
          description="Cuide do catálogo."
          actions={headerActions}
        />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
              Ativos
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{activeProductsCount}</div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50/70 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-amber-700">
              Sem estoque
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{outOfStockCount}</div>
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">
              Inativos
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{inactiveProductsCount}</div>
          </div>
          <div className="rounded-xl border border-yellow-200 bg-yellow-50/70 p-4">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-yellow-700">
              Com opções
            </div>
            <div className="mt-2 text-2xl font-bold text-zinc-900">{withVariationsCount}</div>
          </div>
        </div>

        <div className="mt-6">
          <section className="rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-zinc-900">Atalhos</h2>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                  setTypeFilter("");
                  setStockFilter("out_of_stock");
                  setVariationFilter("");
                }}
                className="flex w-full items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 text-left transition-colors hover:border-amber-300"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900">Sem estoque</p>
                </div>
                <span className="text-lg font-bold text-zinc-900">{outOfStockCount}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("0");
                  setTypeFilter("");
                  setStockFilter("");
                  setVariationFilter("");
                }}
                className="flex w-full items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 text-left transition-colors hover:border-zinc-300"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900">Inativos</p>
                </div>
                <span className="text-lg font-bold text-zinc-900">{inactiveProductsCount}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatusFilter("");
                  setTypeFilter("");
                  setStockFilter("");
                  setVariationFilter("with_variations");
                }}
                className="flex w-full items-center justify-between rounded-lg border border-zinc-200 px-4 py-3 text-left transition-colors hover:border-yellow-300"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-900">Com opções</p>
                </div>
                <span className="text-lg font-bold text-zinc-900">{withVariationsCount}</span>
              </button>
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-xl border border-zinc-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-lg font-bold text-zinc-900">Produtos</h2>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50"
              >
                Limpar tudo
              </button>
            )}
          </div>

          <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setStatusFilter((prev) => (prev === "1" ? "" : "1"))}
              className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                statusFilter === "1"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                  : "border-zinc-200 bg-white text-zinc-600"
              }`}
            >
              Ativos · {activeProductsCount}
            </button>
            <button
              type="button"
              onClick={() =>
                setStockFilter((prev) => (prev === "out_of_stock" ? "" : "out_of_stock"))
              }
              className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                stockFilter === "out_of_stock"
                  ? "border-amber-200 bg-amber-50 text-amber-800"
                  : "border-zinc-200 bg-white text-zinc-600"
              }`}
            >
              Sem estoque · {outOfStockCount}
            </button>
            <button
              type="button"
              onClick={() =>
                setVariationFilter((prev) =>
                  prev === "with_variations" ? "" : "with_variations"
                )
              }
              className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                variationFilter === "with_variations"
                  ? "border-yellow-200 bg-yellow-50 text-yellow-800"
                  : "border-zinc-200 bg-white text-zinc-600"
              }`}
            >
              Com opções · {withVariationsCount}
            </button>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput
              placeholder="Buscar produtos..."
              value={search}
              onChange={setSearch}
              className="w-full sm:max-w-sm"
            />
            <button
              type="button"
              onClick={() => setFiltersOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
            >
              <SlidersHorizontal size={16} className="text-yellow-700" />
              Filtros
              {activeStructuredFiltersCount > 0 && (
                <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-yellow-100 px-2 text-xs font-bold text-yellow-800">
                  {activeStructuredFiltersCount}
                </span>
              )}
            </button>
          </div>

          {activeFilterChips.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {activeFilterChips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={chip.clear}
                  className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50"
                >
                  <span>{chip.label}</span>
                  <span className="text-zinc-400">×</span>
                </button>
              ))}
            </div>
          )}

          <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-xs text-zinc-600">
            Mostrando <strong className="text-zinc-900">{filteredProducts.length}</strong> de{" "}
            <strong className="text-zinc-900">{products.length}</strong> produtos.
          </div>

          <div className="mt-4">
            {selectionBanner}
            {productsTableContent}
          </div>
        </section>

        <ProductsFilterModal
          open={filtersOpen}
          onClose={() => setFiltersOpen(false)}
          count={filteredProducts.length}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
          typeFilter={typeFilter}
          onTypeFilterChange={setTypeFilter}
          stockFilter={stockFilter}
          onStockFilterChange={setStockFilter}
          variationFilter={variationFilter}
          onVariationFilterChange={setVariationFilter}
          onClear={clearStructuredFilters}
          counts={{
            status: {
              "1": activeProductsCount,
              "0": inactiveProductsCount,
            },
            type: typeCounts,
            stock: {
              in_stock: products.length - outOfStockCount,
              out_of_stock: outOfStockCount,
            },
            structure: {
              with_variations: withVariationsCount,
              without_variations: withoutVariationsCount,
            },
          }}
          compact
        />
      </PainelLayout>
    );
  }

  return (
    <PainelLayout>
      <PageHeader
        title="Produtos"
        description="Gerencie seu catálogo de produtos"
        actions={headerActions}
      />

      <div className="bg-white p-4 rounded-xl border border-zinc-200 mb-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-sm font-semibold text-zinc-900">Filtrar catálogo</div>
            <p className="mt-1 text-xs leading-5 text-zinc-500">
              Busque por nome e abra os filtros para recortar o catálogo sem depender de vários dropdowns.
            </p>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="shrink-0 rounded-lg border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50"
            >
              Limpar
            </button>
          )}
        </div>

        <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => setStatusFilter((prev) => (prev === "1" ? "" : "1"))}
            className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
              statusFilter === "1"
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-zinc-200 bg-white text-zinc-600"
            }`}
          >
            Ativos · {activeProductsCount}
          </button>
          <button
            type="button"
            onClick={() =>
              setStockFilter((prev) => (prev === "out_of_stock" ? "" : "out_of_stock"))
            }
            className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
              stockFilter === "out_of_stock"
                ? "border-amber-200 bg-amber-50 text-amber-800"
                : "border-zinc-200 bg-white text-zinc-600"
            }`}
          >
            Sem estoque · {outOfStockCount}
          </button>
          <button
            type="button"
            onClick={() =>
              setVariationFilter((prev) =>
                prev === "with_variations" ? "" : "with_variations"
              )
            }
            className={`shrink-0 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
              variationFilter === "with_variations"
                ? "border-yellow-200 bg-yellow-50 text-yellow-800"
                : "border-zinc-200 bg-white text-zinc-600"
            }`}
          >
            Com opções · {withVariationsCount}
          </button>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput
            placeholder="Buscar produtos..."
            value={search}
            onChange={setSearch}
            className="w-full sm:max-w-sm"
          />
          <button
            type="button"
            onClick={() => setFiltersOpen(true)}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-200 bg-white px-4 py-3 text-sm font-semibold text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            <SlidersHorizontal size={16} className="text-yellow-700" />
            Ajustar filtros
            {activeStructuredFiltersCount > 0 && (
              <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-yellow-100 px-2 text-xs font-bold text-yellow-800">
                {activeStructuredFiltersCount}
              </span>
            )}
          </button>
        </div>

        {activeFilterChips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilterChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.clear}
                className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-xs font-semibold text-zinc-600 transition-colors hover:bg-zinc-50"
              >
                <span>{chip.label}</span>
                <span className="text-zinc-400">×</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-3 rounded-xl border border-zinc-200 bg-zinc-50/80 px-3 py-2.5 text-xs text-zinc-600">
          Mostrando <strong className="text-zinc-900">{filteredProducts.length}</strong> de{" "}
          <strong className="text-zinc-900">{products.length}</strong> produtos.
        </div>
      </div>

      <ProductsFilterModal
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        count={filteredProducts.length}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        typeFilter={typeFilter}
        onTypeFilterChange={setTypeFilter}
        stockFilter={stockFilter}
        onStockFilterChange={setStockFilter}
        variationFilter={variationFilter}
        onVariationFilterChange={setVariationFilter}
        onClear={clearStructuredFilters}
        counts={{
          status: {
            "1": activeProductsCount,
            "0": inactiveProductsCount,
          },
          type: typeCounts,
          stock: {
            in_stock: products.length - outOfStockCount,
            out_of_stock: outOfStockCount,
          },
          structure: {
            with_variations: withVariationsCount,
            without_variations: withoutVariationsCount,
          },
        }}
      />

      {selectionBanner}
      {productsTableContent}
    </PainelLayout>
  );
}
