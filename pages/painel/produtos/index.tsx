import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { Plus, FileUp, Pencil, Trash2, Package, SlidersHorizontal } from "lucide-react";
import Api from "@/src/services/api";
import { ProductType } from "@/src/models/product";
import { moneyFormat } from "@/src/helper";
import Img from "@/src/components/utils/ImgBase";
import {
  PainelLayout,
  PageHeader,
  DataTable,
  Badge,
  EmptyState,
  SearchInput,
  FilterDropdown,
} from "@/src/components/painel";
import type { Column } from "@/src/components/painel";

export async function getServerSideProps(ctx: any) {
  const store = ctx.req.cookies["fiestou.store"] ?? 0;
  return {
    props: { store },
  };
}

const STATUS_OPTIONS = [
  { label: "Ativos", value: "1" },
  { label: "Inativos", value: "0" },
];

const TYPE_OPTIONS = [
  { label: "Aluguel", value: "aluguel" },
  { label: "Venda", value: "venda" },
  { label: "Comestível", value: "comestivel" },
  { label: "Serviços", value: "servicos" },
];

const PAGE_SIZE = 15;

export default function Produtos({ store }: { store: any }) {
  const api = new Api();

  const [products, setProducts] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
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
  }, [search]);

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const filteredProducts = products.filter((p) => {
    if (statusFilter && String(p.status) !== statusFilter) return false;
    if (typeFilter && p.comercialType !== typeFilter) return false;
    return true;
  });

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

  const parseAttributes = (raw: any): any[] => {
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
  };

  const hasSelectableVariations = (row: ProductType) => {
    const attrs = parseAttributes((row as any)?.attributes);
    return attrs.some((attr: any) => Array.isArray(attr?.variations) && attr.variations.length > 0);
  };

  const columns: Column<ProductType>[] = [
    {
      key: "gallery",
      label: "Imagem",
      className: "w-16",
      render: (row) => {
        const media = row.gallery?.[0];
        const imgUrl = media?.base_url && media?.details?.sizes?.sm
          ? media.base_url + media.details.sizes.sm
          : null;

        return (
          <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden flex items-center justify-center flex-shrink-0">
            {imgUrl ? (
              <Img src={imgUrl} size="xs" className="w-full h-full object-cover" />
            ) : (
              <Package size={18} className="text-zinc-300" />
            )}
          </div>
        );
      },
    },
    {
      key: "title",
      label: "Nome",
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-zinc-900 truncate max-w-[200px]">{row.title}</p>
          {row.subtitle && (
            <p className="text-xs text-zinc-400 truncate max-w-[200px]">{row.subtitle}</p>
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
            className={`inline-flex items-center gap-2 text-xs font-medium px-2.5 py-1.5 rounded-lg border transition-colors ${
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
            <SlidersHorizontal size={13} />
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
        <span className={`text-sm ${row.quantity ? "text-zinc-700" : "text-red-500"}`}>
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
        const typeMap: Record<string, { label: string; variant: string }> = {
          aluguel: { label: "Aluguel", variant: "info" },
          venda: { label: "Venda", variant: "success" },
          comestivel: { label: "Comestível", variant: "warning" },
          servicos: { label: "Serviços", variant: "neutral" },
        };
        const t = typeMap[row.comercialType] || { label: row.comercialType, variant: "neutral" };
        return <Badge variant={t.variant as any}>{t.label}</Badge>;
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
            className="p-2 rounded-lg hover:bg-zinc-100 text-zinc-500 hover:text-zinc-700 transition-colors"
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

  return (
    <PainelLayout>
      <PageHeader
        title="Produtos"
        description="Gerencie seu catálogo de produtos"
        actions={
          <>
            <Link href="/painel/produtos/importar" className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2">
              <FileUp size={16} />
              Importar
            </Link>
            <Link
              href="/painel/produtos/novo"
              className="bg-yellow-400 hover:bg-yellow-500 text-zinc-900 rounded-lg px-4 py-2 text-sm font-medium transition-colors flex items-center gap-2"
            >
              <Plus size={16} />
              Novo Produto
            </Link>
          </>
        }
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 bg-white p-4 rounded-xl border border-zinc-200 mb-4">
        <SearchInput
          placeholder="Buscar produtos..."
          value={search}
          onChange={setSearch}
          className="w-full sm:w-72"
        />
        <FilterDropdown
          label="Status"
          options={STATUS_OPTIONS}
          value={statusFilter}
          onChange={setStatusFilter}
        />
        <FilterDropdown
          label="Tipo"
          options={TYPE_OPTIONS}
          value={typeFilter}
          onChange={setTypeFilter}
        />
      </div>

      {selectedRows.size > 0 && (
        <div className="flex items-center gap-3 bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4">
          <span className="text-sm font-medium text-zinc-700">
            {selectedRows.size} selecionado{selectedRows.size > 1 ? "s" : ""}
          </span>
          <div className="h-4 w-px bg-zinc-300" />
          <button
            onClick={() => bulkAction("activate")}
            disabled={bulkLoading}
            className="text-sm text-emerald-700 hover:text-emerald-800 font-medium disabled:opacity-50"
          >
            Ativar
          </button>
          <button
            onClick={() => bulkAction("deactivate")}
            disabled={bulkLoading}
            className="text-sm text-amber-700 hover:text-amber-800 font-medium disabled:opacity-50"
          >
            Desativar
          </button>
          <button
            onClick={() => bulkAction("delete")}
            disabled={bulkLoading}
            className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
          >
            Excluir
          </button>
        </div>
      )}

      {!loading && filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200">
          <EmptyState
            icon={<Package size={32} />}
            title="Nenhum produto encontrado"
            description={search || statusFilter || typeFilter
              ? "Tente ajustar os filtros ou a busca"
              : "Adicione seu primeiro produto para comecar"}
            action={
              !search && !statusFilter && !typeFilter ? (
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
      )}
    </PainelLayout>
  );
}
