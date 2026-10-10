import { useState, useMemo } from 'react';
import { SectionCard } from '@/components/ui/SectionCard';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/format';
import {
  calculateEMI, calculateTotalInterest, calculateSIPFutureValue,
  calculateLumpSumFutureValue, calculateInflationImpact,
  calculateFutureValueSeries,
} from '@/lib/finance';
import {
  Calculator, Home, TrendingUp, PiggyBank, Percent, IndianRupee,
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

type CalcType = 'emi' | 'sip' | 'lumpsum' | 'inflation' | 'retirement';

const CALC_TABS: { id: CalcType; label: string; icon: typeof Calculator }[] = [
  { id: 'emi', label: 'EMI Calculator', icon: Home },
  { id: 'sip', label: 'SIP Calculator', icon: TrendingUp },
  { id: 'lumpsum', label: 'Lump Sum', icon: PiggyBank },
  { id: 'inflation', label: 'Inflation', icon: Percent },
  { id: 'retirement', label: 'Retirement', icon: IndianRupee },
];

export function CalculatorsPage() {
  const [activeCalc, setActiveCalc] = useState<CalcType>('emi');

  const [emiPrincipal, setEmiPrincipal] = useState(500000);
  const [emiRate, setEmiRate] = useState(8.5);
  const [emiTenure, setEmiTenure] = useState(120);

  const [sipAmount, setSipAmount] = useState(10000);
  const [sipReturn, setSipReturn] = useState(12);
  const [sipYears, setSipYears] = useState(10);

  const [lumpAmount, setLumpAmount] = useState(100000);
  const [lumpReturn, setLumpReturn] = useState(10);
  const [lumpYears, setLumpYears] = useState(10);

  const [inflAmount, setInflAmount] = useState(50000);
  const [inflRate, setInflRate] = useState(6);
  const [inflYears, setInflYears] = useState(20);

  const [retCurrent, setRetCurrent] = useState(30);
  const [retAge, setRetAge] = useState(60);
  const [retMonthly, setRetMonthly] = useState(15000);
  const [retReturn, setRetReturn] = useState(10);
  const [retExpense, setRetExpense] = useState(50000);

  const emiResult = useMemo(() => {
    const emi = calculateEMI(emiPrincipal, emiRate, emiTenure);
    const totalInterest = calculateTotalInterest(emiPrincipal, emi, emiTenure);
    const totalPayable = emi * emiTenure;
    return { emi, totalInterest, totalPayable };
  }, [emiPrincipal, emiRate, emiTenure]);

  const sipResult = useMemo(() => {
    const fv = calculateSIPFutureValue(sipAmount, sipReturn, sipYears);
    const invested = sipAmount * sipYears * 12;
    return { fv, invested, gains: fv - invested };
  }, [sipAmount, sipReturn, sipYears]);

  const sipData = useMemo(() => {
    const monthlyRate = sipReturn / 12 / 100;
    const data: { year: number; value: number; invested: number }[] = [];
    let value = 0;
    let invested = 0;
    data.push({ year: 0, value: 0, invested: 0 });
    for (let year = 1; year <= sipYears; year++) {
      for (let m = 1; m <= 12; m++) {
        value = value * (1 + monthlyRate) + sipAmount;
        invested += sipAmount;
      }
      data.push({ year, value: Math.round(value), invested: Math.round(invested) });
    }
    return data;
  }, [sipAmount, sipReturn, sipYears]);

  const lumpResult = useMemo(() => {
    const fv = calculateLumpSumFutureValue(lumpAmount, lumpReturn, lumpYears);
    return { fv, gains: fv - lumpAmount };
  }, [lumpAmount, lumpReturn, lumpYears]);

  const lumpData = useMemo(() => {
    const data: { year: number; value: number }[] = [];
    for (let y = 0; y <= lumpYears; y++) {
      data.push({ year: y, value: Math.round(calculateLumpSumFutureValue(lumpAmount, lumpReturn, y)) });
    }
    return data;
  }, [lumpAmount, lumpReturn, lumpYears]);

  const inflResult = useMemo(() => {
    const futureValue = calculateInflationImpact(inflAmount, inflRate, inflYears);
    const yearlyBreakdown: { year: number; value: number }[] = [];
    for (let y = 0; y <= inflYears; y++) {
      yearlyBreakdown.push({ year: y, value: Math.round(calculateInflationImpact(inflAmount, inflRate, y)) });
    }
    return { futureValue, yearlyBreakdown };
  }, [inflAmount, inflRate, inflYears]);

  const retResult = useMemo(() => {
    const years = retAge - retCurrent;
    const fv = calculateFutureValueSeries(0, retMonthly, retReturn, years);
    const totalInvested = retMonthly * years * 12;
    const finalValue = fv[fv.length - 1]?.value ?? 0;
    const yearsOfRetirement = finalValue / (retExpense * 12);
    return { finalValue, totalInvested, gains: finalValue - totalInvested, yearsOfRetirement };
  }, [retCurrent, retAge, retMonthly, retReturn, retExpense]);

  const retData = useMemo(() => {
    const years = retAge - retCurrent;
    return calculateFutureValueSeries(0, retMonthly, retReturn, years);
  }, [retCurrent, retAge, retMonthly, retReturn]);

  const tooltipStyle = { backgroundColor: 'rgb(var(--color-surface))', border: '1px solid rgb(var(--color-border))', borderRadius: '12px' };

  return (
    <div className="space-y-5">
      {/* Calc tabs */}
      <div className="flex flex-wrap gap-2">
        {CALC_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveCalc(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeCalc === tab.id
                ? 'gradient-primary shadow-sm'
                : 'glass text-muted hover:text-base-color hover:bg-surface-2'
            }`}
          >
            <tab.icon size={16} strokeWidth={1.5} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* EMI Calculator */}
      {activeCalc === 'emi' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          <SectionCard title="EMI Calculator" icon={<Home size={18} strokeWidth={1.5} />} delay="stagger-1">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-muted">Loan Amount</label>
                  <span className="text-sm font-semibold text-base-color">{formatCurrency(emiPrincipal)}</span>
                </div>
                <input type="range" min="10000" max="10000000" step="10000" value={emiPrincipal}
                  onChange={(e) => setEmiPrincipal(Number(e.target.value))}
                  className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-muted">Interest Rate (%)</label>
                  <span className="text-sm font-semibold text-base-color">{emiRate}%</span>
                </div>
                <input type="range" min="0.5" max="30" step="0.1" value={emiRate}
                  onChange={(e) => setEmiRate(Number(e.target.value))}
                  className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-muted">Tenure (months)</label>
                  <span className="text-sm font-semibold text-base-color">{emiTenure} months</span>
                </div>
                <input type="range" min="3" max="360" step="1" value={emiTenure}
                  onChange={(e) => setEmiTenure(Number(e.target.value))}
                  className="w-full accent-primary" />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="EMI Results" icon={<Calculator size={18} strokeWidth={1.5} />} delay="stagger-2">
            <div className="space-y-4">
              <div className="p-5 rounded-2xl gradient-primary text-center">
                <p className="text-sm opacity-80">Monthly EMI</p>
                <p className="text-3xl font-serif">{formatCurrency(emiResult.emi)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-surface-2 text-center">
                  <p className="text-xs text-muted">Total Interest</p>
                  <p className="text-lg font-serif text-base-color">{formatCurrency(emiResult.totalInterest)}</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-2 text-center">
                  <p className="text-xs text-muted">Total Payable</p>
                  <p className="text-lg font-serif text-base-color">{formatCurrency(emiResult.totalPayable)}</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface-2">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted">Principal</span>
                  <span className="font-semibold text-base-color">{formatCurrency(emiPrincipal)}</span>
                </div>
                <div className="flex h-4 rounded-full overflow-hidden">
                  <div className="gradient-primary" style={{ width: `${(emiPrincipal / emiResult.totalPayable) * 100}%` }} />
                  <div className="gradient-error" style={{ width: `${(emiResult.totalInterest / emiResult.totalPayable) * 100}%` }} />
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span className="text-primary">Principal {((emiPrincipal / emiResult.totalPayable) * 100).toFixed(0)}%</span>
                  <span className="text-base-color">Interest {((emiResult.totalInterest / emiResult.totalPayable) * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </SectionCard>
        </div>
      )}

      {/* SIP Calculator */}
      {activeCalc === 'sip' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          <SectionCard title="SIP Calculator" icon={<TrendingUp size={18} strokeWidth={1.5} />} delay="stagger-1">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-muted">Monthly Investment</label>
                  <span className="text-sm font-semibold text-base-color">{formatCurrency(sipAmount)}</span>
                </div>
                <input type="range" min="500" max="200000" step="500" value={sipAmount}
                  onChange={(e) => setSipAmount(Number(e.target.value))}
                  className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-muted">Expected Return (% p.a.)</label>
                  <span className="text-sm font-semibold text-base-color">{sipReturn}%</span>
                </div>
                <input type="range" min="1" max="30" step="0.5" value={sipReturn}
                  onChange={(e) => setSipReturn(Number(e.target.value))}
                  className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-muted">Time Period (years)</label>
                  <span className="text-sm font-semibold text-base-color">{sipYears} years</span>
                </div>
                <input type="range" min="1" max="40" step="1" value={sipYears}
                  onChange={(e) => setSipYears(Number(e.target.value))}
                  className="w-full accent-primary" />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="SIP Results" icon={<Calculator size={18} strokeWidth={1.5} />} delay="stagger-2">
            <div className="space-y-4">
              <div className="p-5 rounded-2xl gradient-accent text-center">
                <p className="text-sm opacity-80">Future Value</p>
                <p className="text-3xl font-serif">{formatCurrency(sipResult.fv)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-surface-2 text-center">
                  <p className="text-xs text-muted">Total Invested</p>
                  <p className="text-lg font-serif text-base-color">{formatCurrency(sipResult.invested)}</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-2 text-center">
                  <p className="text-xs text-muted">Estimated Gains</p>
                  <p className="text-lg font-serif text-base-color">{formatCurrency(sipResult.gains)}</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={sipData}>
                  <defs>
                    <linearGradient id="sipValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1a1a1a" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#1a1a1a" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="sipInv" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a0a0a0" stopOpacity={0.12} />
                      <stop offset="100%" stopColor="#a0a0a0" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" />
                  <XAxis dataKey="year" stroke="rgb(var(--color-text-muted))" fontSize={11} />
                  <YAxis stroke="rgb(var(--color-text-muted))" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="invested" stroke="#a0a0a0" strokeWidth={2} fill="url(#sipInv)" />
                  <Area type="monotone" dataKey="value" stroke="#1a1a1a" strokeWidth={2} fill="url(#sipValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Lump Sum Calculator */}
      {activeCalc === 'lumpsum' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          <SectionCard title="Lump Sum Calculator" icon={<PiggyBank size={18} strokeWidth={1.5} />} delay="stagger-1">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-muted">Investment Amount</label>
                  <span className="text-sm font-semibold text-base-color">{formatCurrency(lumpAmount)}</span>
                </div>
                <input type="range" min="1000" max="5000000" step="1000" value={lumpAmount}
                  onChange={(e) => setLumpAmount(Number(e.target.value))}
                  className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-muted">Expected Return (% p.a.)</label>
                  <span className="text-sm font-semibold text-base-color">{lumpReturn}%</span>
                </div>
                <input type="range" min="1" max="30" step="0.5" value={lumpReturn}
                  onChange={(e) => setLumpReturn(Number(e.target.value))}
                  className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-muted">Time Period (years)</label>
                  <span className="text-sm font-semibold text-base-color">{lumpYears} years</span>
                </div>
                <input type="range" min="1" max="40" step="1" value={lumpYears}
                  onChange={(e) => setLumpYears(Number(e.target.value))}
                  className="w-full accent-primary" />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Lump Sum Results" icon={<Calculator size={18} strokeWidth={1.5} />} delay="stagger-2">
            <div className="space-y-4">
              <div className="p-5 rounded-2xl gradient-accent text-center">
                <p className="text-sm opacity-80">Future Value</p>
                <p className="text-3xl font-serif">{formatCurrency(lumpResult.fv)}</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-surface-2 text-center">
                  <p className="text-xs text-muted">Invested</p>
                  <p className="text-lg font-serif text-base-color">{formatCurrency(lumpAmount)}</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-2 text-center">
                  <p className="text-xs text-muted">Gains</p>
                  <p className="text-lg font-serif text-base-color">{formatCurrency(lumpResult.gains)}</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={lumpData}>
                  <defs>
                    <linearGradient id="lumpGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1a1a1a" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#1a1a1a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" />
                  <XAxis dataKey="year" stroke="rgb(var(--color-text-muted))" fontSize={11} />
                  <YAxis stroke="rgb(var(--color-text-muted))" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="value" stroke="#1a1a1a" strokeWidth={2} fill="url(#lumpGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Inflation Calculator */}
      {activeCalc === 'inflation' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          <SectionCard title="Inflation Impact Calculator" icon={<Percent size={18} strokeWidth={1.5} />} delay="stagger-1">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-muted">Current Amount</label>
                  <span className="text-sm font-semibold text-base-color">{formatCurrency(inflAmount)}</span>
                </div>
                <input type="range" min="1000" max="1000000" step="1000" value={inflAmount}
                  onChange={(e) => setInflAmount(Number(e.target.value))}
                  className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-muted">Inflation Rate (% p.a.)</label>
                  <span className="text-sm font-semibold text-base-color">{inflRate}%</span>
                </div>
                <input type="range" min="1" max="20" step="0.1" value={inflRate}
                  onChange={(e) => setInflRate(Number(e.target.value))}
                  className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-muted">Time Period (years)</label>
                  <span className="text-sm font-semibold text-base-color">{inflYears} years</span>
                </div>
                <input type="range" min="1" max="40" step="1" value={inflYears}
                  onChange={(e) => setInflYears(Number(e.target.value))}
                  className="w-full accent-primary" />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Inflation Results" icon={<Calculator size={18} strokeWidth={1.5} />} delay="stagger-2">
            <div className="space-y-4">
              <div className="p-5 rounded-2xl gradient-warning text-center">
                <p className="text-sm opacity-80">Future Cost in {inflYears} years</p>
                <p className="text-3xl font-serif">{formatCurrency(inflResult.futureValue)}</p>
              </div>
              <div className="p-4 rounded-xl bg-surface-2">
                <p className="text-sm text-muted mb-1">Impact</p>
                <p className="text-sm text-base-color">
                  What costs <span className="font-semibold">{formatCurrency(inflAmount)}</span> today will cost{' '}
                  <span className="font-semibold text-base-color">{formatCurrency(inflResult.futureValue)}</span> in {inflYears} years
                  due to {inflRate}% annual inflation.
                </p>
                <p className="text-xs text-muted mt-2">
                  That's a <span className="font-semibold text-base-color">{((inflResult.futureValue / inflAmount - 1) * 100).toFixed(0)}%</span> increase
                </p>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={inflResult.yearlyBreakdown}>
                  <defs>
                    <linearGradient id="inflGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#78767a" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#78767a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" />
                  <XAxis dataKey="year" stroke="rgb(var(--color-text-muted))" fontSize={11} />
                  <YAxis stroke="rgb(var(--color-text-muted))" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="value" stroke="#78767a" strokeWidth={2} fill="url(#inflGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
      )}

      {/* Retirement Calculator */}
      {activeCalc === 'retirement' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-5">
          <SectionCard title="Retirement Calculator" icon={<IndianRupee size={18} strokeWidth={1.5} />} delay="stagger-1">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Input label="Current Age" type="number" value={retCurrent} onChange={(e) => setRetCurrent(Number(e.target.value))} />
                <Input label="Retirement Age" type="number" value={retAge} onChange={(e) => setRetAge(Number(e.target.value))} />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-muted">Monthly Investment</label>
                  <span className="text-sm font-semibold text-base-color">{formatCurrency(retMonthly)}</span>
                </div>
                <input type="range" min="500" max="200000" step="500" value={retMonthly}
                  onChange={(e) => setRetMonthly(Number(e.target.value))}
                  className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-muted">Expected Return (% p.a.)</label>
                  <span className="text-sm font-semibold text-base-color">{retReturn}%</span>
                </div>
                <input type="range" min="1" max="20" step="0.5" value={retReturn}
                  onChange={(e) => setRetReturn(Number(e.target.value))}
                  className="w-full accent-primary" />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-sm text-muted">Monthly Expenses (retirement)</label>
                  <span className="text-sm font-semibold text-base-color">{formatCurrency(retExpense)}</span>
                </div>
                <input type="range" min="5000" max="500000" step="1000" value={retExpense}
                  onChange={(e) => setRetExpense(Number(e.target.value))}
                  className="w-full accent-primary" />
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Retirement Corpus" icon={<Calculator size={18} strokeWidth={1.5} />} delay="stagger-2">
            <div className="space-y-4">
              <div className="p-5 rounded-2xl gradient-primary text-center">
                <p className="text-sm opacity-80">Retirement Corpus</p>
                <p className="text-3xl font-serif">{formatCurrency(retResult.finalValue)}</p>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-surface-2 text-center">
                  <p className="text-xs text-muted">Invested</p>
                  <p className="text-sm font-serif text-base-color">{formatCurrency(retResult.totalInvested)}</p>
                </div>
                <div className="p-3 rounded-xl bg-surface-2 text-center">
                  <p className="text-xs text-muted">Gains</p>
                  <p className="text-sm font-serif text-base-color">{formatCurrency(retResult.gains)}</p>
                </div>
                <div className="p-3 rounded-xl bg-surface-2 text-center">
                  <p className="text-xs text-muted">Years of Income</p>
                  <p className="text-sm font-serif text-base-color">{retResult.yearsOfRetirement.toFixed(1)}</p>
                </div>
              </div>
              <ResponsiveContainer width="100%" height={150}>
                <AreaChart data={retData}>
                  <defs>
                    <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1a1a1a" stopOpacity={0.15} />
                      <stop offset="100%" stopColor="#1a1a1a" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgb(var(--color-border))" />
                  <XAxis dataKey="year" stroke="rgb(var(--color-text-muted))" fontSize={11} />
                  <YAxis stroke="rgb(var(--color-text-muted))" fontSize={11} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Area type="monotone" dataKey="value" stroke="#1a1a1a" strokeWidth={2} fill="url(#retGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </div>
      )}
    </div>
  );
}
