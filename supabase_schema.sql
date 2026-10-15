-- =========================================================================
-- AURAVOICE ENTERPRISE AI VOICE AGENT SAAS — DATABASE SCHEMA & RLS POLICIES
-- Target: Supabase PostgreSQL with Row Level Security (RLS) and pgvector
-- =========================================================================

-- Enable pgvector extension for AI Knowledge Base semantic search
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations Table (Multi-tenant boundary)
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    contact_email TEXT NOT NULL,
    phone TEXT,
    plan TEXT NOT NULL DEFAULT 'growth' CHECK (plan IN ('starter', 'growth', 'enterprise')),
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. User Profiles Table (Linked with Supabase Auth auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'client_user' CHECK (role IN ('super_admin', 'client_admin', 'client_user')),
    organization_id UUID REFERENCES public.organizations(id) ON DELETE SET NULL,
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Vapi Assistant Organization Assignments (Mapping Vapi ID to Client Tenant)
CREATE TABLE IF NOT EXISTS public.assistant_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vapi_assistant_id TEXT NOT NULL UNIQUE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES public.profiles(id),
    name TEXT NOT NULL,
    model TEXT,
    voice_id TEXT,
    assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Call Records & Transcripts
CREATE TABLE IF NOT EXISTS public.calls (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vapi_call_id TEXT NOT NULL UNIQUE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    vapi_assistant_id TEXT NOT NULL,
    call_type TEXT NOT NULL CHECK (call_type IN ('inboundPhoneCall', 'outboundPhoneCall', 'webCall')),
    status TEXT NOT NULL DEFAULT 'ended',
    customer_number TEXT,
    duration_seconds INTEGER DEFAULT 0,
    cost NUMERIC(10, 4) DEFAULT 0.0000,
    transcript TEXT,
    summary TEXT,
    recording_url TEXT,
    sentiment TEXT CHECK (sentiment IN ('Positive', 'Neutral', 'Negative')),
    qualification_score INTEGER CHECK (qualification_score >= 0 AND qualification_score <= 100),
    started_at TIMESTAMPTZ,
    ended_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Leads & CRM Contacts
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT NOT NULL,
    company TEXT,
    status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Meeting Booked', 'Closed')),
    score INTEGER DEFAULT 50 CHECK (score >= 0 AND score <= 100),
    source_call_id UUID REFERENCES public.calls(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Appointments & Consultations
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    contact_name TEXT NOT NULL,
    contact_email TEXT,
    contact_phone TEXT NOT NULL,
    scheduled_time TIMESTAMPTZ NOT NULL,
    duration_minutes INTEGER NOT NULL DEFAULT 30,
    assistant_name TEXT,
    status TEXT NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Pending', 'Rescheduled', 'Cancelled')),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. Knowledge Base Documents (pgvector embeddings for semantic retrieval)
CREATE TABLE IF NOT EXISTS public.knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type TEXT NOT NULL DEFAULT 'application/pdf',
    token_count INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    status TEXT NOT NULL DEFAULT 'indexed' CHECK (status IN ('processing', 'indexed', 'failed')),
    embedding vector(1536), -- Vector representation for RAG retrieval
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Automation Workflows
CREATE TABLE IF NOT EXISTS public.workflows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    trigger_event TEXT NOT NULL,
    action_type TEXT NOT NULL,
    webhook_url TEXT,
    active BOOLEAN NOT NULL DEFAULT true,
    execution_count INTEGER NOT NULL DEFAULT 0,
    last_run_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Security & Operations Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_id UUID REFERENCES public.profiles(id),
    actor_email TEXT NOT NULL,
    action TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id TEXT NOT NULL,
    details TEXT,
    ip_address TEXT,
    timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =========================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Strict multi-tenant isolation enforcing client organization data boundaries
-- =========================================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assistant_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check if authenticated user is Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function to get current user's organization_id
CREATE OR REPLACE FUNCTION public.get_user_organization_id()
RETURNS UUID AS $$
DECLARE
  org_id UUID;
BEGIN
  SELECT organization_id INTO org_id FROM public.profiles
  WHERE id = auth.uid();
  RETURN org_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Organizations RLS
CREATE POLICY "Super Admins can manage all organizations"
    ON public.organizations FOR ALL
    TO authenticated
    USING (public.is_super_admin());

CREATE POLICY "Client users can view their own organization"
    ON public.organizations FOR SELECT
    TO authenticated
    USING (id = public.get_user_organization_id());

-- Calls RLS
CREATE POLICY "Super Admins can view all calls"
    ON public.calls FOR ALL
    TO authenticated
    USING (public.is_super_admin());

CREATE POLICY "Tenants can only access their organization's calls"
    ON public.calls FOR ALL
    TO authenticated
    USING (organization_id = public.get_user_organization_id());

-- Leads RLS
CREATE POLICY "Super Admins can access all leads"
    ON public.leads FOR ALL
    TO authenticated
    USING (public.is_super_admin());

CREATE POLICY "Tenants can only access their organization's leads"
    ON public.leads FOR ALL
    TO authenticated
    USING (organization_id = public.get_user_organization_id());

-- Appointments RLS
CREATE POLICY "Super Admins can access all appointments"
    ON public.appointments FOR ALL
    TO authenticated
    USING (public.is_super_admin());

CREATE POLICY "Tenants can only access their organization's appointments"
    ON public.appointments FOR ALL
    TO authenticated
    USING (organization_id = public.get_user_organization_id());

-- Knowledge Documents RLS
CREATE POLICY "Super Admins can access all documents"
    ON public.knowledge_documents FOR ALL
    TO authenticated
    USING (public.is_super_admin());

CREATE POLICY "Tenants can only access their organization's documents"
    ON public.knowledge_documents FOR ALL
    TO authenticated
    USING (organization_id = public.get_user_organization_id());
