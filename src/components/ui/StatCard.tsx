import type { ReactNode } from 'react';

interface StatCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  trend?: { value: string; positive: boolean };
  gradient?: 'primary' | 'accent' | 'warning' | 'error';
  delay?: string;
}

export function StatCard({ label, value, icon, trend, gradient = 'primary', delay = 'stagger-1' }: StatCardProps) {
  return (
    <div className={`glass-card p-5 animate-slide-up ${delay} hover:shadow-md transition-shadow duration-300`}>
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs text-muted font-medium tracking-wide uppercase">{label}</p>
          <p className="text-2xl font-serif text-base-color mt-1.5 truncate">{value}</p>
        </div>
        <div className={`p-2.5 rounded-lg ${gradient === 'primary' ? 'gradient-primary' : gradient === 'accent' ? 'gradient-accent' : gradient === 'warning' ? 'gradient-warning' : 'gradient-error'} shadow-sm flex-shrink-0`}>
          {icon}
        </div>
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1.5">
          <span className={`text-xs font-semibold text-base-color`}>
            {trend.positive ? '↑' : '↓'} {trend.value}
          </span>
          <span className="text-xs text-muted">vs last month</span>
        </div>
      )}
    </div>
  );
}
