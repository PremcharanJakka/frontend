import { useMemo, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useFinanceData } from '@/hooks/useFinanceData';
import type { PageId } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDateShort } from '@/lib/format';
import { calculateNetWorth, getFreedomStage, FREEDOM_STAGES } from '@/lib/finance';
import {
  Wallet, TrendingUp, TrendingDown, CreditCard, Target,
  PieChart as PieIcon, BarChart3, ArrowRight, Sparkles,
  Flame, Shield, PiggyBank, Rocket,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar, Legend,
} from 'recharts';
import type { FirePlan } from '@/types/finance';

const CATEGORY_COLORS = [
  '#1a1a1a', '#3c3c3c', '#5a5a5a', '#787878', '#9a9a9a',
  '#b0b0b0', '#c8c8c8', '#d8d8d8', '#e0e0e0', '#a8a8a8',
];

export function DashboardPage({ onNavigate }: { onNavigate?: (page: PageId) => void }) {
  const data = useFinanceData();
  const currency = data.profile?.currency ?? 'INR';
  const [firePlan, setFirePlan] = useState<FirePlan | null>(null);

  useEffect(() => {
    async function loadFire() {
      const { data: fd } = await api.from('fire_plans').select('*').maybeSingle();
      if (fd) setFirePlan(fd as FirePlan);
    }
    loadFire();
  }, []);

  const stats = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const monthExpenses = data.expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && e.type === 'expense';
    });
    const monthIncome = data.expenses.filter((e) => {
      const d = new Date(e.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && e.type === 'income';
    });

    const totalExpenses = monthExpenses.reduce((s, e) => s + Number(e.amount), 0);
    const totalIncome = monthIncome.reduce((s, e) => s + Number(e.amount), 0);
    const monthlyIncomeSources = data.incomeSources
      .filter((i) => i.frequency === 'monthly')
      .reduce((s, i) => s + Number(i.amount), 0);

    const totalDebt = data.debts.reduce((s, d) => s + Number(d.remaining_balance), 0);
    const totalInvestments = data.investments.reduce((s, i) => s + Number(i.current_value), 0);
    const emergencyCorpus = data.emergencyFund?.current_corpus ?? 0;
    const emergencyTarget = data.emergencyFund
      ? (data.emergencyFund.monthly_expenses || stats_totalExpenses(data)) * data.emergencyFund.target_months
      : 0;
    const netWorth = calculateNetWorth(
      [...data.investments.map((i) => ({ current_value: i.current_value })),
       { current_corpus: emergencyCorpus }],
      data.debts,
    );

    const savings = totalIncome + monthlyIncomeSources - totalExpenses;
    const savingsRate = totalIncome + monthlyIncomeSources > 0
      ? (savings / (totalIncome + monthlyIncomeSources)) * 100
      : 0;

    const totalGoalsSaved = data.goals.reduce((s, g) => s + Number(g.current_amount), 0);
    const totalGoalsTarget = data.goals.reduce((s, g) => s + Number(g.target_amount), 0);

    return {
      totalExpenses, totalIncome, monthlyIncomeSources, totalDebt,
      totalInvestments, emergencyCorpus, emergencyTarget, netWorth,
      savings, savingsRate, totalGoalsSaved, totalGoalsTarget,
    };
  }, [data]);

  const fireData = useMemo(() => {
    if (!firePlan) return null;
    const yearsToFire = Math.max(0, firePlan.target_fire_age - firePlan.current_age);
    const futureExpenses = Number(firePlan.annual_expenses) * Math.pow(1 + Number(firePlan.inflation_rate) / 100, yearsToFire);
    const fireNumber = (futureExpenses / Number(firePlan.withdrawal_rate)) * 100;

    let corpus = Number(firePlan.current_investments);
    const monthlyRate = Number(firePlan.expected_return) / 12 / 100;
    for (let year = 1; year <= yearsToFire; year++) {
      const currentIncome = Number(firePlan.annual_income) * Math.pow(1 + Number(firePlan.salary_growth_rate) / 100, year - 1);
      const currentExpenses = Number(firePlan.annual_expenses) * Math.pow(1 + Number(firePlan.inflation_rate) / 100, year - 1);
      const monthlyContribution = Math.max(0, (currentIncome - currentExpenses)) / 12;
      for (let m = 1; m <= 12; m++) {
        corpus = corpus * (1 + monthlyRate) + monthlyContribution;
      }
    }
    return {
      fireNumber,
      projectedCorpus: Math.round(corpus),
      yearsToFire,
      onTrack: corpus >= fireNumber,
      progressPct: fireNumber > 0 ? Math.min(100, (Number(firePlan.current_investments) / fireNumber) * 100) : 0,
    };
  }, [firePlan]);

  const monthlyTrend = useMemo(() => {
    const months: { month: string; income: number; expenses: number }[] = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const m = d.getMonth();
      const y = d.getFullYear();
      const income = data.expenses
        .filter((e) => { const ed = new Date(e.date); return ed.getMonth() === m && ed.getFullYear() === y && e.type === 'income'; })
        .reduce((s, e) => s + Number(e.amount), 0);
      const expenses = data.expenses
        .filter((e) => { const ed = new Date(e.date); return ed.getMonth() === m && ed.getFullYear() === y && e.type === 'expense'; })
        .reduce((s, e) => s + Number(e.amount), 0);
      months.push({
        month: d.toLocaleDateString('en-US', { month: 'short' }),
        income: Math.round(income),
        expenses: Math.round(expenses),
      });
    }
    return months;
  }, [data.expenses]);

  const categoryBreakdown = useMemo(() => {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    const cats: Record<string, number> = {};
    data.expenses
      .filter((e) => {
        const ed = new Date(e.date);
        return ed.getMonth() === m && ed.getFullYear() === y && e.type === 'expense';
      })
      .forEach((e) => {
        cats[e.category] = (cats[e.category] ?? 0) + Number(e.amount);
      });
    return Object.entries(cats)
      .map(([name, value]) => ({ name, value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [data.expenses]);

  const investmentAllocation = useMemo(() => {
    const types: Record<string, number> = {};
    data.investments.forEach((i) => {
      types[i.type] = (types[i.type] ?? 0) + Number(i.current_value);
    });
    return Object.entries(types)
      .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value: Math.round(value) }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [data.investments]);

  const freedomStage = useMemo(() => {
    const annualExpenses = stats.totalExpenses * 12 || 1;
    return getFreedomStage(stats.netWorth, annualExpenses);
  }, [stats]);

  const recentTransactions = data.expenses.slice(0, 5);

  const emergencyProgress = stats.emergencyTarget > 0
    ? Math.min(100, (stats.emergencyCorpus / stats.emergencyTarget) * 100)
    : 0;

  const goalsProgress = stats.totalGoalsTarget > 0
    ? Math.min(100, (stats.totalGoalsSaved / stats.totalGoalsTarget) * 100)
    : 0;

  if (data.loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const isEmpty =
    data.expenses.length === 0 &&
    data.debts.length === 0 &&
    data.investments.length === 0 &&
    data.goals.length === 0;

  return (
    <div className="space-y-4 lg:space-y-5">
      {/* Welcome banner */}
      {isEmpty && (
        <div className="glass-card p-5 animate-slide-up flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl gradient-primary">
              <Sparkles size={18} strokeWidth={1.5} />
            </div>
            <div>
              <p className="font-semibold text-base-color">Welcome to FinPath</p>
              <p className="text-sm text-muted">Add expenses, debts, investments, and goals to bring your dashboard to life.</p>
            </div>
          </div>
          <Button size="sm" onClick={() => onNavigate?.('budget')}>
            Get Started <ArrowRight size={14} strokeWidth={1.5} />
          </Button>
        </div>
      )}

      {/* Row 1: Key metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <StatCard label="Monthly Income" value={formatCurrency(stats.totalIncome + stats.monthlyIncomeSources, currency)} icon={<TrendingUp size={18} strokeWidth={1.5} />} gradient="primary" delay="stagger-1" />
        <StatCard label="Monthly Expenses" value={formatCurrency(stats.totalExpenses, currency)} icon={<TrendingDown size={18} strokeWidth={1.5} />} gradient="error" delay="stagger-2" />
        <StatCard label="Net Worth" value={formatCurrency(stats.netWorth, currency)} icon={<Wallet size={18} strokeWidth={1.5} />} gradient="accent" delay="stagger-3" />
        <StatCard label="Total Debt" value={formatCurrency(stats.totalDebt, currency)} icon={<CreditCard size={18} strokeWidth={1.5} />} gradient="warning" delay="stagger-4" />
      </div>

      {/* Row 2: Freedom stage + Income chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
        <div className="lg:col-span-5 glass-card p-6 animate-slide-up stagger-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl gradient-primary">
                <Sparkles size={18} strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-muted font-medium tracking-wide uppercase">Financial Freedom</p>
                <h3 className="text-lg font-serif text-base-color">{freedomStage.name}</h3>
              </div>
            </div>
            <button
              onClick={() => onNavigate?.('roadmap')}
              className="p-2 rounded-lg text-muted hover:text-base-color hover:bg-surface-2 transition-colors"
            >
              <ArrowRight size={16} strokeWidth={1.5} />
            </button>
          </div>
          <p className="text-xs text-muted mb-4 leading-relaxed">{freedomStage.description}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted">Savings Rate</p>
              <p className="text-3xl font-serif text-base-color">{stats.savingsRate.toFixed(1)}%</p>
            </div>
            <div className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${stats.savingsRate >= 20 ? 'gradient-accent' : 'gradient-warning'}`}>
              {stats.savingsRate >= 30 ? 'Excellent' : stats.savingsRate >= 20 ? 'Strong' : 'Building'}
            </div>
          </div>
          <div className="flex items-center gap-1.5 mt-4">
            {FREEDOM_STAGES.map((s) => (
              <div
                key={s.level}
                className={`h-1 flex-1 rounded-full transition-all ${s.level <= freedomStage.level ? 'gradient-primary' : 'bg-surface-2'}`}
              />
            ))}
          </div>
        </div>

        <div className="lg:col-span-7 glass-card p-6 animate-slide-up stagger-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <BarChart3 size={18} strokeWidth={1.5} className="text-primary" />
              <h3 className="text-lg font-serif text-base-color">Income vs Expenses</h3>
            </div>
            <span className="text-xs text-muted">Last 6 months</span>
          </div>
          {monthlyTrend.some((m) => m.income > 0 || m.expenses > 0) ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={monthlyTrend}>
                <defs>
                  <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a1a1a" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#1a1a1a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a0a0a0" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#a0a0a0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" />
                <XAxis dataKey="month" stroke="rgb(var(--color-text-muted))" fontSize={11} />
                <YAxis stroke="rgb(var(--color-text-muted))" fontSize={11} tickFormatter={(v) => formatCurrency(v)} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))', borderRadius: '12px' }}
                  formatter={(v) => formatCurrency(Number(v), currency)}
                />
                <Area type="monotone" dataKey="income" stroke="#1a1a1a" strokeWidth={2} fill="url(#incomeGrad)" name="Income" />
                <Area type="monotone" dataKey="expenses" stroke="#a0a0a0" strokeWidth={2} fill="url(#expenseGrad)" name="Expenses" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex items-center justify-center text-muted text-sm">No transaction data yet</div>
          )}
        </div>
      </div>

      {/* Row 3: Quick stat tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        <div className="glass-card p-5 animate-slide-up stagger-1 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg gradient-accent"><PiggyBank size={16} strokeWidth={1.5} /></div>
            <button onClick={() => onNavigate?.('budget')} className="p-1.5 rounded-lg text-muted hover:text-base-color hover:bg-surface-2 transition-colors">
              <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </div>
          <p className="text-xs text-muted font-medium tracking-wide uppercase">Monthly Savings</p>
          <p className="text-2xl font-serif text-base-color mt-1">{formatCurrency(stats.savings, currency)}</p>
          <div className="mt-3 h-1.5 rounded-full bg-surface-2 overflow-hidden">
            <div className="h-full rounded-full gradient-accent" style={{ width: `${Math.min(100, Math.max(0, stats.savingsRate))}%` }} />
          </div>
          <p className="text-xs text-muted mt-2">{stats.savingsRate.toFixed(1)}% savings rate</p>
        </div>

        <div className="glass-card p-5 animate-slide-up stagger-2 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg gradient-primary"><TrendingUp size={16} strokeWidth={1.5} /></div>
            <button onClick={() => onNavigate?.('investments')} className="p-1.5 rounded-lg text-muted hover:text-base-color hover:bg-surface-2 transition-colors">
              <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </div>
          <p className="text-xs text-muted font-medium tracking-wide uppercase">Investments</p>
          <p className="text-2xl font-serif text-base-color mt-1">{formatCurrency(stats.totalInvestments, currency)}</p>
          <p className="text-xs text-muted mt-3">{data.investments.length} holdings</p>
        </div>

        <div className="glass-card p-5 animate-slide-up stagger-3 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg gradient-warning"><Shield size={16} strokeWidth={1.5} /></div>
            <button onClick={() => onNavigate?.('emergency')} className="p-1.5 rounded-lg text-muted hover:text-base-color hover:bg-surface-2 transition-colors">
              <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </div>
          <p className="text-xs text-muted font-medium tracking-wide uppercase">Emergency Fund</p>
          <p className="text-2xl font-serif text-base-color mt-1">{formatCurrency(stats.emergencyCorpus, currency)}</p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 rounded-full bg-surface-2 overflow-hidden">
              <div className="h-full rounded-full gradient-warning" style={{ width: `${emergencyProgress}%` }} />
            </div>
            <span className="text-xs text-muted font-semibold">{emergencyProgress.toFixed(0)}%</span>
          </div>
        </div>

        <div className="glass-card p-5 animate-slide-up stagger-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-lg gradient-error"><CreditCard size={16} strokeWidth={1.5} /></div>
          </div>
          <p className="text-xs text-muted font-medium tracking-wide uppercase">Total Debt</p>
          <p className="text-2xl font-serif text-base-color mt-1">{formatCurrency(stats.totalDebt, currency)}</p>
          <p className="text-xs text-muted mt-3">{data.debts.length} active loans</p>
        </div>
      </div>

      {/* Row 4: FIRE + Goals + Expense Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
        <div className="lg:col-span-4 glass-card p-6 animate-slide-up stagger-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl gradient-primary"><Flame size={18} strokeWidth={1.5} /></div>
              <h3 className="text-lg font-serif text-base-color">FIRE</h3>
            </div>
            <button onClick={() => onNavigate?.('fire')} className="p-1.5 rounded-lg text-muted hover:text-base-color hover:bg-surface-2 transition-colors">
              <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </div>
          {fireData ? (
            <>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">FIRE Number</span>
                  <span className="text-sm font-semibold text-base-color">{formatCurrency(fireData.fireNumber, currency)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Projected Corpus</span>
                  <span className="text-sm font-semibold text-base-color">{formatCurrency(fireData.projectedCorpus, currency)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Years to FIRE</span>
                  <span className="text-sm font-semibold text-base-color">{fireData.yearsToFire} yrs</span>
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-muted">Progress</span>
                  <span className="text-xs font-semibold text-base-color">{fireData.progressPct.toFixed(1)}%</span>
                </div>
                <div className="h-2 rounded-full bg-surface-2 overflow-hidden">
                  <div className="h-full rounded-full gradient-primary" style={{ width: `${fireData.progressPct}%` }} />
                </div>
                <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-xl bg-surface-2">
                  {fireData.onTrack ? <Rocket size={14} strokeWidth={1.5} className="text-primary" /> : <Flame size={14} strokeWidth={1.5} className="text-primary" />}
                  <span className="text-xs font-medium text-base-color">
                    {fireData.onTrack ? 'On track for FIRE' : 'Gap to close'}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <Flame size={28} strokeWidth={1.5} className="mx-auto text-muted mb-3" />
              <p className="text-sm text-muted mb-3">Set up your FIRE plan to see projections</p>
              <Button size="sm" onClick={() => onNavigate?.('fire')}>Configure FIRE</Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 glass-card p-6 animate-slide-up stagger-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl gradient-accent"><Target size={18} strokeWidth={1.5} /></div>
              <h3 className="text-lg font-serif text-base-color">Goals</h3>
            </div>
            <button onClick={() => onNavigate?.('goals')} className="p-1.5 rounded-lg text-muted hover:text-base-color hover:bg-surface-2 transition-colors">
              <ArrowRight size={14} strokeWidth={1.5} />
            </button>
          </div>
          {data.goals.length > 0 ? (
            <>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-muted">Total Saved</p>
                  <p className="text-xl font-serif text-base-color">{formatCurrency(stats.totalGoalsSaved, currency)}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted">Target</p>
                  <p className="text-xl font-serif text-base-color">{formatCurrency(stats.totalGoalsTarget, currency)}</p>
                </div>
              </div>
              <div className="h-2 rounded-full bg-surface-2 overflow-hidden mb-4">
                <div className="h-full rounded-full gradient-accent" style={{ width: `${goalsProgress}%` }} />
              </div>
              <div className="space-y-2">
                {data.goals.slice(0, 3).map((goal) => {
                  const progress = goal.target_amount > 0
                    ? Math.min(100, (Number(goal.current_amount) / Number(goal.target_amount)) * 100)
                    : 0;
                  return (
                    <div key={goal.id} className="flex items-center justify-between text-sm">
                      <span className="text-muted truncate">{goal.name}</span>
                      <span className="font-semibold text-base-color ml-2">{progress.toFixed(0)}%</span>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="py-8 text-center">
              <Target size={28} strokeWidth={1.5} className="mx-auto text-muted mb-3" />
              <p className="text-sm text-muted mb-3">No goals set yet</p>
              <Button size="sm" onClick={() => onNavigate?.('goals')}>Add Goals</Button>
            </div>
          )}
        </div>

        <div className="lg:col-span-4 glass-card p-6 animate-slide-up stagger-3">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <PieIcon size={18} strokeWidth={1.5} className="text-primary" />
              <h3 className="text-lg font-serif text-base-color">Expense Categories</h3>
            </div>
          </div>
          {categoryBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={categoryBreakdown} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                  {categoryBreakdown.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))', borderRadius: '12px' }}
                  formatter={(v) => formatCurrency(Number(v), currency)}
                />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted text-sm">No expenses this month</div>
          )}
        </div>
      </div>

      {/* Row 5: Recent Transactions + Investment Allocation */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-4">
        <div className="lg:col-span-7 glass-card p-6 animate-slide-up stagger-1">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <Wallet size={18} strokeWidth={1.5} className="text-primary" />
              <h3 className="text-lg font-serif text-base-color">Recent Transactions</h3>
            </div>
          </div>
          {recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-surface-2"
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${tx.type === 'income' ? 'gradient-accent' : 'gradient-error'}`}>
                      {tx.type === 'income' ? <TrendingUp size={14} strokeWidth={1.5} /> : <TrendingDown size={14} strokeWidth={1.5} />}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-base-color capitalize">{tx.category}</p>
                      <p className="text-xs text-muted">{tx.description || formatDateShort(tx.date)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-base-color">
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(Number(tx.amount), currency)}
                    </p>
                    <p className="text-xs text-muted">{formatDateShort(tx.date)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted text-sm">No transactions yet</div>
          )}
        </div>

        <div className="lg:col-span-5 glass-card p-6 animate-slide-up stagger-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <TrendingUp size={18} strokeWidth={1.5} className="text-primary" />
              <h3 className="text-lg font-serif text-base-color">Investment Allocation</h3>
            </div>
          </div>
          {investmentAllocation.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={investmentAllocation} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" horizontal={false} />
                <XAxis type="number" stroke="rgb(var(--color-text-muted))" fontSize={11} tickFormatter={(v) => formatCurrency(v, currency)} />
                <YAxis type="category" dataKey="name" stroke="rgb(var(--color-text-muted))" fontSize={11} width={70} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))', borderRadius: '12px' }}
                  formatter={(v) => formatCurrency(Number(v), currency)}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {investmentAllocation.map((_, i) => (
                    <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[200px] flex items-center justify-center text-muted text-sm">No investments yet</div>
          )}
        </div>
      </div>
    </div>
  );
}

function stats_totalExpenses(data: ReturnType<typeof useFinanceData>): number {
  const now = new Date();
  const m = now.getMonth();
  const y = now.getFullYear();
  return data.expenses
    .filter((e) => {
      const ed = new Date(e.date);
      return ed.getMonth() === m && ed.getFullYear() === y && e.type === 'expense';
    })
    .reduce((s, e) => s + Number(e.amount), 0);
}
