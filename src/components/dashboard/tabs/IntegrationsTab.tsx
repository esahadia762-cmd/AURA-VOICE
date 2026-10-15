import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Phone,
  Calendar,
  Database,
  Radio,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';

interface IntegrationsTabProps {
  onNavigateTab: (tab: string) => void;
}

export const IntegrationsTab: React.FC<IntegrationsTabProps> = ({ onNavigateTab }) => {
  const { isConfigured: isSupabaseConnected } = useAuth();
  const { isVapiConnected, syncVapiAssistants, loadingSync } = useData();

  const [testResult, setTestResult] = useState<string | null>(null);

  const handleTestVapi = async () => {
    setTestResult('Testing Vapi connectivity...');
    const result = await syncVapiAssistants();
    if (result.success) {
      setTestResult(`Vapi connection verified: ${result.count} assistant(s) reachable.`);
    } else {
      setTestResult(`Vapi error: ${result.error || 'Connection failed.'}`);
    }
    setTimeout(() => setTestResult(null), 6000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">System Integrations</h2>
        <p className="text-xs text-slate-400">
          Verify connected enterprise services, API infrastructure, and real-time telephony pipelines.
        </p>
      </div>

      {testResult && (
        <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white flex items-center justify-between">
          <span>{testResult}</span>
          <button onClick={() => setTestResult(null)} className="text-slate-400 hover:text-white">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Vapi Integration */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Vapi Voice Platform</h3>
                <div className="text-xs text-slate-400">Speech & LLM Synthesis Engine</div>
              </div>
            </div>

            <span
              className={`text-[10px] font-mono px-2.5 py-1 rounded-md border font-semibold ${
                isVapiConnected
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/40'
                  : 'bg-red-950/80 text-red-400 border-red-800/40'
              }`}
            >
              {isVapiConnected ? 'CONNECTED' : 'NOT CONFIGURED'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Powers ultra-low-latency bidirectional conversational voice synthesis, WebRTC audio streaming, and assistant configuration.
          </p>

          <div className="pt-2 flex items-center gap-3 border-t border-slate-800/80">
            {isVapiConnected ? (
              <button
                onClick={handleTestVapi}
                disabled={loadingSync}
                className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSync ? 'animate-spin' : ''}`} />
                <span>Test Live Connection</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigateTab('settings')}
                className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all"
              >
                Configure API Key
              </button>
            )}
          </div>
        </div>

        {/* Supabase Integration */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Supabase PostgreSQL & Auth</h3>
                <div className="text-xs text-slate-400">Multi-tenant Relational DB & Auth</div>
              </div>
            </div>

            <span
              className={`text-[10px] font-mono px-2.5 py-1 rounded-md border font-semibold ${
                isSupabaseConnected
                  ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/40'
                  : 'bg-amber-950/80 text-amber-400 border-amber-800/40'
              }`}
            >
              {isSupabaseConnected ? 'CONNECTED' : 'LOCAL DEV READY'}
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Enforces Row Level Security (RLS) isolation between tenant organizations and secures password recovery tokens.
          </p>

          <div className="pt-2 flex items-center gap-3 border-t border-slate-800/80">
            <button
              onClick={() => onNavigateTab('settings')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
            >
              Manage Credentials
            </button>
          </div>
        </div>

        {/* Twilio Telephony */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Twilio SIP Trunking</h3>
                <div className="text-xs text-slate-400">Inbound / Outbound PSTN Lines</div>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2.5 py-1 rounded-md border font-semibold bg-slate-950 text-slate-400 border-slate-800">
              OPTIONAL (VAPI MANAGED)
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Phone numbers purchased via Vapi or Twilio auto-route through the Vapi SIP dispatcher into your assistant.
          </p>

          <div className="pt-2 flex items-center gap-3 border-t border-slate-800/80">
            <button
              onClick={() => onNavigateTab('super_admin')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
            >
              View Phone Numbers
            </button>
          </div>
        </div>

        {/* Calendar Integration */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Cal.com / Google Calendar</h3>
                <div className="text-xs text-slate-400">Live Schedule Slot Availability</div>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2.5 py-1 rounded-md border font-semibold bg-emerald-950/80 text-emerald-400 border-emerald-800/40">
              ACTIVE
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            Allows voice agents to confirm open time slots and finalize bookings during phone conversations.
          </p>

          <div className="pt-2 flex items-center gap-3 border-t border-slate-800/80">
            <button
              onClick={() => onNavigateTab('appointments')}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
            >
              View Appointments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
