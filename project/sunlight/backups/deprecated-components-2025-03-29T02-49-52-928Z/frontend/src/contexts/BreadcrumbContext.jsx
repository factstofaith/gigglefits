/**
 * @context BreadcrumbContext
 * @description Context provider for managing breadcrumb navigation throughout the application.
 * Allows for dynamic setting and updating of breadcrumbs from any component.
 * Automatically generates breadcrumbs based on routes and supports dynamic paths.
 *
 * @example
 * // In a parent component
 * <BreadcrumbProvider>
 *   <YourComponent />
 * </BreadcrumbProvider>
 *
 * // In a child component
 * const { setBreadcrumbs } = useBreadcrumbs();
 *
 * useEffect(() => {
 *   setBreadcrumbs([
 *     { label: 'Home', path: '/' },
 *     { label: 'Current Page' }
 *   ]);
 * }, []);
 *
 * // Render breadcrumbs in a component
 * const { breadcrumbs } = useBreadcrumbs();
 * return (
 *   <div className="breadcrumbs&quot;>
 *     {breadcrumbs.map((crumb, index) => (
 *       <span key={index}>
 *         {index > 0 && " > "}
 *         {crumb.path ? <Link to={crumb.path}>{crumb.label}</Link> : crumb.label}
 *       </span>
 *     ))}
 *   </div>
 * );
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useLocation } from 'react-router-dom';

// Create context
const BreadcrumbContext = createContext();

/**
 * Default breadcrumbs for standard routes
 */
const DEFAULT_BREADCRUMBS = {
  '/': [{ label: 'Home' }],
  '/integrations': [{ label: 'Home', path: '/' }, { label: 'Integrations' }],
  '/earnings': [{ label: 'Home', path: '/' }, { label: 'Earnings' }],
  '/admin': [{ label: 'Home', path: '/' }, { label: 'Admin Dashboard' }],
  '/settings': [{ label: 'Home', path: '/' }, { label: 'Settings' }],
  '/templates': [{ label: 'Home', path: '/' }, { label: 'Templates' }],
  '/notifications': [{ label: 'Home', path: '/' }, { label: 'Notifications' }],
  '/documentation': [{ label: 'Home', path: '/' }, { label: 'Documentation' }],
  '/profile': [{ label: 'Home', path: '/' }, { label: 'User Profile' }],
};

/**
 * Default implementation of breadcrumb service
 */
const defaultBreadcrumbService = {
  /**
   * Get default breadcrumbs for standard routes
   *
   * @param {string} pathname - Current path
   * @returns {Array|null} - Breadcrumbs array or null if not found
   */
  getDefaultBreadcrumbs: (pathname) => DEFAULT_BREADCRUMBS[pathname] || null,
  
  /**
   * Get dynamic breadcrumbs for routes with parameters
   *
   * @param {string} pathname - Current path
   * @param {Object} [options] - Optional data for enhancing breadcrumbs
   * @param {Object} [options.integrations] - Integration data when available
   * @returns {Array|null} - Breadcrumbs array or null if not found
   */
  getDynamicBreadcrumbs: (pathname, options = {}) => {
    // Integration detail page
    if (pathname.match(/^\/integrations\/[\w-]+$/)) {
      const integrationId = pathname.split('/').pop();
      const integrationName = options.integrations?.[integrationId]?.name;
      
      return [
        { label: 'Home', path: '/' },
        { label: 'Integrations', path: '/integrations' },
        { label: integrationName || `Integration ${integrationId}` },
      ];
    }

    // Integration detail subpages (e.g., /integrations/123/mapping)
    if (pathname.match(/^\/integrations\/[\w-]+\/[\w-]+$/)) {
      const parts = pathname.split('/');
      const integrationId = parts[2];
      const integrationName = options.integrations?.[integrationId]?.name;
      const section = parts[3];
      const sectionLabel = formatSectionName(section);
      
      return [
        { label: 'Home', path: '/' },
        { label: 'Integrations', path: '/integrations' },
        { label: integrationName || `Integration ${integrationId}`, path: `/integrations/${integrationId}` },
        { label: sectionLabel },
      ];
    }

    // Admin subpages
    if (pathname.startsWith('/admin/')) {
      const section = pathname.split('/')[2];
      const readableSection = formatSectionName(section);

      return [
        { label: 'Home', path: '/' },
        { label: 'Admin Dashboard', path: '/admin' },
        { label: readableSection },
      ];
    }
    
    // Admin subsections (e.g., /admin/users/permissions)
    if (pathname.match(/^\/admin\/[\w-]+\/[\w-]+$/)) {
      const parts = pathname.split('/');
      const section = parts[2];
      const subsection = parts[3];
      const readableSection = formatSectionName(section);
      const readableSubsection = formatSectionName(subsection);
      
      return [
        { label: 'Home', path: '/' },
        { label: 'Admin Dashboard', path: '/admin' },
        { label: readableSection, path: `/admin/${section}` },
        { label: readableSubsection },
      ];
    }
    
    // Earnings pages
    if (pathname.match(/^\/earnings\/[\w-]+$/)) {
      const section = pathname.split('/')[2];
      const readableSection = formatSectionName(section);
      
      return [
        { label: 'Home', path: '/' },
        { label: 'Earnings', path: '/earnings' },
        { label: readableSection },
      ];
    }
    
    // User profile sections
    if (pathname.match(/^\/profile\/[\w-]+$/)) {
      const section = pathname.split('/')[2];
      const readableSection = formatSectionName(section);
      
      return [
        { label: 'Home', path: '/' },
        { label: 'User Profile', path: '/profile' },
        { label: readableSection },
      ];
    }

    return null;
  },
  
  /**
   * Get fallback breadcrumbs when no other matches are found
   *
   * @returns {Array} - Default fallback breadcrumbs
   */
  getFallbackBreadcrumbs: () => [{ label: 'Home', path: '/' }]
};

