// Financial calculation utilities

export function calculateEMI(principal: number, annualRate: number, tenureMonths: number): number {
  if (principal <= 0 || tenureMonths <= 0) return 0;
  if (annualRate === 0) return principal / tenureMonths;
  const monthlyRate = annualRate / 12 / 100;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenureMonths)) /
    (Math.pow(1 + monthlyRate, tenureMonths) - 1);
  return emi;
}

export function calculateTotalInterest(principal: number, emi: number, tenureMonths: number): number {
  return emi * tenureMonths - principal;
}

export interface AmortizationRow {
  month: number;
  emi: number;
  interest: number;
  principal: number;
  balance: number;
}

export function generateAmortization(
  principal: number,
  annualRate: number,
  tenureMonths: number,
): AmortizationRow[] {
  const emi = calculateEMI(principal, annualRate, tenureMonths);
  const monthlyRate = annualRate / 12 / 100;
  let balance = principal;
  const rows: AmortizationRow[] = [];

  for (let month = 1; month <= tenureMonths; month++) {
    const interest = balance * monthlyRate;
    const principalPart = emi - interest;
    balance = Math.max(0, balance - principalPart);
    rows.push({ month, emi, interest, principal: principalPart, balance });
  }
  return rows;
}

export function calculateSIPFutureValue(
  monthlyInvestment: number,
  annualReturn: number,
  years: number,
): number {
  if (monthlyInvestment <= 0 || years <= 0) return 0;
  const monthlyRate = annualReturn / 12 / 100;
  const months = years * 12;
  if (monthlyRate === 0) return monthlyInvestment * months;
  return monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
}

export function calculateLumpSumFutureValue(
  principal: number,
  annualReturn: number,
  years: number,
): number {
  if (principal <= 0 || years <= 0) return 0;
  return principal * Math.pow(1 + annualReturn / 100, years);
}

export function calculateInflationImpact(
  currentAmount: number,
  inflationRate: number,
  years: number,
): number {
  return currentAmount * Math.pow(1 + inflationRate / 100, years);
}

export function calculateFutureValueSeries(
  principal: number,
  monthlyContribution: number,
  annualReturn: number,
  years: number,
): { year: number; value: number; invested: number }[] {
  const monthlyRate = annualReturn / 12 / 100;
  const data: { year: number; value: number; invested: number }[] = [];
  let value = principal;
  let invested = principal;

  data.push({ year: 0, value: Math.round(value), invested: Math.round(invested) });

  for (let year = 1; year <= years; year++) {
    for (let month = 1; month <= 12; month++) {
      value = value * (1 + monthlyRate) + monthlyContribution;
      invested += monthlyContribution;
    }
    data.push({ year, value: Math.round(value), invested: Math.round(invested) });
  }
  return data;
}

export function calculateEmergencyFundTarget(monthlyExpenses: number, months: number): number {
  return monthlyExpenses * months;
}

export function calculateNetWorth(
  assets: { current_value?: number; invested_amount?: number; current_corpus?: number }[],
  debts: { remaining_balance: number }[],
): number {
  const totalAssets = assets.reduce(
    (sum, a) => sum + (a.current_value ?? a.current_corpus ?? a.invested_amount ?? 0),
    0,
  );
  const totalDebts = debts.reduce((sum, d) => sum + d.remaining_balance, 0);
  return totalAssets - totalDebts;
}

// Financial freedom stages based on passive income vs expenses
export interface FreedomStage {
  level: number;
  name: string;
  description: string;
  targetMultiple: number; // multiple of annual expenses
}

export const FREEDOM_STAGES: FreedomStage[] = [
  { level: 0, name: 'Dependent', description: 'Expenses exceed income, dependent on debt or others', targetMultiple: 0 },
  { level: 1, name: 'Solvent', description: 'Income covers expenses, not dependent on debt', targetMultiple: 0 },
  { level: 2, name: 'Stable', description: '6 months of expenses saved as emergency fund', targetMultiple: 0.5 },
  { level: 3, name: 'Secure', description: '2 years of expenses invested', targetMultiple: 2 },
  { level: 4, name: 'Independent', description: '5 years of expenses invested', targetMultiple: 5 },
  { level: 5, name: 'Freedom', description: '15 years of expenses invested (safe withdrawal)', targetMultiple: 15 },
  { level: 6, name: 'Abundance', description: '25+ years of expenses invested (FIRE)', targetMultiple: 25 },
];

export function getFreedomStage(netWorth: number, annualExpenses: number): FreedomStage {
  if (annualExpenses <= 0) return FREEDOM_STAGES[0];
  const multiple = netWorth / annualExpenses;
  let stage = FREEDOM_STAGES[0];
  for (const s of FREEDOM_STAGES) {
    if (multiple >= s.targetMultiple) stage = s;
  }
  return stage;
}

export function getNextFreedomStage(netWorth: number, annualExpenses: number): FreedomStage | null {
  if (annualExpenses <= 0) return FREEDOM_STAGES[1];
  const multiple = netWorth / annualExpenses;
  for (const s of FREEDOM_STAGES) {
    if (multiple < s.targetMultiple) return s;
  }
  return null;
}
