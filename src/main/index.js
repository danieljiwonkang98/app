// Import required Electron components
import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import electronSquirrelStartup from 'electron-squirrel-startup';
import fs from 'fs';

// Create __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Determine app root directory
const appDir = path.resolve(__dirname, '..', '..');
console.log('App directory:', appDir);

// For debugging
console.log('__dirname:', __dirname);

// Get the bundled HTML path
const bundledHTMLPath = path.join(appDir, 'dist', 'index.html');
console.log('Bundled HTML path:', bundledHTMLPath);

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (electronSquirrelStartup) {
  app.quit();
}

// Keep a global reference of the window object to prevent garbage collection
let mainWindow;

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    backgroundColor: '#282c34', // Set background color to match React app
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs'),
      devTools: true,
    },
  });

  // Try to load the bundled file
  if (fs.existsSync(bundledHTMLPath)) {
    console.log('Loading bundled React app from:', bundledHTMLPath);
    mainWindow
      .loadFile(bundledHTMLPath)
      .then(() => console.log('Successfully loaded bundled React app'))
      .catch(err => console.error('Failed to load bundled React app:', err));
  } else {
    console.error('Error: Bundled HTML file not found at', bundledHTMLPath);
    // Instead of falling back to a test page, we'll show an error message directly
    mainWindow.loadURL(`data:text/html,<html>
      <head><title>Error</title>
        <style>body{font-family:sans-serif;color:white;background:#cc0000;padding:30px;text-align:center;}
        h1{font-size:24px;} button{padding:10px 20px;cursor:pointer;}</style>
      </head>
      <body>
        <h1>Error: Could not load the application</h1>
        <p>The bundled application was not found. Please make sure you've built the app correctly.</p>
        <button onclick="window.location.reload()">Reload</button>
      </body>
    </html>`);
  }

  // Always open DevTools for debugging
  mainWindow.webContents.openDevTools();

  // Log console messages from the page
  mainWindow.webContents.on('console-message', (event, level, message, line, sourceId) => {
    console.log(`[Renderer Console]: ${message}`);
  });

  // Emitted when the window is closed
  mainWindow.on('closed', () => {
    // Dereference the window object
    mainWindow = null;
  });
};

// Create window when Electron has finished initialization
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// On macOS, recreate the window when the dock icon is clicked and no other windows are open
app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});
