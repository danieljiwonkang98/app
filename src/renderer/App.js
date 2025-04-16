import React, { useState, useEffect } from 'react';
import './styles/App.css';
import Todo from './components/Todo.js';

// For debugging
console.log('App component loaded (simplified version)');

function App() {
  const [isElectron, setIsElectron] = useState(false);

  useEffect(() => {
    // For debugging
    console.log('App component mounted (simplified version)');
    console.log('electronAPI available:', !!window.electronAPI);

    // Check if we're running in Electron
    if (window.electronAPI) {
      setIsElectron(true);
    }
  }, []);

  // For debugging
  console.log('App rendering, isElectron:', isElectron);

  return (
    <div
      className="App"
      style={{ backgroundColor: '#282c34', color: 'white', padding: '30px', minHeight: '100vh' }}
    >
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '20px' }}>
        AI Interview Cheating Detection
      </h1>

      <p style={{ fontSize: '18px', marginBottom: '20px' }}>
        {isElectron
          ? 'Running in Electron - Security features are available'
          : 'Running in browser - Limited functionality'}
      </p>

      <button
        style={{
          backgroundColor: '#4caf50',
          color: 'white',
          padding: '10px 20px',
          fontSize: '16px',
          marginBottom: '30px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
        onClick={() => {
          if (isElectron) {
            window.electronAPI.send('auth:login', { code: 'test-code' });
            alert('Message sent to main process!');
          } else {
            alert('Electron APIs not available');
          }
        }}
      >
        Test Electron Communication
      </button>

      <div style={{ maxWidth: '600px', margin: '0 auto' }}>
        <Todo />
      </div>
    </div>
  );
}

export default App;
