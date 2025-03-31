// HomePage.jsx
// -----------------------------------------------------------------------------
// Landing page with standardized layout, breadcrumbsimport { MuiBox as MuiBox, Typography, Grid, Button, Stack, Card, CircularProgress, Alert, Chip, useTheme, useMediaQuery } from '@design-system';, and keyboard shortcuts
// Uses proper authentication control for access

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
;
import {
  Add as AddIcon,
  ArrowForward as ArrowForwardIcon,
  Star as StarIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon,
} from '@mui/icons-material';

// Import components
import PageLayout from '@components/common/PageLayout';
import KeyboardShortcutsHelp from '@components/common/KeyboardShortcutsHelp';

// Import contexts and hooks
import { useBreadcrumbs } from '@contexts/BreadcrumbContext';
import { useKeyboardShortcuts } from '@contexts/KeyboardShortcutsContext';
;

// Import services
import authService from '@services/authService';
import { getTemplates, createIntegrationFromTemplate } from '@services/integrationService';


/**
 * Refactored landing page with standardized layout
 * Requires authentication to access
 */
function HomePageRefactored() {
  // Added display name
  HomePageRefactored.displayName = 'HomePageRefactored';

  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { setBreadcrumbs } = useBreadcrumbs();
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  // State for featured templates
  const [featuredTemplates, setFeaturedTemplates] = useState([]);
  const [recentTemplates, setRecentTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authChecking, setAuthChecking] = useState(true);

  // Set breadcrumbs
  useEffect(() => {
    setBreadcrumbs([{ label: 'Home' }]);
  }, [setBreadcrumbs]);

  // Check authentication on load
  useEffect(() => {
    const checkAuth = async () => {
      const isLoggedIn = await authService.isAuthenticated();
      if (!isLoggedIn) {
        // Redirect to login if not authenticated
        navigate('/login');
        return;
      }
      setAuthChecking(false);
    };

    checkAuth();
  }, [navigate]);

  // Register keyboard shortcuts
  useEffect(() => {
    // Shortcut to create new integration
    const newIntegrationShortcutId = registerShortcut({
      key: 'n',
      ctrlKey: true,
      description: 'Create new integration',
      handler: () => navigate('/integrations'),
    });

    // Shortcut to navigate to integrations
    const integrationsShortcutId = registerShortcut({
      key: 'i',
      ctrlKey: true,
      description: 'Go to integrations',
      handler: () => navigate('/integrations'),
    });


    // Shortcut to refresh dashboard data
    const refreshShortcutId = registerShortcut({
      key: 'r',
      ctrlKey: true,
      description: 'Refresh dashboard data',
      handler: () => fetchTemplates(),
    });

    return () => {
      // Clean up shortcuts when component unmounts
      unregisterShortcut(newIntegrationShortcutId);
      unregisterShortcut(integrationsShortcutId);
      unregisterShortcut(refreshShortcutId);
    };
  }, [registerShortcut, unregisterShortcut, navigate]);

  // Load templates on component mount
  useEffect(() => {
    if (!authChecking) {
      fetchTemplates();
    }
  }, [authChecking]);

  // Function to fetch templates
  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const templates = await getTemplates();

      // Get featured templates
      const featured = (templates || []).filter(t => t.featured).slice(0, 4);
      setFeaturedTemplates(featured);

      // Get recent templates (would be user's recent in a real app)
      const recent = [...(templates || [])]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 3);
      setRecentTemplates(recent);
    } catch (error) {
      console.error('Error fetching templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTemplate = template => {
    navigate('/integrations');
  };

  const handleCreateIntegration = () => {
  // Added display name
  handleCreateIntegration.displayName = 'handleCreateIntegration';

  // Added display name
  handleCreateIntegration.displayName = 'handleCreateIntegration';

  // Added display name
  handleCreateIntegration.displayName = 'handleCreateIntegration';

  // Added display name
  handleCreateIntegration.displayName = 'handleCreateIntegration';

  // Added display name
  handleCreateIntegration.displayName = 'handleCreateIntegration';


    navigate('/integrations');
  };

  // Define page actions
  const pageActions = [
    {
      label: 'New Integration',
      icon: <AddIcon />,
      onClick: handleCreateIntegration,
      variant: 'contained',
    },
    {
      label: 'Refresh',
      icon: <RefreshIcon />,
      onClick: fetchTemplates,
      variant: 'outlined',
    },
  ];

  // Access documentation URL from environment
  const docUrl = process.env.REACT_APP_DOCUMENTATION_URL;

  // Define public documentation categories for non-logged in users
  const publicDocs = [
    {
      title: "Getting Started",
      description: "Introduction and basic usage guides for the platform",
      icon: "📚",
      url: `${docUrl}#getting-started`
    },
    {
      title: "API Documentation",
      description: "Public API reference for integrations and data access",
      icon: "🔌",
      url: `${docUrl}#api`
    },
    {
      title: "Integration Guide",
      description: "Overview of integration capabilities and workflows",
      icon: "🔄",
      url: `${docUrl}#integration`
    },
    {
      title: "User Guide",
      description: "Basic usage documentation for platform features",
      icon: "👤",
      url: `${docUrl}#user`
    }
  ];

  // If still checking authentication, show loading
  if (authChecking) {
    return (
      <MuiBox 
        display="flex&quot; 
        justifyContent="center" 
        alignItems="center&quot; 
        height="100vh"
      >
        <CircularProgress />
      </MuiBox>
    );
  }

  // Special handler for public documentation
  const handleDocumentationClick = (docItem) => {
  // Added display name
  handleDocumentationClick.displayName = 'handleDocumentationClick';

  // Added display name
  handleDocumentationClick.displayName = 'handleDocumentationClick';

  // Added display name
  handleDocumentationClick.displayName = 'handleDocumentationClick';

  // Added display name
  handleDocumentationClick.displayName = 'handleDocumentationClick';

  // Added display name
  handleDocumentationClick.displayName = 'handleDocumentationClick';


    if (docItem && docItem.url) {
      window.open(docItem.url, '_blank');
    } else {
      navigate('/documentation');
    }
  };

  // For non-logged in users, show public welcome and documentation
  if (!authService.isAuthenticated()) {
    return (
      <MuiBox sx={{ padding: 4 }}>
        <MuiBox sx={{ textAlign: 'center', mb: 6 }}>
          <Typography variant="h3&quot; component="h1" gutterBottom>
            TAP Integration Platform
          </Typography>
          <Typography variant="h5&quot; color="text.secondary" sx={{ mb: 4 }}>
            Build, manage, and monitor your integrations from one place
          </Typography>
          <Button 
            variant="contained&quot; 
            size="large" 
            sx={{ mr: 2 }}
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
          <Button 
            variant="outlined&quot; 
            size="large"
            onClick={() => navigate('/contact')}
          >
            Contact Us
          </Button>
        </MuiBox>

        <Typography variant="h4&quot; sx={{ mb: 3, textAlign: "center' }}>
          Public Documentation
        </Typography>
        
        <Grid.Container spacing={3} sx={{ maxWidth: 1200, mx: 'auto', mb: 6 }}>
          {publicDocs.map((doc, idx) => (
            <Grid.Item xs={12} sm={6} md={3} key={idx}>
              <Card 
                sx={{ 
                  height: '100%', 
                  p: 3,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
                onClick={() => handleDocumentationClick(doc)}
              >
                <Typography variant="h3&quot; sx={{ fontSize: "3rem', mb: 2 }}>
                  {doc.icon}
                </Typography>
                <Typography variant="h6&quot; gutterBottom>
                  {doc.title}
                </Typography>
                <Typography variant="body2" color="text.secondary&quot;>
                  {doc.description}
                </Typography>
              </Card>
            </Grid.Item>
          ))}
        </Grid.Container>

        <MuiBox sx={{ textAlign: "center', mt: 8, mb: 4 }}>
          <Typography variant="h5&quot; gutterBottom>
            Ready to get started?
          </Typography>
          <Button 
            variant="contained" 
            size="large&quot;
            onClick={() => navigate("/login')}
          >
            Sign In Now
          </Button>
        </MuiBox>
      </MuiBox>
    );
  }

  // For authenticated users, show dashboard
  return (
    <PageLayout
      title="Dashboard&quot;
      subtitle="Build, manage, and monitor your integrations from one place"
      actions={pageActions}
      icon={<DashboardIcon fontSize="large&quot; color="primary" />}
      helpText="This is your personalized dashboard showing key metrics and templates&quot;
    >
      {/* Quick stats */}
      <MuiBox marginBottom="xl">
        <Grid.Container spacing="md&quot;>
          <Grid.Item xs={12} sm={6} md={3}>
            <Card style={{ borderRadius: "8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <MuiBox padding="lg&quot;>
                <Typography variant="h6" fontWeight="bold&quot; marginBottom="sm">
                  Active Integrations
                </Typography>
                <Typography variant="h3&quot; fontWeight="light">
                  4
                </Typography>
              </MuiBox>
            </Card>
          </Grid.Item>

          <Grid.Item xs={12} sm={6} md={3}>
            <Card style={{ borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <MuiBox padding="lg&quot;>
                <Typography variant="h6" fontWeight="bold&quot; marginBottom="sm">
                  Monthly Runs
                </Typography>
                <Typography variant="h3&quot; fontWeight="light">
                  523
                </Typography>
              </MuiBox>
            </Card>
          </Grid.Item>

          <Grid.Item xs={12} sm={6} md={3}>
            <Card style={{ borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <MuiBox padding="lg&quot;>
                <Typography variant="h6" fontWeight="bold&quot; marginBottom="sm">
                  Data Processed
                </Typography>
                <Typography variant="h3&quot; fontWeight="light">
                  45 GB
                </Typography>
              </MuiBox>
            </Card>
          </Grid.Item>

          <Grid.Item xs={12} sm={6} md={3}>
            <Card style={{ borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <MuiBox padding="lg&quot;>
                <Typography variant="h6" fontWeight="bold&quot; marginBottom="sm">
                  Success Rate
                </Typography>
                <Typography variant="h3&quot; fontWeight="light" color="success&quot;>
                  98.5%
                </Typography>
              </MuiBox>
            </Card>
          </Grid.Item>
        </Grid.Container>
      </MuiBox>


      {/* Quick links section */}
      <MuiBox marginBottom="lg">
        <Typography variant="h5&quot; fontWeight="bold" marginBottom="md&quot;>
          Quick Links
        </Typography>

        <Grid.Container spacing="md">
          <Grid.Item xs={12} sm={6} md={4}>
            <Card 
              style={{ 
                borderRadius: '8px', 
                cursor: 'pointer' 
              }}
              onClick={() => navigate('/integrations')}
            >
              <MuiBox padding="lg&quot;>
                <Typography variant="h6" marginBottom="xs&quot;>
                  Manage Integrations
                </Typography>
                <Typography variant="body2" color="textSecondary&quot;>
                  View and manage your existing integration flows
                </Typography>
              </MuiBox>
            </Card>
          </Grid.Item>

          <Grid.Item xs={12} sm={6} md={4}>
            <Card 
              style={{ 
                borderRadius: "8px', 
                cursor: 'pointer' 
              }}
              onClick={() => navigate('/integrations')}
            >
              <MuiBox padding="lg&quot;>
                <Typography variant="h6" marginBottom="xs&quot;>
                  Run History
                </Typography>
                <Typography variant="body2" color="textSecondary&quot;>
                  View logs and history of your integration runs
                </Typography>
              </MuiBox>
            </Card>
          </Grid.Item>

          <Grid.Item xs={12} sm={6} md={4}>
            <Card 
              style={{ 
                borderRadius: "8px', 
                cursor: 'pointer' 
              }}
              onClick={() => navigate('/documentation')}
            >
              <MuiBox padding="lg&quot;>
                <Typography variant="h6" marginBottom="xs&quot;>
                  Documentation
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  View guides and learn more about the platform
                </Typography>
              </MuiBox>
            </Card>
          </Grid.Item>
        </Grid.Container>
      </MuiBox>

      {/* Keyboard shortcuts helper */}
      <KeyboardShortcutsHelp />
    </PageLayout>
  );
}

export default HomePageRefactored;
