import { ReactNode } from "react";
import { Inbox } from "lucide-react";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({
  icon,
  title,
  description,
  action,
  className = "",
}: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}>
      <div className="p-4 rounded-full bg-zinc-100 text-zinc-400 mb-4">
        {icon || <Inbox size={32} />}
      </div>
      <h3 className="text-lg font-semibold text-zinc-700 mb-1">{title}</h3>
      {description && (
        <p className="text-sm text-zinc-500 text-center max-w-sm mb-4">{description}</p>
      )}
      {action}
    </div>
  );
}
