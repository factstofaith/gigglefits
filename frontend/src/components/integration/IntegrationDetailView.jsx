// IntegrationDetailView.jsx
// -----------------------------------------------------------------------------
// Component for viewing and editing integration details, including configuration

import React, { useState, useEffect } from 'react';
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
import { getIntegrationById, updateIntegration, runIntegration } from '../../services/integrationService';
import authService from '../../services/authService';

// Mock TabPanel component for tab content
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`integration-tabpanel-${index}`}
      aria-labelledby={`integration-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const IntegrationDetailView = ({ integrationId }) => {
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
    const fetchIntegration = async () => {
      try {
        setLoading(true);
        const data = await getIntegrationById(integrationId);
        
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
        setError('Failed to load integration details');
        setLoading(false);
      }
    };
    
    const checkUserRole = async () => {
      const isAdmin = await authService.isAdmin();
      setIsSuperUser(isAdmin);
    };
    
    fetchIntegration();
    checkUserRole();
  }, [integrationId]);
  
  // Handle tab changes
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  // Handle edit mode toggle
  const toggleEditMode = () => {
    setIsEditing(!isEditing);
  };
  
  // Handle Azure Blob configuration changes
  const handleBlobConfigChange = (config) => {
    setIntegration(prev => ({
      ...prev,
      azureBlobConfig: config
    }));
  };
  
  // Handle schedule changes
  const handleScheduleChange = (schedule) => {
    setIntegration(prev => ({
      ...prev,
      schedule
    }));
  };
  
  // Save integration changes
  const handleSave = async () => {
    try {
      setSaving(true);
      await updateIntegration(integrationId, integration);
      setIsEditing(false);
      setSaving(false);
    } catch (err) {
      setError('Failed to save changes');
      setSaving(false);
    }
  };
  
  // Run integration
  const handleRunIntegration = async () => {
    try {
      setRunningIntegration(true);
      await runIntegration(integrationId);
      
      // In a real app, you might want to poll for status updates
      // or redirect to a run history page
      setTimeout(() => {
        setRunningIntegration(false);
      }, 2000);
    } catch (err) {
      setError('Failed to run integration');
      setRunningIntegration(false);
    }
  };
  
  // Show loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }
  
  // Show error state
  if (error) {
    return (
      <Paper sx={{ p: 3, bgcolor: 'error.light', color: 'error.contrastText' }}>
        <Typography>{error}</Typography>
      </Paper>
    );
  }
  
  // Check if Azure Blob is used as source or destination
  const isAzureBlobUsed = 
    integration?.source === 'Azure Blob Container' || 
    integration?.destination === 'Azure Blob Container';
  
  return (
    <Card>
      <CardHeader
        title={integration?.name || 'Integration Details'}
        subheader={`${integration?.source || ''} → ${integration?.destination || ''}`}
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PlayArrowIcon />}
              onClick={handleRunIntegration}
              disabled={runningIntegration}
            >
              {runningIntegration ? 'Running...' : 'Run Now'}
            </Button>
            <IconButton 
              onClick={toggleEditMode}
              color={isEditing ? 'primary' : 'default'}
            >
              <EditIcon />
            </IconButton>
          </Box>
        }
      />
      
      <Divider />
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="integration tabs">
          <Tab label="Overview" icon={<SettingsIcon />} iconPosition="start" />
          <Tab 
            label="Configuration" 
            icon={<SettingsIcon />} 
            iconPosition="start"
            disabled={!isAzureBlobUsed} 
          />
          <Tab label="Schedule" icon={<HistoryIcon />} iconPosition="start" />
        </Tabs>
      </Box>
      
      <CardContent>
        {/* Overview Tab */}
        <TabPanel value={activeTab} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Basic Information</Typography>
              <Typography variant="body2" color="textSecondary">Type: {integration?.type}</Typography>
              <Typography variant="body2" color="textSecondary">Source: {integration?.source}</Typography>
              <Typography variant="body2" color="textSecondary">Destination: {integration?.destination}</Typography>
              <Typography variant="body2" color="textSecondary">
                Created: {new Date(integration?.createdAt).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Last Updated: {new Date(integration?.updatedAt).toLocaleString()}
              </Typography>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1">Description</Typography>
              <Typography variant="body2">
                {integration?.description || 'No description provided.'}
              </Typography>
            </Grid>
          </Grid>
        </TabPanel>
        
        {/* Configuration Tab */}
        <TabPanel value={activeTab} index={1}>
          {isAzureBlobUsed ? (
            <AzureBlobConfiguration
              config={integration?.azureBlobConfig}
              onChange={handleBlobConfigChange}
              readOnly={!isEditing}
              isSuperUser={isSuperUser}
            />
          ) : (
            <Typography color="textSecondary">
              No additional configuration needed for the selected source/destination.
            </Typography>
          )}
        </TabPanel>
        
        {/* Schedule Tab */}
        <TabPanel value={activeTab} index={2}>
          <ScheduleConfiguration
            schedule={integration?.schedule}
            onChange={handleScheduleChange}
            readOnly={!isEditing}
          />
        </TabPanel>
      </CardContent>
      
      {isEditing && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 2 }}>
          <Button onClick={toggleEditMode} sx={{ mr: 1 }}>
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Box>
      )}
    </Card>
  );
};

export default IntegrationDetailView;