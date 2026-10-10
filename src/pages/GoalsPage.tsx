import { useState, useMemo } from 'react';
import { useFinanceData } from '@/hooks/useFinanceData';
import { api } from '@/lib/api';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input, Select } from '@/components/ui/Input';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatCurrency, formatDate } from '@/lib/format';
import {
  Plus, Target, Trash2, Edit3, Calendar,
  CheckCircle2, Flag, Rocket,
} from 'lucide-react';

const GOAL_CATEGORIES = ['general', 'retirement', 'home', 'education', 'travel', 'wedding', 'car', 'emergency', 'other'];
const GOAL_COLORS = ['#1a1a1a', '#3c3c3c', '#5a5a5a', '#787878', '#9a9a9a', '#b0b0b0', '#c8c8c8', '#d8d8d8', '#e0e0e0'];

const CATEGORY_ICONS: Record<string, typeof Target> = {
  general: Target, retirement: Flag, home: Target, education: Target,
  travel: Rocket, wedding: Target, car: Target, emergency: Target, other: Target,
};

export function GoalsPage() {
  const data = useFinanceData();
  const currency = data.profile?.currency ?? 'INR';
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [contributeTo, setContributeTo] = useState<string | null>(null);
  const [contributeAmount, setContributeAmount] = useState('');
  const [form, setForm] = useState({
    name: '', target_amount: '', current_amount: '0',
    target_date: '', category: 'general', color: '#3c3c3c',
  });

  function resetForm() {
    setForm({ name: '', target_amount: '', current_amount: '0', target_date: '', category: 'general', color: '#3c3c3c' });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const payload = {
      name: form.name,
      target_amount: parseFloat(form.target_amount),
      current_amount: parseFloat(form.current_amount) || 0,
      target_date: form.target_date || null,
      category: form.category,
      color: form.color,
    };
    if (editing) {
      await api.from('goals').update(payload).eq('id', editing);
    } else {
      await api.from('goals').insert(payload);
    }
    setModalOpen(false);
    setEditing(null);
    resetForm();
    data.refresh();
  }

  async function handleDelete(id: string) {
    await api.from('goals').delete().eq('id', id);
    data.refresh();
  }

  async function handleContribute(e: React.FormEvent) {
    e.preventDefault();
    if (!contributeTo) return;
    const goal = data.goals.find((g) => g.id === contributeTo);
    if (!goal) return;
    const newAmount = Number(goal.current_amount) + (parseFloat(contributeAmount) || 0);
    await api.from('goals').update({ current_amount: newAmount }).eq('id', contributeTo);
    setContributeTo(null);
    setContributeAmount('');
    data.refresh();
  }

  function openEdit(id: string) {
    const goal = data.goals.find((g) => g.id === id);
    if (!goal) return;
    setEditing(id);
    setForm({
      name: goal.name, target_amount: String(goal.target_amount),
      current_amount: String(goal.current_amount),
      target_date: goal.target_date ?? '', category: goal.category, color: goal.color,
    });
    setModalOpen(true);
  }

  const totals = useMemo(() => {
    const totalTarget = data.goals.reduce((s, g) => s + Number(g.target_amount), 0);
    const totalSaved = data.goals.reduce((s, g) => s + Number(g.current_amount), 0);
    const completed = data.goals.filter((g) => Number(g.current_amount) >= Number(g.target_amount) && Number(g.target_amount) > 0).length;
    return { totalTarget, totalSaved, completed, total: data.goals.length };
  }, [data.goals]);

  if (data.loading) {
    return <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-card p-5 animate-slide-up stagger-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl gradient-primary"><Target size={18} strokeWidth={1.5} /></div>
            <div>
              <p className="text-xs text-muted font-medium tracking-wide uppercase">Total Target</p>
              <p className="text-xl font-serif text-base-color">{formatCurrency(totals.totalTarget, currency)}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5 animate-slide-up stagger-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl gradient-accent"><CheckCircle2 size={18} strokeWidth={1.5} /></div>
            <div>
              <p className="text-xs text-muted font-medium tracking-wide uppercase">Total Saved</p>
              <p className="text-xl font-serif text-base-color">{formatCurrency(totals.totalSaved, currency)}</p>
            </div>
          </div>
        </div>
        <div className="glass-card p-5 animate-slide-up stagger-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl gradient-warning"><Flag size={18} strokeWidth={1.5} /></div>
            <div>
              <p className="text-xs text-muted font-medium tracking-wide uppercase">Goals Completed</p>
              <p className="text-xl font-serif text-base-color">{totals.completed} / {totals.total}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Goal cards */}
      <SectionCard
        title="Financial Goals"
        icon={<Target size={18} strokeWidth={1.5} />}
        delay="stagger-1"
        action={<Button size="sm" onClick={() => { setEditing(null); resetForm(); setModalOpen(true); }}><Plus size={14} strokeWidth={1.5} /> Add Goal</Button>}
      >
        {data.goals.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.goals.map((goal) => {
              const progress = Number(goal.target_amount) > 0
                ? Math.min(100, (Number(goal.current_amount) / Number(goal.target_amount)) * 100)
                : 0;
              const remaining = Math.max(0, Number(goal.target_amount) - Number(goal.current_amount));
              const isComplete = progress >= 100;
              const Icon = CATEGORY_ICONS[goal.category] ?? Target;

              let daysLeft: number | null = null;
              if (goal.target_date) {
                daysLeft = Math.ceil((new Date(goal.target_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
              }

              return (
                <div key={goal.id} className="p-5 rounded-2xl bg-surface-2 group relative overflow-hidden">
                  {isComplete && (
                    <div className="absolute top-0 right-0 px-3 py-1 rounded-bl-xl gradient-accent text-xs font-semibold">
                      Achieved
                    </div>
                  )}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl" style={{ backgroundColor: goal.color }}>
                        <Icon size={16} strokeWidth={1.5} className="text-white" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-base-color text-sm">{goal.name}</h4>
                        <span className="text-xs text-muted capitalize">{goal.category}</span>
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(goal.id)} className="p-1.5 rounded-lg text-muted hover:text-primary hover:bg-surface"><Edit3 size={14} strokeWidth={1.5} /></button>
                      <button onClick={() => handleDelete(goal.id)} className="p-1.5 rounded-lg text-muted hover:text-base-color hover:bg-surface"><Trash2 size={14} strokeWidth={1.5} /></button>
                    </div>
                  </div>

                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-muted mb-1.5">
                      <span>{progress.toFixed(0)}% complete</span>
                      <span>{formatCurrency(remaining, currency)} to go</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-surface overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${progress}%`, backgroundColor: goal.color }} />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="text-xs text-muted">Saved</p>
                      <p className="font-semibold text-base-color">{formatCurrency(Number(goal.current_amount), currency)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted">Target</p>
                      <p className="font-semibold text-base-color">{formatCurrency(Number(goal.target_amount), currency)}</p>
                    </div>
                  </div>

                  {goal.target_date && (
                    <div className="mt-3 pt-3 border-t border-base flex items-center justify-between text-xs">
                      <span className="text-muted flex items-center gap-1"><Calendar size={12} strokeWidth={1.5} /> {formatDate(goal.target_date)}</span>
                      {daysLeft !== null && (
                        <span className={`font-semibold ${daysLeft < 0 ? 'text-base-color' : 'text-muted'}`}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : `${daysLeft}d left`}
                        </span>
                      )}
                    </div>
                  )}

                  {!isComplete && (
                    <button
                      onClick={() => { setContributeTo(goal.id); setContributeAmount(''); }}
                      className="mt-3 w-full py-2 rounded-lg gradient-primary text-sm font-semibold hover:opacity-90 transition-opacity"
                    >
                      Add Contribution
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <EmptyState
            icon={<Target size={32} strokeWidth={1.5} />}
            title="No financial goals yet"
            description="Set goals like buying a home, retirement, or education to track your progress."
            action={<Button size="sm" onClick={() => { setEditing(null); resetForm(); setModalOpen(true); }}><Plus size={14} strokeWidth={1.5} /> Add Goal</Button>}
          />
        )}
      </SectionCard>

      {/* Add/Edit modal */}
      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing ? 'Edit Goal' : 'Add Goal'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Goal Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Buy a House" required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Target Amount" type="number" step="0.01" value={form.target_amount} onChange={(e) => setForm({ ...form, target_amount: e.target.value })} required />
            <Input label="Current Amount" type="number" step="0.01" value={form.current_amount} onChange={(e) => setForm({ ...form, current_amount: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {GOAL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
            <Input label="Target Date (optional)" type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} />
          </div>
          <div>
            <label className="block text-xs font-medium text-muted tracking-wide uppercase mb-2">Color</label>
            <div className="flex gap-2 flex-wrap">
              {GOAL_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm({ ...form, color })}
                  className={`w-8 h-8 rounded-full transition-transform hover:scale-110 ${form.color === color ? 'ring-2 ring-offset-2 ring-offset-surface ring-base' : ''}`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="submit" className="flex-1">{editing ? 'Update' : 'Add'} Goal</Button>
            <Button type="button" variant="secondary" onClick={() => { setModalOpen(false); setEditing(null); }}>Cancel</Button>
          </div>
        </form>
      </Modal>

      {/* Contribute modal */}
      <Modal open={!!contributeTo} onClose={() => setContributeTo(null)} title="Add Contribution">
        <form onSubmit={handleContribute} className="space-y-4">
          <Input
            label="Contribution Amount"
            type="number"
            step="0.01"
            value={contributeAmount}
            onChange={(e) => setContributeAmount(e.target.value)}
            placeholder="1000"
            required
            autoFocus
          />
          <div className="flex gap-3">
            <Button type="submit" className="flex-1">Add Contribution</Button>
            <Button type="button" variant="secondary" onClick={() => setContributeTo(null)}>Cancel</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
