/**
 * Test SharePoint Configuration Component
 *
 * A simple component for testing the SharePoint configuration functionality.
 *
 * @component
 */

import React, { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
} from '@mui/material';

// Import the SharePoint configuration component
import SharePointConfiguration from '../SharePointConfiguration';

/**
 * Test component for SharePoint Configuration
 */
const TestSharePointConfiguration = () => {
  // Test state
  const [config, setConfig] = useState({
    credentials: {
      tenantId: '',
      authMethod: 'oauth',
      clientId: '',
      clientSecret: '',
    },
    site: null,
    library: null,
    folder: null,
    file: null,
  });
  
  // UI state
  const [readOnly, setReadOnly] = useState(false);
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        SharePoint Configuration Test
      </Typography>
      
      <Typography variant="body1" paragraph>
        This page allows testing of the SharePoint configuration component with Microsoft Graph API integration.
      </Typography>
      
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              Control Panel
            </Typography>
            <FormControlLabel
              control={
                <Switch
                  checked={readOnly}
                  onChange={(e) => setReadOnly(e.target.checked)}
                />
              }
              label="Read Only Mode"
            />
          </Box>
          
          <Button
            variant="outlined"
            color="secondary"
            onClick={() => {
              // Reset configuration
              setConfig({
                credentials: {
                  tenantId: '',
                  authMethod: 'oauth',
                  clientId: '',
                  clientSecret: '',
                },
                site: null,
                library: null,
                folder: null,
                file: null,
              });
            }}
            sx={{ mr: 2 }}
          >
            Reset
          </Button>
          
          <Button
            variant="outlined"
            onClick={() => {
              // Set test values
              setConfig({
                credentials: {
                  tenantId: 'contoso.onmicrosoft.com',
                  authMethod: 'oauth',
                  clientId: '12345678-1234-1234-1234-123456789012',
                  clientSecret: 'testsecret',
                },
                site: null,
                library: null,
                folder: null,
                file: null,
              });
            }}
          >
            Load Test Data
          </Button>
        </CardContent>
      </Card>
      
      <Box sx={{ mb: 4 }}>
        <SharePointConfiguration
          value={config}
          onChange={setConfig}
          readOnly={readOnly}
        />
      </Box>
      
      <Paper variant="outlined" sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Current Configuration
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2">
          Raw Configuration Object:
        </Typography>
        
        <Box
          component="pre"
          sx={{
            p: 2,
            mt: 2,
            bgcolor: 'background.default',
            borderRadius: 1,
            overflow: 'auto',
            maxHeight: '400px',
          }}
        >
          {JSON.stringify(config, null, 2)}
        </Box>
      </Paper>
    </Container>
  );
};

export default TestSharePointConfiguration;