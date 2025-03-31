import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, Paper, TextField, Grid, Radio, FormControlLabel, FormControl, FormLabel, InputAdornment, Divider, Alert, Snackbar, LinearProgress, Tabs, Tab, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions } from '../../design-system';
;
;;
import { 
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Send as SendIcon,
  Save as SaveIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { emailConfigService } from '@services/userManagementService';
import { IconButton, RadioGroup } from '../../design-system';
// Design system import already exists;
// Design system import already exists;
// Design system import already exists;
// Removed duplicate import
// Removed duplicate import
// Removed duplicate import
/**
 * Component for configuring email settings
 * Allows administrators to set up email integration for the invitation system
 */
const EmailConfiguration = () => {
  // Added display name
  EmailConfiguration.displayName = 'EmailConfiguration';

  // Added display name
  EmailConfiguration.displayName = 'EmailConfiguration';

  // Added display name
  EmailConfiguration.displayName = 'EmailConfiguration';

  // Added display name
  EmailConfiguration.displayName = 'EmailConfiguration';

  // Added display name
  EmailConfiguration.displayName = 'EmailConfiguration';


  // Form state
  const [formData, setFormData] = useState({
    emailProvider: 'office365',
    
    // Office 365 settings
    clientId: '',
    clientSecret: '',
    tenantId: '',
    
    // SMTP settings
    smtpHost: '',
    smtpPort: '',
    smtpUsername: '',
    smtpPassword: '',
    smtpSecure: true,
    
    // General settings
    fromEmail: '',
    fromName: '',
    replyToEmail: ''
  });
  
  // State for testing email
  const [testEmailRecipient, setTestEmailRecipient] = useState('');
  const [testDialogOpen, setTestDialogOpen] = useState(false);
  
  // State for form errors
  const [formErrors, setFormErrors] = useState({});
  
  // State for visibility
  const [showClientSecret, setShowClientSecret] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  
  // State for API interactions
  const [loading, setLoading] = useState(false);
  const [configLoading, setConfigLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // State for tabs
  const [tabValue, setTabValue] = useState(0);
  
  // Fetch email configuration on component mount
  useEffect(() => {
    fetchEmailConfig();
  }, []);
  
  // Fetch email configuration from API
  const fetchEmailConfig = async () => {
    setConfigLoading(true);
    try {
      const response = await emailConfigService.getEmailConfig();
      
      // Populate form with fetched data
      setFormData({
        emailProvider: response.data.provider || 'office365',
        
        // Office 365 settings
        clientId: response.data.office365?.client_id || '',
        clientSecret: response.data.office365?.client_secret ? '********' : '',
        tenantId: response.data.office365?.tenant_id || '',
        
        // SMTP settings
        smtpHost: response.data.smtp?.host || '',
        smtpPort: response.data.smtp?.port || '',
        smtpUsername: response.data.smtp?.username || '',
        smtpPassword: response.data.smtp?.password ? '********' : '',
        smtpSecure: response.data.smtp?.secure !== false,
        
        // General settings
        fromEmail: response.data.from_email || '',
        fromName: response.data.from_name || '',
        replyToEmail: response.data.reply_to_email || ''
      });
      
      setError(null);
    } catch (err) {
      console.error('Error fetching email configuration:', err);
      setError('Failed to load email configuration.');
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
    const newValue = type === 'checkbox' ? checked : value;
    
    setFormData(prev => ({
      ...prev,
      [name]: newValue
    }));
    
    // Clear field error when changed
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
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
  
  // Toggle password visibility
  const toggleClientSecretVisibility = () => {
  // Added display name
  toggleClientSecretVisibility.displayName = 'toggleClientSecretVisibility';

  // Added display name
  toggleClientSecretVisibility.displayName = 'toggleClientSecretVisibility';

  // Added display name
  toggleClientSecretVisibility.displayName = 'toggleClientSecretVisibility';

  // Added display name
  toggleClientSecretVisibility.displayName = 'toggleClientSecretVisibility';

  // Added display name
  toggleClientSecretVisibility.displayName = 'toggleClientSecretVisibility';


    setShowClientSecret(!showClientSecret);
  };
  
  const toggleSmtpPasswordVisibility = () => {
  // Added display name
  toggleSmtpPasswordVisibility.displayName = 'toggleSmtpPasswordVisibility';

  // Added display name
  toggleSmtpPasswordVisibility.displayName = 'toggleSmtpPasswordVisibility';

  // Added display name
  toggleSmtpPasswordVisibility.displayName = 'toggleSmtpPasswordVisibility';

  // Added display name
  toggleSmtpPasswordVisibility.displayName = 'toggleSmtpPasswordVisibility';

  // Added display name
  toggleSmtpPasswordVisibility.displayName = 'toggleSmtpPasswordVisibility';


    setShowSmtpPassword(!showSmtpPassword);
  };
  
  // Open test email dialog
  const handleOpenTestDialog = () => {
  // Added display name
  handleOpenTestDialog.displayName = 'handleOpenTestDialog';

  // Added display name
  handleOpenTestDialog.displayName = 'handleOpenTestDialog';

  // Added display name
  handleOpenTestDialog.displayName = 'handleOpenTestDialog';

  // Added display name
  handleOpenTestDialog.displayName = 'handleOpenTestDialog';

  // Added display name
  handleOpenTestDialog.displayName = 'handleOpenTestDialog';


    setTestEmailRecipient('');
    setTestDialogOpen(true);
  };
  
  // Close test email dialog
  const handleCloseTestDialog = () => {
  // Added display name
  handleCloseTestDialog.displayName = 'handleCloseTestDialog';

  // Added display name
  handleCloseTestDialog.displayName = 'handleCloseTestDialog';

  // Added display name
  handleCloseTestDialog.displayName = 'handleCloseTestDialog';

  // Added display name
  handleCloseTestDialog.displayName = 'handleCloseTestDialog';

  // Added display name
  handleCloseTestDialog.displayName = 'handleCloseTestDialog';


    setTestDialogOpen(false);
  };
  
  // Handle test email recipient change
  const handleTestEmailRecipientChange = (e) => {
  // Added display name
  handleTestEmailRecipientChange.displayName = 'handleTestEmailRecipientChange';

  // Added display name
  handleTestEmailRecipientChange.displayName = 'handleTestEmailRecipientChange';

  // Added display name
  handleTestEmailRecipientChange.displayName = 'handleTestEmailRecipientChange';

  // Added display name
  handleTestEmailRecipientChange.displayName = 'handleTestEmailRecipientChange';

  // Added display name
  handleTestEmailRecipientChange.displayName = 'handleTestEmailRecipientChange';


    setTestEmailRecipient(e.target.value);
  };
  
  // Send test email
  const handleSendTestEmail = async () => {
    if (!testEmailRecipient || !/\S+@\S+\.\S+/.test(testEmailRecipient)) {
      setFormErrors(prev => ({
        ...prev,
        testEmailRecipient: 'Please enter a valid email address'
      }));
      return;
    }
    
    setLoading(true);
    try {
      await emailConfigService.sendTestEmail(testEmailRecipient);
      setSuccess(`Test email sent to ${testEmailRecipient}`);
      setTestDialogOpen(false);
    } catch (err) {
      console.error('Error sending test email:', err);
      setError('Failed to send test email. Please check your email configuration.');
    } finally {
      setLoading(false);
    }
  };
  
  // Validate form based on selected provider
  const validateForm = () => {
  // Added display name
  validateForm.displayName = 'validateForm';

  // Added display name
  validateForm.displayName = 'validateForm';

  // Added display name
  validateForm.displayName = 'validateForm';

  // Added display name
  validateForm.displayName = 'validateForm';

  // Added display name
  validateForm.displayName = 'validateForm';


    const errors = {};
    
    // Validate general settings
    if (!formData.fromEmail) {
      errors.fromEmail = 'From email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.fromEmail)) {
      errors.fromEmail = 'Please enter a valid email address';
    }
    
    if (!formData.fromName) {
      errors.fromName = 'From name is required';
    }
    
    if (formData.replyToEmail && !/\S+@\S+\.\S+/.test(formData.replyToEmail)) {
      errors.replyToEmail = 'Please enter a valid email address';
    }
    
    // Validate provider-specific settings
    if (formData.emailProvider === 'office365') {
      if (!formData.clientId) {
        errors.clientId = 'Client ID is required';
      }
      
      if (!formData.clientSecret || formData.clientSecret === '********') {
        errors.clientSecret = 'Client Secret is required';
      }
      
      if (!formData.tenantId) {
        errors.tenantId = 'Tenant ID is required';
      }
    } else if (formData.emailProvider === 'smtp') {
      if (!formData.smtpHost) {
        errors.smtpHost = 'SMTP host is required';
      }
      
      if (!formData.smtpPort) {
        errors.smtpPort = 'SMTP port is required';
      } else if (!/^\d+$/.test(formData.smtpPort)) {
        errors.smtpPort = 'SMTP port must be a number';
      }
      
      if (!formData.smtpUsername) {
        errors.smtpUsername = 'SMTP username is required';
      }
      
      if (!formData.smtpPassword || formData.smtpPassword === '********') {
        errors.smtpPassword = 'SMTP password is required';
      }
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    try {
      // Prepare config data based on provider
      const configData = {
        provider: formData.emailProvider,
        from_email: formData.fromEmail,
        from_name: formData.fromName,
        reply_to_email: formData.replyToEmail || null
      };
      
      // Add provider-specific settings
      if (formData.emailProvider === 'office365') {
        configData.office365 = {
          client_id: formData.clientId,
          tenant_id: formData.tenantId
        };
        
        // Only include client secret if it's changed
        if (formData.clientSecret !== '********') {
          configData.office365.client_secret = formData.clientSecret;
        }
      } else if (formData.emailProvider === 'smtp') {
        configData.smtp = {
          host: formData.smtpHost,
          port: parseInt(formData.smtpPort, 10),
          username: formData.smtpUsername,
          secure: formData.smtpSecure
        };
        
        // Only include password if it's changed
        if (formData.smtpPassword !== '********') {
          configData.smtp.password = formData.smtpPassword;
        }
      }
      
      // Update email configuration
      await emailConfigService.updateEmailConfig(configData);
      
      setSuccess('Email configuration updated successfully');
      setError(null);
      
      // Refresh the configuration
      fetchEmailConfig();
    } catch (err) {
      console.error('Error updating email configuration:', err);
      setError('Failed to update email configuration.');
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
  
  // Render Office 365 settings form
  const renderOffice365Settings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          label="Client ID&quot;
          name="clientId"
          value={formData.clientId}
          onChange={handleChange}
          error={!!formErrors.clientId}
          helperText={formErrors.clientId}
          disabled={loading}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          label="Client Secret&quot;
          name="clientSecret"
          type={showClientSecret ? 'text' : 'password'}
          value={formData.clientSecret}
          onChange={handleChange}
          error={!!formErrors.clientSecret}
          helperText={formErrors.clientSecret}
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end&quot;>
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={toggleClientSecretVisibility}
                  edge="end&quot;
                >
                  {showClientSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          required
          label="Tenant ID"
          name="tenantId&quot;
          value={formData.tenantId}
          onChange={handleChange}
          error={!!formErrors.tenantId}
          helperText={formErrors.tenantId}
          disabled={loading}
        />
      </Grid>
    </Grid>
  );
  
  // Render SMTP settings form
  const renderSmtpSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          required
          label="SMTP Host"
          name="smtpHost&quot;
          value={formData.smtpHost}
          onChange={handleChange}
          error={!!formErrors.smtpHost}
          helperText={formErrors.smtpHost}
          disabled={loading}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          required
          label="SMTP Port"
          name="smtpPort&quot;
          value={formData.smtpPort}
          onChange={handleChange}
          error={!!formErrors.smtpPort}
          helperText={formErrors.smtpPort}
          disabled={loading}
          type="number"
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          required
          label="SMTP Username&quot;
          name="smtpUsername"
          value={formData.smtpUsername}
          onChange={handleChange}
          error={!!formErrors.smtpUsername}
          helperText={formErrors.smtpUsername}
          disabled={loading}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          required
          label="SMTP Password&quot;
          name="smtpPassword"
          type={showSmtpPassword ? 'text' : 'password'}
          value={formData.smtpPassword}
          onChange={handleChange}
          error={!!formErrors.smtpPassword}
          helperText={formErrors.smtpPassword}
          disabled={loading}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end&quot;>
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={toggleSmtpPasswordVisibility}
                  edge="end&quot;
                >
                  {showSmtpPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
        />
      </Grid>
      
      <Grid item xs={12}>
        <FormControlLabel
          control={
            <Radio
              checked={formData.smtpSecure}
              onChange={(e) => setFormData(prev => ({ ...prev, smtpSecure: e.target.checked }))}
              name="smtpSecure"
              disabled={loading}
            />
          }
          label="Use secure connection (TLS/SSL)&quot;
        />
      </Grid>
    </Grid>
  );
  
  // Render general email settings
  const renderGeneralSettings = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          required
          label="From Email"
          name="fromEmail&quot;
          value={formData.fromEmail}
          onChange={handleChange}
          error={!!formErrors.fromEmail}
          helperText={formErrors.fromEmail}
          disabled={loading}
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          required
          label="From Name"
          name="fromName&quot;
          value={formData.fromName}
          onChange={handleChange}
          error={!!formErrors.fromName}
          helperText={formErrors.fromName}
          disabled={loading}
        />
      </Grid>
      
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Reply-To Email (Optional)"
          name="replyToEmail&quot;
          value={formData.replyToEmail}
          onChange={handleChange}
          error={!!formErrors.replyToEmail}
          helperText={formErrors.replyToEmail || "Leave blank to use From Email as Reply-To'}
          disabled={loading}
        />
      </Grid>
    </Grid>
  );
  
  return (
    <Box>
      <Typography variant="h5&quot; component="h1" gutterBottom>
        Email Configuration
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
      
      {/* Email configuration form */}
      <form onSubmit={handleSubmit}>
        {/* Provider selection */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend&quot;>Email Service</FormLabel>
            <RadioGroup
              name="emailProvider"
              value={formData.emailProvider}
              onChange={handleChange}
              row
            >
              <FormControlLabel
                value="office365&quot;
                control={<Radio />}
                label="Office 365"
                disabled={loading}
              />
              <FormControlLabel
                value="smtp&quot;
                control={<Radio />}
                label="SMTP"
                disabled={loading}
              />
            </RadioGroup>
          </FormControl>
        </Paper>
        
        {/* Provider-specific settings */}
        <Paper sx={{ mb: 3, borderRadius: 2 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary&quot;
            textColor="primary"
          >
            <Tab label="Provider Settings&quot; />
            <Tab label="General Settings" />
          </Tabs>
          
          <Divider />
          
          <Box sx={{ p: 3 }}>
            {/* Provider Settings Tab */}
            {tabValue === 0 && (
              <Box>
                <Typography variant="h6&quot; gutterBottom>
                  {formData.emailProvider === "office365' ? 'Office 365 Settings' : 'SMTP Settings'}
                </Typography>
                
                {formData.emailProvider === 'office365' ? renderOffice365Settings() : renderSmtpSettings()}
              </Box>
            )}
            
            {/* General Settings Tab */}
            {tabValue === 1 && (
              <Box>
                <Typography variant="h6&quot; gutterBottom>
                  Email Settings
                </Typography>
                
                {renderGeneralSettings()}
              </Box>
            )}
          </Box>
        </Paper>
        
        {/* Form actions */}
        <Box sx={{ display: "flex', justifyContent: 'flex-end', gap: 2 }}>
          <Button
            variant="outlined&quot;
            startIcon={<RefreshIcon />}
            onClick={fetchEmailConfig}
            disabled={loading}
          >
            Reset
          </Button>
          
          <Button
            variant="outlined"
            startIcon={<SendIcon />}
            onClick={handleOpenTestDialog}
            disabled={loading || configLoading}
          >
            Test Email
          </Button>
          
          <Button
            type="submit&quot;
            variant="contained"
            color="primary&quot;
            startIcon={<SaveIcon />}
            disabled={loading}
          >
            Save Configuration
          </Button>
        </Box>
      </form>
      
      {/* Loading indicator for form submission */}
      {loading && (
        <LinearProgress sx={{ mt: 3 }} />
      )}
      
      {/* Test Email Dialog */}
      <Dialog open={testDialogOpen} onClose={handleCloseTestDialog}>
        <DialogTitle>Send Test Email</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Send a test email to verify your email configuration. Enter the recipient email address below.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="testEmailRecipient&quot;
            label="Recipient Email"
            type="email&quot;
            fullWidth
            value={testEmailRecipient}
            onChange={handleTestEmailRecipientChange}
            error={!!formErrors.testEmailRecipient}
            helperText={formErrors.testEmailRecipient}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTestDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleSendTestEmail} 
            color="primary&quot;
            variant="contained"
            disabled={loading}
          >
            Send Test
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EmailConfiguration;