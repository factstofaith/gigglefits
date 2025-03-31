// MonitoringDashboard.jsx
// -----------------------------------------------------------------------------
// Main component for the Azure Infrastructure Monitoring Dashboard

import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Tabs, 
  CircularProgress,
  Alert, 
  Button
} from '../../design-system';
import {
  Refresh as RefreshIcon,
  Dashboard as MonitoringIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon,
  Storage as StorageIcon,
  ErrorOutline as ErrorIcon
} from '@mui/icons-material';

// Import components
import AzureConfigurationPanel from '@components/admin/AzureConfigurationPanel';
import ResourceHealthCards from '@components/admin/ResourceHealthCards';
import ErrorLogViewer from '@components/admin/ErrorLogViewer';
import { useNotification } from '@hooks/useNotification';
import { useAzureConfig } from '@contexts/AzureConfigContext';

// Placeholder components (to be implemented later)
const ResourceMetrics = () => (
  <Box padding="xl&quot; textAlign="center">
    <Typography variant="body1&quot;>Resource Metrics Component - Coming Soon</Typography>
  </Box>
);

// Import DocumentationAnalytics component
import DocumentationAnalytics from "@components/admin/DocumentationAnalytics';

const AlertConfigurations = () => (
  <Box padding="xl&quot; textAlign="center">
    <Typography variant="body1&quot;>Alert Configurations Component - Coming Soon</Typography>
  </Box>
);

// TabPanel component
const TabPanel = ({ children, value, index, ...other }) => {
  // Added display name
  TabPanel.displayName = "TabPanel';

  // Added display name
  TabPanel.displayName = 'TabPanel';

  // Added display name
  TabPanel.displayName = 'TabPanel';

  // Added display name
  TabPanel.displayName = 'TabPanel';

  // Added display name
  TabPanel.displayName = 'TabPanel';


  return (
    <Box
      role="tabpanel&quot;
      hidden={value !== index}
      id={`monitoring-tabpanel-${index}`}
      aria-labelledby={`monitoring-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box paddingTop="lg">
          {children}
        </Box>
      )}
    </Box>
  );
};

/**
 * Azure Infrastructure Monitoring Dashboard Component
 * 
 * Provides a comprehensive view of Azure resources, metrics, and health status
 * with configuration options for connecting to Azure.
 */
const MonitoringDashboard = () => {
  // Added display name
  MonitoringDashboard.displayName = 'MonitoringDashboard';

  // Added display name
  MonitoringDashboard.displayName = 'MonitoringDashboard';

  // Added display name
  MonitoringDashboard.displayName = 'MonitoringDashboard';

  // Added display name
  MonitoringDashboard.displayName = 'MonitoringDashboard';

  // Added display name
  MonitoringDashboard.displayName = 'MonitoringDashboard';


  // State for tab control
  const [activeTab, setActiveTab] = useState(0);
  
  // Get notification context
  const { showToast } = useNotification();
  
  // Get Azure configuration context
  const { 
    isConnected, 
    configLoading,
    configError,
    loadResources,
    discoverResources
  } = useAzureConfig();
  
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


    setActiveTab(newValue);
  };
  
  // Handle refresh action
  const handleRefresh = async () => {
    try {
      if (activeTab === 0) {
        // Configuration tab - nothing to refresh
        showToast('Azure configuration view refreshed', 'info');
      } else if (activeTab === 1) {
        // Resources tab
        await loadResources();
        showToast('Azure resources refreshed', 'success');
      } else if (activeTab === 2) {
        // Metrics tab - to be implemented
        showToast('Metrics refresh not yet implemented', 'info');
      } else if (activeTab === 3) {
        // Error Logs tab
        showToast('Error logs refreshed', 'success');
        // The ErrorLogViewer component has its own refresh mechanism
      } else if (activeTab === 4) {
        // Documentation tab - to be implemented
        showToast('Documentation analytics refresh not yet implemented', 'info');
      }
    } catch (error) {
      console.error('Error refreshing data:', error);
      showToast('Failed to refresh data', 'error');
    }
  };
  
  // Handle resource discovery
  const handleDiscoverResources = async () => {
    try {
      const result = await discoverResources();
      showToast(`${result.resource_count} Azure resources discovered`, 'success');
    } catch (error) {
      console.error('Error discovering resources:', error);
      showToast('Failed to discover resources', 'error');
    }
  };
  
  return (
    <Box>
      {/* Header with connections status and actions */}
      <Box 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '24px' 
        }}
      >
        <Box style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <MonitoringIcon fontSize="large&quot; color="primary" />
          <div>
            <Typography variant="heading2&quot;>Azure Infrastructure Monitoring</Typography>
            <Typography variant="body2" color="textSecondary&quot;>
              {isConnected 
                ? "Connected to Azure - Monitoring active" 
                : "Not connected to Azure - Configure credentials to enable monitoring"}
            </Typography>
          </div>
        </Box>
        
        <Box style={{ display: 'flex', gap: '16px' }}>
          {isConnected && (
            <Button
              variant="outlined&quot;
              onClick={handleDiscoverResources}
              startIcon={<AssessmentIcon />}
            >
              Discover Resources
            </Button>
          )}
          
          <Button
            variant="secondary"
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
          >
            Refresh
          </Button>
        </Box>
      </Box>
      
      {/* Error alert */}
      {configError && (
        <Alert 
          severity="error&quot;
          style={{ marginBottom: "24px' }}
        >
          {configError}
        </Alert>
      )}
      
      {/* Loading indicator */}
      {configLoading && (
        <Box 
          display="flex&quot; 
          justifyContent="center" 
          padding="xl&quot;
        >
          <CircularProgress />
        </Box>
      )}
      
      {/* Tabs */}
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="Azure monitoring tabs"
      >
        <Tabs.Tab 
          label="Configuration&quot; 
          icon={<SettingsIcon />}
          id="monitoring-tab-0"
          aria-controls="monitoring-tabpanel-0"
        />
        <Tabs.Tab 
          label="Resources&quot; 
          icon={<StorageIcon />}
          id="monitoring-tab-1"
          aria-controls="monitoring-tabpanel-1"
          disabled={!isConnected}
        />
        <Tabs.Tab 
          label="Metrics&quot; 
          icon={<AssessmentIcon />}
          id="monitoring-tab-2"
          aria-controls="monitoring-tabpanel-2"
          disabled={!isConnected}
        />
        <Tabs.Tab 
          label="Error Logs&quot; 
          icon={<ErrorIcon />}
          id="monitoring-tab-3"
          aria-controls="monitoring-tabpanel-3"
        />
        <Tabs.Tab 
          label="Documentation&quot; 
          icon={<StorageIcon />}
          id="monitoring-tab-4"
          aria-controls="monitoring-tabpanel-4"
          disabled={!isConnected}
        />
      </Tabs>
      
      {/* Tab panels */}
      <TabPanel value={activeTab} index={0}>
        <AzureConfigurationPanel />
      </TabPanel>
      
      <TabPanel value={activeTab} index={1}>
        <ResourceHealthCards />
      </TabPanel>
      
      <TabPanel value={activeTab} index={2}>
        <ResourceMetrics />
      </TabPanel>
      
      <TabPanel value={activeTab} index={3}>
        <ErrorLogViewer />
      </TabPanel>
      
      <TabPanel value={activeTab} index={4}>
        <DocumentationAnalytics />
      </TabPanel>
    </Box>
  );
};

export default MonitoringDashboard;