import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Session, User } from '@/lib/api';
import { api } from '@/lib/api';
import type { Profile } from '@/types/finance';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  resetPassword: (email: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  async function loadProfile(userId: string) {
    try {
      const { data, error } = await api
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const { data: newProfile, error: insertError } = await api
          .from('profiles')
          .insert({ user_id: userId })
          .select()
          .single();

        if (insertError) throw insertError;
        setProfile(newProfile as Profile | null);
      } else {
        setProfile(data as Profile);
      }
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let mounted = true;

    api.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      if (data.session) {
        loadProfile(data.session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: authListener } = api.auth.onAuthStateChange((event, newSession) => {
      if (!mounted) return;
      setSession(newSession);
      if (newSession) {
        loadProfile(newSession.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function refreshProfile() {
    if (session) {
      await loadProfile(session.user.id);
    }
  }

  async function signUp(email: string, password: string, fullName: string) {
    const { data, error } = await api.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return { error: error.message };
    if (data.user && !data.session) {
      return { error: 'Check your email for a confirmation link to complete your signup.' };
    }
    return { error: null };
  }

  async function signIn(email: string, password: string) {
    const { error } = await api.auth.signInWithPassword({ email, password });
    return { error: error?.message ?? null };
  }

  async function resetPassword(email: string) {
    const { error } = await api.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    return { error: error?.message ?? null };
  }

  async function signOut() {
    await api.auth.signOut();
    setProfile(null);
  }

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        profile,
        loading,
        signUp,
        signIn,
        resetPassword,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
