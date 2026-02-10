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

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-zinc-200/80 shadow-sm p-8">
        <div className="flex items-center justify-center gap-3 text-zinc-400">
          <div className="w-5 h-5 border-2 border-zinc-300 border-t-yellow-400 rounded-full animate-spin" />
          <span className="text-sm">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-xl border border-zinc-200/80 shadow-sm overflow-hidden ${className}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
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
                  className={`px-4 py-3 text-left text-xs font-semibold text-zinc-500 uppercase tracking-wider
                    ${col.sortable ? "cursor-pointer select-none hover:text-zinc-700" : ""}
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
                  className="px-4 py-12 text-center text-zinc-400"
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
                      <td key={col.key} className={`px-4 py-3 text-zinc-700 ${col.className || ""}`}>
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
        <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-100">
          <span className="text-xs text-zinc-500">
            {page * pageSize + 1}-{Math.min((page + 1) * pageSize, sorted.length)} de {sorted.length}
          </span>
          <div className="flex items-center gap-1">
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
                  className={`w-8 h-8 text-xs rounded-md transition-colors
                    ${p === page
                      ? "bg-yellow-400 text-white font-semibold"
                      : "hover:bg-zinc-100 text-zinc-600"
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
