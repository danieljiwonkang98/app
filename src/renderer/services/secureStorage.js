// Secure storage for sensitive data
// Note: In a real production app, you would want to use a more secure storage solution
// like electron-store with encryption or integration with the OS's secure storage

// Simple encryption/decryption using XOR with a secret key
// This is for demonstration purposes only - not suitable for production
const SECRET_KEY = 'interview-detection-app-secret-key';

/**
 * Simple XOR encryption/decryption
 * @param {string} text - Text to encrypt/decrypt
 * @returns {string} Encrypted/decrypted text
 * @private
 */
const xorCipher = text => {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ SECRET_KEY.charCodeAt(i % SECRET_KEY.length);
    result += String.fromCharCode(charCode);
  }
  return result;
};

/**
 * Encrypt data
 * @param {string} data - Data to encrypt
 * @returns {string} Encrypted data
 * @private
 */
const encrypt = data => {
  if (typeof data !== 'string') {
    data = JSON.stringify(data);
  }
  const encrypted = xorCipher(data);
  return btoa(encrypted); // Base64 encode for storage
};

/**
 * Decrypt data
 * @param {string} encryptedData - Data to decrypt
 * @returns {string|Object} Decrypted data
 * @private
 */
const decrypt = encryptedData => {
  try {
    const decoded = atob(encryptedData); // Base64 decode
    const decrypted = xorCipher(decoded);

    // Try to parse as JSON
    try {
      return JSON.parse(decrypted);
    } catch (e) {
      // Not JSON, return as string
      return decrypted;
    }
  } catch (error) {
    console.error('Error decrypting data:', error);
    return null;
  }
};

/**
 * Store data securely
 * @param {string} key - Storage key
 * @param {*} data - Data to store
 * @returns {boolean} Success status
 */
const setItem = (key, data) => {
  try {
    const encrypted = encrypt(data);
    localStorage.setItem(`secure_${key}`, encrypted);
    return true;
  } catch (error) {
    console.error('Error storing data securely:', error);
    return false;
  }
};

/**
 * Retrieve data securely
 * @param {string} key - Storage key
 * @returns {*} Retrieved data or null if not found
 */
const getItem = key => {
  try {
    const encrypted = localStorage.getItem(`secure_${key}`);
    if (!encrypted) return null;

    return decrypt(encrypted);
  } catch (error) {
    console.error('Error retrieving data securely:', error);
    return null;
  }
};

/**
 * Remove data
 * @param {string} key - Storage key
 */
const removeItem = key => {
  try {
    localStorage.removeItem(`secure_${key}`);
    return true;
  } catch (error) {
    console.error('Error removing data:', error);
    return false;
  }
};

/**
 * Clear all secure storage
 */
const clear = () => {
  try {
    // Only clear items with our prefix
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('secure_')) {
        localStorage.removeItem(key);
      }
    });
    return true;
  } catch (error) {
    console.error('Error clearing secure storage:', error);
    return false;
  }
};

// Add security warning on initialization
console.warn(
  'WARNING: The current secure storage implementation is for demonstration purposes only. ' +
    'In a production environment, you should use a more secure storage solution like ' +
    'electron-store with strong encryption or OS-level secure storage.'
);

export default {
  setItem,
  getItem,
  removeItem,
  clear,
};
