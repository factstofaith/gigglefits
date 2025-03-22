// App.jsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import authService from './services/authService';

// Pages
import HomePage from './pages/HomePage';
import IntegrationsPage from './pages/IntegrationsPage';
import IntegrationDetailPage from './pages/IntegrationDetailPage';

// Components
import Logo from './components/common/Logo';
import AuthModal from './components/common/AuthModal';
import Button from './components/common/Button';

// Assets
import logo from './assets/logo.png';

// Protected route wrapper
const ProtectedRoute = ({ element }) => {
  const isAuthenticated = authService.isAuthenticated();
  return isAuthenticated ? element : <Navigate to="/" />;
};

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = authService.isAuthenticated();
      setIsLoggedIn(isAuth);
      
      if (isAuth) {
        const user = await authService.getCurrentUser();
        setCurrentUser(user);
      }
    };
    
    checkAuth();
  }, []);

  // Show auth modal
  const handleShowAuthModal = () => {
    setShowAuthModal(true);
  };

  // Hide auth modal
  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  // Handle logout
  const handleLogout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
    setCurrentUser(null);
    window.location.href = '/'; // Redirect to homepage after logout
  };

  return (
    <Router>
      <div>
        <header
          style={{
            background: 'linear-gradient(135deg,rgb(208, 239, 248) 0%,rgb(203, 239, 247) 50%)',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '60px',
                backgroundColor: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                marginRight: '1rem'
              }}
            >
              <Logo imageSrc={logo} text="TAP Innovations" />
            </div>
          </div>
          
          <div>
            {isLoggedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: '#3B3D3D' }}>
                  Welcome, {currentUser?.name || 'User'}
                </span>
                <Button onClick={handleLogout}>Logout</Button>
              </div>
            ) : (
              <Button onClick={handleShowAuthModal}>Login</Button>
            )}
          </div>
        </header>

        <Routes>
          <Route path="/" element={<HomePage onLogin={handleShowAuthModal} />} />
          <Route 
            path="/integrations" 
            element={<ProtectedRoute element={<IntegrationsPage />} />} 
          />
          <Route 
            path="/integrations/:id" 
            element={<ProtectedRoute element={<IntegrationDetailPage />} />} 
          />
        </Routes>
        
        <AuthModal 
          isOpen={showAuthModal} 
          onClose={handleCloseAuthModal} 
        />
      </div>
    </Router>
  );
}

export default App;