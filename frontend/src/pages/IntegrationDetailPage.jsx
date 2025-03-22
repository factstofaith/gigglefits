// IntegrationDetailPage.jsx
// -----------------------------------------------------------------------------
// Page to display details of a specific integration and manage field mappings

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  IconButton,
  Tabs,
  Tab,
  CircularProgress,
  Breadcrumbs,
  Link,
  Divider
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PlayArrow as RunIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';

import FieldMappingEditor from '../components/integration/FieldMappingEditor';
import IntegrationHealthBar from '../components/common/IntegrationHealthBar';
import IntegrationStatsBar from '../components/common/IntegrationStatsBar';
import StatusDisplay from '../components/common/StatusDisplay';
import IntegrationDetailView from '../components/integration/IntegrationDetailView';
import UserRoleSwitcher from '../components/integration/UserRoleSwitcher';

import {
  getIntegrationById,
  getIntegrationHistory,
  runIntegration,
  deleteIntegration
} from '../services/integrationService';

// TabPanel component for tab content
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
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Convert status to chip color
const getStatusColor = (status) => {
  switch(status) {
    case 'success': return 'success';
    case 'warning': return 'warning';
    case 'error': return 'error';
    case 'running': return 'info';
    default: return 'default';
  }
};

export default function IntegrationDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [integration, setIntegration] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState({
    integration: true,
    history: true,
    running: false
  });
  // Set the initial tab value based on URL state, default to 0 (field mappings)
  const initialTab = location.state?.tab === 'history' ? 1 : 0;
  const [tabValue, setTabValue] = useState(initialTab);
  const [error, setError] = useState(null);

  // Fetch integration details
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(prev => ({ ...prev, integration: true }));
        const data = await getIntegrationById(id);
        setIntegration(data);
      } catch (error) {
        console.error('Error fetching integration:', error);
        setError('Failed to load integration details. Please try again.');
      } finally {
        setLoading(prev => ({ ...prev, integration: false }));
      }
    };

    fetchData();
  }, [id]);

  // Fetch integration history
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(prev => ({ ...prev, history: true }));
        const data = await getIntegrationHistory(id);
        setHistory(data);
      } catch (error) {
        console.error('Error fetching integration history:', error);
        // Don't set error state here to avoid blocking the whole page
      } finally {
        setLoading(prev => ({ ...prev, history: false }));
      }
    };

    fetchHistory();
  }, [id]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Run the integration
  const handleRunIntegration = async () => {
    try {
      setLoading(prev => ({ ...prev, running: true }));
      await runIntegration(id);
      
      // Refresh history after running
      const data = await getIntegrationHistory(id);
      setHistory(data);
      
      // Show success message (in a real app, you'd use a notification system)
      alert('Integration run started successfully');
    } catch (error) {
      console.error('Error running integration:', error);
      alert('Failed to run integration. Please try again.');
    } finally {
      setLoading(prev => ({ ...prev, running: false }));
    }
  };

  // Delete the integration
  const handleDeleteIntegration = async () => {
    if (!window.confirm('Are you sure you want to delete this integration? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteIntegration(id);
      navigate('/integrations');
    } catch (error) {
      console.error('Error deleting integration:', error);
      alert('Failed to delete integration. Please try again.');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle user role changes for testing
  const handleRoleChange = (role) => {
    console.log(`User role changed to: ${role}`);
    // Refresh the page to update permissions
    window.location.reload();
  };

  // If using the new IntegrationDetailView component
  if (id && integration) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {/* Development helper to switch between roles */}
        <UserRoleSwitcher onRoleChange={handleRoleChange} />
        
        <IntegrationDetailView integrationId={id} />
      </Container>
    );
  }

  // Fallback to original implementation
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <StatusDisplay
        loading={loading.integration}
        error={error}
        isEmpty={!integration}
        emptyMessage="Integration not found"
        onRetry={() => window.location.reload()}
      >
        {integration && (
          <>
            {/* Breadcrumb navigation */}
            <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
        <Link underline="hover" color="inherit" href="/">
          Home
        </Link>
        <Link underline="hover" color="inherit" href="/integrations">
          Integrations
        </Link>
        <Typography color="text.primary">{integration.name}</Typography>
      </Breadcrumbs>
      
      {/* Header with actions */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Box display="flex" alignItems="center">
          <IconButton 
            onClick={() => navigate('/integrations')}
            aria-label="Back to integrations"
            sx={{ mr: 1 }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            {integration.name}
          </Typography>
          <Chip 
            label={integration.type} 
            color="primary" 
            size="small" 
            variant="outlined"
            sx={{ ml: 2 }}
          />
          <Chip 
            label={integration.health || 'unknown'} 
            color={getStatusColor(integration.health)}
            size="small"
            sx={{ ml: 1 }}
          />
        </Box>
        <Box>
          <Button
            variant="contained"
            color="primary"
            startIcon={<RunIcon />}
            onClick={handleRunIntegration}
            disabled={loading.running}
            sx={{ mr: 1 }}
          >
            {loading.running ? 'Running...' : 'Run Now'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            sx={{ mr: 1 }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteIntegration}
          >
            Delete
          </Button>
        </Box>
      </Box>
      
      {/* Integration summary */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Source
              </Typography>
              <Typography variant="body1" gutterBottom>
                {integration.source}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary">
                Destination
              </Typography>
              <Typography variant="body1" gutterBottom>
                {integration.destination}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary">
                Schedule
              </Typography>
              <Typography variant="body1" gutterBottom>
                {integration.schedule}
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle2" color="text.secondary">
                Last Run
              </Typography>
              <Typography variant="body1" gutterBottom>
                {history[0] ? formatDate(history[0].start_time) : 'Never'}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary">
                Created
              </Typography>
              <Typography variant="body1" gutterBottom>
                {integration.created_at ? formatDate(integration.created_at) : 'Unknown'}
              </Typography>
              
              <Typography variant="subtitle2" color="text.secondary">
                Last Updated
              </Typography>
              <Typography variant="body1" gutterBottom>
                {integration.updated_at ? formatDate(integration.updated_at) : 'Unknown'}
              </Typography>
            </Grid>
          </Grid>
          
          {/* Stats visualization */}
          <Divider sx={{ my: 2 }} />
          <Box sx={{ mb: 2 }}>
            <IntegrationHealthBar health={integration.health} />
          </Box>
          
          <IntegrationStatsBar 
            stats={[
              { label: 'Success Rate', value: '92%' },
              { label: 'Avg. Duration', value: '3.5m' },
              { label: 'Records Processed', value: history[0]?.records_processed || 0 }
            ]}
          />
        </CardContent>
      </Card>
      
      {/* Tabs for different sections */}
      <Box sx={{ width: '100%' }}>
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="Field Mappings" />
          <Tab label="Run History" />
          <Tab label="Settings" />
        </Tabs>
        
        {/* Field Mappings Tab */}
        <TabPanel value={tabValue} index={0}>
          <FieldMappingEditor 
            integrationId={id} 
            onUpdate={() => {/* Refresh integration details if needed */}}
          />
        </TabPanel>
        
        {/* Run History Tab */}
        <TabPanel value={tabValue} index={1}>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="h6">Run History</Typography>
            <Button 
              startIcon={<RefreshIcon />}
              size="small"
              onClick={async () => {
                setLoading(prev => ({ ...prev, history: true }));
                try {
                  const data = await getIntegrationHistory(id);
                  setHistory(data);
                } finally {
                  setLoading(prev => ({ ...prev, history: false }));
                }
              }}
              disabled={loading.history}
            >
              Refresh
            </Button>
          </Box>
          
          <StatusDisplay
            loading={loading.history}
            isEmpty={history.length === 0}
            emptyMessage="No run history available"
          >
            {history.length > 0 && (
            <Box>
              {history.map((run, index) => (
                <Card key={run.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Status
                        </Typography>
                        <Chip 
                          label={run.status} 
                          color={getStatusColor(run.status)}
                          size="small"
                        />
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Start Time
                        </Typography>
                        <Typography variant="body2">
                          {formatDate(run.start_time)}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="subtitle2" color="text.secondary">
                          End Time
                        </Typography>
                        <Typography variant="body2">
                          {run.end_time ? formatDate(run.end_time) : 'Running...'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={3}>
                        <Typography variant="subtitle2" color="text.secondary">
                          Records Processed
                        </Typography>
                        <Typography variant="body2">
                          {run.records_processed || '-'}
                        </Typography>
                      </Grid>
                      
                      {run.warnings && run.warnings.length > 0 && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="warning.main">
                            Warnings:
                          </Typography>
                          <ul>
                            {run.warnings.map((warning, i) => (
                              <li key={i}><Typography variant="body2">{warning}</Typography></li>
                            ))}
                          </ul>
                        </Grid>
                      )}
                      
                      {run.error && (
                        <Grid item xs={12}>
                          <Typography variant="subtitle2" color="error">
                            Error:
                          </Typography>
                          <Typography variant="body2">{run.error}</Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              ))}
            </Box>
            )}
          </StatusDisplay>
        </TabPanel>
        
        {/* Settings Tab */}
        <TabPanel value={tabValue} index={2}>
          <Typography variant="h6" gutterBottom>
            Integration Settings
          </Typography>
          <Typography color="text.secondary">
            Settings management will be implemented in a future update.
          </Typography>
        </TabPanel>
      </Box>
          </>
        )}
      </StatusDisplay>
    </Container>
  );
}