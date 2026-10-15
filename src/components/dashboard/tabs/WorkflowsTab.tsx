import React, { useState } from 'react';
import {
  GitFork,
  Plus,
  Play,
  CheckCircle2,
  AlertCircle,
  Zap,
  Globe,
  Mail,
  Calendar,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useData } from '../../../context/DataContext';

export const WorkflowsTab: React.FC = () => {
  const { user, isSuperAdmin } = useAuth();
  const { workflows, toggleWorkflow, addWorkflow } = useData();

  const userOrgId = user?.organizationId || 'default_org';
  const orgWorkflows = isSuperAdmin && !user?.organizationId
    ? workflows
    : workflows.filter((w) => w.organizationId === userOrgId);

  const [name, setName] = useState('');
  const [trigger, setTrigger] = useState<'call_ended' | 'lead_qualified' | 'appointment_booked'>('call_ended');
  const [action, setAction] = useState<'send_webhook' | 'email_alert' | 'crm_sync' | 'calendar_invite'>('send_webhook');
  const [webhookUrl, setWebhookUrl] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    addWorkflow({
      organizationId: userOrgId,
      name,
      trigger,
      action,
      active: true,
      webhookUrl: action === 'send_webhook' ? webhookUrl : undefined,
    });

    setName('');
    setWebhookUrl('');
    setShowAddModal(false);
  };

  const getTriggerLabel = (trig: string) => {
    switch (trig) {
      case 'call_ended':
        return 'Call Ended';
      case 'lead_qualified':
        return 'Lead Qualified (Score > 80)';
      case 'appointment_booked':
        return 'Appointment Booked';
      default:
        return trig;
    }
  };

  const getActionLabel = (act: string) => {
    switch (act) {
      case 'send_webhook':
        return 'Dispatch Webhook Payload';
      case 'email_alert':
        return 'Notify Account Executives';
      case 'crm_sync':
        return 'Push Record to CRM Hub';
      case 'calendar_invite':
        return 'Generate Google / Outlook Invite';
      default:
        return act;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight">Automation Workflows</h2>
          <p className="text-xs text-slate-400">
            Define programmatic triggers, webhook dispatches, and automated follow-ups upon call completion.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs shadow-md shadow-cyan-500/20 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Workflow</span>
        </button>
      </div>

      {/* Workflow Rule Cards */}
      {orgWorkflows.length === 0 ? (
        <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Zap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">No Automation Workflows Configured</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              Create rules to automatically sync call records to your webhook endpoints, notify team members, or book calendar events.
            </p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold text-xs transition-all"
          >
            Create First Workflow
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {orgWorkflows.map((wf) => (
            <div
              key={wf.id}
              className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/70 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <Zap className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-bold text-white">{wf.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        wf.active
                          ? 'bg-emerald-950/80 text-emerald-400 border-emerald-800/40'
                          : 'bg-slate-950 text-slate-400 border-slate-800'
                      }`}
                    >
                      {wf.active ? 'ACTIVE' : 'PAUSED'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex flex-wrap items-center gap-2">
                    <span>When <strong className="text-slate-200">{getTriggerLabel(wf.trigger)}</strong></span>
                    <span>&rarr;</span>
                    <span>Then <strong className="text-cyan-400">{getActionLabel(wf.action)}</strong></span>
                  </div>
                  {wf.webhookUrl && (
                    <div className="text-[11px] font-mono text-slate-500 truncate max-w-md">
                      Endpoint: {wf.webhookUrl}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4 self-end sm:self-center">
                <div className="text-right text-[11px] font-mono text-slate-400">
                  <div className="tabular-nums text-white font-bold">{wf.executionCount}</div>
                  <div>Runs</div>
                </div>

                <button
                  onClick={() => toggleWorkflow(wf.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    wf.active
                      ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      : 'bg-cyan-500/10 text-cyan-400 hover:bg-cyan-500/20 border border-cyan-500/30'
                  }`}
                >
                  {wf.active ? 'Pause' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Workflow Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Create Automation Workflow</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Rule Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Sync Hot Leads to Webhook"
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">When (Trigger)</label>
                <select
                  value={trigger}
                  onChange={(e: any) => setTrigger(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs"
                >
                  <option value="call_ended">Call Ended (All)</option>
                  <option value="lead_qualified">Lead Qualified (Score &gt;= 80)</option>
                  <option value="appointment_booked">Appointment Booked</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Then (Action)</label>
                <select
                  value={action}
                  onChange={(e: any) => setAction(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs"
                >
                  <option value="send_webhook">Send HTTP Webhook</option>
                  <option value="crm_sync">Push Contact to CRM</option>
                  <option value="email_alert">Send Email Alert</option>
                  <option value="calendar_invite">Send Calendar Invite</option>
                </select>
              </div>

              {action === 'send_webhook' && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">Destination Webhook URL</label>
                  <input
                    type="url"
                    required
                    value={webhookUrl}
                    onChange={(e) => setWebhookUrl(e.target.value)}
                    placeholder="https://api.yourdomain.com/vapi/webhook"
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:outline-none text-white text-xs font-mono"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-semibold"
                >
                  Save Workflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
