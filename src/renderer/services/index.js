// Services index file

// Import all services
import { supabase, initSupabase } from './supabase';
import { validateCode, getValidationLog } from './validationService';
import sessionService from './sessionService';
import {
  initialize as initAuth,
  authenticate,
  logout,
  getAuthState,
  authEvents,
} from './authService';
import secureStorage from './secureStorage';
import { SUPABASE_CONFIG, SESSION_CONFIG, MONITORING_CONFIG, ENV, DEBUG_CONFIG } from './config';

// Initialize all services
const initializeServices = async () => {
  console.log('Initializing services...');

  // Start auth service initialization which will handle Supabase connection
  const authInitialized = await initAuth();

  if (!authInitialized) {
    console.error('Failed to initialize authentication service.');
    return false;
  }

  console.log('Services initialized successfully.');
  return true;
};

// Export all services and utilities
export {
  // Authentication
  supabase,
  initSupabase,
  validateCode,
  getValidationLog,
  sessionService,
  authenticate,
  logout,
  getAuthState,
  authEvents,

  // Storage
  secureStorage,

  // Configuration
  SUPABASE_CONFIG,
  SESSION_CONFIG,
  MONITORING_CONFIG,
  ENV,
  DEBUG_CONFIG,

  // Main initialization
  initializeServices,
};
