
import {
  ErrorBoundary,
  useErrorHandler,
  withErrorBoundary } from "@/error-handling/";
import React, { useState, useCallback, useEffect } from 'react';
import { useErrorContext } from "@/error-handling/";
import { useDockerNetworkErrorHandler, useHealthCheckHandler, HealthCheckProvider } from "@/error-handling/docker";
import { Container, Typography, Box, Paper, Button, Tabs, Tab } from "@/design-system/optimized";import { useParams } from 'react-router-dom'; // Import components
import IntegrationFlowCanvas from "@/components/integration/flow/IntegrationFlowCanvas";import AzureBlobConfiguration from "@/components/integration/AzureBlobConfiguration";

/**
 * Integration Detail Page - Shows details for a specific integration
 */
const IntegrationDetailPage = () => {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);
  const [configTab, setConfigTab] = useState(0);
  const [readOnly, setReadOnly] = useState(true);
  const [flowElements, setFlowElements] = useState([]);

  // Configuration state
  const [sourceConfig, setSourceConfig] = useState({
    authMethod: 'connectionString',
    connectionString: 'DefaultEndpointsProtocol=https;AccountName=devstoreaccount1;AccountKey=Eby8vdM02xNOcqFlqUwJPLlmEtlCDXJ1OUzFT50uSRZ6IFsuFq2UVErCz4I6tq/K1SZFPTOtr/KBHBeksoGMGw==;EndpointSuffix=core.windows.net',
    containerName: 'datasets',
    filePattern: '*.csv',
    path: 'daily/',
    createContainerIfNotExists: true
  });
  const [configErrors, setConfigErrors] = useState({
    source: {},
    destination: {}
  });

  // Mock user permissions for demonstration
  const userPermissions = ['database.read', 'database.write', 'script.execute', 'ai.access', 'admin.access'];

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleConfigTabChange = (event, newValue) => {
    setConfigTab(newValue);
  };

  const handleSourceConfigChange = (newConfig) => {
    setSourceConfig(newConfig);

    // Simple validation
    const errors = {};
    if (newConfig.authMethod === 'connectionString' && !newConfig.connectionString) {
      errors.connectionString = 'Connection string is required';
    } else if (newConfig.authMethod === 'accountKey') {
      if (!newConfig.accountName) errors.accountName = 'Account name is required';
      if (!newConfig.accountKey) errors.accountKey = 'Account key is required';
    } else if (newConfig.authMethod === 'sasToken') {
      if (!newConfig.accountName) errors.accountName = 'Account name is required';
      if (!newConfig.sasToken) errors.sasToken = 'SAS token is required';
    } else if (newConfig.authMethod === 'managedIdentity' && !newConfig.accountName) {
      errors.accountName = 'Account name is required for managed identity';
    }

    if (!newConfig.containerName) {
      errors.containerName = 'Container name is required';
    }

    setConfigErrors({
      ...configErrors,
      source: errors
    });
  };

  const handleEditToggle = useCallback(() => {
    setReadOnly(!readOnly);
  }, [readOnly]);

  const handleFlowSave = useCallback((elements) => {
    console.log('Saving flow:', elements);
    // Here you would save the flow to your backend
    setFlowElements(elements);
  }, []);

  const handleFlowRun = useCallback((elements) => {
    console.log('Running flow:', elements);
    // Here you would trigger the flow execution
  }, []);

  const handleFlowChange = useCallback((elements) => {
    // Handle flow changes without saving
    setFlowElements(elements);
  }, []);

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Integration Details
        </Typography>
        
        <Typography variant="subtitle1" color="textSecondary" gutterBottom>
          ID: {id}
        </Typography>
        
        <Box display="flex" justifyContent="flex-end" mb={2}>
          <Button
            variant="outlined"
            color={readOnly ? "primary" : "success"}
            sx={{ mr: 1 }}
            onClick={handleEditToggle}>

            {readOnly ? "Edit" : "Editing..."}
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleFlowRun(flowElements)}>

            Run Now
          </Button>
        </Box>
        
        <Paper sx={{ mb: 4 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="integration tabs">
            <Tab label="Overview" />
            <Tab label="Flow Designer" />
            <Tab label="Configuration" />
            <Tab label="History" />
            <Tab label="Monitoring" />
          </Tabs>
          
          <Box>
            {activeTab === 0 &&
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Integration Overview
                </Typography>
                <Typography paragraph>
                  This integration is configured to sync data between systems.
                </Typography>
              </Box>}

            
            {activeTab === 1 &&
            <Box sx={{ height: '70vh' }}>
                <IntegrationFlowCanvas
                initialElements={flowElements}
                readOnly={readOnly}
                userPermissions={userPermissions}
                onSave={handleFlowSave}
                onRun={handleFlowRun}
                onChange={handleFlowChange} />

              </Box>}

            
            {activeTab === 2 &&
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Configuration Details
                </Typography>
                
                <Box mt={3}>
                  <Tabs value={configTab} onChange={handleConfigTabChange} aria-label="configuration tabs">
                    <Tab label="Source" />
                    <Tab label="Destination" />
                    <Tab label="Advanced" />
                  </Tabs>
                  
                  {configTab === 0 &&
                <Box mt={2}>
                      <AzureBlobConfiguration
                    config={sourceConfig}
                    onChange={handleSourceConfigChange}
                    errors={configErrors.source || {}}
                    readOnly={readOnly}
                    isSuperUser={userPermissions.includes('admin.access')} />

                    </Box>}

                  
                  {configTab === 1 &&
                <Box mt={2}>
                      <Typography variant="body1">
                        Configure destination settings here. This will be replaced with actual destination configuration components.
                      </Typography>
                    </Box>}

                  
                  {configTab === 2 &&
                <Box mt={2}>
                      <Typography variant="body1">
                        Advanced configuration options such as error handling, validation, and notification settings.
                      </Typography>
                    </Box>}

                </Box>
              </Box>}

            
            {activeTab === 3 &&
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Execution History
                </Typography>
                <Typography paragraph>
                  View past runs and their outcomes.
                </Typography>
              </Box>}

            
            {activeTab === 4 &&
            <Box sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Monitoring & Alerts
                </Typography>
                <Typography paragraph>
                  Configure monitoring settings and alerts.
                </Typography>
              </Box>}

          </Box>
        </Paper>
      </Box>
    </Container>);

};

IntegrationDetailPage;const IntegrationDetailPageWithErrorBoundary = (props) => <ErrorBoundary boundary="IntegrationDetailPage" fallback={({ error, resetError }) => <div className="error-container">
            <h3>Error in IntegrationDetailPage</h3>
            <p>{error.message}</p>
            <button onClick={resetError}>Retry</button>
          </div>}>
        <IntegrationDetailPage {...props} />
      </ErrorBoundary>;export default IntegrationDetailPageWithErrorBoundary;