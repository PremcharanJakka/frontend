import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import type {
  Expense, Debt, EmergencyFund, Insurance, Investment, Goal, IncomeSource, Profile,
} from '@/types/finance';

export interface FinanceData {
  expenses: Expense[];
  debts: Debt[];
  emergencyFund: EmergencyFund | null;
  insurance: Insurance[];
  investments: Investment[];
  goals: Goal[];
  incomeSources: IncomeSource[];
  profile: Profile | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

export function useFinanceData(): FinanceData {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [emergencyFund, setEmergencyFund] = useState<EmergencyFund | null>(null);
  const [insurance, setInsurance] = useState<Insurance[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [incomeSources, setIncomeSources] = useState<IncomeSource[]>([]);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    setLoading(true);

    const [
      expensesRes, debtsRes, emergencyRes, insuranceRes,
      investmentsRes, goalsRes, incomeRes, profileRes,
    ] = await Promise.all([
      api.from('expenses').select('*').order('date', { ascending: false }),
      api.from('debts').select('*').order('created_at', { ascending: false }),
      api.from('emergency_fund').select('*').eq('user_id', user.id).maybeSingle(),
      api.from('insurance').select('*').order('created_at', { ascending: false }),
      api.from('investments').select('*').order('created_at', { ascending: false }),
      api.from('goals').select('*').order('created_at', { ascending: false }),
      api.from('income_sources').select('*').order('created_at', { ascending: false }),
      api.from('profiles').select('*').eq('user_id', user.id).maybeSingle(),
    ]);

    setExpenses((expensesRes.data as Expense[]) ?? []);
    setDebts((debtsRes.data as Debt[]) ?? []);
    setEmergencyFund((emergencyRes.data as EmergencyFund) ?? null);
    setInsurance((insuranceRes.data as Insurance[]) ?? []);
    setInvestments((investmentsRes.data as Investment[]) ?? []);
    setGoals((goalsRes.data as Goal[]) ?? []);
    setIncomeSources((incomeRes.data as IncomeSource[]) ?? []);
    setProfile((profileRes.data as Profile) ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    expenses, debts, emergencyFund, insurance, investments,
    goals, incomeSources, profile, loading, refresh,
  };
}
