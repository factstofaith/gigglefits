
import {
  ErrorBoundary,
  useErrorHandler,
  withErrorBoundary } from "@/error-handling/";
import React from 'react';import { Container, Typography, Box, Paper, Tabs, Tab } from "@/design-system/optimized"; /**
* Earnings Page - Manages earnings codes and mappings
*/import { useHealthCheckHandler } from "@/error-handling/docker";import { HealthCheckProvider } from "@/error-handling/docker";const EarningsPage = () => {const [activeTab, setActiveTab] = React.useState(0);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Earnings Management
        </Typography>
        
        <Paper sx={{ mb: 4 }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="earnings tabs">
            <Tab label="Earnings Codes" />
            <Tab label="Mappings" />
            <Tab label="Employees" />
          </Tabs>
          
          <Box sx={{ p: 3 }}>
            {activeTab === 0 &&
            <Box>
                <Typography variant="h6" gutterBottom>
                  Earnings Codes
                </Typography>
                <Typography paragraph>
                  Manage earnings codes and their attributes.
                </Typography>
              </Box>}

            
            {activeTab === 1 &&
            <Box>
                <Typography variant="h6" gutterBottom>
                  Earnings Mappings
                </Typography>
                <Typography paragraph>
                  Configure mappings between source and target systems.
                </Typography>
              </Box>}

            
            {activeTab === 2 &&
            <Box>
                <Typography variant="h6" gutterBottom>
                  Employee Management
                </Typography>
                <Typography paragraph>
                  Manage employee records and assignments.
                </Typography>
              </Box>}

          </Box>
        </Paper>
      </Box>
    </Container>);

};

EarningsPage;const EarningsPageWithErrorBoundary = (props) => <ErrorBoundary boundary="EarningsPage" fallback={({ error, resetError }) => <div className="error-container">
            <h3>Error in EarningsPage</h3>
            <p>{error.message}</p>
            <button onClick={resetError}>Retry</button>
          </div>}>
        <EarningsPage {...props} />
      </ErrorBoundary>;export default EarningsPageWithErrorBoundary;