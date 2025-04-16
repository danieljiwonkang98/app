import { validateCode } from './validationService.js';
import sessionService from './sessionService.js';
import { initSupabase } from './supabase.js';

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

// Simulate API delay for development
const simulateApiDelay = () => new Promise(resolve => setTimeout(resolve, 1500));

/**
 * Authenticate a user with an interview code
 * @param {string} code - The interview code
 * @returns {Promise<Object>} - Authentication result
 */
export const authenticateWithCode = async (code) => {
  try {
    // Simulate API call delay
    await simulateApiDelay();
    
    // For development: mock successful authentication for specific test codes
    if (code === '123456') {
      return {
        success: true,
        data: {
          userId: 'test-user-id',
          sessionId: 'test-session-' + Date.now(),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
        }
      };
    }
    
    // TODO: Replace with actual API call to authentication server
    // const response = await fetch('api/auth/interview-code', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ code }),
    // });
    
    // if (!response.ok) {
    //   const errorData = await response.json();
    //   throw new Error(errorData.message || 'Authentication failed');
    // }
    
    // return await response.json();
    
    // For development: mock failed authentication for any other code
    throw new Error('Invalid interview code. Please check and try again.');
  } catch (error) {
    return {
      success: false,
      error: error.message || 'Authentication failed'
    };
  }
};

/**
 * Check if user is currently authenticated
 * @returns {boolean} - True if user is authenticated
 */
export const isAuthenticated = () => {
  // TODO: Implement actual auth check logic
  // Check if auth token exists and is not expired
  const authData = localStorage.getItem('auth_data');
  if (!authData) return false;
  
  try {
    const { expiresAt } = JSON.parse(authData);
    return new Date(expiresAt) > new Date();
  } catch (error) {
    return false;
  }
};

/**
 * Save authentication data to local storage
 * @param {Object} authData - Authentication data to store
 */
export const saveAuthData = (authData) => {
  localStorage.setItem('auth_data', JSON.stringify(authData));
};

/**
 * Export module interface
 */
export default {
  on: authEvents.on,
  off: authEvents.off,
  initialize,
  authenticate,
  logout,
  getAuthState
};

