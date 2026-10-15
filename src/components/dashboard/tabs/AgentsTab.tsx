import React, { useState } from 'react';
import {
  Bot,
  RefreshCw,
  PhoneCall,
  Settings,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  Volume2,
  Check,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';

interface AgentsTabProps {
  onNavigateTab: (tab: string) => void;
}

export const AgentsTab: React.FC<AgentsTabProps> = ({ onNavigateTab }) => {
  const { user, isSuperAdmin } = useAuth();
  const {
    assistants,
    organizations,
    assignAssistantToOrg,
    syncVapiAssistants,
    loadingSync,
    initiateTestCall,
    isVapiConnected,
  } = useData();

  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  const userAssistantId = user?.assignedAssistantId;
  const userOrgId = user?.organizationId;
  const filteredAssistants = isSuperAdmin && !userOrgId
    ? assistants
    : userAssistantId
    ? assistants.filter((a) => a.id === userAssistantId || (userOrgId && a.assignedOrgId === userOrgId))
    : assistants.filter((a) => a.assignedOrgId === userOrgId);

  const handleSync = async () => {
    setSyncFeedback(null);
    const result = await syncVapiAssistants();
    if (result.success) {
      setSyncFeedback(`Successfully synchronized ${result.count} voice assistant(s).`);
    } else {
      setSyncFeedback(result.error || 'Sync failed.');
    }
    setTimeout(() => setSyncFeedback(null), 5000);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-6">
      {/* Tab Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">AI Voice Agents</h2>
          <p className="text-xs text-slate-400">
            {isSuperAdmin
              ? 'Voice assistants synchronized from your connected voice infrastructure.'
              : 'Voice agents assigned to your organization.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={loadingSync}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingSync ? 'animate-spin' : ''}`} />
            <span>{loadingSync ? 'Syncing...' : 'Sync Assistants'}</span>
          </button>
        </div>
      </div>

      {syncFeedback && (
        <div className="p-3.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-200 text-xs flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Main List */}
      {filteredAssistants.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No AI Assistants Found</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              {!isVapiConnected
                ? isSuperAdmin
                  ? 'Voice infrastructure private credentials have not been configured yet. Enter your credentials in Settings to import existing voice assistants.'
                  : 'No voice assistant is currently assigned to your Assistant ID. Please contact your AuraVoice administrator.'
                : 'Click "Sync Assistants" to query your connected voice infrastructure and load your assistants.'}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {!isVapiConnected && isSuperAdmin ? (
              <button
                onClick={() => onNavigateTab('settings')}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold shadow-md shadow-cyan-500/20 transition-all"
              >
                Configure Voice Credentials
              </button>
            ) : isVapiConnected ? (
              <button
                onClick={handleSync}
                disabled={loadingSync}
                className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold inline-flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingSync ? 'animate-spin' : ''}`} />
                <span>Sync Now</span>
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssistants.map((assistant) => {
            const isExpanded = expandedId === assistant.id;
            return (
              <div
                key={assistant.id}
                className="rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700/80 transition-all overflow-hidden"
              >
                <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                      <Bot className="w-5 h-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="text-base font-bold text-white">{assistant.name}</span>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-800/50">
                          {assistant.model?.model || 'gpt-4o'}
                        </span>
                        {assistant.assignedOrgName ? (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                            Org: {assistant.assignedOrgName}
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                            Unassigned
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-mono">
                        Assistant ID: {assistant.id}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => {
                        initiateTestCall(assistant.id);
                        onNavigateTab('live_calls');
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-all"
                    >
                      <PhoneCall className="w-3.5 h-3.5" />
                      <span>Test Call</span>
                    </button>

                    <button
                      onClick={() => toggleExpand(assistant.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs transition-colors"
                      title="Inspect configuration"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-slate-800/90 bg-slate-950/60 p-5 space-y-4 text-xs">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* LLM & Voice parameters */}
                      <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Model Specification</span>
                        </div>
                        <div className="space-y-1 font-mono text-slate-300">
                          <div>Provider: {assistant.model?.provider || 'openai'}</div>
                          <div>Model: {assistant.model?.model || 'gpt-4o'}</div>
                          <div>Temperature: {assistant.model?.temperature ?? 0.7}</div>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-lg bg-slate-900 border border-slate-800 space-y-2">
                        <div className="font-semibold text-white flex items-center gap-1.5">
                          <Volume2 className="w-3.5 h-3.5 text-blue-400" />
                          <span>Voice & Acoustic Profile</span>
                        </div>
                        <div className="space-y-1 font-mono text-slate-300">
                          <div>Voice Provider: {assistant.voice?.provider || '11labs'}</div>
                          <div>Voice ID: {assistant.voice?.voiceId || 'Default Voice'}</div>
                          <div>Recording: {assistant.recordingEnabled ? 'Enabled' : 'Disabled'}</div>
                        </div>
                      </div>
                    </div>

                    {/* Greeting & System prompt */}
                    {assistant.firstMessage && (
                      <div>
                        <div className="font-semibold text-slate-300 mb-1">First Message (Greeting)</div>
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-slate-200 italic">
                          &quot;{assistant.firstMessage}&quot;
                        </div>
                      </div>
                    )}

                    {assistant.model?.systemPrompt && (
                      <div>
                        <div className="font-semibold text-slate-300 mb-1">System Instructions</div>
                        <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-slate-300 max-h-36 overflow-y-auto whitespace-pre-wrap leading-relaxed">
                          {assistant.model.systemPrompt}
                        </div>
                      </div>
                    )}

                    {/* Super Admin Organization Assignment Control */}
                    {isSuperAdmin && (
                      <div className="pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="text-slate-400">
                          Assign this assistant to a tenant organization:
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={assistant.assignedOrgId || ''}
                            onChange={(e) => assignAssistantToOrg(assistant.id, e.target.value || null)}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-white text-xs font-medium focus:border-cyan-500 focus:outline-none"
                          >
                            <option value="">-- Unassigned --</option>
                            {organizations.map((org) => (
                              <option key={org.id} value={org.id}>
                                {org.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
