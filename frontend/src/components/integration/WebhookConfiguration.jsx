/**
 * Webhook Configuration Component
 *
 * A comprehensive component for configuring webhook endpoints with security
 * options, payload validation, and testing capabilities.
 *
 * @component
 */

import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Button, Card, CardContent, Collapse, Divider, Grid, IconButton, InputAdornment, ListItemIcon, ListItemText, Menu, MenuItem, Paper, Tab, Tabs, TextField, Typography, Alert, AlertTitle, FormControl, FormControlLabel, Radio, RadioGroup, Select, InputLabel, FormHelperText, Switch, Tooltip, CircularProgress, Chip, List, ListItem, Drawer, Slider } from '@mui/material';
import { Add as AddIcon, Check as CheckIcon, Close as CloseIcon, Delete as DeleteIcon, Edit as EditIcon, Refresh as RefreshIcon, Code as CodeIcon, Security as SecurityIcon, Settings as SettingsIcon, PlayArrow as PlayIcon, ReceiptLong as WebhookIcon, ContentCopy as CopyIcon, Visibility as VisibilityIcon, VisibilityOff as VisibilityOffIcon, HelpOutline as HelpIcon, Warning as WarningIcon, KeyboardArrowDown as KeyboardArrowDownIcon, KeyboardArrowUp as KeyboardArrowUpIcon, Save as SaveIcon, History as HistoryIcon, Send as SendIcon, Autorenew as AutorenewIcon, CloudDownload as CloudDownloadIcon, Timeline as TimelineIcon, Speed as SpeedIcon, BookmarkAdd as SaveTemplateIcon } from '@mui/icons-material';

/**
 * Webhook Configuration Component
 * 
 * @param {Object} props - Component props
 * @returns {JSX.Element} The Webhook Configuration component
 */
