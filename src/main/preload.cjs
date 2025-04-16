// Import required Electron components
const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Send a message to the main process
  send: (channel, data) => {
    // Only allow specific channels for security
    const validChannels = ['auth:login', 'monitoring:start', 'monitoring:stop'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  // Receive a message from the main process
  receive: (channel, func) => {
    // Only allow specific channels for security
    const validChannels = ['auth:result', 'monitoring:status', 'alert:notification'];
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },

  // Invoke a method in the main process and get the result
  invoke: async (channel, data) => {
    // Only allow specific channels for security
    const validChannels = ['auth:validate', 'permissions:request', 'permissions:check'];
    if (validChannels.includes(channel)) {
      return await ipcRenderer.invoke(channel, data);
    }

    return null;
  },
});

// Expose a method to get environment variables from the main process
contextBridge.exposeInMainWorld('electron', {
  // Get environment variables
  getEnv: () => {
    // Access environment variables shared by the main process
    if (global.envVariables) {
      return { ...global.envVariables };
    }

    // Fallback to development defaults
    return {
      NODE_ENV: process.env.NODE_ENV || 'development',
    };
  },
});
