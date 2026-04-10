import { useState, useMemo, ReactNode } from "react";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";

export type Column<T = any> = {
  key: string;
  label: string;
  sortable?: boolean;
  render?: (row: T, index: number) => ReactNode;
  className?: string;
};

type DataTableProps<T = any> = {
  columns: Column<T>[];
  data: T[];
  keyField?: string;
  selectable?: boolean;
  selectedRows?: Set<string | number>;
  onSelectionChange?: (selected: Set<string | number>) => void;
  pageSize?: number;
  className?: string;
  emptyMessage?: string;
  loading?: boolean;
};

type SortConfig = {
  key: string;
  dir: "asc" | "desc";
} | null;

export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  keyField = "id",
  selectable = false,
  selectedRows,
  onSelectionChange,
  pageSize = 10,
  className = "",
  emptyMessage = "Nenhum registro encontrado",
  loading = false,
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortConfig>(null);
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string | number>>(selectedRows || new Set());
  const sortableColumns = columns.filter((column) => column.sortable);

  const sorted = useMemo(() => {
    if (!sort) return data;
    return [...data].sort((a, b) => {
      const aVal = a[sort.key];
      const bVal = b[sort.key];
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sort.dir === "asc" ? aVal - bVal : bVal - aVal;
      }
      const cmp = String(aVal).localeCompare(String(bVal), "pt-BR");
      return sort.dir === "asc" ? cmp : -cmp;
    });
  }, [data, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const toggleSort = (key: string) => {
    setSort((prev) => {
      if (prev?.key !== key) return { key, dir: "asc" };
      if (prev.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  };

  const toggleRow = (id: string | number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
    onSelectionChange?.(next);
  };

  const toggleAll = () => {
    if (selected.size === paged.length) {
      setSelected(new Set());
      onSelectionChange?.(new Set());
    } else {
      const all = new Set(paged.map((r) => r[keyField]));
      setSelected(all);
      onSelectionChange?.(all);
    }
  };

  const setMobileSortKey = (key: string) => {
    if (!key) {
      setSort(null);
      return;
    }

    setSort((prev) => {
      if (prev?.key === key) return prev;
      return { key, dir: "asc" };
    });
  };

  const toggleVisibleRows = () => {
    const pageIds = paged.map((row) => row[keyField]);
    const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));
    const next = new Set(selected);

    if (allSelected) {
      pageIds.forEach((id) => next.delete(id));
    } else {
      pageIds.forEach((id) => next.add(id));
    }

    setSelected(next);
    onSelectionChange?.(next);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-8">
        <div className="flex items-center justify-center gap-3 text-zinc-400">
          <div className="w-5 h-5 border-2 border-zinc-300 border-t-yellow-400 rounded-full animate-spin" />
          <span className="text-base">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden ${className}`}>
      {(sortableColumns.length > 0 || selectable) && (
        <div className="border-b border-zinc-100 bg-zinc-50 px-4 py-3 md:hidden">
          <div className="grid gap-3">
            {sortableColumns.length > 0 && (
              <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-end gap-2">
                <label className="grid gap-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                    Ordenar por
                  </span>
                  <select
                    value={sort?.key || ""}
                    onChange={(e) => setMobileSortKey(e.target.value)}
                    className="w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-800 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
                  >
                    <option value="">Padrão</option>
                    {sortableColumns.map((column) => (
                      <option key={column.key} value={column.key}>
                        {column.label}
                      </option>
                    ))}
                  </select>
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setSort((prev) =>
                      prev
                        ? { key: prev.key, dir: prev.dir === "asc" ? "desc" : "asc" }
                        : sortableColumns[0]
                          ? { key: sortableColumns[0].key, dir: "asc" }
                          : null
                    )
                  }
                  className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
                >
                  {sort?.dir === "desc" ? "Z-A" : "A-Z"}
                </button>

                {sort && (
                  <button
                    type="button"
                    onClick={() => setSort(null)}
                    className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100"
                  >
                    Limpar
                  </button>
                )}
              </div>
            )}

            {selectable && paged.length > 0 && (
              <button
                type="button"
                onClick={toggleVisibleRows}
                className="inline-flex items-center justify-center rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                {paged.every((row) => selected.has(row[keyField]))
                  ? "Limpar seleção desta página"
                  : "Selecionar esta página"}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="divide-y divide-zinc-100 md:hidden">
        {paged.length === 0 ? (
          <div className="px-4 py-12 text-center text-zinc-500 text-base">
            {emptyMessage}
          </div>
        ) : (
          paged.map((row, i) => {
            const rowKey = row[keyField] ?? i;
            const isSelected = selected.has(rowKey);

            return (
              <div
                key={rowKey}
                className={`px-4 py-4 ${
                  isSelected ? "bg-yellow-50/50" : "bg-white"
                }`}
              >
                {selectable && (
                  <label className="mb-3 flex items-center gap-2 text-sm font-medium text-zinc-700">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleRow(rowKey)}
                      className="rounded border-zinc-300 text-yellow-500 focus:ring-yellow-400"
                    />
                    Selecionar registro
                  </label>
                )}

                <div className="grid gap-3">
                  {columns.map((col) => (
                    <div key={col.key} className="grid gap-1">
                      <div className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500">
                        {col.label}
                      </div>
                      <div className="text-sm text-zinc-800 break-words">
                        {col.render ? col.render(row, i) : row[col.key] ?? "—"}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="hidden md:block overflow-x-auto">
        <table className="w-full min-w-[840px] text-[15px]">
          <thead>
            <tr className="border-b border-zinc-100">
              {selectable && (
                <th className="w-12 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={paged.length > 0 && selected.size === paged.length}
                    onChange={toggleAll}
                    className="rounded border-zinc-300 text-yellow-500 focus:ring-yellow-400"
                  />
                </th>
              )}
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-left text-sm font-semibold text-zinc-700 uppercase tracking-wider
                    ${col.sortable ? "cursor-pointer select-none hover:text-zinc-900" : ""}
                    ${col.className || ""}
                  `}
                  onClick={() => col.sortable && toggleSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    {col.sortable && sort?.key === col.key && (
                      sort.dir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (selectable ? 1 : 0)}
                  className="px-4 py-12 text-center text-zinc-500 text-base"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paged.map((row, i) => {
                const rowKey = row[keyField] ?? i;
                const isSelected = selected.has(rowKey);
                return (
                  <tr
                    key={rowKey}
                    className={`border-b border-zinc-50 transition-colors
                      ${isSelected ? "bg-yellow-50/50" : "hover:bg-zinc-50"}
                    `}
                  >
                    {selectable && (
                      <td className="w-12 px-4 py-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleRow(rowKey)}
                          className="rounded border-zinc-300 text-yellow-500 focus:ring-yellow-400"
                        />
                      </td>
                    )}
                    {columns.map((col) => (
                      <td key={col.key} className={`px-4 py-3 text-zinc-800 align-top ${col.className || ""}`}>
                        {col.render ? col.render(row, i) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-4 py-3 border-t border-zinc-100">
          <span className="text-sm text-zinc-600">
            {page * pageSize + 1}-{Math.min((page + 1) * pageSize, sorted.length)} de {sorted.length}
          </span>
          <div className="flex items-center justify-between sm:justify-end gap-1">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-md hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
              let p = idx;
              if (totalPages > 5) {
                const start = Math.max(0, Math.min(page - 2, totalPages - 5));
                p = start + idx;
              }
              return (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={`w-8 h-8 text-sm rounded-md transition-colors
                    ${p === page
                      ? "bg-yellow-400 text-white font-semibold"
                      : "hover:bg-zinc-100 text-zinc-700"
                    }`}
                >
                  {p + 1}
                </button>
              );
            })}
            <button
              onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="p-1.5 rounded-md hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
