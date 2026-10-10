import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import {
  Wallet, LayoutDashboard, Flame, ClipboardList, Users, Shield,
  TrendingUp, Target, Calculator, Route, Moon, Sun, LogOut,
  Menu, X, User,
} from 'lucide-react';

export type PageId =
  | 'dashboard' | 'fire' | 'budget' | 'family' | 'emergency'
  | 'investments' | 'goals' | 'calculators' | 'roadmap';

interface AppShellProps {
  children?: React.ReactNode;
}

const NAV_ITEMS: { id: PageId; label: string; icon: typeof Wallet }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'fire', label: 'FIRE', icon: Flame },
  { id: 'budget', label: 'Monthly Budget Planning', icon: ClipboardList },
  { id: 'emergency', label: 'Emergency Fund', icon: Shield },
  { id: 'family', label: 'My Family Guidance', icon: Users },
  { id: 'investments', label: 'Investments', icon: TrendingUp },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'calculators', label: 'Calculators', icon: Calculator },
  { id: 'roadmap', label: 'Freedom Roadmap', icon: Route },
];

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AppShell(_props: AppShellProps) {
  const { user, profile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [currentPage, setCurrentPage] = useState<PageId>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const currentNav = NAV_ITEMS.find((n) => n.id === currentPage);

  return (
    <div className="min-h-screen bg-app flex">
      <AnimatedBackground />

      {/* Sidebar — Obsidian-style always-dark panel */}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-72 z-40 bg-sidebar border-r border-sidebar flex flex-col transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-sidebar">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-sidebar-surface text-sidebar">
              <Wallet size={20} strokeWidth={1.5} />
            </div>
            <span className="text-xl font-serif text-sidebar">FinPath</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-sidebar-surface text-sidebar-muted"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const active = currentPage === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 group ${
                  active
                    ? 'bg-sidebar-active text-sidebar-active font-semibold'
                    : 'text-sidebar-muted hover:text-sidebar hover:bg-sidebar-surface'
                }`}
              >
                <item.icon
                  size={18}
                  strokeWidth={1.5}
                  className={`transition-transform ${active ? '' : 'group-hover:translate-x-0.5'}`}
                />
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="p-3 border-t border-sidebar">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-sidebar-surface">
            <div className="p-1.5 rounded-md bg-sidebar-border text-sidebar">
              <User size={16} strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar truncate">
                {profile?.full_name || user?.email?.split('@')[0] || 'User'}
              </p>
              <p className="text-xs text-sidebar-muted truncate">{user?.email}</p>
            </div>
            <button
              onClick={signOut}
              className="p-1.5 rounded-md text-sidebar-muted hover:text-sidebar hover:bg-sidebar-border transition-colors"
              title="Sign out"
            >
              <LogOut size={16} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 glass border-b border-base px-4 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-surface-2 text-base-color"
            >
              <Menu size={20} strokeWidth={1.5} />
            </button>
            <div>
              <h1 className="text-xl lg:text-2xl font-serif text-base-color">{currentNav?.label}</h1>
              <p className="text-xs text-muted hidden sm:block">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl glass hover:bg-surface-2 transition-colors text-base-color"
          >
            {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} /> : <Moon size={18} strokeWidth={1.5} />}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          <PageContent page={currentPage} onNavigate={setCurrentPage} />
        </main>
      </div>
    </div>
  );
}

import { DashboardPage } from '@/pages/DashboardPage';
import { FIREPage } from '@/pages/FIREPage';
import { BudgetPlanningPage } from '@/pages/BudgetPlanningPage';
import { FamilyGuidancePage } from '@/pages/FamilyGuidancePage';
import { EmergencyFundPage } from '@/pages/EmergencyFundPage';
import { InvestmentsPage } from '@/pages/InvestmentsPage';
import { GoalsPage } from '@/pages/GoalsPage';
import { CalculatorsPage } from '@/pages/CalculatorsPage';
import { RoadmapPage } from '@/pages/RoadmapPage';

function PageContent({ page, onNavigate }: { page: PageId; onNavigate: (page: PageId) => void }) {
  switch (page) {
    case 'dashboard': return <DashboardPage onNavigate={onNavigate} />;
    case 'fire': return <FIREPage />;
    case 'budget': return <BudgetPlanningPage />;
    case 'emergency': return <EmergencyFundPage />;
    case 'family': return <FamilyGuidancePage />;
    case 'investments': return <InvestmentsPage />;
    case 'goals': return <GoalsPage />;
    case 'calculators': return <CalculatorsPage />;
    case 'roadmap': return <RoadmapPage />;
    default: return <DashboardPage />;
  }
}
