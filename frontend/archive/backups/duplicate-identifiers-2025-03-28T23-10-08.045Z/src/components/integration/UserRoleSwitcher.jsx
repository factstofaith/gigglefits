import {  Box, Paper , Box, Paper } from '../../design-system';
// UserRoleSwitcher.jsx
// -----------------------------------------------------------------------------
// Component for switching between user roles (for development/testing purposes)

import React from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';;
import authService from '@services/authService';
// Removed duplicate import
const UserRoleSwitcher = ({ onRoleChange }) => {
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
        <Typography variant="subtitle2" gutterBottom>
          Development Mode: Switch User Role
        </Typography>

        <RadioGroup row name="user-role" value={currentRole} onChange={handleRoleChange}>
          <FormControlLabel value="user" control={<Radio size="small" />} label="Regular User" />
          <FormControlLabel
            value="admin"
            control={<Radio size="small" />}
            label="Super User / Admin"
          />
        </RadioGroup>

        <Typography variant="caption" color="textSecondary">
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
