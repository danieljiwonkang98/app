// Application configuration

// Helper to get environment variables with defaults
const getEnv = (key, defaultValue) => {
  // For Electron renderer process
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  // Fallback to window.__env in browser contexts
  if (typeof window !== 'undefined' && window.__env && window.__env[key]) {
    return window.__env[key];
  }
  return defaultValue;
};

// Supabase configuration
// TODO: Replace with actual values from your Supabase project
const SUPABASE_CONFIG = {
  url: getEnv('SUPABASE_URL', 'https://ieogsuoudcrzipfmkmca.supabase.co'),
  key: getEnv(
    'SUPABASE_KEY',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imllb2dzdW91ZGNyemlwZm1rbWNhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3MDI3NzksImV4cCI6MjA2MDI3ODc3OX0.mpEwbDwKQu9ffS2Admp2mOKVtatuY2dktV_lLWILDL0'
  ),
};

// Session configuration
const SESSION_CONFIG = {
  timeout: parseInt(getEnv('SESSION_TIMEOUT', 60 * 60 * 1000)), // 1 hour in milliseconds
  checkInterval: parseInt(getEnv('SESSION_CHECK_INTERVAL', 5 * 60 * 1000)), // Check every 5 minutes
};

// Monitoring configuration
const MONITORING_CONFIG = {
  screenCapture: {
    interval: parseInt(getEnv('SCREEN_CAPTURE_INTERVAL', 5000)), // Capture every 5 seconds
    quality: parseFloat(getEnv('SCREEN_CAPTURE_QUALITY', 0.7)), // JPEG quality (0-1)
  },
  processMonitoring: {
    interval: parseInt(getEnv('PROCESS_MONITORING_INTERVAL', 10000)), // Check processes every 10 seconds
  },
};

// App environment
const ENV = {
  isDevelopment: getEnv('NODE_ENV', 'development') === 'development',
  isProduction: getEnv('NODE_ENV', 'development') === 'production',
  isTest: getEnv('NODE_ENV', 'development') === 'test',
};

// Debug and logging configuration
const DEBUG_CONFIG = {
  enabled: ENV.isDevelopment || getEnv('DEBUG', 'false') === 'true',
  level: getEnv('DEBUG_LEVEL', ENV.isDevelopment ? 'debug' : 'warn'),
};

export { SUPABASE_CONFIG, SESSION_CONFIG, MONITORING_CONFIG, ENV, DEBUG_CONFIG };
