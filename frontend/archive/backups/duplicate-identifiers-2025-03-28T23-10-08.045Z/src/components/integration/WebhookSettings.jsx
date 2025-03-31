import React, { useState, useEffect } from 'react';
import { Box, Typography, FormControl, FormControlLabel, FormGroup, InputLabel, MenuItem, Switch, Divider, Chip, List, ListItem, ListItemText, ListItemSecondaryAction, CircularProgress, Grid } from '../../design-system';
import IconButton from '@mui/material/IconButton';;
import {
  SelectLegacy,
  ButtonLegacy as Button,
  CardLegacy as Paper,
  DialogLegacy as Dialog,
  AlertLegacy as Alert,
  InputFieldLegacy as TextField,
  SnackbarLegacy as Snackbar,
  DialogTitleLegacy as DialogTitle,
  DialogContentLegacy as DialogContent,
  DialogActionsLegacy as DialogActions,
  DialogContentTextLegacy as DialogContentText,
} from '../../design-system/legacy';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  PlayArrow as TestIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
} from '@mui/icons-material';

import { integrationService } from '@services/integrationService';
// Removed duplicate import
// Webhook event types grouped by category
const EVENT_TYPES = {
  Integration: [
    { value: 'integration.created', label: 'Integration Created' },
    { value: 'integration.updated', label: 'Integration Updated' },
    { value: 'integration.deleted', label: 'Integration Deleted' },
    { value: 'integration.run.started', label: 'Integration Run Started' },
    { value: 'integration.run.completed', label: 'Integration Run Completed' },
    { value: 'integration.run.failed', label: 'Integration Run Failed' },
    { value: 'integration.health.changed', label: 'Integration Health Changed' },
  ],
  Application: [
    { value: 'application.created', label: 'Application Created' },
    { value: 'application.updated', label: 'Application Updated' },
    { value: 'application.deleted', label: 'Application Deleted' },
  ],
  Dataset: [
    { value: 'dataset.created', label: 'Dataset Created' },
    { value: 'dataset.updated', label: 'Dataset Updated' },
    { value: 'dataset.deleted', label: 'Dataset Deleted' },
  ],
  User: [
    { value: 'user.created', label: 'User Created' },
    { value: 'user.updated', label: 'User Updated' },
  ],
  Tenant: [
    { value: 'tenant.created', label: 'Tenant Created' },
    { value: 'tenant.updated', label: 'Tenant Updated' },
  ],
};

// Authentication types
const AUTH_TYPES = [
  { value: 'none', label: 'None' },
  { value: 'basic', label: 'Basic Authentication' },
  { value: 'bearer', label: 'Bearer Token' },
  { value: 'custom', label: 'Custom' },
];

/**
 * WebhookSettings component allows users to configure webhooks for integration events
 */
