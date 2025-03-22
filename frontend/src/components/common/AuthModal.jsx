// AuthModal.jsx
// -----------------------------------------------------------------------------
// Authentication modal with support for standard login, Office 365, and Gmail

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';

// UI Components
import PortalModal from './PortalModal';
import InputField from './InputField';
import Button from './Button';
import AlertBox from './AlertBox';

function AuthModal({ isOpen, onClose }) {
  // Auth state
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  // Toggle between login and register
  const toggleMode = () => {
    setMode((prev) => (prev === 'login' ? 'register' : 'login'));
    setErrorMessage('');
    setPassword('');
    setConfirmPass('');
    setUsername('');
  };

  // Standard login/register
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      if (mode === 'login') {
        // Login with username and password
        await authService.login(username, password);
        onClose();
        navigate('/integrations');
      } else {
        // Register validation
        if (password !== confirmPass) {
          setErrorMessage('Passwords do not match');
          return;
        }
        
        // Mock registration - in a real app would call backend API
        console.log('Register attempt:', { username, password });
        // After registration, auto-login
        await authService.login(username, password);
        onClose();
        navigate('/integrations');
      }
    } catch (err) {
      setErrorMessage(err.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Office 365 login
  const handleOffice365Login = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      await authService.loginWithOffice365();
      onClose();
      navigate('/integrations');
    } catch (err) {
      setErrorMessage(err.message || 'Office 365 authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Gmail login
  const handleGmailLogin = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      await authService.loginWithGmail();
      onClose();
      navigate('/integrations');
    } catch (err) {
      setErrorMessage(err.message || 'Gmail authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Form fields
  const renderFields = () => {
    return (
      <div>
        <InputField
          label="Username or Email"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder={mode === 'login' ? 'Enter username/email' : 'Choose a username/email'}
        />
        <InputField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
        />
        {mode === 'register' && (
          <InputField
            label="Confirm Password"
            type="password"
            value={confirmPass}
            onChange={(e) => setConfirmPass(e.target.value)}
            placeholder="Re-enter password"
          />
        )}
      </div>
    );
  };

  // External auth providers
  const renderExternalAuth = () => {
    // Only show OAuth providers on login screen
    if (mode !== 'login') return null;

    return (
      <div style={{ marginTop: '1.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '1rem', color: '#777' }}>
          <span style={{ position: 'relative', zIndex: 1, backgroundColor: '#fff', padding: '0 10px' }}>
            Or login with
          </span>
          <hr style={{ position: 'relative', top: '-0.7rem', margin: 0, borderTop: '1px solid #ddd', zIndex: 0 }} />
        </div>
        
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button 
            onClick={handleOffice365Login} 
            style={{ 
              flex: 1, 
              backgroundColor: '#0078d4',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            disabled={isLoading}
          >
            <span style={{ marginRight: '5px' }}>Office 365</span>
          </Button>
          
          <Button 
            onClick={handleGmailLogin} 
            style={{ 
              flex: 1, 
              backgroundColor: '#EA4335',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            disabled={isLoading}
          >
            <span style={{ marginRight: '5px' }}>Gmail</span>
          </Button>
        </div>
      </div>
    );
  };

  // Modal content
  const modalContent = (
    <div style={{ minWidth: '300px', maxWidth: '400px', padding: '0.5rem' }}>
      <h2 style={{ margin: '0 0 1rem', color: '#3B3D3D' }}>
        {mode === 'login' ? 'Login' : 'Register'}
      </h2>

      {/* Toggle link */}
      <p style={{ fontSize: '0.9rem', color: '#3B3D3D' }}>
        {mode === 'login' ? "Don't have an account?" : 'Already have an account?'}{' '}
        <span 
          onClick={toggleMode} 
          style={{ color: '#48C2C5', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {mode === 'login' ? 'Register here' : 'Login here'}
        </span>
      </p>

      {/* Error message */}
      {errorMessage && (
        <AlertBox 
          type="error" 
          message={errorMessage} 
          onClose={() => setErrorMessage('')}
        />
      )}

      {/* Login/Register form */}
      <form onSubmit={handleSubmit}>
        {renderFields()}

        <div style={{ marginTop: '1rem' }}>
          <Button 
            type="submit" 
            style={{ width: '100%' }}
            disabled={isLoading}
          >
            {isLoading ? 'Processing...' : (mode === 'login' ? 'Login' : 'Register')}
          </Button>
        </div>
      </form>

      {/* External auth options */}
      {renderExternalAuth()}
    </div>
  );

  return (
    <PortalModal isOpen={isOpen} onClose={onClose}>
      {modalContent}
    </PortalModal>
  );
}

export default AuthModal;