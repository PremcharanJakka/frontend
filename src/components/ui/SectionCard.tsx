import type { ReactNode } from 'react';

interface SectionCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  action?: ReactNode;
  delay?: string;
  className?: string;
}

export function SectionCard({ title, icon, children, action, delay = '', className = '' }: SectionCardProps) {
  return (
    <div className={`glass-card p-6 animate-slide-up ${delay} ${className}`}>
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          {icon && <span className="text-primary">{icon}</span>}
          <h3 className="text-lg font-serif text-base-color">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