const WebhookSettings = ({ integrationId }) => {
  // Added display name
  WebhookSettings.displayName = 'WebhookSettings';

  // Added display name
  WebhookSettings.displayName = 'WebhookSettings';

  // Added display name
  WebhookSettings.displayName = 'WebhookSettings';


  // State
  const [webhooks, setWebhooks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [isLogViewOpen, setIsLogViewOpen] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState(null);
  const [testingWebhook, setTestingWebhook] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [webhookLogs, setWebhookLogs] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    description: '',
    auth_type: 'none',
    auth_credentials: null,
    headers: {},
    events: [],
    is_secure: true,
    timeout_seconds: 5,
    retry_count: 3,
    retry_interval_seconds: 60,
  });

  // Load webhooks when component mounts
  useEffect(() => {
    fetchWebhooks();
  }, [integrationId]);

  // Fetch webhooks
  const fetchWebhooks = async () => {
    if (!integrationId) return;

    setLoading(true);
    try {
      // This would be the real API call in a production app
      // const response = await integrationService.getWebhooks(integrationId);
      // setWebhooks(response.data);

      // Mock data for development
      setWebhooks([
        {
          id: 1,
          name: 'Status Change Notification',
          url: 'https://example.com/webhooks/integration-status',
          description: 'Notifies when integration status changes',
          auth_type: 'bearer',
          auth_credentials: { token: 'xxx-redacted-xxx' },
          headers: { 'Content-Type': 'application/json', 'X-Custom-Header': 'value' },
          events: [
            'integration.run.completed',
            'integration.run.failed',
            'integration.health.changed',
          ],
          status: 'active',
          is_secure: true,
          timeout_seconds: 5,
          retry_count: 3,
          retry_interval_seconds: 60,
          last_triggered_at: '2025-03-20T14:30:45Z',
        },
      ]);
    } catch (err) {
      console.error('Error fetching webhooks:', err);
      setError('Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = e => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Handle events selection
  const handleEventChange = event => {
    const value = event.target.value;
    setFormData(prev => ({
      ...prev,
      events: value,
    }));
  };

  // Handle auth type change
  const handleAuthTypeChange = e => {
    const authType = e.target.value;
    let credentials = null;

    if (authType === 'basic') {
      credentials = { username: '', password: '' };
    } else if (authType === 'bearer') {
      credentials = { token: '' };
    } else if (authType === 'custom') {
      credentials = { scheme: '', token: '' };
    }

    setFormData(prev => ({
      ...prev,
      auth_type: authType,
      auth_credentials: credentials,
    }));
  };

  // Handle auth credentials change
  const handleCredentialsChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      auth_credentials: {
        ...prev.auth_credentials,
        [name]: value,
      },
    }));
  };

  // Add or update header
  const addHeader = () => {
  // Added display name
  addHeader.displayName = 'addHeader';

  // Added display name
  addHeader.displayName = 'addHeader';

  // Added display name
  addHeader.displayName = 'addHeader';


    const headerName = document.getElementById('header-name').value;
    const headerValue = document.getElementById('header-value').value;

    if (!headerName || !headerValue) return;

    setFormData(prev => ({
      ...prev,
      headers: {
        ...prev.headers,
        [headerName]: headerValue,
      },
    }));

    // Clear input fields
    document.getElementById('header-name').value = '';
    document.getElementById('header-value').value = '';
  };

  // Remove header
  const removeHeader = headerName => {
    const newHeaders = { ...formData.headers };
    delete newHeaders[headerName];

    setFormData(prev => ({
      ...prev,
      headers: newHeaders,
    }));
  };

  // Open webhook form
  const openForm = (webhook = null) => {
  // Added display name
  openForm.displayName = 'openForm';

  // Added display name
  openForm.displayName = 'openForm';

  // Added display name
  openForm.displayName = 'openForm';


    if (webhook) {
      setFormData({ ...webhook });
      setSelectedWebhook(webhook);
    } else {
      setFormData({
        name: '',
        url: '',
        description: '',
        auth_type: 'none',
        auth_credentials: null,
        headers: {},
        events: [],
        is_secure: true,
        timeout_seconds: 5,
        retry_count: 3,
        retry_interval_seconds: 60,
      });
      setSelectedWebhook(null);
    }
    setIsFormOpen(true);
  };

  // Close webhook form
  const closeForm = () => {
  // Added display name
  closeForm.displayName = 'closeForm';

  // Added display name
  closeForm.displayName = 'closeForm';

  // Added display name
  closeForm.displayName = 'closeForm';


    setIsFormOpen(false);
    setSelectedWebhook(null);
  };

  // Submit webhook form
  const handleSubmit = async e => {
    e.preventDefault();

    try {
      let result;
      if (selectedWebhook) {
        // This would be the real API call in a production app
        // result = await integrationService.updateWebhook(selectedWebhook.id, formData);

        // Mock update for development
        const updatedWebhooks = webhooks.map(webhook =>
          webhook.id === selectedWebhook.id ? { ...formData, id: webhook.id } : webhook
        );
        setWebhooks(updatedWebhooks);
        setSuccess('Webhook updated successfully');
      } else {
        // This would be the real API call in a production app
        // result = await integrationService.createWebhook({ ...formData, integration_id: integrationId });

        // Mock create for development
        const newWebhook = {
          ...formData,
          id: Date.now(), // Mock ID
          status: 'active',
          last_triggered_at: null,
        };
        setWebhooks([...webhooks, newWebhook]);
        setSuccess('Webhook created successfully');
      }

      closeForm();
    } catch (err) {
      console.error('Error saving webhook:', err);
      setError('Failed to save webhook');
    }
  };

  // Delete webhook
  const handleDelete = async webhookId => {
    if (!window.confirm('Are you sure you want to delete this webhook?')) return;

    try {
      // This would be the real API call in a production app
      // await integrationService.deleteWebhook(webhookId);

      // Mock delete for development
      const filteredWebhooks = webhooks.filter(webhook => webhook.id !== webhookId);
      setWebhooks(filteredWebhooks);
      setSuccess('Webhook deleted successfully');
    } catch (err) {
      console.error('Error deleting webhook:', err);
      setError('Failed to delete webhook');
    }
  };

  // Test webhook
  const openTestDialog = webhook => {
    setSelectedWebhook(webhook);
    setIsTestDialogOpen(true);
    setTestResult(null);
  };

  // Run webhook test
  const runWebhookTest = async () => {
    setTestingWebhook(true);
    try {
      // This would be the real API call in a production app
      // const result = await integrationService.testWebhook(selectedWebhook.id);

      // Mock result for development
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API delay
      const mockResult = {
        success: Math.random() > 0.3, // Simulate success/failure
        status_code: 200,
        response_body: '{"status":"ok","message":"Webhook received"}',
        error_message: null,
        request_duration_ms: Math.floor(Math.random() * 500) + 100,
      };

      // Sometimes simulate an error
      if (!mockResult.success) {
        mockResult.status_code = null;
        mockResult.response_body = null;
        mockResult.error_message = 'Connection timeout after 5000ms';
      }

      setTestResult(mockResult);
    } catch (err) {
      console.error('Error testing webhook:', err);
      setTestResult({
        success: false,
        status_code: null,
        response_body: null,
        error_message: 'Failed to test webhook: ' + err.message,
        request_duration_ms: 0,
      });
    } finally {
      setTestingWebhook(false);
    }
  };

  // View webhook logs
  const viewWebhookLogs = async webhook => {
    setSelectedWebhook(webhook);
    setIsLogViewOpen(true);

    try {
      // This would be the real API call in a production app
      // const logs = await integrationService.getWebhookLogs(webhook.id);

      // Mock logs for development
      const mockLogs = [
        {
          id: 1,
          webhook_id: webhook.id,
          event_type: 'integration.run.completed',
          payload: { integration_id: integrationId, status: 'success', records_processed: 250 },
          response_status_code: 200,
          response_body: '{"status":"ok"}',
          is_success: true,
          error_message: null,
          attempt_count: 1,
          created_at: '2025-03-22T09:15:30Z',
          completed_at: '2025-03-22T09:15:31Z',
        },
        {
          id: 2,
          webhook_id: webhook.id,
          event_type: 'integration.health.changed',
          payload: { integration_id: integrationId, old_health: 'healthy', new_health: 'warning' },
          response_status_code: null,
          response_body: null,
          is_success: false,
          error_message: 'Connection timeout after 5 seconds',
          attempt_count: 3,
          created_at: '2025-03-21T14:22:10Z',
          completed_at: '2025-03-21T14:22:40Z',
        },
      ];

      setWebhookLogs(mockLogs);
    } catch (err) {
      console.error('Error fetching webhook logs:', err);
      setError('Failed to load webhook logs');
      setWebhookLogs([]);
    }
  };

  // Render auth credentials inputs based on auth type
  const renderAuthInputs = () => {
  // Added display name
  renderAuthInputs.displayName = 'renderAuthInputs';

  // Added display name
  renderAuthInputs.displayName = 'renderAuthInputs';

  // Added display name
  renderAuthInputs.displayName = 'renderAuthInputs';


    const { auth_type, auth_credentials } = formData;

    if (auth_type === 'none') return null;

    if (auth_type === 'basic') {
      return (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Username"
            name="username"
            margin="normal"
            value={auth_credentials?.username || ''}
            onChange={handleCredentialsChange}
          />
          <TextField
            fullWidth
            type="password"
            label="Password"
            name="password"
            margin="normal"
            value={auth_credentials?.password || ''}
            onChange={handleCredentialsChange}
          />
        </Box>
      );
    }

    if (auth_type === 'bearer') {
      return (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Token"
            name="token"
            margin="normal"
            value={auth_credentials?.token || ''}
            onChange={handleCredentialsChange}
          />
        </Box>
      );
    }

    if (auth_type === 'custom') {
      return (
        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Scheme"
            name="scheme"
            margin="normal"
            placeholder="e.g. ApiKey"
            value={auth_credentials?.scheme || ''}
            onChange={handleCredentialsChange}
          />
          <TextField
            fullWidth
            label="Token"
            name="token"
            margin="normal"
            value={auth_credentials?.token || ''}
            onChange={handleCredentialsChange}
          />
        </Box>
      );
    }
  };

  // Format date
  const formatDate = dateString => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Paper elevation={2} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h2">
            Webhook Notifications
          </Typography>
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => openForm()}
          >
            Add Webhook
          </Button>
        </Box>

        <Typography variant="body1" paragraph>
          Webhooks allow you to receive real-time notifications when events occur in your
          integration. They can be used to trigger actions in other systems or to keep your
          applications in sync.
        </Typography>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress />
          </Box>
        ) : webhooks.length === 0 ? (
          <Box sx={{ textAlign: 'center', p: 3, bgcolor: 'background.default', borderRadius: 1 }}>
            <Typography variant="body1" color="textSecondary">
              No webhooks configured. Add your first webhook to start receiving notifications.
            </Typography>
          </Box>
        ) : (
          <List>
            {webhooks.map(webhook => (
              <Paper key={webhook.id} elevation={1} sx={{ mb: 2, overflow: 'hidden' }}>
                <ListItem
                  secondaryAction={
                    <Box>
                      <IconButton
                        edge="end"
                        aria-label="test"
                        onClick={() => openTestDialog(webhook)}
                        title="Test Webhook"
                      >
                        <TestIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="edit"
                        onClick={() => openForm(webhook)}
                        title="Edit Webhook"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        edge="end"
                        aria-label="delete"
                        onClick={() => handleDelete(webhook.id)}
                        title="Delete Webhook"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6" component="span">
                          {webhook.name}
                        </Typography>
                        <Chip
                          size="small"
                          label={webhook.status}
                          color={webhook.status === 'active' ? 'success' : 'error'}
                          sx={{ ml: 2 }}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography variant="body2" component="span" display="block">
                          {webhook.url}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" display="block">
                          {webhook.description}
                        </Typography>
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="caption" component="span" display="block">
                            Events: {webhook.events.length}
                          </Typography>
                          <Typography variant="caption" component="span" display="block">
                            Last triggered: {formatDate(webhook.last_triggered_at)}
                          </Typography>
                        </Box>
                        <Box sx={{ mt: 1 }}>
                          {webhook.events.map(event => (
                            <Chip
                              key={event}
                              label={event.split('.').join(' ')}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                        <Box sx={{ mt: 1 }}>
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => viewWebhookLogs(webhook)}
                          >
                            View Logs
                          </Button>
                        </Box>
                      </>
                    }
                  />
                </ListItem>
              </Paper>
            ))}
          </List>
        )}
      </Paper>

      {/* Webhook Form Dialog */}
      <Dialog open={isFormOpen} onClose={closeForm} fullWidth maxWidth="md">
        <form onSubmit={handleSubmit}>
          <Box sx={{ p: 3, pb: 0 }}>
            <Typography variant="h6">{selectedWebhook ? 'Edit Webhook' : 'Add Webhook'}</Typography>
          </Box>
          <Box sx={{ p: 3, pt: 2 }}>
            <TextField
              autoFocus
              margin="normal"
              name="name"
              label="Webhook Name"
              type="text"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
            <TextField
              margin="normal"
              name="url"
              label="Webhook URL"
              type="url"
              fullWidth
              variant="outlined"
              value={formData.url}
              onChange={handleInputChange}
              required
              helperText={
                formData.is_secure
                  ? 'Only HTTPS URLs are allowed'
                  : 'Insecure HTTP URLs are allowed but not recommended'
              }
            />
            <TextField
              margin="normal"
              name="description"
              label="Description"
              type="text"
              fullWidth
              variant="outlined"
              multiline
              rows={2}
              value={formData.description || ''}
              onChange={handleInputChange}
            />

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              Events
            </Typography>
            <FormControl fullWidth>
              <InputLabel id="events-label">Events to Subscribe</InputLabel>
              <SelectLegacy
                labelId="events-label"
                id="events"
                multiple
                name="events"
                value={formData.events}
                onChange={handleEventChange}
                label="Events to Subscribe"
                renderValue={selected => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map(value => (
                      <Chip key={value} label={value.replace(/\./g, ' ')} />
                    ))}
                  </Box>
                )}
                options={Object.values(EVENT_TYPES).flat()}
              />
            </FormControl>

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              Authentication
            </Typography>
            <FormControl fullWidth margin="normal">
              <InputLabel id="auth-type-label">Authentication Type</InputLabel>
              <SelectLegacy
                labelId="auth-type-label"
                name="auth_type"
                value={formData.auth_type}
                onChange={handleAuthTypeChange}
                options={AUTH_TYPES}
                label="Authentication Type"
              />
            </FormControl>

            {renderAuthInputs()}

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              Headers
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={5}>
                <TextField
                  id="header-name"
                  label="Header Name"
                  fullWidth
                  placeholder="e.g. Content-Type"
                />
              </Grid>
              <Grid item xs={5}>
                <TextField
                  id="header-value"
                  label="Header Value"
                  fullWidth
                  placeholder="e.g. application/json"
                />
              </Grid>
              <Grid item xs={2}>
                <Button variant="outlined" onClick={addHeader} fullWidth sx={{ mt: 1 }}>
                  Add
                </Button>
              </Grid>
            </Grid>

            {Object.keys(formData.headers).length > 0 && (
              <Box sx={{ mt: 2, border: '1px solid #ddd', borderRadius: 1, p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Custom Headers
                </Typography>
                <List dense>
                  {Object.entries(formData.headers).map(([name, value]) => (
                    <ListItem key={name}>
                      <ListItemText primary={name} secondary={value} />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => removeHeader(name)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>
              Advanced Configuration
            </Typography>
            <FormGroup>
              <FormControlLabel
                control={
                  <Switch
                    checked={formData.is_secure}
                    onChange={handleInputChange}
                    name="is_secure"
                  />
                }
                label="Require HTTPS"
              />
            </FormGroup>

            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={4}>
                <TextField
                  name="timeout_seconds"
                  label="Timeout (seconds)"
                  type="number"
                  fullWidth
                  inputProps={{ min: 1, max: 30 }}
                  value={formData.timeout_seconds}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name="retry_count"
                  label="Max Retries"
                  type="number"
                  fullWidth
                  inputProps={{ min: 0, max: 10 }}
                  value={formData.retry_count}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  name="retry_interval_seconds"
                  label="Retry Interval (seconds)"
                  type="number"
                  fullWidth
                  inputProps={{ min: 5, max: 3600 }}
                  value={formData.retry_interval_seconds}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 3, pt: 0 }}>
            <Button onClick={closeForm} color="secondary" startIcon={<CancelIcon />}>
              Cancel
            </Button>
            <Button type="submit" color="primary" startIcon={<SaveIcon />}>
              {selectedWebhook ? 'Update' : 'Create'}
            </Button>
          </Box>
        </form>
      </Dialog>

      {/* Test Webhook Dialog */}
      <Dialog
        open={isTestDialogOpen}
        onClose={() => setIsTestDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <Box sx={{ p: 3, pb: 0 }}>
          <Typography variant="h6">Test Webhook</Typography>
        </Box>
        <Box sx={{ p: 3, pt: 2 }}>
          {selectedWebhook && (
            <>
              <Typography variant="subtitle1" gutterBottom>
                {selectedWebhook.name}
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                {selectedWebhook.url}
              </Typography>

              {testingWebhook ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : testResult ? (
                <Box sx={{ mt: 2, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    {testResult.success ? (
                      <CheckIcon color="success" sx={{ mr: 1 }} />
                    ) : (
                      <ErrorIcon color="error" sx={{ mr: 1 }} />
                    )}
                    <Typography variant="h6">
                      {testResult.success ? 'Success' : 'Failed'}
                    </Typography>
                  </Box>

                  {testResult.success ? (
                    <>
                      <Typography variant="body2" gutterBottom>
                        Status Code: {testResult.status_code}
                      </Typography>
                      <Typography variant="body2" gutterBottom>
                        Duration: {testResult.request_duration_ms}ms
                      </Typography>
                      {testResult.response_body && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="subtitle2" gutterBottom>
                            Response:
                          </Typography>
                          <Paper variant="outlined" sx={{ p: 1, bgcolor: '#f5f5f5' }}>
                            <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                              {testResult.response_body}
                            </pre>
                          </Paper>
                        </Box>
                      )}
                    </>
                  ) : (
                    <Typography variant="body2" color="error" paragraph>
                      {testResult.error_message}
                    </Typography>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="textSecondary">
                  This will send a test payload to your webhook URL. The test will use the first
                  event type that your webhook is subscribed to.
                </Typography>
              )}
            </>
          )}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 3, pt: 0 }}>
          {!testingWebhook && (
            <>
              <Button onClick={() => setIsTestDialogOpen(false)} color="secondary">
                Close
              </Button>
              {!testResult && (
                <Button onClick={runWebhookTest} color="primary" variant="contained">
                  Send Test
                </Button>
              )}
              {testResult && (
                <Button onClick={() => setTestResult(null)} color="primary">
                  Test Again
                </Button>
              )}
            </>
          )}
        </Box>
      </Dialog>

      {/* Webhook Logs Dialog */}
      <Dialog open={isLogViewOpen} onClose={() => setIsLogViewOpen(false)} fullWidth maxWidth="md">
        <Box sx={{ p: 3, pb: 0 }}>
          <Typography variant="h6">Webhook Logs - {selectedWebhook?.name}</Typography>
        </Box>
        <Box sx={{ p: 3, pt: 2 }}>
          {webhookLogs.length === 0 ? (
            <Box sx={{ textAlign: 'center', p: 3 }}>
              <Typography variant="body1" color="textSecondary">
                No logs found for this webhook.
              </Typography>
            </Box>
          ) : (
            <List>
              {webhookLogs.map(log => (
                <Paper key={log.id} elevation={1} sx={{ mb: 2, p: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="subtitle1">
                      {log.event_type.replace(/\./g, ' ')}
                    </Typography>
                    <Box>
                      {log.is_success ? (
                        <Chip size="small" label="Success" color="success" icon={<CheckIcon />} />
                      ) : (
                        <Chip size="small" label="Failed" color="error" icon={<ErrorIcon />} />
                      )}
                    </Box>
                  </Box>

                  <Typography variant="caption" display="block" gutterBottom>
                    Created: {formatDate(log.created_at)} •
                    {log.attempt_count > 1 ? ` ${log.attempt_count} attempts • ` : ' '}
                    {log.is_success ? `Status: ${log.response_status_code}` : 'Failed'}
                  </Typography>

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="subtitle2" gutterBottom>
                    Payload:
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 1, bgcolor: '#f5f5f5', mb: 2 }}>
                    <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>
                      {JSON.stringify(log.payload, null, 2)}
                    </pre>
                  </Paper>

                  {log.is_success && log.response_body ? (
                    <>
                      <Typography variant="subtitle2" gutterBottom>
                        Response:
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 1, bgcolor: '#f5f5f5' }}>
                        <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{log.response_body}</pre>
                      </Paper>
                    </>
                  ) : log.error_message ? (
                    <>
                      <Typography variant="subtitle2" color="error" gutterBottom>
                        Error:
                      </Typography>
                      <Paper variant="outlined" sx={{ p: 1, bgcolor: '#fff8f8' }}>
                        <Typography color="error" variant="body2">
                          {log.error_message}
                        </Typography>
                      </Paper>
                    </>
                  ) : null}
                </Paper>
              ))}
            </List>
          )}
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 3, pt: 0 }}>
          <Button onClick={() => setIsLogViewOpen(false)} color="primary">
            Close
          </Button>
        </Box>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={!!error || !!success}
        autoHideDuration={6000}
        onClose={() => {
          setError(null);
          setSuccess(null);
        }}
      >
        <Alert
          onClose={() => {
            setError(null);
            setSuccess(null);
          }}
          severity={error ? 'error' : 'success'}
          sx={{ width: '100%' }}
        >
          {error || success}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default WebhookSettings;
