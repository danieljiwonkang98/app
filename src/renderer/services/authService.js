import { validateCode } from './validationService';
import sessionService from './sessionService';
import { initSupabase } from './supabase';

// Event bus for auth-related events
const authEvents = {
  listeners: {},

  /**
   * Add event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  on: (event, callback) => {
    if (!authEvents.listeners[event]) {
      authEvents.listeners[event] = [];
    }
    authEvents.listeners[event].push(callback);
  },

  /**
   * Remove event listener
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  off: (event, callback) => {
    if (!authEvents.listeners[event]) return;

    const index = authEvents.listeners[event].indexOf(callback);
    if (index !== -1) {
      authEvents.listeners[event].splice(index, 1);
    }
  },

  /**
   * Emit event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit: (event, data) => {
    if (!authEvents.listeners[event]) return;

    authEvents.listeners[event].forEach(callback => {
      callback(data);
    });
  },
};

// Authentication state
let authState = {
  initialized: false,
  authenticated: false,
  initializing: false,
  error: null,
};

/**
 * Initialize the authentication service
 * @returns {Promise<boolean>} Success status
 */
const initialize = async () => {
  // Prevent multiple initialization
  if (authState.initializing || authState.initialized) {
    return authState.initialized;
  }

  authState.initializing = true;
  authEvents.emit('initializing', { message: 'Initializing authentication service' });

  try {
    // Initialize Supabase connection
    const connected = await initSupabase();

    if (!connected) {
      authState.error = 'Failed to connect to authentication service';
      authState.initialized = false;
      authState.initializing = false;
      authEvents.emit('init_error', { message: authState.error });
      return false;
    }

    // Try to recover session if available
    const session = await sessionService.recoverSession();
    if (session) {
      authState.authenticated = true;
      authEvents.emit('authenticated', { session, recovered: true });
    }

    authState.initialized = true;
    authState.initializing = false;
    authEvents.emit('initialized', { message: 'Authentication service initialized' });

    return true;
  } catch (error) {
    console.error('Error initializing authentication service:', error);
    authState.error = error.message || 'Unknown error during initialization';
    authState.initialized = false;
    authState.initializing = false;
    authEvents.emit('init_error', { message: authState.error, error });

    return false;
  }
};

/**
 * Authenticate user with interview code
 * @param {string} code - Interview code
 * @returns {Promise<Object>} Authentication result
 */
const authenticate = async code => {
  // Make sure service is initialized
  if (!authState.initialized) {
    const initialized = await initialize();
    if (!initialized) {
      return {
        success: false,
        error: authState.error || 'Authentication service not initialized',
      };
    }
  }

  try {
    // Validate interview code
    authEvents.emit('validating', { message: 'Validating interview code' });
    const validation = await validateCode(code);

    if (!validation.valid) {
      authState.error = validation.error;
      authEvents.emit('auth_error', { message: validation.error });
      return { success: false, error: validation.error };
    }

    // Create session
    authEvents.emit('creating_session', { message: 'Creating session' });
    const session = sessionService.createSession(validation.data);

    // Update auth state
    authState.authenticated = true;
    authState.error = null;

    // Emit authenticated event
    authEvents.emit('authenticated', { session, recovered: false });

    return { success: true, session };
  } catch (error) {
    console.error('Error during authentication:', error);
    authState.error = error.message || 'Unknown authentication error';
    authEvents.emit('auth_error', { message: authState.error, error });

    return { success: false, error: authState.error };
  }
};

/**
 * Log out current user
 * @param {string} reason - Reason for logout
 * @returns {boolean} Success status
 */
const logout = (reason = 'User initiated logout') => {
  if (!authState.authenticated) {
    return false;
  }

  // Terminate session
  const success = sessionService.terminateSession(reason);

  if (success) {
    // Update auth state
    authState.authenticated = false;

    // Emit event
    authEvents.emit('logout', { message: 'User logged out', reason });
  }

  return success;
};

/**
 * Get current authentication state
 * @returns {Object} Authentication state
 */
const getAuthState = () => {
  return {
    ...authState,
    session: authState.authenticated ? sessionService.getCurrentSession() : null,
  };
};

// Initialize on module load
if (typeof window !== 'undefined') {
  // Wait for DOM to be ready
  if (document.readyState === 'complete') {
    initialize();
  } else {
    window.addEventListener('load', () => {
      initialize();
    });
  }
}

export { initialize, authenticate, logout, getAuthState, authEvents };
