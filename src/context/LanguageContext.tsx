import React, { createContext, useContext, useState, useEffect } from 'react';
import { SupportedLanguage, LANGUAGE_OPTIONS, translations, LanguageOption } from '../i18n/translations';
import { Globe, Check } from 'lucide-react';

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string, fallback?: string) => string;
  currentOption: LanguageOption;
  isRtl: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_LANG_KEY = 'auravoice_language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    const saved = localStorage.getItem(STORAGE_LANG_KEY) as SupportedLanguage;
    return saved && translations[saved] ? saved : 'en';
  });

  const currentOption = LANGUAGE_OPTIONS.find((l) => l.code === language) || LANGUAGE_OPTIONS[0];
  const isRtl = Boolean(currentOption.isRtl);

  useEffect(() => {
    localStorage.setItem(STORAGE_LANG_KEY, language);
    document.documentElement.lang = language;
    document.documentElement.dir = isRtl ? 'rtl' : 'ltr';
  }, [language, isRtl]);

  const setLanguage = (lang: SupportedLanguage) => {
    if (translations[lang]) {
      setLanguageState(lang);
    }
  };

  const t = (key: string, fallback?: string): string => {
    const langDict = translations[language] || translations.en;
    if (langDict[key]) {
      return langDict[key];
    }
    // Fallback to English
    if (translations.en[key]) {
      return translations.en[key];
    }
    return fallback || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, currentOption, isRtl }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Reusable Language Selector Dropdown
export const LanguageSelector: React.FC<{ variant?: 'minimal' | 'badge' | 'full' }> = ({ variant = 'minimal' }) => {
  const { language, setLanguage, currentOption } = useLanguage();
  const [open, setOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-200 transition-all focus:outline-none"
        title="Select Language"
      >
        <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
        <span className="whitespace-nowrap">{currentOption.nativeName}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1.5 w-44 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl z-50 py-1 overflow-hidden divide-y divide-slate-800/80">
            <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Select Language
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {LANGUAGE_OPTIONS.map((opt) => (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => {
                    setLanguage(opt.code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                    language === opt.code
                      ? 'bg-cyan-950/60 text-cyan-400 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{opt.nativeName}</span>
                    {opt.code === 'ur-roman' && (
                      <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950 px-1 py-0.2 rounded border border-cyan-800/60">
                        Latin
                      </span>
                    )}
                  </div>
                  {language === opt.code && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
