import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X, CalendarDays, ShoppingBag } from "lucide-react";
import Link from "next/link";
import Api from "@/src/services/api";

interface BookedDate {
  date: string;
  order_id: number;
  status: number;
}

interface UnavailableDatesProps {
  initialDates?: string[];
  onChange: (dates: string[]) => void;
  minDate?: Date;
  schedulingPeriod?: number;
  productId?: number | string;
}

const MONTH_NAMES = [
  "Janeiro", "Fevereiro", "Marco", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];
const WEEK_DAYS = ["D", "S", "T", "Q", "Q", "S", "S"];

function normalizeDate(d: any): string | null {
  if (!d) return null;
  if (d instanceof Date) {
    if (isNaN(d.getTime())) return null;
    return d.toISOString().split("T")[0];
  }
  const s = String(d).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0, 10);
  if (/^\d{2}\/\d{2}\/\d{4}/.test(s)) {
    const [dd, mm, yyyy] = s.split("/");
    return `${yyyy}-${mm}-${dd}`;
  }
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) return parsed.toISOString().split("T")[0];
  return null;
}

function normalizeDates(arr: any[]): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.map(normalizeDate).filter((d): d is string => d !== null);
}

function safeParseDate(d: string): Date {
  if (/^\d{4}-\d{2}-\d{2}$/.test(d)) return new Date(d + "T00:00:00");
  return new Date(d);
}

