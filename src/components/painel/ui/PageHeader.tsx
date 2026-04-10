import { ReactNode } from "react";

type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
};

export default function PageHeader({ title, description, actions, className = "" }: PageHeaderProps) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 mb-5 sm:mb-6 ${className}`}>
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 font-display">{title}</h1>
        {description && (
          <p className="text-sm sm:text-base text-zinc-700 mt-1">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex w-full sm:w-auto flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 [&_a]:justify-center [&_button]:justify-center">
          {actions}
        </div>
      )}
    </div>
  );
}
