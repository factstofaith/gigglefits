// App.jsx
// -----------------------------------------------------------------------------
// Main application component with routing and context providers
// Enhanced with accessibility features and standardized layouts
// Integrated with Docker error handling components for containerized environments

import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Box, CircularProgress, ThemeProvider, KeyboardArrowUpIcon } from './design-system/optimized';

// Common components
import { NotificationProvider } from './contexts/NotificationContext';
import KeyboardShortcutsHelp from './components/common/KeyboardShortcutsHelp';
import HelpButton from './components/common/HelpButton';
import HealthCheck from './components/common/HealthCheck';

// Context providers
import { UserProvider } from './contexts/UserContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { IntegrationProvider } from './contexts/IntegrationContext';
import { EarningsProvider } from './contexts/EarningsContext';
import { ResourceProvider } from './contexts/ResourceContext';
import { WebhookProvider } from './contexts/WebhookContext';
import { BreadcrumbProvider } from './contexts/BreadcrumbContext';
import { KeyboardShortcutsProvider } from './contexts/KeyboardShortcutsContext';
import { HelpProvider } from './contexts/HelpContext';

// Error handling components
import { ErrorProvider } from './error-handling/ErrorContext';
import ErrorBanner from './error-handling/ErrorBanner';
import { initErrorService } from './error-handling/error-service';

// Docker error handling components
import { withDockerErrorHandling } from './error-handling/docker/integration';
import { DockerErrorHandler } from './error-handling/docker/DockerErrorHandler';
import dockerErrorService from './error-handling/docker/docker-error-service';

// Centralized routes with lazy loading
import AppRoutes from './AppRoutes';

// Common components
import Navigation from './components/common/Navigation';

// Accessibility utilities
import { useSkipNav } from './utils/accessibilityUtils';

/**
 * Scroll to top component for long pages
 */
