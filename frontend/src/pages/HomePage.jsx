// HomePage.jsx
// -----------------------------------------------------------------------------
// Landing page showcasing the integration platform features

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Import components
import Footer from '../components/common/Footer';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import ProgressBar from '../components/common/ProgressBar';
import Timeline from '../components/common/Timeline';
import AuthModal from '../components/common/AuthModal';

// Import authentication service
import authService from '../services/authService';

function HomePage({ onLogin }) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const navigate = useNavigate();
  
  // Check if user is already logged in
  const isLoggedIn = authService.isAuthenticated();

  // Recent updates timeline
  const timelineItems = [
    { timestamp: '2025-05-01', content: 'Added support for Azure Blob Storage integrations' },
    { timestamp: '2025-04-15', content: 'Added Office 365 and Gmail authentication' },
    { timestamp: '2025-04-01', content: 'Launched field mapping visualization tools' }
  ];

  // Integration types showcased on homepage
  const integrationTypes = [
    {
      title: 'HR System Integrations',
      description: 'Connect your HR systems like BambooHR, Workday, or ADP with time-tracking and payroll systems.',
      icon: '👥',
      isNew: true
    },
    {
      title: 'Time Tracking Integrations',
      description: 'Sync time data between Kronos, 7Shifts, and payroll systems for accurate payments.',
      icon: '⏱️',
      isNew: false
    },
    {
      title: 'File-Based Integrations',
      description: 'Move data to and from Azure Blob Storage, AWS S3, or local file systems.',
      icon: '📁',
      isNew: true
    }
  ];

  const handleGetStarted = () => {
    if (isLoggedIn) {
      navigate('/integrations');
    } else {
      setShowAuthModal(true);
    }
  };

  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      minHeight: 'calc(100vh - 120px)' // Account for header height
    }}>
      {/* Hero section */}
      <div style={{
        background: 'linear-gradient(135deg, #FFAA3B 0%, #FFFFFF 50%)',
        padding: '4rem 1rem',
        textAlign: 'center'
      }}>
        <h1 style={{ margin: 0, fontSize: '2.5rem', color: '#3B3D3D' }}>
          Modern Integration Platform
        </h1>
        <p style={{ 
          margin: '1.5rem auto', 
          color: '#3B3D3D', 
          fontSize: '1.2rem',
          maxWidth: '800px'
        }}>
          Build API and file-based integrations between your critical business systems with our intuitive,
          no-code platform. Perfect for HR, time tracking, and payroll data synchronization.
        </p>
        <Button 
          style={{ backgroundColor: '#FC741C', marginTop: '1rem', padding: '0.5rem 2rem' }}
          onClick={handleGetStarted}
        >
          {isLoggedIn ? 'Go to Integrations' : 'Get Started'}
        </Button>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        maxWidth: '1200px',
        width: '100%',
        margin: '0 auto',
        padding: '3rem 1rem'
      }}>
        {/* Integration types section */}
        <h2 style={{ color: '#3B3D3D', textAlign: 'center', marginBottom: '2rem' }}>
          Connect Your Business Systems
        </h2>
        
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '3rem',
          justifyContent: 'center'
        }}>
          {integrationTypes.map((type, index) => (
            <Card 
              key={index} 
              style={{ flex: '1 1 300px', maxWidth: '350px' }} 
              title={
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <span style={{ fontSize: '24px', marginRight: '10px' }}>{type.icon}</span>
                  {type.title}
                </div>
              }
            >
              <p style={{ color: '#3B3D3D', minHeight: '80px' }}>
                {type.description}
              </p>
              {type.isNew && <Badge label="New" color="#FC741C" style={{ marginRight: '0.5rem' }} />}
            </Card>
          ))}
        </div>

        {/* Platform features section */}
        <h2 style={{ color: '#3B3D3D', textAlign: 'center', marginBottom: '2rem', marginTop: '3rem' }}>
          Key Platform Features
        </h2>
        
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          <Card style={{ flex: '1 1 300px' }} title="Interactive Canvas Designer">
            <p style={{ color: '#3B3D3D' }}>
              Build integrations visually with our drag-and-drop canvas interface. Connect sources and destinations
              without writing code.
            </p>
            <Badge label="Visual Designer" color="#48C2C5" />
          </Card>

          <Card style={{ flex: '1 1 300px' }} title="Field Mapping">
            <p style={{ color: '#3B3D3D' }}>
              Advanced field mapping with transformations and custom logic. Map data between different schemas
              and formats.
            </p>
            <ProgressBar value={90} color="#FFAA3B" />
            <small style={{ color: '#3B3D3D' }}>90% complete</small>
          </Card>

          <Card style={{ flex: '1 1 300px' }} title="Multi-tenant Environment">
            <p style={{ color: '#3B3D3D' }}>
              Secure multi-tenant environment with Office 365 and Gmail authentication. Perfect for teams
              and enterprises.
            </p>
            <Button 
              style={{ marginTop: '0.5rem', backgroundColor: '#48C2C5' }}
              onClick={handleGetStarted}
            >
              Try Now
            </Button>
          </Card>
        </div>

        {/* Recent updates timeline */}
        <div style={{ marginTop: '3rem' }}>
          <h2 style={{ color: '#3B3D3D' }}>Recent Platform Updates</h2>
          <Timeline items={timelineItems} />
        </div>
      </div>

      {/* Footer */}
      <Footer />

      {/* Auth modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={handleCloseAuthModal}
      />
    </div>
  );
}

export default HomePage;