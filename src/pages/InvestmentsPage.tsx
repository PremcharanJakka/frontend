import { useState, useMemo } from 'react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { api } from '@/lib/api';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency } from '@/lib/format';
import { calculateFutureValueSeries } from '@/lib/finance';
import {
  Plus, TrendingUp, Trash2, Edit3, IndianRupee,
  ArrowUpRight, ArrowDownRight, PieChart as PieIcon,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';

const INVESTMENT_TYPES = ['mutual_fund', 'stock', 'bond', 'fd', 'rd', 'gold', 'real_estate', 'crypto', 'ppf', 'nps', 'other'];
const COLORS = ['#1a1a1a', '#3c3c3c', '#5a5a5a', '#787878', '#9a9a9a', '#b0b0b0', '#c8c8c8', '#d8d8d8', '#e0e0e0', '#a8a8a8', '#d0d0d0'];

export function InvestmentsPage() {
  const data = useFinanceData();
  const currency = data.profile?.currency ?? 'INR';
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [projectionYears, setProjectionYears] = useState(10);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  const [form, setForm] = useState({
    name: '', type: 'mutual_fund', invested_amount: '', current_value: '',
    expected_return: '8', start_date: new Date().toISOString().split('T')[0], notes: '',
  });

  function resetForm() {
    setForm({ name: '', type: 'mutual_fund', invested_amount: '', current_value: '', expected_return: '8', start_date: new Date().toISOString().split('T')[0], notes: '' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name, type: form.type,
      invested_amount: parseFloat(form.invested_amount),
      current_value: parseFloat(form.current_value),
      expected_return: parseFloat(form.expected_return),
      start_date: form.start_date, notes: form.notes,
    };
    if (editing) {
      await api.from('investments').update(payload).eq('id', editing);
    } else {
      await api.from('investments').insert(payload);
    }
    setModalOpen(false);
    setEditing(null);
    resetForm();
    data.refresh();
  }

  async function handleDelete(id: string) {
    await api.from('investments').delete().eq('id', id);
    data.refresh();
  }

  function openEdit(id: string) {
    const inv = data.investments.find((i) => i.id === id);
    if (!inv) return;
    setEditing(id);
    setForm({
      name: inv.name, type: inv.type, invested_amount: String(inv.invested_amount),
      current_value: String(inv.current_value), expected_return: String(inv.expected_return),
      start_date: inv.start_date, notes: inv.notes,
    });
    setModalOpen(true);
  }

  const totals = useMemo(() => {
    const invested = data.investments.reduce((s, i) => s + Number(i.invested_amount), 0);
    const current = data.investments.reduce((s, i) => s + Number(i.current_value), 0);
    const gains = current - invested;
    const returnsPct = invested > 0 ? (gains / invested) * 100 : 0;
    return { invested, current, gains, returnsPct };
  }, [data.investments]);

  const allocationData = useMemo(() => {
    const types: Record<string, number> = {};
    data.investments.forEach((i) => {
      types[i.type] = (types[i.type] ?? 0) + Number(i.current_value);
    });
    return Object.entries(types)
      .map(([name, value]) => ({ name: name.replace(/_/g, ' '), value: Math.round(value) }))
      .sort((a, b) => b.value - a.value);
  }, [data.investments]);

  const avgReturn = useMemo(() => {
    if (data.investments.length === 0) return 8;
    const totalValue = data.investments.reduce((s, i) => s + Number(i.current_value), 0);
    if (totalValue === 0) return 8;
    return data.investments.reduce((s, i) => s + Number(i.expected_return) * (Number(i.current_value) / totalValue), 0);
  }, [data.investments]);

  const projectionData = useMemo(() => {
    return calculateFutureValueSeries(
      data.investments.reduce((s, i) => s + Number(i.current_value), 0),
      monthlyContribution, avgReturn, projectionYears,
    );
  }, [data.investments, monthlyContribution, avgReturn, projectionYears]);

  if (data.loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Summary tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-5 animate-slide-up stagger-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl gradient-primary"><IndianRupee size={18} strokeWidth={1.5} /></div>
            <div>
              <p className="text-xs text-muted font-medium tracking-wide uppercase">Total Invested</p>
              <p className="text-xl font-serif text-base-color">{formatCurrency(totals.invested, currency)}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5 animate-slide-up stagger-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl gradient-accent"><TrendingUp size={18} strokeWidth={1.5} /></div>
            <div>
              <p className="text-xs text-muted font-medium tracking-wide uppercase">Current Value</p>
              <p className="text-xl font-serif text-base-color">{formatCurrency(totals.current, currency)}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5 animate-slide-up stagger-3">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${totals.gains >= 0 ? 'gradient-accent' : 'gradient-error'}`}>
              {totals.gains >= 0 ? <ArrowUpRight size={18} strokeWidth={1.5} /> : <ArrowDownRight size={18} strokeWidth={1.5} />}
            </div>
            <div>
              <p className="text-xs text-muted font-medium tracking-wide uppercase">Total Gains</p>
              <p className="text-xl font-serif text-base-color">{formatCurrency(totals.gains, currency)}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5 animate-slide-up stagger-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl gradient-warning"><TrendingUp size={18} strokeWidth={1.5} /></div>
            <div>
              <p className="text-xs text-muted font-medium tracking-wide uppercase">Overall Returns</p>
              <p className="text-xl font-serif text-base-color">{totals.returnsPct.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      {data.investments.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          <SectionCard title="Portfolio Allocation" icon={<PieIcon size={18} strokeWidth={1.5} />} delay="stagger-1">
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={allocationData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" paddingAngle={3}>
                  {allocationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))', borderRadius: '12px' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </SectionCard>

          <SectionCard title="Growth Projection" icon={<TrendingUp size={18} strokeWidth={1.5} />} delay="stagger-2">
            <div className="flex gap-3 mb-3">
              <div className="flex-1">
                <label className="text-xs text-muted tracking-wide uppercase">Monthly Contribution</label>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface-2 border border-base text-sm text-base-color"
                />
              </div>
              <div className="flex-1">
                <label className="text-xs text-muted tracking-wide uppercase">Years</label>
                <input
                  type="number"
                  value={projectionYears}
                  onChange={(e) => setProjectionYears(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-lg bg-surface-2 border border-base text-sm text-base-color"
                />
              </div>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={projectionData}>
                <defs>
                  <linearGradient id="projGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#1a1a1a" stopOpacity={0.15} />
                    <stop offset="100%" stopColor="#1a1a1a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a0a0a0" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#a0a0a0" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" />
                <XAxis dataKey="year" stroke="rgb(var(--color-text-muted))" fontSize={11} />
                <YAxis stroke="rgb(var(--color-text-muted))" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))', borderRadius: '12px' }} />
                <Area type="monotone" dataKey="invested" stroke="#a0a0a0" strokeWidth={2} fill="url(#investedGrad)" />
                <Area type="monotone" dataKey="value" stroke="#1a1a1a" strokeWidth={2} fill="url(#projGrad)" />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted mt-2">
              Projected value in {projectionYears} years at {avgReturn.toFixed(1)}% avg return:{' '}
              <span className="font-semibold text-base-color">{formatCurrency(projectionData[projectionData.length]?.value ?? 0, currency)}</span>
            </p>
          </SectionCard>
        </div>
      )}

      {/* Holdings list */}
      <SectionCard
        title="Your Investments"
        icon={<TrendingUp size={18} strokeWidth={1.5} />}
        delay="stagger-3"
        action={<Button size="sm" onClick={() => { setEditing(null); resetForm(); setModalOpen(true); }}><Plus size={14} strokeWidth={1.5} /> Add</Button>}
      >
        {data.investments.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.investments.map((inv) => {
              const gain = Number(inv.current_value) - Number(inv.invested_amount);
              const gainPct = Number(inv.invested_amount) > 0 ? (gain / Number(inv.invested_amount)) * 100 : 0;
              return (
                <div key={inv.id} className="p-5 rounded-2xl bg-surface-2 group">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-base-color text-sm">{inv.name}</h4>
                      <span className="text-xs text-muted capitalize">{inv.type.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(inv.id)} className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface"><Edit3 size={14} strokeWidth={1.5} /></button>
                      <button onClick={() => handleDelete(inv.id)} className="p-1.5 rounded-lg text-muted hover:text-base-color hover:bg-surface"><Trash2 size={14} strokeWidth={1.5} /></button>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Invested</span>
                      <span className="font-medium text-base-color">{formatCurrency(Number(inv.invested_amount), currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted">Current</span>
                      <span className="font-semibold text-base-color">{formatCurrency(Number(inv.current_value), currency)}</span>
                    </div>
                    <div className="flex justify-between text-sm pt-2 border-t border-base">
                      <span className="text-muted">Returns</span>
                      <span className="font-semibold text-base-color">
                        {gain >= 0 ? '+' : ''}{formatCurrency(gain, currency)} ({gainPct.toFixed(1)}%)
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<TrendingUp size={32} strokeWidth={1.5} />}
            title="No investments tracked"
            description="Add your mutual funds, stocks, FDs, and other investments to track performance."
            action={<Button size="sm" onClick={() => { setEditing(null); resetForm(); setModalOpen(true); }}><Plus size={14} strokeWidth={1.5} /> Add Investment</Button>}
          />
        )}
      </SectionCard>

      {/* Modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Investment' : 'Add Investment'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Bluechip Mutual Fund" required />
            <Select label="Type" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {INVESTMENT_TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Invested Amount" type="number" step="0.01" value={form.invested_amount} onChange={(e) => setForm({ ...form, invested_amount: e.target.value })} required />
            <Input label="Current Value" type="number" step="0.01" value={form.current_value} onChange={(e) => setForm({ ...form, current_value: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Expected Return (%)" type="number" step="0.1" value={form.expected_return} onChange={(e) => setForm({ ...form, expected_return: e.target.value })} required />
            <Input label="Start Date" type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} required />
          </div>
          <Textarea label="Notes (optional)" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">{editing ? 'Update' : 'Add'} Investment</Button>
            <Button type="button" variant="secondary" onClick={() => { setModalOpen(false); setEditing(null); }}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
