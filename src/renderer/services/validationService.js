import { validateInterviewCode } from './supabase.js';

// Simple in-memory rate limiting
const rateLimiter = {
  attempts: {},
  maxAttempts: 5, // Maximum attempts within timeWindow
  timeWindow: 60 * 1000, // 1 minute

  /**
   * Check if an IP address is rate limited
   * @param {string} identifier - IP address or other identifier
   * @returns {boolean} Whether the identifier is rate limited
   */
  isLimited: identifier => {
    // Clean up expired entries
    rateLimiter.cleanup();

    // Check if identifier exists and has reached max attempts
    if (
      rateLimiter.attempts[identifier] &&
      rateLimiter.attempts[identifier].count >= rateLimiter.maxAttempts
    ) {
      return true;
    }

    return false;
  },

  /**
   * Record an attempt for an identifier
   * @param {string} identifier - IP address or other identifier
   */
  recordAttempt: identifier => {
    const now = Date.now();

    if (!rateLimiter.attempts[identifier]) {
      rateLimiter.attempts[identifier] = {
        count: 1,
        firstAttempt: now,
        lastAttempt: now,
      };
    } else {
      rateLimiter.attempts[identifier].count += 1;
      rateLimiter.attempts[identifier].lastAttempt = now;
    }
  },

  /**
   * Remove expired rate limit entries
   */
  cleanup: () => {
    const now = Date.now();
    const expireTime = now - rateLimiter.timeWindow;

    Object.keys(rateLimiter.attempts).forEach(key => {
      if (rateLimiter.attempts[key].firstAttempt < expireTime) {
        delete rateLimiter.attempts[key];
      }
    });
  },
};

// Validation attempts log
const validationLog = [];
const MAX_LOG_ENTRIES = 100;

/**
 * Log a validation attempt
 * @param {string} code - Interview code
 * @param {boolean} success - Whether validation was successful
 * @param {string} error - Error message if validation failed
 * @param {string} identifier - IP address or other identifier
 */
const logValidationAttempt = (code, success, error = null, identifier = 'local') => {
  // Add entry to log
  validationLog.unshift({
    timestamp: new Date(),
    code: code,
    success: success,
    error: error,
    identifier: identifier,
  });

  // Trim log if necessary
  if (validationLog.length > MAX_LOG_ENTRIES) {
    validationLog.pop();
  }

  // Log to console for debugging
  if (success) {
    console.log(`Successful validation attempt for code: ${code}`);
  } else {
    console.warn(`Failed validation attempt for code: ${code}`, error);
  }
};

/**
 * Validate an interview code with rate limiting and logging
 * @param {string} code - Interview code to validate
 * @param {string} identifier - IP address or other identifier
 * @returns {Promise<Object>} Validation result
 */
const validateCode = async (code, identifier = 'local') => {
  // Check rate limiting
  if (rateLimiter.isLimited(identifier)) {
    const error = 'Rate limit exceeded. Try again later.';
    logValidationAttempt(code, false, error, identifier);
    return { valid: false, error };
  }

  // Record attempt
  rateLimiter.recordAttempt(identifier);

  // Validate code
  const result = await validateInterviewCode(code);

  // Log attempt
  logValidationAttempt(code, result.valid, result.error || null, identifier);

  return result;
};

/**
 * Get validation log
 * @returns {Array} Validation log entries
 */
const getValidationLog = () => {
  return [...validationLog];
};

export { validateCode, getValidationLog };
