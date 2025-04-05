
import {
  ErrorBoundary,
  useErrorHandler,
  withErrorBoundary } from "@/error-handling/";

import React from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Container, Grid, Paper } from "@/design-system/optimized";
import { useUser } from "@/contexts/UserContext";
/**
* Home Page component - Main landing page after login
*/
import { useHealthCheckHandler } from "@/error-handling/docker";
import { HealthCheckProvider } from "@/error-handling/docker";
const HomePage = () => {
  const { state: user } = useUser();

  return (
    <Container maxWidth="lg">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Welcome to TAP Integration Platform
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom>
          {user?.name ? `Hello, ${user.name}!` : 'Hello!'}
        </Typography>
        
        <Grid container spacing={3} mt={2}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Integrations
              </Typography>
              <Typography variant="body2" paragraph>
                Manage and monitor your data integrations.
              </Typography>
              <Link to="/integrations">View Integrations</Link>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Earnings
              </Typography>
              <Typography variant="body2" paragraph>
                Manage earnings codes and mappings.
              </Typography>
              <Link to="/earnings">View Earnings</Link>
            </Paper>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="h6" gutterBottom>
                Admin Tools
              </Typography>
              <Typography variant="body2" paragraph>
                Administration and configuration options.
              </Typography>
              <Link to="/admin">Open Admin Dashboard</Link>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>);

};

HomePage;const HomePageWithErrorBoundary = (props) => <ErrorBoundary boundary="HomePage" fallback={({ error, resetError }) => <div className="error-container">
            <h3>Error in HomePage</h3>
            <p>{error.message}</p>
            <button onClick={resetError}>Retry</button>
          </div>}>
        <HomePage {...props} />
      </ErrorBoundary>;export default HomePageWithErrorBoundary;