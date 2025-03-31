import React, { useState } from 'react';
import { Box, Typography, Paper, Container, Divider } from '@mui/material';
import { TextFormatting } from './nodes';

/**
 * Demonstration component for TextFormatting node
 * 
 * This component showcases the TextFormatting node in a standalone environment
 * for testing and demonstration purposes.
 */
const TextFormattingDemo = () => {
  const [config, setConfig] = useState({
    inputField: 'messageField',
    outputField: 'formattedMessage',
    operation: 'trim',
    searchValue: '',
    replaceValue: '',
    startIndex: 0,
    endIndex: null,
    length: 10,
    padChar: ' ',
    additionalFields: [],
    separator: ' ',
    template: 'Hello, {{value}}!',
    useRegex: false,
    caseSensitive: true,
    treatAsNull: ['null', 'undefined', '']
  });

  const handleConfigChange = (newConfig) => {
    setConfig(newConfig);
    console.log('Configuration updated:', newConfig);
  };

  return (
    <Container maxWidth="md">
      <Paper sx={{ p: 3, my: 3 }}>
        <Typography variant="h4" gutterBottom>
          Text Formatting Demo
        </Typography>
        <Typography variant="body1" paragraph>
          This demo showcases the TextFormatting transformation node, which provides various text manipulation operations.
          Try changing the operation and configuration below to see how the component works.
        </Typography>
        <Divider sx={{ my: 2 }} />
        
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Configuration Panel
          </Typography>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <TextFormatting 
              id="demo-text-formatting-node"
              testId="demo-text-formatting-node"
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

export default TextFormattingDemo;