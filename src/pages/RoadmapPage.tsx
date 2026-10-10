import { useMemo, useState } from 'react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/format';
import {
  calculateNetWorth, getFreedomStage, getNextFreedomStage,
  FREEDOM_STAGES,
} from '@/lib/finance';
import {
  Route, Sparkles, TrendingUp, Shield, Target, Flag,
  CheckCircle2, Circle, Rocket,
} from 'lucide-react';

export function RoadmapPage() {
  const data = useFinanceData();
  const { user } = useAuth();
  const currency = data.profile?.currency ?? 'INR';
  const [annualExpensesInput, setAnnualExpensesInput] = useState('');
  const [annualIncomeInput, setAnnualIncomeInput] = useState('');

  const emergencyCorpus = data.emergencyFund?.current_corpus ?? 0;
  const totalGoalsSaved = data.goals.reduce((s, g) => s + Number(g.current_amount), 0);

  const netWorth = useMemo(() => {
    return calculateNetWorth(
      [
        ...data.investments.map((i) => ({ current_value: i.current_value })),
        { current_corpus: emergencyCorpus },
        { invested_amount: totalGoalsSaved },
      ],
      data.debts,
    );
  }, [data.investments, data.debts, emergencyCorpus, totalGoalsSaved]);

  const annualExpenses = useMemo(() => {
    if (annualExpensesInput) return parseFloat(annualExpensesInput);
    const monthlyExp = data.emergencyFund?.monthly_expenses ?? 0;
    const expenseTransactions = data.expenses
      .filter((e) => e.type === 'expense')
      .reduce((s, e) => s + Number(e.amount), 0);
    if (monthlyExp > 0) return monthlyExp * 12;
    if (data.expenses.length > 0) return expenseTransactions * 6;
    return 36000;
  }, [annualExpensesInput, data.emergencyFund, data.expenses]);

  const annualIncome = useMemo(() => {
    if (annualIncomeInput) return parseFloat(annualIncomeInput);
    const incomeTransactions = data.expenses
      .filter((e) => e.type === 'income')
      .reduce((s, e) => s + Number(e.amount), 0);
    const monthlySources = data.incomeSources
      .filter((i) => i.frequency === 'monthly')
      .reduce((s, i) => s + Number(i.amount), 0);
    if (monthlySources > 0 || incomeTransactions > 0) return (monthlySources * 12) + (incomeTransactions * 6);
    return 60000;
  }, [annualIncomeInput, data.expenses, data.incomeSources]);

  const currentStage = getFreedomStage(netWorth, annualExpenses);
  const nextStage = getNextFreedomStage(netWorth, annualExpenses);
  const currentMultiple = annualExpenses > 0 ? netWorth / annualExpenses : 0;

  const progressToNext = useMemo(() => {
    if (!nextStage) return 100;
    const currentTarget = currentStage.targetMultiple * annualExpenses;
    const nextTarget = nextStage.targetMultiple * annualExpenses;
    if (nextTarget === currentTarget) return 0;
    return Math.min(100, ((netWorth - currentTarget) / (nextTarget - currentTarget)) * 100);
  }, [currentStage, nextStage, netWorth, annualExpenses]);

  const amountToNext = useMemo(() => {
    if (!nextStage) return 0;
    return Math.max(0, nextStage.targetMultiple * annualExpenses - netWorth);
  }, [nextStage, annualExpenses, netWorth]);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    await api.from('profiles').update({
      monthly_income: (parseFloat(annualIncomeInput) || annualIncome) / 12,
    }).eq('user_id', user.id);
    data.refresh();
  }

  if (data.loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="glass-card p-8 animate-slide-up stagger-1">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl gradient-primary">
            <Rocket size={26} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-2xl font-serif text-base-color">Financial Freedom Roadmap</h2>
            <p className="text-sm text-muted">Your journey from dependency to abundance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-surface-2">
            <p className="text-xs text-muted font-medium tracking-wide uppercase">Current Net Worth</p>
            <p className="text-2xl font-serif text-base-color">{formatCurrency(netWorth, currency)}</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-2">
            <p className="text-xs text-muted font-medium tracking-wide uppercase">Freedom Multiple</p>
            <p className="text-2xl font-serif text-primary">{currentMultiple.toFixed(1)}x</p>
            <p className="text-xs text-muted">of annual expenses</p>
          </div>
          <div className="p-4 rounded-xl gradient-primary">
            <p className="text-xs opacity-80 font-medium tracking-wide uppercase">Current Stage</p>
            <p className="text-2xl font-serif">{currentStage.name}</p>
          </div>
        </div>
      </div>

      {/* Current stage progress */}
      {nextStage && (
        <SectionCard title={`Progress to "${nextStage.name}"`} icon={<TrendingUp size={18} strokeWidth={1.5} />} delay="stagger-2">
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-muted">{currentStage.name}</span>
                <span className="font-semibold text-base-color">{progressToNext.toFixed(0)}%</span>
                <span className="text-muted">{nextStage.name}</span>
              </div>
              <div className="h-3 rounded-full bg-surface-2 overflow-hidden">
                <div className="h-full rounded-full gradient-primary" style={{ width: `${progressToNext}%` }} />
              </div>
            </div>
            <div className="flex items-center justify-between p-4 rounded-xl bg-surface-2">
              <div>
                <p className="text-sm text-muted">Amount needed to reach {nextStage.name}</p>
                <p className="text-xl font-serif text-base-color">{formatCurrency(amountToNext, currency)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted">Target</p>
                <p className="text-lg font-serif text-primary">{formatCurrency(nextStage.targetMultiple * annualExpenses, currency)}</p>
              </div>
            </div>
            <p className="text-sm text-muted">{nextStage.description}</p>
          </div>
        </SectionCard>
      )}

      {/* Freedom stages timeline */}
      <SectionCard title="Freedom Stages" icon={<Route size={18} strokeWidth={1.5} />} delay="stagger-3">
        <div className="space-y-1">
          {FREEDOM_STAGES.map((stage, index) => {
            const isPassed = currentMultiple >= stage.targetMultiple;
            const isCurrent = stage.level === currentStage.level;
            const stageTarget = stage.targetMultiple * annualExpenses;
            return (
              <div key={stage.level} className="flex gap-4 group">
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                    isPassed ? 'gradient-accent scale-110' :
                    isCurrent ? 'gradient-primary scale-110 animate-pulse-glow' :
                    'bg-surface-2 text-muted border-2 border-base'
                  }`}>
                    {isPassed ? <CheckCircle2 size={18} strokeWidth={1.5} /> : <Circle size={18} strokeWidth={1.5} />}
                  </div>
                  {index < FREEDOM_STAGES.length - 1 && (
                    <div className={`w-0.5 h-12 ${isPassed ? 'bg-primary' : 'bg-base'}`} />
                  )}
                </div>

                <div className="flex-1 pb-8">
                  <div className={`p-4 rounded-xl transition-all ${isCurrent ? 'glass-card' : 'bg-surface-2'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        {stage.level >= 5 ? <Rocket size={16} strokeWidth={1.5} className="text-primary" /> :
                         stage.level >= 3 ? <Flag size={16} strokeWidth={1.5} className="text-primary" /> :
                         stage.level >= 1 ? <Shield size={16} strokeWidth={1.5} className="text-primary" /> :
                         <Target size={16} strokeWidth={1.5} className="text-muted" />}
                        <h4 className={`font-serif ${isPassed || isCurrent ? 'text-base-color' : 'text-muted'}`}>
                          {stage.name}
                        </h4>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-md gradient-primary text-xs font-semibold">
                            YOU ARE HERE
                          </span>
                        )}
                      </div>
                      {stage.targetMultiple > 0 && (
                        <span className="text-xs text-muted">
                          {stage.targetMultiple}x expenses · {formatCurrency(stageTarget, currency)}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm ${isPassed || isCurrent ? 'text-muted' : 'text-muted/70'}`}>
                      {stage.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Customize inputs */}
      <SectionCard title="Customize Your Numbers" icon={<Sparkles size={18} strokeWidth={1.5} />} delay="stagger-4">
        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Annual Expenses"
              type="number"
              step="0.01"
              value={annualExpensesInput || String(Math.round(annualExpenses))}
              onChange={(e) => setAnnualExpensesInput(e.target.value)}
              placeholder={String(Math.round(annualExpenses))}
            />
            <Input
              label="Annual Income"
              type="number"
              step="0.01"
              value={annualIncomeInput || String(Math.round(annualIncome))}
              onChange={(e) => setAnnualIncomeInput(e.target.value)}
              placeholder={String(Math.round(annualIncome))}
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted">
              These numbers are used to calculate your freedom stages and progress.
              {!annualExpensesInput && !annualIncomeInput && ' Auto-estimated from your data.'}
            </p>
            <Button type="submit" size="sm">Update</Button>
          </div>
        </form>
      </SectionCard>

      {/* Wealth building tips */}
      <SectionCard title="Wealth Building Milestones" icon={<Target size={18} strokeWidth={1.5} />} delay="stagger-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { title: 'Step 1: Clear High-Cost Debt', desc: 'Pay off credit cards and personal loans first — they eat your wealth', icon: Shield },
            { title: 'Step 2: Build Emergency Fund', desc: 'Save 6 months of expenses before investing aggressively', icon: Shield },
            { title: 'Step 3: Start Investing Early', desc: 'Time in the market beats timing the market — start ASAP', icon: TrendingUp },
            { title: 'Step 4: Diversify Portfolio', desc: 'Spread across stocks, bonds, gold, and real estate', icon: TrendingUp },
            { title: 'Step 5: Increase Income Streams', desc: 'Develop side income, upskill, and create passive sources', icon: Rocket },
            { title: 'Step 6: Reach Financial Independence', desc: 'When passive income covers all expenses, you are free', icon: Flag },
          ].map((tip, i) => (
            <div key={i} className="p-4 rounded-xl bg-surface-2 flex items-start gap-3">
              <div className="p-2 rounded-lg gradient-primary flex-shrink-0">
                <tip.icon size={16} strokeWidth={1.5} />
              </div>
              <div>
                <h4 className="font-semibold text-base-color text-sm">{tip.title}</h4>
                <p className="text-xs text-muted mt-0.5">{tip.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
