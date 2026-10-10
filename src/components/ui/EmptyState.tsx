import type { ReactNode } from 'react';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="p-4 rounded-2xl bg-surface-2 mb-4 text-muted">
        {icon}
      </div>
      <h3 className="text-lg font-serif text-base-color mb-1">{title}</h3>
      <p className="text-sm text-muted max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}