import { ENV } from "@/utils/environmentConfig";
function ScrollToTop() {
  ScrollToTop.displayName = 'ScrollToTop';
  const [visible, setVisible] = useState(false);

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 100) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const handleClick = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };
  if (!visible) return null;
  return <Box onClick={handleClick} role="presentation" position="fixed" bottom={16} right={16} zIndex={1000} style={{
    opacity: visible ? 1 : 0,
    transition: 'opacity 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    borderRadius: '50%',
    backgroundColor: 'primary',
    color: 'white',
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
  }} aria-label="scroll back to top">
      <KeyboardArrowUpIcon />
    </Box>;
}
function App() {
  App.displayName = 'App';

  // Add skip navigation functionality
  useSkipNav('main-content');

  // Set page title and lang attribute on mount
  useEffect(() => {
    // Set application language (can be dynamic based on user preferences)
    document.documentElement.lang = 'en';

    // Set default page title (can be updated by page components)
    document.title = 'TAP Integration Platform';

    // Initialize error handling service
    if (ENV.REACT_APP_RUNNING_IN_DOCKER === 'true') {
      // Initialize Docker-specific error service for containerized environments
      dockerErrorService.initDockerErrorService({
        // Enable error reporting in all environments
        reportErrors: true,
        // Only report warnings and above in production
        minReportSeverity: ENV.NODE_ENV === 'production' ? 'warning' : 'info',
        // Group similar errors to reduce noise
        groupSimilarErrors: true,
        // Add application metadata
        metadata: {
          appVersion: ENV.REACT_APP_VERSION || '1.0.0',
          environment: ENV.NODE_ENV || 'development',
          platform: navigator.platform,
          userAgent: navigator.userAgent,
          screenSize: `${window.innerWidth}x${window.innerHeight}`,
          containerId: ENV.REACT_APP_CONTAINER_ID || 'unknown',
          containerVersion: ENV.REACT_APP_CONTAINER_VERSION || 'unknown'
        }
      });
    } else {
      // Initialize standard error service for non-containerized environments
      initErrorService({
        // Enable error reporting in all environments
        reportErrors: true,
        // Only report warnings and above in production
        minReportSeverity: ENV.NODE_ENV === 'production' ? 'warning' : 'info',
        // Group similar errors to reduce noise
        groupSimilarErrors: true,
        // Add application metadata
        metadata: {
          appVersion: ENV.REACT_APP_VERSION || '1.0.0',
          environment: ENV.NODE_ENV || 'development',
          platform: navigator.platform,
          userAgent: navigator.userAgent,
          screenSize: `${window.innerWidth}x${window.innerHeight}`
        }
      });
    }

    // Initialize modal root div for portals if not exists
    if (!document.getElementById('modal-root')) {
      const modalRoot = document.createElement('div');
      modalRoot.id = 'modal-root';
      document.body.appendChild(modalRoot);
    }

    // Create screen reader announcer if it doesn't exist
    if (!document.getElementById('sr-announcer')) {
      const announcer = document.createElement('div');
      announcer.id = 'sr-announcer';
      announcer.setAttribute('aria-live', 'polite');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.setAttribute('role', 'status');
      announcer.style.position = 'absolute';
      announcer.style.width = '1px';
      announcer.style.height = '1px';
      announcer.style.overflow = 'hidden';
      announcer.style.clip = 'rect(0, 0, 0, 0)';
      announcer.style.whiteSpace = 'nowrap';
      document.body.appendChild(announcer);
    }
    return () => {
      // Cleanup is not strictly necessary here since App is the root,
      // but included for completeness
      const modalRoot = document.getElementById('modal-root');
      const announcer = document.getElementById('sr-announcer');
      if (modalRoot) document.body.removeChild(modalRoot);
      if (announcer) document.body.removeChild(announcer);
    };
  }, []);
  // Create the application with all necessary providers
  const AppWithProviders = (
    <ThemeProvider initialMode="light">
      <ErrorProvider>
        <SettingsProvider>
          <UserProvider>
            <NotificationProvider>
              <KeyboardShortcutsProvider>
                <IntegrationProvider>
                  <EarningsProvider>
                    <ResourceProvider>
                      <WebhookProvider>
                        <HelpProvider>
                          <Router>
                            <BreadcrumbProvider>
                              {/* Skip to main content link (hidden visually) */}
                              <a href="#main-content" className="skip-nav" style={{
                              position: 'absolute',
                              top: '-40px',
                              left: 0,
                              backgroundColor: 'primary',
                              color: 'white',
                              padding: '8px',
                              zIndex: 2000,
                              transition: 'top 0.2s'
                            }} onFocus={e => {
                              e.target.style.top = '0';
                            }} onBlur={e => {
                              e.target.style.top = '-40px';
                            }}>
                                Skip to main content
                              </a>

                              {/* Navigation */}
                              <Navigation />
                              
                              {/* Global error banner */}
                              <ErrorBanner />

                              {/* Main content area with proper accessibility attributes */}
                              <Box component="main" id="main-content" tabIndex="-1" display="flex" flexDirection="column" minHeight="calc(100vh - 64px)" // Accounting for app bar height
                            style={{
                              outline: 'none' // Remove focus outline for tabIndex
                            }}>
                                <AppRoutes />
                              </Box>

                              {/* Keyboard shortcuts help component */}
                              <KeyboardShortcutsHelp />

                              {/* Scroll to top button */}
                              <ScrollToTop />

                              {/* Help button with contextual help and guided tours */}
                              <HelpButton />

                              {/* Health check component for Docker */}
                              <HealthCheck />
                            </BreadcrumbProvider>
                          </Router>
                        </HelpProvider>
                      </WebhookProvider>
                    </ResourceProvider>
                  </EarningsProvider>
                </IntegrationProvider>
              </KeyboardShortcutsProvider>
            </NotificationProvider>
          </UserProvider>
        </SettingsProvider>
      </ErrorProvider>
    </ThemeProvider>
  );
  
  // Wrap the application with Docker error handling for containerized environments
  if (ENV.REACT_APP_RUNNING_IN_DOCKER === 'true') {
    return (
      <DockerErrorHandler>
        {AppWithProviders}
      </DockerErrorHandler>
    );
  }
  
  return AppWithProviders;
}
export default App;