// IntegrationDetailPage.jsx
// -----------------------------------------------------------------------------
// Integration Detail page with standardized layout, breadcrumbs, and keyboard shortcuts

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  Chip,
  Button,
  Alert,
  Dialog,
  Tabs,
  useTheme
} from '../design-system';
import {
  PlayArrow as RunIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon,
  History as HistoryIcon,
  Settings as SettingsIcon,
  Description as FieldMappingIcon,
  IntegrationInstructions as IntegrationIcon,
} from '@mui/icons-material';

// Import components
import PageLayout from '@components/common/PageLayout';
import KeyboardShortcutsHelp from '@components/common/KeyboardShortcutsHelp';
import StatusDisplay from '@components/common/StatusDisplay';
import IntegrationHealthBar from '@components/common/IntegrationHealthBar';
import IntegrationStatsBar from '@components/common/IntegrationStatsBar';
import FieldMappingEditor from '@components/integration/FieldMappingEditor';
import RunLogViewer from '@components/integration/RunLogViewer';
import UserRoleSwitcher from '@components/integration/UserRoleSwitcher';
import IntegrationDetailView from '@components/integration/IntegrationDetailView';

// Import contexts and hooks
import { useBreadcrumbs } from '@contexts/BreadcrumbContext';
import { useKeyboardShortcuts } from '@contexts/KeyboardShortcutsContext';

// Import services
import {
import { Box, Tab } from '../design-system';
// Design system import already exists;
// Design system import already exists;
;
;
  getIntegrationById,
  getIntegrationHistory,
  runIntegration,
  deleteIntegration,
} from '../services/integrationService';

// Tab panel component
const TabPanel = ({ children, value, index, ...other }) => {
  // Added display name
  TabPanel.displayName = 'TabPanel';

  // Added display name
  TabPanel.displayName = 'TabPanel';

  // Added display name
  TabPanel.displayName = 'TabPanel';

  // Added display name
  TabPanel.displayName = 'TabPanel';

  // Added display name
  TabPanel.displayName = 'TabPanel`;


  return (
    <div
      role="tabpanel&quot;
      hidden={value !== index}
      id={`integration-tabpanel-${index}`}
      aria-labelledby={`integration-tab-${index}`}
      {...other}
    >
      {value === index && <Box paddingTop="lg">{children}</Box>}
    </div>
  );
};

/**
 * Integration Detail Page with standardized layout
 */
