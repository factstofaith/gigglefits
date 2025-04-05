/**
 * Test S3 Configuration Component
 * 
 * A simple test component to verify the implementation of the S3Configuration component.
 */

import React, { useState } from 'react';
import { Box, Container, Paper, Typography, Divider, Grid, Button, Switch, FormControlLabel } from '@mui/material';

// Import the component to test
import S3Configuration from '../S3Configuration';
import { withErrorBoundary } from "@/error-handling/withErrorBoundary";
const TestS3Configuration = () => {
  // State to store the configuration
  const [config, setConfig] = useState({
    credentials: null,
    region: 'us-east-1',
    bucket: '',
    path: '',
    selectedObject: null
  });

  // UI State
  const [readOnly, setReadOnly] = useState(false);

  // Handle configuration change
  const handleConfigChange = newConfig => {
    console.log('Configuration changed:', newConfig);
    setConfig(newConfig);
  };

  // Toggle read-only mode
  const toggleReadOnly = () => {
    setReadOnly(!readOnly);
  };
  return <Container maxWidth="lg" sx={{
    my: 4
  }}>
      <Paper sx={{
      p: 3
    }}>
        <Typography variant="h4" gutterBottom>
          S3 Configuration Component Test
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          This page allows testing the S3Configuration component in isolation.
        </Typography>
        
        <Box sx={{
        mb: 3,
        display: 'flex',
        justifyContent: 'flex-end'
      }}>
          <FormControlLabel control={<Switch checked={readOnly} onChange={toggleReadOnly} name="readOnly" />} label="Read-only mode" />

        </Box>
        
        <Divider sx={{
        mb: 3
      }} />
        
        {/* Component under test */}
        <S3Configuration onChange={handleConfigChange} value={config} readOnly={readOnly} />

        
        <Divider sx={{
        my: 3
      }} />
        
        {/* Debug view of the configuration */}
        <Typography variant="h6" gutterBottom>
          Current Configuration:
        </Typography>
        <Paper variant="outlined" sx={{
        p: 2,
        bgcolor: 'background.default'
      }}>
          <pre style={{
          margin: 0,
          overflow: 'auto'
        }}>
            {JSON.stringify(config, null, 2)}
          </pre>
        </Paper>
      </Paper>
    </Container>;
};
export default TestS3Configuration;