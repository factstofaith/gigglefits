// AdminDashboardPage.jsx
// -----------------------------------------------------------------------------
// Admin Dashboard with standardized layout, breadcrumbs, and keyboard shortcuts

import React, { useState, useEffect } from 'react';
import {MuiBox as MuiBox, Typography, Tabs, useTheme} from '../design-system';
import {
  Dashboard as DashboardIcon,
  Apps as AppsIcon,
  Storage as StorageIcon,
  LocalShipping as ReleaseIcon,
  Business as TenantIcon,
  Settings as SettingsIcon,
  Refresh as RefreshIcon,
  LibraryBooks as LibraryBooksIcon,
  Dashboard as MonitoringIcon,
} from '@mui/icons-material';

// Import components
import PageLayout from '@components/common/PageLayout';
import KeyboardShortcutsHelp from '@components/common/KeyboardShortcutsHelp';

// Admin components
import ApplicationsManager from '@components/admin/ApplicationsManager';
import DatasetsManager from '@components/admin/DatasetsManager';
import ReleasesManager from '@components/admin/ReleasesManager';
import TenantsManager from '@components/admin/TenantsManager';
import MonitoringDashboard from '@components/admin/MonitoringDashboard';

// Import contexts and hooks
import { useBreadcrumbs } from '@contexts/BreadcrumbContext';
import { useKeyboardShortcuts } from '@contexts/KeyboardShortcutsContext';
import { MuiBox, Tab } from '../design-system';
// Design system import already exists;
;
;

// We use the design system's useTheme hook instead of this custom implementation

// TabPanel component using design system
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
  TabPanel.displayName = 'TabPanel';


  return (
    <MuiBox
      role="tabpanel&quot;
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
    >
      {value === index && (
        <MuiBox paddingTop="lg">
          {children}
        </MuiBox>
      )}
    </MuiBox>
  );
};

/**
 * Admin Dashboard with standardized layout
 */
