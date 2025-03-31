/**
 * SpecializedFileViewerDemo Component
 * 
 * A demonstration component for testing and showcasing the SpecializedFileViewer
 * with various file types and configurations.
 */

import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Divider,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Switch,
  FormControlLabel,
  IconButton,
  Tooltip
} from '@mui/material';

import {
  UploadFile as UploadFileIcon,
  RemoveCircle as RemoveCircleIcon,
  Language as LanguageIcon,
  Article as ArticleIcon,
  DataObject as DataObjectIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  Description as DocumentIcon,
  TableChart as TableIcon,
  Code as CodeIcon
} from '@mui/icons-material';

// Import file viewer components
import SpecializedFileViewer from './SpecializedFileViewer';
import { FILE_TYPES } from '../../utils/fileTypeDetector';

/**
 * Sample data for various file types
 */
const SAMPLE_DATA = {
  CSV: 'Name,Age,Email,Country\nJohn Doe,32,john@example.com,USA\nJane Smith,28,jane@example.com,Canada\nMichael Johnson,45,michael@example.com,UK\nEmily Davis,22,emily@example.com,Australia\nRobert Wilson,39,robert@example.com,Germany',
  
  JSON: `{
  "users": [
    {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "address": {
        "street": "123 Main St",
        "city": "Boston",
        "zipCode": "02108"
      },
      "phone": "+1-555-123-4567",
      "roles": ["admin", "user"],
      "active": true
    },
    {
      "id": 2,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "address": {
        "street": "456 Park Ave",
        "city": "New York",
        "zipCode": "10022"
      },
      "phone": "+1-555-987-6543",
      "roles": ["user"],
      "active": true
    },
    {
      "id": 3,
      "name": "Michael Johnson",
      "email": "michael@example.com",
      "address": {
        "street": "789 Oak Rd",
        "city": "Chicago",
        "zipCode": "60601"
      },
      "phone": "+1-555-567-8901",
      "roles": ["user", "editor"],
      "active": false
    }
  ],
  "metadata": {
    "totalCount": 3,
    "lastUpdated": "2025-04-02T10:30:00Z",
    "version": "1.0.5"
  },
  "settings": {
    "pageSize": 10,
    "enableNotifications": true,
    "theme": "light",
    "features": {
      "reporting": true,
      "analytics": false,
      "export": {
        "csv": true,
        "pdf": false,
        "json": true
      }
    }
  }
}`,
  
  XML: `<?xml version="1.0" encoding="UTF-8"?>
<users>
  <user id="1">
    <name>John Doe</name>
    <email>john@example.com</email>
    <address>
      <street>123 Main St</street>
      <city>Boston</city>
      <zipCode>02108</zipCode>
    </address>
    <phone>+1-555-123-4567</phone>
    <roles>
      <role>admin</role>
      <role>user</role>
    </roles>
    <active>true</active>
  </user>
  <user id="2">
    <name>Jane Smith</name>
    <email>jane@example.com</email>
    <address>
      <street>456 Park Ave</street>
      <city>New York</city>
      <zipCode>10022</zipCode>
    </address>
    <phone>+1-555-987-6543</phone>
    <roles>
      <role>user</role>
    </roles>
    <active>true</active>
  </user>
  <user id="3">
    <name>Michael Johnson</name>
    <email>michael@example.com</email>
    <address>
      <street>789 Oak Rd</street>
      <city>Chicago</city>
      <zipCode>60601</zipCode>
    </address>
    <phone>+1-555-567-8901</phone>
    <roles>
      <role>user</role>
      <role>editor</role>
    </roles>
    <active>false</active>
  </user>
</users>`,
  
  TEXT: `# TAP Integration Platform

## Overview

The TAP Integration Platform provides a comprehensive solution for building, deploying, and managing data integrations with zero technical debt. It allows users to:

- Connect to multiple data sources
- Transform and map data between formats
- Set up automated workflows
- Monitor integration performance
- Publish and share integrations with others

## Features

1. **Multiple Source Support**: Connect to various data stores including:
   - Azure Blob Storage
   - S3 Buckets
   - SharePoint
   - API Endpoints
   - Webhook Receivers

2. **Transformation Capabilities**:
   - Data type conversion
   - Text formatting
   - Mathematical operations
   - Conditional logic
   - Filtering and routing

3. **Management Features**:
   - Integration versioning
   - Role-based access control
   - Environment management
   - Performance monitoring
   - Error handling and notification

## Getting Started

To begin using the platform, simply create a new integration and add your first data source.

Thank you for using the TAP Integration Platform!`
};

