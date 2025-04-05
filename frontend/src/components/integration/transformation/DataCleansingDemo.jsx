import React, { useState } from 'react';
import { Container, Typography, TextField, Paper, Box, Grid } from '@mui/material';
import DataCleansing from './nodes/DataCleansing';

/**
 * Demo component for the DataCleansing transformation node
 * 
 * This component provides a user-friendly interface to test and demonstrate
 * the DataCleansing node functionality with sample data input and real-time
 * cleansing result display.
 */
import { withErrorBoundary } from "@/error-handling/withErrorBoundary";
const DataCleansingDemo = () => {
  // Sample configuration for basic cleansing operations
  const [config, setConfig] = useState({
    inputField: 'sampleInput',
    outputField: 'cleanedOutput',
    cleansingOperations: [{
      type: 'trim',
      id: '1'
    }, {
      type: 'removeExtraSpaces',
      id: '2'
    }, {
      type: 'removeHtml',
      id: '3'
    }],
    applyToNullValues: false,
    treatEmptyAsNull: true,
    nullReplacement: '',
    validateEmail: false,
    validateUrl: false,
    validatePhone: false,
    validatePostalCode: false,
    region: 'US'
  });

  // Handle configuration changes from the node
  const handleConfigChange = newConfig => {
    setConfig(newConfig);
  };
  return <Container maxWidth="lg" sx={{
    pt: 4,
    pb: 8
  }}>
      <Typography variant="h4" gutterBottom align="center">
        Data Cleansing Transformation Demo
      </Typography>
      
      <Typography variant="body1" paragraph sx={{
      mb: 3
    }}>
        This demo showcases the DataCleansing transformation node, which provides comprehensive
        text data cleansing capabilities. It supports multiple cleansing operations that can
        be applied in sequence, with validation options and null value handling.
      </Typography>
      
      <Box sx={{
      mt: 4
    }}>
        <Paper elevation={3} sx={{
        p: 3,
        mb: 4
      }}>
          <Typography variant="h6" gutterBottom>
            Configuration
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Configure the data cleansing operations below. You can add multiple operations that will be
            applied in sequence from top to bottom.
          </Typography>
          
          <DataCleansing initialConfig={config} onConfigChange={handleConfigChange} />

        </Paper>
        
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              About this Component
            </Typography>
            <Typography variant="body2" paragraph>
              The DataCleansing component provides a powerful set of text cleansing operations:
            </Typography>
            
            <Box component="ul" sx={{
            pl: 2
          }}>
              <Typography component="li" variant="body2">
                <strong>Multiple Operations:</strong> Apply a sequence of cleansing operations in order
              </Typography>
              <Typography component="li" variant="body2">
                <strong>Comprehensive Options:</strong> 15 different cleansing operations available
              </Typography>
              <Typography component="li" variant="body2">
                <strong>Real-time Preview:</strong> Visualize results as you configure operations
              </Typography>
              <Typography component="li" variant="body2">
                <strong>Null Value Handling:</strong> Configure behavior for null or empty values
              </Typography>
              <Typography component="li" variant="body2">
                <strong>Data Validation:</strong> Optional validation for emails, URLs, phone numbers, and postal codes
              </Typography>
              <Typography component="li" variant="body2">
                <strong>Region-specific Validation:</strong> Customize validation rules based on region
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Container>;
};
export default DataCleansingDemo;