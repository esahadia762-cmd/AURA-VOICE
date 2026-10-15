export type UserRole = 'super_admin' | 'client_admin' | 'client_user';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  organizationId?: string | null;
  organizationName?: string;
  assignedAssistantId?: string | null;
  assignedAssistantName?: string | null;
  createdAt: string;
  avatarUrl?: string;
}

export interface CustomerAccount {
  id: string;
  email: string;
  fullName: string;
  organizationId?: string | null;
  organizationName?: string | null;
  assignedAssistantId: string;
  assignedAssistantName?: string;
  createdAt: string;
  status: 'active' | 'pending';
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  phone?: string;
  createdAt: string;
  assistantIds: string[];
  plan: 'enterprise' | 'growth' | 'starter';
  status: 'active' | 'suspended';
}

export interface VapiAssistant {
  id: string;
  name: string;
  createdAt?: string;
  updatedAt?: string;
  model?: {
    provider?: string;
    model?: string;
    systemPrompt?: string;
    temperature?: number;
  };
  voice?: {
    provider?: string;
    voiceId?: string;
    stability?: number;
    similarityBoost?: number;
  };
  firstMessage?: string;
  recordingEnabled?: boolean;
  transcriber?: {
    provider?: string;
    model?: string;
    language?: string;
  };
  assignedOrgId?: string | null;
  assignedOrgName?: string | null;
}

export interface ToolCallInvocation {
  id: string;
  name: string;
  toolCallId?: string;
  arguments?: Record<string, any> | string;
  result?: Record<string, any> | string;
  status?: 'success' | 'failed' | 'executed';
  timestamp?: string | number;
}

export interface VapiCall {
  id: string;
  assistantId: string;
  assistantName?: string;
  organizationId?: string;
  type: 'inboundPhoneCall' | 'outboundPhoneCall' | 'webCall';
  status: 'started' | 'in-progress' | 'ended' | 'queued' | 'ringing';
  startedAt?: string;
  endedAt?: string;
  durationSeconds?: number;
  customerNumber?: string;
  transcript?: string;
  summary?: string;
  recordingUrl?: string;
  stereoRecordingUrl?: string;
  streamUrl?: string;
  cost?: number;
  endedReason?: string;
  toolCalls?: ToolCallInvocation[];
  messages?: Array<{
    role: string;
    message?: string;
    content?: string;
    time?: number;
    secondsFromStart?: number;
    toolCalls?: any[];
    toolCallId?: string;
    result?: any;
    name?: string;
  }>;
  analysis?: {
    sentiment?: 'Positive' | 'Neutral' | 'Negative';
    qualificationScore?: number;
    actionItems?: string[];
  };
}

export interface KnowledgeDocument {
  id: string;
  organizationId: string;
  title: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  status: 'indexed' | 'processing' | 'failed';
  uploadedAt: string;
  tokenCount: number;
  description?: string;
}

export interface Lead {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  status: 'New' | 'Contacted' | 'Qualified' | 'Meeting Booked' | 'Closed';
  score: number;
  sourceCallId?: string;
  assistantName?: string;
  notes?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  organizationId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  scheduledTime: string;
  durationMinutes: number;
  assistantName: string;
  status: 'Confirmed' | 'Pending' | 'Rescheduled' | 'Cancelled';
  notes?: string;
  meetingLink?: string;
}

export interface WorkflowRule {
  id: string;
  organizationId: string;
  name: string;
  trigger: 'call_ended' | 'lead_qualified' | 'appointment_booked' | 'call_failed';
  action: 'send_webhook' | 'email_alert' | 'crm_sync' | 'calendar_invite';
  active: boolean;
  lastRunAt?: string;
  executionCount: number;
  webhookUrl?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: string;
  details: string;
  ipAddress?: string;
}

export interface PhoneNumber {
  id: string;
  number: string;
  assistantId?: string;
  assistantName?: string;
  provider: string;
  status: 'active' | 'pending';
}
