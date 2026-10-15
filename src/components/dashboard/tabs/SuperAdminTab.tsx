import React, { useState, useEffect } from 'react';
import {
  Shield,
  Building2,
  Bot,
  Plus,
  RefreshCw,
  Phone,
  UserCheck,
  FileText,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Layers,
  ArrowRight,
  KeyRound,
  UserPlus,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';
import { CustomerAccount } from '../../../types';

export const SuperAdminTab: React.FC = () => {
  const { user } = useAuth();
  const {
    organizations,
    createOrganization,
    deleteOrganization,
    assistants,
    unassignedAssistants,
    assignAssistantToOrg,
    phoneNumbers,
    addPhoneNumber,
    auditLogs,
    syncVapiAssistants,
    loadingSync,
    calls,
  } = useData();

  // Sub-tab navigation
  const [subTab, setSubTab] = useState<
    'overview' | 'customers' | 'organizations' | 'unassigned' | 'assistants' | 'phone_numbers' | 'audit_logs'
  >('customers');

  // Customer Accounts state (strictly real accounts, NO fictional presets)
  const [customers, setCustomers] = useState<CustomerAccount[]>(() => {
    const raw = localStorage.getItem('auravoice_customer_accounts');
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch {}
    }
    return [];
  });

  const saveCustomers = (newList: CustomerAccount[]) => {
    setCustomers(newList);
    localStorage.setItem('auravoice_customer_accounts', JSON.stringify(newList));
  };

  // Create Customer Modal
  const [showCustModal, setShowCustModal] = useState(false);
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custOrgId, setCustOrgId] = useState('');
  const [custAssistantId, setCustAssistantId] = useState('');
  const [custFeedback, setCustFeedback] = useState<string | null>(null);

  // Reassign Modal
  const [reassignCustomer, setReassignCustomer] = useState<CustomerAccount | null>(null);
  const [newAssignedId, setNewAssignedId] = useState('');

  // New Organization Modal
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [plan, setPlan] = useState<'enterprise' | 'growth' | 'starter'>('growth');

  // New Phone Number Modal
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phoneNum, setPhoneNum] = useState('');
  const [phoneAssistantId, setPhoneAssistantId] = useState('');

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!custEmail || !custAssistantId) return;

    const matchedOrg = organizations.find((o) => o.id === custOrgId);
    const matchedAsst = assistants.find((a) => a.id === custAssistantId);

    const newCust: CustomerAccount = {
      id: 'cust_' + Date.now().toString(36),
      email: custEmail.toLowerCase().trim(),
      fullName: custName.trim() || custEmail.split('@')[0],
      organizationId: custOrgId || undefined,
      organizationName: matchedOrg?.name || undefined,
      assignedAssistantId: custAssistantId.trim(),
      assignedAssistantName: matchedAsst?.name || 'Voice Agent',
      createdAt: new Date().toISOString(),
      status: 'active',
    };

    const updated = [newCust, ...customers];
    saveCustomers(updated);

    // Call backend to bind assistant
    try {
      await fetch('/api/auth/bind-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: custEmail, assistantId: custAssistantId }),
      });
    } catch {}

    // Store local fallback binding
    localStorage.setItem(`auravoice_binding_${custEmail.toLowerCase().trim()}`, custAssistantId.trim());

    setCustFeedback(`Customer account created! Assistant ID ${custAssistantId} assigned to ${custEmail}.`);
    setCustName('');
    setCustEmail('');
    setCustOrgId('');
    setCustAssistantId('');
    setShowCustModal(false);
    setTimeout(() => setCustFeedback(null), 5000);
  };

  const handleReassign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reassignCustomer || !newAssignedId) return;

    const matchedAsst = assistants.find((a) => a.id === newAssignedId);
    const updated = customers.map((c) =>
      c.id === reassignCustomer.id
        ? {
            ...c,
            assignedAssistantId: newAssignedId.trim(),
            assignedAssistantName: matchedAsst?.name || 'Voice Agent',
          }
        : c
    );
    saveCustomers(updated);

    try {
      await fetch('/api/auth/bind-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: reassignCustomer.email, assistantId: newAssignedId }),
      });
    } catch {}

    localStorage.setItem(`auravoice_binding_${reassignCustomer.email.toLowerCase()}`, newAssignedId.trim());

    setCustFeedback(`Assistant ID updated to ${newAssignedId} for ${reassignCustomer.email}.`);
    setReassignCustomer(null);
    setNewAssignedId('');
    setTimeout(() => setCustFeedback(null), 5000);
  };

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName || !contactEmail) return;

    createOrganization({
      name: orgName,
      slug: orgSlug || orgName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      contactEmail,
      plan,
      status: 'active',
    });

    setOrgName('');
    setOrgSlug('');
    setContactEmail('');
    setShowOrgModal(false);
  };

  const handleCreatePhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNum) return;

    const matched = assistants.find((a) => a.id === phoneAssistantId);
    addPhoneNumber({
      number: phoneNum,
      assistantId: phoneAssistantId || undefined,
      assistantName: matched?.name,
      provider: 'vapi-twilio',
      status: 'active',
    });

    setPhoneNum('');
    setPhoneAssistantId('');
    setShowPhoneModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">Super Admin Platform Hub</h2>
              <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-800/40">
                MASTER CONSOLE
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Provision customer accounts, assign dedicated Assistant IDs, and audit tenant boundaries.
            </p>
          </div>
        </div>

        <button
          onClick={() => syncVapiAssistants()}
          disabled={loadingSync}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all self-start sm:self-auto disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loadingSync ? 'animate-spin' : ''}`} />
          <span>{loadingSync ? 'Discovering...' : 'Discover Assistants'}</span>
        </button>
      </div>

      {custFeedback && (
        <div className="p-3.5 rounded-lg bg-cyan-950/70 border border-cyan-500/40 text-cyan-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>{custFeedback}</span>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto text-xs font-medium">
        <button
          onClick={() => setSubTab('customers')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            subTab === 'customers' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Manage Customers ({customers.length})
        </button>
        <button
          onClick={() => setSubTab('overview')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            subTab === 'overview' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Platform Overview
        </button>
        <button
          onClick={() => setSubTab('organizations')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            subTab === 'organizations' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Client Organizations ({organizations.length})
        </button>
        <button
          onClick={() => setSubTab('unassigned')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            subTab === 'unassigned' ? 'bg-slate-800 text-amber-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Unassigned Pool ({unassignedAssistants.length})
        </button>
        <button
          onClick={() => setSubTab('assistants')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            subTab === 'assistants' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          All Assistants ({assistants.length})
        </button>
        <button
          onClick={() => setSubTab('phone_numbers')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            subTab === 'phone_numbers' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Phone Numbers ({phoneNumbers.length})
        </button>
        <button
          onClick={() => setSubTab('audit_logs')}
          className={`px-3.5 py-2 rounded-lg transition-colors whitespace-nowrap shrink-0 ${
            subTab === 'audit_logs' ? 'bg-slate-800 text-cyan-400 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          Audit Logs ({auditLogs.length})
        </button>
      </div>

      {/* SUB-TAB: Manage Customers (Core Business Model Workflow) */}
      {subTab === 'customers' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Customer Accounts & Assistant ID Bindings
              </h3>
              <p className="text-xs text-slate-400">
                Customers can only sign in and access data when their email and Assistant ID match this registry.
              </p>
            </div>

            <button
              onClick={() => setShowCustModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all self-start sm:self-auto"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Customer Account</span>
            </button>
          </div>

          <div className="overflow-x-auto bg-slate-900/80 rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase font-mono text-[11px]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Customer</th>
                  <th className="px-5 py-3 font-semibold">Login Email</th>
                  <th className="px-5 py-3 font-semibold">Organization</th>
                  <th className="px-5 py-3 font-semibold">Assigned Assistant ID</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-white">{c.fullName}</td>
                    <td className="px-5 py-3.5 font-mono text-slate-300">{c.email}</td>
                    <td className="px-5 py-3.5 text-slate-400">{c.organizationName || 'N/A'}</td>
                    <td className="px-5 py-3.5 font-mono">
                      <span className="text-cyan-400 bg-cyan-950/90 px-2 py-0.5 rounded border border-cyan-800/50">
                        {c.assignedAssistantId}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40 uppercase">
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => {
                          setReassignCustomer(c);
                          setNewAssignedId(c.assignedAssistantId);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                      >
                        Change Assistant
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB: Platform Overview */}
      {subTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Customer Accounts</span>
                <Building2 className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                {customers.length}
              </div>
              <div className="text-[11px] text-slate-400">Authenticated customer profiles</div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Discovered Voice Agents</span>
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                {assistants.length}
              </div>
              <div className="text-[11px] text-amber-400 font-mono">
                {unassignedAssistants.length} in unassigned pool
              </div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Total Calls</span>
                <Phone className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                {calls.length}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">Platform-wide volume</div>
            </div>

            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>PSTN Phone Numbers</span>
                <Phone className="w-4 h-4 text-purple-400" />
              </div>
              <div className="text-3xl font-extrabold text-white font-mono tabular-nums">
                {phoneNumbers.length}
              </div>
              <div className="text-[11px] text-slate-400 font-mono">Inbound phone lines</div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white tracking-wide uppercase">
              Super Admin SaaS Operations Model
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="font-bold text-cyan-400">1. Configure in Voice Infrastructure</div>
                <p className="text-slate-400 leading-relaxed">
                  You configure AI voice assistants in your voice infrastructure. AuraVoice imports them and obtains each unique Assistant ID.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="font-bold text-blue-400">2. Create Customer & Assign Assistant ID</div>
                <p className="text-slate-400 leading-relaxed">
                  You create the customer account and assign their specific Assistant ID.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-2">
                <div className="font-bold text-emerald-400">3. Customer Log In & Isolation</div>
                <p className="text-slate-400 leading-relaxed">
                  Customer logs in with Email, Password, and Assistant ID. Their dashboard displays strictly their assistant&apos;s data.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB: Organizations */}
      {subTab === 'organizations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Client Organizations
            </h3>
            <button
              onClick={() => setShowOrgModal(true)}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Client Organization</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {organizations.map((org) => {
              const orgAssigned = assistants.filter((a) => a.assignedOrgId === org.id);
              return (
                <div
                  key={org.id}
                  className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{org.name}</h4>
                        <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/40 uppercase">
                          {org.plan}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        Slug: {org.slug}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteOrganization(org.id)}
                      className="text-slate-500 hover:text-red-400 p-1 transition-colors"
                      title="Delete organization"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 space-y-1.5 text-xs">
                    <div className="text-slate-300">Contact: {org.contactEmail}</div>
                    <div className="text-slate-400">
                      Assigned Agents: <strong className="text-white">{orgAssigned.length}</strong>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB: Unassigned Assistants */}
      {subTab === 'unassigned' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Unassigned Assistants Pool
              </h3>
              <p className="text-xs text-slate-400">
                Assistants discovered from voice infrastructure awaiting customer/organization assignment.
              </p>
            </div>
          </div>

          {unassignedAssistants.length === 0 ? (
            <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
              <h4 className="text-sm font-bold text-white">All Discovered Assistants Assigned</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                No unassigned assistants in queue. Click &quot;Discover Assistants&quot; to fetch newly configured agents.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {unassignedAssistants.map((assistant) => (
                <div
                  key={assistant.id}
                  className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{assistant.name}</span>
                      <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                        Unassigned
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 font-mono">
                      Assistant ID: {assistant.id}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          assignAssistantToOrg(assistant.id, e.target.value);
                        }
                      }}
                      defaultValue=""
                      className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs font-medium focus:border-cyan-500 focus:outline-none"
                    >
                      <option value="" disabled>
                        Assign to Organization...
                      </option>
                      {organizations.map((org) => (
                        <option key={org.id} value={org.id}>
                          {org.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB: All Assistants */}
      {subTab === 'assistants' && (
        <div className="space-y-4">
          <div className="overflow-x-auto bg-slate-900/80 rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase font-mono text-[11px]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Assistant Name</th>
                  <th className="px-5 py-3 font-semibold">Assistant ID</th>
                  <th className="px-5 py-3 font-semibold">Assigned Organization</th>
                  <th className="px-5 py-3 font-semibold text-right">Reassign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {assistants.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-white">{a.name}</td>
                    <td className="px-5 py-3.5 font-mono text-cyan-400 text-[11px]">{a.id}</td>
                    <td className="px-5 py-3.5">
                      {a.assignedOrgName ? (
                        <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/40">
                          {a.assignedOrgName}
                        </span>
                      ) : (
                        <span className="text-[11px] font-mono text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/40">
                          Unassigned
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <select
                        value={a.assignedOrgId || ''}
                        onChange={(e) => assignAssistantToOrg(a.id, e.target.value || null)}
                        className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none"
                      >
                        <option value="">Unassigned</option>
                        {organizations.map((org) => (
                          <option key={org.id} value={org.id}>
                            {org.name}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB: Phone Numbers */}
      {subTab === 'phone_numbers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Telephony Phone Numbers
            </h3>
            <button
              onClick={() => setShowPhoneModal(true)}
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Link Phone Number</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {phoneNumbers.map((pn) => (
              <div key={pn.id} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-white">{pn.number}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800/40">
                    ACTIVE
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  Assistant ID: <strong className="text-cyan-400 font-mono">{pn.assistantId || 'Unlinked'}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SUB-TAB: Audit Logs */}
      {subTab === 'audit_logs' && (
        <div className="space-y-4">
          <div className="overflow-x-auto bg-slate-900/80 rounded-xl border border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/70 border-b border-slate-800 text-slate-400 uppercase font-mono text-[11px]">
                <tr>
                  <th className="px-5 py-3 font-semibold">Timestamp</th>
                  <th className="px-5 py-3 font-semibold">Actor</th>
                  <th className="px-5 py-3 font-semibold">Action</th>
                  <th className="px-5 py-3 font-semibold">Target</th>
                  <th className="px-5 py-3 font-semibold">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3 font-mono text-slate-400 text-[11px]">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-slate-300">{log.actorEmail}</td>
                    <td className="px-5 py-3 font-mono text-cyan-400 font-semibold">{log.action}</td>
                    <td className="px-5 py-3 text-slate-300 font-mono text-[11px]">
                      {log.targetType}:{log.targetId}
                    </td>
                    <td className="px-5 py-3 text-slate-400">{log.details}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL: Create Customer Account */}
      {showCustModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create Customer Account</h3>
              <button
                onClick={() => setShowCustModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Customer Name</label>
                <input
                  type="text"
                  required
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Login Email Address</label>
                <input
                  type="email"
                  required
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  placeholder="customer@company.com"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Organization</label>
                <select
                  value={custOrgId}
                  onChange={(e) => setCustOrgId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs"
                >
                  <option value="">-- Direct Customer Account --</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Assigned Assistant ID
                </label>
                <input
                  type="text"
                  required
                  value={custAssistantId}
                  onChange={(e) => setCustAssistantId(e.target.value)}
                  placeholder="e.g. asst_..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs font-mono"
                />
                {assistants.length > 0 && (
                  <div className="mt-2">
                    <span className="text-[11px] text-slate-400 block mb-1">Or pick discovered assistant:</span>
                    <select
                      onChange={(e) => setCustAssistantId(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono"
                    >
                      <option value="">Select from discovered assistants...</option>
                      {assistants.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold"
                >
                  Save & Bind Assistant ID
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Reassign Assistant ID */}
      {reassignCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Change Assistant Assignment</h3>
              <button
                onClick={() => setReassignCustomer(null)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleReassign} className="space-y-4">
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-1">
                <div className="text-slate-400">Target Customer</div>
                <div className="font-semibold text-white">{reassignCustomer.fullName} ({reassignCustomer.email})</div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  New Assistant ID
                </label>
                <input
                  type="text"
                  required
                  value={newAssignedId}
                  onChange={(e) => setNewAssignedId(e.target.value)}
                  placeholder="asst_..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs font-mono"
                />

                {assistants.length > 0 && (
                  <div className="mt-2">
                    <span className="text-[11px] text-slate-400 block mb-1">Or pick from assistants:</span>
                    <select
                      onChange={(e) => setNewAssignedId(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-cyan-300 font-mono"
                    >
                      <option value="">Select assistant...</option>
                      {assistants.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.id})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setReassignCustomer(null)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold"
                >
                  Update Binding
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Create Client Organization */}
      {showOrgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create Client Organization</h3>
              <button
                onClick={() => setShowOrgModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateOrg} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Organization Name</label>
                <input
                  type="text"
                  required
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Acme Health Systems"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Identifier Slug</label>
                <input
                  type="text"
                  value={orgSlug}
                  onChange={(e) => setOrgSlug(e.target.value)}
                  placeholder="acme-health"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Client Contact Email</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  placeholder="admin@acmehealth.com"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Tier Plan</label>
                <select
                  value={plan}
                  onChange={(e: any) => setPlan(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs"
                >
                  <option value="growth">Growth ($499/mo)</option>
                  <option value="enterprise">Enterprise ($1,299/mo)</option>
                  <option value="starter">Starter ($199/mo)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowOrgModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold"
                >
                  Provision Organization
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Link Phone Number */}
      {showPhoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Link Phone Number</h3>
              <button
                onClick={() => setShowPhoneModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreatePhone} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Phone Number (E.164 format)</label>
                <input
                  type="tel"
                  required
                  value={phoneNum}
                  onChange={(e) => setPhoneNum(e.target.value)}
                  placeholder="+1 (800) 555-0199"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Route to Assistant ID</label>
                <select
                  value={phoneAssistantId}
                  onChange={(e) => setPhoneAssistantId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs"
                >
                  <option value="">-- No Direct Assistant Linked --</option>
                  {assistants.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.id})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPhoneModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold"
                >
                  Save Number
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
