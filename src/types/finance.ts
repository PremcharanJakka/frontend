export type ExpenseType = 'expense' | 'income';

export interface Expense {
  id: string;
  user_id: string;
  amount: number;
  category: string;
  description: string;
  date: string;
  type: ExpenseType;
  created_at: string;
}

export type DebtType = 'home' | 'car' | 'personal' | 'education' | 'credit_card' | 'other';

export interface Debt {
  id: string;
  user_id: string;
  name: string;
  type: DebtType;
  principal: number;
  interest_rate: number;
  tenure_months: number;
  emi_amount: number;
  remaining_balance: number;
  start_date: string;
  created_at: string;
}

export interface EmergencyFund {
  id: string;
  user_id: string;
  target_months: number;
  current_corpus: number;
  monthly_expenses: number;
  created_at: string;
  updated_at: string;
}

export type InsuranceType = 'life' | 'health' | 'auto' | 'home' | 'travel' | 'other';
export type PremiumFrequency = 'monthly' | 'quarterly' | 'half-yearly' | 'yearly';

export interface Insurance {
  id: string;
  user_id: string;
  name: string;
  type: InsuranceType;
  coverage_amount: number;
  premium_amount: number;
  premium_frequency: PremiumFrequency;
  start_date: string;
  maturity_date: string | null;
  notes: string;
  created_at: string;
}

export type InvestmentType = 'mutual_fund' | 'stock' | 'bond' | 'fd' | 'rd' | 'gold' | 'real_estate' | 'crypto' | 'ppf' | 'nps' | 'other';

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  type: InvestmentType;
  invested_amount: number;
  current_value: number;
  expected_return: number;
  start_date: string;
  notes: string;
  created_at: string;
}

export type GoalCategory = 'general' | 'retirement' | 'home' | 'education' | 'travel' | 'wedding' | 'car' | 'emergency' | 'other';

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string | null;
  category: GoalCategory;
  color: string;
  created_at: string;
}

export type IncomeFrequency = 'weekly' | 'bi-weekly' | 'monthly' | 'yearly';

export interface IncomeSource {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  frequency: IncomeFrequency;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  monthly_income: number;
  currency: string;
  risk_tolerance: 'conservative' | 'moderate' | 'aggressive';
  created_at: string;
  updated_at: string;
}

export interface FirePlan {
  id: string;
  user_id: string;
  current_age: number;
  target_fire_age: number;
  annual_income: number;
  salary_growth_rate: number;
  annual_expenses: number;
  current_investments: number;
  expected_return: number;
  withdrawal_rate: number;
  inflation_rate: number;
  created_at: string;
  updated_at: string;
}

export interface BudgetPlan {
  id: string;
  user_id: string;
  salary: number;
  additional_income: number;
  housing: number;
  loans_emis: number;
  utilities: number;
  food: number;
  education: number;
  insurance: number;
  investments: number;
  savings: number;
  other: number;
  created_at: string;
  updated_at: string;
}

export interface FamilyContact {
  name: string;
  relation: string;
  phone: string;
  email: string;
  address: string;
}

export interface FamilyInsurancePolicy {
  name: string;
  type: string;
  policy_number: string;
  provider: string;
  coverage: string;
  premium: string;
  nominee: string;
  notes: string;
}

export interface FamilyBankDetail {
  bank_name: string;
  account_type: string;
  account_number: string;
  branch: string;
  ifsc_code: string;
  nominee: string;
}

export interface FamilyInvestmentDetail {
  type: string;
  provider: string;
  account_number: string;
  amount: string;
  nominee: string;
  notes: string;
}

export interface FamilyPropertyInfo {
  name: string;
  type: string;
  address: string;
  value: string;
  owner: string;
  documents_location: string;
}

export interface FamilyDocument {
  name: string;
  type: string;
  location: string;
  holder: string;
  notes: string;
}

export interface FamilyIdentityDetail {
  name: string;
  type: string;
  number: string;
  issue_date: string;
  location: string;
}

export interface FamilyLiability {
  name: string;
  type: string;
  amount: string;
  lender: string;
  outstanding: string;
  notes: string;
}

export interface FamilyWillInfo {
  registered: boolean;
  location: string;
  registration_number: string;
  executor_name: string;
  executor_contact: string;
  witnesses: string;
  notes: string;
}

export interface FamilyPowerOfAttorney {
  type: string;
  holder_name: string;
  holder_contact: string;
  registration_date: string;
  notes: string;
}

export interface FamilyEmergencyInfo {
  blood_group: string;
  allergies: string;
  medications: string;
  medical_conditions: string;
  doctor_name: string;
  doctor_phone: string;
  hospital: string;
  emergency_contact: string;
  notes: string;
}

export interface FamilyDigitalAccount {
  platform: string;
  username: string;
  recovery_email: string;
  credentials_location: string;
  notes: string;
}

export interface FamilyImportantDate {
  title: string;
  date: string;
  person: string;
  type: string;
  notes: string;
}

export interface FamilyFuneralWishes {
  preferences: string;
  burial_cremation: string;
  location: string;
  fund_allocated: string;
  notes: string;
}

export interface FamilyTreeMember {
  name: string;
  relation: string;
  dob: string;
  phone: string;
  email: string;
  notes: string;
}

export interface FamilyInfo {
  id: string;
  user_id: string;
  emergency_contacts: FamilyContact[];
  insurance_policies: FamilyInsurancePolicy[];
  bank_details: FamilyBankDetail[];
  investment_details: FamilyInvestmentDetail[];
  property_info: FamilyPropertyInfo[];
  documents: FamilyDocument[];
  identity_details: FamilyIdentityDetail[];
  liabilities: FamilyLiability[];
  will_info: FamilyWillInfo;
  power_of_attorney: FamilyPowerOfAttorney;
  emergency_info: FamilyEmergencyInfo;
  digital_accounts: FamilyDigitalAccount[];
  important_dates: FamilyImportantDate[];
  funeral_wishes: FamilyFuneralWishes;
  family_tree: FamilyTreeMember[];
  created_at: string;
  updated_at: string;
}