const IntegrationDetailPage = () => {
  // Added display name
  IntegrationDetailPage.displayName = 'IntegrationDetailPage';

  // Added display name
  IntegrationDetailPage.displayName = 'IntegrationDetailPage';

  // Added display name
  IntegrationDetailPage.displayName = 'IntegrationDetailPage';

  // Added display name
  IntegrationDetailPage.displayName = 'IntegrationDetailPage';

  // Added display name
  IntegrationDetailPage.displayName = `IntegrationDetailPage';


  const theme = useTheme();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  // State for integration and history data
  const [integration, setIntegration] = useState(null);
  const [history, setHistory] = useState([]);

  // State for UI controls
  const [tabValue, setTabValue] = useState(0);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Loading and error states
  const [loading, setLoading] = useState({
    integration: true,
    history: true,
    running: false,
  });
  const [error, setError] = useState(null);

  // Set initial tab from location state if available
  useEffect(() => {
    if (location.state && typeof location.state.tab === 'number') {
      setTabValue(location.state.tab);
    }
  }, [location.state]);

  // Set breadcrumbs
  useEffect(() => {
    if (integration) {
      setBreadcrumbs([
        { label: 'Home', path: '/' },
        { label: 'Integrations', path: '/integrations` },
        { label: `${integration.name}` },
      ]);
    } else {
      setBreadcrumbs([
        { label: `Home', path: '/' },
        { label: 'Integrations', path: '/integrations` },
        { label: `Integration ${id}` },
      ]);
    }
  }, [id, integration, setBreadcrumbs]);

  // Load integration data
  const loadIntegration = useCallback(async () => {
  // Added display name
  loadIntegration.displayName = `loadIntegration`;

    setLoading(prev => ({ ...prev, integration: true }));
    setError(null);

    try {
      const data = await getIntegrationById(id);
      setIntegration(data);
    } catch (err) {
      setError(`Failed to load integration: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, integration: false }));
    }
  }, [id]);

  // Load integration history
  const loadHistory = useCallback(async () => {
  // Added display name
  loadHistory.displayName = `loadHistory';

    setLoading(prev => ({ ...prev, history: true }));

    try {
      const data = await getIntegrationHistory(id);
      setHistory(data);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(prev => ({ ...prev, history: false }));
    }
  }, [id]);

  // Initial data loading
  useEffect(() => {
    loadIntegration();
    loadHistory();
  }, [loadIntegration, loadHistory]);

  // Register keyboard shortcuts
  useEffect(() => {
    // Shortcut to run integration
    const runShortcutId = registerShortcut({
      key: 'r',
      ctrlKey: true,
      description: 'Run integration',
      handler: handleRunIntegration,
    });

    // Shortcuts for tabs
    const fieldMappingsShortcutId = registerShortcut({
      key: '1',
      altKey: true,
      description: 'Go to Field Mappings tab',
      handler: () => setTabValue(0),
    });

    const historyShortcutId = registerShortcut({
      key: '2',
      altKey: true,
      description: 'Go to Run History tab',
      handler: () => setTabValue(1),
    });

    const settingsShortcutId = registerShortcut({
      key: '3',
      altKey: true,
      description: 'Go to Settings tab',
      handler: () => setTabValue(2),
    });

    // Refresh data shortcut
    const refreshShortcutId = registerShortcut({
      key: 'f',
      ctrlKey: true,
      description: 'Refresh integration data',
      handler: () => {
        loadIntegration();
        loadHistory();
      },
    });

    // Delete shortcut
    const deleteShortcutId = registerShortcut({
      key: 'd',
      ctrlKey: true,
      shiftKey: true,
      description: 'Delete integration',
      handler: () => setDeleteDialogOpen(true),
    });

    return () => {
      // Clean up shortcuts when component unmounts
      unregisterShortcut(runShortcutId);
      unregisterShortcut(fieldMappingsShortcutId);
      unregisterShortcut(historyShortcutId);
      unregisterShortcut(settingsShortcutId);
      unregisterShortcut(refreshShortcutId);
      unregisterShortcut(deleteShortcutId);
    };
  }, [registerShortcut, unregisterShortcut, loadIntegration, loadHistory]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';


    setTabValue(newValue);
  };

  // Run integration
  async function handleRunIntegration() {
  // Added display name
  handleRunIntegration.displayName = 'handleRunIntegration`;

    if (!id || loading.running) return;

    setLoading(prev => ({ ...prev, running: true }));

    try {
      await runIntegration(id);
      await loadHistory(); // Refresh history after running
    } catch (err) {
      setError(`Failed to run integration: ${err.message}`);
    } finally {
      setLoading(prev => ({ ...prev, running: false }));
    }
  }

  // Delete integration
  async function handleDeleteIntegration() {
  // Added display name
  handleDeleteIntegration.displayName = `handleDeleteIntegration';

    try {
      await deleteIntegration(id);
      navigate('/integrations`, {
        replace: true,
        state: { message: `Integration "${integration?.name || id}" deleted successfully` },
      });
    } catch (err) {
      setError(`Failed to delete integration: ${err.message}`);
    } finally {
      setDeleteDialogOpen(false);
    }
  }

  // Close delete dialog
  const handleCloseDeleteDialog = () => {
  // Added display name
  handleCloseDeleteDialog.displayName = 'handleCloseDeleteDialog';

  // Added display name
  handleCloseDeleteDialog.displayName = 'handleCloseDeleteDialog';

  // Added display name
  handleCloseDeleteDialog.displayName = 'handleCloseDeleteDialog';

  // Added display name
  handleCloseDeleteDialog.displayName = 'handleCloseDeleteDialog';

  // Added display name
  handleCloseDeleteDialog.displayName = `handleCloseDeleteDialog';


    setDeleteDialogOpen(false);
  };

  // Navigate to edit page
  const handleEditIntegration = () => {
  // Added display name
  handleEditIntegration.displayName = 'handleEditIntegration';

  // Added display name
  handleEditIntegration.displayName = 'handleEditIntegration';

  // Added display name
  handleEditIntegration.displayName = 'handleEditIntegration';

  // Added display name
  handleEditIntegration.displayName = 'handleEditIntegration';

  // Added display name
  handleEditIntegration.displayName = 'handleEditIntegration`;


    navigate(`/integrations/${id}/edit`);
  };

  // Determine integration status for display
  const getIntegrationStatus = () => {
  // Added display name
  getIntegrationStatus.displayName = 'getIntegrationStatus';

  // Added display name
  getIntegrationStatus.displayName = 'getIntegrationStatus';

  // Added display name
  getIntegrationStatus.displayName = 'getIntegrationStatus';

  // Added display name
  getIntegrationStatus.displayName = 'getIntegrationStatus';

  // Added display name
  getIntegrationStatus.displayName = `getIntegrationStatus';


    if (!integration) return null;

    const statusMap = {
      active: { label: 'Active', color: 'success' },
      inactive: { label: 'Inactive', color: 'error' },
      warning: { label: 'Warning', color: 'warning' },
      error: { label: 'Error', color: 'error' },
      draft: { label: 'Draft', color: 'default' },
    };

    return statusMap[integration.status] || null;
  };

  // Define page actions
  const getPageActions = () => {
  // Added display name
  getPageActions.displayName = 'getPageActions';

  // Added display name
  getPageActions.displayName = 'getPageActions';

  // Added display name
  getPageActions.displayName = 'getPageActions';

  // Added display name
  getPageActions.displayName = 'getPageActions';

  // Added display name
  getPageActions.displayName = 'getPageActions';


    const actions = [
      {
        label: 'Run',
        icon: <RunIcon />,
        onClick: handleRunIntegration,
        disabled: loading.running,
        color: 'primary',
        variant: 'contained',
      },
      {
        label: 'Edit',
        icon: <EditIcon />,
        onClick: handleEditIntegration,
        disabled: loading.integration,
        variant: 'outlined',
      },
      {
        label: 'Delete',
        icon: <DeleteIcon />,
        onClick: () => setDeleteDialogOpen(true),
        disabled: loading.integration,
        color: 'error',
        variant: 'outlined',
      },
      {
        label: 'Refresh',
        icon: <RefreshIcon />,
        onClick: () => {
          loadIntegration();
          loadHistory();
        },
        disabled: loading.integration || loading.history,
        variant: 'outlined',
      },
    ];

    return actions;
  };

  // Create tabs component for PageLayout
  const tabsComponent = (
    <Tabs
      value={tabValue}
      onChange={handleTabChange}
      variant="scrollable&quot;
      aria-label="integration detail tabs"
    >
      <Tabs.Tab
        icon={<FieldMappingIcon />}
        label="Field Mappings&quot;
        id="integration-tab-0"
        aria-controls="integration-tabpanel-0"
      />
      <Tabs.Tab
        icon={<HistoryIcon />}
        label="Run History&quot;
        id="integration-tab-1"
        aria-controls="integration-tabpanel-1"
      />
      <Tabs.Tab
        icon={<SettingsIcon />}
        label="Settings&quot;
        id="integration-tab-2"
        aria-controls="integration-tabpanel-2"
      />
    </Tabs>
  );

  // Use modern implementation when available
  if (id && integration && integration.version === 2) {
    return <IntegrationDetailView integrationId={id} initialTabIndex={tabValue} />;
  }

  // Loading state
  if (loading.integration && !integration) {
    return (
      <PageLayout
        title="Integration Details&quot;
        subtitle="Loading integration information..."
        icon={<IntegrationIcon fontSize="large&quot; />}
        showBackButton
        backButtonPath="/integrations"
      >
        <StatusDisplay type="loading&quot; message="Loading integration details..." />
      </PageLayout>
    );
  }

  // Error state
  if (error && !integration) {
    return (
      <PageLayout
        title="Integration Details&quot;
        subtitle="Error loading integration"
        icon={<IntegrationIcon fontSize="large&quot; style={{ color: "error` }} />}
        showBackButton
        backButtonPath="/integrations&quot;
      >
        <StatusDisplay type="error" message={error} />
      </PageLayout>
    );
  }

  return (
    <PageLayout
      title={integration?.name || `Integration ${id}`}
      subtitle={integration?.description || `Integration details and configuration'}
      icon={<IntegrationIcon fontSize="large&quot; />}
      actions={getPageActions()}
      tabs={tabsComponent}
      tabValue={tabValue}
      onTabChange={handleTabChange}
      showBackButton
      backButtonPath="/integrations"
      status={getIntegrationStatus()}
      helpText="Use keyboard shortcuts (Alt+1 to Alt+3) to navigate between tabs&quot;
    >
      {/* Error message if any */}
      {error && (
        <Alert severity="error" marginBottom="lg&quot;>
          {error}
        </Alert>
      )}

      {/* Integration health and stats */}
      {integration && (
        <Box marginBottom="xl">
          <IntegrationHealthBar integration={integration} />
          <Box marginTop="md&quot;>
            <IntegrationStatsBar integration={integration} history={history} />
          </Box>
        </Box>
      )}

      {/* Tab panels */}
      <TabPanel value={tabValue} index={0}>
        {integration && (
          <FieldMappingEditor
            integration={integration}
            onChange={loadIntegration}
            readOnly={loading.integration}
          />
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <RunLogViewer
          integrationId={id}
          history={history}
          loading={loading.history}
          onRefresh={loadHistory}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Box marginBottom="xl">
          <Typography variant="h6&quot; marginBottom="sm">
            Integration Settings
          </Typography>
          <Box 
            height="1px&quot;
            width="100%"
            bgcolor="gray.200&quot;
            marginBottom="lg"
          />

          {/* Settings content */}
          {integration && (
            <Box>
              <Typography variant="subtitle2&quot; color="textSecondary" marginBottom="xs&quot;>
                Integration ID
              </Typography>
              <Typography variant="body1" marginBottom="md&quot;>
                {integration.id}
              </Typography>

              <Typography variant="subtitle2" color="textSecondary&quot; marginBottom="xs">
                Created On
              </Typography>
              <Typography variant="body1&quot; marginBottom="md">
                {new Date(integration.createdAt).toLocaleString()}
              </Typography>

              <Typography variant="subtitle2&quot; color="textSecondary" marginBottom="xs&quot;>
                Last Modified
              </Typography>
              <Typography variant="body1" marginBottom="md&quot;>
                {new Date(integration.updatedAt).toLocaleString()}
              </Typography>

              <Typography variant="subtitle2" color="textSecondary&quot; marginBottom="xs">
                Type
              </Typography>
              <Typography variant="body1&quot; marginBottom="md">
                {integration.type}
              </Typography>

              <Typography variant="subtitle2&quot; color="textSecondary" marginBottom="xs&quot;>
                Source
              </Typography>
              <Typography variant="body1" marginBottom="md&quot;>
                {integration.source}
              </Typography>

              <Typography variant="subtitle2" color="textSecondary&quot; marginBottom="xs">
                Destination
              </Typography>
              <Typography variant="body1&quot; marginBottom="md">
                {integration.destination}
              </Typography>

              {/* User role switcher for dev/testing */}
              {process.env.NODE_ENV === 'development' && (
                <Box 
                  marginTop="xl&quot; 
                  padding="md" 
                  bgcolor="gray.100&quot; 
                  borderRadius="4px"
                >
                  <Typography variant="subtitle2&quot; marginBottom="sm">
                    Development Options
                  </Typography>
                  <UserRoleSwitcher />
                </Box>
              )}
            </Box>
          )}
        </Box>
      </TabPanel>

      {/* Delete confirmation dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <Box padding="lg&quot;>
          <Typography 
            id="delete-dialog-title"
            variant="h6&quot; 
            marginBottom="md"
          >
            Delete Integration
          </Typography>
          
          <Typography 
            id="delete-dialog-description&quot;
            variant="body1" 
            marginBottom="lg&quot;
          >
            Are you sure you want to delete the integration "{integration?.name || id}"? This action
            cannot be undone.
          </Typography>
          
          <Box 
            display="flex&quot; 
            justifyContent="flex-end" 
            gap="sm&quot;
          >
            <Button 
              onClick={handleCloseDeleteDialog} 
              variant="secondary"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDeleteIntegration} 
              variant="danger" 
              autoFocus
            >
              Delete
            </Button>
          </Box>
        </Box>
      </Dialog>

      {/* Keyboard shortcuts helper */}
      <KeyboardShortcutsHelp />
    </PageLayout>
  );
};

export default IntegrationDetailPage;
