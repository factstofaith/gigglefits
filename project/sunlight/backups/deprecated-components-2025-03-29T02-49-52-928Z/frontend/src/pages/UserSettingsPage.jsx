// UserSettingsPage.jsx
// -----------------------------------------------------------------------------
// User settings and profile page with standardized layout,
// breadcrumbs, and keyboard shortcuts

import React, { useEffect } from 'react';
import {MuiBox as MuiBox} from '../design-system';
import {
  Settings as SettingsIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

// Import components
import PageLayout from '@components/common/PageLayout';
import KeyboardShortcutsHelp from '@components/common/KeyboardShortcutsHelp';
import UserProfile from '@components/common/UserProfile';

// Import contexts and hooks
import { useBreadcrumbs } from '@contexts/BreadcrumbContext';
import { useKeyboardShortcuts } from '@contexts/KeyboardShortcutsContext';
import { MuiBox } from '../design-system';
;

/**
 * User Settings page with standardized layout
 * Allows users to manage their profile, preferences, and account settings
 */
const UserSettingsPage = () => {
  // Added display name
  UserSettingsPage.displayName = 'UserSettingsPage';

  // Added display name
  UserSettingsPage.displayName = 'UserSettingsPage';

  // Added display name
  UserSettingsPage.displayName = 'UserSettingsPage';

  // Added display name
  UserSettingsPage.displayName = 'UserSettingsPage';

  // Added display name
  UserSettingsPage.displayName = 'UserSettingsPage';


  const { setBreadcrumbs } = useBreadcrumbs();
  const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();

  // Set breadcrumbs
  useEffect(() => {
    setBreadcrumbs([{ label: 'Home', path: '/' }, { label: 'Account Settings' }]);
  }, [setBreadcrumbs]);

  // Register keyboard shortcuts
  useEffect(() => {
    // Shortcut to save profile changes
    const saveShortcutId = registerShortcut({
      key: 's',
      ctrlKey: true,
      description: 'Save profile changes',
      handler: () => {
        // This would save changes in a real implementation
      },
    });

    // Shortcut to refresh profile data
    const refreshShortcutId = registerShortcut({
      key: 'r',
      ctrlKey: true,
      description: 'Refresh profile data',
      handler: () => {
        // This would refresh data in a real implementation
      },
    });

    return () => {
      // Clean up shortcuts when component unmounts
      unregisterShortcut(saveShortcutId);
      unregisterShortcut(refreshShortcutId);
    };
  }, [registerShortcut, unregisterShortcut]);

  // Define page actions
  const pageActions = [
    {
      label: 'Save Changes',
      icon: <SaveIcon />,
      onClick: () => {
        // This would save changes in a real implementation
      },
      variant: 'contained',
    },
    {
      label: 'Refresh',
      icon: <RefreshIcon />,
      onClick: () => {
        // This would refresh data in a real implementation
      },
      variant: 'outlined',
    },
  ];

  return (
    <PageLayout
      title="Account Settings&quot;
      subtitle="Manage your profile, preferences, and account settings"
      actions={pageActions}
      icon={<PersonIcon fontSize="large&quot; color="primary" />}
      helpText="Use Ctrl+S to save your changes&quot;
      paper={true}
    >
      {/* User Profile Component */}
      <MuiBox paddingY="md">
        <UserProfile />
      </MuiBox>

      {/* Keyboard shortcuts helper */}
      <KeyboardShortcutsHelp />
    </PageLayout>
  );
};

export default UserSettingsPage;
