import React, { useState, useCallback, useEffect } from 'react';

// Material UI components
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;
;;

// Icons
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import StorageIcon from '@mui/icons-material/Storage';
import CloudIcon from '@mui/icons-material/Cloud';
import ShareIcon from '@mui/icons-material/Share';
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import VisibilityIcon from '@mui/icons-material/Visibility';
import DownloadIcon from '@mui/icons-material/Download';
import UploadIcon from '@mui/icons-material/Upload';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import CodeIcon from '@mui/icons-material/Code';
import TableChartIcon from '@mui/icons-material/TableChart';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import ImageIcon from '@mui/icons-material/Image';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import { Accordion, AccordionDetails, AccordionSummary, Alert, Box, Button, Card, CardActions, CardContent, Chip, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, FormControl, Grid, IconButton, InputLabel, LinearProgress, List, ListItem, ListItemIcon, ListItemText, MenuItem, Paper, Select, Snackbar, Stack, Tab, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tabs, TextField, Tooltip, Typography } from '../../design-system';
// Design system import already exists;
// Design system import already exists;
/**
 * StorageConnectorTester Component
 * Tests storage connectors with different file types
 */
function StorageConnectorTester() {
  // Added display name
  StorageConnectorTester.displayName = 'StorageConnectorTester';

  // Test state
  const [activeTab, setActiveTab] = useState(0);
  const [activeConnector, setActiveConnector] = useState('s3');
  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [testResults, setTestResults] = useState({});
  const [filePreview, setFilePreview] = useState(null);
  const [showFilePreview, setShowFilePreview] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Storage connector configurations
  const [connectorConfigs, setConnectorConfigs] = useState({
    s3: {
      name: 'AWS S3',
      icon: <CloudIcon />,
      config: {
        region: 'us-west-2',
        bucket: 'test-integration-bucket',
        accessKeyId: 'MOCK_ACCESS_KEY',
        secretAccessKey: 'MOCK_SECRET_KEY'
      },
      testFiles: [
        { type: 'csv', path: '/data/customers.csv', size: 1024 * 25 },
        { type: 'json', path: '/data/orders.json', size: 1024 * 15 },
        { type: 'xlsx', path: '/data/inventory.xlsx', size: 1024 * 150 },
        { type: 'parquet', path: '/data/analytics.parquet', size: 1024 * 500 },
        { type: 'xml', path: '/data/config.xml', size: 1024 * 5 },
        { type: 'txt', path: '/logs/app.log', size: 1024 * 200 }
      ]
    },
    azure: {
      name: 'Azure Blob Storage',
      icon: <CloudIcon />,
      config: {
        connectionString: 'MOCK_CONNECTION_STRING',
        container: 'test-container'
      },
      testFiles: [
        { type: 'csv', path: 'exports/regions.csv', size: 1024 * 18 },
        { type: 'json', path: 'exports/products.json', size: 1024 * 45 },
        { type: 'pdf', path: 'documents/report.pdf', size: 1024 * 250 },
        { type: 'png', path: 'images/dashboard.png', size: 1024 * 120 },
        { type: 'avro', path: 'data/events.avro', size: 1024 * 300 },
        { type: 'txt', path: 'logs/errors.log', size: 1024 * 75 }
      ]
    },
    sharepoint: {
      name: 'SharePoint',
      icon: <ShareIcon />,
      config: {
        siteUrl: 'https://contoso.sharepoint.com/sites/integration-testing',
        clientId: 'MOCK_CLIENT_ID',
        clientSecret: 'MOCK_CLIENT_SECRET'
      },
      testFiles: [
        { type: 'docx', path: 'Documents/Specifications.docx', size: 1024 * 75 },
        { type: 'xlsx', path: 'Documents/Budget.xlsx', size: 1024 * 120 },
        { type: 'pptx', path: 'Presentations/Overview.pptx', size: 1024 * 2500 },
        { type: 'pdf', path: 'Reports/Annual.pdf', size: 1024 * 1500 },
        { type: 'csv', path: 'Data/Employees.csv', size: 1024 * 5 },
        { type: 'txt', path: 'Notes/Meeting.txt', size: 1024 * 2 }
      ]
    }
  });
  
  // File types to test with
  const fileTypes = [
    { type: 'csv', name: 'CSV', icon: <TableChartIcon />, mimetype: 'text/csv' },
    { type: 'json', name: 'JSON', icon: <CodeIcon />, mimetype: 'application/json' },
    { type: 'xlsx', name: 'Excel', icon: <TableChartIcon />, mimetype: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' },
    { type: 'pdf', name: 'PDF', icon: <PictureAsPdfIcon />, mimetype: 'application/pdf' },
    { type: 'txt', name: 'Text', icon: <TextSnippetIcon />, mimetype: 'text/plain' },
    { type: 'png', name: 'PNG Image', icon: <ImageIcon />, mimetype: 'image/png' },
    { type: 'xml', name: 'XML', icon: <CodeIcon />, mimetype: 'application/xml' },
    { type: 'docx', name: 'Word', icon: <DescriptionIcon />, mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
    { type: 'parquet', name: 'Parquet', icon: <StorageIcon />, mimetype: 'application/vnd.apache.parquet' },
    { type: 'avro', name: 'Avro', icon: <StorageIcon />, mimetype: 'application/avro' }
  ];
  
  // Test operations
  const testOperations = [
    { id: 'list', name: 'List Files', description: 'Test listing files in a directory' },
    { id: 'read', name: 'Read File', description: 'Test reading file content' },
    { id: 'write', name: 'Write File', description: 'Test creating and writing to a file' },
    { id: 'delete', name: 'Delete File', description: 'Test deleting a file' },
    { id: 'metadata', name: 'Get Metadata', description: 'Test retrieving file metadata' },
    { id: 'update', name: 'Update File', description: 'Test updating an existing file' }
  ];
  
  // Handler for tab changes
  const handleTabChange = (event, newValue) => {
  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

  // Added display name
  handleTabChange.displayName = 'handleTabChange';

    setActiveTab(newValue);
  };
  
  // Run a single file type test
  const runFileTypeTest = useCallback(async (connector, fileType, operation) => {
  // Added display name
  runFileTypeTest.displayName = 'runFileTypeTest';

    setIsRunning(true);
    setError(null);
    setUploadProgress(0);
    
    try {
      // Find the first file of this type in the connector config
      const file = connector.testFiles.find(f => f.type === fileType.type);
      
      if (!file) {
        throw new Error(`No test file found for type: ${fileType.name}`);
      }
      
      // Mock progress updates
      const updateProgress = () => {
  // Added display name
  updateProgress.displayName = 'updateProgress';

  // Added display name
  updateProgress.displayName = 'updateProgress';

  // Added display name
  updateProgress.displayName = 'updateProgress';

  // Added display name
  updateProgress.displayName = 'updateProgress';

  // Added display name
  updateProgress.displayName = 'updateProgress';

        let progress = 0;
        const interval = setInterval(() => {
          progress += Math.floor(Math.random() * 15) + 5;
          if (progress > 100) {
            progress = 100;
            clearInterval(interval);
          }
          setUploadProgress(progress);
        }, 300);
        
        return () => clearInterval(interval);
      };
      
      // Start progress updates for operations that would show progress
      let clearProgressUpdates;
      if (operation.id === 'write' || operation.id === 'read' || operation.id === 'update') {
        clearProgressUpdates = updateProgress();
      }
      
      // Simulate the operation
      await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
      
      // Create mock result based on operation
      let result;
      switch (operation.id) {
        case 'list':
          result = {
            success: true,
            files: mockFileList(connector, fileType),
            message: 'Successfully listed files'
          };
          break;
          
        case 'read':
          result = {
            success: true,
            content: mockFileContent(fileType),
            size: file.size,
            message: `Successfully read ${formatBytes(file.size)} from ${file.path}`
          };
          
          // Set file preview data
          setFilePreview({
            name: file.path.split('/').pop(),
            type: fileType,
            content: mockFileContent(fileType),
            size: file.size
          });
          break;
          
        case 'write':
          result = {
            success: true,
            path: `${file.path.split('.')[0]}_new.${file.type}`,
            size: file.size,
            message: `Successfully wrote ${formatBytes(file.size)} to ${file.path.split('.')[0]}_new.${file.type}`
          };
          break;
          
        case 'delete':
          result = {
            success: true,
            path: file.path,
            message: `Successfully deleted ${file.path}`
          };
          break;
          
        case 'metadata':
          result = {
            success: true,
            metadata: {
              contentType: fileType.mimetype,
              size: file.size,
              modified: new Date().toISOString(),
              created: new Date(Date.now() - 86400000).toISOString(),
              etag: `${Math.random().toString(36).substring(2, 15)}`
            },
            message: `Successfully retrieved metadata for ${file.path}`
          };
          break;
          
        case 'update':
          result = {
            success: true,
            path: file.path,
            size: file.size,
            message: `Successfully updated ${formatBytes(file.size)} in ${file.path}`
          };
          break;
          
        default:
          result = {
            success: false,
            message: `Unknown operation: ${operation.id}`
          };
      }
      
      // Store result
      const testKey = `${connector.name}-${fileType.type}-${operation.id}`;
      setTestResults(prev => ({
        ...prev,
        [testKey]: {
          ...result,
          connector: connector.name,
          fileType: fileType.type,
          operation: operation.id,
          timestamp: new Date().toISOString()
        }
      }));
      
      setSuccess(`${operation.name} operation successful for ${fileType.name} on ${connector.name}`);
      
      // Clean up progress interval if it was set
      if (clearProgressUpdates) {
        clearProgressUpdates();
      }
      
      // Always set progress to 100 when done
      setUploadProgress(100);
      
      return result;
      
    } catch (err) {
      setError(`Test failed: ${err.message}`);
      
      // Store failed result
      const testKey = `${connector.name}-${fileType.type}-${operation.id}`;
      setTestResults(prev => ({
        ...prev,
        [testKey]: {
          success: false,
          connector: connector.name,
          fileType: fileType.type,
          operation: operation.id,
          message: err.message,
          timestamp: new Date().toISOString()
        }
      }));
      
      return { success: false, message: err.message };
    } finally {
      setIsRunning(false);
    }
  }, []);
  
  // Run all tests for a file type
  const runAllOperationsForFileType = useCallback(async (connector, fileType) => {
  // Added display name
  runAllOperationsForFileType.displayName = 'runAllOperationsForFileType';

    setIsRunning(true);
    setError(null);
    
    try {
      for (const operation of testOperations) {
        await runFileTypeTest(connector, fileType, operation);
        // Short pause between operations
        await new Promise(resolve => setTimeout(resolve, 500));
      }
      
      setSuccess(`All operations completed for ${fileType.name} on ${connector.name}`);
    } catch (err) {
      setError(`Tests failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  }, [runFileTypeTest]);
  
  // Run all tests for all file types
  const runAllFileTests = useCallback(async (connector) => {
  // Added display name
  runAllFileTests.displayName = 'runAllFileTests';

    setIsRunning(true);
    setError(null);
    
    try {
      // Get all unique file types from the connector's test files
      const fileTypesToTest = [...new Set(connector.testFiles.map(f => f.type))];
      
      for (const fileTypeId of fileTypesToTest) {
        const fileType = fileTypes.find(ft => ft.type === fileTypeId);
        if (fileType) {
          for (const operation of testOperations) {
            await runFileTypeTest(connector, fileType, operation);
            // Short pause between operations
            await new Promise(resolve => setTimeout(resolve, 300));
          }
        }
      }
      
      setSuccess(`All file type tests completed for ${connector.name}`);
    } catch (err) {
      setError(`Tests failed: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  }, [runFileTypeTest]);
  
  // Helper to format bytes
  const formatBytes = (bytes, decimals = 2) => {
  // Added display name
  formatBytes.displayName = 'formatBytes';

  // Added display name
  formatBytes.displayName = 'formatBytes';

  // Added display name
  formatBytes.displayName = 'formatBytes';

  // Added display name
  formatBytes.displayName = 'formatBytes';

  // Added display name
  formatBytes.displayName = 'formatBytes';

    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };
  
  // Mock file list generation
  const mockFileList = (connector, fileType) => {
  // Added display name
  mockFileList.displayName = 'mockFileList';

  // Added display name
  mockFileList.displayName = 'mockFileList';

  // Added display name
  mockFileList.displayName = 'mockFileList';

  // Added display name
  mockFileList.displayName = 'mockFileList';

  // Added display name
  mockFileList.displayName = 'mockFileList';

    const files = [];
    
    // Generate some mock files of the requested type
    for (let i = 1; i <= 5; i++) {
      files.push({
        name: `test${i}.${fileType.type}`,
        path: `/mock/directory/test${i}.${fileType.type}`,
        size: Math.floor(Math.random() * 1024 * 1024) + 1024,
        lastModified: new Date(Date.now() - Math.random() * 86400000 * 30).toISOString()
      });
    }
    
    return files;
  };
  
  // Mock file content generation
  const mockFileContent = (fileType) => {
  // Added display name
  mockFileContent.displayName = 'mockFileContent';

  // Added display name
  mockFileContent.displayName = 'mockFileContent';

  // Added display name
  mockFileContent.displayName = 'mockFileContent';

  // Added display name
  mockFileContent.displayName = 'mockFileContent';

  // Added display name
  mockFileContent.displayName = 'mockFileContent';

    switch (fileType.type) {
      case 'json':
        return JSON.stringify({
          id: 12345,
          name: "Sample Product",
          price: 99.99,
          attributes: {
            color: "red",
            size: "medium",
            weight: 2.5
          },
          inStock: true,
          tags: ["electronics", "sale", "featured"]
        }, null, 2);
        
      case 'csv':
        return `id,name,price,color,size,weight,inStock
1,Widget A,19.99,blue,small,1.0,true
2,Widget B,29.99,red,medium,1.5,true
3,Widget C,39.99,green,large,2.0,false
4,Widget D,49.99,yellow,xlarge,2.5,true
5,Widget E,59.99,black,xxlarge,3.0,false`;
        
      case 'xml':
        return `<?xml version="1.0&quot; encoding="UTF-8"?>
<products>
  <product id="1&quot;>
    <name>Widget A</name>
    <price>19.99</price>
    <attributes>
      <color>blue</color>
      <size>small</size>
      <weight>1.0</weight>
    </attributes>
    <inStock>true</inStock>
  </product>
  <product id="2">
    <name>Widget B</name>
    <price>29.99</price>
    <attributes>
      <color>red</color>
      <size>medium</size>
      <weight>1.5</weight>
    </attributes>
    <inStock>true</inStock>
  </product>
</products>`;
        
      case 'txt':
        return `This is a sample text file content.
It contains multiple lines of text.
This file is used for testing the storage connectors.
Each storage connector should be able to read and write this file.
The content should be identical after a read-write cycle.`;
        
      default:
        return `[Binary content for ${fileType.name} file]`;
    }
  };
  
  // Create summary of test results
  const getTestSummary = () => {
  // Added display name
  getTestSummary.displayName = 'getTestSummary';

  // Added display name
  getTestSummary.displayName = 'getTestSummary';

  // Added display name
  getTestSummary.displayName = 'getTestSummary';

  // Added display name
  getTestSummary.displayName = 'getTestSummary';

  // Added display name
  getTestSummary.displayName = 'getTestSummary';

    const summary = {
      total: Object.keys(testResults).length,
      passed: Object.values(testResults).filter(r => r.success).length,
      failed: Object.values(testResults).filter(r => !r.success).length,
      byConnector: {},
      byFileType: {},
      byOperation: {}
    };
    
    // Group by connector
    Object.values(testResults).forEach(result => {
      if (!summary.byConnector[result.connector]) {
        summary.byConnector[result.connector] = { total: 0, passed: 0, failed: 0 };
      }
      
      summary.byConnector[result.connector].total++;
      if (result.success) {
        summary.byConnector[result.connector].passed++;
      } else {
        summary.byConnector[result.connector].failed++;
      }
    });
    
    // Group by file type
    Object.values(testResults).forEach(result => {
      if (!summary.byFileType[result.fileType]) {
        summary.byFileType[result.fileType] = { total: 0, passed: 0, failed: 0 };
      }
      
      summary.byFileType[result.fileType].total++;
      if (result.success) {
        summary.byFileType[result.fileType].passed++;
      } else {
        summary.byFileType[result.fileType].failed++;
      }
    });
    
    // Group by operation
    Object.values(testResults).forEach(result => {
      if (!summary.byOperation[result.operation]) {
        summary.byOperation[result.operation] = { total: 0, passed: 0, failed: 0 };
      }
      
      summary.byOperation[result.operation].total++;
      if (result.success) {
        summary.byOperation[result.operation].passed++;
      } else {
        summary.byOperation[result.operation].failed++;
      }
    });
    
    return summary;
  };
  
  // Export test results
  const exportResults = useCallback(() => {
  // Added display name
  exportResults.displayName = 'exportResults';

    const summary = getTestSummary();
    
    const results = {
      timestamp: new Date().toISOString(),
      results: testResults,
      summary
    };
    
    // Convert to JSON and create download
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `storage-connector-tests-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  }, [testResults]);
  
  // Get file icon based on type
  const getFileIcon = (fileType) => {
  // Added display name
  getFileIcon.displayName = 'getFileIcon';

  // Added display name
  getFileIcon.displayName = 'getFileIcon';

  // Added display name
  getFileIcon.displayName = 'getFileIcon';

  // Added display name
  getFileIcon.displayName = 'getFileIcon';

  // Added display name
  getFileIcon.displayName = 'getFileIcon';

    const fileTypeInfo = fileTypes.find(ft => ft.type === fileType);
    if (fileTypeInfo) {
      return fileTypeInfo.icon;
    }
    
    // Default icon
    return <InsertDriveFileIcon />;
  };
  
  // Get file type name
  const getFileTypeName = (fileType) => {
  // Added display name
  getFileTypeName.displayName = 'getFileTypeName';

  // Added display name
  getFileTypeName.displayName = 'getFileTypeName';

  // Added display name
  getFileTypeName.displayName = 'getFileTypeName';

  // Added display name
  getFileTypeName.displayName = 'getFileTypeName';

  // Added display name
  getFileTypeName.displayName = 'getFileTypeName';

    const fileTypeInfo = fileTypes.find(ft => ft.type === fileType);
    return fileTypeInfo ? fileTypeInfo.name : fileType.toUpperCase();
  };
  
  // Get active connector config
  const activeConnectorConfig = connectorConfigs[activeConnector];
  
  // Get test summary
  const testSummary = getTestSummary();
  
  return (
    <Box sx={{ width: '100%' }}>
      <Paper sx={{ mb: 2, p: 2 }}>
        <Typography variant="h5&quot; component="h1" gutterBottom>
          Storage Connector Testing
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body1&quot; gutterBottom>
            This tool tests storage connectors with different file types to ensure they function correctly.
          </Typography>
          
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            aria-label="storage connector tabs"
            sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}
          >
            <Tab 
              icon={<CloudIcon />} 
              label="AWS S3&quot; 
              id="tab-s3"
              onClick={() => setActiveConnector('s3')}
            />
            <Tab 
              icon={<CloudIcon />} 
              label="Azure Blob&quot; 
              id="tab-azure"
              onClick={() => setActiveConnector('azure')}
            />
            <Tab 
              icon={<ShareIcon />} 
              label="SharePoint&quot; 
              id="tab-sharepoint"
              onClick={() => setActiveConnector('sharepoint')}
            />
            <Tab 
              icon={<StorageIcon />} 
              label="Results&quot; 
              id="tab-results"
            />
          </Tabs>
          
          {/* Controls */}
          <Stack direction="row&quot; spacing={2} sx={{ mb: 2 }}>
            <Button
              variant="contained"
              color="primary&quot;
              startIcon={<PlayArrowIcon />}
              onClick={() => runAllFileTests(activeConnectorConfig)}
              disabled={isRunning}
            >
              Run All Tests for {activeConnectorConfig.name}
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={exportResults}
              disabled={Object.keys(testResults).length === 0 || isRunning}
            >
              Export Results
            </Button>
          </Stack>
        </Box>
        
        {/* Test summary if on results tab */}
        {activeTab === 3 && testSummary.total > 0 && (
          <Box sx={{ mt: 2, mb: 4 }}>
            <Typography variant="h6&quot; gutterBottom>Test Summary</Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, bgcolor: "success.light', color: 'white', textAlign: 'center' }}>
                  <Typography variant="h4&quot;>{testSummary.passed}</Typography>
                  <Typography variant="body2">PASSED</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, bgcolor: 'error.light', color: 'white', textAlign: 'center' }}>
                  <Typography variant="h4&quot;>{testSummary.failed}</Typography>
                  <Typography variant="body2">FAILED</Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 2, bgcolor: 'info.light', color: 'white', textAlign: 'center' }}>
                  <Typography variant="h4&quot;>{testSummary.total}</Typography>
                  <Typography variant="body2">TOTAL</Typography>
                </Paper>
              </Grid>
            </Grid>
            
            {/* Detailed results */}
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6&quot; gutterBottom>Detailed Results</Typography>
              
              {/* Results by connector */}
              <Accordion defaultExpanded>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1">Results by Connector</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small&quot;>
                      <TableHead>
                        <TableRow>
                          <TableCell>Connector</TableCell>
                          <TableCell align="center">Total</TableCell>
                          <TableCell align="center&quot;>Passed</TableCell>
                          <TableCell align="center">Failed</TableCell>
                          <TableCell align="center&quot;>Success Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(testSummary.byConnector).map(([connector, stats]) => (
                          <TableRow key={connector}>
                            <TableCell>{connector}</TableCell>
                            <TableCell align="center">{stats.total}</TableCell>
                            <TableCell align="center&quot;>{stats.passed}</TableCell>
                            <TableCell align="center">{stats.failed}</TableCell>
                            <TableCell align="center&quot;>
                              {stats.total > 0 ? `${Math.round((stats.passed / stats.total) * 100)}%` : "N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
              
              {/* Results by file type */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1&quot;>Results by File Type</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>File Type</TableCell>
                          <TableCell align="center&quot;>Total</TableCell>
                          <TableCell align="center">Passed</TableCell>
                          <TableCell align="center&quot;>Failed</TableCell>
                          <TableCell align="center">Success Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(testSummary.byFileType).map(([fileType, stats]) => (
                          <TableRow key={fileType}>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {getFileIcon(fileType)}
                                <Typography sx={{ ml: 1 }}>{getFileTypeName(fileType)}</Typography>
                              </Box>
                            </TableCell>
                            <TableCell align="center&quot;>{stats.total}</TableCell>
                            <TableCell align="center">{stats.passed}</TableCell>
                            <TableCell align="center&quot;>{stats.failed}</TableCell>
                            <TableCell align="center">
                              {stats.total > 0 ? `${Math.round((stats.passed / stats.total) * 100)}%` : 'N/A'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
              
              {/* Results by operation */}
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle1&quot;>Results by Operation</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Operation</TableCell>
                          <TableCell align="center&quot;>Total</TableCell>
                          <TableCell align="center">Passed</TableCell>
                          <TableCell align="center&quot;>Failed</TableCell>
                          <TableCell align="center">Success Rate</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(testSummary.byOperation).map(([operation, stats]) => {
                          const opInfo = testOperations.find(op => op.id === operation) || { name: operation };
                          
                          return (
                            <TableRow key={operation}>
                              <TableCell>{opInfo.name}</TableCell>
                              <TableCell align="center&quot;>{stats.total}</TableCell>
                              <TableCell align="center">{stats.passed}</TableCell>
                              <TableCell align="center&quot;>{stats.failed}</TableCell>
                              <TableCell align="center">
                                {stats.total > 0 ? `${Math.round((stats.passed / stats.total) * 100)}%` : 'N/A'}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </AccordionDetails>
              </Accordion>
            </Box>
          </Box>
        )}
        
        {/* Connector details and tests (not on results tab) */}
        {activeTab !== 3 && (
          <>
            <Divider sx={{ my: 2 }} />
            
            {/* Connector configuration */}
            <Paper sx={{ p: 2, mb: 2, bgcolor: 'background.paper' }}>
              <Typography variant="h6&quot; gutterBottom sx={{ display: "flex', alignItems: 'center' }}>
                {activeConnectorConfig.icon}
                <Box component="span&quot; sx={{ ml: 1 }}>{activeConnectorConfig.name} Configuration</Box>
              </Typography>
              
              <Grid container spacing={2}>
                {Object.entries(activeConnectorConfig.config).map(([key, value]) => (
                  <Grid item xs={12} sm={6} md={3} key={key}>
                    <TextField
                      label={key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1')}
                      value={value}
                      fullWidth
                      disabled
                      size="small&quot;
                      // Mask sensitive fields
                      type={key.includes("key') || key.includes('secret') || key.includes('password') ? 'password' : 'text'}
                    />
                  </Grid>
                ))}
              </Grid>
            </Paper>
            
            {/* File type tests */}
            <Typography variant="h6&quot; gutterBottom>File Type Tests</Typography>
            
            <Grid container spacing={2}>
              {fileTypes.filter(fileType => 
                activeConnectorConfig.testFiles.some(f => f.type === fileType.type)
              ).map((fileType) => {
                // Find the test file for this type
                const testFile = activeConnectorConfig.testFiles.find(f => f.type === fileType.type);
                
                return (
                  <Grid item xs={12} sm={6} md={4} key={fileType.type}>
                    <Card sx={{ height: "100%', display: 'flex', flexDirection: 'column' }}>
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                          {fileType.icon}
                          <Typography variant="h6&quot; component="h2" sx={{ ml: 1 }}>
                            {fileType.name}
                          </Typography>
                        </Box>
                        
                        <Typography variant="body2&quot; color="text.secondary" gutterBottom>
                          MIME Type: {fileType.mimetype}
                        </Typography>
                        
                        {testFile && (
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2&quot;>
                              Test File: {testFile.path}
                            </Typography>
                            <Typography variant="body2">
                              Size: {formatBytes(testFile.size)}
                            </Typography>
                          </Box>
                        )}
                        
                        <Divider sx={{ my: 1 }} />
                        
                        <Typography variant="subtitle2&quot; gutterBottom>Operations:</Typography>
                        
                        <Grid container spacing={1}>
                          {testOperations.map(operation => {
                            const testKey = `${activeConnectorConfig.name}-${fileType.type}-${operation.id}`;
                            const result = testResults[testKey];
                            
                            return (
                              <Grid item xs={6} key={operation.id}>
                                <Chip
                                  label={operation.name}
                                  size="small"
                                  icon={result ? (result.success ? <CheckCircleIcon /> : <ErrorIcon />) : undefined}
                                  color={result ? (result.success ? 'success' : 'error') : 'default'}
                                  variant={result ? 'filled' : 'outlined'}
                                  sx={{ width: '100%' }}
                                />
                              </Grid>
                            );
                          })}
                        </Grid>
                        
                        {/* Show number of passed tests */}
                        {Object.keys(testResults).some(key => key.startsWith(`${activeConnectorConfig.name}-${fileType.type}`)) && (
                          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption&quot;>
                              Passed: {Object.entries(testResults)
                                .filter(([key, val]) => 
                                  key.startsWith(`${activeConnectorConfig.name}-${fileType.type}`) && val.success
                                ).length} / {testOperations.length}
                            </Typography>
                            <Typography variant="caption">
                              Last Test: {
                                new Date(Math.max(...Object.entries(testResults)
                                  .filter(([key]) => key.startsWith(`${activeConnectorConfig.name}-${fileType.type}`))
                                  .map(([_, val]) => new Date(val.timestamp).getTime())
                                )).toLocaleTimeString()
                              }
                            </Typography>
                          </Box>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small&quot;
                          startIcon={<PlayArrowIcon />}
                          onClick={() => runAllOperationsForFileType(activeConnectorConfig, fileType)}
                          disabled={isRunning}
                        >
                          Test All Operations
                        </Button>
                        
                        {/* Add a dropdown menu for individual operations */}
                        <FormControl size="small" sx={{ ml: 'auto', minWidth: 120 }}>
                          <Select
                            value="&quot;
                            displayEmpty
                            disabled={isRunning}
                            onChange={(e) => {
                              const operation = testOperations.find(op => op.id === e.target.value);
                              if (operation) {
                                runFileTypeTest(activeConnectorConfig, fileType, operation);
                              }
                            }}
                          >
                            <MenuItem value="" disabled>
                              <em>Select Operation</em>
                            </MenuItem>
                            {testOperations.map((operation) => (
                              <MenuItem key={operation.id} value={operation.id}>
                                {operation.name}
                              </MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </>
        )}
      </Paper>
      
      {/* File preview dialog */}
      <Dialog
        open={showFilePreview && filePreview !== null}
        onClose={() => setShowFilePreview(false)}
        maxWidth="md&quot;
        fullWidth
      >
        <DialogTitle>
          File Preview: {filePreview?.name}
          <IconButton
            aria-label="close"
            onClick={() => setShowFilePreview(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {filePreview && (
            <>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2&quot; gutterBottom>
                  File Type: {filePreview.type.name}
                </Typography>
                <Typography variant="subtitle2" gutterBottom>
                  Size: {formatBytes(filePreview.size)}
                </Typography>
              </Box>
              
              <Divider sx={{ my: 2 }} />
              
              {/* Content preview based on file type */}
              {filePreview.type.type === 'json' ? (
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '16px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '400px'
                }}>
                  {filePreview.content}
                </pre>
              ) : filePreview.type.type === 'csv' ? (
                <TableContainer component={Paper} sx={{ maxHeight: '400px' }}>
                  <Table size="small&quot;>
                    <TableHead>
                      <TableRow>
                        {filePreview.content.split("\n')[0].split(',').map((header, i) => (
                          <TableCell key={i}>{header}</TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filePreview.content.split('\n').slice(1).map((row, i) => (
                        <TableRow key={i}>
                          {row.split(',').map((cell, j) => (
                            <TableCell key={j}>{cell}</TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              ) : filePreview.type.type === 'txt' || filePreview.type.type === 'xml' ? (
                <pre style={{ 
                  backgroundColor: '#f5f5f5', 
                  padding: '16px',
                  borderRadius: '4px',
                  overflow: 'auto',
                  maxHeight: '400px',
                  whiteSpace: 'pre-wrap'
                }}>
                  {filePreview.content}
                </pre>
              ) : (
                <Typography>
                  Preview not available for {filePreview.type.name} files.
                </Typography>
              )}
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFilePreview(false)}>Close</Button>
          <Button 
            startIcon={<ContentPasteIcon />}
            onClick={() => {
              if (filePreview?.content) {
                navigator.clipboard.writeText(filePreview.content);
                setSuccess('File content copied to clipboard');
              }
            }}
          >
            Copy Content
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Progress indicator */}
      {isRunning && (
        <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999 }}>
          <LinearProgress 
            variant={uploadProgress > 0 ? "determinate" : "indeterminate"} 
            value={uploadProgress} 
          />
        </Box>
      )}
      
      {/* Notifications */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setError(null)} severity="error&quot;>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar
        open={Boolean(success)}
        autoHideDuration={3000}
        onClose={() => setSuccess(null)}
        anchorOrigin={{ vertical: "bottom', horizontal: 'left' }}
      >
        <Alert onClose={() => setSuccess(null)} severity="success">
          {success}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default StorageConnectorTester;