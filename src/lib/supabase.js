import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if we are in a "Real" environment
// For GitHub Pages (Static Mode), we often want to fallback to LocalStorage
const isConfigured =
    typeof supabaseUrl === 'string' &&
    supabaseUrl.startsWith('https://') &&
    !supabaseUrl.includes('your_supabase_url_here') &&
    !supabaseUrl.includes('placeholder');

// Fallback values that pass Supabase client validation (to prevent constructor crash)
const FALLBACK_URL = 'https://placeholder.supabase.co';
const FALLBACK_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvbWUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYxMjM0NTY3OCwiZXhwIjoxOTI3OTAzNjc4fQ.STATIC_MODE_TOKEN_SIGNATURE';

const urlToUse = isConfigured ? supabaseUrl : FALLBACK_URL;
const keyToUse = isConfigured ? supabaseAnonKey : FALLBACK_KEY;

/**
 * Supabase Client Instance
 * Will use placeholder credentials if not configured, allowing app to boot.
 */
export const supabase = createClient(urlToUse, keyToUse, {
    auth: {
        persistSession: true,
        autoRefreshToken: isConfigured,
        detectSessionInUrl: isConfigured
    }
});

/**
 * Helper to check if backend is ready
 * @returns {Promise<boolean>}
 */
export const checkBackendConnection = async () => {
    if (!isConfigured) return false;

    try {
        const { error } = await supabase.from('profiles').select('count', { count: 'exact', head: true });
        return !error;
    } catch (_err) {
        return false;
    }
};

export const isSupabaseConfigured = isConfigured;
