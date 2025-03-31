/**
 * API Source Configuration Component
 *
 * A comprehensive component for configuring API data sources with validation, 
 * authentication options, and testing capabilities.
 *
 * @component
 */

import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  Card,
  CardContent,
  Collapse,
  Divider,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  Alert,
  AlertTitle,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Select,
  InputLabel,
  FormHelperText,
  Switch,
  Tooltip,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Add as AddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Refresh as RefreshIcon,
  Code as CodeIcon,
  Security as SecurityIcon,
  Settings as SettingsIcon,
  PlayArrow as TestIcon,
  Link as LinkIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  HelpOutline as HelpIcon,
  Warning as WarningIcon,
  KeyboardArrowDown as KeyboardArrowDownIcon,
  KeyboardArrowUp as KeyboardArrowUpIcon,
  Save as SaveIcon,
} from '@mui/icons-material';

/**
 * API Source Configuration Component
 * 
 * @param {Object} props - Component props
 * @returns {JSX.Element} The API Source Configuration component
 */
const APISourceConfiguration = ({
  value = {},
  onChange = () => {},
  onTest = () => {},
  disabled = false,
}) => {
  // Configuration state
  const [config, setConfig] = useState({
    name: '',
    baseUrl: '',
    method: 'GET',
    headers: [],
    queryParams: [],
    requestBody: '',
    responseType: 'json',
    authentication: {
      type: 'none',
      apiKey: {
        key: '',
        value: '',
        addTo: 'header',
      },
      basic: {
        username: '',
        password: '',
      },
      oauth2: {
        clientId: '',
        clientSecret: '',
        tokenUrl: '',
        authUrl: '',
        scope: '',
      },
      bearer: {
        token: '',
      },
    },
    dataPath: '',
    pollingInterval: 3600,
    validateSSL: true,
    timeout: 30,
    retry: {
      enabled: false,
      maxAttempts: 3,
      backoffFactor: 2,
      initialDelay: 500,
    },
    ...value,
  });

  // UI State
  const [activeTab, setActiveTab] = useState(0);
  const [testResults, setTestResults] = useState(null);
  const [testingInProgress, setTestingInProgress] = useState(false);
  const [error, setError] = useState(null);
  const [showPasswordFields, setShowPasswordFields] = useState({});
  const [advancedSettingsOpen, setAdvancedSettingsOpen] = useState(false);
  const [showJsonEditor, setShowJsonEditor] = useState(false);
  const [rawJson, setRawJson] = useState('');
  const [jsonError, setJsonError] = useState(null);
  const [headerToAdd, setHeaderToAdd] = useState({ key: '', value: '' });
  const [paramToAdd, setParamToAdd] = useState({ key: '', value: '' });

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

  /**
   * Handle change in basic configuration fields
   * 
   * @param {string} field - Field name
   * @param {any} value - New value
   */
  const handleChange = useCallback((field, value) => {
    setConfig((prev) => ({
      ...prev,
      [field]: value,
    }));
  }, []);

  /**
   * Handle change in authentication settings
   * 
   * @param {string} authType - Authentication type
   * @param {string} field - Field name
   * @param {any} value - New value
   */
  const handleAuthChange = useCallback((authType, field, value) => {
    setConfig((prev) => ({
      ...prev,
      authentication: {
        ...prev.authentication,
        [authType]: {
          ...prev.authentication[authType],
          [field]: value,
        },
      },
    }));
  }, []);

  /**
   * Handle adding a new header
   */
  const handleAddHeader = useCallback(() => {
    if (!headerToAdd.key.trim()) {
      setError('Header key cannot be empty');
      return;
    }

    setConfig((prev) => ({
      ...prev,
      headers: [
        ...prev.headers,
        { key: headerToAdd.key.trim(), value: headerToAdd.value }
      ],
    }));
    setHeaderToAdd({ key: '', value: '' });
    setError(null);
  }, [headerToAdd]);

  /**
   * Handle removing a header
   * 
   * @param {number} index - Index of the header to remove
   */
  const handleRemoveHeader = useCallback((index) => {
    setConfig((prev) => ({
      ...prev,
      headers: prev.headers.filter((_, i) => i !== index),
    }));
  }, []);

  /**
   * Handle adding a new query parameter
   */
  const handleAddParam = useCallback(() => {
    if (!paramToAdd.key.trim()) {
      setError('Parameter key cannot be empty');
      return;
    }

    setConfig((prev) => ({
      ...prev,
      queryParams: [
        ...prev.queryParams,
        { key: paramToAdd.key.trim(), value: paramToAdd.value }
      ],
    }));
    setParamToAdd({ key: '', value: '' });
    setError(null);
  }, [paramToAdd]);

  /**
   * Handle removing a query parameter
   * 
   * @param {number} index - Index of the parameter to remove
   */
  const handleRemoveParam = useCallback((index) => {
    setConfig((prev) => ({
      ...prev,
      queryParams: prev.queryParams.filter((_, i) => i !== index),
    }));
  }, []);

  /**
   * Toggle password visibility
   * 
   * @param {string} field - Field name
   */
  const togglePasswordVisibility = useCallback((field) => {
    setShowPasswordFields((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  }, []);

  /**
   * Update retry configuration
   * 
   * @param {string} field - Field name
   * @param {any} value - New value
   */
  const handleRetryChange = useCallback((field, value) => {
    setConfig((prev) => ({
      ...prev,
      retry: {
        ...prev.retry,
        [field]: value,
      },
    }));
  }, []);

  /**
   * Handle authentication type change
   * 
   * @param {Event} event - Change event
   */
  const handleAuthTypeChange = useCallback((event) => {
    const newAuthType = event.target.value;
    setConfig((prev) => ({
      ...prev,
      authentication: {
        ...prev.authentication,
        type: newAuthType,
      },
    }));
  }, []);

  /**
   * Handle JSON editor change
   * 
   * @param {Event} event - Change event
   */
  const handleJsonChange = useCallback((event) => {
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
   * Test the API connection
   */
  const handleTest = useCallback(async () => {
    setTestingInProgress(true);
    setTestResults(null);
    setError(null);

    try {
      const results = await onTest(config);
      setTestResults(results);
    } catch (err) {
      setError(err.message || 'Error testing API connection');
      setTestResults({
        success: false,
        message: err.message || 'Unknown error',
      });
    } finally {
      setTestingInProgress(false);
    }
  }, [config, onTest]);

  /**
   * Validate the URL format
   * 
   * @param {string} url - URL to validate
   * @returns {boolean} Whether the URL is valid
   */
  const isValidUrl = useCallback((url) => {
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  }, []);

  /**
   * Check if configuration is valid and can be tested
   * 
   * @returns {boolean} Whether the configuration is valid
   */
  const canTest = config.baseUrl && isValidUrl(config.baseUrl);

  // Method options for the API
  const methodOptions = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];

  // Response type options
  const responseTypeOptions = ['json', 'text', 'blob', 'arraybuffer'];

  // Authentication type options
  const authTypes = [
    { value: 'none', label: 'No Authentication' },
    { value: 'apiKey', label: 'API Key' },
    { value: 'basic', label: 'Basic Auth' },
    { value: 'oauth2', label: 'OAuth 2.0' },
    { value: 'bearer', label: 'Bearer Token' },
  ];

  // API Key placement options
  const apiKeyAddToOptions = [
    { value: 'header', label: 'Header' },
    { value: 'query', label: 'Query Parameter' },
  ];

  return (
    <Card variant="outlined">
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h5" component="div" sx={{ display: 'flex', alignItems: 'center' }}>
            <LinkIcon sx={{ mr: 1 }} />
            API Source Configuration
          </Typography>
          <Box>
            <Tooltip title="Show JSON Editor">
              <IconButton 
                onClick={() => setShowJsonEditor(!showJsonEditor)}
                color={showJsonEditor ? 'primary' : 'default'}
              >
                <CodeIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Test Connection">
              <span>
                <IconButton 
                  onClick={handleTest}
                  disabled={!canTest || disabled || testingInProgress}
                  color="primary"
                >
                  {testingInProgress ? <CircularProgress size={24} /> : <TestIcon />}
                </IconButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        {showJsonEditor ? (
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              multiline
              rows={20}
              label="Configuration JSON"
              value={rawJson}
              onChange={handleJsonChange}
              error={!!jsonError}
              helperText={jsonError}
              sx={{ fontFamily: 'monospace' }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button 
                      onClick={applyJsonChanges}
                      disabled={!!jsonError}
                      variant="contained"
                      startIcon={<SaveIcon />}
                    >
                      Apply
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        ) : (
          <>
            <Tabs 
              value={activeTab} 
              onChange={(e, newValue) => setActiveTab(newValue)}
              sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
            >
              <Tab label="Basic" />
              <Tab label="Headers & Params" />
              <Tab label="Authentication" />
              <Tab label="Advanced" />
            </Tabs>

            {/* Basic Tab */}
            <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="API Name"
                    value={config.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    disabled={disabled}
                    helperText="A descriptive name for this API source"
                  />
                </Grid>
                <Grid item xs={12} sm={8}>
                  <TextField
                    fullWidth
                    label="Base URL"
                    value={config.baseUrl}
                    onChange={(e) => handleChange('baseUrl', e.target.value)}
                    disabled={disabled}
                    error={config.baseUrl && !isValidUrl(config.baseUrl)}
                    helperText={
                      config.baseUrl && !isValidUrl(config.baseUrl)
                        ? 'Please enter a valid URL'
                        : 'The base URL of the API (e.g., https://api.example.com/v1)'
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4}>
                  <FormControl fullWidth disabled={disabled}>
                    <InputLabel>Method</InputLabel>
                    <Select
                      value={config.method}
                      label="Method"
                      onChange={(e) => handleChange('method', e.target.value)}
                    >
                      {methodOptions.map((method) => (
                        <MenuItem key={method} value={method}>
                          {method}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>HTTP method for the request</FormHelperText>
                  </FormControl>
                </Grid>
                {config.method === 'POST' || config.method === 'PUT' || config.method === 'PATCH' ? (
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={5}
                      label="Request Body"
                      value={config.requestBody}
                      onChange={(e) => handleChange('requestBody', e.target.value)}
                      disabled={disabled}
                      helperText="JSON body to send with the request"
                      sx={{ fontFamily: 'monospace' }}
                    />
                  </Grid>
                ) : null}
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Data Path"
                    value={config.dataPath}
                    onChange={(e) => handleChange('dataPath', e.target.value)}
                    disabled={disabled}
                    helperText="JSON path to extract data from the response (e.g., 'data.items' or leave empty for the entire response)"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth disabled={disabled}>
                    <InputLabel>Response Type</InputLabel>
                    <Select
                      value={config.responseType}
                      label="Response Type"
                      onChange={(e) => handleChange('responseType', e.target.value)}
                    >
                      {responseTypeOptions.map((type) => (
                        <MenuItem key={type} value={type}>
                          {type.toUpperCase()}
                        </MenuItem>
                      ))}
                    </Select>
                    <FormHelperText>Expected response format from the API</FormHelperText>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    type="number"
                    label="Polling Interval (seconds)"
                    value={config.pollingInterval}
                    onChange={(e) => handleChange('pollingInterval', parseInt(e.target.value, 10) || 3600)}
                    disabled={disabled}
                    InputProps={{ inputProps: { min: 1 } }}
                    helperText="How often to poll this API for new data (in seconds)"
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Headers & Params Tab */}
            <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    HTTP Headers
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
                    {config.headers.length > 0 ? (
                      <Box sx={{ mb: 2 }}>
                        {config.headers.map((header, index) => (
                          <Box 
                            key={index} 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              mb: 1, 
                              p: 1,
                              borderRadius: 1,
                              bgcolor: 'background.default'
                            }}
                          >
                            <Typography variant="body2" sx={{ flex: 2, fontWeight: 'bold' }}>
                              {header.key}
                            </Typography>
                            <Typography variant="body2" sx={{ flex: 3, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {header.key.toLowerCase() === 'authorization' ? '••••••••' : header.value}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => handleRemoveHeader(index)}
                              disabled={disabled}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        No headers configured. Add headers below.
                      </Typography>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={5}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Header Name"
                          value={headerToAdd.key}
                          onChange={(e) => setHeaderToAdd({ ...headerToAdd, key: e.target.value })}
                          disabled={disabled}
                          placeholder="Content-Type"
                        />
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Value"
                          value={headerToAdd.value}
                          onChange={(e) => setHeaderToAdd({ ...headerToAdd, value: e.target.value })}
                          disabled={disabled}
                          placeholder="application/json"
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={handleAddHeader}
                          disabled={disabled || !headerToAdd.key.trim()}
                          startIcon={<AddIcon />}
                        >
                          Add
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Query Parameters
                  </Typography>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    {config.queryParams.length > 0 ? (
                      <Box sx={{ mb: 2 }}>
                        {config.queryParams.map((param, index) => (
                          <Box 
                            key={index} 
                            sx={{ 
                              display: 'flex', 
                              alignItems: 'center', 
                              mb: 1, 
                              p: 1,
                              borderRadius: 1,
                              bgcolor: 'background.default'
                            }}
                          >
                            <Typography variant="body2" sx={{ flex: 2, fontWeight: 'bold' }}>
                              {param.key}
                            </Typography>
                            <Typography variant="body2" sx={{ flex: 3, overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {param.key.toLowerCase().includes('key') || param.key.toLowerCase().includes('token') ? 
                                '••••••••' : param.value}
                            </Typography>
                            <IconButton 
                              size="small" 
                              onClick={() => handleRemoveParam(index)}
                              disabled={disabled}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        ))}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        No query parameters configured. Add parameters below.
                      </Typography>
                    )}

                    <Divider sx={{ my: 2 }} />

                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={5}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Parameter Name"
                          value={paramToAdd.key}
                          onChange={(e) => setParamToAdd({ ...paramToAdd, key: e.target.value })}
                          disabled={disabled}
                          placeholder="limit"
                        />
                      </Grid>
                      <Grid item xs={12} sm={5}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Value"
                          value={paramToAdd.value}
                          onChange={(e) => setParamToAdd({ ...paramToAdd, value: e.target.value })}
                          disabled={disabled}
                          placeholder="100"
                        />
                      </Grid>
                      <Grid item xs={12} sm={2}>
                        <Button
                          fullWidth
                          variant="outlined"
                          onClick={handleAddParam}
                          disabled={disabled || !paramToAdd.key.trim()}
                          startIcon={<AddIcon />}
                        >
                          Add
                        </Button>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            {/* Authentication Tab */}
            <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <FormControl component="fieldset">
                    <Typography variant="h6" gutterBottom>
                      Authentication Type
                    </Typography>
                    <RadioGroup
                      aria-label="authentication-type"
                      name="authentication-type"
                      value={config.authentication.type}
                      onChange={handleAuthTypeChange}
                    >
                      {authTypes.map((type) => (
                        <FormControlLabel
                          key={type.value}
                          value={type.value}
                          control={<Radio disabled={disabled} />}
                          label={type.label}
                        />
                      ))}
                    </RadioGroup>
                  </FormControl>
                </Grid>

                {/* API Key Authentication */}
                {config.authentication.type === 'apiKey' && (
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        API Key Authentication
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="API Key Name"
                            value={config.authentication.apiKey.key}
                            onChange={(e) => handleAuthChange('apiKey', 'key', e.target.value)}
                            disabled={disabled}
                            helperText="The name of the API key parameter"
                            placeholder="X-API-Key"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="API Key Value"
                            type={showPasswordFields.apiKey ? 'text' : 'password'}
                            value={config.authentication.apiKey.value}
                            onChange={(e) => handleAuthChange('apiKey', 'value', e.target.value)}
                            disabled={disabled}
                            helperText="The value of the API key"
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => togglePasswordVisibility('apiKey')}
                                    edge="end"
                                  >
                                    {showPasswordFields.apiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <FormControl fullWidth disabled={disabled}>
                            <InputLabel>Add to</InputLabel>
                            <Select
                              value={config.authentication.apiKey.addTo}
                              label="Add to"
                              onChange={(e) => handleAuthChange('apiKey', 'addTo', e.target.value)}
                            >
                              {apiKeyAddToOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                  {option.label}
                                </MenuItem>
                              ))}
                            </Select>
                            <FormHelperText>Where to include the API key</FormHelperText>
                          </FormControl>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                )}

                {/* Basic Authentication */}
                {config.authentication.type === 'basic' && (
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Basic Authentication
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Username"
                            value={config.authentication.basic.username}
                            onChange={(e) => handleAuthChange('basic', 'username', e.target.value)}
                            disabled={disabled}
                            helperText="Username for Basic Auth"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Password"
                            type={showPasswordFields.basicPassword ? 'text' : 'password'}
                            value={config.authentication.basic.password}
                            onChange={(e) => handleAuthChange('basic', 'password', e.target.value)}
                            disabled={disabled}
                            helperText="Password for Basic Auth"
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => togglePasswordVisibility('basicPassword')}
                                    edge="end"
                                  >
                                    {showPasswordFields.basicPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                )}

                {/* OAuth 2.0 Authentication */}
                {config.authentication.type === 'oauth2' && (
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        OAuth 2.0 Authentication
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Client ID"
                            value={config.authentication.oauth2.clientId}
                            onChange={(e) => handleAuthChange('oauth2', 'clientId', e.target.value)}
                            disabled={disabled}
                            helperText="OAuth 2.0 Client ID"
                          />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Client Secret"
                            type={showPasswordFields.clientSecret ? 'text' : 'password'}
                            value={config.authentication.oauth2.clientSecret}
                            onChange={(e) => handleAuthChange('oauth2', 'clientSecret', e.target.value)}
                            disabled={disabled}
                            helperText="OAuth 2.0 Client Secret"
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => togglePasswordVisibility('clientSecret')}
                                    edge="end"
                                  >
                                    {showPasswordFields.clientSecret ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Token URL"
                            value={config.authentication.oauth2.tokenUrl}
                            onChange={(e) => handleAuthChange('oauth2', 'tokenUrl', e.target.value)}
                            disabled={disabled}
                            helperText="URL to obtain the access token (e.g., https://api.example.com/oauth/token)"
                            error={config.authentication.oauth2.tokenUrl && !isValidUrl(config.authentication.oauth2.tokenUrl)}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Authorization URL"
                            value={config.authentication.oauth2.authUrl}
                            onChange={(e) => handleAuthChange('oauth2', 'authUrl', e.target.value)}
                            disabled={disabled}
                            helperText="URL for user authorization (optional for client credentials flow)"
                            error={config.authentication.oauth2.authUrl && !isValidUrl(config.authentication.oauth2.authUrl)}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Scope"
                            value={config.authentication.oauth2.scope}
                            onChange={(e) => handleAuthChange('oauth2', 'scope', e.target.value)}
                            disabled={disabled}
                            helperText="Space-separated list of scopes (e.g., 'read write')"
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                )}

                {/* Bearer Token Authentication */}
                {config.authentication.type === 'bearer' && (
                  <Grid item xs={12}>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <Typography variant="subtitle1" gutterBottom>
                        Bearer Token Authentication
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Bearer Token"
                            type={showPasswordFields.bearerToken ? 'text' : 'password'}
                            value={config.authentication.bearer.token}
                            onChange={(e) => handleAuthChange('bearer', 'token', e.target.value)}
                            disabled={disabled}
                            helperText="The bearer token value"
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => togglePasswordVisibility('bearerToken')}
                                    edge="end"
                                  >
                                    {showPasswordFields.bearerToken ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                  </IconButton>
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                      </Grid>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>

            {/* Advanced Tab */}
            <Box sx={{ display: activeTab === 3 ? 'block' : 'none' }}>
              <Grid container spacing={3}>
                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={config.validateSSL}
                              onChange={(e) => handleChange('validateSSL', e.target.checked)}
                              disabled={disabled}
                            />
                          }
                          label="Validate SSL Certificates"
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          type="number"
                          label="Timeout (seconds)"
                          value={config.timeout}
                          onChange={(e) => handleChange('timeout', parseInt(e.target.value, 10) || 30)}
                          disabled={disabled}
                          InputProps={{ inputProps: { min: 1 } }}
                          helperText="Request timeout in seconds"
                        />
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>

                <Grid item xs={12}>
                  <Paper variant="outlined" sx={{ p: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        Retry Configuration
                      </Typography>
                      <FormControlLabel
                        control={
                          <Switch
                            checked={config.retry.enabled}
                            onChange={(e) => handleRetryChange('enabled', e.target.checked)}
                            disabled={disabled}
                          />
                        }
                        label="Enable Retry"
                      />
                    </Box>

                    <Collapse in={config.retry.enabled}>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Max Attempts"
                            value={config.retry.maxAttempts}
                            onChange={(e) => handleRetryChange('maxAttempts', parseInt(e.target.value, 10) || 3)}
                            disabled={disabled || !config.retry.enabled}
                            InputProps={{ inputProps: { min: 1 } }}
                            helperText="Maximum number of retry attempts"
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Backoff Factor"
                            value={config.retry.backoffFactor}
                            onChange={(e) => handleRetryChange('backoffFactor', parseFloat(e.target.value) || 2)}
                            disabled={disabled || !config.retry.enabled}
                            InputProps={{ inputProps: { min: 1, step: 0.1 } }}
                            helperText="Exponential backoff factor"
                          />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                          <TextField
                            fullWidth
                            type="number"
                            label="Initial Delay (ms)"
                            value={config.retry.initialDelay}
                            onChange={(e) => handleRetryChange('initialDelay', parseInt(e.target.value, 10) || 500)}
                            disabled={disabled || !config.retry.enabled}
                            InputProps={{ inputProps: { min: 1 } }}
                            helperText="Initial retry delay in milliseconds"
                          />
                        </Grid>
                      </Grid>
                    </Collapse>
                  </Paper>
                </Grid>
              </Grid>
            </Box>
          </>
        )}

        {/* Test Results */}
        {testResults && (
          <Box sx={{ mt: 3 }}>
            <Alert 
              severity={testResults.success ? 'success' : 'error'}
              action={
                <IconButton
                  color="inherit"
                  size="small"
                  onClick={() => setTestResults(null)}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              <AlertTitle>{testResults.success ? 'Connection Successful' : 'Connection Failed'}</AlertTitle>
              {testResults.message}
            </Alert>

            {testResults.success && testResults.responsePreview && (
              <Paper variant="outlined" sx={{ mt: 2, p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Response Preview:
                </Typography>
                <Box 
                  component="pre" 
                  sx={{ 
                    p: 1, 
                    backgroundColor: 'background.default',
                    borderRadius: 1,
                    overflowX: 'auto',
                    fontSize: '0.85rem',
                    maxHeight: 300
                  }}
                >
                  {typeof testResults.responsePreview === 'string' 
                    ? testResults.responsePreview 
                    : JSON.stringify(testResults.responsePreview, null, 2)}
                </Box>
              </Paper>
            )}
          </Box>
        )}

        {/* Error Message */}
        {error && !testResults && (
          <Alert 
            severity="error" 
            sx={{ mt: 3 }}
            onClose={() => setError(null)}
          >
            {error}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

APISourceConfiguration.propTypes = {
  /**
   * Configuration value
   */
  value: PropTypes.object,
  
  /**
   * Callback when configuration changes
   */
  onChange: PropTypes.func,
  
  /**
   * Callback to test the API connection
   */
  onTest: PropTypes.func,
  
  /**
   * Whether the component is disabled
   */
  disabled: PropTypes.bool,
};

export default APISourceConfiguration;