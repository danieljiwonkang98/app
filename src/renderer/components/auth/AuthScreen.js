import React, { useState, useRef, useEffect } from 'react';
import authService from '../../services/authService.js';
import './AuthScreen.css';

const CODE_LENGTH = 6;

const AuthScreen = ({ onAuthenticated }) => {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    // Focus the input field when the component mounts
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Format the code with spaces for better readability
  const formatCode = value => {
    return value.toUpperCase().replace(/[^A-Z0-9]/g, '');
  };

  const handleChange = e => {
    const formattedCode = formatCode(e.target.value);

    // Limit to CODE_LENGTH characters
    if (formattedCode.length <= CODE_LENGTH) {
      setCode(formattedCode);
      setError(null);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Basic validation
    if (code.length !== CODE_LENGTH) {
      setError(`Interview code must be ${CODE_LENGTH} characters.`);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Call authentication service
      const result = await authService.authenticate(code);

      if (result.success) {
        setSuccess(true);
        // Notify parent component about successful authentication
        if (onAuthenticated) {
          setTimeout(() => {
            onAuthenticated(result.session);
          }, 1000); // Small delay to show success state
        }
      } else {
        setError(result.error || 'Authentication failed. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Authentication error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>Interview Access</h1>
          <p>Enter your interview code to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="code-input">Interview Code</label>
            <input
              ref={inputRef}
              id="code-input"
              type="text"
              placeholder="ENTER YOUR CODE"
              value={code}
              onChange={handleChange}
              autoComplete="off"
              className={`form-control ${error ? 'error' : ''} ${success ? 'success' : ''}`}
              disabled={loading || success}
              aria-label="Interview code input"
              aria-invalid={error ? 'true' : 'false'}
              aria-describedby="code-error"
              maxLength={CODE_LENGTH}
            />
            <div className="code-helper">
              {Array.from({ length: CODE_LENGTH }).map((_, index) => (
                <span key={index} className={`code-digit ${index < code.length ? 'filled' : ''}`}>
                  {index < code.length ? code[index] : ''}
                </span>
              ))}
            </div>
          </div>

          {error && (
            <div className="error-message" id="code-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className={`btn btn-primary ${loading ? 'loading' : ''} ${success ? 'success' : ''}`}
            disabled={loading || success || code.length !== CODE_LENGTH}
          >
            {loading ? 'Validating...' : success ? 'Success!' : 'Continue'}
          </button>
        </form>

        <div className="auth-footer">
          <p>If you don't have an interview code, please contact your interviewer.</p>
        </div>
      </div>
    </div>
  );
};

export default AuthScreen;
