/**
 * Test API & Webhook Configuration Component
 *
 * A simple component for testing the API and webhook configuration functionality.
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
  Tabs,
  Tab,
} from '@mui/material';

// Import the configuration components
import APISourceConfiguration from '../APISourceConfiguration';
import WebhookConfiguration from '../WebhookConfiguration';

/**
 * Test component for API and Webhook Configuration
 */
const TestAPIWebhookConfiguration = () => {
  // Test state
  const [apiConfig, setApiConfig] = useState({
    name: 'Sample API',
    baseUrl: 'https://api.example.com/v1',
    method: 'GET',
    headers: [
      { key: 'Content-Type', value: 'application/json' },
      { key: 'Accept', value: 'application/json' }
    ],
    queryParams: [
      { key: 'limit', value: '100' }
    ],
    authentication: {
      type: 'none'
    }
  });
  
  const [webhookConfig, setWebhookConfig] = useState({
    name: 'Sample Webhook',
    description: 'A webhook for receiving data updates',
    endpointId: 'sample-webhook-endpoint',
    security: {
      type: 'token',
      token: {
        value: 'secret-token-value',
        headerName: 'X-Webhook-Token',
      }
    }
  });
  
  // UI state
  const [readOnly, setReadOnly] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  
  // Test handlers
  const handleTestApi = async (config) => {
    // In a real app, this would make an API call to test the connection
    console.log('Testing API with config:', config);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return simulated result
    return {
      success: true,
      message: 'Successfully connected to API',
      responsePreview: {
        status: 'success',
        data: {
          items: [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' }
          ],
          total: 2,
          page: 1,
          limit: 100
        }
      }
    };
  };
  
  const handleTestWebhook = async (config) => {
    // In a real app, this would make an API call to test the webhook
    console.log('Testing webhook with config:', config);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return simulated result
    return {
      success: true,
      message: 'Webhook endpoint created successfully',
      endpointUrl: `https://api.example.com/webhooks/${config.endpointId}`
    };
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        API & Webhook Configuration Test
      </Typography>
      
      <Typography variant="body1" paragraph>
        This page allows testing of the API source and webhook configuration components.
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
              setApiConfig({
                name: '',
                baseUrl: '',
                method: 'GET',
                headers: [],
                queryParams: [],
                authentication: {
                  type: 'none'
                }
              });
              setWebhookConfig({
                name: '',
                description: '',
                endpointId: '',
                security: {
                  type: 'none'
                }
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
              setApiConfig({
                name: 'Test API',
                baseUrl: 'https://api.example.com/v1',
                method: 'GET',
                headers: [
                  { key: 'Content-Type', value: 'application/json' },
                  { key: 'Accept', value: 'application/json' }
                ],
                queryParams: [
                  { key: 'limit', value: '100' }
                ],
                authentication: {
                  type: 'apiKey',
                  apiKey: {
                    key: 'X-API-Key',
                    value: 'test-api-key',
                    addTo: 'header'
                  }
                }
              });
              setWebhookConfig({
                name: 'Test Webhook',
                description: 'A webhook for receiving data updates',
                endpointId: 'test-webhook-endpoint',
                security: {
                  type: 'token',
                  token: {
                    value: 'test-token-value',
                    headerName: 'X-Webhook-Token',
                  }
                }
              });
            }}
          >
            Load Test Data
          </Button>
        </CardContent>
      </Card>
      
      <Tabs
        value={activeTab}
        onChange={(e, newValue) => setActiveTab(newValue)}
        sx={{ mb: 2 }}
      >
        <Tab label="API Configuration" />
        <Tab label="Webhook Configuration" />
      </Tabs>
      
      <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
        <APISourceConfiguration
          value={apiConfig}
          onChange={setApiConfig}
          onTest={handleTestApi}
          disabled={readOnly}
        />
      </Box>
      
      <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
        <WebhookConfiguration
          value={webhookConfig}
          onChange={setWebhookConfig}
          onTest={handleTestWebhook}
          disabled={readOnly}
        />
      </Box>
      
      <Paper variant="outlined" sx={{ p: 3, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          Current Configuration
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle2">
          {activeTab === 0 ? "API Configuration:" : "Webhook Configuration:"}
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
          {JSON.stringify(activeTab === 0 ? apiConfig : webhookConfig, null, 2)}
        </Box>
      </Paper>
    </Container>
  );
};

export default TestAPIWebhookConfiguration;