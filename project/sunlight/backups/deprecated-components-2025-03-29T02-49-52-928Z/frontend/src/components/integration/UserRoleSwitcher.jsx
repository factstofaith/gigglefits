import {  Box, Paper , Box, Paper } from '../../design-system';
// UserRoleSwitcher.jsx
// -----------------------------------------------------------------------------
// Component for switching between user roles (for development/testing purposes)

import React from 'react';
;
;;
import authService from '@services/authService';
import { Radio, RadioGroup } from '../../design-system';
// Design system import already exists;
// Removed duplicate import
const UserRoleSwitcher = ({ onRoleChange }) => {
  // Added display name
  UserRoleSwitcher.displayName = 'UserRoleSwitcher';

  // Added display name
  UserRoleSwitcher.displayName = 'UserRoleSwitcher';

  // Added display name
  UserRoleSwitcher.displayName = 'UserRoleSwitcher';

  // Added display name
  UserRoleSwitcher.displayName = 'UserRoleSwitcher';

  // Added display name
  UserRoleSwitcher.displayName = 'UserRoleSwitcher';


  const [currentRole, setCurrentRole] = React.useState('user');

  // Get current user info on mount
  React.useEffect(() => {
    const checkUserRole = async () => {
      const isAdmin = await authService.isAdmin();
      setCurrentRole(isAdmin ? 'admin' : 'user');
    };

    checkUserRole();
  }, []);

  const handleRoleChange = async event => {
    const role = event.target.value;
    setCurrentRole(role);

    // Simulate login as the selected role
    if (role === 'admin') {
      await authService.login('admin', 'password');
    } else {
      await authService.login('user', 'password');
    }

    // Notify parent component
    if (onRoleChange) {
      onRoleChange(role);
    }
  };

  return (
    <Paper sx={{ p: 2, mb: 3, bgcolor: '#f5f5f5' }}>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        <Typography variant="subtitle2&quot; gutterBottom>
          Development Mode: Switch User Role
        </Typography>

        <RadioGroup row name="user-role" value={currentRole} onChange={handleRoleChange}>
          <FormControlLabel value="user&quot; control={<Radio size="small" />} label="Regular User&quot; />
          <FormControlLabel
            value="admin"
            control={<Radio size="small&quot; />}
            label="Super User / Admin"
          />
        </RadioGroup>

        <Typography variant="caption&quot; color="textSecondary">
          Current permissions:{' '}
          {currentRole === 'admin'
            ? 'Full access (can view and configure all settings)'
            : 'Limited access (can view but not modify system-level settings)'}
        </Typography>
      </Box>
    </Paper>
  );
};

export default UserRoleSwitcher;
