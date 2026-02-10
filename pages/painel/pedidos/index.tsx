import Link from "next/link";
import { useEffect, useState, useCallback, useRef } from "react";
import { ShoppingBag, Eye, SlidersHorizontal, X } from "lucide-react";
import { getExtenseData, moneyFormat } from "@/src/helper";
import { OrderStatusBadge } from "@/src/components/order";
import { getMyOrders, OrderFilters } from "@/src/services/order";
import {
  PainelLayout,
  PageHeader,
  DataTable,
  EmptyState,
  SearchInput,
  FilterDropdown,
} from "@/src/components/painel";
import type { Column } from "@/src/components/painel";

const STATUS_OPTIONS = [
  { label: "Em aberto", value: "0" },
  { label: "Pago", value: "1" },
  { label: "Cancelado", value: "-1" },
];

export default function Pedidos() {
  const [orders, setOrders] = useState<Array<any>>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const debounceRef = useRef<any>(null);

  const fetchOrders = useCallback(async (filters: OrderFilters = {}) => {
    setLoading(true);
    try {
      const data = await getMyOrders(filters);
      setOrders(Array.isArray(data) ? data : []);
    } catch {
      setOrders([]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const filters: OrderFilters = {};
      if (statusFilter) filters.status = statusFilter;
      if (search) filters.search = search;
      if (dateFrom) filters.date_from = dateFrom;
      if (dateTo) filters.date_to = dateTo;
      if (priceMin) filters.price_min = priceMin;
      if (priceMax) filters.price_max = priceMax;
      fetchOrders(filters);
    }, 400);
    return () => clearTimeout(debounceRef.current);
  }, [search, statusFilter, dateFrom, dateTo, priceMin, priceMax]);

  const activeFilterCount = [statusFilter, dateFrom, dateTo, priceMin, priceMax].filter(Boolean).length;

  const clearFilters = () => {
    setStatusFilter("");
    setDateFrom("");
    setDateTo("");
    setPriceMin("");
    setPriceMax("");
    setSearch("");
  };

  const columns: Column<any>[] = [
    {
      key: "id",
      label: "Pedido",
      sortable: true,
      className: "w-24",
      render: (row) => (
        <span className="font-medium text-zinc-900">
          #{row.mainOrderId || row.id}
          {row.ordersCount > 1 && (
            <span className="text-xs text-zinc-400 ml-1">(+{row.ordersCount - 1})</span>
          )}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Data",
      sortable: true,
      render: (row) => (
        <span className="text-sm text-zinc-600">
          {getExtenseData(row.createdAt || row.created_at)}
        </span>
      ),
    },
    {
      key: "customer",
      label: "Cliente",
      render: (row) => {
        const name = row.customer?.name || row.user?.name;
        const email = row.customer?.email || row.user?.email;
        return (
          <div>
            <p className="font-medium text-zinc-900 truncate max-w-[180px]">{name}</p>
            {email && <p className="text-xs text-zinc-400 truncate max-w-[180px]">{email}</p>}
          </div>
        );
      },
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      className: "w-32",
      render: (row) => (
        <span className="font-semibold text-zinc-900">R$ {moneyFormat(row.total)}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      className: "w-36",
      render: (row) => (
        <OrderStatusBadge
          status={row.status}
          metadataStatus={row.metadata?.status}
          paymentStatus={row.metadata?.payment_status}
          paidAt={row.metadata?.paid_at}
          statusText={row.statusText}
        />
      ),
    },
    {
      key: "actions",
      label: "Acoes",
      className: "w-28",
      render: (row) => (
        <Link
          href={`/painel/pedidos/${row.mainOrderId || row.id}`}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-zinc-700 bg-zinc-100 hover:bg-zinc-200 rounded-lg transition-colors"
        >
          <Eye size={14} />
          Detalhes
        </Link>
      ),
    },
  ];

  return (
    <PainelLayout>
      <PageHeader
        title="Pedidos"
        description="Acompanhe os pedidos da sua loja"
      />

      <div className="bg-white rounded-xl border border-zinc-200 mb-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4">
          <SearchInput
            placeholder="Buscar por pedido, cliente..."
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
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border transition-colors ${
              showFilters || activeFilterCount > 0
                ? "border-yellow-400 bg-yellow-50 text-zinc-900"
                : "border-zinc-200 text-zinc-600 hover:border-zinc-300"
            }`}
          >
            <SlidersHorizontal size={15} />
            Filtros
            {activeFilterCount > 0 && (
              <span className="bg-yellow-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={clearFilters}
              className="text-xs text-red-500 hover:text-red-700 font-medium"
            >
              Limpar filtros
            </button>
          )}
        </div>

        {showFilters && (
          <div className="px-4 pb-4 border-t border-zinc-100 pt-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Data inicio</label>
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Data fim</label>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Preço mínimo</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">R$</span>
                  <input
                    type="number"
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder="0"
                    min={0}
                    className="w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-zinc-500 mb-1">Preço máximo</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">R$</span>
                  <input
                    type="number"
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder="0"
                    min={0}
                    className="w-full pl-9 pr-3 py-2 border border-zinc-200 rounded-lg text-sm focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {!loading && orders.length === 0 ? (
        <div className="bg-white rounded-xl border border-zinc-200">
          <EmptyState
            icon={<ShoppingBag size={32} />}
            title="Nenhum pedido encontrado"
            description={
              search || activeFilterCount > 0
                ? "Tente ajustar os filtros ou a busca"
                : "Quando seus clientes fizerem pedidos, eles vao aparecer aqui"
            }
          />
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={orders}
          keyField="id"
          pageSize={15}
          loading={loading}
          emptyMessage="Nenhum pedido encontrado"
        />
      )}
    </PainelLayout>
  );
}
