import React, { useState, useEffect } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { SignupPage } from './pages/auth/SignupPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';
import { DashboardLayout } from './components/dashboard/DashboardLayout';

function AppRouter() {
  const { user, loading } = useAuth();
  const [currentPath, setCurrentPath] = useState<string>(() => window.location.pathname || '/');

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path: string) => {
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo(0, 0);
  };

  // Check URL parameters for Supabase email recovery tokens (#access_token=...&type=recovery)
  useEffect(() => {
    if (window.location.hash.includes('type=recovery')) {
      navigate('/reset-password');
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080C15] flex items-center justify-center text-slate-400 font-mono text-xs">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Initializing AuraVoice Platform...</span>
        </div>
      </div>
    );
  }

  // Route routing
  if (currentPath === '/signup') {
    return <SignupPage onNavigate={navigate} />;
  }

  if (currentPath === '/login') {
    return <LoginPage onNavigate={navigate} />;
  }

  if (currentPath === '/forgot-password') {
    return <ForgotPasswordPage onNavigate={navigate} />;
  }

  if (currentPath === '/reset-password') {
    return <ResetPasswordPage onNavigate={navigate} />;
  }

  if (currentPath === '/dashboard') {
    if (!user) {
      return <LoginPage onNavigate={navigate} />;
    }
    return <DashboardLayout onNavigate={navigate} />;
  }

  // Default to Public Landing Page as required
  return <LandingPage onNavigate={navigate} />;
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <DataProvider>
          <AppRouter />
        </DataProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
