import React from 'react';
import {
  PhoneCall,
  Users,
  Bot,
  CalendarCheck,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  RefreshCw,
  Sparkles,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { useLanguage } from '../../../context/LanguageContext';

interface OverviewTabProps {
  onNavigateTab: (tab: string) => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({ onNavigateTab }) => {
  const { user, isSuperAdmin } = useAuth();
  const {
    assistants,
    unassignedAssistants,
    calls,
    activeCalls,
    leads,
    appointments,
    syncVapiAssistants,
    loadingSync,
    isVapiConnected,
  } = useData();
  const { t } = useLanguage();

  const userAssistantId = user?.assignedAssistantId;
  const userOrgId = user?.organizationId;

  // Filter entities: If customer has assigned Assistant ID, restrict strictly to that Assistant ID!
  const orgAssistants = isSuperAdmin && !userOrgId
    ? assistants
    : userAssistantId
    ? assistants.filter((a) => a.id === userAssistantId || (userOrgId && a.assignedOrgId === userOrgId))
    : assistants.filter((a) => a.assignedOrgId === userOrgId);

  const orgCalls = isSuperAdmin && !userOrgId
    ? calls
    : userAssistantId
    ? calls.filter((c) => c.assistantId === userAssistantId || (userOrgId && c.organizationId === userOrgId))
    : calls.filter((c) => !userOrgId || c.organizationId === userOrgId);

  const totalCallSeconds = orgCalls.reduce((acc, c) => acc + (c.durationSeconds || 0), 0);
  const totalCallMinutes = Math.round(totalCallSeconds / 60);

  const orgLeads = isSuperAdmin && !userOrgId
    ? leads
    : leads.filter((l) => !userOrgId || l.organizationId === userOrgId);

  const orgAppointments = isSuperAdmin && !userOrgId
    ? appointments
    : appointments.filter((a) => !userOrgId || a.organizationId === userOrgId);

  return (
    <div className="space-y-6">
      {/* Customer Assigned Assistant ID Welcome Banner */}
      {!isSuperAdmin && userAssistantId && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950 border border-cyan-500/40 flex items-center justify-center text-cyan-400 shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                {t('dash.assignedAgent', 'Assigned Voice Assistant')}
              </div>
              <div className="text-xs text-cyan-400 font-mono">
                Assistant ID: {userAssistantId}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigateTab('live_calls')}
              className="px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all"
            >
              Test Assistant
            </button>
          </div>
        </div>
      )}

      {/* Super Admin Notice if Unassigned Assistants exist */}
      {isSuperAdmin && unassignedAssistants.length > 0 && (
        <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                {unassignedAssistants.length} Unassigned Assistant{unassignedAssistants.length > 1 ? 's' : ''} in Pool
              </div>
              <div className="text-xs text-slate-300">
                You have newly discovered assistants awaiting customer account assignment.
              </div>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab('super_admin')}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-xs whitespace-nowrap transition-all"
          >
            Assign in Super Admin
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Calls */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t('dash.totalCalls', 'Total Calls')}</span>
            <PhoneCall className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
            {orgCalls.length}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-400 font-mono">{activeCalls.length} live calls</span>
          </div>
        </div>

        {/* Metric 2: Live Calls */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t('dash.activeCalls', 'Active Live Calls')}</span>
            <Bot className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
            {activeCalls.length}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-cyan-400">WebRTC audio streaming</span>
          </div>
        </div>

        {/* Metric 3: Talk Duration */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t('dash.callDuration', 'Talk Duration')}</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
            {totalCallMinutes} <span className="text-sm font-normal text-slate-400">min</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">
            {totalCallSeconds} total seconds
          </div>
        </div>

        {/* Metric 4: Qualified Leads */}
        <div className="p-5 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>{t('dash.qualifiedLeads', 'Qualified Leads')}</span>
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
            {orgLeads.length}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-emerald-400 font-mono">{orgAppointments.length} appointments booked</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Live & Recent Calls + Assistants Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Calls */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              {t('dash.recentCalls', 'Recent Call Activity')}
            </h3>
            <button
              onClick={() => onNavigateTab('conversations')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>{t('dash.viewAllCalls', 'View Conversations')}</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-900/80 rounded-xl border border-slate-800 overflow-hidden">
            {orgCalls.length === 0 ? (
              <div className="p-8 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <div className="text-sm font-medium text-white">No Call History Yet</div>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Calls processed by your assigned Assistant ID will populate here with transcripts, recordings, and duration telemetry.
                </p>
                <button
                  onClick={() => onNavigateTab('live_calls')}
                  className="mt-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200"
                >
                  Initiate Test Call
                </button>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80">
                {orgCalls.slice(0, 5).map((call) => (
                  <div key={call.id} className="p-4 hover:bg-slate-800/40 transition-colors flex items-center justify-between gap-4">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white truncate">
                          {call.customerNumber || 'Web Audio Caller'}
                        </span>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40">
                          {call.type}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 truncate">
                        {call.assistantName || 'Voice Agent'} {call.summary && `· ${call.summary}`}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-xs font-mono text-white tabular-nums">
                        {call.durationSeconds ? `${call.durationSeconds}s` : 'Active'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {call.startedAt ? new Date(call.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Assigned Assistants & Quick Launch */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              {t('dash.assignedAgent', 'Assigned Voice Assistant')}
            </h3>
            <button
              onClick={() => onNavigateTab('agents')}
              className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
            >
              <span>Inspect Agent</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-4 space-y-3">
            {orgAssistants.length === 0 ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="text-sm font-medium text-white">No Voice Assistant Assigned</div>
                <p className="text-xs text-slate-400">
                  {isSuperAdmin
                    ? 'Sync assistants from voice infrastructure or assign one to this organization.'
                    : 'Your account administrator has not assigned an Assistant ID yet.'}
                </p>
                {isSuperAdmin && (
                  <button
                    onClick={() => syncVapiAssistants()}
                    disabled={loadingSync}
                    className="px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingSync ? 'animate-spin' : ''}`} />
                    <span>Sync Assistants</span>
                  </button>
                )}
              </div>
            ) : (
              orgAssistants.map((assistant) => (
                <div
                  key={assistant.id}
                  className="p-3.5 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/40 transition-colors flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="text-sm font-semibold text-white truncate">{assistant.name}</div>
                    <div className="text-[11px] text-cyan-400 font-mono truncate">
                      Assistant ID: {assistant.id}
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigateTab('live_calls')}
                    className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 text-xs font-medium border border-cyan-500/30 shrink-0"
                  >
                    Test Call
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
