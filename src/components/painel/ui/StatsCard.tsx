import { ReactNode } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

type StatsCardProps = {
  icon: ReactNode;
  value: string | number;
  label: string;
  iconColor?: string;
  trend?: {
    value: number;
    label?: string;
  };
  className?: string;
};

export default function StatsCard({ icon, value, label, iconColor, trend, className = "" }: StatsCardProps) {
  const isPositive = trend && trend.value >= 0;
  const iconBg = iconColor || "bg-yellow-50 text-yellow-600";

  return (
    <div className={`bg-white rounded-xl border border-zinc-200/80 shadow-sm p-5 ${className}`}>
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2.5 rounded-lg ${iconBg}`}>
          {icon}
        </div>
        {trend && (
          <div
            className={`flex items-center gap-1 text-sm font-semibold px-2.5 py-1 rounded-full ${
              isPositive
                ? "bg-emerald-50 text-emerald-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
            <span>{Math.abs(trend.value)}%</span>
          </div>
        )}
      </div>
      <div className="text-2xl font-bold text-zinc-900 font-display">{value}</div>
      <div className="text-base text-zinc-700 mt-1">{label}</div>
      {trend?.label && (
        <div className="text-sm text-zinc-500 mt-1">{trend.label}</div>
      )}
    </div>
  );
}
