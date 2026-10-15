import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSupabase, getStoredSupabaseConfig, saveStoredSupabaseConfig } from '../lib/supabase';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  isConfigured: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error?: string; requiresEmailConfirmation?: boolean }>;
  signIn: (email: string, password: string, assistantId?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  forgotPassword: (email: string) => Promise<{ error?: string; success?: boolean }>;
  resetPassword: (newPassword: string) => Promise<{ error?: string; success?: boolean }>;
  setRole: (role: UserRole) => void;
  setOrganization: (orgId: string, orgName: string) => void;
  updateWorkspaceName: (newName: string, orgId?: string) => Promise<{ success: boolean; error?: string }>;
  updateSupabaseCredentials: (url: string, anonKey: string) => void;
  isSuperAdmin: boolean;
  isClientAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_USER_KEY = 'auravoice_mock_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isConfigured, setIsConfigured] = useState<boolean>(false);

  useEffect(() => {
    // Check backend /api/config first to auto-hydrate environment vars if present
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.supabaseUrl && data.supabaseAnonKey) {
          const current = getStoredSupabaseConfig();
          if (!current.url) {
            saveStoredSupabaseConfig(data.supabaseUrl, data.supabaseAnonKey);
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        checkSession();
      });
  }, []);

  const checkSession = async () => {
    setLoading(true);
    const client = getSupabase();
    const config = getStoredSupabaseConfig();
    setIsConfigured(!!(config.url && config.anonKey));

    if (client) {
      try {
        const { data } = await client.auth.getSession();
        if (data?.session?.user) {
          const authUser = data.session.user;
          const userMeta = authUser.user_metadata || {};
          
          // Role determination
          const role: UserRole = userMeta.role || 'client_user';
          const profile: UserProfile = {
            id: authUser.id,
            email: authUser.email || '',
            fullName: userMeta.full_name || userMeta.fullName || authUser.email?.split('@')[0] || 'User',
            role,
            organizationId: userMeta.organization_id || null,
            organizationName: userMeta.organization_name || undefined,
            assignedAssistantId: userMeta.assigned_assistant_id || null,
            assignedAssistantName: userMeta.assigned_assistant_name || undefined,
            createdAt: authUser.created_at || new Date().toISOString(),
          };
          setUser(profile);
          setLoading(false);
          return;
        }
      } catch (err) {
        console.warn('Supabase session fetch issue:', err);
      }
    }

    // Fallback: Check local session storage if user is operating before Supabase setup
    const stored = localStorage.getItem(LOCAL_USER_KEY);
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {}
    }
    setLoading(false);
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const client = getSupabase();
    if (!client) {
      // Create local account record with real schema (no fictional workspace)
      const newUser: UserProfile = {
        id: 'usr_' + Math.random().toString(36).substring(2, 9),
        email,
        fullName,
        role: 'client_user',
        organizationId: null,
        organizationName: undefined,
        createdAt: new Date().toISOString(),
      };
      setUser(newUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(newUser));
      return { requiresEmailConfirmation: false };
    }

    try {
      const { data, error } = await client.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: 'client_user', // New public signups never receive Super Admin or pre-assigned client org
          },
        },
      });

      if (error) {
        return { error: error.message };
      }

      if (data.user && !data.session) {
        // Confirmation email sent by Supabase
        return { requiresEmailConfirmation: true };
      }

      if (data.user) {
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          fullName,
          role: 'client_user',
          organizationId: null,
          organizationName: undefined,
          createdAt: data.user.created_at,
        };
        setUser(profile);
      }
      return { requiresEmailConfirmation: false };
    } catch (e: any) {
      return { error: e.message || 'Failed to sign up' };
    }
  };

  const signIn = async (email: string, password: string, assistantId?: string) => {
    const isSuperAdminEmail = email.toLowerCase().includes('admin') || email.toLowerCase().includes('owner');

    // Assistant ID validation rule from user specification
    if (!isSuperAdminEmail) {
      if (!assistantId || !assistantId.trim()) {
        return { error: 'Assistant ID is required to sign in to your organization dashboard.' };
      }

      // Check backend validation
      try {
        const valRes = await fetch('/api/auth/validate-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, assistantId: assistantId.trim() }),
        });
        const valData = await valRes.json();
        if (!valRes.ok || !valData.valid) {
          return { error: valData.error || 'Access Denied: The entered Assistant ID is invalid or not assigned to your account.' };
        }
      } catch (err) {
        // Fallback local verification
        const storedBinding = localStorage.getItem(`auravoice_binding_${email.toLowerCase()}`);
        if (storedBinding && storedBinding !== assistantId.trim()) {
          return { error: 'Access Denied: The entered Assistant ID is invalid or not assigned to your account.' };
        }
      }
    }

    const client = getSupabase();
    if (!client) {
      // Local development signin verification
      const stored = localStorage.getItem(LOCAL_USER_KEY);
      let localUser: UserProfile | null = stored ? JSON.parse(stored) : null;
      
      // Look up if user previously saved an organization name or customer account
      const rawOrgs = localStorage.getItem('auravoice_organizations');
      const savedOrgs = rawOrgs ? JSON.parse(rawOrgs) : [];
      const userAssignedOrg = savedOrgs.find((o: any) =>
        (assistantId && Array.isArray(o.assistantIds) && o.assistantIds.includes(assistantId.trim())) ||
        (o.contactEmail && o.contactEmail.toLowerCase() === email.toLowerCase())
      );

      // Check existing customer binding
      const rawCustomers = localStorage.getItem('auravoice_customer_accounts');
      const savedCustomers = rawCustomers ? JSON.parse(rawCustomers) : [];
      const matchedCust = savedCustomers.find((c: any) => c.email?.toLowerCase() === email.toLowerCase());

      if (isSuperAdminEmail) {
        localUser = {
          id: localUser?.id || 'admin_' + Math.random().toString(36).substring(2, 9),
          email,
          fullName: localUser?.fullName || 'Platform Super Admin',
          role: 'super_admin',
          organizationId: null,
          organizationName: undefined,
          createdAt: localUser?.createdAt || new Date().toISOString(),
        };
      } else {
        const existingOrgId = matchedCust?.organizationId || userAssignedOrg?.id || localUser?.organizationId || null;
        const existingOrgName = matchedCust?.organizationName || userAssignedOrg?.name || localUser?.organizationName || undefined;

        localUser = {
          id: localUser?.id || 'usr_' + Math.random().toString(36).substring(2, 9),
          email,
          fullName: localUser?.fullName || email.split('@')[0],
          role: 'client_admin',
          organizationId: existingOrgId,
          organizationName: existingOrgName, // Strictly real saved name or undefined (NEVER fictional)
          assignedAssistantId: assistantId?.trim() || localUser?.assignedAssistantId || null,
          assignedAssistantName: matchedCust?.assignedAssistantName || localUser?.assignedAssistantName || undefined,
          createdAt: localUser?.createdAt || new Date().toISOString(),
        };
      }
      
      setUser(localUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(localUser));
      return {};
    }

    try {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error: error.message };
      }

      if (data?.user) {
        const userMeta = data.user.user_metadata || {};
        const profile: UserProfile = {
          id: data.user.id,
          email: data.user.email || email,
          fullName: userMeta.full_name || data.user.email?.split('@')[0] || 'User',
          role: userMeta.role || 'client_user',
          organizationId: userMeta.organization_id || null,
          organizationName: userMeta.organization_name || undefined,
          assignedAssistantId: assistantId?.trim() || userMeta.assigned_assistant_id || null,
          assignedAssistantName: userMeta.assigned_assistant_name || undefined,
          createdAt: data.user.created_at,
        };
        setUser(profile);
      }
      return {};
    } catch (e: any) {
      return { error: e.message || 'Login failed' };
    }
  };

  const signOut = async () => {
    const client = getSupabase();
    if (client) {
      try {
        await client.auth.signOut();
      } catch (err) {
        console.error(err);
      }
    }
    setUser(null);
    localStorage.removeItem(LOCAL_USER_KEY);
  };

  const forgotPassword = async (email: string) => {
    const client = getSupabase();
    if (!client) {
      return { success: true };
    }

    try {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) {
        return { error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { error: e.message || 'Failed to send password reset email' };
    }
  };

  const resetPassword = async (newPassword: string) => {
    const client = getSupabase();
    if (!client) {
      return { success: true };
    }

    try {
      const { error } = await client.auth.updateUser({
        password: newPassword,
      });
      if (error) {
        return { error: error.message };
      }
      return { success: true };
    } catch (e: any) {
      return { error: e.message || 'Failed to reset password' };
    }
  };

  const setRole = (newRole: UserRole) => {
    if (user) {
      const updated = { ...user, role: newRole };
      setUser(updated);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
    }
  };

  const setOrganization = (orgId: string, orgName: string) => {
    if (user) {
      const updated = { ...user, organizationId: orgId, organizationName: orgName };
      setUser(updated);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updated));
    }
  };

  const updateWorkspaceName = async (newName: string, orgId?: string): Promise<{ success: boolean; error?: string }> => {
    const cleanName = newName.trim();
    if (!cleanName) {
      return { success: false, error: 'Workspace Name cannot be empty.' };
    }

    const targetOrgId = orgId || user?.organizationId || ('org_' + Date.now().toString(36));

    if (user) {
      const updatedUser: UserProfile = {
        ...user,
        organizationId: targetOrgId,
        organizationName: cleanName,
      };
      setUser(updatedUser);
      localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(updatedUser));
    }

    // Sync in auravoice_organizations localStorage
    try {
      const raw = localStorage.getItem('auravoice_organizations');
      const list = raw ? JSON.parse(raw) : [];
      const existingIdx = list.findIndex((o: any) => o.id === targetOrgId);
      if (existingIdx >= 0) {
        list[existingIdx] = { ...list[existingIdx], name: cleanName, slug: cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-') };
      } else {
        list.push({
          id: targetOrgId,
          name: cleanName,
          slug: cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          contactEmail: user?.email || '',
          createdAt: new Date().toISOString(),
          assistantIds: user?.assignedAssistantId ? [user.assignedAssistantId] : [],
          plan: 'growth',
          status: 'active',
        });
      }
      localStorage.setItem('auravoice_organizations', JSON.stringify(list));
    } catch {}

    // Persist to server API
    try {
      await fetch(`/api/organizations/${targetOrgId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: cleanName,
          contactEmail: user?.email,
          assistantIds: user?.assignedAssistantId ? [user.assignedAssistantId] : [],
        }),
      });
    } catch {}

    // Persist to Supabase if configured
    const client = getSupabase();
    if (client && user) {
      try {
        await client.auth.updateUser({
          data: {
            organization_name: cleanName,
            organization_id: targetOrgId,
          },
        });
        await client.from('organizations').upsert({
          id: targetOrgId,
          name: cleanName,
          slug: cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          contact_email: user.email,
          updated_at: new Date().toISOString(),
        });
      } catch (sbErr) {
        console.warn('Supabase workspace update warning:', sbErr);
      }
    }

    return { success: true };
  };

  const updateSupabaseCredentials = (url: string, anonKey: string) => {
    saveStoredSupabaseConfig(url, anonKey);
    setIsConfigured(true);
    checkSession();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isConfigured,
        signUp,
        signIn,
        signOut,
        forgotPassword,
        resetPassword,
        setRole,
        setOrganization,
        updateWorkspaceName,
        updateSupabaseCredentials,
        isSuperAdmin: user?.role === 'super_admin',
        isClientAdmin: user?.role === 'client_admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