const UnavailableDates: React.FC<UnavailableDatesProps> = ({
  initialDates = [],
  onChange,
  minDate = new Date(),
  schedulingPeriod = 0,
  productId,
}) => {
  const [selectedDates, setSelectedDates] = useState<string[]>(() => normalizeDates(initialDates));
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [bookedDates, setBookedDates] = useState<Record<string, BookedDate>>({});

  useEffect(() => {
    if (initialDates?.length) {
      setSelectedDates(normalizeDates(initialDates));
    }
  }, []);

  useEffect(() => {
    if (!productId) return;
    const api = new Api();
    (async () => {
      try {
        const res: any = await api.bridge({
          method: "get",
          url: `products/${productId}/booked-dates`,
        });
        if (res?.response && Array.isArray(res.data)) {
          const map: Record<string, BookedDate> = {};
          res.data.forEach((b: BookedDate) => {
            if (b.date) map[b.date] = b;
          });
          setBookedDates(map);
        }
      } catch {}
    })();
  }, [productId]);

  const fmt = (d: Date) => d.toISOString().split("T")[0];

  const toggleDate = (dateStr: string) => {
    if (bookedDates[dateStr]) return;
    const next = selectedDates.includes(dateStr)
      ? selectedDates.filter((d) => d !== dateStr)
      : [...selectedDates, dateStr].sort();
    setSelectedDates(next);
    onChange(next);
  };

  const removeDate = (dateStr: string) => {
    if (bookedDates[dateStr]) return;
    const next = selectedDates.filter((d) => d !== dateStr);
    setSelectedDates(next);
    onChange(next);
  };

  const clearAll = () => {
    const booked = Object.keys(bookedDates);
    const remaining = selectedDates.filter((d) => booked.includes(d));
    setSelectedDates(remaining);
    onChange(remaining);
  };

  const isBlocked = (date: Date) => {
    if (date < minDate) return true;
    if (schedulingPeriod > 0) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const limit = new Date(today);
      limit.setDate(today.getDate() + schedulingPeriod);
      if (date >= today && date < limit) return true;
    }
    return false;
  };

  const getDays = () => {
    const y = currentMonth.getFullYear();
    const m = currentMonth.getMonth();
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    const days: (Date | null)[] = [];
    for (let i = 0; i < first.getDay(); i++) days.push(null);
    for (let d = 1; d <= last.getDate(); d++) days.push(new Date(y, m, d));
    return days;
  };

  const nav = (dir: number) => {
    setCurrentMonth((p) => {
      const n = new Date(p);
      n.setMonth(p.getMonth() + dir);
      return n;
    });
  };

  const today = fmt(new Date());

  const sortedSelected = [...selectedDates].sort();
  const grouped: Record<string, string[]> = {};
  sortedSelected.forEach((d) => {
    const dt = safeParseDate(d);
    if (isNaN(dt.getTime())) return;
    const key = `${MONTH_NAMES[dt.getMonth()]} ${dt.getFullYear()}`;
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(d);
  });

  const manualCount = selectedDates.filter((d) => !bookedDates[d]).length;
  const bookedCount = Object.keys(bookedDates).length;

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div>
        <div className="border border-zinc-200 rounded-lg">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
            <button
              type="button"
              onClick={() => nav(-1)}
              className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500 transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold text-zinc-800">
              {MONTH_NAMES[currentMonth.getMonth()]} {currentMonth.getFullYear()}
            </span>
            <button
              type="button"
              onClick={() => nav(1)}
              className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-500 transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="p-3">
            <div className="grid grid-cols-7 mb-1">
              {WEEK_DAYS.map((d, i) => (
                <div key={i} className="text-center text-xs font-medium text-zinc-400 py-1">
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-0.5">
              {getDays().map((day, i) => {
                if (!day) return <div key={i} />;
                const ds = fmt(day);
                const sel = selectedDates.includes(ds);
                const booked = !!bookedDates[ds];
                const blocked = isBlocked(day);
                const isToday = ds === today;

                let btnClass = "relative h-9 text-sm rounded-md transition-all ";

                if (booked) {
                  btnClass += "bg-amber-500 text-white font-medium cursor-default";
                } else if (blocked) {
                  btnClass += "text-zinc-300 cursor-not-allowed";
                } else if (sel) {
                  btnClass += "bg-red-500 text-white hover:bg-red-600 font-medium cursor-pointer";
                } else if (isToday) {
                  btnClass += "ring-2 ring-yellow-400 ring-inset font-medium hover:bg-zinc-100 cursor-pointer";
                } else {
                  btnClass += "hover:bg-zinc-100 cursor-pointer";
                }

                return (
                  <button
                    key={i}
                    type="button"
                    disabled={blocked || booked}
                    onClick={() => toggleDate(ds)}
                    title={booked ? `Pedido #${bookedDates[ds].order_id}` : undefined}
                    className={btnClass}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="px-4 py-2 border-t border-zinc-100 text-xs text-zinc-400 flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-red-500 rounded-sm" />
              Bloqueado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-amber-500 rounded-sm" />
              Reservado
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-sm ring-2 ring-yellow-400" />
              Hoje
            </span>
          </div>
        </div>
      </div>

      <div>
        <div className="border border-zinc-200 rounded-lg h-full flex flex-col">
          <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100">
            <div className="flex items-center gap-2">
              <CalendarDays size={16} className="text-zinc-400" />
              <span className="text-sm font-medium text-zinc-700">
                {manualCount} bloqueada{manualCount !== 1 ? "s" : ""}
                {bookedCount > 0 && (
                  <span className="text-amber-600 ml-1">
                    + {bookedCount} reservada{bookedCount !== 1 ? "s" : ""}
                  </span>
                )}
              </span>
            </div>
            {manualCount > 0 && (
              <button
                type="button"
                onClick={clearAll}
                className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
              >
                Limpar bloqueios
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto max-h-[280px] p-3">
            {Object.keys(bookedDates).length > 0 && (
              <div className="mb-3">
                <div className="text-xs font-medium text-amber-600 mb-1.5 flex items-center gap-1.5">
                  <ShoppingBag size={12} />
                  Reservas ativas
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {Object.values(bookedDates).sort((a, b) => a.date.localeCompare(b.date)).map((b) => {
                    const dt = safeParseDate(b.date);
                    const dayNum = isNaN(dt.getTime()) ? "?" : dt.getDate().toString().padStart(2, "0");
                    const mon = isNaN(dt.getTime()) ? "" : `/${(dt.getMonth() + 1).toString().padStart(2, "0")}`;
                    return (
                      <Link
                        key={b.date}
                        href={`/painel/pedidos/${b.order_id}`}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-md border border-amber-200 hover:bg-amber-100 transition-colors"
                      >
                        {dayNum}{mon}
                        <span className="text-amber-400">#{b.order_id}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}

            {selectedDates.length === 0 && Object.keys(bookedDates).length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-zinc-400">
                <CalendarDays size={24} className="mb-2" />
                <span className="text-sm">Nenhuma data bloqueada</span>
                <span className="text-xs mt-1">Clique no calendario para bloquear datas</span>
              </div>
            ) : manualCount > 0 ? (
              <div className="space-y-3">
                {Object.entries(grouped)
                  .filter(([, dates]) => dates.some((d) => !bookedDates[d]))
                  .map(([month, dates]) => (
                    <div key={month}>
                      <div className="text-xs font-medium text-zinc-400 mb-1.5">{month}</div>
                      <div className="flex flex-wrap gap-1.5">
                        {dates.filter((d) => !bookedDates[d]).map((d) => {
                          const dt = safeParseDate(d);
                          const day = isNaN(dt.getTime()) ? "?" : dt.getDate().toString().padStart(2, "0");
                          return (
                            <span
                              key={d}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 text-xs rounded-md border border-red-100"
                            >
                              {day}
                              <button
                                type="button"
                                onClick={() => removeDate(d)}
                                className="hover:text-red-900 transition-colors"
                              >
                                <X size={12} />
                              </button>
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnavailableDates;
