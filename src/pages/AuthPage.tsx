import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AnimatedBackground } from '@/components/ui/AnimatedBackground';
import {
  Wallet, Mail, Lock, User, Eye, EyeOff, Moon, Sun,
  TrendingUp, Shield, PiggyBank, Target, ArrowRight, KeyRound, Info,
} from 'lucide-react';

export function AuthPage() {
  const { signIn, signUp, resetPassword } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (mode === 'forgot') {
      const result = await resetPassword(email);
      setLoading(false);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess('Password reset link sent! Check your email inbox.');
      }
      return;
    }

    const result =
      mode === 'login'
        ? await signIn(email, password)
        : await signUp(email, password, fullName);
    setLoading(false);
    if (result.error) {
      setError(result.error);
    }
  }

  function switchMode(newMode: 'login' | 'signup') {
    setMode(newMode);
    setError(null);
    setSuccess(null);
  }

  return (
    <div className="min-h-screen bg-app flex">
      <AnimatedBackground />

      {/* Theme toggle */}
      <button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-2.5 rounded-xl glass hover:bg-surface-2 transition-colors"
      >
        {theme === 'dark' ? <Sun size={18} strokeWidth={1.5} className="text-base-color" /> : <Moon size={18} strokeWidth={1.5} className="text-base-color" />}
      </button>

      {/* Left panel — Obsidian-style branding */}
      <div className="hidden lg:flex flex-col w-1/2 relative overflow-hidden bg-sidebar">
        <div className="absolute inset-0 opacity-[0.04]">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative z-10 flex flex-col justify-between p-12 text-sidebar h-full">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-sidebar-surface">
              <Wallet size={26} strokeWidth={1.5} />
            </div>
            <span className="text-2xl font-serif">FinPath</span>
          </div>

          <div className="space-y-8">
            <h1 className="text-5xl font-serif leading-tight">
              Master Your Money.<br />Achieve Financial Freedom.
            </h1>
            <p className="text-base text-sidebar-muted max-w-md leading-relaxed">
              Track expenses, manage debts, plan investments, and build a personalized
              roadmap to financial independence.
            </p>
            <div className="grid grid-cols-2 gap-3 max-w-md">
              {[
                { icon: TrendingUp, label: 'Expense Tracking' },
                { icon: Shield, label: 'Debt Analysis' },
                { icon: PiggyBank, label: 'Emergency Fund' },
                { icon: Target, label: 'Financial Goals' },
              ].map((feat) => (
                <div
                  key={feat.label}
                  className="flex items-center gap-2.5 p-3 rounded-xl bg-sidebar-surface hover:bg-sidebar-border transition-colors animate-slide-up"
                >
                  <feat.icon size={18} strokeWidth={1.5} className="text-sidebar-muted" />
                  <span className="text-sm font-medium text-sidebar">{feat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-sm text-sidebar-muted">
            Your data is encrypted and secured. We never share your financial information.
          </p>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="p-2.5 rounded-xl gradient-primary">
              <Wallet size={22} strokeWidth={1.5} />
            </div>
            <span className="text-2xl font-serif text-base-color">FinPath</span>
          </div>

          <div className="glass-card p-8 animate-scale-in">
            {mode === 'forgot' ? (
              <>
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 rounded-xl gradient-primary">
                    <KeyRound size={20} strokeWidth={1.5} />
                  </div>
                  <h2 className="text-2xl font-serif text-base-color">Reset Password</h2>
                </div>
                <p className="text-sm text-muted mb-6">
                  Enter your email and we'll send you a link to reset your password.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-serif text-base-color mb-1">
                  {mode === 'login' ? 'Welcome Back' : 'Create Account'}
                </h2>
                <p className="text-sm text-muted mb-6">
                  {mode === 'login'
                    ? 'Sign in to manage your finances'
                    : 'Start your journey to financial freedom'}
                </p>
              </>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div className="relative">
                  <User className="absolute left-3.5 top-[38px] text-muted pointer-events-none" size={16} strokeWidth={1.5} />
                  <Input
                    label="Full Name"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="pl-10"
                  />
                </div>
              )}

              <div className="relative">
                <Mail className="absolute left-3.5 top-[38px] text-muted pointer-events-none" size={16} strokeWidth={1.5} />
                <Input
                  label="Email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="pl-10"
                />
              </div>

              {mode !== 'forgot' && (
                <div className="relative">
                  <Lock className="absolute left-3.5 top-[38px] text-muted pointer-events-none" size={16} strokeWidth={1.5} />
                  <Input
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="pl-10 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-[38px] text-muted hover:text-base-color"
                  >
                    {showPassword ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
                  </button>
                </div>
              )}

              {mode === 'login' && (
                <div className="flex items-center justify-between text-sm">
                  <button
                    type="button"
                    onClick={() => setShowHint(!showHint)}
                    className="flex items-center gap-1 text-muted hover:text-primary transition-colors"
                  >
                    <Info size={14} strokeWidth={1.5} />
                    Need a hint?
                  </button>
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setError(null); setSuccess(null); }}
                    className="text-primary font-medium hover:underline transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {mode === 'login' && showHint && (
                <div className="p-3 rounded-xl bg-surface-2 border border-base text-sm text-muted animate-fade-in space-y-1.5">
                  <p className="font-semibold text-base-color flex items-center gap-1.5">
                    <KeyRound size={14} strokeWidth={1.5} className="text-primary" /> Password Requirements
                  </p>
                  <ul className="space-y-1 pl-5 list-disc">
                    <li>Minimum 6 characters long</li>
                    <li>Try mixing letters, numbers, and symbols</li>
                    <li>Check your inbox for the original sign-up email</li>
                    <li>Use "Forgot password?" to get a reset link</li>
                  </ul>
                </div>
              )}

              {success && (
                <div className="p-3 rounded-xl bg-surface-2 border border-base text-base-color text-sm animate-fade-in">
                  {success}
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-surface-2 border border-base text-base-color text-sm animate-fade-in">
                  {error}
                </div>
              )}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading
                  ? 'Please wait...'
                  : mode === 'login'
                    ? 'Sign In'
                    : mode === 'signup'
                      ? 'Create Account'
                      : 'Send Reset Link'}
                {!loading && <ArrowRight size={16} strokeWidth={1.5} />}
              </Button>
            </form>

            {mode === 'forgot' ? (
              <div className="mt-6 text-center">
                <button
                  onClick={() => switchMode('login')}
                  className="text-sm text-muted hover:text-primary transition-colors"
                >
                  Back to <span className="text-primary font-semibold underline">Sign in</span>
                </button>
              </div>
            ) : (
              <div className="mt-6 text-center">
                <button
                  onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
                  className="text-sm text-muted hover:text-primary transition-colors"
                >
                  {mode === 'login'
                    ? "Don't have an account? "
                    : 'Already have an account? '}
                  <span className="text-primary font-semibold underline">
                    {mode === 'login' ? 'Sign up' : 'Sign in'}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
