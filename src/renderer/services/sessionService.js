import { supabase } from './supabase.js';
import { SESSION_CONFIG } from './config.js';

// In-memory storage for the current session
let currentSession = null;
let sessionCheckInterval = null;

// Session management service
const sessionService = {
  /**
   * Create a new session based on a validated interview code
   * @param {Object} codeData - Data from the validated interview code
   * @returns {Object} Session information
   */
  createSession: codeData => {
    const session = {
      id: `session_${Date.now()}`,
      startTime: new Date(),
      codeUsed: codeData.code,
      userId: codeData.user_id,
      valid: true,
      expiresAt: new Date(Date.now() + SESSION_CONFIG.timeout),
    };

    // Store session in memory
    currentSession = session;

    // Start session validity check interval
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
    }

    sessionCheckInterval = setInterval(() => {
      sessionService.checkSessionValidity();
    }, SESSION_CONFIG.checkInterval);

    // Optionally store session in Supabase for persistence
    // This depends on your requirements for session recovery
    sessionService.persistSession(session);

    return session;
  },

  /**
   * Check if current session is still valid
   * @returns {boolean} Whether the session is valid
   */
  checkSessionValidity: () => {
    if (!currentSession) {
      return false;
    }

    // Check if session has expired
    if (new Date() > new Date(currentSession.expiresAt)) {
      sessionService.terminateSession('Session expired');
      return false;
    }

    // Session is still valid
    return currentSession.valid;
  },

  /**
   * Get current session information
   * @returns {Object|null} Current session or null if no active session
   */
  getCurrentSession: () => {
    return currentSession;
  },

  /**
   * Terminate the current session
   * @param {string} reason - Reason for termination
   * @returns {boolean} Success status
   */
  terminateSession: (reason = 'User requested termination') => {
    if (!currentSession) {
      return false;
    }

    // Update session data
    currentSession.valid = false;
    currentSession.terminatedAt = new Date();
    currentSession.terminationReason = reason;

    // Clear check interval
    if (sessionCheckInterval) {
      clearInterval(sessionCheckInterval);
      sessionCheckInterval = null;
    }

    // Update session in Supabase if persistence is needed
    sessionService.updatePersistedSession(currentSession);

    // Clear session from memory after a short delay to allow any final operations
    setTimeout(() => {
      currentSession = null;
    }, 1000);

    return true;
  },

  /**
   * Persist session data to Supabase for recovery
   * @param {Object} session - Session data to persist
   * @private
   */
  persistSession: async session => {
    try {
      const { error } = await supabase.from('sessions').insert([
        {
          session_id: session.id,
          code: session.codeUsed,
          user_id: session.userId,
          start_time: session.startTime,
          expires_at: session.expiresAt,
          valid: session.valid,
        },
      ]);

      if (error) {
        console.error('Error persisting session:', error);
      }
    } catch (error) {
      console.error('Exception during session persistence:', error);
    }
  },

  /**
   * Update persisted session data in Supabase
   * @param {Object} session - Updated session data
   * @private
   */
  updatePersistedSession: async session => {
    try {
      const { error } = await supabase
        .from('sessions')
        .update({
          valid: session.valid,
          terminated_at: session.terminatedAt,
          termination_reason: session.terminationReason,
        })
        .eq('session_id', session.id);

      if (error) {
        console.error('Error updating persisted session:', error);
      }
    } catch (error) {
      console.error('Exception during session update:', error);
    }
  },

  /**
   * Recover session from Supabase if available
   * @returns {Promise<Object|null>} Recovered session or null
   */
  recoverSession: async () => {
    try {
      // Look for the most recent valid session
      const { data, error } = await supabase
        .from('sessions')
        .select('*')
        .eq('valid', true)
        .gt('expires_at', new Date().toISOString())
        .order('start_time', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      // Reconstruct session object
      const recoveredSession = {
        id: data.session_id,
        startTime: new Date(data.start_time),
        codeUsed: data.code,
        userId: data.user_id,
        valid: data.valid,
        expiresAt: new Date(data.expires_at),
      };

      // Store in memory
      currentSession = recoveredSession;

      // Restart session check interval
      if (sessionCheckInterval) {
        clearInterval(sessionCheckInterval);
      }

      sessionCheckInterval = setInterval(() => {
        sessionService.checkSessionValidity();
      }, SESSION_CONFIG.checkInterval);

      return recoveredSession;
    } catch (error) {
      console.error('Exception during session recovery:', error);
      return null;
    }
  },
};

// Add event listener for app closing to terminate session
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (currentSession && currentSession.valid) {
      sessionService.terminateSession('Application closed');
    }
  });
}

export default sessionService;
