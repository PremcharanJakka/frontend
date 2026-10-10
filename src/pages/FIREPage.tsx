import { useState, useMemo, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency } from '@/lib/format';
import {
  Flame, IndianRupee, TrendingUp, Target, Calendar,
  Percent, Wallet, Rocket,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { FirePlan } from '@/types/finance';

export function FIREPage() {
  const { user } = useAuth();
  const [plan, setPlan] = useState<FirePlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    current_age: '30',
    target_fire_age: '50',
    annual_income: '1200000',
    salary_growth_rate: '8',
    annual_expenses: '600000',
    current_investments: '500000',
    expected_return: '8',
    withdrawal_rate: '4',
    inflation_rate: '6',
  });

  useEffect(() => {
    async function load() {
      if (!user) return;
      const { data } = await api
        .from('fire_plans')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      if (data) {
        const p = data as FirePlan;
        setPlan(p);
        setForm({
          current_age: String(p.current_age),
          target_fire_age: String(p.target_fire_age),
          annual_income: String(p.annual_income),
          salary_growth_rate: String(p.salary_growth_rate),
          annual_expenses: String(p.annual_expenses),
          current_investments: String(p.current_investments),
          expected_return: String(p.expected_return),
          withdrawal_rate: String(p.withdrawal_rate),
          inflation_rate: String(p.inflation_rate),
        });
      }
      setLoading(false);
    }
    load();
  }, [user]);

  const vals = useMemo(() => ({
    currentAge: parseInt(form.current_age) || 30,
    targetFireAge: parseInt(form.target_fire_age) || 50,
    annualIncome: parseFloat(form.annual_income) || 0,
    salaryGrowth: parseFloat(form.salary_growth_rate) || 0,
    annualExpenses: parseFloat(form.annual_expenses) || 0,
    currentInvestments: parseFloat(form.current_investments) || 0,
    expectedReturn: parseFloat(form.expected_return) || 8,
    withdrawalRate: parseFloat(form.withdrawal_rate) || 4,
    inflationRate: parseFloat(form.inflation_rate) || 6,
  }), [form]);

  const yearsToFire = Math.max(0, vals.targetFireAge - vals.currentAge);

  const fireNumber = useMemo(() => {
    const futureExpenses = vals.annualExpenses * Math.pow(1 + vals.inflationRate / 100, yearsToFire);
    return (futureExpenses / vals.withdrawalRate) * 100;
  }, [vals, yearsToFire]);

  const projectionData = useMemo(() => {
    const data: { year: number; age: number; corpus: number; invested: number; fireTarget: number }[] = [];
    let corpus = vals.currentInvestments;
    let invested = vals.currentInvestments;
    const monthlyRate = vals.expectedReturn / 12 / 100;

    data.push({ year: 0, age: vals.currentAge, corpus: Math.round(corpus), invested: Math.round(invested), fireTarget: Math.round(fireNumber) });

    for (let year = 1; year <= yearsToFire; year++) {
      const currentIncome = vals.annualIncome * Math.pow(1 + vals.salaryGrowth / 100, year - 1);
      const currentExpenses = vals.annualExpenses * Math.pow(1 + vals.inflationRate / 100, year - 1);
      const annualSurplus = Math.max(0, currentIncome - currentExpenses);
      const monthlyContribution = annualSurplus / 12;

      for (let m = 1; m <= 12; m++) {
        corpus = corpus * (1 + monthlyRate) + monthlyContribution;
        invested += monthlyContribution;
      }

      data.push({ year, age: vals.currentAge + year, corpus: Math.round(corpus), invested: Math.round(invested), fireTarget: Math.round(fireNumber) });
    }
    return data;
  }, [vals, yearsToFire, fireNumber]);

  const projectedCorpus = projectionData[projectionData.length - 1]?.corpus ?? 0;
  const totalInvested = projectionData[projectionData.length - 1]?.invested ?? vals.currentInvestments;
  const requiredMonthlyInvestment = useMemo(() => {
    if (yearsToFire <= 0) return 0;
    const monthlyRate = vals.expectedReturn / 12 / 100;
    const months = yearsToFire * 12;
    if (monthlyRate === 0) return Math.max(0, (fireNumber - vals.currentInvestments) / months);
    const fvLumpsum = vals.currentInvestments * Math.pow(1 + monthlyRate, months);
    const needed = fireNumber - fvLumpsum;
    if (needed <= 0) return 0;
    return needed * monthlyRate / (Math.pow(1 + monthlyRate, months) - 1);
  }, [vals, yearsToFire, fireNumber]);

  const fireAchieved = projectedCorpus >= fireNumber;
  const surplusShortfall = projectedCorpus - fireNumber;

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    const payload = {
      user_id: user.id,
      current_age: vals.currentAge,
      target_fire_age: vals.targetFireAge,
      annual_income: vals.annualIncome,
      salary_growth_rate: vals.salaryGrowth,
      annual_expenses: vals.annualExpenses,
      current_investments: vals.currentInvestments,
      expected_return: vals.expectedReturn,
      withdrawal_rate: vals.withdrawalRate,
      inflation_rate: vals.inflationRate,
    };
    if (plan) {
      await api.from('fire_plans').update(payload).eq('id', plan.id);
    } else {
      await api.from('fire_plans').insert(payload);
    }
    const { data } = await api.from('fire_plans').select('*').eq('user_id', user.id).maybeSingle();
    if (data) setPlan(data as FirePlan);
    setSaving(false);
  }

  if (loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div className="glass-card p-8 animate-slide-up stagger-1">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 rounded-2xl gradient-primary">
            <Flame size={26} strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-2xl font-serif text-base-color">FIRE Planning</h2>
            <p className="text-sm text-muted">Financial Independence, Retire Early — your path to freedom</p>
          </div>
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="FIRE Number" value={formatCurrency(fireNumber)} icon={<Target size={18} strokeWidth={1.5} />} gradient="primary" delay="stagger-1" />
        <StatCard label="Projected Corpus" value={formatCurrency(projectedCorpus)} icon={<TrendingUp size={18} strokeWidth={1.5} />} gradient="accent" delay="stagger-2" />
        <StatCard label="Years to FIRE" value={`${yearsToFire} yrs`} icon={<Calendar size={18} strokeWidth={1.5} />} gradient="warning" delay="stagger-3" />
        <StatCard label="Required Monthly" value={formatCurrency(requiredMonthlyInvestment)} icon={<IndianRupee size={18} strokeWidth={1.5} />} gradient="error" delay="stagger-4" />
      </div>

      {/* Status banner */}
      <div className="glass-card p-5 animate-slide-up stagger-2 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${fireAchieved ? 'gradient-accent' : 'gradient-warning'}`}>
          {fireAchieved ? <Rocket size={20} strokeWidth={1.5} /> : <Flame size={20} strokeWidth={1.5} />}
        </div>
        <div>
          <p className="font-semibold text-base-color">
            {fireAchieved ? 'You are on track to achieve FIRE' : `You need ${formatCurrency(Math.abs(surplusShortfall))} more by age ${vals.targetFireAge}`}
          </p>
          <p className="text-sm text-muted">
            {fireAchieved
              ? `Projected corpus exceeds your FIRE number by ${formatCurrency(surplusShortfall)}`
              : `Increase your monthly investment to ${formatCurrency(requiredMonthlyInvestment)} to close the gap`}
          </p>
        </div>
      </div>

      {/* Projection chart */}
      <SectionCard title="Retirement Projection" icon={<TrendingUp size={18} strokeWidth={1.5} />} delay="stagger-3">
        <ResponsiveContainer width="100%" height={320}>
          <AreaChart data={projectionData}>
            <defs>
              <linearGradient id="corpusGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1a1a1a" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#1a1a1a" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#a0a0a0" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#a0a0a0" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" />
            <XAxis dataKey="age" stroke="rgb(var(--color-text-muted))" fontSize={11} label={{ value: 'Age', position: 'insideBottom', offset: -2, fontSize: 11 }} />
            <YAxis stroke="rgb(var(--color-text-muted))" fontSize={11} tickFormatter={(v) => formatCurrency(v)} />
            <Tooltip
              contentStyle={{ backgroundColor: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))', borderRadius: '12px' }}
              formatter={(v) => formatCurrency(Number(v))}
              labelFormatter={(l) => `Age ${l}`}
            />
            <ReferenceLine y={fireNumber} stroke="#1a1a1a" strokeDasharray="5 5" label={{ value: 'FIRE Target', position: 'right', fontSize: 11, fill: 'rgb(var(--color-text-muted))' }} />
            <Area type="monotone" dataKey="invested" stroke="#a0a0a0" strokeWidth={2} fill="url(#investedGrad)" name="Invested" />
            <Area type="monotone" dataKey="corpus" stroke="#1a1a1a" strokeWidth={2} fill="url(#corpusGrad)" name="Projected Corpus" />
          </AreaChart>
        </ResponsiveContainer>
      </SectionCard>

      {/* Summary breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="glass-card p-5 animate-slide-up stagger-1">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl gradient-primary"><Wallet size={18} strokeWidth={1.5} /></div>
            <p className="font-semibold text-base-color">Current Status</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted">Current Age</span><span className="font-semibold text-base-color">{vals.currentAge}</span></div>
            <div className="flex justify-between"><span className="text-muted">Target FIRE Age</span><span className="font-semibold text-base-color">{vals.targetFireAge}</span></div>
            <div className="flex justify-between"><span className="text-muted">Current Investments</span><span className="font-semibold text-base-color">{formatCurrency(vals.currentInvestments)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Annual Income</span><span className="font-semibold text-base-color">{formatCurrency(vals.annualIncome)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Annual Expenses</span><span className="font-semibold text-base-color">{formatCurrency(vals.annualExpenses)}</span></div>
          </div>
        </div>
        <div className="glass-card p-5 animate-slide-up stagger-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl gradient-accent"><Target size={18} strokeWidth={1.5} /></div>
            <p className="font-semibold text-base-color">FIRE Target</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted">FIRE Number</span><span className="font-semibold text-base-color">{formatCurrency(fireNumber)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Withdrawal Rate</span><span className="font-semibold text-base-color">{vals.withdrawalRate}%</span></div>
            <div className="flex justify-between"><span className="text-muted">Expected Return</span><span className="font-semibold text-base-color">{vals.expectedReturn}%</span></div>
            <div className="flex justify-between"><span className="text-muted">Inflation Rate</span><span className="font-semibold text-base-color">{vals.inflationRate}%</span></div>
            <div className="flex justify-between"><span className="text-muted">Future Expenses</span><span className="font-semibold text-base-color">{formatCurrency(vals.annualExpenses * Math.pow(1 + vals.inflationRate / 100, yearsToFire))}</span></div>
          </div>
        </div>
        <div className="glass-card p-5 animate-slide-up stagger-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl gradient-warning"><Percent size={18} strokeWidth={1.5} /></div>
            <p className="font-semibold text-base-color">Investment Plan</p>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted">Total to Invest</span><span className="font-semibold text-base-color">{formatCurrency(totalInvested)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Required Monthly</span><span className="font-semibold text-base-color">{formatCurrency(requiredMonthlyInvestment)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Projected Corpus</span><span className="font-semibold text-base-color">{formatCurrency(projectedCorpus)}</span></div>
          </div>
        </div>
      </div>

      {/* Configuration form */}
      <SectionCard title="FIRE Plan Configuration" icon={<Flame size={18} strokeWidth={1.5} />} delay="stagger-4">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Input label="Current Age" type="number" value={form.current_age} onChange={(e) => setForm({ ...form, current_age: e.target.value })} required />
            <Input label="Target FIRE Age" type="number" value={form.target_fire_age} onChange={(e) => setForm({ ...form, target_fire_age: e.target.value })} required />
            <Input label="Current Investments" type="number" step="0.01" value={form.current_investments} onChange={(e) => setForm({ ...form, current_investments: e.target.value })} required />
            <Input label="Annual Income" type="number" step="0.01" value={form.annual_income} onChange={(e) => setForm({ ...form, annual_income: e.target.value })} required />
            <Input label="Annual Expenses" type="number" step="0.01" value={form.annual_expenses} onChange={(e) => setForm({ ...form, annual_expenses: e.target.value })} required />
            <Input label="Salary Growth Rate (%)" type="number" step="0.1" value={form.salary_growth_rate} onChange={(e) => setForm({ ...form, salary_growth_rate: e.target.value })} required />
            <Input label="Expected Return (%)" type="number" step="0.1" value={form.expected_return} onChange={(e) => setForm({ ...form, expected_return: e.target.value })} required />
            <Input label="Withdrawal Rate (%)" type="number" step="0.1" value={form.withdrawal_rate} onChange={(e) => setForm({ ...form, withdrawal_rate: e.target.value })} required />
            <Input label="Inflation Rate (%)" type="number" step="0.1" value={form.inflation_rate} onChange={(e) => setForm({ ...form, inflation_rate: e.target.value })} required />
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving...' : plan ? 'Update FIRE Plan' : 'Save FIRE Plan'}
            </Button>
          </div>
        </form>
      </SectionCard>
    </div>
  );
}