const AdminDashboardPage = ({ initialTab = 0 }) => {
  // Added display name
  AdminDashboardPage.displayName = 'AdminDashboardPage';

  // Added display name
  AdminDashboardPage.displayName = 'AdminDashboardPage';

  // Added display name
  AdminDashboardPage.displayName = 'AdminDashboardPage';

  // Added display name
  AdminDashboardPage.displayName = 'AdminDashboardPage';

  // Added display name
  AdminDashboardPage.displayName = 'AdminDashboardPage';


  const theme = useTheme();
  const [activeTab, setActiveTab] = useState(initialTab);
  const { setBreadcrumbs } = useBreadcrumbs();
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  // Set breadcrumbs
  useEffect(() => {
    setBreadcrumbs([{ label: 'Home', path: '/' }, { label: 'Admin Dashboard' }]);
  }, [setBreadcrumbs]);

  // Register keyboard shortcuts for navigation
  useEffect(() => {
    // Shortcut to navigate between tabs
    const tabShortcutId = registerShortcut({
      key: 't',
      ctrlKey: true,
      description: 'Cycle through admin sections',
      handler: () => {
        const nextTab = (activeTab + 1) % 5; // 5 tabs total
        setActiveTab(nextTab);
      },
    });

    // Shortcuts for specific tabs
    const appsShortcutId = registerShortcut({
      key: '1',
      altKey: true,
      description: 'Go to Applications tab',
      handler: () => setActiveTab(0),
    });

    const datasetsShortcutId = registerShortcut({
      key: '2',
      altKey: true,
      description: 'Go to Datasets tab',
      handler: () => setActiveTab(1),
    });

    const releasesShortcutId = registerShortcut({
      key: '3',
      altKey: true,
      description: 'Go to Releases tab',
      handler: () => setActiveTab(2),
    });

    const tenantsShortcutId = registerShortcut({
      key: '4',
      altKey: true,
      description: 'Go to Tenants tab',
      handler: () => setActiveTab(3),
    });

    const monitoringShortcutId = registerShortcut({
      key: '5',
      altKey: true,
      description: 'Go to Monitoring tab',
      handler: () => setActiveTab(4),
    });

    // Refresh shortcut
    const refreshShortcutId = registerShortcut({
      key: 'r',
      ctrlKey: true,
      description: 'Refresh admin data',
      handler: () => {
        // This would refresh the data in a real implementation
      },
    });

    return () => {
      // Clean up shortcuts when component unmounts
      unregisterShortcut(tabShortcutId);
      unregisterShortcut(appsShortcutId);
      unregisterShortcut(datasetsShortcutId);
      unregisterShortcut(releasesShortcutId);
      unregisterShortcut(tenantsShortcutId);
      unregisterShortcut(monitoringShortcutId);
      unregisterShortcut(refreshShortcutId);
    };
  }, [registerShortcut, unregisterShortcut, activeTab]);

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

  // Get tab label based on active tab
  const getTabLabel = () => {
  // Added display name
  getTabLabel.displayName = 'getTabLabel';

  // Added display name
  getTabLabel.displayName = 'getTabLabel';

  // Added display name
  getTabLabel.displayName = 'getTabLabel';

  // Added display name
  getTabLabel.displayName = 'getTabLabel';

  // Added display name
  getTabLabel.displayName = 'getTabLabel';


    const labels = ['Applications', 'Datasets', 'Releases', 'Tenants', 'Monitoring'];
    return labels[activeTab];
  };

  // Define page actions
  const pageActions = [
    {
      label: 'Refresh',
      icon: <RefreshIcon />,
      onClick: () => {
        // This would refresh the data in a real implementation
      },
      variant: 'outlined',
    },
    {
      label: 'Documentation',
      icon: <LibraryBooksIcon />,
      onClick: () => window.location.href = '/admin/documentation',
      variant: 'outlined',
    },
    {
      label: 'Settings',
      icon: <SettingsIcon />,
      variant: 'outlined',
    },
  ];

  // Create tabs component for PageLayout
  const tabsComponent = (
    <Tabs
      value={activeTab}
      onChange={handleTabChange}
      variant="scrollable&quot;
      aria-label="admin dashboard tabs"
    >
      <Tabs.Tab 
        icon={<AppsIcon />} 
        label="Applications&quot; 
        id="admin-tab-0"
        aria-controls="admin-tabpanel-0"
      />
      <Tabs.Tab 
        icon={<StorageIcon />} 
        label="Datasets&quot;
        id="admin-tab-1"
        aria-controls="admin-tabpanel-1"
      />
      <Tabs.Tab 
        icon={<ReleaseIcon />} 
        label="Releases&quot;
        id="admin-tab-2"
        aria-controls="admin-tabpanel-2"
      />
      <Tabs.Tab 
        icon={<TenantIcon />} 
        label="Tenants&quot;
        id="admin-tab-3"
        aria-controls="admin-tabpanel-3"
      />
      <Tabs.Tab 
        icon={<MonitoringIcon />} 
        label="Monitoring&quot;
        id="admin-tab-4"
        aria-controls="admin-tabpanel-4"
      />
    </Tabs>
  );

  return (
    <PageLayout
      title="Admin Dashboard&quot;
      subtitle={`Manage ${getTabLabel().toLowerCase()} and other administrative resources`}
      actions={pageActions}
      icon={<DashboardIcon fontSize="large" color="primary&quot; />}
      tabs={tabsComponent}
      tabValue={activeTab}
      onTabChange={handleTabChange}
      helpText="Use keyboard shortcuts (Alt+1 to Alt+5) to quickly navigate between admin sections"
    >
      {/* Admin stats cards */}
      <MuiBox 
        display="flex&quot; 
        flexWrap="wrap" 
        gap="md&quot; 
        marginBottom="xl"
      >
        <MuiBox
          padding="lg&quot;
          flexGrow={1}
          minWidth="200px"
          borderLeft="4px solid&quot;
          borderColor="primary"
          display="flex&quot;
          flexDirection="column"
          alignItems="center&quot;
          boxShadow="0 1px 3px rgba(0,0,0,0.1)"
          borderRadius="4px&quot;
          bgcolor="white"
        >
          <MuiBox 
            as={AppsIcon} 
            style={{ 
              fontSize: '40px', 
              color: theme.colors.primary, 
              marginBottom: theme.spacing.sm 
            }} 
          />
          <Typography 
            variant="h4&quot; 
            textAlign="center"
          >
            12
          </Typography>
          <Typography 
            variant="body2&quot; 
            color="textSecondary" 
            textAlign="center&quot;
          >
            Applications
          </Typography>
        </MuiBox>

        <MuiBox
          padding="lg"
          flexGrow={1}
          minWidth="200px&quot;
          borderLeft="4px solid"
          borderColor="secondary&quot;
          display="flex"
          flexDirection="column&quot;
          alignItems="center"
          boxShadow="0 1px 3px rgba(0,0,0,0.1)&quot;
          borderRadius="4px"
          bgcolor="white&quot;
        >
          <MuiBox 
            as={StorageIcon} 
            style={{ 
              fontSize: "40px', 
              color: theme.colors.secondary, 
              marginBottom: theme.spacing.sm 
            }} 
          />
          <Typography 
            variant="h4&quot; 
            textAlign="center"
          >
            28
          </Typography>
          <Typography 
            variant="body2&quot; 
            color="textSecondary" 
            textAlign="center&quot;
          >
            Datasets
          </Typography>
        </MuiBox>

        <MuiBox
          padding="lg"
          flexGrow={1}
          minWidth="200px&quot;
          borderLeft="4px solid"
          borderColor="success&quot;
          display="flex"
          flexDirection="column&quot;
          alignItems="center"
          boxShadow="0 1px 3px rgba(0,0,0,0.1)&quot;
          borderRadius="4px"
          bgcolor="white&quot;
        >
          <MuiBox 
            as={ReleaseIcon} 
            style={{ 
              fontSize: "40px', 
              color: theme.colors.success, 
              marginBottom: theme.spacing.sm 
            }} 
          />
          <Typography 
            variant="h4&quot; 
            textAlign="center"
          >
            5
          </Typography>
          <Typography 
            variant="body2&quot; 
            color="textSecondary" 
            textAlign="center&quot;
          >
            Active Releases
          </Typography>
        </MuiBox>

        <MuiBox
          padding="lg"
          flexGrow={1}
          minWidth="200px&quot;
          borderLeft="4px solid"
          borderColor="info&quot;
          display="flex"
          flexDirection="column&quot;
          alignItems="center"
          boxShadow="0 1px 3px rgba(0,0,0,0.1)&quot;
          borderRadius="4px"
          bgcolor="white&quot;
        >
          <MuiBox 
            as={TenantIcon} 
            style={{ 
              fontSize: "40px', 
              color: theme.colors.info, 
              marginBottom: theme.spacing.sm 
            }} 
          />
          <Typography 
            variant="h4&quot; 
            textAlign="center"
          >
            8
          </Typography>
          <Typography 
            variant="body2&quot; 
            color="textSecondary" 
            textAlign="center&quot;
          >
            Active Tenants
          </Typography>
        </MuiBox>

      </MuiBox>

      {/* Tab panels */}
      <MuiBox marginTop="md">
        <TabPanel value={activeTab} index={0}>
          <ApplicationsManager />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <DatasetsManager />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <ReleasesManager />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <TenantsManager />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <MonitoringDashboard />
        </TabPanel>

      </MuiBox>

      {/* Keyboard shortcuts helper */}
      <KeyboardShortcutsHelp />
    </PageLayout>
  );
};

export default AdminDashboardPage;
