import { ErrorBoundary, useErrorHandler, withErrorBoundary } from '../../error-handling';
import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Paper, Button, Grid, Card, CardContent, CardActions, IconButton, Tooltip, Stack } from '../design-system/optimized';
import { Add as AddIcon, PlayArrow as PlayIcon, Edit as EditIcon, Delete as DeleteIcon, Info as InfoIcon, Tour as TourIcon } from '@mui/icons-material';

// Import components
import IntegrationCreationDialog from '../components/integration/IntegrationCreationDialog';
import ContextualHelp from '../components/common/ContextualHelp';

// Import custom hooks
import { useContextualHelp } from '../hooks';

// Mock data for integrations
import { ENV } from "@/utils/environmentConfig";
const MOCK_INTEGRATIONS = [{
  id: '1',
  name: 'Sales Data Sync',
  description: 'Sync sales data from CRM to data warehouse',
  type: 'data_sync',
  status: 'active',
  lastRun: '2025-03-29T14:32:00Z'
}, {
  id: '2',
  name: 'Customer Data Transformation',
  description: 'Transform customer data for analytics',
  type: 'data_transformation',
  status: 'inactive',
  lastRun: null
}];

/**
 * Integrations Page - Lists all available integrations
 */
const IntegrationsPage = () => {
  const navigate = useNavigate();
  const [integrations, setIntegrations] = useState(MOCK_INTEGRATIONS);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const {
    getHelp,
    startTour,
    isTourCompleted
  } = useContextualHelp('integration');

  // Start the tour when the page loads if it hasn't been completed
  useEffect(() => {
    // Auto-start the tour for first-time users if needed
    if (!isTourCompleted('basics') && ENV.NODE_ENV === 'development') {

      // In development, we'll just show the tour button
      // In production, we could auto-start: startTour('basics');
    }
  }, [isTourCompleted, startTour]);
  // Handle creating a new integration
  const handleCreateIntegration = useCallback(integrationData => {
    // In a real app, you would send this to your backend
    console.log('Creating integration:', integrationData);

    // Add to our local state for now (mock)
    const newIntegration = {
      ...integrationData,
      id: `${Date.now()}`,
      status: 'inactive',
      lastRun: null
    };
    setIntegrations(prevIntegrations => [...prevIntegrations, newIntegration]);

    // Navigate to the detail page for the new integration
    navigate(`/integrations/${newIntegration.id}`);
  }, [navigate]);

  // Handle navigating to integration details
  const handleViewIntegration = useCallback(id => {
    navigate(`/integrations/${id}`);
  }, [navigate]);

  // Handle editing an integration
  const handleEditIntegration = useCallback(id => {
    navigate(`/integrations/${id}?edit=true`);
  }, [navigate]);

  // Handle running an integration
  const handleRunIntegration = useCallback(id => {
    console.log('Running integration:', id);
    // In a real app, you would trigger the integration execution
  }, []);

  // Handle deleting an integration
  const handleDeleteIntegration = useCallback(id => {
    console.log('Deleting integration:', id);

    // Remove from our local state (mock)
    setIntegrations(prevIntegrations => prevIntegrations.filter(integration => integration.id !== id));
  }, []);

  // Get type label
  const getTypeLabel = typeValue => {
    const types = {
      'data_sync': 'Data Synchronization',
      'data_transformation': 'Data Transformation',
      'data_validation': 'Data Validation',
      'data_migration': 'Data Migration'
    };
    return types[typeValue] || typeValue;
  };
  return <Container maxWidth="lg">
      <Box my={4}>
        <Stack direction="row" alignItems="center" spacing={1} mb={2}>
          <Typography variant="h4" component="h1">
            Integrations
          </Typography>
          <ContextualHelp id="integrations-page-help" title="Integrations Overview" content={getHelp('overview')?.content || "Integrations allow you to connect different systems and define how data flows between them. You can create, edit, and manage all your integrations from this page."} type="popover" size="small" relatedLinks={[{
          label: "Learn more about integrations",
          onClick: () => console.log("Open integrations docs")
        }]} />


          <Button variant="text" size="small" startIcon={<TourIcon />} onClick={() => startTour('basics')} sx={{
          ml: 'auto'
        }} color={isTourCompleted('basics') ? 'success' : 'primary'}>

            {isTourCompleted('basics') ? 'Tour Completed' : 'Take Tour'}
          </Button>
        </Stack>
        
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button variant="contained" color="primary" startIcon={<AddIcon />} onClick={() => setIsCreateDialogOpen(true)} className="create-integration-button">

            Create New Integration
          </Button>
        </Box>
        
        {integrations.length === 0 ? <Paper sx={{
        p: 3,
        textAlign: 'center'
      }}>
            <Typography variant="subtitle1" gutterBottom>
              You don't have any integrations yet
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Create your first integration to get started
            </Typography>
            <Button variant="outlined" color="primary" startIcon={<AddIcon />} onClick={() => setIsCreateDialogOpen(true)} sx={{
          mt: 2
        }}>

              Create Integration
            </Button>
          </Paper> : <Grid container spacing={3} className="integration-list">
            {integrations.map(integration => <Grid item xs={12} sm={6} md={4} key={integration.id}>
                <Card>
                  <CardContent>
                    <Box display="flex" alignItems="center" mb={1}>
                      <Typography variant="h6" component="h2" sx={{
                  flexGrow: 1
                }}>
                        {integration.name}
                      </Typography>
                      <Box sx={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: integration.status === 'active' ? 'success.main' : 'text.disabled',
                  mr: 1
                }} />

                    </Box>
                    
                    <Typography variant="body2" color="textSecondary" gutterBottom>
                      {integration.description}
                    </Typography>
                    
                    <Box mt={2}>
                      <Typography variant="caption" display="block" color="textSecondary">
                        Type: {getTypeLabel(integration.type)}
                      </Typography>
                      {integration.lastRun && <Typography variant="caption" display="block" color="textSecondary">
                          Last Run: {new Date(integration.lastRun).toLocaleString()}
                        </Typography>}

                    </Box>
                  </CardContent>
                  <CardActions>
                    <Tooltip title="View Details">
                      <Button size="small" onClick={() => handleViewIntegration(integration.id)}>

                        Details
                      </Button>
                    </Tooltip>
                    <Box sx={{
                flexGrow: 1
              }} />
                    <Tooltip title="Run Integration">
                      <IconButton size="small" onClick={() => handleRunIntegration(integration.id)}>

                        <PlayIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit Integration">
                      <IconButton size="small" onClick={() => handleEditIntegration(integration.id)}>

                        <EditIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete Integration">
                      <IconButton size="small" onClick={() => handleDeleteIntegration(integration.id)}>

                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </CardActions>
                </Card>
              </Grid>)}

          </Grid>}

      </Box>
      
      {/* Integration Creation Dialog */}
      <IntegrationCreationDialog open={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} onSubmit={handleCreateIntegration} />

    </Container>;
};
IntegrationsPage;
const IntegrationsPageWithErrorBoundary = props => <ErrorBoundary boundary="IntegrationsPage" fallback={({
  error,
  resetError
}) => <div className="error-container">
            <h3>Error in IntegrationsPage</h3>
            <p>{error.message}</p>
            <button onClick={resetError}>Retry</button>
          </div>}>
        <IntegrationsPage {...props} />
      </ErrorBoundary>;
export default IntegrationsPageWithErrorBoundary;