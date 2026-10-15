import React, { useState } from 'react';
import {
  LayoutDashboard,
  Radio,
  Bot,
  MessageSquare,
  Database,
  GitFork,
  Layers,
  BarChart3,
  Users,
  CalendarCheck2,
  Settings,
  Shield,
  RefreshCw,
  LogOut,
  ChevronDown,
  Building2,
  Menu,
  X,
  Mic,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useLanguage, LanguageSelector } from '../../context/LanguageContext';
import { OverviewTab } from './tabs/OverviewTab';
import { LiveCallsTab } from './tabs/LiveCallsTab';
import { AgentsTab } from './tabs/AgentsTab';
import { ConversationsTab } from './tabs/ConversationsTab';
import { KnowledgeBaseTab } from './tabs/KnowledgeBaseTab';
import { WorkflowsTab } from './tabs/WorkflowsTab';
import { IntegrationsTab } from './tabs/IntegrationsTab';
import { AnalyticsTab } from './tabs/AnalyticsTab';
import { LeadsTab } from './tabs/LeadsTab';
import { AppointmentsTab } from './tabs/AppointmentsTab';
import { SettingsTab } from './tabs/SettingsTab';
import { SuperAdminTab } from './tabs/SuperAdminTab';

interface DashboardLayoutProps {
  onNavigate: (route: string) => void;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ onNavigate }) => {
  const { user, signOut, isSuperAdmin, setOrganization } = useAuth();
  const { organizations, unassignedAssistants, activeCalls, syncVapiAssistants, loadingSync } = useData();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<string>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const handleLogout = async () => {
    await signOut();
    onNavigate('/login');
  };

  const navItems = [
    { id: 'overview', label: t('dash.welcome', 'Overview'), fallback: 'Overview', icon: LayoutDashboard },
    { id: 'live_calls', label: t('dash.liveConsole', 'Live Calls'), fallback: 'Live Calls', icon: Radio, count: activeCalls.length },
    { id: 'agents', label: t('dash.assignedAgent', 'AI Agents'), fallback: 'AI Agents', icon: Bot },
    { id: 'conversations', label: t('dash.viewAllCalls', 'Conversations'), fallback: 'Conversations', icon: MessageSquare },
    { id: 'knowledge_base', label: t('dash.knowledgeBase', 'Knowledge Base'), fallback: 'Knowledge Base', icon: Database },
    { id: 'workflows', label: t('dash.workflows', 'Workflows'), fallback: 'Workflows', icon: GitFork },
    { id: 'integrations', label: 'Integrations', fallback: 'Integrations', icon: Layers },
    { id: 'analytics', label: t('dash.analytics', 'Analytics'), fallback: 'Analytics', icon: BarChart3 },
    { id: 'leads', label: t('dash.leads', 'Leads & CRM'), fallback: 'Leads & CRM', icon: Users },
    { id: 'appointments', label: t('dash.appointmentsTab', 'Appointments'), fallback: 'Appointments', icon: CalendarCheck2 },
    { id: 'settings', label: t('dash.settings', 'Settings'), fallback: 'Settings', icon: Settings },
  ];

  const getActiveTabTitle = () => {
    if (activeTab === 'super_admin') return t('dash.superAdmin', 'Super Admin Hub');
    const found = navItems.find((n) => n.id === activeTab);
    return found ? found.fallback : 'Dashboard';
  };

  return (
    <div className="min-h-screen bg-[#080C15] text-slate-100 flex flex-col md:flex-row antialiased selection:bg-cyan-500/30">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0B111E] border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white">
            <Mic className="w-4 h-4" />
          </div>
          <span className="font-extrabold text-lg text-white">
            Aura<span className="text-cyan-400">Voice</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSelector />
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <aside
        className={`${
          mobileMenuOpen ? 'block' : 'hidden'
        } md:flex flex-col w-full md:w-64 bg-[#0A0F1D] border-r border-slate-800/80 shrink-0 z-30 transition-all`}
      >
        {/* Brand Area */}
        <div className="hidden md:flex items-center gap-2.5 px-6 py-5 border-b border-slate-800/80">
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2.5 text-left focus:outline-none group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:shadow-cyan-500/40 transition-all">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight text-white">
              Aura<span className="text-cyan-400">Voice</span>
            </span>
          </button>
        </div>

        {/* Tenant & Assistant ID Context Indicator */}
        <div className="px-4 py-3 border-b border-slate-800/80 bg-slate-950/40 space-y-1.5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Workspace</span>
            {isSuperAdmin ? (
              <span className="text-[10px] text-cyan-400 font-mono">Platform Admin</span>
            ) : (
              <span className="text-[10px] font-mono text-emerald-400">Isolated</span>
            )}
          </div>

          {isSuperAdmin ? (
            <select
              value={user?.organizationId || ''}
              onChange={(e) => {
                const org = organizations.find((o) => o.id === e.target.value);
                setOrganization(e.target.value, org?.name || 'All Organizations');
              }}
              className="w-full px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-medium focus:border-cyan-500 focus:outline-none"
            >
              <option value="">All Organizations (Platform)</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.id}>
                  {org.name}
                </option>
              ))}
            </select>
          ) : (
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-white px-1">
                <Building2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                {user?.organizationName ? (
                  <span className="truncate" title={user.organizationName}>{user.organizationName}</span>
                ) : (
                  <button
                    onClick={() => setActiveTab('settings')}
                    className="text-amber-400 hover:text-amber-300 text-xs font-medium underline underline-offset-2 truncate"
                  >
                    Set Workspace Name
                  </button>
                )}
              </div>
              {user?.assignedAssistantId && (
                <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-900 border border-slate-800 text-[10px] font-mono text-cyan-300">
                  <KeyRound className="w-3 h-3 text-cyan-400 shrink-0" />
                  <span className="truncate">Assistant ID: {user.assignedAssistantId}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Navigation List */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {/* Super Admin Top Button if applicable */}
          {isSuperAdmin && (
            <div className="pb-2 mb-2 border-b border-slate-800/60">
              <button
                onClick={() => {
                  setActiveTab('super_admin');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-bold transition-colors ${
                  activeTab === 'super_admin'
                    ? 'bg-gradient-to-r from-cyan-950 to-slate-900 text-cyan-300 border border-cyan-500/40 shadow-sm'
                    : 'text-cyan-400 hover:bg-slate-900/80'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-4 h-4 text-cyan-400" />
                  <span>{t('dash.superAdmin', 'Super Admin Hub')}</span>
                </div>
                {unassignedAssistants.length > 0 && (
                  <span className="text-[10px] font-mono bg-amber-950 text-amber-300 px-1.5 py-0.2 rounded border border-amber-800/50">
                    {unassignedAssistants.length}
                  </span>
                )}
              </button>
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-800 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.fallback}</span>
                </div>
                {item.count !== undefined && item.count > 0 && (
                  <span className="text-[10px] font-mono bg-cyan-950 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-800/50 tabular-nums">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Card & Signout Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/60 space-y-3">
          <div className="flex items-center gap-3">
            <img
              src="/src/assets/images/avatar_enterprise_admin_1792055215335.jpg"
              alt="User profile avatar"
              className="w-9 h-9 rounded-full object-cover border border-slate-700"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-bold text-white truncate">{user?.fullName || 'User'}</div>
              <div className="text-[10px] font-mono text-cyan-400 truncate">
                {user?.role ? user.role.replace('_', ' ').toUpperCase() : 'CUSTOMER'}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-900 transition-colors"
              title={t('nav.logout', 'Sign Out')}
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 px-6 py-4 bg-[#080C15]/90 backdrop-blur-md border-b border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
            <button onClick={() => setActiveTab('overview')} className="hover:text-white transition-colors">
              AuraVoice
            </button>
            {user?.organizationName && (
              <>
                <span>/</span>
                <span className="text-cyan-400 font-semibold truncate max-w-[140px] sm:max-w-xs">
                  {user.organizationName}
                </span>
              </>
            )}
            <span>/</span>
            <span className="text-white font-semibold">{getActiveTabTitle()}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Language Selector in Dashboard Top Bar */}
            <LanguageSelector />

            <button
              onClick={() => syncVapiAssistants()}
              disabled={loadingSync}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-all disabled:opacity-50"
              title="Sync assistant records"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${loadingSync ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{loadingSync ? 'Syncing...' : t('dash.syncAssistants', 'Sync Assistants')}</span>
            </button>

            <button
              onClick={() => onNavigate('/')}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition-colors"
            >
              Public Page
            </button>
          </div>
        </header>

        {/* Tab View Container */}
        <div className="p-6 md:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'overview' && <OverviewTab onNavigateTab={(tab) => setActiveTab(tab)} />}
          {activeTab === 'live_calls' && <LiveCallsTab />}
          {activeTab === 'agents' && <AgentsTab onNavigateTab={(tab) => setActiveTab(tab)} />}
          {activeTab === 'conversations' && <ConversationsTab />}
          {activeTab === 'knowledge_base' && <KnowledgeBaseTab />}
          {activeTab === 'workflows' && <WorkflowsTab />}
          {activeTab === 'integrations' && <IntegrationsTab onNavigateTab={(tab) => setActiveTab(tab)} />}
          {activeTab === 'analytics' && <AnalyticsTab />}
          {activeTab === 'leads' && <LeadsTab />}
          {activeTab === 'appointments' && <AppointmentsTab />}
          {activeTab === 'settings' && <SettingsTab />}
          {activeTab === 'super_admin' && <SuperAdminTab />}
        </div>
      </main>
    </div>
  );
};
