import React, { useState } from 'react';
import { Box, Typography, Paper, Container, Divider } from '@mui/material';
import { DataTypeConversion } from './nodes';

/**
 * Demonstration component for DataTypeConversion node
 * 
 * This component showcases the DataTypeConversion node in a standalone environment
 * for testing and demonstration purposes.
 */
const DataTypeConversionDemo = () => {
  const [config, setConfig] = useState({
    inputField: 'sourceField',
    outputField: 'targetField',
    inputType: 'string',
    outputType: 'number',
    formatString: '',
    nullPlaceholder: '',
    preserveOriginal: true,
    errorHandling: 'keepOriginal'
  });

  const handleConfigChange = (newConfig) => {
    setConfig(newConfig);
    console.log('Configuration updated:', newConfig);
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, my: 3 }}>
        <Typography variant="h4" gutterBottom>
          Data Type Conversion Demo
        </Typography>
        <Typography variant="body1" paragraph>
          This demo showcases the DataTypeConversion transformation node, which converts data between different types.
          Try changing the configuration below to see how the component works.
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Configuration Panel
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <DataTypeConversion 
              id="demo-conversion-node"
              testId="demo-conversion-node"
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

export default DataTypeConversionDemo;