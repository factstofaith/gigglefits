
import {
  ErrorBoundary,
  useErrorHandler,
  withErrorBoundary } from "@/error-handling/";
import React, { useState } from 'react';
import { useErrorContext } from "@/error-handling/";
import { useDockerNetworkErrorHandler, useHealthCheckHandler, HealthCheckProvider } from "@/error-handling/docker";
import { useNavigate, useLocation } from 'react-router-dom';import { Box, TextField, Button, Typography, Paper, Container } from "@/design-system/optimized";import { useUser } from "@/contexts/UserContext";import { useNotification } from "@/contexts/NotificationContext";
/**
 * Login Page component - Handles user authentication
 */
const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { setState: setUser } = useUser();
  const { setState: setNotification } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the redirect path from location state or default to home
  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // In a real app, this would make an API call
      // For demonstration, we'll simulate authentication
      if (username === 'ai-dev' && password === 'TAPintoAI!') {
        // Successful login
        setUser({
          isAuthenticated: true,
          isAdmin: true, // This user is an admin
          name: 'AI Developer',
          email: 'ai-dev@example.com',
          id: '1234567890'
        });

        setNotification({
          type: 'success',
          message: 'Login successful!',
          open: true
        });

        // Navigate to the page the user was trying to access
        navigate(from, { replace: true });
      } else {
        // Failed login
        setNotification({
          type: 'error',
          message: 'Invalid credentials. Please try again.',
          open: true
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'An error occurred during login. Please try again.',
        open: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}>

        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: '100%'
          }}>

          <Typography component="h1" variant="h5" align="center" gutterBottom>
            Sign in to TAP Integration Platform
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="username"
              label="Username"
              name="username"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)} />

            
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)} />

            
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}>

              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>);

};

LoginPage;const LoginPageWithErrorBoundary = (props) => <ErrorBoundary boundary="LoginPage" fallback={({ error, resetError }) => <div className="error-container">
            <h3>Error in LoginPage</h3>
            <p>{error.message}</p>
            <button onClick={resetError}>Retry</button>
          </div>}>
        <LoginPage {...props} />
      </ErrorBoundary>;export default LoginPageWithErrorBoundary;