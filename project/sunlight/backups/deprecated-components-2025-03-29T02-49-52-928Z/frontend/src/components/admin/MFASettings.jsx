import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, FormControl, FormLabel, Radio, FormControlLabel, Checkbox, Select, MenuItem, Grid, FormHelperText, Alert, LinearProgress, Divider, Snackbar, List, ListItem, ListItemText, ListItemIcon, Card, CardContent, Chip } from '../../design-system';
;;
import { 
  Save as SaveIcon,
  Security as SecurityIcon,
  Refresh as RefreshIcon,
  Check as CheckIcon,
  PhoneAndroid as PhoneIcon,
  Email as EmailIcon,
  Password as PasswordIcon,
  QuestionAnswer as QuestionIcon
} from '@mui/icons-material';
import { mfaService } from '@services/userManagementService';
import { RadioGroup } from '../../design-system';
// Design system import already exists;
// Design system import already exists;
// Removed duplicate import
// Removed duplicate import
/**
 * Component for managing system-wide MFA settings
 * Allows administrators to configure MFA policies
 */
const MFASettings = () => {
  // Added display name
  MFASettings.displayName = 'MFASettings';

  // Added display name
  MFASettings.displayName = 'MFASettings';

  // Added display name
  MFASettings.displayName = 'MFASettings';

  // Added display name
  MFASettings.displayName = 'MFASettings';

  // Added display name
  MFASettings.displayName = 'MFASettings';


  // Form state
  const [formData, setFormData] = useState({
    enforcementPolicy: 'optional', // optional, required, admin_required
    gracePeriod: '7',              // days for existing users to set up MFA
    
    // MFA methods
    methods: {
      totp: true,                  // Time-based One-Time Password
      email: false,                // Email verification code
      sms: false                   // SMS verification code (future)
    },
    
    // Recovery options
    recoveryOptions: {
      recoveryCodes: true,         // One-time use recovery codes
      alternativeEmail: false,     // Alternative email recovery
      securityQuestions: false     // Security questions
    },
    
    // Recovery code settings
    recoveryCodeCount: 10,         // Number of recovery codes
    recoveryCodeFormat: '8',       // Character length of recovery codes
  });
  
  // State for API interactions
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Fetch MFA settings on component mount
  useEffect(() => {
    fetchMFASettings();
  }, []);
  
  // Fetch MFA settings from API
  const fetchMFASettings = async () => {
    setConfigLoading(true);
    try {
      const response = await mfaService.getMFASettings();
      
      // Populate form with fetched data
      setFormData({
        enforcementPolicy: response.data.enforcement_policy || 'optional',
        gracePeriod: response.data.grace_period?.toString() || '7',
        
        methods: {
          totp: response.data.methods?.totp !== false,
          email: response.data.methods?.email === true,
          sms: response.data.methods?.sms === true
        },
        
        recoveryOptions: {
          recoveryCodes: response.data.recovery_options?.recovery_codes !== false,
          alternativeEmail: response.data.recovery_options?.alternative_email === true,
          securityQuestions: response.data.recovery_options?.security_questions === true
        },
        
        recoveryCodeCount: response.data.recovery_code_settings?.count || 10,
        recoveryCodeFormat: response.data.recovery_code_settings?.format?.toString() || '8'
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching MFA settings:', err);
      setError('Failed to load MFA settings.');
    } finally {
      setConfigLoading(false);
    }
  };
  
  // Handle form field changes
  const handleChange = (e) => {
  // Added display name
  handleChange.displayName = 'handleChange';

  // Added display name
  handleChange.displayName = 'handleChange';

  // Added display name
  handleChange.displayName = 'handleChange';

  // Added display name
  handleChange.displayName = 'handleChange';

  // Added display name
  handleChange.displayName = 'handleChange';


    const { name, value, type, checked } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      const newValue = type === 'checkbox' ? checked : value;
      setFormData(prev => ({
        ...prev,
        [name]: newValue
      }));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // At least one MFA method must be enabled
    if (!formData.methods.totp && !formData.methods.email && !formData.methods.sms) {
      setError('At least one MFA method must be enabled');
      return;
    }
    
    setLoading(true);
    try {
      // Prepare settings data for API
      const settingsData = {
        enforcement_policy: formData.enforcementPolicy,
        grace_period: parseInt(formData.gracePeriod, 10),
        
        methods: {
          totp: formData.methods.totp,
          email: formData.methods.email,
          sms: formData.methods.sms
        },
        
        recovery_options: {
          recovery_codes: formData.recoveryOptions.recoveryCodes,
          alternative_email: formData.recoveryOptions.alternativeEmail,
          security_questions: formData.recoveryOptions.securityQuestions
        },
        
        recovery_code_settings: {
          count: formData.recoveryCodeCount,
          format: parseInt(formData.recoveryCodeFormat, 10)
        }
      };
      
      // Update MFA settings
      await mfaService.updateMFASettings(settingsData);
      
      setSuccess('MFA settings updated successfully');
      setError(null);
      
      // Refresh settings
      fetchMFASettings();
    } catch (err) {
      console.error('Error updating MFA settings:', err);
      setError('Failed to update MFA settings.');
      setSuccess(null);
    } finally {
      setLoading(false);
    }
  };
  
  // Handle snackbar close
  const handleSnackbarClose = () => {
  // Added display name
  handleSnackbarClose.displayName = 'handleSnackbarClose';

  // Added display name
  handleSnackbarClose.displayName = 'handleSnackbarClose';

  // Added display name
  handleSnackbarClose.displayName = 'handleSnackbarClose';

  // Added display name
  handleSnackbarClose.displayName = 'handleSnackbarClose';

  // Added display name
  handleSnackbarClose.displayName = 'handleSnackbarClose';


    setSuccess(null);
  };
  
  return (
    <Box>
      <Typography variant="h5&quot; component="h1" gutterBottom>
        Multi-Factor Authentication Settings
      </Typography>
      
      {/* Loading indicator for initial load */}
      {configLoading && (
        <LinearProgress sx={{ mb: 3 }} />
      )}
      
      {/* Success message */}
      <Snackbar
        open={!!success}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={success}
      />
      
      {/* Error message */}
      {error && (
        <Alert severity="error&quot; sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* MFA settings form */}
      <form onSubmit={handleSubmit}>
        {/* MFA Enforcement Policy */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            MFA Enforcement
          </Typography>
          
          <FormControl component="fieldset&quot; fullWidth sx={{ mb: 3 }}>
            <FormLabel component="legend">Enforcement Policy</FormLabel>
            <RadioGroup
              name="enforcementPolicy&quot;
              value={formData.enforcementPolicy}
              onChange={handleChange}
            >
              <FormControlLabel
                value="optional"
                control={<Radio />}
                label="Optional (users can choose to enable MFA)&quot;
                disabled={loading}
              />
              <FormControlLabel
                value="required"
                control={<Radio />}
                label="Required for all users&quot;
                disabled={loading}
              />
              <FormControlLabel
                value="admin_required"
                control={<Radio />}
                label="Required for admin users only&quot;
                disabled={loading}
              />
            </RadioGroup>
          </FormControl>
          
          <FormControl fullWidth sx={{ mb: 2 }}>
            <FormLabel component="legend">Grace Period for Existing Users</FormLabel>
            <Select
              name="gracePeriod&quot;
              value={formData.gracePeriod}
              onChange={handleChange}
              disabled={loading || formData.enforcementPolicy === "optional'}
            >
              <MenuItem value="1&quot;>1 day</MenuItem>
              <MenuItem value="3">3 days</MenuItem>
              <MenuItem value="7&quot;>7 days</MenuItem>
              <MenuItem value="14">14 days</MenuItem>
              <MenuItem value="30&quot;>30 days</MenuItem>
            </Select>
            <FormHelperText>
              Time given to existing users to set up MFA after policy change
            </FormHelperText>
          </FormControl>
        </Paper>
        
        {/* MFA Methods */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            MFA Methods
          </Typography>
          
          <Typography variant="body2&quot; color="text.secondary" paragraph>
            Select which methods users can use for multi-factor authentication
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined&quot;>
                <CardContent>
                  <Box sx={{ display: "flex', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon color="primary&quot; sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Authenticator App
                    </Typography>
                    <Chip 
                      label="Recommended&quot; 
                      color="success" 
                      size="small&quot; 
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary&quot; paragraph>
                    Users set up an authenticator app to generate time-based verification codes.
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.methods.totp}
                        onChange={handleChange}
                        name="methods.totp"
                        disabled={loading}
                      />
                    }
                    label="Enable TOTP Authentication&quot;
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmailIcon color="primary&quot; sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Email Verification
                    </Typography>
                  </Box>
                  
                  <Typography variant="body2&quot; color="text.secondary" paragraph>
                    Users receive a verification code via email during login.
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.methods.email}
                        onChange={handleChange}
                        name="methods.email&quot;
                        disabled={loading}
                      />
                    }
                    label="Enable Email Verification"
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined&quot;>
                <CardContent>
                  <Box sx={{ display: "flex', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon color="primary&quot; sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      SMS Verification
                    </Typography>
                    <Chip 
                      label="Coming Soon&quot; 
                      color="info" 
                      size="small&quot; 
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary&quot; paragraph>
                    Users receive a verification code via SMS during login.
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.methods.sms}
                        onChange={handleChange}
                        name="methods.sms"
                        disabled={true} // Disabled as feature is coming soon
                      />
                    }
                    label="Enable SMS Verification (Coming Soon)&quot;
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Recovery Options */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recovery Options
          </Typography>
          
          <Typography variant="body2&quot; color="text.secondary" paragraph>
            Select which recovery methods users can use if they lose access to their primary MFA method
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card variant="outlined&quot;>
                <CardContent>
                  <Box sx={{ display: "flex', alignItems: 'center', mb: 2 }}>
                    <PasswordIcon color="primary&quot; sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Recovery Codes
                    </Typography>
                    <Chip 
                      label="Recommended&quot; 
                      color="success" 
                      size="small&quot; 
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary&quot; paragraph>
                    One-time use recovery codes that users can store securely.
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.recoveryOptions.recoveryCodes}
                        onChange={handleChange}
                        name="recoveryOptions.recoveryCodes"
                        disabled={loading}
                      />
                    }
                    label="Enable Recovery Codes&quot;
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmailIcon color="primary&quot; sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Alternative Email
                    </Typography>
                    <Chip 
                      label="Coming Soon&quot; 
                      color="info" 
                      size="small&quot; 
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary&quot; paragraph>
                    Users can set up a backup email for account recovery.
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.recoveryOptions.alternativeEmail}
                        onChange={handleChange}
                        name="recoveryOptions.alternativeEmail"
                        disabled={true} // Disabled as feature is coming soon
                      />
                    }
                    label="Enable Alternative Email (Coming Soon)&quot;
                  />
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <QuestionIcon color="primary&quot; sx={{ mr: 1 }} />
                    <Typography variant="h6">
                      Security Questions
                    </Typography>
                    <Chip 
                      label="Coming Soon&quot; 
                      color="info" 
                      size="small&quot; 
                      sx={{ ml: 1 }}
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary&quot; paragraph>
                    Users can set up security questions for account recovery.
                  </Typography>
                  
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={formData.recoveryOptions.securityQuestions}
                        onChange={handleChange}
                        name="recoveryOptions.securityQuestions"
                        disabled={true} // Disabled as feature is coming soon
                      />
                    }
                    label="Enable Security Questions (Coming Soon)&quot;
                  />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Recovery Code Settings */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recovery Code Settings
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <FormLabel component="legend&quot;>Number of Recovery Codes</FormLabel>
                <Select
                  name="recoveryCodeCount"
                  value={formData.recoveryCodeCount}
                  onChange={handleChange}
                  disabled={loading || !formData.recoveryOptions.recoveryCodes}
                >
                  <MenuItem value={5}>5 codes</MenuItem>
                  <MenuItem value={10}>10 codes</MenuItem>
                  <MenuItem value={15}>15 codes</MenuItem>
                  <MenuItem value={20}>20 codes</MenuItem>
                </Select>
                <FormHelperText>
                  Number of recovery codes to generate for each user
                </FormHelperText>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <FormLabel component="legend&quot;>Recovery Code Format</FormLabel>
                <Select
                  name="recoveryCodeFormat"
                  value={formData.recoveryCodeFormat}
                  onChange={handleChange}
                  disabled={loading || !formData.recoveryOptions.recoveryCodes}
                >
                  <MenuItem value="8&quot;>8 characters</MenuItem>
                  <MenuItem value="10">10 characters</MenuItem>
                  <MenuItem value="12&quot;>12 characters</MenuItem>
                  <MenuItem value="16">16 characters</MenuItem>
                </Select>
                <FormHelperText>
                  Length of each recovery code
                </FormHelperText>
              </FormControl>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Form actions */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined&quot;
            startIcon={<RefreshIcon />}
            onClick={fetchMFASettings}
            disabled={loading}
          >
            Reset
          </Button>
          
          <Button
            type="submit"
            variant="contained&quot;
            color="primary"
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            Save Settings
          </Button>
        </Box>
      </form>
      
      {/* Loading indicator for form submission */}
      {loading && (
        <LinearProgress sx={{ mt: 3 }} />
      )}
    </Box>
  );
};

export default MFASettings;