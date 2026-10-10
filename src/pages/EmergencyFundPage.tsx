import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency } from '@/lib/format';
import {
  Shield,
  Target,
  TrendingUp,
  Wallet,
} from 'lucide-react';

interface EmergencyFund {
  id: string;
  user_id?: string;
  target_months: number;
  current_corpus: number;
  monthly_expenses: number;
}

interface EmergencyFundForm {
  target_months: string;
  monthly_expenses: string;
  current_corpus: string;
}

const DEFAULT_FORM: EmergencyFundForm = {
  target_months: '6',
  monthly_expenses: '',
  current_corpus: '',
};

export function EmergencyFundPage() {
  const { user } = useAuth();

  const [ef, setEf] = useState<EmergencyFund | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] =
    useState<EmergencyFundForm>(DEFAULT_FORM);

  /*
   * Load Emergency Fund from Spring Boot / MySQL
   */
  async function loadEmergencyFund() {
    if (!user) {
      setLoading(false);
      return;
    }

    setLoading(true);

    const result = await api
      .from('emergency_fund')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (result.error) {
      console.error(
        'Failed to load emergency fund:',
        result.error.message
      );

      setLoading(false);
      return;
    }

    if (result.data) {
      const data = result.data as EmergencyFund;

      setEf(data);

      setForm({
        target_months: String(data.target_months ?? 6),
        monthly_expenses: String(
          data.monthly_expenses ?? ''
        ),
        current_corpus: String(
          data.current_corpus ?? ''
        ),
      });
    } else {
      setEf(null);
    }

    setLoading(false);
  }

  /*
   * Load when user becomes available
   */
  useEffect(() => {
    loadEmergencyFund();
  }, [user]);

  /*
   * Save Emergency Fund
   */
  async function handleSave(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (!user) {
      alert('Please login again.');
      return;
    }

    setSaving(true);

    const targetMonths =
      parseInt(form.target_months, 10) || 6;

    const monthlyExpenses =
      parseFloat(form.monthly_expenses) || 0;

    const currentCorpus =
      parseFloat(form.current_corpus) || 0;

    const payload = {
      target_months: targetMonths,
      monthly_expenses: monthlyExpenses,
      current_corpus: currentCorpus,
    };

    try {
      let result;

      /*
       * Existing record → UPDATE
       */
      if (ef?.id) {
        result = await api
          .from('emergency_fund')
          .update(payload)
          .eq('id', ef.id);
      }

      /*
       * No record → INSERT
       */
      else {
        result = await api
          .from('emergency_fund')
          .insert(payload);
      }

      /*
       * Check Spring Boot response
       */
      if (result.error) {
        console.error(
          'Save failed:',
          result.error.message
        );

        alert(
          `Failed to save Emergency Fund:\n${result.error.message}`
        );

        return;
      }

      /*
       * IMPORTANT:
       * Reload the actual record from MySQL
       * after saving.
       */
      const reload = await api
        .from('emergency_fund')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (reload.error) {
        console.error(
          'Saved but reload failed:',
          reload.error.message
        );

        alert(
          `Saved successfully, but could not reload the data:\n${reload.error.message}`
        );

        return;
      }

      if (reload.data) {
        const saved =
          reload.data as EmergencyFund;

        /*
         * Update React state
         */
        setEf(saved);

        /*
         * Update form with database values
         */
        setForm({
          target_months: String(
            saved.target_months ?? 6
          ),
          monthly_expenses: String(
            saved.monthly_expenses ?? ''
          ),
          current_corpus: String(
            saved.current_corpus ?? ''
          ),
        });
      }

      alert('Emergency Fund saved successfully.');
    } catch (error) {
      console.error(
        'Unexpected Emergency Fund error:',
        error
      );

      alert(
        'Something went wrong while saving the Emergency Fund.'
      );
    } finally {
      setSaving(false);
    }
  }

  /*
   * Calculations
   */
  const targetMonths =
    parseInt(form.target_months, 10) || 6;

  const monthlyExpenses =
    parseFloat(form.monthly_expenses) || 0;

  const current =
    parseFloat(form.current_corpus) || 0;

  const target =
    monthlyExpenses * targetMonths;

  const progress =
    target > 0
      ? Math.min(100, (current / target) * 100)
      : 0;

  const shortfall =
    Math.max(0, target - current);

  /*
   * Loading
   */
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">

      {/* =========================
          STAT CARDS
      ========================== */}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">

        <StatCard
          label="Current Corpus"
          value={formatCurrency(current)}
          icon={
            <Wallet
              size={18}
              strokeWidth={1.5}
            />
          }
          gradient="primary"
          delay="stagger-1"
        />

        <StatCard
          label="Target Amount"
          value={formatCurrency(target)}
          icon={
            <Target
              size={18}
              strokeWidth={1.5}
            />
          }
          gradient="accent"
          delay="stagger-2"
        />

        <StatCard
          label="Progress"
          value={`${progress.toFixed(0)}%`}
          icon={
            <TrendingUp
              size={18}
              strokeWidth={1.5}
            />
          }
          gradient="warning"
          delay="stagger-3"
        />

        <StatCard
          label="Shortfall"
          value={formatCurrency(shortfall)}
          icon={
            <Shield
              size={18}
              strokeWidth={1.5}
            />
          }
          gradient="error"
          delay="stagger-4"
        />

      </div>

      {/* =========================
          PROGRESS
      ========================== */}

      <SectionCard
        title="Emergency Fund Progress"
        icon={
          <Shield
            size={18}
            strokeWidth={1.5}
          />
        }
        delay="stagger-1"
      >
        <div className="space-y-4">

          <div className="flex justify-between text-sm">

            <span className="text-muted">
              {formatCurrency(current)} saved
            </span>

            <span className="font-semibold text-base-color">
              {progress.toFixed(0)}%
            </span>

            <span className="text-muted">
              {formatCurrency(target)} target
            </span>

          </div>

          <div className="h-4 rounded-full bg-surface-2 overflow-hidden">

            <div
              className="h-full rounded-full gradient-primary transition-all duration-1000"
              style={{
                width: `${progress}%`,
              }}
            />

          </div>

          {shortfall > 0 && (
            <div className="p-4 rounded-xl bg-surface-2 flex items-center justify-between">

              <div>

                <p className="text-sm text-muted">
                  Amount needed to reach your target
                </p>

                <p className="text-xl font-serif text-base-color">
                  {formatCurrency(shortfall)}
                </p>

              </div>

              <div className="p-3 rounded-xl gradient-warning">

                <Target
                  size={20}
                  strokeWidth={1.5}
                />

              </div>

            </div>
          )}

        </div>
      </SectionCard>

      {/* =========================
          CONFIGURATION
      ========================== */}

      <SectionCard
        title="Emergency Fund Setup"
        icon={
          <Target
            size={18}
            strokeWidth={1.5}
          />
        }
        delay="stagger-2"
      >

        <form
          onSubmit={handleSave}
          className="space-y-4"
        >

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <Input
              label="Target Months"
              type="number"
              min="1"
              max="24"
              value={form.target_months}
              onChange={(e) =>
                setForm({
                  ...form,
                  target_months:
                    e.target.value,
                })
              }
              placeholder="6"
            />

            <Input
              label="Monthly Expenses"
              type="number"
              step="0.01"
              min="0"
              value={form.monthly_expenses}
              onChange={(e) =>
                setForm({
                  ...form,
                  monthly_expenses:
                    e.target.value,
                })
              }
              placeholder="30000"
            />

            <Input
              label="Current Corpus"
              type="number"
              step="0.01"
              min="0"
              value={form.current_corpus}
              onChange={(e) =>
                setForm({
                  ...form,
                  current_corpus:
                    e.target.value,
                })
              }
              placeholder="100000"
            />

          </div>

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2 text-sm text-muted">

              <Target
                size={16}
                strokeWidth={1.5}
              />

              Target:

              <span className="font-semibold text-base-color">
                {formatCurrency(target)}
              </span>

            </div>

            <Button
              type="submit"
              disabled={saving}
              size="sm"
            >
              {saving
                ? 'Saving...'
                : ef
                  ? 'Update'
                  : 'Save'}
            </Button>

          </div>

        </form>

      </SectionCard>

      {/* =========================
          TIPS
      ========================== */}

      <SectionCard
        title="Emergency Fund Tips"
        icon={
          <TrendingUp
            size={18}
            strokeWidth={1.5}
          />
        }
        delay="stagger-3"
      >

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

          {[
            {
              title: 'Start Small',
              desc: 'Begin with 1 month of expenses, then build up to 6 months',
            },
            {
              title: 'Keep It Accessible',
              desc: 'Store in a high-yield savings account for easy access',
            },
            {
              title: 'Automate Savings',
              desc: 'Set up automatic transfers to your emergency fund',
            },
            {
              title: 'Only for Emergencies',
              desc: 'Reserve for job loss, medical, or unexpected repairs only',
            },
          ].map((tip, i) => (

            <div
              key={i}
              className="p-4 rounded-xl bg-surface-2"
            >

              <h4 className="font-semibold text-base-color text-sm mb-1">
                {tip.title}
              </h4>

              <p className="text-xs text-muted">
                {tip.desc}
              </p>

            </div>

          ))}

        </div>

      </SectionCard>

    </div>
  );
}