/**
 * Sample URLs for testing
 */
const SAMPLE_URLS = {
  IMAGE: 'https://via.placeholder.com/800x600.png?text=Sample+Image+For+Testing',
  PDF: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
};

/**
 * SpecializedFileViewerDemo Component
 */
const SpecializedFileViewerDemo = () => {
  // State for file handling
  const [selectedFile, setSelectedFile] = useState(null);
  const [fileContent, setFileContent] = useState('');
  
  // State for demo options
  const [sampleType, setSampleType] = useState('');
  const [sampleUrl, setSampleUrl] = useState('');
  const [customUrl, setCustomUrl] = useState('');
  const [showDetector, setShowDetector] = useState(true);
  const [detailLevel, setDetailLevel] = useState('full');
  
  // Handle file selection
  const handleFileSelect = (event) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setSampleType('');
      setSampleUrl('');
      
      // Read file content for text files
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          setFileContent(e.target.result);
        } catch (error) {
          console.error('Error reading file:', error);
          setFileContent('');
        }
      };
      reader.readAsText(files[0]);
    }
  };
  
  // Handle sample type selection
  const handleSampleTypeChange = (event) => {
    const type = event.target.value;
    setSampleType(type);
    setSampleUrl('');
    setSelectedFile(null);
    
    if (type && SAMPLE_DATA[type]) {
      setFileContent(SAMPLE_DATA[type]);
    } else {
      setFileContent('');
    }
  };
  
  // Handle sample URL selection
  const handleSampleUrlChange = (event) => {
    const url = event.target.value;
    setSampleUrl(url);
    setSampleType('');
    setSelectedFile(null);
    setFileContent('');
  };
  
  // Handle custom URL input
  const handleCustomUrlChange = (event) => {
    setCustomUrl(event.target.value);
  };
  
  // Handle custom URL set
  const handleSetCustomUrl = () => {
    if (customUrl) {
      setSampleUrl('CUSTOM');
      setSampleType('');
      setSelectedFile(null);
      setFileContent('');
    }
  };
  
  // Handle clear all
  const handleClearAll = () => {
    setSelectedFile(null);
    setFileContent('');
    setSampleType('');
    setSampleUrl('');
    setCustomUrl('');
  };
  
  // Get current file type
  const getCurrentFileType = () => {
    if (sampleType) {
      return sampleType;
    }
    
    if (selectedFile) {
      const extension = selectedFile.name.split('.').pop().toUpperCase();
      
      switch (extension) {
        case 'CSV':
          return 'CSV';
        case 'JSON':
          return 'JSON';
        case 'XML':
          return 'XML';
        case 'TXT':
        case 'MD':
          return 'TEXT';
        case 'JPG':
        case 'JPEG':
          return 'JPEG';
        case 'PNG':
          return 'PNG';
        case 'GIF':
          return 'GIF';
        case 'PDF':
          return 'PDF';
        default:
          return null;
      }
    }
    
    return null;
  };
  
  // Get current URL
  const getCurrentUrl = () => {
    if (sampleUrl === 'CUSTOM') {
      return customUrl;
    }
    
    if (sampleUrl && SAMPLE_URLS[sampleUrl]) {
      return SAMPLE_URLS[sampleUrl];
    }
    
    return null;
  };
  
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Specialized File Viewer Demo
      </Typography>
      
      <Typography variant="body1" paragraph>
        This demo showcases the SpecializedFileViewer component with various file types and configurations.
        Choose from sample data, sample URLs, or upload your own file to test the viewer.
      </Typography>
      
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Select Content to View
        </Typography>
        
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardHeader title="Upload a File" />
              <CardContent>
                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadFileIcon />}
                  fullWidth
                  sx={{ mb: 2 }}
                >
                  Browse Files
                  <input
                    type="file"
                    hidden
                    onChange={handleFileSelect}
                  />
                </Button>
                
                {selectedFile && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Selected File:
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body2" noWrap sx={{ flexGrow: 1 }}>
                        {selectedFile.name}
                      </Typography>
                      <Tooltip title="Remove file">
                        <IconButton size="small" onClick={handleClearAll}>
                          <RemoveCircleIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardHeader title="Use Sample Data" />
              <CardContent>
                <FormControl fullWidth>
                  <InputLabel>Sample Data Type</InputLabel>
                  <Select
                    value={sampleType}
                    onChange={handleSampleTypeChange}
                    label="Sample Data Type"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="CSV">
                      <TableIcon fontSize="small" sx={{ mr: 1 }} /> CSV Data
                    </MenuItem>
                    <MenuItem value="JSON">
                      <DataObjectIcon fontSize="small" sx={{ mr: 1 }} /> JSON Data
                    </MenuItem>
                    <MenuItem value="XML">
                      <CodeIcon fontSize="small" sx={{ mr: 1 }} /> XML Data
                    </MenuItem>
                    <MenuItem value="TEXT">
                      <ArticleIcon fontSize="small" sx={{ mr: 1 }} /> Markdown Text
                    </MenuItem>
                  </Select>
                </FormControl>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <Card variant="outlined">
              <CardHeader title="Use Sample URL" />
              <CardContent>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel>Sample URL Type</InputLabel>
                  <Select
                    value={sampleUrl}
                    onChange={handleSampleUrlChange}
                    label="Sample URL Type"
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    <MenuItem value="IMAGE">
                      <ImageIcon fontSize="small" sx={{ mr: 1 }} /> Sample Image
                    </MenuItem>
                    <MenuItem value="PDF">
                      <PdfIcon fontSize="small" sx={{ mr: 1 }} /> Sample PDF
                    </MenuItem>
                    <MenuItem value="CUSTOM">
                      <LanguageIcon fontSize="small" sx={{ mr: 1 }} /> Custom URL
                    </MenuItem>
                  </Select>
                </FormControl>
                
                {sampleUrl === 'CUSTOM' && (
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      label="Custom URL"
                      value={customUrl}
                      onChange={handleCustomUrlChange}
                      fullWidth
                      size="small"
                    />
                    <Button 
                      variant="outlined" 
                      onClick={handleSetCustomUrl}
                      disabled={!customUrl}
                    >
                      Set
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Box>
            <FormControlLabel
              control={
                <Switch
                  checked={showDetector}
                  onChange={(e) => setShowDetector(e.target.checked)}
                />
              }
              label="Show File Type Detector"
            />
            
            <FormControl sx={{ ml: 2, minWidth: 150 }} size="small">
              <InputLabel>Detail Level</InputLabel>
              <Select
                value={detailLevel}
                onChange={(e) => setDetailLevel(e.target.value)}
                label="Detail Level"
              >
                <MenuItem value="minimal">Minimal</MenuItem>
                <MenuItem value="standard">Standard</MenuItem>
                <MenuItem value="full">Full</MenuItem>
              </Select>
            </FormControl>
          </Box>
          
          <Button
            variant="outlined"
            color="primary"
            onClick={handleClearAll}
          >
            Clear All
          </Button>
        </Box>
      </Paper>
      
      <Divider sx={{ my: 4 }} />
      
      <Typography variant="h5" gutterBottom>
        File Viewer
      </Typography>
      
      {(selectedFile || fileContent || getCurrentUrl()) ? (
        <Box sx={{ mt: 3 }}>
          <SpecializedFileViewer
            file={selectedFile}
            content={fileContent}
            url={getCurrentUrl()}
            fileType={getCurrentFileType()}
            showDetector={showDetector}
            detailLevel={detailLevel}
          />
        </Box>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="body1" color="text.secondary">
            Select a file, sample data type, or URL to display the file viewer
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default SpecializedFileViewerDemo;