import { createClient } from '@supabase/supabase-js';
import config from '../config/environment';

if (!config.supabase.url || !config.supabase.anonKey) {
  throw new Error(
    'Missing Supabase configuration. Please check your environment variables.'
  );
}

export const supabase = createClient(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      redirectTo: config.supabase.redirectTo,
    },
  }
);

// Helper function to get table name with environment prefix
export const getTableName = tableName => {
  return `${config.api.tablePrefix}${tableName}`;
};

// Auth helper functions
export const authHelpers = {
  // Sign up with email and password
  signUp: async (email, password, userData = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData,
        emailRedirectTo: config.supabase.redirectTo,
      },
    });
    return { data, error };
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current session
  getSession: async () => {
    const { data, error } = await supabase.auth.getSession();
    return { data, error };
  },

  // Get current user
  getUser: async () => {
    const { data, error } = await supabase.auth.getUser();
    return { data, error };
  },

  // Resend verification email
  resendVerification: async email => {
    const { data, error } = await supabase.auth.resend({
      type: 'signup',
      email,
      options: {
        emailRedirectTo: config.supabase.redirectTo,
      },
    });
    return { data, error };
  },
};

export default supabase;
