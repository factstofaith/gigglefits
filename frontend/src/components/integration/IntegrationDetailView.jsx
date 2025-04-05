
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ErrorBoundary, useErrorHandler, withErrorBoundary } from '@/error-handling';
import { 
  Box, 
  Button, 
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  Paper,
  Tab,
  Tabs,
  Typography 
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HistoryIcon from '@mui/icons-material/History';
import SettingsIcon from '@mui/icons-material/Settings';

// Import configuration components
import AzureBlobConfiguration from './AzureBlobConfiguration';
import ScheduleConfiguration from './ScheduleConfiguration';

// Import services
import { getIntegrationById, updateIntegration, runIntegration } from '@/services/integrationService';
import authService from '@/services/authService';

// Enhanced TabPanel component for tab content with responsive behavior
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
    role="tabpanel"
    hidden={value !== index}
    id={`integration-tabpanel-${index}`}
    aria-labelledby={`integration-tab-${index}`}
    {...other}>

      {value === index &&
      <Box>
          {children}
        </Box>}

    </div>);

}

const IntegrationDetailView = ({ integrationId }) => {  // Error handling
  const { error: apiError, handleError, clearError, wrapPromise } = useErrorHandler('IntegrationDetailView');
  const [formError, setFormError] = useState(null);
  const [integration, setIntegration] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [saving, setSaving] = useState(false);
  const [runningIntegration, setRunningIntegration] = useState(false);

  // Fetch integration data
  useEffect(() => {
    const isMounted = { current: true };
    const controller = new AbortController();

    const fetchIntegration = async () => {
      try {
        setLoading(true);
        const data = await getIntegrationById(integrationId, { signal: controller.signal });

        // Only update state if component is still mounted
        if (!isMounted.current) return;

        // Initialize with default configs if not present
        if (!data.azureBlobConfig) {
          data.azureBlobConfig = {
            authMethod: 'connectionString',
            containerName: ''
          };
        }

        if (!data.schedule || typeof data.schedule === 'string') {
          data.schedule = {
            type: data.schedule || 'onDemand',
            cronExpression: '',
            timezone: 'UTC'
          };
        }

        setIntegration(data);
        setLoading(false);
      } catch (err) {
        if (!isMounted.current) return;

        // Don't set error state for aborted requests
        if (err.name !== 'AbortError') {
          handleError(err, { action: 'fetchIntegration', integrationId });
          setError('Failed to load integration details');
          setLoading(false);
        }
      }
    };

    const checkUserRole = async () => {
      try {
        const isAdmin = await authService.isAdmin();
        if (isMounted.current) {
          setIsSuperUser(isAdmin);
        }
      } catch (err) {
        console.error('Error checking user role:', err);
      }
    };

    fetchIntegration();
    checkUserRole();

    // Clean up function for when component unmounts
    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, [integrationId]);

  // Handle tab changes - memoize to prevent recreation on each render
  const handleTabChange = useCallback((event, newValue) => {
    setActiveTab(newValue);
  }, []);

  // Handle edit mode toggle - memoize to prevent recreation on each render
  const toggleEditMode = useCallback(() => {
    setIsEditing((prevState) => !prevState);
  }, []);

  // Handle Azure Blob configuration changes - memoize to prevent recreation on each render
  const handleBlobConfigChange = useCallback((config) => {
    setIntegration((prev) => ({
      ...prev,
      azureBlobConfig: config
    }));
  }, []);

  // Handle schedule changes - memoize to prevent recreation on each render
  const handleScheduleChange = useCallback((schedule) => {
    setIntegration((prev) => ({
      ...prev,
      schedule
    }));
  }, []);

  // Save integration changes - memoize to prevent recreation on each render
  const handleSave = useCallback(async () => {
    const isMounted = { current: true };
    const controller = new AbortController();

    try {
      setSaving(true);
      await updateIntegration(integrationId, integration, { signal: controller.signal });

      if (isMounted.current) {
        setIsEditing(false);
        setSaving(false);
      }
    } catch (err) {
      if (!isMounted.current) return;

      // Don't set error state for aborted requests
      if (err.name !== 'AbortError') {
        setError('Failed to save changes');
        setSaving(false);
      }
    }

    return () => {
      isMounted.current = false;
      controller.abort();
    };
  }, [integrationId, integration]);

  // Run integration - memoize to prevent recreation on each render
  const handleRunIntegration = useCallback(async () => {
    const isMounted = { current: true };
    const controller = new AbortController();
    let timer = null;

    try {
      setRunningIntegration(true);
      await runIntegration(integrationId, { signal: controller.signal });

      // In a real app, you might want to poll for status updates
      // or redirect to a run history page
      timer = setTimeout(() => {
        if (isMounted.current) {
          setRunningIntegration(false);
        }
      }, 2000);
    } catch (err) {
      if (!isMounted.current) return;

      // Don't set error state for aborted requests
      if (err.name !== 'AbortError') {
        setError('Failed to run integration');
        setRunningIntegration(false);
      }
    }

    return () => {
      isMounted.current = false;
      if (timer) clearTimeout(timer);
      controller.abort();
    };
  }, [integrationId]);

  // Show loading state
  if (loading) {
    return (
      <Box sx={{
        display: 'flex',
        justifyContent: 'center',
        p: { xs: 2, sm: 3, md: 4 }
      }}>
        <CircularProgress />
      </Box>);

  }

  // Show error state
  if (error || apiError) {
    const displayError = error || apiError;
    return (
      <Paper sx={{
        p: { xs: 2, sm: 3 },
        m: { xs: 1, sm: 2 },
        bgcolor: 'error.light',
        color: 'error.contrastText'
      }}>
        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
          {displayError.message || displayError.toString()}
        </Typography>
        <Button
          sx={{ mt: 2 }}
          variant="outlined"
          size="small"
          color="inherit"
          onClick={() => {
            clearError();
            window.location.reload();
          }}>
          Reload
        </Button>
      </Paper>
    );
  }

  // Check if Azure Blob is used as source or destination
  const isAzureBlobUsed =
  integration?.source === 'Azure Blob Container' ||
  integration?.destination === 'Azure Blob Container';

  return (
    <Card sx={{ mx: { xs: 1, sm: 2, md: 3 }, mt: { xs: 1, sm: 2 } }}>
      <CardHeader
      title={
      <Typography
      variant="h5"
      sx={{
        fontSize: { xs: '1.25rem', sm: '1.5rem' },
        wordBreak: 'break-word'
      }}>

            {integration?.name || 'Integration Details'}
          </Typography>}

      subheader={
      <Typography
      variant="subtitle1"
      color="text.secondary"
      sx={{
        fontSize: { xs: '0.875rem', sm: '1rem' },
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 0.5
      }}>

            <span>{integration?.source || ''}</span>
            <span>→</span>
            <span>{integration?.destination || ''}</span>
          </Typography>}

      sx={{
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'flex-start', sm: 'center' },
        '.MuiCardHeader-action': {
          m: { xs: '16px 0 0 0', sm: 0 }
        }
      }}
      action={
      <Box sx={{
        display: 'flex',
        gap: 1,
        flexWrap: { xs: 'wrap', sm: 'nowrap' },
        width: { xs: '100%', sm: 'auto' }
      }}>
            <Button
        variant="contained"
        color="primary"
        startIcon={<PlayArrowIcon />}
        onClick={handleRunIntegration}
        disabled={runningIntegration}
        size={{ xs: 'small', sm: 'medium' }}
        sx={{ flexGrow: { xs: 1, sm: 0 } }}>

              {runningIntegration ? 'Running...' : 'Run Now'}
            </Button>
            <IconButton
        onClick={toggleEditMode}
        color={isEditing ? 'primary' : 'default'}
        size={{ xs: 'small', sm: 'medium' }}>

              <EditIcon />
            </IconButton>
          </Box>} />


      
      <Divider />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', overflow: 'auto' }}>
        <Tabs
        value={activeTab}
        onChange={handleTabChange}
        aria-label="integration tabs"
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        sx={{
          minHeight: { xs: '48px', sm: 'inherit' },
          '& .MuiTab-root': {
            minHeight: { xs: '48px', sm: 'inherit' },
            fontSize: { xs: '0.75rem', sm: '0.875rem' },
            p: { xs: '6px 12px', sm: '12px 16px' }
          }
        }}>

          <Tab
          label="Overview"
          icon={<SettingsIcon fontSize="small" />}
          iconPosition="start" />

          <Tab
          label="Configuration"
          icon={<SettingsIcon fontSize="small" />}
          iconPosition="start"
          disabled={!isAzureBlobUsed} />

          <Tab
          label="Schedule"
          icon={<HistoryIcon fontSize="small" />}
          iconPosition="start" />

        </Tabs>
      </Box>
      
      <CardContent sx={{ px: { xs: 2, sm: 3 }, py: { xs: 2, sm: 3 } }}>
        {/* Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={{ xs: 2, sm: 3 }}>
            <Grid item xs={12} md={6}>
              <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                height: '100%'
              }}>

                <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  pb: 1
                }}>

                  Basic Information
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    <Typography
                    variant="body2"
                    sx={{ fontWeight: 'medium', minWidth: { xs: '80px', sm: '100px' } }}>

                      Type:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {integration?.type}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    <Typography
                    variant="body2"
                    sx={{ fontWeight: 'medium', minWidth: { xs: '80px', sm: '100px' } }}>

                      Source:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {integration?.source}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    <Typography
                    variant="body2"
                    sx={{ fontWeight: 'medium', minWidth: { xs: '80px', sm: '100px' } }}>

                      Destination:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {integration?.destination}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    <Typography
                    variant="body2"
                    sx={{ fontWeight: 'medium', minWidth: { xs: '80px', sm: '100px' } }}>

                      Created:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(integration?.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    <Typography
                    variant="body2"
                    sx={{ fontWeight: 'medium', minWidth: { xs: '80px', sm: '100px' } }}>

                      Updated:
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(integration?.updatedAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper
              elevation={0}
              sx={{
                p: { xs: 2, sm: 3 },
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
              }}>

                <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: 'bold',
                  mb: 2,
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  pb: 1
                }}>

                  Description
                </Typography>
                <Typography
                variant="body2"
                color="text.secondary"
                sx={{ whiteSpace: 'pre-wrap' }}>

                  {integration?.description || 'No description provided.'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Configuration Tab */}
        <TabPanel value={activeTab} index={1}>
          {isAzureBlobUsed ?
          <AzureBlobConfiguration
          config={integration?.azureBlobConfig}
          onChange={handleBlobConfigChange}
          readOnly={!isEditing}
          isSuperUser={isSuperUser} /> :


          <Typography color="textSecondary">
              No additional configuration needed for the selected source/destination.
            </Typography>}

        </TabPanel>
        
        {/* Schedule Tab */}
        <TabPanel value={activeTab} index={2}>
          <ScheduleConfiguration
          schedule={integration?.schedule}
          onChange={handleScheduleChange}
          readOnly={!isEditing} />

        </TabPanel>
      </CardContent>
      
      {isEditing &&
      <Box sx={{
        display: 'flex',
        justifyContent: { xs: 'center', sm: 'flex-end' },
        flexDirection: { xs: 'column', sm: 'row' },
        p: { xs: 2, sm: 3 },
        gap: { xs: 1, sm: 2 }
      }}>
          <Button
        onClick={toggleEditMode}
        sx={{
          width: { xs: '100%', sm: 'auto' }
        }}
        variant="outlined">

            Cancel
          </Button>
          <Button
        variant="contained"
        color="primary"
        onClick={handleSave}
        disabled={saving}
        sx={{
          width: { xs: '100%', sm: 'auto' }
        }}>

            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>}

    </Card>);

};

export default withErrorBoundary(IntegrationDetailView, {
  boundary: 'IntegrationDetailView',
  fallback: ({ error, resetError }) => (
    <Paper sx={{ 
      p: { xs: 2, sm: 3 }, 
      m: { xs: 1, sm: 2 }, 
      bgcolor: 'error.light',
      color: 'error.contrastText' 
    }}>
      <Typography variant="h6" gutterBottom>Integration Error</Typography>
      <Typography variant="body1" sx={{ mb: 2 }}>
        {error?.message || 'An error occurred while loading the integration details.'}
      </Typography>
      <Button 
        variant="outlined" 
        color="inherit" 
        size="small"
        onClick={resetError}
      >
        Try Again
      </Button>
    </Paper>
  )
});