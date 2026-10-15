import React from 'react';
import { Mic, ArrowRight } from 'lucide-react';
import { useLanguage, LanguageSelector } from '../context/LanguageContext';

interface NavbarProps {
  onNavigate: (route: string) => void;
  currentRoute?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 w-full bg-[#080C15]/90 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-6 px-6 py-4">
        {/* Zone 1: Brand wordmark */}
        <button
          onClick={() => onNavigate('/')}
          className="flex items-center gap-2.5 text-left text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0 group focus:outline-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <Mic className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight">
            Aura<span className="text-cyan-400">Voice</span>
          </span>
        </button>

        {/* Zone 2: Navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
          <a
            href="#features"
            className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
          >
            {t('nav.features', 'Features')}
          </a>
          <a
            href="#how-it-works"
            className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
          >
            {t('nav.howItWorks', 'How It Works')}
          </a>
          <a
            href="#faq"
            className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
          >
            {t('nav.faq', 'FAQ')}
          </a>
          <a
            href="#pricing"
            className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
          >
            {t('nav.pricing', 'Pricing')}
          </a>
          <a
            href="#contact"
            className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0"
          >
            {t('nav.contact', 'Contact')}
          </a>
        </nav>

        {/* Zone 3: Primary actions & Language Selector */}
        <div className="flex items-center gap-3 shrink-0">
          <LanguageSelector />

          <button
            onClick={() => onNavigate('/login')}
            className="px-3.5 py-2 text-sm font-medium text-slate-200 hover:text-white transition-colors whitespace-nowrap shrink-0"
          >
            {t('nav.login', 'Login')}
          </button>
          <button
            onClick={() => onNavigate('/signup')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 rounded-lg hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/25 transition-all whitespace-nowrap shrink-0"
          >
            <span>{t('nav.getStarted', 'Get Started')}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
