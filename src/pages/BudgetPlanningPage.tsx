import { useState, useMemo, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { SectionCard } from '@/components/ui/SectionCard';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { StatCard } from '@/components/ui/StatCard';
import { formatCurrency } from '@/lib/format';

import {
  Wallet,
  TrendingUp,
  TrendingDown,
  IndianRupee,
  PieChart as PieIcon,
  BarChart3,
  Home,
  CreditCard,
  Zap,
  UtensilsCrossed,
  GraduationCap,
  Shield,
  PiggyBank,
  MoreHorizontal,
  Save,
} from 'lucide-react';

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import type { BudgetPlan } from '@/types/finance';

// ============================================================
// EXPENSE CATEGORIES
// ============================================================

const EXPENSE_CATEGORIES = [
  { key: 'housing', label: 'Housing', icon: Home },
  { key: 'loans_emis', label: 'Loans / EMIs', icon: CreditCard },
  { key: 'utilities', label: 'Utilities', icon: Zap },
  { key: 'food', label: 'Food', icon: UtensilsCrossed },
  { key: 'education', label: 'Education', icon: GraduationCap },
  { key: 'insurance', label: 'Insurance', icon: Shield },
  { key: 'investments', label: 'Investments', icon: TrendingUp },
  { key: 'savings', label: 'Savings', icon: PiggyBank },
  { key: 'other', label: 'Other', icon: MoreHorizontal },
] as const;

// ============================================================
// CHART COLORS
// ============================================================

const PIE_COLORS = [
  '#1a1a1a',
  '#3c3c3c',
  '#5a5a5a',
  '#787878',
  '#9a9a9a',
  '#b0b0b0',
  '#c8c8c8',
  '#d8d8d8',
  '#e0e0e0',
];

// ============================================================
// PAGE
// ============================================================

export function BudgetPlanningPage() {

  const { user } = useAuth();

  const [plan, setPlan] =
    useState<BudgetPlan | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  // ==========================================================
  // FORM
  // ==========================================================

  const [form, setForm] = useState({
    salary: '80000',
    additional_income: '0',

    housing: '20000',
    loans_emis: '8000',
    utilities: '4000',
    food: '10000',
    education: '3000',
    insurance: '3000',
    investments: '8000',
    savings: '8000',
    other: '3000',
  });

  // ==========================================================
  // LOAD SAVED BUDGET
  // ==========================================================

  useEffect(() => {

    async function loadBudget() {

      if (!user) {
        setLoading(false);
        return;
      }

      setLoading(true);

      /*
       * IMPORTANT:
       *
       * Do not send .eq('user_id', user.id).
       *
       * Spring Boot already filters using the authenticated
       * JWT user.
       */
      const result = await api
        .from('budget_plans')
        .select('*')
        .maybeSingle();

      console.log(
        'Budget LOAD:',
        result
      );

      if (result.error) {

        console.error(
          'Failed to load Budget:',
          result.error
        );

        setLoading(false);
        return;
      }

      if (result.data) {

        const p =
          result.data as BudgetPlan;

        console.log(
          'Budget DATA:',
          p
        );

        setPlan(p);

        setForm({
          salary: String(p.salary ?? 0),
          additional_income:
            String(p.additional_income ?? 0),

          housing:
            String(p.housing ?? 0),

          loans_emis:
            String(p.loans_emis ?? 0),

          utilities:
            String(p.utilities ?? 0),

          food:
            String(p.food ?? 0),

          education:
            String(p.education ?? 0),

          insurance:
            String(p.insurance ?? 0),

          investments:
            String(p.investments ?? 0),

          savings:
            String(p.savings ?? 0),

          other:
            String(p.other ?? 0),
        });

      } else {

        console.log(
          'No Budget Plan found.'
        );

        setPlan(null);
      }

      setLoading(false);
    }

    loadBudget();

  }, [user]);

  // ==========================================================
  // CALCULATIONS
  // ==========================================================

  const totalIncome =
    (parseFloat(form.salary) || 0) +
    (parseFloat(form.additional_income) || 0);

  const totalExpenses =
    EXPENSE_CATEGORIES.reduce(
      (sum, category) =>
        sum +
        (parseFloat(form[category.key]) || 0),
      0
    );

  const surplus =
    totalIncome - totalExpenses;

  const savingsRate =
    totalIncome > 0
      ? (surplus / totalIncome) * 100
      : 0;

  // ==========================================================
  // PIE DATA
  // ==========================================================

  const pieData = useMemo(() => {

    return EXPENSE_CATEGORIES
      .map((category) => ({
        name: category.label,
        value:
          parseFloat(form[category.key]) || 0,
      }))
      .filter(
        (item) => item.value > 0
      )
      .sort(
        (a, b) => b.value - a.value
      );

  }, [form]);

  // ==========================================================
  // BAR DATA
  // ==========================================================

  const barData = useMemo(
    () => [
      {
        category: 'Income',
        amount: totalIncome,
      },
      {
        category: 'Expenses',
        amount: totalExpenses,
      },
      {
        category: 'Surplus',
        amount: Math.max(0, surplus),
      },
    ],
    [
      totalIncome,
      totalExpenses,
      surplus,
    ]
  );

  // ==========================================================
  // SAVE / UPDATE
  // ==========================================================

  async function handleSave(
    e: React.FormEvent
  ) {

    e.preventDefault();

    if (!user) {

      alert(
        'Please login again.'
      );

      return;
    }

    setSaving(true);

    const payload = {

      /*
       * Do NOT send user_id.
       *
       * The backend automatically sets:
       * user_id = authenticated user
       */
      salary:
        parseFloat(form.salary) || 0,

      additional_income:
        parseFloat(form.additional_income) || 0,

      housing:
        parseFloat(form.housing) || 0,

      loans_emis:
        parseFloat(form.loans_emis) || 0,

      utilities:
        parseFloat(form.utilities) || 0,

      food:
        parseFloat(form.food) || 0,

      education:
        parseFloat(form.education) || 0,

      insurance:
        parseFloat(form.insurance) || 0,

      investments:
        parseFloat(form.investments) || 0,

      savings:
        parseFloat(form.savings) || 0,

      other:
        parseFloat(form.other) || 0,
    };

    console.log(
      'Budget SAVE:',
      payload
    );

    let result;

    // ========================================================
    // UPDATE EXISTING BUDGET
    // ========================================================

    if (plan?.id) {

      result = await api
        .from('budget_plans')
        .update(payload)
        .eq('id', plan.id)
        .single();

    }

    // ========================================================
    // CREATE NEW BUDGET
    // ========================================================

    else {

      result = await api
        .from('budget_plans')
        .insert(payload)
        .single();

    }

    console.log(
      'Budget SAVE RESULT:',
      result
    );

    // ========================================================
    // ERROR
    // ========================================================

    if (result.error) {

      console.error(
        'Budget save error:',
        result.error
      );

      alert(
        `Failed to save Budget:\n${result.error.message}`
      );

      setSaving(false);

      return;
    }

    // ========================================================
    // USE DATABASE RESPONSE
    // ========================================================

    if (result.data) {

      const saved =
        result.data as BudgetPlan;

      console.log(
        'Budget SAVED ROW:',
        saved
      );

      setPlan(saved);

      /*
       * Refresh the form from the actual database row.
       */
      setForm({

        salary:
          String(saved.salary ?? 0),

        additional_income:
          String(
            saved.additional_income ?? 0
          ),

        housing:
          String(saved.housing ?? 0),

        loans_emis:
          String(saved.loans_emis ?? 0),

        utilities:
          String(saved.utilities ?? 0),

        food:
          String(saved.food ?? 0),

        education:
          String(saved.education ?? 0),

        insurance:
          String(saved.insurance ?? 0),

        investments:
          String(saved.investments ?? 0),

        savings:
          String(saved.savings ?? 0),

        other:
          String(saved.other ?? 0),
      });
    }

    setSaving(false);

    alert(
      'Budget saved successfully!'
    );
  }

  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (
      <div
        className="
          flex
          justify-center
          py-20
        "
      >

        <div
          className="
            w-8
            h-8
            border-2
            border-primary/20
            border-t-primary
            rounded-full
            animate-spin
          "
        />

      </div>
    );
  }

  // ==========================================================
  // UI
  // ==========================================================

  return (

    <div className="space-y-5">

      {/* ======================================================
          SUMMARY
      ====================================================== */}

      <div
        className="
          grid
          grid-cols-2
          lg:grid-cols-4
          gap-3
          lg:gap-4
        "
      >

        <StatCard
          label="Total Income"
          value={formatCurrency(totalIncome)}
          icon={
            <TrendingUp
              size={18}
              strokeWidth={1.5}
            />
          }
          gradient="primary"
          delay="stagger-1"
        />

        <StatCard
          label="Total Expenses"
          value={formatCurrency(totalExpenses)}
          icon={
            <TrendingDown
              size={18}
              strokeWidth={1.5}
            />
          }
          gradient="error"
          delay="stagger-2"
        />

        <StatCard
          label="Monthly Surplus"
          value={formatCurrency(surplus)}
          icon={
            <IndianRupee
              size={18}
              strokeWidth={1.5}
            />
          }
          gradient={
            surplus >= 0
              ? 'primary'
              : 'error'
          }
          delay="stagger-3"
        />

        <StatCard
          label="Savings Rate"
          value={`${savingsRate.toFixed(1)}%`}
          icon={
            <PiggyBank
              size={18}
              strokeWidth={1.5}
            />
          }
          gradient="warning"
          delay="stagger-4"
        />

      </div>

      {/* ======================================================
          CHARTS
      ====================================================== */}

      <div
        className="
          grid
          grid-cols-1
          lg:grid-cols-2
          gap-4
          lg:gap-5
        "
      >

        {/* PIE CHART */}

        <SectionCard
          title="Expense Distribution"
          icon={
            <PieIcon
              size={18}
              strokeWidth={1.5}
            />
          }
          delay="stagger-1"
        >

          {pieData.length > 0 ? (

            <ResponsiveContainer
              width="100%"
              height={300}
            >

              <PieChart>

                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  paddingAngle={2}
                >

                  {pieData.map(
                    (_, index) => (

                      <Cell
                        key={index}
                        fill={
                          PIE_COLORS[
                            index %
                            PIE_COLORS.length
                          ]
                        }
                      />

                    )
                  )}

                </Pie>

                <Tooltip
                  contentStyle={{
                    backgroundColor:
                      'rgb(var(--color-surface))',
                    border:
                      '1px solid rgb(var(--color-border))',
                    borderRadius:
                      '12px',
                  }}
                  formatter={(value) =>
                    formatCurrency(
                      Number(value)
                    )
                  }
                />

                <Legend
                  wrapperStyle={{
                    fontSize: '12px',
                  }}
                />

              </PieChart>

            </ResponsiveContainer>

          ) : (

            <div
              className="
                h-[300px]
                flex
                items-center
                justify-center
                text-muted
                text-sm
              "
            >
              No expense data
            </div>

          )}

        </SectionCard>

        {/* BAR CHART */}

        <SectionCard
          title="Income vs Expenses"
          icon={
            <BarChart3
              size={18}
              strokeWidth={1.5}
            />
          }
          delay="stagger-2"
        >

          <ResponsiveContainer
            width="100%"
            height={300}
          >

            <BarChart
              data={barData}
            >

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgb(var(--color-border))"
              />

              <XAxis
                dataKey="category"
                stroke="rgb(var(--color-text-muted))"
                fontSize={12}
              />

              <YAxis
                stroke="rgb(var(--color-text-muted))"
                fontSize={12}
                tickFormatter={(value) =>
                  formatCurrency(value)
                }
              />

              <Tooltip
                contentStyle={{
                  backgroundColor:
                    'rgb(var(--color-surface))',
                  border:
                    '1px solid rgb(var(--color-border))',
                  borderRadius:
                    '12px',
                }}
                formatter={(value) =>
                  formatCurrency(
                    Number(value)
                  )
                }
              />

              <Bar
                dataKey="amount"
                radius={[
                  6,
                  6,
                  0,
                  0
                ]}
              >

                {barData.map(
                  (_, index) => (

                    <Cell
                      key={index}
                      fill={
                        PIE_COLORS[
                          index %
                          PIE_COLORS.length
                        ]
                      }
                    />

                  )
                )}

              </Bar>

            </BarChart>

          </ResponsiveContainer>

        </SectionCard>

      </div>

      {/* ======================================================
          MONTHLY BUDGET PLANNER
      ====================================================== */}

      <SectionCard
        title="Monthly Budget Planner"
        icon={
          <Wallet
            size={18}
            strokeWidth={1.5}
          />
        }
        delay="stagger-3"
      >

        <form
          onSubmit={handleSave}
          className="space-y-6"
        >

          {/* ==================================================
              INCOME
          ================================================== */}

          <div>

            <h4
              className="
                text-sm
                font-semibold
                text-base-color
                mb-3
                flex
                items-center
                gap-2
              "
            >

              <TrendingUp
                size={16}
                strokeWidth={1.5}
                className="text-primary"
              />

              Income

            </h4>

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                gap-4
              "
            >

              <Input
                label="Salary"
                type="number"
                step="0.01"
                value={form.salary}
                onChange={(e) =>
                  setForm({
                    ...form,
                    salary:
                      e.target.value,
                  })
                }
                required
              />

              <Input
                label="Additional Income"
                type="number"
                step="0.01"
                value={
                  form.additional_income
                }
                onChange={(e) =>
                  setForm({
                    ...form,
                    additional_income:
                      e.target.value,
                  })
                }
              />

            </div>

          </div>

          {/* ==================================================
              EXPENSES
          ================================================== */}

          <div>

            <h4
              className="
                text-sm
                font-semibold
                text-base-color
                mb-3
                flex
                items-center
                gap-2
              "
            >

              <TrendingDown
                size={16}
                strokeWidth={1.5}
                className="text-primary"
              />

              Expenses

            </h4>

            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-3
                gap-4
              "
            >

              {EXPENSE_CATEGORIES.map(
                (category) => (

                  <div
                    key={category.key}
                  >

                    <Input
                      label={
                        category.label
                      }
                      type="number"
                      step="0.01"
                      value={
                        form[
                          category.key
                        ]
                      }
                      onChange={(e) =>
                        setForm({
                          ...form,
                          [category.key]:
                            e.target.value,
                        })
                      }
                    />

                  </div>

                )
              )}

            </div>

          </div>

          {/* ==================================================
              SUMMARY + SAVE
          ================================================== */}

          <div
            className="
              flex
              flex-col
              sm:flex-row
              items-start
              sm:items-center
              justify-between
              gap-3
              p-4
              rounded-xl
              bg-surface-2
            "
          >

            <div
              className="
                flex
                flex-wrap
                gap-4
                text-sm
              "
            >

              <span className="text-muted">

                Income:

                <span
                  className="
                    font-semibold
                    text-base-color
                  "
                >
                  {' '}
                  {formatCurrency(
                    totalIncome
                  )}
                </span>

              </span>

              <span className="text-muted">

                Expenses:

                <span
                  className="
                    font-semibold
                    text-base-color
                  "
                >
                  {' '}
                  {formatCurrency(
                    totalExpenses
                  )}
                </span>

              </span>

              <span className="text-muted">

                Surplus:

                <span
                  className="
                    font-semibold
                    text-base-color
                  "
                >
                  {' '}
                  {formatCurrency(
                    surplus
                  )}
                </span>

              </span>

            </div>

            <Button
              type="submit"
              disabled={saving}
              size="sm"
            >

              <Save
                size={14}
                strokeWidth={1.5}
              />

              {saving
                ? 'Saving...'
                : plan
                  ? 'Update Budget'
                  : 'Save Budget'}

            </Button>

          </div>

        </form>

      </SectionCard>

    </div>
  );
}