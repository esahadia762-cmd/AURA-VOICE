import React, { useState } from 'react';
import {
  Key,
  Shield,
  Save,
  CheckCircle2,
  Database,
  Radio,
  User,
  Building2,
  Lock,
  Globe,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { useLanguage, LanguageSelector } from '../../../context/LanguageContext';
import { getStoredSupabaseConfig } from '../../../lib/supabase';
import { UserRole } from '../../../types';
import { LANGUAGE_OPTIONS } from '../../../i18n/translations';

export const SettingsTab: React.FC = () => {
  const { user, isSuperAdmin, setRole, updateSupabaseCredentials, updateWorkspaceName } = useAuth();
  const {
    vapiKey,
    setVapiKey,
    vapiPublicKey,
    setVapiPublicKey,
    syncVapiAssistants,
    loadingSync,
    organizations,
    renameOrganization,
  } = useData();
  const { language, setLanguage, t } = useLanguage();

  const supabaseConfig = getStoredSupabaseConfig();

  // Local state for forms
  const currentOrg = organizations.find((o) => o.id === user?.organizationId);
  const [workspaceNameInput, setWorkspaceNameInput] = useState(user?.organizationName || currentOrg?.name || '');
  const [savingWorkspace, setSavingWorkspace] = useState(false);
  const [workspaceFeedback, setWorkspaceFeedback] = useState<string | null>(null);

  const [localVapiKey, setLocalVapiKey] = useState(vapiKey);
  const [localVapiPub, setLocalVapiPub] = useState(vapiPublicKey);
  const [localSbUrl, setLocalSbUrl] = useState(supabaseConfig.url);
  const [localSbAnon, setLocalSbAnon] = useState(supabaseConfig.anonKey);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);

  const handleSaveWorkspaceName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceNameInput.trim()) {
      setWorkspaceFeedback('Workspace name cannot be empty.');
      return;
    }
    setSavingWorkspace(true);
    try {
      const res = await updateWorkspaceName(workspaceNameInput.trim(), user?.organizationId || undefined);
      if (user?.organizationId) {
        await renameOrganization(user.organizationId, workspaceNameInput.trim());
      }
      if (res.success) {
        setWorkspaceFeedback(`Workspace name successfully saved: "${workspaceNameInput.trim()}"`);
      } else {
        setWorkspaceFeedback(res.error || 'Failed to update workspace name.');
      }
    } catch (err: any) {
      setWorkspaceFeedback(err.message || 'Error updating workspace name.');
    } finally {
      setSavingWorkspace(false);
      setTimeout(() => setWorkspaceFeedback(null), 5000);
    }
  };

  const handleSaveVapi = async (e: React.FormEvent) => {
    e.preventDefault();
    setVapiKey(localVapiKey);
    setVapiPublicKey(localVapiPub);
    setSavedFeedback('Voice infrastructure credentials saved.');

    const res = await syncVapiAssistants();
    if (res.success) {
      setSavedFeedback(`Voice connected! ${res.count} assistant(s) discovered.`);
    } else {
      setSavedFeedback('Credentials saved. (' + (res.error || 'Check private key') + ')');
    }
    setTimeout(() => setSavedFeedback(null), 6000);
  };

  const handleSaveSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseCredentials(localSbUrl, localSbAnon);
    setSavedFeedback('Supabase configuration updated.');
    setTimeout(() => setSavedFeedback(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white tracking-tight">
          {t('dash.settings', 'Platform & Account Settings')}
        </h2>
        <p className="text-xs text-slate-400">
          Manage workspace identity, language preferences, assigned Assistant IDs, and platform credentials.
        </p>
      </div>

      {savedFeedback && (
        <div className="p-3.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{savedFeedback}</span>
        </div>
      )}

      {/* 1. Workspace Identity & Business Naming (Full User Control) */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Workspace & Organization Settings</h3>
              <p className="text-xs text-slate-400">
                Enter your business or organization name. Your workspace name is isolated to your account.
              </p>
            </div>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800/40">
            Tenant Isolated
          </span>
        </div>

        {workspaceFeedback && (
          <div className="p-3 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{workspaceFeedback}</span>
          </div>
        )}

        <form onSubmit={handleSaveWorkspaceName} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Workspace / Organization Name
              </label>
              <input
                type="text"
                value={workspaceNameInput}
                onChange={(e) => setWorkspaceNameInput(e.target.value)}
                placeholder="Enter your organization name..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs sm:text-sm font-medium"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                This editable name is displayed across your dashboard, sidebar, and reports.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Internal Organization ID
              </label>
              <div className="px-3.5 py-2.5 rounded-lg bg-slate-950 border border-slate-800/80 text-xs font-mono text-slate-400 select-all">
                {user?.organizationId || currentOrg?.id || 'org_' + (user?.id ? user.id.replace('usr_', '') : 'tenant_isolated')}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Unique internal tenant ID ensuring strict database isolation.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] text-slate-500">
              * Saved persistently in your database and loaded on future sessions.
            </div>
            <button
              type="submit"
              disabled={savingWorkspace}
              className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2 disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingWorkspace ? 'Saving...' : 'Save Workspace Name'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* 1. Language & Regional Localization (Section 7) */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Multilingual Dashboard & Translation</h3>
              <p className="text-xs text-slate-400">
                Choose your dashboard language. Roman Urdu is fully supported in Latin script.
              </p>
            </div>
          </div>
          <LanguageSelector />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
          {LANGUAGE_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              type="button"
              onClick={() => setLanguage(opt.code)}
              className={`p-3 rounded-xl border text-left text-xs transition-all ${
                language === opt.code
                  ? 'bg-cyan-950/80 border-cyan-500/60 text-white shadow-md shadow-cyan-950/30'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              <div className="font-semibold text-white">{opt.nativeName}</div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">{opt.name}</div>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-500">
          * Note: Changing your dashboard language personalizes your UI and controls. Your assistant speaks whichever languages and voices were configured for your business.
        </p>
      </div>

      {/* 2. Customer Assigned Assistant ID Card */}
      {!isSuperAdmin && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Your Assigned Assistant ID</h3>
              <p className="text-xs text-slate-400">
                This secure identifier connects your account to your dedicated voice agent.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 font-mono">Assigned Assistant ID</div>
              <div className="text-sm font-bold text-cyan-400 font-mono mt-0.5">
                {user?.assignedAssistantId || 'asst_voice_concierge_01'}
              </div>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
              AUTHENTICATED
            </span>
          </div>
          <p className="text-[11px] text-slate-500">
            Assistant IDs are managed and assigned by your AuraVoice platform administrator.
          </p>
        </div>
      )}

      {/* 3. Platform Voice Infrastructure Credentials (Super Admin Only) */}
      {isSuperAdmin && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Voice Infrastructure Credentials</h3>
                <p className="text-xs text-slate-400">
                  Private API credentials used on the backend to synchronize voice agents.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800/40">
              Super Admin Only
            </span>
          </div>

          <form onSubmit={handleSaveVapi} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Voice Platform Private Secret Key
              </label>
              <input
                type="password"
                value={localVapiKey}
                onChange={(e) => setLocalVapiKey(e.target.value)}
                placeholder="e.g. 42398402-9a84-4b5c-a50d-..."
                className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Voice Platform Public Key (For Browser Test Calls)
              </label>
              <input
                type="text"
                value={localVapiPub}
                onChange={(e) => setLocalVapiPub(e.target.value)}
                placeholder="e.g. pub_40918402-..."
                className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs font-mono"
              />
            </div>

            <button
              type="submit"
              disabled={loadingSync}
              className="px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{loadingSync ? 'Validating...' : 'Save & Synchronize Infrastructure'}</span>
            </button>
          </form>
        </div>
      )}

      {/* 4. Supabase Configuration */}
      {isSuperAdmin && (
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Supabase PostgreSQL & Auth</h3>
                <p className="text-xs text-slate-400">
                  Database URL and Anon key for session persistence and Row Level Security.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/40">
              Auth & RLS
            </span>
          </div>

          <form onSubmit={handleSaveSupabase} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Supabase Project URL
              </label>
              <input
                type="url"
                value={localSbUrl}
                onChange={(e) => setLocalSbUrl(e.target.value)}
                placeholder="https://your-project.supabase.co"
                className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Supabase Anon / Public Key
              </label>
              <input
                type="password"
                value={localSbAnon}
                onChange={(e) => setLocalSbAnon(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                className="w-full px-3 py-2.5 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs font-mono"
              />
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold text-xs shadow-md shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Update Supabase Settings</span>
            </button>
          </form>
        </div>
      )}

      {/* 5. User Profile & Testing Role Switcher */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Active Account Profile</h3>
            <p className="text-xs text-slate-400">
              Session information and assigned permissions.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-slate-400">Full Name</div>
            <div className="font-semibold text-white">{user?.fullName || 'Platform User'}</div>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <div className="text-slate-400">Email Address</div>
            <div className="font-semibold text-white font-mono">{user?.email || 'N/A'}</div>
          </div>
        </div>

        {/* Role Switching for verification */}
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <label className="block text-xs font-medium text-slate-300">
            Switch Platform View
          </label>
          <div className="flex flex-wrap items-center gap-2">
            {(['super_admin', 'client_admin', 'client_user'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors ${
                  user?.role === r
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {r.replace('_', ' ').toUpperCase()}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            Switch between Super Admin (platform owner) and Customer (isolated Assistant ID workspace).
          </p>
        </div>
      </div>
    </div>
  );
};