import { withErrorBoundary } from "@/error-handling/withErrorBoundary";
import { ENV } from "@/utils/environmentConfig";
const WebhookConfiguration = ({
  value = {},
  onChange = () => {},
  onTest = () => {},
  disabled = false
}) => {
  // Configuration state
  const [config, setConfig] = useState({
    name: '',
    description: '',
    endpointId: '',
    // Auto-generated or custom
    security: {
      type: 'none',
      token: {
        value: '',
        headerName: 'X-Webhook-Token'
      },
      hmac: {
        secret: '',
        algorithm: 'sha256',
        headerName: 'X-Webhook-Signature'
      },
      basicAuth: {
        username: '',
        password: ''
      }
    },
    validation: {
      enabled: false,
      schema: '',
      requiredFields: [],
      strictMode: false,
      failOnError: true,
      responseCode: 422,
      errorFormat: 'json'
    },
    rateLimit: {
      enabled: false,
      maxRequests: 100,
      timeWindow: 60 // seconds
    },
    preprocessors: [],
    // Array of functions to run before processing the webhook
    ...value
  });

  // UI State
  const [activeTab, setActiveTab] = useState(0);
  const [testResults, setTestResults] = useState(null);
  const [testingInProgress, setTestingInProgress] = useState(false);
  const [error, setError] = useState(null);
  const [showSecrets, setShowSecrets] = useState({});
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [rawJson, setRawJson] = useState('');
  const [jsonError, setJsonError] = useState(null);
  const [requiredFieldToAdd, setRequiredFieldToAdd] = useState('');

  // Test request state
  const [testRequestDrawerOpen, setTestRequestDrawerOpen] = useState(false);
  const [testRequest, setTestRequest] = useState({
    payload: JSON.stringify({
      test: 'data'
    }, null, 2),
    headers: [{
      key: 'Content-Type',
      value: 'application/json'
    }]
  });

  // Webhook simulator state
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [simulatedPayload, setSimulatedPayload] = useState(null);
  const [simulationOptions, setSimulationOptions] = useState({
    eventType: 'order.created',
    randomizeData: true,
    delayMs: 0,
    simulateError: false,
    errorRate: 0
  });

  // Webhook request history for testing
  const [requestHistory, setRequestHistory] = useState([]);
  const [historyMenuAnchor, setHistoryMenuAnchor] = useState(null);

  // Template management for test requests
  const [templates, setTemplates] = useState([{
    id: 'default',
    name: 'Default Request',
    payload: JSON.stringify({
      test: 'data'
    }, null, 2),
    headers: [{
      key: 'Content-Type',
      value: 'application/json'
    }]
  }, {
    id: 'order-created',
    name: 'Order Created Event',
    payload: JSON.stringify({
      event: 'order.created',
      data: {
        id: '1234567890',
        customer_id: 'cust_9876543',
        amount: 99.99,
        currency: 'USD',
        items: [{
          product_id: 'prod_123',
          quantity: 1,
          price: 79.99
        }, {
          product_id: 'prod_456',
          quantity: 2,
          price: 9.99
        }],
        created_at: new Date().toISOString()
      }
    }, null, 2),
    headers: [{
      key: 'Content-Type',
      value: 'application/json'
    }, {
      key: 'X-Event-Type',
      value: 'order.created'
    }]
  }, {
    id: 'user-registered',
    name: 'User Registered Event',
    payload: JSON.stringify({
      event: 'user.registered',
      data: {
        id: 'user_12345',
        email: 'user@example.com',
        name: 'John Doe',
        created_at: new Date().toISOString()
      }
    }, null, 2),
    headers: [{
      key: 'Content-Type',
      value: 'application/json'
    }, {
      key: 'X-Event-Type',
      value: 'user.registered'
    }]
  }]);
  const [templatesMenuAnchor, setTemplatesMenuAnchor] = useState(null);
  const [testResultsTabIndex, setTestResultsTabIndex] = useState(0);

  // Initialize raw JSON when config changes
  useEffect(() => {
    try {
      setRawJson(JSON.stringify(config, null, 2));
    } catch (e) {
      console.error('Error stringifying config:', e);
    }
  }, [config]);

  // Update parent component with config changes
  useEffect(() => {
    onChange(config);
  }, [config, onChange]);

  // Generate a random endpoint ID if one isn't set
  useEffect(() => {
    if (!config.endpointId) {
      const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      setConfig(prev => ({
        ...prev,
        endpointId: randomId
      }));
    }
  }, [config.endpointId]);

  /**
   * Handle change in basic configuration fields
   * 
   * @param {string} field - Field name
   * @param {any} value - New value
   */
  const handleChange = useCallback((field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  /**
   * Handle change in security settings
   * 
   * @param {string} securityType - Security type
   * @param {string} field - Field name
   * @param {any} value - New value
   */
  const handleSecurityChange = useCallback((securityType, field, value) => {
    setConfig(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [securityType]: {
          ...prev.security[securityType],
          [field]: value
        }
      }
    }));
  }, []);

  /**
   * Handle change in validation settings
   * 
   * @param {string} field - Field name
   * @param {any} value - New value
   */
  const handleValidationChange = useCallback((field, value) => {
    setConfig(prev => ({
      ...prev,
      validation: {
        ...prev.validation,
        [field]: value
      }
    }));
  }, []);

  /**
   * Handle change in rate limit settings
   * 
   * @param {string} field - Field name
   * @param {any} value - New value
   */
  const handleRateLimitChange = useCallback((field, value) => {
    setConfig(prev => ({
      ...prev,
      rateLimit: {
        ...prev.rateLimit,
        [field]: value
      }
    }));
  }, []);

  /**
   * Handle adding a required field
   */
  const handleAddRequiredField = useCallback(() => {
    if (!requiredFieldToAdd.trim()) {
      setError('Field name cannot be empty');
      return;
    }
    setConfig(prev => ({
      ...prev,
      validation: {
        ...prev.validation,
        requiredFields: [...prev.validation.requiredFields, requiredFieldToAdd.trim()]
      }
    }));
    setRequiredFieldToAdd('');
    setError(null);
  }, [requiredFieldToAdd]);

  /**
   * Handle removing a required field
   * 
   * @param {number} index - Index of the field to remove
   */
  const handleRemoveRequiredField = useCallback(index => {
    setConfig(prev => ({
      ...prev,
      validation: {
        ...prev.validation,
        requiredFields: prev.validation.requiredFields.filter((_, i) => i !== index)
      }
    }));
  }, []);

  /**
   * Toggle showing secret values
   * 
   * @param {string} field - Field name
   */
  const toggleSecretVisibility = useCallback(field => {
    setShowSecrets(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  }, []);

  /**
   * Handle security type change
   * 
   * @param {Event} event - Change event
   */
  const handleSecurityTypeChange = useCallback(event => {
    const newSecurityType = event.target.value;
    setConfig(prev => ({
      ...prev,
      security: {
        ...prev.security,
        type: newSecurityType
      }
    }));
  }, []);

  /**
   * Handle JSON editor change
   * 
   * @param {Event} event - Change event
   */
  const handleJsonChange = useCallback(event => {
    const newJson = event.target.value;
    setRawJson(newJson);
    setJsonError(null);
    try {
      JSON.parse(newJson);
    } catch (e) {
      setJsonError(e.message);
    }
  }, []);

  /**
   * Apply changes from JSON editor
   */
  const applyJsonChanges = useCallback(() => {
    try {
      const newConfig = JSON.parse(rawJson);
      setConfig(newConfig);
      setJsonError(null);
      setShowJsonEditor(false);
    } catch (e) {
      setJsonError(e.message);
    }
  }, [rawJson]);

  /**
   * Generate a new endpoint ID
   */
  const regenerateEndpointId = useCallback(() => {
    const randomId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    setConfig(prev => ({
      ...prev,
      endpointId: randomId
    }));
  }, []);

  /**
   * Generate webhook URL from endpoint ID
   * 
   * @returns {string} The full webhook URL
   */
  const getWebhookUrl = useCallback(() => {
    // In production this would use environment variables or a configuration system
    const baseUrl = 'https://api.example.com/webhooks';

    // Check if we have an environment-specific path, such as dev, staging, etc.
    const envSuffix = ENV.NODE_ENV === 'production' ? '' : `-${ENV.NODE_ENV || 'dev'}`;

    // Create a deterministic but unique URL based on configuration properties
    // This ensures consistency across sessions while allowing for unique endpoints
    const customPath = config.name ? `/${encodeURIComponent(config.name.toLowerCase().replace(/[^a-z0-9]/g, '-'))}` : '';
    return `${baseUrl}${customPath}${envSuffix}/${config.endpointId}`;
  }, [config.name, config.endpointId]);

  /**
   * Copy webhook URL to clipboard
   */
  const copyWebhookUrl = useCallback(() => {
    const url = getWebhookUrl();
    navigator.clipboard.writeText(url);
  }, [getWebhookUrl]);

  /**
   * Handle test request payload change
   * 
   * @param {Event} event - Change event
   */
  const handleTestPayloadChange = useCallback(event => {
    const newPayload = event.target.value;
    setTestRequest(prev => ({
      ...prev,
      payload: newPayload
    }));
  }, []);

  /**
   * Add a header to the test request
   * 
   * @param {Object} header - Header object with key and value
   */
  const handleAddTestHeader = useCallback((header = {
    key: '',
    value: ''
  }) => {
    setTestRequest(prev => ({
      ...prev,
      headers: [...prev.headers, header]
    }));
  }, []);

  /**
   * Update a test request header
   * 
   * @param {number} index - Index of the header to update
   * @param {string} field - Field to update (key or value)
   * @param {string} value - New value
   */
  const handleUpdateTestHeader = useCallback((index, field, value) => {
    setTestRequest(prev => ({
      ...prev,
      headers: prev.headers.map((header, i) => i === index ? {
        ...header,
        [field]: value
      } : header)
    }));
  }, []);

  /**
   * Remove a header from the test request
   * 
   * @param {number} index - Index of the header to remove
   */
  const handleRemoveTestHeader = useCallback(index => {
    setTestRequest(prev => ({
      ...prev,
      headers: prev.headers.filter((_, i) => i !== index)
    }));
  }, []);

  /**
   * Send a test webhook request
   */
  const sendTestRequest = useCallback(async () => {
    setTestingInProgress(true);
    setTestResults(null);
    setError(null);
    try {
      // Validate the payload is proper JSON
      let parsedPayload;
      try {
        parsedPayload = JSON.parse(testRequest.payload);
      } catch (e) {
        throw new Error('Invalid JSON payload: ' + e.message);
      }

      // In a real implementation, this would send a request to your test endpoint
      console.log('Sending test webhook request:', {
        url: getWebhookUrl(),
        headers: testRequest.headers,
        payload: parsedPayload
      });

      // Simulating API call with a timeout
      await new Promise(resolve => setTimeout(resolve, 1200));

      // Create timeline information
      const timeline = [{
        stage: 'received',
        timestamp: new Date().toISOString(),
        durationMs: 0,
        // Initial event
        details: 'Request received by webhook endpoint'
      }, {
        stage: 'authentication',
        timestamp: new Date(Date.now() + 50).toISOString(),
        durationMs: 50,
        details: config.security.type !== 'none' ? `Authentication using ${config.security.type}` : 'No authentication configured'
      }, {
        stage: 'validation',
        timestamp: new Date(Date.now() + 150).toISOString(),
        durationMs: 100,
        details: config.validation.enabled ? 'Validating payload against JSON schema' : 'Validation not enabled'
      }];

      // Add processing stages
      timeline.push({
        stage: 'processing',
        timestamp: new Date(Date.now() + 250).toISOString(),
        durationMs: 100,
        details: 'Processing webhook payload'
      });

      // Add rate limiting if enabled
      if (config.rateLimit.enabled) {
        timeline.push({
          stage: 'rateLimit',
          timestamp: new Date(Date.now() + 270).toISOString(),
          durationMs: 20,
          details: `Rate limit check (${config.rateLimit.maxRequests}/${config.rateLimit.timeWindow}s)`
        });
      }

      // Add completion stage
      const processingTime = Math.floor(Math.random() * 300) + 200; // Simulate 200-500ms processing time
      timeline.push({
        stage: 'completed',
        timestamp: new Date(Date.now() + processingTime).toISOString(),
        durationMs: processingTime - 270,
        details: 'Webhook processing completed successfully'
      });

      // Performance metrics
      const performanceMetrics = {
        totalTime: processingTime,
        breakdowns: [{
          stage: 'Authentication',
          timeMs: 50,
          percentage: Math.round(50 / processingTime * 100)
        }, {
          stage: 'Validation',
          timeMs: 100,
          percentage: Math.round(100 / processingTime * 100)
        }, {
          stage: 'Processing',
          timeMs: processingTime - 150,
          percentage: Math.round((processingTime - 150) / processingTime * 100)
        }],
        bottlenecks: config.validation.enabled && config.validation.schema ? ['Schema validation is the most time-consuming stage'] : []
      };

      // Create a new history entry
      const historyEntry = {
        timestamp: new Date(),
        payload: parsedPayload,
        headers: testRequest.headers,
        id: Math.random().toString(36).substring(2, 9),
        timeline,
        performanceMetrics
      };

      // Add to request history
      setRequestHistory(prev => [historyEntry, ...prev].slice(0, 10));

      // Simulate validation if schema validation is enabled
      let validationDetails = null;
      if (config.validation.enabled && config.validation.schema) {
        try {
          // In a real implementation, this would use a JSON Schema validator library
          const schema = JSON.parse(config.validation.schema);
          const parsedPayload = JSON.parse(testRequest.payload);

          // Simulate validation results - in this case a simple check
          // to see if required properties exist in the payload
          const valid = schema.required?.every(field => typeof parsedPayload[field] !== 'undefined') ?? true;
          validationDetails = {
            valid,
            schema: schema,
            errors: valid ? [] : [{
              instancePath: "",
              schemaPath: "#/required",
              keyword: "required",
              params: {
                missingProperty: schema.required?.find(field => typeof parsedPayload[field] === 'undefined')
              },
              message: "must have required property"
            }]
          };
        } catch (e) {
          // If there's an error parsing the schema, set validation as failed
          validationDetails = {
            valid: false,
            schema: config.validation.schema,
            errors: [{
              message: `Error parsing schema: ${e.message}`
            }]
          };
        }
      }

      // Create a success result with validation information
      const result = {
        success: true,
        message: 'Test webhook request sent successfully',
        receivedAt: new Date().toISOString(),
        validationPassed: validationDetails?.valid ?? true,
        processingTime,
        details: {
          endpoint: getWebhookUrl(),
          securityChecks: config.security.type !== 'none' ? 'Passed' : 'Not configured',
          validationChecks: config.validation.enabled ? validationDetails?.valid ? 'Passed' : 'Failed' : 'Not enabled',
          rateLimiting: config.rateLimit.enabled ? 'Active' : 'Not enabled'
        },
        // Include validation details if available
        validationDetails,
        // Include timeline for request processing visualization
        timeline,
        // Include performance metrics
        performanceMetrics
      };
      setTestResults(result);
    } catch (err) {
      setError(err.message || 'Error sending test webhook request');
      setTestResults({
        success: false,
        message: err.message || 'Unknown error'
      });
    } finally {
      setTestingInProgress(false);
    }
  }, [testRequest, getWebhookUrl, config.security.type, config.validation.enabled, config.rateLimit.enabled]);

  /**
   * Load a historical request into the test form
   * 
   * @param {Object} historyItem - Request history item
   */
  const loadHistoryItem = useCallback(historyItem => {
    setTestRequest({
      payload: JSON.stringify(historyItem.payload, null, 2),
      headers: [...historyItem.headers]
    });
    setHistoryMenuAnchor(null);
  }, []);

  /**
   * Load a template into the test form
   * 
   * @param {Object} template - Request template
   */
  const loadTemplateItem = useCallback(template => {
    setTestRequest({
      payload: template.payload,
      headers: [...template.headers]
    });
    setTemplatesMenuAnchor(null);
  }, []);

  /**
   * Save current request as a template
   */
  const saveAsTemplate = useCallback(() => {
    // Create a simple dialog to enter template name (In a real app, this would be a proper form dialog)
    const templateName = prompt('Enter a name for this template', 'My Template');
    if (!templateName) return;
    const newTemplate = {
      id: `template-${Date.now()}`,
      name: templateName,
      payload: testRequest.payload,
      headers: [...testRequest.headers]
    };
    setTemplates(prev => [...prev, newTemplate]);
  }, [testRequest]);

  /**
   * Generate a simulated webhook payload
   */
  const generateSimulatedPayload = useCallback(() => {
    // Create a simulated payload based on the selected event type
    const timestamp = new Date().toISOString();
    const randomId = Math.random().toString(36).substring(2, 15);
    let payload;
    switch (simulationOptions.eventType) {
      case 'order.created':
        payload = {
          event: 'order.created',
          data: {
            id: simulationOptions.randomizeData ? `order_${randomId}` : 'order_123456',
            customer_id: simulationOptions.randomizeData ? `cust_${randomId.substring(0, 8)}` : 'cust_9876543',
            amount: simulationOptions.randomizeData ? Math.round(Math.random() * 10000) / 100 : 99.99,
            currency: 'USD',
            items: [{
              product_id: simulationOptions.randomizeData ? `prod_${randomId.substring(0, 6)}` : 'prod_123',
              quantity: simulationOptions.randomizeData ? Math.floor(Math.random() * 5) + 1 : 1,
              price: simulationOptions.randomizeData ? Math.round(Math.random() * 10000) / 100 : 79.99
            }, {
              product_id: simulationOptions.randomizeData ? `prod_${randomId.substring(6, 12)}` : 'prod_456',
              quantity: simulationOptions.randomizeData ? Math.floor(Math.random() * 3) + 1 : 2,
              price: simulationOptions.randomizeData ? Math.round(Math.random() * 1000) / 100 : 9.99
            }],
            created_at: timestamp
          }
        };
        break;
      case 'user.registered':
        payload = {
          event: 'user.registered',
          data: {
            id: simulationOptions.randomizeData ? `user_${randomId}` : 'user_12345',
            email: simulationOptions.randomizeData ? `user_${randomId.substring(0, 6)}@example.com` : 'user@example.com',
            name: 'John Doe',
            created_at: timestamp
          }
        };
        break;
      case 'payment.succeeded':
        payload = {
          event: 'payment.succeeded',
          data: {
            id: simulationOptions.randomizeData ? `payment_${randomId}` : 'payment_12345',
            order_id: simulationOptions.randomizeData ? `order_${randomId.substring(0, 8)}` : 'order_123456',
            amount: simulationOptions.randomizeData ? Math.round(Math.random() * 10000) / 100 : 99.99,
            currency: 'USD',
            payment_method: 'credit_card',
            created_at: timestamp
          }
        };
        break;
      default:
        payload = {
          event: simulationOptions.eventType,
          data: {
            id: randomId,
            timestamp
          }
        };
    }

    // If error simulation is enabled, randomly determine if it should fail
    if (simulationOptions.simulateError && Math.random() < simulationOptions.errorRate / 100) {
      // Simulate error by removing required fields or adding invalid data
      if (payload.data) {
        delete payload.data.id; // Remove a required field to cause validation error
      }
    }
    return payload;
  }, [simulationOptions]);

  /**
   * Start webhook simulator
   */
  const startSimulator = useCallback(async () => {
    setSimulatorOpen(false);
    setTestingInProgress(true);
    setTestResults(null);
    setError(null);
    try {
      // Generate a simulated payload
      const payload = generateSimulatedPayload();
      setSimulatedPayload(payload);

      // Create headers for the simulated request
      const headers = [{
        key: 'Content-Type',
        value: 'application/json'
      }, {
        key: 'X-Event-Type',
        value: simulationOptions.eventType
      }];

      // Update the test request to show the simulated data
      setTestRequest({
        payload: JSON.stringify(payload, null, 2),
        headers
      });

      // Apply delay if specified
      if (simulationOptions.delayMs > 0) {
        await new Promise(resolve => setTimeout(resolve, simulationOptions.delayMs));
      }

      // Now send the test request as normal
      sendTestRequest();
    } catch (err) {
      setError(err.message || 'Error simulating webhook request');
      setTestingInProgress(false);
    }
  }, [simulationOptions, generateSimulatedPayload, sendTestRequest]);

  // Security type options
  const securityTypes = [{
    value: 'none',
    label: 'No Security'
  }, {
    value: 'token',
    label: 'Static Token'
  }, {
    value: 'hmac',
    label: 'HMAC Signature'
  }, {
    value: 'basicAuth',
    label: 'Basic Authentication'
  }];

  // HMAC algorithm options
  const hmacAlgorithms = [{
    value: 'sha256',
    label: 'SHA-256'
  }, {
    value: 'sha384',
    label: 'SHA-384'
  }, {
    value: 'sha512',
    label: 'SHA-512'
  }];
  return <Card variant="outlined">
      <CardContent>
        <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
          <Typography variant="h5" component="div" sx={{
          display: 'flex',
          alignItems: 'center'
        }}>
            <WebhookIcon sx={{
            mr: 1
          }} />
            Webhook Configuration
          </Typography>
          <Box>
            <Tooltip title="Test Webhook">
              <span>
                <IconButton onClick={() => setTestRequestDrawerOpen(true)} disabled={disabled || !config.endpointId} color="primary">

                  <PlayIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Webhook Simulator">
              <span>
                <IconButton onClick={() => setSimulatorOpen(true)} disabled={disabled || !config.endpointId} color="primary">

                  <AutorenewIcon />
                </IconButton>
              </span>
            </Tooltip>
            <Tooltip title="Show JSON Editor">
              <IconButton onClick={() => setShowJsonEditor(!showJsonEditor)} color={showJsonEditor ? 'primary' : 'default'}>

                <CodeIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {showJsonEditor ? <Box sx={{
        mb: 3
      }}>
            <TextField fullWidth multiline rows={20} label="Configuration JSON" value={rawJson} onChange={handleJsonChange} error={!!jsonError} helperText={jsonError} sx={{
          fontFamily: 'monospace'
        }} InputProps={{
          endAdornment: <InputAdornment position="end">
                    <Button onClick={applyJsonChanges} disabled={!!jsonError} variant="contained" startIcon={<SaveIcon />}>

                      Apply
                    </Button>
                  </InputAdornment>
        }} />

          </Box> : <>
            <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{
          borderBottom: 1,
          borderColor: 'divider',
          mb: 3
        }}>

              <Tab label="Basic" />
              <Tab label="Security" />
              <Tab label="Validation" />
              <Tab label="Advanced" />
            </Tabs>

            {/* Basic Tab */}
            <Box sx={{
          display: activeTab === 0 ? 'block' : 'none'
        }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField fullWidth label="Webhook Name" value={config.name} onChange={e => handleChange('name', e.target.value)} disabled={disabled} helperText="A descriptive name for this webhook" />

                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth multiline rows={2} label="Description" value={config.description} onChange={e => handleChange('description', e.target.value)} disabled={disabled} helperText="A description of this webhook's purpose" />

                </Grid>
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{
                p: 2
              }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Webhook Endpoint
                    </Typography>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={8}>
                        <TextField fullWidth label="Endpoint ID" value={config.endpointId} onChange={e => handleChange('endpointId', e.target.value)} disabled={disabled} InputProps={{
                      endAdornment: <InputAdornment position="end">
                                <Tooltip title="Regenerate Endpoint ID">
                                  <IconButton onClick={regenerateEndpointId} edge="end" disabled={disabled}>

                                    <AutorenewIcon />
                                  </IconButton>
                                </Tooltip>
                              </InputAdornment>
                    }} />

                      </Grid>
                      <Grid item xs={12} sm={4}>
                        <Button fullWidth variant="outlined" startIcon={<CopyIcon />} onClick={copyWebhookUrl} disabled={disabled || !config.endpointId}>

                          Copy URL
                        </Button>
                      </Grid>
                      <Grid item xs={12}>
                        <TextField fullWidth variant="filled" label="Webhook URL" value={getWebhookUrl()} InputProps={{
                      readOnly: true
                    }} />

                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            {/* Security Tab */}
            <Box sx={{
          display: activeTab === 1 ? 'block' : 'none'
        }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Alert severity="info" sx={{
                mb: 3
              }}>
                    <AlertTitle>Security Recommendation</AlertTitle>
                    We recommend implementing security for your webhook to ensure that only authorized systems can send requests to your endpoint.
                  </Alert>
                  
                  <FormControl component="fieldset" sx={{
                mb: 3
              }}>
                    <Typography variant="h6" gutterBottom>
                      Security Method
                    </Typography>
                    <RadioGroup aria-label="security-type" name="security-type" value={config.security.type} onChange={handleSecurityTypeChange}>

                      {securityTypes.map(type => <FormControlLabel key={type.value} value={type.value} control={<Radio disabled={disabled} />} label={type.label} />)}


                    </RadioGroup>
                  </FormControl>
                </Grid>

                {/* Static Token Security */}
                {config.security.type === 'token' && <Grid item xs={12}>
                    <Paper variant="outlined" sx={{
                p: 2
              }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Static Token Validation
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        A static token is sent with each request. The sender must include this token in a header.
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Token Header Name" value={config.security.token.headerName} onChange={e => handleSecurityChange('token', 'headerName', e.target.value)} disabled={disabled} helperText="HTTP header name for the token" placeholder="X-Webhook-Token" />

                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Token Value" type={showSecrets.token ? 'text' : 'password'} value={config.security.token.value} onChange={e => handleSecurityChange('token', 'value', e.target.value)} disabled={disabled} helperText="Secret token value" InputProps={{
                      endAdornment: <InputAdornment position="end">
                                  <IconButton onClick={() => toggleSecretVisibility('token')} edge="end">

                                    {showSecrets.token ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                  </IconButton>
                                </InputAdornment>
                    }} />

                        </Grid>
                        <Grid item xs={12}>
                          <Button variant="outlined" onClick={() => {
                      const randomToken = Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('');
                      handleSecurityChange('token', 'value', randomToken);
                    }} disabled={disabled} startIcon={<AutorenewIcon />}>

                            Generate Random Token
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>}


                {/* HMAC Signature Security */}
                {config.security.type === 'hmac' && <Grid item xs={12}>
                    <Paper variant="outlined" sx={{
                p: 2
              }}>
                      <Typography variant="subtitle1" gutterBottom>
                        HMAC Signature Validation
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        The sender creates a hash signature of the payload using the shared secret. 
                        This provides stronger security by validating the message integrity.
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Signature Header Name" value={config.security.hmac.headerName} onChange={e => handleSecurityChange('hmac', 'headerName', e.target.value)} disabled={disabled} helperText="HTTP header name for the signature" placeholder="X-Webhook-Signature" />

                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <FormControl fullWidth disabled={disabled}>
                            <InputLabel>HMAC Algorithm</InputLabel>
                            <Select value={config.security.hmac.algorithm} label="HMAC Algorithm" onChange={e => handleSecurityChange('hmac', 'algorithm', e.target.value)}>

                              {hmacAlgorithms.map(algorithm => <MenuItem key={algorithm.value} value={algorithm.value}>
                                  {algorithm.label}
                                </MenuItem>)}

                            </Select>
                            <FormHelperText>The hashing algorithm to use</FormHelperText>
                          </FormControl>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth label="Secret Key" type={showSecrets.hmacSecret ? 'text' : 'password'} value={config.security.hmac.secret} onChange={e => handleSecurityChange('hmac', 'secret', e.target.value)} disabled={disabled} helperText="Secret key for HMAC signature generation" InputProps={{
                      endAdornment: <InputAdornment position="end">
                                  <IconButton onClick={() => toggleSecretVisibility('hmacSecret')} edge="end">

                                    {showSecrets.hmacSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                  </IconButton>
                                </InputAdornment>
                    }} />

                        </Grid>
                        <Grid item xs={12}>
                          <Button variant="outlined" onClick={() => {
                      const randomSecret = Array.from(crypto.getRandomValues(new Uint8Array(32))).map(b => b.toString(16).padStart(2, '0')).join('');
                      handleSecurityChange('hmac', 'secret', randomSecret);
                    }} disabled={disabled} startIcon={<AutorenewIcon />}>

                            Generate Random Secret
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>}


                {/* Basic Authentication Security */}
                {config.security.type === 'basicAuth' && <Grid item xs={12}>
                    <Paper variant="outlined" sx={{
                p: 2
              }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Basic Authentication
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        The sender must provide basic HTTP authentication credentials with each request.
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Username" value={config.security.basicAuth.username} onChange={e => handleSecurityChange('basicAuth', 'username', e.target.value)} disabled={disabled} helperText="Basic Auth username" />

                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth label="Password" type={showSecrets.basicAuthPassword ? 'text' : 'password'} value={config.security.basicAuth.password} onChange={e => handleSecurityChange('basicAuth', 'password', e.target.value)} disabled={disabled} helperText="Basic Auth password" InputProps={{
                      endAdornment: <InputAdornment position="end">
                                  <IconButton onClick={() => toggleSecretVisibility('basicAuthPassword')} edge="end">

                                    {showSecrets.basicAuthPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                  </IconButton>
                                </InputAdornment>
                    }} />

                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>}


                {/* No Security Warning */}
                {config.security.type === 'none' && <Grid item xs={12}>
                    <Alert severity="warning">
                      <AlertTitle>No Security Configured</AlertTitle>
                      Your webhook endpoint will accept requests from any source without validation. 
                      This is not recommended for production environments.
                    </Alert>
                  </Grid>}

              </Grid>
            </Box>

            {/* Validation Tab */}
            <Box sx={{
          display: activeTab === 2 ? 'block' : 'none'
        }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControlLabel control={<Switch checked={config.validation.enabled} onChange={e => handleValidationChange('enabled', e.target.checked)} disabled={disabled} />} label="Enable Payload Validation" />

                </Grid>

                <Grid item xs={12}>
                  <Collapse in={config.validation.enabled}>
                    <Paper variant="outlined" sx={{
                  p: 2
                }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Required Fields
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Specify fields that must be present in the webhook payload.
                      </Typography>

                      {config.validation.requiredFields.length > 0 ? <Box sx={{
                    mb: 2
                  }}>
                          {config.validation.requiredFields.map((field, index) => <Chip key={index} label={field} onDelete={() => handleRemoveRequiredField(index)} disabled={disabled} sx={{
                      m: 0.5
                    }} />)}


                        </Box> : <Typography variant="body2" color="text.secondary" sx={{
                    mb: 2
                  }}>
                          No required fields configured.
                        </Typography>}


                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs>
                          <TextField fullWidth size="small" label="Field Path" value={requiredFieldToAdd} onChange={e => setRequiredFieldToAdd(e.target.value)} disabled={disabled || !config.validation.enabled} placeholder="data.id" helperText="JSON path to a required field (e.g., 'data.id')" />

                        </Grid>
                        <Grid item>
                          <Button variant="outlined" onClick={handleAddRequiredField} disabled={disabled || !config.validation.enabled || !requiredFieldToAdd.trim()} startIcon={<AddIcon />}>

                            Add
                          </Button>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Collapse>
                </Grid>

                <Grid item xs={12}>
                  <Collapse in={config.validation.enabled}>
                    <Paper variant="outlined" sx={{
                  p: 2
                }}>
                      <Typography variant="subtitle1" gutterBottom>
                        JSON Schema Validation
                      </Typography>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Provide a JSON Schema to validate the structure and data types of incoming webhooks.
                      </Typography>

                      <Box>
                        <TextField fullWidth multiline rows={10} label="JSON Schema" value={config.validation.schema} onChange={e => handleValidationChange('schema', e.target.value)} disabled={disabled || !config.validation.enabled} placeholder={`{
  "type": "object",
  "required": ["data"],
  "properties": {
    "data": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "type": { "type": "string" }
      }
    }
  }
}`} sx={{
                      fontFamily: 'monospace',
                      mb: 2
                    }} error={(() => {
                      try {
                        if (!config.validation.schema) return false;
                        JSON.parse(config.validation.schema);
                        return false;
                      } catch (e) {
                        return true;
                      }
                    })()} helperText={(() => {
                      try {
                        if (!config.validation.schema) return "Enter a JSON Schema to validate webhook payloads";
                        JSON.parse(config.validation.schema);
                        return "Valid JSON Schema";
                      } catch (e) {
                        return `Invalid JSON: ${e.message}`;
                      }
                    })()} />

                        
                        <Box sx={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      mt: 2
                    }}>
                          <Button variant="outlined" onClick={() => {
                        handleValidationChange('schema', `{
  "type": "object",
  "required": ["data"],
  "properties": {
    "data": {
      "type": "object",
      "properties": {
        "id": { "type": "string" },
        "type": { "type": "string" },
        "attributes": {
          "type": "object",
          "properties": {
            "name": { "type": "string" },
            "created_at": { "type": "string", "format": "date-time" }
          }
        }
      },
      "required": ["id", "type"]
    },
    "meta": {
      "type": "object",
      "properties": {
        "request_id": { "type": "string" }
      }
    }
  }
}`);
                      }} disabled={disabled || !config.validation.enabled} startIcon={<AddIcon />}>

                            Load Example Schema
                          </Button>
                          
                          <Button variant="outlined" color="secondary" onClick={() => handleValidationChange('schema', '')} disabled={disabled || !config.validation.enabled || !config.validation.schema} startIcon={<CloseIcon />}>

                            Clear Schema
                          </Button>
                        </Box>
                        
                        <Divider sx={{
                      my: 3
                    }} />
                        
                        <Typography variant="subtitle1" gutterBottom>
                          Schema Validation Options
                        </Typography>
                        
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <FormControlLabel control={<Switch checked={config.validation.strictMode} onChange={e => handleValidationChange('strictMode', e.target.checked)} disabled={disabled || !config.validation.enabled} />} label="Strict Mode" />

                            <Typography variant="caption" display="block" color="text.secondary">
                              Reject payloads with additional properties not in schema
                            </Typography>
                          </Grid>
                          
                          <Grid item xs={12} sm={6}>
                            <FormControlLabel control={<Switch checked={config.validation.failOnError} onChange={e => handleValidationChange('failOnError', e.target.checked)} disabled={disabled || !config.validation.enabled} />} label="Fail on Error" />

                            <Typography variant="caption" display="block" color="text.secondary">
                              Reject webhook completely if validation fails
                            </Typography>
                          </Grid>
                        </Grid>
                      </Box>
                    </Paper>
                  </Collapse>
                </Grid>
              </Grid>
            </Box>

            {/* Advanced Tab */}
            <Box sx={{
          display: activeTab === 3 ? 'block' : 'none'
        }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{
                p: 2
              }}>
                    <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}>
                      <Typography variant="h6">
                        Rate Limiting
                      </Typography>
                      <FormControlLabel control={<Switch checked={config.rateLimit.enabled} onChange={e => handleRateLimitChange('enabled', e.target.checked)} disabled={disabled} />} label="Enable Rate Limiting" />

                    </Box>

                    <Collapse in={config.rateLimit.enabled}>
                      <Typography variant="body2" color="text.secondary" paragraph>
                        Limit the number of webhook requests that can be processed within a time window.
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth type="number" label="Max Requests" value={config.rateLimit.maxRequests} onChange={e => handleRateLimitChange('maxRequests', parseInt(e.target.value, 10) || 100)} disabled={disabled || !config.rateLimit.enabled} InputProps={{
                        inputProps: {
                          min: 1
                        }
                      }} helperText="Maximum number of requests allowed" />

                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField fullWidth type="number" label="Time Window (seconds)" value={config.rateLimit.timeWindow} onChange={e => handleRateLimitChange('timeWindow', parseInt(e.target.value, 10) || 60)} disabled={disabled || !config.rateLimit.enabled} InputProps={{
                        inputProps: {
                          min: 1
                        }
                      }} helperText="Time window in seconds" />

                        </Grid>
                      </Grid>
                    </Collapse>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </>}


        {/* Error Message */}
        {error && !testResults && <Alert severity="error" sx={{
        mt: 3
      }} onClose={() => setError(null)}>

            {error}
          </Alert>}

      </CardContent>

      {/* Webhook Simulator Drawer */}
      <Drawer anchor="right" open={simulatorOpen} onClose={() => setSimulatorOpen(false)} sx={{
      '& .MuiDrawer-paper': {
        width: '500px',
        maxWidth: '100%',
        p: 2
      }
    }}>

        <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
          <Typography variant="h6">
            Webhook Simulator
          </Typography>
          <IconButton onClick={() => setSimulatorOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        
        <Typography variant="body2" paragraph>
          Generate webhook payloads based on common event types or create custom events.
          Simulated webhooks help test your endpoint's handling of different scenarios.
        </Typography>
        
        <Box sx={{
        mb: 3
      }}>
          <Typography variant="subtitle2" gutterBottom>
            Event Type
          </Typography>
          <Select fullWidth value={simulationOptions.eventType} onChange={e => setSimulationOptions(prev => ({
          ...prev,
          eventType: e.target.value
        }))} sx={{
          mb: 2
        }}>

            <MenuItem value="order.created">Order Created</MenuItem>
            <MenuItem value="user.registered">User Registered</MenuItem>
            <MenuItem value="payment.succeeded">Payment Succeeded</MenuItem>
            <MenuItem value="custom.event">Custom Event</MenuItem>
          </Select>
        </Box>
        
        <Box sx={{
        mb: 3
      }}>
          <Typography variant="subtitle2" gutterBottom>
            Simulation Options
          </Typography>
          
          <FormControlLabel control={<Switch checked={simulationOptions.randomizeData} onChange={e => setSimulationOptions(prev => ({
          ...prev,
          randomizeData: e.target.checked
        }))} />} label="Randomize data values" />

          
          <FormControlLabel control={<Switch checked={simulationOptions.simulateError} onChange={e => setSimulationOptions(prev => ({
          ...prev,
          simulateError: e.target.checked
        }))} />} label="Simulate validation errors" />

          
          {simulationOptions.simulateError && <Box sx={{
          ml: 4,
          mt: 1,
          mb: 2
        }}>
              <Typography variant="body2" gutterBottom>
                Error rate: {simulationOptions.errorRate}%
              </Typography>
              <Slider value={simulationOptions.errorRate} onChange={(e, newValue) => setSimulationOptions(prev => ({
            ...prev,
            errorRate: newValue
          }))} min={0} max={100} step={5} valueLabelDisplay="auto" valueLabelFormat={value => `${value}%`} />

            </Box>}

          
          <Box sx={{
          mt: 2
        }}>
            <Typography variant="body2" gutterBottom>
              Request delay: {simulationOptions.delayMs}ms
            </Typography>
            <Slider value={simulationOptions.delayMs} onChange={(e, newValue) => setSimulationOptions(prev => ({
            ...prev,
            delayMs: newValue
          }))} min={0} max={3000} step={100} valueLabelDisplay="auto" valueLabelFormat={value => `${value}ms`} />

          </Box>
        </Box>
        
        <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        mt: 3
      }}>
          <Button onClick={() => setSimulatorOpen(false)}>

            Cancel
          </Button>
          <Button variant="contained" color="primary" onClick={startSimulator} disabled={testingInProgress}>

            Start Simulation
          </Button>
        </Box>
      </Drawer>

      {/* Test Webhook Drawer */}
      <Drawer anchor="right" open={testRequestDrawerOpen} onClose={() => setTestRequestDrawerOpen(false)} sx={{
      '& .MuiDrawer-paper': {
        width: '500px',
        maxWidth: '100%',
        p: 2
      }
    }}>

        <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3
      }}>
          <Typography variant="h6">
            Test Webhook
          </Typography>
          <IconButton onClick={() => setTestRequestDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>

        <Typography variant="subtitle1" gutterBottom>
          Request Headers
        </Typography>
        <Paper variant="outlined" sx={{
        p: 2,
        mb: 3
      }}>
          {testRequest.headers.map((header, index) => <Grid container spacing={1} alignItems="center" key={index} sx={{
          mb: 1
        }}>
              <Grid item xs={5}>
                <TextField fullWidth size="small" label="Header" value={header.key} onChange={e => handleUpdateTestHeader(index, 'key', e.target.value)} />

              </Grid>
              <Grid item xs={6}>
                <TextField fullWidth size="small" label="Value" value={header.value} onChange={e => handleUpdateTestHeader(index, 'value', e.target.value)} />

              </Grid>
              <Grid item xs={1}>
                <IconButton size="small" onClick={() => handleRemoveTestHeader(index)}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Grid>
            </Grid>)}

          <Button startIcon={<AddIcon />} onClick={() => handleAddTestHeader()} size="small" sx={{
          mt: 1
        }}>

            Add Header
          </Button>
        </Paper>

        <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 2
      }}>
          <Typography variant="subtitle1">
            Request Payload
          </Typography>
          <Box>
            <IconButton size="small" onClick={e => setTemplatesMenuAnchor(e.currentTarget)} sx={{
            mr: 1
          }}>

              <AddIcon />
            </IconButton>
            <IconButton size="small" onClick={e => setHistoryMenuAnchor(e.currentTarget)} disabled={requestHistory.length === 0}>

              <HistoryIcon />
            </IconButton>
            
            {/* Templates Menu */}
            <Menu anchorEl={templatesMenuAnchor} open={Boolean(templatesMenuAnchor)} onClose={() => setTemplatesMenuAnchor(null)}>

              <MenuItem disabled>
                <Typography variant="subtitle2">Request Templates</Typography>
              </MenuItem>
              <Divider />
              {templates.map(template => <MenuItem key={template.id} onClick={() => loadTemplateItem(template)}>
                  <ListItemIcon>
                    <AddIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={template.name} secondary={`Headers: ${template.headers.length}, Payload: ${template.payload.substring(0, 30)}...`} />

                </MenuItem>)}

            </Menu>
            
            {/* History Menu */}
            <Menu anchorEl={historyMenuAnchor} open={Boolean(historyMenuAnchor)} onClose={() => setHistoryMenuAnchor(null)}>

              <MenuItem disabled>
                <Typography variant="subtitle2">Recent Requests</Typography>
              </MenuItem>
              <Divider />
              {requestHistory.map((item, index) => <MenuItem key={item.id} onClick={() => loadHistoryItem(item)}>
                  <ListItemIcon>
                    <SendIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={new Date(item.timestamp).toLocaleTimeString()} secondary={`Payload: ${JSON.stringify(item.payload).substring(0, 30)}...`} />

                </MenuItem>)}

            </Menu>
          </Box>
        </Box>

        <TextField fullWidth multiline rows={10} value={testRequest.payload} onChange={handleTestPayloadChange} sx={{
        mb: 3,
        fontFamily: 'monospace'
      }} error={(() => {
        try {
          JSON.parse(testRequest.payload);
          return false;
        } catch (e) {
          return true;
        }
      })()} helperText={(() => {
        try {
          JSON.parse(testRequest.payload);
          return null;
        } catch (e) {
          return e.message;
        }
      })()} />


        <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
          <Button onClick={() => setTestRequestDrawerOpen(false)}>

            Cancel
          </Button>
          <Button variant="contained" color="primary" startIcon={testingInProgress ? <CircularProgress size={20} /> : <SendIcon />} onClick={sendTestRequest} disabled={testingInProgress || (() => {
          try {
            JSON.parse(testRequest.payload);
            return false;
          } catch (e) {
            return true;
          }
        })()}>

            Send Request
          </Button>
        </Box>

        {/* Test Results */}
        {testResults && <Paper sx={{
        mt: 3,
        p: 2
      }}>
            <Alert severity={testResults.success ? 'success' : 'error'} sx={{
          mb: 2
        }}>

              <AlertTitle>{testResults.success ? 'Webhook Test Successful' : 'Webhook Test Failed'}</AlertTitle>
              {testResults.message}
            </Alert>

            <Box sx={{
          mb: 3
        }}>
              <Tabs value={testResultsTabIndex} onChange={(e, newValue) => setTestResultsTabIndex(newValue)} variant="scrollable" scrollButtons="auto" sx={{
            borderBottom: 1,
            borderColor: 'divider',
            mb: 2
          }}>

                <Tab icon={<SendIcon fontSize="small" />} label="Request Inspector" iconPosition="start" />
                <Tab icon={<CheckIcon fontSize="small" />} label="Response Details" iconPosition="start" />
                <Tab icon={<CodeIcon fontSize="small" />} label="Validation Results" iconPosition="start" />
                <Tab icon={<TimelineIcon fontSize="small" />} label="Timeline" iconPosition="start" />
                <Tab icon={<SpeedIcon fontSize="small" />} label="Performance" iconPosition="start" />
              </Tabs>
              
              {/* Request Inspector Tab */}
              <Box sx={{
            display: testResultsTabIndex === 0 ? 'block' : 'none'
          }}>
                <Typography variant="subtitle2" gutterBottom sx={{
              mt: 2
            }}>Request Headers</Typography>
                <Paper variant="outlined" sx={{
              p: 1,
              mb: 2,
              maxHeight: 200,
              overflow: 'auto'
            }}>
                  <table style={{
                width: '100%',
                borderCollapse: 'collapse'
              }}>
                    <thead>
                      <tr>
                        <th style={{
                      textAlign: 'left',
                      padding: '8px',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)'
                    }}>Header</th>
                        <th style={{
                      textAlign: 'left',
                      padding: '8px',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)'
                    }}>Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {testRequest.headers.map((header, index) => <tr key={index}>
                          <td style={{
                      padding: '8px',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)'
                    }}>{header.key}</td>
                          <td style={{
                      padding: '8px',
                      borderBottom: '1px solid rgba(224, 224, 224, 1)'
                    }}>{header.value}</td>
                        </tr>)}

                    </tbody>
                  </table>
                </Paper>
                
                <Typography variant="subtitle2" gutterBottom>Request Payload</Typography>
                <Paper variant="outlined" sx={{
              p: 2,
              mb: 2,
              maxHeight: 200,
              overflow: 'auto'
            }}>
                  <Box component="pre" sx={{
                m: 0,
                fontFamily: 'monospace',
                fontSize: '0.85rem'
              }}>
                    {(() => {
                  try {
                    return JSON.stringify(JSON.parse(testRequest.payload), null, 2);
                  } catch (e) {
                    return testRequest.payload;
                  }
                })()}
                  </Box>
                </Paper>
              </Box>
              
              {/* Response Details Tab */}
              <Box sx={{
            display: testResultsTabIndex === 1 ? 'block' : 'none'
          }}>
                <Typography variant="subtitle2" gutterBottom>Processing Details</Typography>
                <List dense>
                <ListItem divider>
                  <ListItemText primary="Received At" secondary={new Date(testResults.receivedAt).toLocaleString()} />

                </ListItem>
                <ListItem divider>
                  <ListItemText primary="Processing Time" secondary={`${testResults.processingTime}ms`} />

                </ListItem>
                <ListItem divider>
                  <ListItemText primary="Security Checks" secondary={<Box sx={{
                  display: 'flex',
                  alignItems: 'center'
                }}>
                        {testResults.details.securityChecks === 'Passed' ? <CheckIcon fontSize="small" color="success" sx={{
                    mr: 1
                  }} /> : testResults.details.securityChecks === 'Not configured' ? <WarningIcon fontSize="small" color="warning" sx={{
                    mr: 1
                  }} /> : <CloseIcon fontSize="small" color="error" sx={{
                    mr: 1
                  }} />}

                        {testResults.details.securityChecks}
                      </Box>} />


                </ListItem>
                <ListItem divider>
                  <ListItemText primary="Validation Checks" secondary={<Box sx={{
                  display: 'flex',
                  alignItems: 'center'
                }}>
                        {testResults.details.validationChecks === 'Passed' ? <CheckIcon fontSize="small" color="success" sx={{
                    mr: 1
                  }} /> : testResults.details.validationChecks === 'Not enabled' ? <WarningIcon fontSize="small" color="warning" sx={{
                    mr: 1
                  }} /> : <CloseIcon fontSize="small" color="error" sx={{
                    mr: 1
                  }} />}

                        {testResults.details.validationChecks}
                      </Box>} />


                </ListItem>
                <ListItem>
                  <ListItemText primary="Rate Limiting" secondary={<Box sx={{
                  display: 'flex',
                  alignItems: 'center'
                }}>
                        {testResults.details.rateLimiting === 'Active' ? <CheckIcon fontSize="small" color="success" sx={{
                    mr: 1
                  }} /> : <WarningIcon fontSize="small" color="warning" sx={{
                    mr: 1
                  }} />}

                        {testResults.details.rateLimiting}
                      </Box>} />


                </ListItem>
                </List>
              </Box>
              
              {/* Validation Results Tab */}
              <Box sx={{
            display: testResultsTabIndex === 2 ? 'block' : 'none',
            mt: 3
          }}>
                {testResults.validationDetails ? <>
                    <Typography variant="subtitle2" gutterBottom>Schema Validation Results</Typography>
                    <Paper variant="outlined" sx={{
                p: 2,
                backgroundColor: testResults.validationDetails.valid ? 'success.lightest' : 'error.lightest',
                maxHeight: 300,
                overflow: 'auto'
              }}>

                      {testResults.validationDetails.valid ? <Box sx={{
                  display: 'flex',
                  alignItems: 'center'
                }}>
                          <CheckIcon color="success" sx={{
                    mr: 1
                  }} />
                          <Typography>Payload passed validation against the JSON Schema</Typography>
                        </Box> : <>
                          <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    mb: 2
                  }}>
                            <CloseIcon color="error" sx={{
                      mr: 1
                    }} />
                            <Typography>Payload failed validation against the JSON Schema</Typography>
                          </Box>
                          
                          <Typography variant="subtitle2" gutterBottom>Validation Errors:</Typography>
                          <Box component="pre" sx={{
                    m: 0,
                    fontFamily: 'monospace',
                    fontSize: '0.85rem'
                  }}>
                            {JSON.stringify(testResults.validationDetails.errors, null, 2)}
                          </Box>
                        </>}

                    </Paper>
                  </> : <Alert severity="info" sx={{
              mb: 2
            }}>
                    <AlertTitle>Validation Not Configured</AlertTitle>
                    Enable schema validation in the Validation tab to see validation results.
                  </Alert>}

              </Box>
              
              {/* Timeline Tab */}
              <Box sx={{
            display: testResultsTabIndex === 3 ? 'block' : 'none',
            mt: 3
          }}>
                <Typography variant="subtitle2" gutterBottom>Webhook Processing Timeline</Typography>
                
                {testResults.timeline && <Paper variant="outlined" sx={{
              p: 2,
              mb: 2
            }}>
                    <Box sx={{
                position: 'relative',
                height: 'auto',
                minHeight: '200px',
                mt: 3,
                mb: 2
              }}>
                      {/* Timeline visualization */}
                      <Box sx={{
                  position: 'relative',
                  height: '6px',
                  bgcolor: 'grey.200',
                  borderRadius: '3px',
                  mb: 5,
                  mt: 3
                }}>
                        {testResults.timeline.map((event, index) => {
                    // Calculate position as percentage of total time
                    const startTime = new Date(testResults.timeline[0].timestamp).getTime();
                    const endTime = new Date(testResults.timeline[testResults.timeline.length - 1].timestamp).getTime();
                    const totalDuration = endTime - startTime;
                    const eventTime = new Date(event.timestamp).getTime();
                    const position = (eventTime - startTime) / totalDuration * 100;
                    return <Box key={index} sx={{
                      position: 'absolute',
                      left: `${position}%`,
                      top: 0,
                      transform: 'translate(-50%, -50%)',
                      width: '16px',
                      height: '16px',
                      borderRadius: '50%',
                      bgcolor: event.stage === 'completed' ? 'success.main' : event.stage === 'error' ? 'error.main' : 'primary.main',
                      border: '2px solid',
                      borderColor: 'background.paper',
                      zIndex: 2,
                      '&:hover': {
                        boxShadow: '0 0 0 4px rgba(25, 118, 210, 0.2)'
                      }
                    }} />;
                  })}
                      </Box>
                      
                      {/* Event labels */}
                      {testResults.timeline.map((event, index) => {
                  // Calculate position as percentage of total time
                  const startTime = new Date(testResults.timeline[0].timestamp).getTime();
                  const endTime = new Date(testResults.timeline[testResults.timeline.length - 1].timestamp).getTime();
                  const totalDuration = endTime - startTime;
                  const eventTime = new Date(event.timestamp).getTime();
                  const position = (eventTime - startTime) / totalDuration * 100;

                  // Alternate labels above and below the timeline
                  const isAbove = index % 2 === 0;
                  return <Box key={`label-${index}`} sx={{
                    position: 'absolute',
                    left: `${position}%`,
                    top: isAbove ? '-20px' : '20px',
                    transform: 'translateX(-50%)',
                    textAlign: 'center',
                    width: '120px'
                  }}>

                            <Typography variant="caption" sx={{
                      display: 'block',
                      fontWeight: 'bold'
                    }}>
                              {event.stage.charAt(0).toUpperCase() + event.stage.slice(1)}
                            </Typography>
                            <Typography variant="caption" sx={{
                      display: 'block'
                    }}>
                              {`+${event.durationMs}ms`}
                            </Typography>
                          </Box>;
                })}
                    </Box>
                    
                    {/* Timeline events list */}
                    <Typography variant="subtitle2" gutterBottom sx={{
                mt: 4
              }}>Event Details</Typography>
                    <List dense>
                      {testResults.timeline.map((event, index) => <ListItem key={index} divider={index < testResults.timeline.length - 1}>
                          <ListItemText primary={<Box sx={{
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                                <Typography variant="body2" sx={{
                      fontWeight: 'bold'
                    }}>
                                  {event.stage.charAt(0).toUpperCase() + event.stage.slice(1)}
                                </Typography>
                                <Typography variant="body2">
                                  {`+${event.durationMs}ms`}
                                </Typography>
                              </Box>} secondary={event.details} />

                        </ListItem>)}

                    </List>
                  </Paper>}

              </Box>
              
              {/* Performance Tab */}
              <Box sx={{
            display: testResultsTabIndex === 4 ? 'block' : 'none',
            mt: 3
          }}>
                <Typography variant="subtitle2" gutterBottom>Performance Analysis</Typography>
                
                {testResults.performanceMetrics && <Paper variant="outlined" sx={{
              p: 2,
              mb: 2
            }}>
                    <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}>
                      <Typography variant="body1" sx={{
                  fontWeight: 'bold'
                }}>
                        Total Processing Time
                      </Typography>
                      <Typography variant="body1">
                        {testResults.performanceMetrics.totalTime}ms
                      </Typography>
                    </Box>
                    
                    <Divider sx={{
                mb: 2
              }} />
                    
                    <Typography variant="subtitle2" gutterBottom>Processing Breakdown</Typography>
                    
                    {/* Performance breakdown bars */}
                    {testResults.performanceMetrics.breakdowns.map((breakdown, index) => <Box key={index} sx={{
                mb: 2
              }}>
                        <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  mb: 0.5
                }}>
                          <Typography variant="body2">{breakdown.stage}</Typography>
                          <Typography variant="body2">
                            {breakdown.timeMs}ms ({breakdown.percentage}%)
                          </Typography>
                        </Box>
                        <Box sx={{
                  width: '100%',
                  bgcolor: 'grey.200',
                  height: '8px',
                  borderRadius: '4px',
                  overflow: 'hidden'
                }}>
                          <Box sx={{
                    width: `${breakdown.percentage}%`,
                    bgcolor: index === 0 ? 'info.main' : index === 1 ? 'success.main' : 'warning.main',
                    height: '100%'
                  }} />

                        </Box>
                      </Box>)}

                    
                    {/* Performance bottlenecks */}
                    {testResults.performanceMetrics.bottlenecks.length > 0 && <Box sx={{
                mt: 3
              }}>
                        <Typography variant="subtitle2" gutterBottom>Potential Bottlenecks</Typography>
                        <List dense>
                          {testResults.performanceMetrics.bottlenecks.map((bottleneck, index) => <ListItem key={index} sx={{
                    pl: 0
                  }}>
                              <ListItemIcon sx={{
                      minWidth: '30px'
                    }}>
                                <WarningIcon color="warning" fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={bottleneck} />
                            </ListItem>)}

                        </List>
                        
                        <Alert severity="info" sx={{
                  mt: 2
                }}>
                          <AlertTitle>Performance Optimization Tips</AlertTitle>
                          <Typography variant="body2" gutterBottom>
                            Consider the following to improve webhook processing performance:
                          </Typography>
                          <ul style={{
                    margin: 0,
                    paddingLeft: '20px'
                  }}>
                            <li>Simplify the schema validation for faster payload validation</li>
                            <li>Use lightweight security methods for non-sensitive data</li>
                            <li>Implement asynchronous processing for complex transformations</li>
                          </ul>
                        </Alert>
                      </Box>}

                  </Paper>}

              </Box>
            </Box>
            
            <Box sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 3
        }}>
              <Box>
                <Button variant="outlined" startIcon={<HistoryIcon />} onClick={() => setHistoryMenuAnchor(document.getElementById('requestHistoryBtn'))} sx={{
              mr: 1
            }}>

                  View History
                </Button>
                <Button variant="outlined" onClick={saveAsTemplate} startIcon={<SaveTemplateIcon />}>

                  Save as Template
                </Button>
              </Box>
              
              <Button variant="contained" startIcon={<CloudDownloadIcon />} onClick={() => {
            // Create a blob with the test results
            const data = JSON.stringify({
              request: {
                headers: testRequest.headers,
                payload: (() => {
                  try {
                    return JSON.parse(testRequest.payload);
                  } catch (e) {
                    return testRequest.payload;
                  }
                })()
              },
              response: testResults,
              timestamp: new Date().toISOString()
            }, null, 2);
            const blob = new Blob([data], {
              type: 'application/json'
            });
            const url = URL.createObjectURL(blob);

            // Create a link and click it to trigger the download
            const a = document.createElement('a');
            a.href = url;
            a.download = `webhook-test-${new Date().toISOString().replace(/:/g, '-')}.json`;
            document.body.appendChild(a);
            a.click();

            // Clean up
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}>

                Export Results
              </Button>
            </Box>
          </Paper>}

      </Drawer>
    </Card>;
};
WebhookConfiguration.propTypes = {
  /**
   * Configuration value
   */
  value: PropTypes.object,
  /**
   * Callback when configuration changes
   */
  onChange: PropTypes.func,
  /**
   * Callback to test the webhook
   */
  onTest: PropTypes.func,
  /**
   * Whether the component is disabled
   */
  disabled: PropTypes.bool
};
export default WebhookConfiguration;