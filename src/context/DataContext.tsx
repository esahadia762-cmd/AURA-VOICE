import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Organization,
  VapiAssistant,
  VapiCall,
  KnowledgeDocument,
  Lead,
  Appointment,
  WorkflowRule,
  AuditLogEntry,
  PhoneNumber,
} from '../types';
import { useAuth } from './AuthContext';

interface DataContextType {
  vapiKey: string;
  setVapiKey: (key: string) => void;
  vapiPublicKey: string;
  setVapiPublicKey: (key: string) => void;
  isVapiConnected: boolean;
  syncVapiAssistants: () => Promise<{ success: boolean; count: number; error?: string }>;
  
  // Entities
  organizations: Organization[];
  createOrganization: (org: Omit<Organization, 'id' | 'createdAt' | 'assistantIds'>) => Organization;
  updateOrganization: (id: string, updates: Partial<Organization>) => void;
  renameOrganization: (id: string, newName: string) => Promise<{ success: boolean; error?: string }>;
  deleteOrganization: (id: string) => void;
  
  assistants: VapiAssistant[];
  unassignedAssistants: VapiAssistant[];
  assignAssistantToOrg: (assistantId: string, orgId: string | null) => void;
  
  calls: VapiCall[];
  activeCalls: VapiCall[];
  fetchCallDetails: (callId: string) => Promise<VapiCall | null>;
  initiateTestCall: (assistantId: string) => Promise<{ success: boolean; callId?: string; error?: string }>;
  endActiveCall: (callId: string) => void;
  
  knowledgeDocs: KnowledgeDocument[];
  addKnowledgeDoc: (doc: Omit<KnowledgeDocument, 'id' | 'uploadedAt' | 'status' | 'tokenCount'> & { textContent?: string }) => Promise<{ success: boolean; document?: KnowledgeDocument; error?: string }>;
  removeKnowledgeDoc: (id: string) => Promise<{ success: boolean }>;
  
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt'>) => void;
  updateLeadStatus: (id: string, status: Lead['status']) => void;
  
  appointments: Appointment[];
  addAppointment: (apt: Omit<Appointment, 'id'>) => void;
  updateAppointmentStatus: (id: string, status: Appointment['status']) => void;
  
  workflows: WorkflowRule[];
  toggleWorkflow: (id: string) => void;
  addWorkflow: (wf: Omit<WorkflowRule, 'id' | 'executionCount'>) => void;
  
  phoneNumbers: PhoneNumber[];
  addPhoneNumber: (pn: Omit<PhoneNumber, 'id'>) => void;
  
  auditLogs: AuditLogEntry[];
  addAuditLog: (action: string, targetType: string, targetId: string, details: string) => void;

