/**
 * Main Application Layout
 * 
 * The main layout wrapper for the application with navigation and content areas.
 * 
 * @module components/layout/MainLayout
 */

import React, { Suspense, lazy, useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { useTheme } from '../../contexts/ThemeContext';

// Lazy load secondary components
const TopBar = lazy(() => import('./TopBar'));
const Sidebar = lazy(() => import('./Sidebar'));
const Footer = lazy(() => import('./Footer'));
const PerformanceDashboard = lazy(() => import('../performance/PerformanceDashboard'));

// Loading fallback for nested components
const ComponentLoadingFallback = () => (
  <div className="component-loading-fallback">
    <div className="loading-spinner-small"></div>
  </div>
);

/**
 * MainLayout Component
 * 
 * @returns {JSX.Element} Main application layout
 */
const MainLayout = () => {
  const { theme } = useTheme();
  
  // Memoize the layout styles to prevent recalculation on re-renders
  const layoutStyles = useMemo(() => ({
    container: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      backgroundColor: theme.palette.background.default,
      color: theme.palette.text.primary,
    },
    content: {
      display: 'flex',
      flex: 1,
    },
    main: {
      flex: 1,
      padding: theme.spacing(3),
      marginLeft: '240px', // Width of the sidebar
    },
  }), [theme]);

  return (
    <div className="main-layout" style={layoutStyles.container}>
      <Suspense fallback={<ComponentLoadingFallback />}>
        <TopBar />
      </Suspense>
      
      <div style={layoutStyles.content}>
        <Suspense fallback={<ComponentLoadingFallback />}>
          <Sidebar />
        </Suspense>
        
        <main style={layoutStyles.main}>
          <Outlet />
        </main>
      </div>
      
      <Suspense fallback={<ComponentLoadingFallback />}>
        <Footer />
      </Suspense>
      
      {/* Performance Dashboard - only shown in development */}
      {process.env.NODE_ENV !== 'production' && (
        <Suspense fallback={null}>
          <PerformanceDashboard initiallyExpanded={false} />
        </Suspense>
      )}
    </div>
  );
};

export default React.memo(MainLayout);