import React, { useState } from 'react';
import { Mic, Mail, ArrowRight, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage, LanguageSelector } from '../../context/LanguageContext';

interface ForgotPasswordPageProps {
  onNavigate: (route: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigate }) => {
  const { forgotPassword } = useAuth();
  const { t } = useLanguage();

  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setError(null);
    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#080C15] flex flex-col justify-center py-12 sm:px-6 lg:px-8 selection:bg-cyan-500/30 relative">
      <div className="absolute top-5 right-6 z-10 flex items-center gap-3">
        <LanguageSelector />
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center justify-center gap-2.5 mx-auto focus:outline-none"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Mic className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-white">
            Aura<span className="text-cyan-400">Voice</span>
          </span>
        </button>

        <h2 className="mt-6 text-center text-2xl sm:text-3xl font-bold tracking-tight text-white">
          {t('auth.resetPasswordTitle', 'Reset Your Password')}
        </h2>
        <p className="mt-2 text-center text-xs sm:text-sm text-slate-400">
          {t('auth.resetPasswordDesc', 'Enter your registered email address to receive a secure password recovery link.')}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-slate-900/90 py-8 px-6 sm:px-10 shadow-2xl rounded-2xl border border-slate-800 space-y-6">
          {submitted ? (
            <div className="text-center space-y-4 py-2">
              <div className="w-12 h-12 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white">{t('auth.checkInbox', 'Check Your Inbox')}</h3>
              <p className="text-sm text-slate-300">
                {t('auth.resetLinkSent', 'We have dispatched a password reset link to your email address.')} (<strong>{email}</strong>)
              </p>
              <div className="pt-4 space-y-2">
                <button
                  type="button"
                  onClick={() => setSubmitted(false)}
                  className="w-full py-2.5 px-4 rounded-xl font-medium text-cyan-400 bg-slate-950 hover:bg-slate-800 border border-slate-800 transition-colors text-xs"
                >
                  Resend Reset Link
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/login')}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-white bg-slate-800 hover:bg-slate-700 transition-colors text-xs flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('auth.backToLogin', 'Back to Login')}</span>
                </button>
              </div>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="p-3 rounded-lg bg-red-950/60 border border-red-800/80 text-red-200 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  {t('auth.email', 'Work Email Address')}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@enterprise.com"
                    className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs sm:text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all text-sm disabled:opacity-50"
              >
                {loading ? (
                  <span>Sending Link...</span>
                ) : (
                  <>
                    <span>{t('auth.sendResetLink', 'Send Reset Link')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => onNavigate('/login')}
                  className="text-xs text-slate-400 hover:text-slate-200 transition-colors inline-flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>{t('auth.backToLogin', 'Back to Login')}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
