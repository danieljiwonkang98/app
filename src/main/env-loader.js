const path = require('path');
const fs = require('fs');
const { app } = require('electron');

/**
 * Load environment variables from .env file
 * @param {string} envPath - Path to .env file
 */
function loadEnvVariables(envPath) {
  try {
    if (fs.existsSync(envPath)) {
      const envContents = fs.readFileSync(envPath, 'utf8');
      const envVars = parseEnv(envContents);

      // Set environment variables
      Object.keys(envVars).forEach(key => {
        process.env[key] = envVars[key];
      });

      console.log(`Loaded environment variables from ${envPath}`);
    } else {
      console.warn(`No .env file found at ${envPath}. Using default values.`);
    }
  } catch (error) {
    console.error('Error loading environment variables:', error);
  }
}

/**
 * Parse .env file contents into key-value pairs
 * @param {string} content - .env file contents
 * @returns {Object} Environment variables as key-value pairs
 */
function parseEnv(content) {
  const result = {};
  const lines = content.split('\n');

  lines.forEach(line => {
    // Skip empty lines and comments
    if (!line || line.trim() === '' || line.startsWith('#')) {
      return;
    }

    const keyValue = line.split('=');
    if (keyValue.length >= 2) {
      const key = keyValue[0].trim();
      // Join the rest of the array in case the value itself contains = signs
      const value = keyValue.slice(1).join('=').trim();

      // Remove surrounding quotes if present
      const unquotedValue = value.replace(/^["'](.*)["']$/, '$1');

      result[key] = unquotedValue;
    }
  });

  return result;
}

/**
 * Initialize environment variables
 * @param {string} customEnvPath - Optional custom path to .env file
 */
function initializeEnv(customEnvPath) {
  // Default .env file path is in the app root directory
  const defaultEnvPath = path.join(app.getAppPath(), '.env');

  // Try loading from the custom path first, then fall back to default
  if (customEnvPath && fs.existsSync(customEnvPath)) {
    loadEnvVariables(customEnvPath);
  } else {
    loadEnvVariables(defaultEnvPath);
  }

  // Set up environment variables to share with renderer process
  global.envVariables = {
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_KEY,
    NODE_ENV: process.env.NODE_ENV,
    DEBUG: process.env.DEBUG,
    DEBUG_LEVEL: process.env.DEBUG_LEVEL,
  };
}

module.exports = { initializeEnv };
