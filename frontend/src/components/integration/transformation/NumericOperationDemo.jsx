import React, { useState } from 'react';
import { Box, Typography, Paper, Container, Divider } from '@mui/material';
import { NumericOperation } from './nodes';

/**
 * Demonstration component for NumericOperation node
 * 
 * This component showcases the NumericOperation node in a standalone environment
 * for testing and demonstration purposes.
 */
const NumericOperationDemo = () => {
  const [config, setConfig] = useState({
    inputField: 'amount',
    outputField: 'calculatedAmount',
    operation: 'add',
    operand: 10,
    precision: 2,
    roundingMode: 'round',
    useHighPrecision: true,
    nullValue: 0,
    handleErrors: 'error',
    fallbackValue: 0
  });

  const handleConfigChange = (newConfig) => {
    setConfig(newConfig);
    console.log('Configuration updated:', newConfig);
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, my: 3 }}>
        <Typography variant="h4" gutterBottom>
          Numeric Operation Demo
        </Typography>
        <Typography variant="body1" paragraph>
          This demo showcases the NumericOperation transformation node, which performs mathematical operations on numeric values.
          Try changing the operation and configuration below to see how the component works.
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Configuration Panel
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <NumericOperation 
              id="demo-numeric-operation-node"
              testId="demo-numeric-operation-node"
              initialConfig={config}
              onConfigChange={handleConfigChange}
            />
          </Paper>
        </Box>
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Current Configuration
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, bgcolor: 'grey.50' }}>
            <pre style={{ margin: 0, fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(config, null, 2)}
            </pre>
          </Paper>
        </Box>
      </Paper>
    </Container>
  );
};

export default NumericOperationDemo;