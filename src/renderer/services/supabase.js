import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from './config.js';

// Create a single supabase client for interacting with the database
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.key);

// Helper functions for authentication and interview code validation
const validateInterviewCode = async code => {
  try {
    const { data, error } = await supabase
      .from('interview_codes')
      .select('*')
      .eq('code', code)
      .eq('active', true)
      .gte('expiration', new Date().toISOString())
      .single();

    if (error) {
      console.error('Error validating interview code:', error);
      return { valid: false, error: error.message };
    }

    if (!data) {
      return { valid: false, error: 'Invalid, expired, or inactive interview code' };
    }

    return { valid: true, data };
  } catch (error) {
    console.error('Exception during interview code validation:', error);
    return { valid: false, error: 'An unexpected error occurred' };
  }
};

// Initialize Supabase client
const initSupabase = () => {
  // Verify connection to Supabase
  const verifyConnection = async () => {
    try {
      const { error } = await supabase
        .from('interview_codes')
        .select('count', { count: 'exact' })
        .limit(1);

      if (error) {
        console.error('Failed to connect to Supabase:', error);
        return false;
      }

      console.log('Successfully connected to Supabase');
      return true;
    } catch (error) {
      console.error('Exception during Supabase connection verification:', error);
      return false;
    }
  };

  return verifyConnection();
};

export { supabase, validateInterviewCode, initSupabase };
