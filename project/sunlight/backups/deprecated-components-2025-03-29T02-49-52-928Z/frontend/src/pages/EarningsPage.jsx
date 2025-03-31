// EarningsPage.jsx
// -----------------------------------------------------------------------------
// Earnings page with standardized layout, breadcrumbs, and keyboard shortcuts

import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, Link, useLocation } from 'react-router-dom';
import {MuiBox as MuiBox, Typography, Tabs, Button, } from '../design-system';
import {
  CompareArrows as MappingIcon,
  People as PeopleIcon,
  Code as CodeIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';

// Import components
import PageLayout from '@components/common/PageLayout';
import KeyboardShortcutsHelp from '@components/common/KeyboardShortcutsHelp';
import EmployeeRosterManager from '@components/earnings/EmployeeRosterManager';
import EmployeeManager from '@components/earnings/EmployeeManager';
import EarningsMapEditor from '@components/earnings/EarningsMapEditor';
import EarningsCodeManager from '@components/earnings/EarningsCodeManager';

// Import contexts and hooks
import { useBreadcrumbs } from '@contexts/BreadcrumbContext';
import { useKeyboardShortcuts } from '@contexts/KeyboardShortcutsContext';
import { MuiBox, Tab } from '../design-system';
// Design system import already exists;
;
;

/**
 * Earnings page with standardized layout
 * Manages employee rosters, mappings and earnings codes
 */
const EarningsPage = () => {
  // Added display name
  EarningsPage.displayName = 'EarningsPage';

  // Added display name
  EarningsPage.displayName = 'EarningsPage';

  // Added display name
  EarningsPage.displayName = 'EarningsPage';

  // Added display name
  EarningsPage.displayName = 'EarningsPage';

  // Added display name
  EarningsPage.displayName = 'EarningsPage';


  const navigate = useNavigate();
  const location = useLocation();
  const { setBreadcrumbs } = useBreadcrumbs();
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();
  const [activeTab, setActiveTab] = useState(0);

  // Get current path to determine active tab and set breadcrumbs
  const currentPath = location.pathname;

  // Update breadcrumbs based on current path
  useEffect(() => {
    if (currentPath.includes('/rosters/')) {
      const rosterId = currentPath.split('/').pop();
      if (currentPath.includes('/employees')) {
        setBreadcrumbs([
          { label: 'Home', path: '/' },
          { label: 'Earnings', path: '/earnings/rosters' },
          { label: `Roster ${rosterId}`, path: `/earnings/rosters/${rosterId}` },
          { label: 'Employees' },
        ]);
      } else if (currentPath.includes('/mappings')) {
        setBreadcrumbs([
          { label: 'Home', path: '/' },
          { label: 'Earnings', path: '/earnings/rosters' },
          { label: `Roster ${rosterId}`, path: `/earnings/rosters/${rosterId}` },
          { label: 'Mappings' },
        ]);
      } else {
        setBreadcrumbs([
          { label: 'Home', path: '/' },
          { label: 'Earnings', path: '/earnings/rosters' },
          { label: `Roster ${rosterId}` },
        ]);
      }
    } else if (currentPath.includes('/codes')) {
      setBreadcrumbs([
        { label: 'Home', path: '/' },
        { label: 'Earnings', path: '/earnings' },
        { label: 'Earnings Codes' },
      ]);
    } else {
      setBreadcrumbs([{ label: 'Home', path: '/' }, { label: 'Earnings' }]);
    }
  }, [currentPath, setBreadcrumbs]);

  // Register keyboard shortcuts
  useEffect(() => {
    // Shortcut to switch between tabs
    const tabSwitchShortcutId = registerShortcut({
      key: 't',
      ctrlKey: true,
      description: 'Switch between Earnings tabs',
      handler: () => {
        const newTab = activeTab === 0 ? 1 : 0;
        setActiveTab(newTab);
        navigate(newTab === 0 ? '/earnings/rosters' : '/earnings/codes');
      },
    });

    // Shortcut for Employee Rosters tab
    const rosterShortcutId = registerShortcut({
      key: '1',
      altKey: true,
      description: 'Go to Employee Rosters',
      handler: () => {
        setActiveTab(0);
        navigate('/earnings/rosters');
      },
    });

    // Shortcut for Earnings Codes tab
    const codesShortcutId = registerShortcut({
      key: '2',
      altKey: true,
      description: 'Go to Earnings Codes',
      handler: () => {
        setActiveTab(1);
        navigate('/earnings/codes');
      },
    });

    // Shortcut to refresh data
    const refreshShortcutId = registerShortcut({
      key: 'r',
      ctrlKey: true,
      description: 'Refresh earnings data',
      handler: () => {
        // This would refresh data in a real implementation
      },
    });

    return () => {
      // Clean up shortcuts when component unmounts
      unregisterShortcut(tabSwitchShortcutId);
      unregisterShortcut(rosterShortcutId);
      unregisterShortcut(codesShortcutId);
      unregisterShortcut(refreshShortcutId);
    };
  }, [registerShortcut, unregisterShortcut, activeTab, navigate]);

  // Set active tab based on path
  useEffect(() => {
    if (currentPath.includes('/earnings/codes')) {
      setActiveTab(1);
    } else {
      setActiveTab(0);
    }
  }, [currentPath]);

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

    // Navigate based on tab selection
    switch (newValue) {
      case 0:
        navigate('/earnings/rosters');
        break;
      case 1:
        navigate('/earnings/codes');
        break;
      default:
        navigate('/earnings/rosters');
    }
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
  ];

  // Create tab component for PageLayout
  const tabsComponent = (
    <Tabs
      value={activeTab}
      onChange={handleTabChange}
      variant="fullWidth&quot;
      indicatorColor="primary"
      textColor="primary&quot;
    >
      <Tab icon={<PeopleIcon />} label="Employee Rosters" iconPosition="start&quot; />
      <Tab icon={<CodeIcon />} label="Earnings Codes" iconPosition="start&quot; />
    </Tabs>
  );

  // Get subtitle based on current tab
  const getSubtitle = () => {
  // Added display name
  getSubtitle.displayName = "getSubtitle';

  // Added display name
  getSubtitle.displayName = 'getSubtitle';

  // Added display name
  getSubtitle.displayName = 'getSubtitle';

  // Added display name
  getSubtitle.displayName = 'getSubtitle';

  // Added display name
  getSubtitle.displayName = 'getSubtitle';


    if (currentPath.includes('/rosters/')) {
      const rosterId = currentPath.split('/').pop();
      if (currentPath.includes('/employees')) {
        return `Managing employees for roster ${rosterId}`;
      } else if (currentPath.includes('/mappings')) {
        return `Editing earnings mappings for roster ${rosterId}`;
      } else {
        return `Roster ${rosterId} details`;
      }
    } else if (activeTab === 0) {
      return 'Manage employee rosters and payroll mapping';
    } else {
      return 'Configure and manage earnings codes';
    }
  };

  return (
    <PageLayout
      title="Earnings Management&quot;
      subtitle={getSubtitle()}
      actions={pageActions}
      icon={<MappingIcon fontSize="large" color="primary&quot; />}
      tabs={tabsComponent}
      tabValue={activeTab}
      onTabChange={handleTabChange}
      helpText="Use keyboard shortcuts (Alt+1, Alt+2) to quickly switch between tabs"
    >
      {/* Main content */}
      <MuiBox sx={{ mt: 2 }}>
        <Routes>
          <Route path="rosters&quot; element={<EmployeeRosterManager />} />
          <Route path="rosters/:rosterId/employees" element={<EmployeeManager />} />
          <Route path="rosters/:rosterId/mappings&quot; element={<EarningsMapEditor />} />
          <Route path="codes" element={<EarningsCodeManager />} />
        </Routes>
      </MuiBox>

      {/* Keyboard shortcuts helper */}
      <KeyboardShortcutsHelp />
    </PageLayout>
  );
};

export default EarningsPage;
