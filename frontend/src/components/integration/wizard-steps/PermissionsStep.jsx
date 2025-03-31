/**
 * Permissions Step
 *
 * Fifth step of the dataset creation wizard that configures access permissions
 * for the dataset, including private, public, or shared access levels.
 *
 * @component
 */

import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  Typography,
  Paper,
  Divider,
  Chip,
  TextField,
  Autocomplete,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Select,
  MenuItem,
  InputLabel,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import PublicIcon from '@mui/icons-material/Public';
import PeopleIcon from '@mui/icons-material/People';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

/**
 * Mock user data for demonstration purposes
 */
const MOCK_USERS = [
  { id: 'user-1', name: 'John Doe', email: 'john.doe@example.com' },
  { id: 'user-2', name: 'Jane Smith', email: 'jane.smith@example.com' },
  { id: 'user-3', name: 'Alice Johnson', email: 'alice.johnson@example.com' },
  { id: 'user-4', name: 'Bob Williams', email: 'bob.williams@example.com' },
  { id: 'user-5', name: 'Carol Brown', email: 'carol.brown@example.com' },
];

/**
 * Permissions Step component
 *
 * @param {Object} props - Component props
 * @param {Object} props.formik - Formik instance
 * @returns {JSX.Element} The PermissionsStep component
 */
const PermissionsStep = ({ formik }) => {
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedPermission, setSelectedPermission] = useState('read');

  /**
   * Handle access level change
   * @param {Event} event - Change event
   */
  const handleAccessLevelChange = (event) => {
    formik.setFieldValue('accessLevel', event.target.value);
  };

  /**
   * Add a user to the shared users list
   */
  const handleAddUser = () => {
    if (selectedUser) {
      const newSharedWith = [
        ...formik.values.sharedWith,
        {
          userId: selectedUser.id,
          userName: selectedUser.name,
          userEmail: selectedUser.email,
          permission: selectedPermission,
        },
      ];
      formik.setFieldValue('sharedWith', newSharedWith);
      setSelectedUser(null);
      setSelectedPermission('read');
    }
  };

  /**
   * Remove a user from the shared users list
   * @param {string} userId - User ID to remove
   */
  const handleRemoveUser = (userId) => {
    const updatedSharedWith = formik.values.sharedWith.filter(
      (user) => user.userId !== userId
    );
    formik.setFieldValue('sharedWith', updatedSharedWith);
  };

  /**
   * Update a user's permission level
   * @param {string} userId - User ID
   * @param {string} newPermission - New permission level
   */
  const handleChangePermission = (userId, newPermission) => {
    const updatedSharedWith = formik.values.sharedWith.map((user) => {
      if (user.userId === userId) {
        return { ...user, permission: newPermission };
      }
      return user;
    });
    formik.setFieldValue('sharedWith', updatedSharedWith);
  };

  return (
    <Box>
      <FormControl component="fieldset" sx={{ width: '100%' }}>
        <Typography variant="subtitle1" gutterBottom fontWeight="bold">
          Access Level
        </Typography>
        <RadioGroup
          name="accessLevel"
          value={formik.values.accessLevel}
          onChange={handleAccessLevelChange}
        >
          <Paper sx={{ mb: 2, p: 2 }}>
            <FormControlLabel
              value="private"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LockIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">Private</Typography>
                </Box>
              }
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              Only you and administrators can access this dataset
            </Typography>
          </Paper>

          <Paper sx={{ mb: 2, p: 2 }}>
            <FormControlLabel
              value="shared"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PeopleIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">Shared</Typography>
                </Box>
              }
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              You can choose specific users to grant access to this dataset
            </Typography>
          </Paper>

          <Paper sx={{ mb: 2, p: 2 }}>
            <FormControlLabel
              value="public"
              control={<Radio />}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <PublicIcon color="action" sx={{ mr: 1 }} />
                  <Typography variant="subtitle1">Public</Typography>
                </Box>
              }
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 4 }}>
              All users in your organization can access this dataset
            </Typography>
          </Paper>
        </RadioGroup>

        {formik.touched.accessLevel && formik.errors.accessLevel && (
          <FormHelperText error>{formik.errors.accessLevel}</FormHelperText>
        )}
      </FormControl>

      {formik.values.accessLevel === 'shared' && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="subtitle1" gutterBottom fontWeight="bold">
            Share With Users
          </Typography>
          <Divider sx={{ mb: 2 }} />

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <Autocomplete
              id="user-select"
              options={MOCK_USERS}
              getOptionLabel={(option) => `${option.name} (${option.email})`}
              value={selectedUser}
              onChange={(event, newValue) => setSelectedUser(newValue)}
              sx={{ flexGrow: 1 }}
              renderInput={(params) => (
                <TextField {...params} label="Select User" />
              )}
              isOptionEqualToValue={(option, value) => option.id === value.id}
            />

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel id="permission-label">Permission</InputLabel>
              <Select
                labelId="permission-label"
                id="permission-select"
                value={selectedPermission}
                label="Permission"
                onChange={(e) => setSelectedPermission(e.target.value)}
              >
                <MenuItem value="read">Read Only</MenuItem>
                <MenuItem value="write">Read & Write</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleAddUser}
              disabled={!selectedUser}
            >
              Add
            </Button>
          </Box>

          {formik.values.sharedWith.length > 0 ? (
            <Paper variant="outlined">
              <List>
                {formik.values.sharedWith.map((user) => (
                  <ListItem key={user.userId} divider>
                    <ListItemText
                      primary={user.userName}
                      secondary={user.userEmail}
                    />
                    <Select
                      size="small"
                      value={user.permission}
                      onChange={(e) =>
                        handleChangePermission(user.userId, e.target.value)
                      }
                      sx={{ mr: 2, width: 120 }}
                    >
                      <MenuItem value="read">Read Only</MenuItem>
                      <MenuItem value="write">Read & Write</MenuItem>
                      <MenuItem value="admin">Admin</MenuItem>
                    </Select>
                    <ListItemSecondaryAction>
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveUser(user.userId)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          ) : (
            <Typography variant="body2" color="text.secondary">
              No users added yet. Use the form above to share with specific users.
            </Typography>
          )}

          {formik.touched.sharedWith && formik.errors.sharedWith && (
            <FormHelperText error>{formik.errors.sharedWith}</FormHelperText>
          )}
        </Box>
      )}
    </Box>
  );
};

PermissionsStep.propTypes = {
  formik: PropTypes.object.isRequired,
};

export default PermissionsStep;