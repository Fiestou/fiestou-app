const VARIANTS: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
  neutral: "bg-zinc-100 text-zinc-600 border-zinc-200",
};

type BadgeProps = {
  variant?: keyof typeof VARIANTS;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
};

export default function Badge({ variant = "neutral", children, className = "", dot = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full border ${VARIANTS[variant] || VARIANTS.neutral} ${className}`}
    >
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            variant === "success" ? "bg-emerald-500" :
            variant === "warning" ? "bg-amber-500" :
            variant === "danger" ? "bg-red-500" :
            variant === "info" ? "bg-blue-500" :
            "bg-zinc-400"
          }`}
        />
      )}
      {children}
    </span>
  );
}