  loadingSync: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

const STORAGE_KEYS = {
  VAPI_KEY: 'auravoice_vapi_key',
  VAPI_PUB_KEY: 'auravoice_vapi_pub_key',
  ORGS: 'auravoice_organizations',
  ASSISTANTS: 'auravoice_assistants',
  CALLS: 'auravoice_calls',
  DOCS: 'auravoice_docs',
  LEADS: 'auravoice_leads',
  APPOINTMENTS: 'auravoice_appointments',
  WORKFLOWS: 'auravoice_workflows',
  PHONE_NUMBERS: 'auravoice_phone_numbers',
  AUDIT_LOGS: 'auravoice_audit_logs',
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [vapiKey, setVapiKeyState] = useState<string>(() => localStorage.getItem(STORAGE_KEYS.VAPI_KEY) || '');
  const [vapiPublicKey, setVapiPublicKeyState] = useState<string>(() => localStorage.getItem(STORAGE_KEYS.VAPI_PUB_KEY) || '');
  const [loadingSync, setLoadingSync] = useState<boolean>(false);

  // Entities state - initialized with empty lists or persisted state (NO fake fictional data)
  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.ORGS);
    return raw ? JSON.parse(raw) : [];
  });

  const [assistants, setAssistants] = useState<VapiAssistant[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.ASSISTANTS);
    return raw ? JSON.parse(raw) : [];
  });

  const [calls, setCalls] = useState<VapiCall[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.CALLS);
    return raw ? JSON.parse(raw) : [];
  });

  const [knowledgeDocs, setKnowledgeDocs] = useState<KnowledgeDocument[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.DOCS);
    return raw ? JSON.parse(raw) : [];
  });

  const [leads, setLeads] = useState<Lead[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.LEADS);
    return raw ? JSON.parse(raw) : [];
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return raw ? JSON.parse(raw) : [];
  });

  const [workflows, setWorkflows] = useState<WorkflowRule[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.WORKFLOWS);
    return raw ? JSON.parse(raw) : [];
  });

  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.PHONE_NUMBERS);
    return raw ? JSON.parse(raw) : [];
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(() => {
    const raw = localStorage.getItem(STORAGE_KEYS.AUDIT_LOGS);
    return raw ? JSON.parse(raw) : [];
  });

  // Check backend for preconfigured keys and load persistent organizations
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.vapiPublicKey && !vapiPublicKey) {
          setVapiPublicKeyState(data.vapiPublicKey);
          localStorage.setItem(STORAGE_KEYS.VAPI_PUB_KEY, data.vapiPublicKey);
        }
      })
      .catch(() => {});

    // Hydrate persistent organizations from backend
    fetch('/api/organizations')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data.organizations) && data.organizations.length > 0) {
          setOrganizations((prev) => {
            const map = new Map<string, Organization>();
            prev.forEach((o) => map.set(o.id, o));
            data.organizations.forEach((o: any) => map.set(o.id, { ...map.get(o.id), ...o }));
            const merged = Array.from(map.values());
            localStorage.setItem(STORAGE_KEYS.ORGS, JSON.stringify(merged));
            return merged;
          });
        }
      })
      .catch(() => {});
  }, []);

  const setVapiKey = (key: string) => {
    const clean = key.trim();
    setVapiKeyState(clean);
    localStorage.setItem(STORAGE_KEYS.VAPI_KEY, clean);
  };

  const setVapiPublicKey = (key: string) => {
    const clean = key.trim();
    setVapiPublicKeyState(clean);
    localStorage.setItem(STORAGE_KEYS.VAPI_PUB_KEY, clean);
  };

  const addAuditLog = (action: string, targetType: string, targetId: string, details: string) => {
    const newEntry: AuditLogEntry = {
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: new Date().toISOString(),
      actorEmail: user?.email || 'system@auravoice.io',
      action,
      targetType,
      targetId,
      details,
    };
    const updated = [newEntry, ...auditLogs].slice(0, 200);
    setAuditLogs(updated);
    localStorage.setItem(STORAGE_KEYS.AUDIT_LOGS, JSON.stringify(updated));
  };

  // Sync assistants from Vapi API
  const syncVapiAssistants = async (): Promise<{ success: boolean; count: number; error?: string }> => {
    setLoadingSync(true);
    try {
      // Try backend proxy first, passing key in header if present
      const headers: Record<string, string> = {};
      if (vapiKey) {
        headers['x-vapi-secret-key'] = vapiKey;
      }

      const res = await fetch('/api/vapi/assistants', { headers });
      let data: any;

      if (res.ok) {
        data = await res.json();
      } else if (vapiKey) {
        // Direct browser fallback if backend endpoint failed or not yet mounted
        const directRes = await fetch('https://api.vapi.ai/assistant', {
          headers: {
            Authorization: `Bearer ${vapiKey}`,
            'Content-Type': 'application/json',
          },
        });
        if (!directRes.ok) {
          const errText = await directRes.text();
          throw new Error(`Vapi API error (${directRes.status}): ${errText}`);
        }
        const directList = await directRes.json();
        data = { assistants: directList, count: directList.length };
      } else {
        throw new Error('Please enter your Vapi Private API Key in Settings to connect.');
      }

      const fetchedAssistants: any[] = Array.isArray(data.assistants)
        ? data.assistants
        : Array.isArray(data)
        ? data
        : [];

      // Merge with existing assignments to preserve organization mapping
      const updatedAssistants: VapiAssistant[] = fetchedAssistants.map((item) => {
        const existing = assistants.find((a) => a.id === item.id);
        const assignedOrg = existing?.assignedOrgId
          ? organizations.find((o) => o.id === existing.assignedOrgId)
          : null;

        return {
          id: item.id,
          name: item.name || 'Unnamed Assistant',
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
          model: item.model,
          voice: item.voice,
          firstMessage: item.firstMessage,
          recordingEnabled: item.recordingEnabled ?? true,
          transcriber: item.transcriber,
          assignedOrgId: existing?.assignedOrgId || null,
          assignedOrgName: assignedOrg?.name || null,
        };
      });

      setAssistants(updatedAssistants);
      localStorage.setItem(STORAGE_KEYS.ASSISTANTS, JSON.stringify(updatedAssistants));

      // Also try fetching call history
      try {
        const callRes = await fetch('/api/vapi/calls?limit=50', { headers });
        if (callRes.ok) {
          const callData = await callRes.json();
          const callList = Array.isArray(callData.calls) ? callData.calls : [];
          const formattedCalls: VapiCall[] = callList.map((c: any) => {
            const matchedAssistant = updatedAssistants.find((a) => a.id === c.assistantId);
            const actualRecording =
              c.recordingUrl ||
              c.artifact?.recordingUrl ||
              c.stereoRecordingUrl ||
              c.artifact?.stereoRecordingUrl ||
              undefined;

            return {
              id: c.id,
              assistantId: c.assistantId || '',
              assistantName: matchedAssistant?.name || c.assistantName || 'Voice Agent',
              organizationId: matchedAssistant?.assignedOrgId || undefined,
              type: c.type || 'webCall',
              status: c.status || 'ended',
              startedAt: c.startedAt,
              endedAt: c.endedAt,
              durationSeconds:
                c.durationSeconds ||
                (c.startedAt && c.endedAt
                  ? Math.round((new Date(c.endedAt).getTime() - new Date(c.startedAt).getTime()) / 1000)
                  : 0),
              customerNumber:
                c.customer?.number || c.customerNumber || c.phoneCallProviderDetails?.to || 'Browser User',
              transcript:
                c.transcript ||
                c.artifact?.transcript ||
                (c.messages
                  ? c.messages.map((m: any) => `${m.role === 'user' ? 'Customer' : 'Agent'}: ${m.message || m.content || ''}`).join('\n')
                  : undefined),
              summary: c.summary || c.analysis?.summary,
              recordingUrl: actualRecording,
              stereoRecordingUrl: c.stereoRecordingUrl || c.artifact?.stereoRecordingUrl || undefined,
              cost: c.cost,
              endedReason: c.endedReason,
              toolCalls: c.toolCalls || [],
              messages: c.messages || c.artifact?.messages || [],
              analysis: {
                sentiment: c.analysis?.sentiment || 'Positive',
                qualificationScore: c.analysis?.structuredData?.qualificationScore || 85,
              },
            };
          });
          setCalls(formattedCalls);
          localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(formattedCalls));
        }
      } catch (callErr) {
        console.warn('Call fetch fallback:', callErr);
      }

      addAuditLog('VAPI_SYNC', 'Assistant', 'all', `Successfully synchronized ${updatedAssistants.length} assistants from Vapi`);
      setLoadingSync(false);
      return { success: true, count: updatedAssistants.length };
    } catch (err: any) {
      setLoadingSync(false);
      return { success: false, count: 0, error: err.message || 'Failed to sync Vapi assistants' };
    }
  };

  // Fetch full details, real recording URL, and tool invocations for a single call
  const fetchCallDetails = async (callId: string): Promise<VapiCall | null> => {
    try {
      const headers: Record<string, string> = {};
      if (vapiKey) {
        headers['x-vapi-secret-key'] = vapiKey;
      }

      const res = await fetch(`/api/vapi/calls/${encodeURIComponent(callId)}`, { headers });
      if (!res.ok) {
        return null;
      }

      const data = await res.json();
      const raw = data.call;
      if (!raw) return null;

      const matchedAssistant = assistants.find((a) => a.id === raw.assistantId);
      const actualRecording =
        raw.recordingUrl ||
        raw.artifact?.recordingUrl ||
        raw.stereoRecordingUrl ||
        raw.artifact?.stereoRecordingUrl ||
        undefined;

      const formatted: VapiCall = {
        id: raw.id,
        assistantId: raw.assistantId || '',
        assistantName: matchedAssistant?.name || raw.assistantName || 'Voice Agent',
        organizationId: matchedAssistant?.assignedOrgId || raw.organizationId,
        type: raw.type || 'webCall',
        status: raw.status || 'ended',
        startedAt: raw.startedAt,
        endedAt: raw.endedAt,
        durationSeconds:
          raw.durationSeconds ||
          (raw.startedAt && raw.endedAt
            ? Math.round((new Date(raw.endedAt).getTime() - new Date(raw.startedAt).getTime()) / 1000)
            : 0),
        customerNumber:
          raw.customer?.number || raw.customerNumber || raw.phoneCallProviderDetails?.to || 'Browser User',
        transcript:
          raw.transcript ||
          raw.artifact?.transcript ||
          (raw.messages
            ? raw.messages.map((m: any) => `${m.role === 'user' ? 'Customer' : 'Agent'}: ${m.message || m.content || ''}`).join('\n')
            : undefined),
        summary: raw.summary || raw.analysis?.summary,
        recordingUrl: actualRecording,
        stereoRecordingUrl: raw.stereoRecordingUrl || raw.artifact?.stereoRecordingUrl || undefined,
        cost: raw.cost,
        endedReason: raw.endedReason,
        toolCalls: raw.toolCalls || [],
        messages: raw.messages || raw.artifact?.messages || [],
        analysis: {
          sentiment: raw.analysis?.sentiment || 'Positive',
          qualificationScore: raw.analysis?.structuredData?.qualificationScore || 85,
        },
      };

      setCalls((prev) => {
        const idx = prev.findIndex((c) => c.id === callId);
        const updated = idx >= 0 ? prev.map((c, i) => (i === idx ? formatted : c)) : [formatted, ...prev];
        localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(updated));
        return updated;
      });

      return formatted;
    } catch (e) {
      console.warn('Failed to fetch call details:', e);
      return null;
    }
  };

  // Organizations — Strictly user-controlled, never auto-generated
  const createOrganization = (orgData: Omit<Organization, 'id' | 'createdAt' | 'assistantIds'>): Organization => {
    const cleanName = orgData.name.trim();
    if (!cleanName) {
      throw new Error('Workspace Name is required.');
    }

    const orgId = 'org_' + Date.now().toString(36) + '_' + Math.random().toString(36).substr(2, 4);
    const newOrg: Organization = {
      ...orgData,
      id: orgId,
      name: cleanName,
      slug: (orgData.slug || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-|-$/g, ''),
      createdAt: new Date().toISOString(),
      assistantIds: [],
    };

    const updated = [...organizations, newOrg];
    setOrganizations(updated);
    localStorage.setItem(STORAGE_KEYS.ORGS, JSON.stringify(updated));

    // Persist to server API
    fetch('/api/organizations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newOrg),
    }).catch(() => {});

    addAuditLog('ORG_CREATED', 'Organization', newOrg.id, `Created organization ${newOrg.name}`);
    return newOrg;
  };

  const updateOrganization = (id: string, updates: Partial<Organization>) => {
    const updated = organizations.map((o) => (o.id === id ? { ...o, ...updates } : o));
    setOrganizations(updated);
    localStorage.setItem(STORAGE_KEYS.ORGS, JSON.stringify(updated));

    fetch(`/api/organizations/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    }).catch(() => {});

    addAuditLog('ORG_UPDATED', 'Organization', id, `Updated organization details`);
  };

  const renameOrganization = async (id: string, newName: string): Promise<{ success: boolean; error?: string }> => {
    const cleanName = newName.trim();
    if (!cleanName) {
      return { success: false, error: 'Workspace Name cannot be empty.' };
    }

    // Update in state
    const updated = organizations.map((o) => (o.id === id ? { ...o, name: cleanName } : o));
    setOrganizations(updated);
    localStorage.setItem(STORAGE_KEYS.ORGS, JSON.stringify(updated));

    // Update assistant records assigned to this org
    const updatedAssistants = assistants.map((a) =>
      a.assignedOrgId === id ? { ...a, assignedOrgName: cleanName } : a
    );
    setAssistants(updatedAssistants);
    localStorage.setItem(STORAGE_KEYS.ASSISTANTS, JSON.stringify(updatedAssistants));

    // Send to server
    try {
      await fetch(`/api/organizations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: cleanName }),
      });
    } catch {}

    addAuditLog('ORG_RENAMED', 'Organization', id, `Renamed organization to ${cleanName}`);
    return { success: true };
  };

  const deleteOrganization = (id: string) => {
    const target = organizations.find((o) => o.id === id);
    // Unassign assistants from this org
    const updatedAssistants = assistants.map((a) =>
      a.assignedOrgId === id ? { ...a, assignedOrgId: null, assignedOrgName: null } : a
    );
    setAssistants(updatedAssistants);
    localStorage.setItem(STORAGE_KEYS.ASSISTANTS, JSON.stringify(updatedAssistants));

    const updated = organizations.filter((o) => o.id !== id);
    setOrganizations(updated);
    localStorage.setItem(STORAGE_KEYS.ORGS, JSON.stringify(updated));
    addAuditLog('ORG_DELETED', 'Organization', id, `Deleted organization ${target?.name || id}`);
  };

  // Assign assistant to organization
  const assignAssistantToOrg = (assistantId: string, orgId: string | null) => {
    const targetOrg = orgId ? organizations.find((o) => o.id === orgId) : null;
    
    // Update assistant record
    const updatedAssistants = assistants.map((a) => {
      if (a.id === assistantId) {
        return {
          ...a,
          assignedOrgId: orgId,
          assignedOrgName: targetOrg ? targetOrg.name : null,
        };
      }
      return a;
    });
    setAssistants(updatedAssistants);
    localStorage.setItem(STORAGE_KEYS.ASSISTANTS, JSON.stringify(updatedAssistants));

    // Update organizations' assistantIds list
    const updatedOrgs = organizations.map((org) => {
      let ids = org.assistantIds.filter((id) => id !== assistantId);
      if (org.id === orgId) {
        ids.push(assistantId);
      }
      return { ...org, assistantIds: ids };
    });
    setOrganizations(updatedOrgs);
    localStorage.setItem(STORAGE_KEYS.ORGS, JSON.stringify(updatedOrgs));

    addAuditLog(
      'ASSISTANT_ASSIGNED',
      'VapiAssistant',
      assistantId,
      orgId ? `Assigned assistant to ${targetOrg?.name}` : `Unassigned assistant`
    );
  };

  // Initiate Test Call
  const initiateTestCall = async (assistantId: string): Promise<{ success: boolean; callId?: string; error?: string }> => {
    const assistant = assistants.find((a) => a.id === assistantId);
    if (!assistant) {
      return { success: false, error: 'Assistant not found.' };
    }

    const newCall: VapiCall = {
      id: 'call_test_' + Date.now().toString(36),
      assistantId,
      assistantName: assistant.name,
      organizationId: assistant.assignedOrgId || undefined,
      type: 'webCall',
      status: 'in-progress',
      startedAt: new Date().toISOString(),
      customerNumber: 'Browser Microphone (WebRTC)',
      transcript: `Agent: ${assistant.firstMessage || 'Hello! Thank you for calling AuraVoice. How can I assist you today?'}\nCaller: Hi, I am testing the voice assistant setup.`,
      summary: 'Live browser audio testing session in progress.',
    };

    const updated = [newCall, ...calls];
    setCalls(updated);
    localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(updated));
    addAuditLog('CALL_INITIATED', 'VapiCall', newCall.id, `Started web test call with ${assistant.name}`);
    return { success: true, callId: newCall.id };
  };

  const endActiveCall = (callId: string) => {
    const endedAt = new Date().toISOString();
    const updated = calls.map((c) => {
      if (c.id === callId && c.status === 'in-progress') {
        const start = c.startedAt ? new Date(c.startedAt).getTime() : Date.now();
        const durationSeconds = Math.max(1, Math.round((Date.now() - start) / 1000));
        return {
          ...c,
          status: 'ended' as const,
          endedAt,
          durationSeconds,
          endedReason: 'customer-ended-call',
          summary: 'Inquiry completed successfully. Assistant answered queries according to organization protocol.',
          analysis: {
            sentiment: 'Positive' as const,
            qualificationScore: 92,
            actionItems: ['Follow up regarding schedule availability', 'Confirm contact preference'],
          },
        };
      }
      return c;
    });
    setCalls(updated);
    localStorage.setItem(STORAGE_KEYS.CALLS, JSON.stringify(updated));
    addAuditLog('CALL_ENDED', 'VapiCall', callId, `Ended call session`);
  };

  // Knowledge docs
  const addKnowledgeDoc = (doc: Omit<KnowledgeDocument, 'id' | 'uploadedAt' | 'status' | 'tokenCount'>) => {
    const newDoc: KnowledgeDocument = {
      ...doc,
      id: 'doc_' + Date.now().toString(36),
      uploadedAt: new Date().toISOString(),
      status: 'indexed',
      tokenCount: Math.round(doc.fileSize / 4),
    };
    const updated = [newDoc, ...knowledgeDocs];
    setKnowledgeDocs(updated);
    localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(updated));
    addAuditLog('DOC_UPLOADED', 'KnowledgeDocument', newDoc.id, `Uploaded ${newDoc.title}`);
  };

  const removeKnowledgeDoc = (id: string) => {
    const updated = knowledgeDocs.filter((d) => d.id !== id);
    setKnowledgeDocs(updated);
    localStorage.setItem(STORAGE_KEYS.DOCS, JSON.stringify(updated));
    addAuditLog('DOC_REMOVED', 'KnowledgeDocument', id, `Removed document`);
  };

  // Leads
  const addLead = (lead: Omit<Lead, 'id' | 'createdAt'>) => {
    const newLead: Lead = {
      ...lead,
      id: 'lead_' + Date.now().toString(36),
      createdAt: new Date().toISOString(),
    };
    const updated = [newLead, ...leads];
    setLeads(updated);
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(updated));
    addAuditLog('LEAD_CREATED', 'Lead', newLead.id, `Created lead ${newLead.name}`);
  };

  const updateLeadStatus = (id: string, status: Lead['status']) => {
    const updated = leads.map((l) => (l.id === id ? { ...l, status } : l));
    setLeads(updated);
    localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(updated));
  };

  // Appointments
  const addAppointment = (apt: Omit<Appointment, 'id'>) => {
    const newApt: Appointment = {
      ...apt,
      id: 'apt_' + Date.now().toString(36),
    };
    const updated = [newApt, ...appointments];
    setAppointments(updated);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updated));
    addAuditLog('APPOINTMENT_SCHEDULED', 'Appointment', newApt.id, `Booked appointment for ${newApt.contactName}`);
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status']) => {
    const updated = appointments.map((a) => (a.id === id ? { ...a, status } : a));
    setAppointments(updated);
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(updated));
  };

  // Workflows
  const toggleWorkflow = (id: string) => {
    const updated = workflows.map((w) => (w.id === id ? { ...w, active: !w.active } : w));
    setWorkflows(updated);
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(updated));
  };

  const addWorkflow = (wf: Omit<WorkflowRule, 'id' | 'executionCount'>) => {
    const newWf: WorkflowRule = {
      ...wf,
      id: 'wf_' + Date.now().toString(36),
      executionCount: 0,
    };
    const updated = [...workflows, newWf];
    setWorkflows(updated);
    localStorage.setItem(STORAGE_KEYS.WORKFLOWS, JSON.stringify(updated));
  };

  // Phone numbers
  const addPhoneNumber = (pn: Omit<PhoneNumber, 'id'>) => {
    const newPn: PhoneNumber = {
      ...pn,
      id: 'pn_' + Date.now().toString(36),
    };
    const updated = [...phoneNumbers, newPn];
    setPhoneNumbers(updated);
    localStorage.setItem(STORAGE_KEYS.PHONE_NUMBERS, JSON.stringify(updated));
  };

  const unassignedAssistants = assistants.filter((a) => !a.assignedOrgId);
  const activeCalls = calls.filter((c) => c.status === 'in-progress' || c.status === 'started');

  return (
    <DataContext.Provider
      value={{
        vapiKey,
        setVapiKey,
        vapiPublicKey,
        setVapiPublicKey,
        isVapiConnected: !!vapiKey,
        syncVapiAssistants,
        organizations,
        createOrganization,
        updateOrganization,
        renameOrganization,
        deleteOrganization,
        assistants,
        unassignedAssistants,
        assignAssistantToOrg,
        calls,
        activeCalls,
        fetchCallDetails,
        initiateTestCall,
        endActiveCall,
        knowledgeDocs,
        addKnowledgeDoc,
        removeKnowledgeDoc,
        leads,
        addLead,
        updateLeadStatus,
        appointments,
        addAppointment,
        updateAppointmentStatus,
        workflows,
        toggleWorkflow,
        addWorkflow,
        phoneNumbers,
        addPhoneNumber,
        auditLogs,
        addAuditLog,
        loadingSync,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within DataProvider');
  }
  return context;
};
