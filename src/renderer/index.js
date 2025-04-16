import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/App.css';
import App from './App.js';

// Global error handler
window.addEventListener('error', event => {
  console.error('GLOBAL ERROR:', event.error);
  document.body.innerHTML = `
    <div style="color: red; padding: 20px; font-family: Arial, sans-serif;">
      <h2>JavaScript Error</h2>
      <p>${event.error?.message || 'Unknown error'}</p>
      <pre>${event.error?.stack || 'No stack trace available'}</pre>
    </div>
  `;
});

// Unhandled promise rejection handler
window.addEventListener('unhandledrejection', event => {
  console.error('UNHANDLED PROMISE REJECTION:', event.reason);
  document.body.innerHTML = `
    <div style="color: orange; padding: 20px; font-family: Arial, sans-serif;">
      <h2>Unhandled Promise Rejection</h2>
      <p>${event.reason?.message || 'Unknown error'}</p>
      <pre>${event.reason?.stack || 'No stack trace available'}</pre>
    </div>
  `;
});

// Error handling and debugging
console.log('Renderer index.js loaded');
console.log('Document ready state:', document.readyState);

// Wait for document to be ready
const renderApp = () => {
  try {
    // Create root element
    const rootElement = document.getElementById('root');

    if (!rootElement) {
      throw new Error('Root element not found!');
    }

    console.log('Root element found, creating React root');
    const root = ReactDOM.createRoot(rootElement);

    // Render the React application
    console.log('Rendering React app');
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
    console.log('React render completed');
  } catch (error) {
    console.error('Error rendering React application:', error);
    // Display error in the DOM for visibility
    document.body.innerHTML = `
      <div style="color: red; padding: 20px; font-family: Arial, sans-serif;">
        <h2>React Rendering Error</h2>
        <p>${error.message}</p>
        <pre>${error.stack}</pre>
      </div>
    `;
  }
};

// Ensure DOM is loaded before rendering
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
