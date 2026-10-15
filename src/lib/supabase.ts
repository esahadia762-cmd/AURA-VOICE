import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration keys for local overrides
const STORAGE_KEY_URL = 'auravoice_supabase_url';
const STORAGE_KEY_ANON = 'auravoice_supabase_anon';

export function getStoredSupabaseConfig() {
  const url = localStorage.getItem(STORAGE_KEY_URL) || (import.meta as any).env.VITE_SUPABASE_URL || '';
  const anonKey = localStorage.getItem(STORAGE_KEY_ANON) || (import.meta as any).env.VITE_SUPABASE_ANON_KEY || '';
  return { url: url.trim(), anonKey: anonKey.trim() };
}

export function saveStoredSupabaseConfig(url: string, anonKey: string) {
  if (url) localStorage.setItem(STORAGE_KEY_URL, url.trim());
  if (anonKey) localStorage.setItem(STORAGE_KEY_ANON, anonKey.trim());
  initSupabaseClient(url.trim(), anonKey.trim());
}

let supabaseInstance: SupabaseClient | null = null;

export function initSupabaseClient(url?: string, anonKey?: string): SupabaseClient | null {
  const config = getStoredSupabaseConfig();
  const effectiveUrl = url || config.url;
  const effectiveKey = anonKey || config.anonKey;

  if (effectiveUrl && effectiveKey && effectiveUrl.startsWith('http')) {
    try {
      supabaseInstance = createClient(effectiveUrl, effectiveKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
      return supabaseInstance;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }
  return null;
}

// Initial bootstrap
initSupabaseClient();

export function getSupabase(): SupabaseClient | null {
  if (!supabaseInstance) {
    const config = getStoredSupabaseConfig();
    if (config.url && config.anonKey) {
      return initSupabaseClient(config.url, config.anonKey);
    }
  }
  return supabaseInstance;
}
