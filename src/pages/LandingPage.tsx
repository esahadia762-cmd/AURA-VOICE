import React, { useState } from 'react';
import {
  Mic,
  PhoneCall,
  PhoneForwarded,
  Database,
  CalendarCheck2,
  BarChart3,
  ShieldCheck,
  Zap,
  ArrowRight,
  CheckCircle2,
  Mail,
  Send,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  KeyRound,
  Sparkles,
} from 'lucide-react';
import { Navbar } from '../components/Navbar';
import { useLanguage, LanguageSelector } from '../context/LanguageContext';

interface LandingPageProps {
  onNavigate: (route: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { t } = useLanguage();

  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactCompany, setContactCompany] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [contactSubmitted, setContactSubmitted] = useState(false);

  // Interactive Live Voice Preview Widget state
  const [previewPlaying, setPreviewPlaying] = useState(false);

  // FAQ accordion state
  const [expandedFaq, setExpandedFaq] = useState<number | null>(0);

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactEmail) return;
    setContactSubmitted(true);
  };

  const toggleVoicePreview = () => {
    setPreviewPlaying(!previewPlaying);
  };

  const steps = [
    {
      num: 1,
      title: t('landing.step1Title', '1. Create Your Account'),
      desc: t('landing.step1Desc', 'Register your business email and choose your organization preferences.'),
    },
    {
      num: 2,
      title: t('landing.step2Title', '2. Verify Your Email'),
      desc: t('landing.step2Desc', 'Confirm your address via the secure verification link sent to your inbox.'),
    },
    {
      num: 3,
      title: t('landing.step3Title', '3. Receive Your Assistant ID'),
      desc: t('landing.step3Desc', 'AuraVoice configures your custom voice agent and issues your dedicated Assistant ID.'),
    },
    {
      num: 4,
      title: t('landing.step4Title', '4. Secure Authenticated Login'),
      desc: t('landing.step4Desc', 'Log in with your email, password, and assigned Assistant ID.'),
    },
    {
      num: 5,
      title: t('landing.step5Title', '5. Open Personal Dashboard'),
      desc: t('landing.step5Desc', 'Access your isolated dashboard displaying exclusively your assigned voice agent.'),
    },
    {
      num: 6,
      title: t('landing.step6Title', '6. View Calls & Leads'),
      desc: t('landing.step6Desc', 'Inspect live audio calls, full verbatim transcripts, contacts, and appointments.'),
    },
    {
      num: 7,
      title: t('landing.step7Title', '7. Monitor Performance'),
      desc: t('landing.step7Desc', 'Track call durations, resolution outcomes, and customer qualification metrics.'),
    },
  ];

  const faqs = [
    {
      q: t('faq.q1', 'What is an Assistant ID?'),
      a: t('faq.a1', 'Your Assistant ID is a secure identifier issued by AuraVoice that links your user account to your specific, pre-configured AI voice agent. It ensures your business data remains isolated.'),
    },
    {
      q: t('faq.q2', 'Do I need to build the voice agent myself?'),
      a: t('faq.a2', 'No. AuraVoice handles the complete voice design, prompt engineering, telephone carrier integration, and knowledge grounding. You simply receive your Assistant ID and log in.'),
    },
    {
      q: t('faq.q3', 'Can other businesses access my call recordings?'),
      a: t('faq.a3', 'Never. AuraVoice enforces strict tenant isolation using Row Level Security. Each customer sees only data linked to their assigned Assistant ID.'),
    },
    {
      q: t('faq.q4', 'Does changing the dashboard language change the agent voice?'),
      a: t('faq.a4', 'No. Changing your dashboard language personalizes your UI and controls. Your assistant speaks whichever languages and voices were configured for your business.'),
    },
  ];

  return (
    <div className="min-h-screen bg-[#080C15] text-slate-100 flex flex-col selection:bg-cyan-500/30">
      <Navbar onNavigate={onNavigate} />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:py-24 overflow-hidden border-b border-slate-800/60">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-cyan-500/30 text-xs font-medium text-cyan-300">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                <span>{t('landing.tag', 'Enterprise Managed Multi-Tenant Voice Platform')}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.12]">
                {t('landing.heroTitle', 'Autonomous AI Voice Agents for Modern Enterprises')}
              </h1>

              <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
                {t('landing.heroSubtitle', 'Deploy custom AI voice agents to answer phone inquiries 24/7, qualify leads, schedule consultations, and retrieve company knowledge with sub-second latency.')}
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => onNavigate('/signup')}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/25 transition-all text-sm sm:text-base"
                >
                  <span>{t('landing.ctaTrial', 'Start Free Enterprise Trial')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onNavigate('/login')}
                  className="px-6 py-3.5 rounded-xl font-semibold text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-700/80 transition-all text-sm sm:text-base flex items-center gap-2"
                >
                  <KeyRound className="w-4 h-4 text-cyan-400" />
                  <span>{t('landing.ctaLogin', 'Access Platform Login')}</span>
                </button>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-slate-800/80 grid grid-cols-3 gap-6 text-sm">
                <div>
                  <div className="text-xl font-bold text-white font-mono">Real-Time</div>
                  <div className="text-xs text-slate-400">Sub-second acoustic speed</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white font-mono">Tenant-Isolated</div>
                  <div className="text-xs text-slate-400">Row Level Security isolation</div>
                </div>
                <div>
                  <div className="text-xl font-bold text-white font-mono">Managed AI</div>
                  <div className="text-xs text-slate-400">Dedicated Assistant ID binding</div>
                </div>
              </div>
            </div>

            {/* Right Graphic & Interactive Preview */}
            <div className="lg:col-span-5 relative">
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 shadow-2xl shadow-cyan-950/40">
                <img
                  src="/src/assets/images/hero_ai_voice_waveform_1792055214745.jpg"
                  alt="AuraVoice AI voice audio interface"
                  className="w-full h-64 object-cover object-center brightness-95"
                  referrerPolicy="no-referrer"
                />

                <div className="p-6 bg-slate-900/95 backdrop-blur-md space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                        <Mic className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-white">Executive Concierge Agent</div>
                        <div className="text-xs text-cyan-400">Ready · Inbound & Outbound Calling</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono text-cyan-300 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                      ID: asst_...
                    </span>
                  </div>

                  <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/90 space-y-3">
                    <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                      <span>Live Acoustic Processing</span>
                      <span className="text-cyan-400">{previewPlaying ? 'Active Streaming' : 'Ready'}</span>
                    </div>

                    <div className="flex items-center justify-center gap-1.5 h-10">
                      {[40, 75, 25, 90, 60, 30, 85, 45, 95, 35, 70, 50, 80, 65, 30].map((h, i) => (
                        <div
                          key={i}
                          className={`w-1 rounded-full transition-all duration-300 ${
                            previewPlaying
                              ? 'bg-gradient-to-t from-cyan-500 to-blue-400 animate-pulse'
                              : 'bg-slate-700'
                          }`}
                          style={{ height: previewPlaying ? `${h}%` : '20%' }}
                        />
                      ))}
                    </div>

                    <p className="text-xs text-slate-300 italic border-l-2 border-cyan-500/60 pl-3">
                      &quot;Good morning. I am your AuraVoice AI assistant. How may I route your inquiry or schedule your appointment today?&quot;
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={toggleVoicePreview}
                      className="flex-1 py-2.5 px-4 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                    >
                      <Zap className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{previewPlaying ? 'Stop Voice Stream' : 'Test Audio Simulation'}</span>
                    </button>
                    <button
                      onClick={() => onNavigate('/signup')}
                      className="py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-all"
                    >
                      Request Assistant
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Step-by-Step Onboarding Guide Section (Section 6) */}
      <section id="how-it-works" className="py-20 bg-[#0A0F1D] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
              {t('landing.howTitle', 'How AuraVoice Operates')}
            </h2>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              7-Step Customer Journey from Registration to Live Voice
            </p>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              {t('landing.howSubtitle', 'Our managed workflow delivers ready-to-run voice agents directly to your staff.')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.slice(0, 4).map((s) => (
              <div
                key={s.num}
                className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3 relative group"
              >
                <div className="w-9 h-9 rounded-lg bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold font-mono text-sm">
                  {s.num}
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                  {s.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-5">
            {steps.slice(4).map((s) => (
              <div
                key={s.num}
                className="p-6 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-all space-y-3 relative group"
              >
                <div className="w-9 h-9 rounded-lg bg-blue-950 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold font-mono text-sm">
                  {s.num}
                </div>
                <h4 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                  {s.title}
                </h4>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Platform Capabilities Section */}
      <section id="features" className="py-20 bg-[#080C15] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
              Enterprise Voice Capabilities
            </h2>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Grounded, Isolated, and Connected to Your Business
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-cyan-500/40 transition-all space-y-4">
              <div className="w-10 h-10 rounded-lg bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <PhoneCall className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Inbound Phone Triage</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Connect dedicated phone numbers to answer customer calls 24/7. Handle multi-tier routing, FAQ responses, and intelligent escalation without wait times.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-cyan-500/40 transition-all space-y-4">
              <div className="w-10 h-10 rounded-lg bg-blue-950/70 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <PhoneForwarded className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Outbound Lead Calling</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Trigger autonomous calls to follow up with new leads, qualify prospective customers against custom business criteria, and sync findings to your CRM.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-cyan-500/40 transition-all space-y-4">
              <div className="w-10 h-10 rounded-lg bg-sky-950/70 border border-sky-500/30 flex items-center justify-center text-sky-400">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Document Knowledge Base</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Upload business documents, policy manuals, and pricing tables. Ground your assistants strictly in verified company knowledge with organization-level isolation.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-cyan-500/40 transition-all space-y-4">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/70 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CalendarCheck2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Appointment Automation</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Enable voice agents to book, reschedule, or cancel consultations directly into calendar schedules during active conversations.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-cyan-500/40 transition-all space-y-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-950/70 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Verbatim Call Records & Analytics</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Inspect call durations, customer sentiment, qualification scores, and cost breakdowns with tabular accuracy and exportable call transcripts.
              </p>
            </div>

            <div className="p-6 rounded-xl bg-slate-900/60 border border-slate-800/90 hover:border-cyan-500/40 transition-all space-y-4">
              <div className="w-10 h-10 rounded-lg bg-purple-950/70 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-white">Multilingual & Roman Urdu Ready</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Native interface translation supporting English, Roman Urdu, Urdu, Hindi, Arabic, Spanish, French, and German with full RTL support.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (FAQ) Section */}
      <section id="faq" className="py-20 bg-[#0A0F1D] border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-4 mb-14">
            <h2 className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
              {t('nav.faq', 'Frequently Asked Questions')}
            </h2>
            <p className="text-3xl font-bold text-white">
              {t('faq.title', 'Everything You Need to Know About AuraVoice')}
            </p>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              {t('faq.subtitle', 'Clear answers to how AuraVoice provisions and connects your voice agents.')}
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isExpanded = expandedFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setExpandedFaq(isExpanded ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 focus:outline-none"
                  >
                    <span className="text-sm sm:text-base font-semibold text-white flex items-center gap-3">
                      <HelpCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span>{faq.q}</span>
                    </span>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-cyan-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isExpanded && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 bg-[#080C15] border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto space-y-4 mb-16">
            <h2 className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
              {t('nav.pricing', 'Pricing')}
            </h2>
            <p className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
              Predictable Enterprise Calling Tiers
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Starter */}
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xs font-semibold text-slate-400 uppercase">Starter Enterprise</div>
                <h3 className="text-2xl font-bold text-white">Starter</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-mono">$199</span>
                  <span className="text-sm text-slate-400">/month</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-300 pt-4 border-t border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Dedicated Assistant ID</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Inbound Phone Triage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Standard Knowledge Grounding</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Verbatim Call Transcripts</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate('/signup')}
                className="w-full py-3 rounded-xl font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Choose Starter
              </button>
            </div>

            {/* Growth */}
            <div className="p-8 rounded-2xl bg-gradient-to-b from-cyan-950/40 to-slate-900 border-2 border-cyan-500/60 space-y-6 flex flex-col justify-between relative shadow-xl shadow-cyan-950/30">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-cyan-400 uppercase">Growth Operations</span>
                  <span className="text-[10px] font-bold text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-500/40">
                    POPULAR
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-white">Growth</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-mono">$499</span>
                  <span className="text-sm text-slate-400">/month</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-300 pt-4 border-t border-cyan-900/50">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Multiple Assistant IDs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Outbound Lead Qualification</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>CRM & Appointment Workflows</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>AI Sentiment & Call Scoring</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate('/signup')}
                className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/25 transition-all"
              >
                Choose Growth
              </button>
            </div>

            {/* Enterprise */}
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-xs font-semibold text-slate-400 uppercase">High-Volume Agencies</div>
                <h3 className="text-2xl font-bold text-white">Enterprise</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-white font-mono">$1,299</span>
                  <span className="text-sm text-slate-400">/month</span>
                </div>
                <ul className="space-y-3 text-sm text-slate-300 pt-4 border-t border-slate-800">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Unlimited Assistant Allocations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Dedicated Phone Number Trunking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>Custom Webhook Dispatches</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                    <span>24/7 Priority Support & Audit Logs</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onNavigate('/signup')}
                className="w-full py-3 rounded-xl font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
              >
                Choose Enterprise
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-[#0A0F1D] border-b border-slate-800/80">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-xs font-semibold tracking-wider text-cyan-400 uppercase">
              {t('nav.contact', 'Contact')}
            </h2>
            <p className="text-3xl font-bold text-white">Connect With Our Enterprise Voice Team</p>
            <p className="text-slate-400 text-sm max-w-xl mx-auto">
              Ready to deploy your customized voice agent or have questions regarding Assistant ID allocation?
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl">
            {contactSubmitted ? (
              <div className="py-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-white">Message Sent Successfully</h3>
                <p className="text-sm text-slate-400 max-w-md mx-auto">
                  Thank you for reaching out. Our voice engineering team will contact you at {contactEmail} within one business day.
                </p>
                <button
                  onClick={() => setContactSubmitted(false)}
                  className="mt-4 px-4 py-2 text-xs font-medium text-cyan-400 hover:underline"
                >
                  Send another inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Jane Doe"
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">Work Email</label>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="jane@company.com"
                      className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs sm:text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Organization / Company</label>
                  <input
                    type="text"
                    value={contactCompany}
                    onChange={(e) => setContactCompany(e.target.value)}
                    placeholder="Acme Global Inc."
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Calling Requirements</label>
                  <textarea
                    rows={4}
                    required
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    placeholder="Describe your calling volume, knowledge requirements, or assistant scope..."
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs sm:text-sm resize-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-md shadow-cyan-500/20 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>Submit Enterprise Inquiry</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-12 bg-[#070A12] border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold">
                <Mic className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white">
                Aura<span className="text-cyan-400">Voice</span>
              </span>
              <span className="text-xs text-slate-500 ml-2">Enterprise Voice Agent SaaS</span>
            </div>

            <div className="flex items-center gap-6 text-xs text-slate-400">
              <button onClick={() => onNavigate('/login')} className="hover:text-cyan-400">
                {t('nav.login', 'Staff Login')}
              </button>
              <button onClick={() => onNavigate('/signup')} className="hover:text-cyan-400">
                {t('nav.getStarted', 'Register')}
              </button>
              <span>SOC 2 Type II</span>
              <span>ISO 27001</span>
              <span>Privacy</span>
            </div>

            <div className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} AuraVoice Inc. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
