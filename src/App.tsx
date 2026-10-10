import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthPage } from '@/pages/AuthPage';
import { AppShell } from '@/components/layout/AppShell';
import { Loader2 } from 'lucide-react';

function Root() {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-app flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} strokeWidth={1.5} />
      </div>
    );
  }

  return session ? <AppShell /> : <AuthPage />;
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Root />
      </AuthProvider>
    </ThemeProvider>
  );
}
