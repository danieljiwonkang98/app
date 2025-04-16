/**
 * This utility bridges environment variables from the main process to the renderer process
 */

// Store environment variables
window.__env = {};

// Initialize environment variables from main process if available
const initEnvironment = () => {
  try {
    // In Electron environment, get variables from main process
    if (window.electron && window.electron.getEnv) {
      const envVars = window.electron.getEnv();
      if (envVars) {
        window.__env = { ...envVars };
        console.log('Environment variables loaded from main process');
      }
    } else {
      console.warn('Electron bridge not available, using default values');
    }
  } catch (error) {
    console.error('Error initializing environment variables:', error);
  }

  // Make the variables available for debugging in development
  if (window.__env.NODE_ENV === 'development') {
    console.log('Environment variables:', window.__env);
  }
};

// Initialize when the script is loaded
initEnvironment();

// Export the initialization function for explicit calls
export { initEnvironment };