/**
 * Helper function to format section names from URL paths
 * 
 * @param {string} section - Section name from URL
 * @returns {string} - Formatted section name
 */
function formatSectionName(section) {
  // Added display name
  formatSectionName.displayName = 'formatSectionName';

  // Special case mappings for common abbreviations
  const specialCases = {
    'mfa': 'MFA',
    'api': 'API',
    'apis': 'APIs',
    'oauth': 'OAuth',
    'sso': 'SSO',
  };
  
  return section
    .split('-')
    .map(word => {
      if (specialCases[word.toLowerCase()]) {
        return specialCases[word.toLowerCase()];
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Provider component for breadcrumb context
 *
 * @component
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @param {Object} [props.breadcrumbService=defaultBreadcrumbService] - Service for generating breadcrumbs (for dependency injection)
 * @param {Object} [props.integrationService=null] - Optional integration service for integration name lookups
 * @returns {React.ReactElement} - Rendered component
 */
export const BreadcrumbProvider = ({ 
  children,
  breadcrumbService = defaultBreadcrumbService,
  integrationService = null
}) => {
  // Added display name
  BreadcrumbProvider.displayName = 'BreadcrumbProvider';

  // Added display name
  BreadcrumbProvider.displayName = 'BreadcrumbProvider';

  // Added display name
  BreadcrumbProvider.displayName = 'BreadcrumbProvider';

  // Added display name
  BreadcrumbProvider.displayName = 'BreadcrumbProvider';

  // Added display name
  BreadcrumbProvider.displayName = 'BreadcrumbProvider';


  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [integrations, setIntegrations] = useState({});
  const [manuallySet, setManuallySet] = useState(false);
  const location = useLocation();

  // Load integration data if needed
  useEffect(() => {
    // Only fetch integration data if we have an integration service
    // and if we're on an integration-related page
    if (integrationService && location.pathname.includes('/integrations/')) {
      const integrationId = location.pathname.split('/')[2];
      
      // Check if we already have this integration's data
      if (integrationId && !integrations[integrationId]) {
        // Fetch integration data
        integrationService.getIntegrationById(integrationId)
          .then(data => {
            if (data) {
              setIntegrations(prev => ({
                ...prev,
                [integrationId]: data
              }));
            }
          })
          .catch(err => {
            console.warn('Error fetching integration data for breadcrumbs:', err);
          });
      }
    }
  }, [location.pathname, integrationService, integrations]);

  // Update breadcrumbs when route changes or integration data is loaded
  useEffect(() => {
    // Don't update breadcrumbs if they were manually set
    if (manuallySet) return;
    
    const { pathname } = location;

    // Check if we have default breadcrumbs for this path
    const defaultCrumbs = breadcrumbService.getDefaultBreadcrumbs(pathname);
    if (defaultCrumbs) {
      setBreadcrumbs(defaultCrumbs);
      return;
    }

    // Check for dynamic breadcrumbs, passing integration data if available
    const dynamicBreadcrumbs = breadcrumbService.getDynamicBreadcrumbs(pathname, { integrations });
    if (dynamicBreadcrumbs) {
      setBreadcrumbs(dynamicBreadcrumbs);
      return;
    }

    // Fallback to generic breadcrumb
    setBreadcrumbs(breadcrumbService.getFallbackBreadcrumbs());
  }, [location, breadcrumbService, integrations, manuallySet]);

  // Manually set breadcrumbs (useful for dynamic pages)
  const updateBreadcrumbs = useCallback((newBreadcrumbs) => {
  // Added display name
  updateBreadcrumbs.displayName = 'updateBreadcrumbs';

    if (Array.isArray(newBreadcrumbs)) {
      setBreadcrumbs(newBreadcrumbs);
      setManuallySet(true);
    } else {
      console.error('setBreadcrumbs expects an array of breadcrumb objects');
    }
  }, []);
  
  // Reset manual flag when route changes
  useEffect(() => {
    setManuallySet(false);
  }, [location.pathname]);

  return (
    <BreadcrumbContext.Provider value={{ 
      breadcrumbs, 
      setBreadcrumbs: updateBreadcrumbs,
      isManuallySet: manuallySet,
      clearManualBreadcrumbs: useCallback(() => setManuallySet(false), []),
    }}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

BreadcrumbProvider.propTypes = {
  children: PropTypes.node.isRequired,
  breadcrumbService: PropTypes.shape({
    getDefaultBreadcrumbs: PropTypes.func,
    getDynamicBreadcrumbs: PropTypes.func,
    getFallbackBreadcrumbs: PropTypes.func,
  }),
  integrationService: PropTypes.shape({
    getIntegrationById: PropTypes.func,
  })
};

/**
 * Custom hook to use breadcrumb context
 *
 * @returns {Object} - Breadcrumb context
 */
export const useBreadcrumbs = () => {
  // Added display name
  useBreadcrumbs.displayName = 'useBreadcrumbs';

  // Added display name
  useBreadcrumbs.displayName = 'useBreadcrumbs';

  // Added display name
  useBreadcrumbs.displayName = 'useBreadcrumbs';

  // Added display name
  useBreadcrumbs.displayName = 'useBreadcrumbs';

  // Added display name
  useBreadcrumbs.displayName = 'useBreadcrumbs';


  const context = useContext(BreadcrumbContext);
  if (!context) {
    throw new Error('useBreadcrumbs must be used within a BreadcrumbProvider');
  }
  return context;
};

export default BreadcrumbContext;