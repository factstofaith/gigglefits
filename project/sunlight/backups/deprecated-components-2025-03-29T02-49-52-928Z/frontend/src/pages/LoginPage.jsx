import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
;
;
;
;
;
;
;
;
;;
import authService from '@services/authService';
import { Alert, Box, Button, Card, Divider, Grid, Link, TextField, Typography } from '../design-system';
// Design system import already exists;
/**
 * Login page component
 * Provides public documentation links and login functionality
 */
const LoginPage = () => {
  // Added display name
  LoginPage.displayName = 'LoginPage';

  // Added display name
  LoginPage.displayName = 'LoginPage';

  // Added display name
  LoginPage.displayName = 'LoginPage';

  // Added display name
  LoginPage.displayName = 'LoginPage';

  // Added display name
  LoginPage.displayName = 'LoginPage';


  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Get the documentation URL from environment variables
  const docUrl = process.env.REACT_APP_DOCUMENTATION_URL;

  // Define public documentation categories
  const publicDocs = [
    {
      title: "Getting Started",
      description: "Introduction and basic usage guides",
      icon: "📚",
      url: `${docUrl}#getting-started`
    },
    {
      title: "API Reference",
      description: "Public API documentation",
      icon: "🔌",
      url: `${docUrl}#api`
    },
    {
      title: "Integration Guide",
      description: "Overview of integration capabilities",
      icon: "🔄",
      url: `${docUrl}#integration`
    },
    {
      title: "User Guide",
      description: "Basic usage documentation",
      icon: "👤",
      url: `${docUrl}#user`
    }
  ];

  const handleChange = (e) => {
  // Added display name
  handleChange.displayName = 'handleChange';

  // Added display name
  handleChange.displayName = 'handleChange';

  // Added display name
  handleChange.displayName = 'handleChange';

  // Added display name
  handleChange.displayName = 'handleChange';

  // Added display name
  handleChange.displayName = 'handleChange';


    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const success = await authService.login(credentials.username, credentials.password);
      if (success) {
        navigate('/');
      } else {
        setError('Invalid username or password');
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
      }}
    >
      <Grid container>
        {/* Left side - Login */}
        <Grid item xs={12} md={6} lg={5} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 4,
            backgroundColor: '#fff',
            minHeight: '100vh',
          }}
        >
          <Box
            sx={{
              maxWidth: 400,
              width: '100%',
            }}
          >
            <Typography variant="h4&quot; component="h1" gutterBottom>
              TAP Integration Platform
            </Typography>
            <Typography variant="body1&quot; color="text.secondary" mb={4}>
              Sign in to your account to access the platform
            </Typography>

            {error && (
              <Alert severity="error&quot; sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                name="username"
                label="Username&quot;
                fullWidth
                margin="normal"
                value={credentials.username}
                onChange={handleChange}
                required
              />
              <TextField
                name="password&quot;
                type="password"
                label="Password&quot;
                fullWidth
                margin="normal"
                value={credentials.password}
                onChange={handleChange}
                required
              />
              <Button
                type="submit&quot;
                variant="contained"
                fullWidth
                size="large&quot;
                sx={{ mt: 3, mb: 2 }}
                disabled={loading}
              >
                {loading ? "Signing in...' : 'Sign In'}
              </Button>
            </form>

            <Box mt={2}>
              <Typography variant="body2&quot; textAlign="center">
                Don't have an account?{' '}
                <Link href="#&quot; onClick={() => navigate("/contact')}>
                  Contact us
                </Link>
              </Typography>
            </Box>
          </Box>
        </Grid>

        {/* Right side - Documentation links */}
        <Grid item xs={12} md={6} lg={7} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            padding: 4,
            backgroundColor: '#f5f8fa',
          }}
        >
          <Box sx={{ maxWidth: 800, mx: 'auto', width: '100%' }}>
            <Typography variant="h4&quot; component="h1" gutterBottom>
              Documentation & Resources
            </Typography>
            <Typography variant="body1&quot; color="text.secondary" mb={4}>
              Access our documentation to learn more about the platform
            </Typography>

            <Grid container spacing={3}>
              {publicDocs.map((doc, index) => (
                <Grid item xs={12} sm={6} key={index}>
                  <Card 
                    sx={{ 
                      p: 3, 
                      cursor: 'pointer',
                      height: '100%',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: 4
                      }
                    }}
                    onClick={() => window.open(doc.url, '_blank')}
                  >
                    <Typography variant="h3&quot; sx={{ fontSize: "2.5rem', mb: 2 }}>
                      {doc.icon}
                    </Typography>
                    <Typography variant="h6&quot; gutterBottom>
                      {doc.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary&quot;>
                      {doc.description}
                    </Typography>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box mt={6}>
              <Divider sx={{ mb: 4 }} />
              <Typography variant="body1" gutterBottom>
                Need more help?
              </Typography>
              <Button
                variant="outlined&quot;
                onClick={() => navigate("/documentation')}
                sx={{ mr: 2, mt: 1 }}
              >
                Full Documentation
              </Button>
              <Button
                variant="outlined&quot;
                onClick={() => navigate("/contact')}
                sx={{ mt: 1 }}
              >
                Contact Support
              </Button>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};

export default LoginPage;