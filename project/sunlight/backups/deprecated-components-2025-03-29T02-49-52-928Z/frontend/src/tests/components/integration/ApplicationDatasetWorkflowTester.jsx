import React, { useState, useEffect, useCallback } from 'react';
import {Typography, Card, Button, Tabs, MuiTab as MuiTab, MuiBox as MuiBox, Chip, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, TextField, IconButton} from '@tests/design-system/legacy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import CodeIcon from '@mui/icons-material/Code';
import SchemaIcon from '@mui/icons-material/Schema';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { getRandomInt } from '../../utils/helpers';
import { MuiBox, MuiTab } from '../../design-system';
// Design system import already exists;
;
;

// Mock data for applications and datasets
const MOCK_APPLICATIONS = [
  { id: 1, name: 'CRM System', type: 'API', status: 'active', 
    config: { url: 'https://api.example.com/crm', authType: 'oauth2' } },
  { id: 2, name: 'ERP System', type: 'Database', status: 'active',
    config: { connectionString: 'postgresql://user:pass@localhost/erp', provider: 'postgresql' } },
  { id: 3, name: 'HR System', type: 'API', status: 'inactive',
    config: { url: 'https://api.example.com/hr', authType: 'apikey' } },
  { id: 4, name: 'Marketing Platform', type: 'API', status: 'active',
    config: { url: 'https://api.example.com/marketing', authType: 'basic' } },
];

const MOCK_DATASETS = [
  { id: 1, name: 'Employee Records', type: 'table', status: 'active', 
    schema: { fields: [
      { name: 'id', type: 'integer', required: true },
      { name: 'first_name', type: 'string', required: true },
      { name: 'last_name', type: 'string', required: true },
      { name: 'department', type: 'string', required: false },
      { name: 'salary', type: 'decimal', required: false }
    ]}
  },
  { id: 2, name: 'Customer Data', type: 'collection', status: 'active',
    schema: { fields: [
      { name: 'id', type: 'string', required: true },
      { name: 'company', type: 'string', required: true },
      { name: 'contact_name', type: 'string', required: true },
      { name: 'email', type: 'string', required: true },
      { name: 'subscription_level', type: 'string', required: false },
      { name: 'last_purchase_date', type: 'date', required: false }
    ]}
  },
  { id: 3, name: 'Product Catalog', type: 'table', status: 'active',
    schema: { fields: [
      { name: 'sku', type: 'string', required: true },
      { name: 'name', type: 'string', required: true },
      { name: 'category', type: 'string', required: true },
      { name: 'price', type: 'decimal', required: true },
      { name: 'description', type: 'text', required: false },
      { name: 'in_stock', type: 'boolean', required: true }
    ]}
  },
  { id: 4, name: 'Sales Transactions', type: 'stream', status: 'active',
    schema: { fields: [
      { name: 'transaction_id', type: 'string', required: true },
      { name: 'customer_id', type: 'string', required: true },
      { name: 'product_sku', type: 'string', required: true },
      { name: 'quantity', type: 'integer', required: true },
      { name: 'price', type: 'decimal', required: true },
      { name: 'timestamp', type: 'datetime', required: true }
    ]}
  },
];

// Initial associations between applications and datasets
const INITIAL_ASSOCIATIONS = [
  { applicationId: 1, datasetId: 2 }, // CRM System -> Customer Data
  { applicationId: 2, datasetId: 3 }, // ERP System -> Product Catalog
  { applicationId: 2, datasetId: 4 }, // ERP System -> Sales Transactions
  { applicationId: 3, datasetId: 1 }, // HR System -> Employee Records
];

// Mock test scenarios for application-dataset workflows
const TEST_SCENARIOS = [
  { 
    id: 'basic-app-dataset-binding', 
    name: 'Basic Application-Dataset Binding', 
    description: 'Verifies that applications can be correctly bound to datasets and that the binding persists',
    implementation: 'bindApplicationToDataset'
  },
  { 
    id: 'schema-compatibility', 
    name: 'Schema Compatibility Validation', 
    description: 'Tests the validation of schema compatibility between applications and datasets',
    implementation: 'validateSchemaCompatibility'
  },
  { 
    id: 'dataset-crud', 
    name: 'Dataset CRUD Operations via Application', 
    description: 'Verifies that applications can perform CRUD operations on associated datasets',
    implementation: 'testDatasetCrudOperations'
  },
  { 
    id: 'field-mapping', 
    name: 'Field Mapping Between Applications and Datasets', 
    description: 'Tests the field mapping capabilities between applications and datasets',
    implementation: 'testFieldMapping'
  },
  { 
    id: 'flow-integration', 
    name: 'Flow Canvas Integration', 
    description: 'Verifies that application-dataset associations are correctly reflected in the flow canvas',
    implementation: 'testFlowCanvasIntegration'
  },
  { 
    id: 'data-transformation', 
    name: 'Data Transformation Between Different Schemas', 
    description: 'Tests data transformation capabilities when moving data between different schemas',
    implementation: 'testDataTransformation'
  },
  { 
    id: 'multi-app-dataset', 
    name: 'Multiple Applications Using Same Dataset', 
    description: 'Verifies that multiple applications can correctly access and use the same dataset',
    implementation: 'testMultipleApplicationsOneDataset'
  },
  { 
    id: 'dataset-permissions', 
    name: 'Dataset Access Permissions', 
    description: 'Tests that dataset access permissions are correctly enforced',
    implementation: 'testDatasetPermissions'
  }
];

// Test result types
const RESULT_TYPE = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info'
};

// Helper function to create a test result object
const createTestResult = (type, message, details = null) => {
  // Added display name
  createTestResult.displayName = 'createTestResult';

  // Added display name
  createTestResult.displayName = 'createTestResult';

  // Added display name
  createTestResult.displayName = 'createTestResult';

  // Added display name
  createTestResult.displayName = 'createTestResult';

  // Added display name
  createTestResult.displayName = 'createTestResult';


  return {
    type,
    message,
    details,
    timestamp: new Date().toISOString()
  };
};

// Mock test implementations (would be much more comprehensive in a real implementation)
const testImplementations = {
  bindApplicationToDataset: () => {
    const success = Math.random() > 0.1; // 90% success rate for demo
    if (success) {
      return createTestResult(
        RESULT_TYPE.SUCCESS,
        'Successfully bound application to dataset',
        { applicationId: 1, datasetId: 2, binding: { created: new Date().toISOString() } }
      );
    } else {
      return createTestResult(
        RESULT_TYPE.ERROR,
        'Failed to bind application to dataset',
        { error: 'Database constraint violation' }
      );
    }
  },
  
  validateSchemaCompatibility: () => {
    const result = Math.random();
    if (result > 0.7) { // 30% success
      return createTestResult(
        RESULT_TYPE.SUCCESS,
        'Schemas are compatible',
        { 
          applicationSchema: { fields: ['id', 'name', 'email'] },
          datasetSchema: { fields: ['id', 'name', 'email', 'address'] },
          compatibility: 'full' 
        }
      );
    } else if (result > 0.3) { // 40% warning
      return createTestResult(
        RESULT_TYPE.WARNING,
        'Schemas are partially compatible',
        { 
          applicationSchema: { fields: ['id', 'name', 'phone'] },
          datasetSchema: { fields: ['id', 'name', 'email'] },
          compatibility: 'partial',
          missingFields: ['phone'],
          extraFields: ['email']
        }
      );
    } else { // 30% error
      return createTestResult(
        RESULT_TYPE.ERROR,
        'Schemas are incompatible',
        { 
          applicationSchema: { fields: ['id', 'category', 'price'] },
          datasetSchema: { fields: ['name', 'email', 'address'] },
          compatibility: 'none',
          criticalMissingFields: ['id']
        }
      );
    }
  },
  
  testDatasetCrudOperations: () => {
    const operations = ['create', 'read', 'update', 'delete'];
    const results = operations.map(op => {
      const success = Math.random() > 0.2; // 80% success rate
      return {
        operation: op,
        success,
        message: success ? `${op} operation succeeded` : `${op} operation failed`,
        details: success ? 
          { timeMs: getRandomInt(10, 200), rowsAffected: op === 'read' ? getRandomInt(1, 100) : getRandomInt(1, 10) } : 
          { error: 'Permission denied', errorCode: 'ERR-403' }
      };
    });
    
    const allSuccess = results.every(r => r.success);
    const allFailed = results.every(r => !r.success);
    
    if (allSuccess) {
      return createTestResult(
        RESULT_TYPE.SUCCESS,
        'All CRUD operations succeeded',
        { operations: results }
      );
    } else if (allFailed) {
      return createTestResult(
        RESULT_TYPE.ERROR,
        'All CRUD operations failed',
        { operations: results }
      );
    } else {
      return createTestResult(
        RESULT_TYPE.WARNING,
        'Some CRUD operations failed',
        { operations: results }
      );
    }
  },
  
  testFieldMapping: () => {
    const fieldMappings = [
      { source: 'customer_id', target: 'id', success: true },
      { source: 'customer_name', target: 'name', success: true },
      { source: 'customer_email', target: 'email', success: true },
      { source: 'customer_phone', target: 'phone', success: Math.random() > 0.3 }
    ];
    
    const allSuccess = fieldMappings.every(m => m.success);
    
    if (allSuccess) {
      return createTestResult(
        RESULT_TYPE.SUCCESS,
        'All field mappings validated successfully',
        { mappings: fieldMappings }
      );
    } else {
      return createTestResult(
        RESULT_TYPE.WARNING,
        'Some field mappings failed validation',
        { mappings: fieldMappings }
      );
    }
  },
  
  testFlowCanvasIntegration: () => {
    const result = Math.random();
    if (result > 0.6) { // 40% success
      return createTestResult(
        RESULT_TYPE.SUCCESS,
        'Application-dataset associations correctly reflected in flow canvas',
        { 
          nodeTypes: ['ApplicationNode', 'DatasetNode', 'TransformNode'],
          connections: [
            { from: 'app-1', to: 'transform-1' },
            { from: 'transform-1', to: 'dataset-2' }
          ]
        }
      );
    } else if (result > 0.2) { // 40% warning
      return createTestResult(
        RESULT_TYPE.WARNING,
        'Application-dataset associations reflected with warnings',
        { 
          nodeTypes: ['ApplicationNode', 'DatasetNode', 'TransformNode'],
          connections: [
            { from: 'app-1', to: 'transform-1', warning: 'Potential data loss' },
            { from: 'transform-1', to: 'dataset-2' }
          ]
        }
      );
    } else { // 20% error
      return createTestResult(
        RESULT_TYPE.ERROR,
        'Failed to reflect associations in flow canvas',
        { 
          error: 'Invalid node configuration',
          details: 'ApplicationNode missing required output configuration'
        }
      );
    }
  },
  
  testDataTransformation: () => {
    const transformations = [
      { type: 'string-to-date', field: 'purchase_date', success: Math.random() > 0.1 },
      { type: 'split-name', field: 'full_name', success: Math.random() > 0.1 },
      { type: 'currency-conversion', field: 'price', success: Math.random() > 0.3 },
      { type: 'aggregate-sum', fields: ['quantity', 'price'], success: Math.random() > 0.2 }
    ];
    
    const successCount = transformations.filter(t => t.success).length;
    const successRate = successCount / transformations.length;
    
    if (successRate === 1) {
      return createTestResult(
        RESULT_TYPE.SUCCESS,
        'All data transformations succeeded',
        { transformations }
      );
    } else if (successRate >= 0.7) {
      return createTestResult(
        RESULT_TYPE.WARNING,
        'Most data transformations succeeded',
        { transformations, successRate }
      );
    } else {
      return createTestResult(
        RESULT_TYPE.ERROR,
        'Data transformation failed',
        { transformations, successRate }
      );
    }
  },
  
  testMultipleApplicationsOneDataset: () => {
    const applications = [
      { id: 1, name: 'CRM', success: Math.random() > 0.1 },
      { id: 2, name: 'Marketing', success: Math.random() > 0.1 },
      { id: 3, name: 'Analytics', success: Math.random() > 0.3 }
    ];
    
    const successCount = applications.filter(a => a.success).length;
    
    if (successCount === applications.length) {
      return createTestResult(
        RESULT_TYPE.SUCCESS,
        'All applications successfully accessed the dataset',
        { applications }
      );
    } else if (successCount > 0) {
      return createTestResult(
        RESULT_TYPE.WARNING,
        'Some applications failed to access the dataset',
        { applications, successCount }
      );
    } else {
      return createTestResult(
        RESULT_TYPE.ERROR,
        'All applications failed to access the dataset',
        { applications, error: 'Dataset unavailable' }
      );
    }
  },
  
  testDatasetPermissions: () => {
    const permissions = [
      { role: 'admin', operation: 'read', expected: true, actual: true },
      { role: 'admin', operation: 'write', expected: true, actual: true },
      { role: 'user', operation: 'read', expected: true, actual: true },
      { role: 'user', operation: 'write', expected: false, actual: Math.random() > 0.9 }, // 10% chance of permission error
      { role: 'guest', operation: 'read', expected: true, actual: Math.random() > 0.2 }, // 80% chance of success
      { role: 'guest', operation: 'write', expected: false, actual: false }
    ];
    
    const permissionErrors = permissions.filter(p => p.expected !== p.actual);
    
    if (permissionErrors.length === 0) {
      return createTestResult(
        RESULT_TYPE.SUCCESS,
        'All permission checks passed',
        { permissions }
      );
    } else {
      return createTestResult(
        RESULT_TYPE.ERROR,
        'Permission checks failed',
        { permissions, permissionErrors }
      );
    }
  }
};

// Function to run a test and get results
const runTest = (testId) => {
  // Added display name
  runTest.displayName = 'runTest';

  // Added display name
  runTest.displayName = 'runTest';

  // Added display name
  runTest.displayName = 'runTest';

  // Added display name
  runTest.displayName = 'runTest';

  // Added display name
  runTest.displayName = 'runTest';


  const test = TEST_SCENARIOS.find(t => t.id === testId);
  if (!test || !testImplementations[test.implementation]) {
    return createTestResult(
      RESULT_TYPE.ERROR,
      'Test implementation not found',
      { testId }
    );
  }
  
  return testImplementations[test.implementation]();
};

// Helper function to render result icon
const ResultIcon = ({ type }) => {
  // Added display name
  ResultIcon.displayName = 'ResultIcon';

  // Added display name
  ResultIcon.displayName = 'ResultIcon';

  // Added display name
  ResultIcon.displayName = 'ResultIcon';

  // Added display name
  ResultIcon.displayName = 'ResultIcon';

  // Added display name
  ResultIcon.displayName = 'ResultIcon';


  switch (type) {
    case RESULT_TYPE.SUCCESS:
      return <CheckCircleOutlineIcon style={{ color: 'green' }} />;
    case RESULT_TYPE.ERROR:
      return <ErrorOutlineIcon style={{ color: 'red' }} />;
    case RESULT_TYPE.WARNING:
      return <ErrorOutlineIcon style={{ color: 'orange' }} />;
    case RESULT_TYPE.INFO:
      return <InfoOutlinedIcon style={{ color: 'blue' }} />;
    default:
      return null;
  }
};

// Helper function to render result chip
const ResultChip = ({ type }) => {
  // Added display name
  ResultChip.displayName = 'ResultChip';

  // Added display name
  ResultChip.displayName = 'ResultChip';

  // Added display name
  ResultChip.displayName = 'ResultChip';

  // Added display name
  ResultChip.displayName = 'ResultChip';

  // Added display name
  ResultChip.displayName = 'ResultChip';


  const getColor = () => {
  // Added display name
  getColor.displayName = 'getColor';

  // Added display name
  getColor.displayName = 'getColor';

  // Added display name
  getColor.displayName = 'getColor';

  // Added display name
  getColor.displayName = 'getColor';

  // Added display name
  getColor.displayName = 'getColor';


    switch (type) {
      case RESULT_TYPE.SUCCESS: return 'success';
      case RESULT_TYPE.ERROR: return 'error';
      case RESULT_TYPE.WARNING: return 'warning';
      case RESULT_TYPE.INFO: return 'info';
      default: return 'default';
    }
  };
  
  return (
    <Chip 
      label={type.toUpperCase()} 
      color={getColor()} 
      size="small&quot; 
      icon={<ResultIcon type={type} />}
    />
  );
};

// Main component for testing application-dataset workflows
const ApplicationDatasetWorkflowTester = () => {
  // Added display name
  ApplicationDatasetWorkflowTester.displayName = "ApplicationDatasetWorkflowTester';

  // Added display name
  ApplicationDatasetWorkflowTester.displayName = 'ApplicationDatasetWorkflowTester';

  // Added display name
  ApplicationDatasetWorkflowTester.displayName = 'ApplicationDatasetWorkflowTester';

  // Added display name
  ApplicationDatasetWorkflowTester.displayName = 'ApplicationDatasetWorkflowTester';

  // Added display name
  ApplicationDatasetWorkflowTester.displayName = 'ApplicationDatasetWorkflowTester';


  const [activeTab, setActiveTab] = useState(0);
  const [applications, setApplications] = useState(MOCK_APPLICATIONS);
  const [datasets, setDatasets] = useState(MOCK_DATASETS);
  const [associations, setAssociations] = useState(INITIAL_ASSOCIATIONS);
  const [testResults, setTestResults] = useState({});
  const [runningTests, setRunningTests] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [overallResults, setOverallResults] = useState({
    total: 0,
    success: 0,
    warning: 0,
    error: 0,
    info: 0
  });

  // Handle tab change
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

  // Run a single test
  const runSingleTest = useCallback((testId) => {
  // Added display name
  runSingleTest.displayName = 'runSingleTest';

    setRunningTests(prev => [...prev, testId]);
    
    // Simulate async test execution
    setTimeout(() => {
      const result = runTest(testId);
      setTestResults(prev => ({
        ...prev,
        [testId]: result
      }));
      setRunningTests(prev => prev.filter(id => id !== testId));
      
      // Update overall results
      setOverallResults(prev => {
        const newResults = { ...prev };
        newResults.total += 1;
        newResults[result.type] = (newResults[result.type] || 0) + 1;
        return newResults;
      });
    }, getRandomInt(500, 2000)); // Random delay for realistic test execution time
  }, []);

  // Run all tests
  const runAllTests = useCallback(() => {
  // Added display name
  runAllTests.displayName = 'runAllTests';

    TEST_SCENARIOS.forEach(test => {
      runSingleTest(test.id);
    });
  }, [runSingleTest]);

  // View test result details
  const viewResultDetails = (testId) => {
  // Added display name
  viewResultDetails.displayName = 'viewResultDetails';

  // Added display name
  viewResultDetails.displayName = 'viewResultDetails';

  // Added display name
  viewResultDetails.displayName = 'viewResultDetails';

  // Added display name
  viewResultDetails.displayName = 'viewResultDetails';

  // Added display name
  viewResultDetails.displayName = 'viewResultDetails';


    setSelectedResult(testResults[testId] || null);
  };

  // Format JSON for display
  const formatJSON = (obj) => {
  // Added display name
  formatJSON.displayName = 'formatJSON';

  // Added display name
  formatJSON.displayName = 'formatJSON';

  // Added display name
  formatJSON.displayName = 'formatJSON';

  // Added display name
  formatJSON.displayName = 'formatJSON';

  // Added display name
  formatJSON.displayName = 'formatJSON';


    return JSON.stringify(obj, null, 2);
  };

  // Export test results
  const exportResults = () => {
  // Added display name
  exportResults.displayName = 'exportResults';

  // Added display name
  exportResults.displayName = 'exportResults';

  // Added display name
  exportResults.displayName = 'exportResults';

  // Added display name
  exportResults.displayName = 'exportResults';

  // Added display name
  exportResults.displayName = 'exportResults';


    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(testResults, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "application-dataset-test-results.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Render applications tab
  const renderApplicationsTab = () => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Associated Datasets</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map(app => (
            <TableRow key={app.id}>
              <TableCell>{app.id}</TableCell>
              <TableCell>{app.name}</TableCell>
              <TableCell>{app.type}</TableCell>
              <TableCell>
                <Chip 
                  label={app.status} 
                  color={app.status === 'active' ? 'success' : 'error'} 
                  size="small&quot; 
                />
              </TableCell>
              <TableCell>
                {associations
                  .filter(assoc => assoc.applicationId === app.id)
                  .map(assoc => {
                    const dataset = datasets.find(ds => ds.id === assoc.datasetId);
                    return dataset ? (
                      <Chip 
                        key={assoc.datasetId}
                        label={dataset.name}
                        size="small"
                        sx={{ m: 0.5 }}
                      />
                    ) : null;
                  })
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Render datasets tab
  const renderDatasetsTab = () => (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Type</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Fields</TableCell>
            <TableCell>Associated Applications</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {datasets.map(dataset => (
            <TableRow key={dataset.id}>
              <TableCell>{dataset.id}</TableCell>
              <TableCell>{dataset.name}</TableCell>
              <TableCell>{dataset.type}</TableCell>
              <TableCell>
                <Chip 
                  label={dataset.status} 
                  color={dataset.status === 'active' ? 'success' : 'error'} 
                  size="small&quot; 
                />
              </TableCell>
              <TableCell>
                {dataset.schema.fields.slice(0, 3).map(field => (
                  <Chip 
                    key={field.name}
                    label={`${field.name} (${field.type})`}
                    size="small"
                    sx={{ m: 0.5 }}
                  />
                ))}
                {dataset.schema.fields.length > 3 && (
                  <Chip 
                    label={`+${dataset.schema.fields.length - 3} more`}
                    size="small&quot;
                    sx={{ m: 0.5 }}
                  />
                )}
              </TableCell>
              <TableCell>
                {associations
                  .filter(assoc => assoc.datasetId === dataset.id)
                  .map(assoc => {
                    const app = applications.find(a => a.id === assoc.applicationId);
                    return app ? (
                      <Chip 
                        key={assoc.applicationId}
                        label={app.name}
                        size="small"
                        sx={{ m: 0.5 }}
                      />
                    ) : null;
                  })
                }
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  // Render test scenarios tab
  const renderTestScenariosTab = () => (
    <div>
      <MuiBox sx={{ display: 'flex', justifyContent: 'space-between', mt: 2, mb: 2 }}>
        <Button 
          variant="contained&quot; 
          color="primary" 
          startIcon={<PlayArrowIcon />}
          onClick={runAllTests}
          disabled={runningTests.length > 0}
        >
          Run All Tests
        </Button>
        <Button 
          variant="outlined&quot; 
          startIcon={<SaveAltIcon />}
          onClick={exportResults}
          disabled={Object.keys(testResults).length === 0}
        >
          Export Results
        </Button>
      </MuiBox>
      
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Test Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell align="center">Result</TableCell>
              <TableCell align="center&quot;>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {TEST_SCENARIOS.map(test => (
              <TableRow key={test.id}>
                <TableCell>{test.name}</TableCell>
                <TableCell>{test.description}</TableCell>
                <TableCell align="center">
                  {runningTests.includes(test.id) ? (
                    <CircularProgress size={24} />
                  ) : testResults[test.id] ? (
                    <ResultChip type={testResults[test.id].type} />
                  ) : (
                    <Chip label="NOT RUN&quot; size="small" />
                  )}
                </TableCell>
                <TableCell align="center&quot;>
                  <IconButton 
                    color="primary" 
                    onClick={() => runSingleTest(test.id)}
                    disabled={runningTests.includes(test.id)}
                  >
                    <PlayArrowIcon />
                  </IconButton>
                  <IconButton
                    color="info&quot;
                    onClick={() => viewResultDetails(test.id)}
                    disabled={!testResults[test.id]}
                  >
                    <VisibilityIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Result details dialog */}
      {selectedResult && (
        <Card sx={{ mt: 3, p: 2 }}>
          <MuiBox sx={{ display: "flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6&quot;>Test Result Details</Typography>
            <ResultChip type={selectedResult.type} />
          </MuiBox>
          <Typography variant="body1" gutterBottom>
            <strong>Message:</strong> {selectedResult.message}
          </Typography>
          <Typography variant="body2&quot; color="text.secondary" gutterBottom>
            <strong>Timestamp:</strong> {new Date(selectedResult.timestamp).toLocaleString()}
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Typography variant="subtitle1&quot; gutterBottom>
            <strong>Details:</strong>
          </Typography>
          <Paper 
            variant="outlined" 
            sx={{ 
              p: 2, 
              maxHeight: '300px', 
              overflow: 'auto', 
              bgcolor: 'grey.100',
              fontFamily: 'monospace'
            }}
          >
            <pre>{formatJSON(selectedResult.details)}</pre>
          </Paper>
        </Card>
      )}
    </div>
  );

  // Render results summary tab
  const renderResultsSummaryTab = () => (
    <div>
      <MuiBox sx={{ display: 'flex', justifyContent: 'space-between', my: 2 }}>
        <Card sx={{ p: 2, flex: 1, mx: 1 }}>
          <Typography variant="h6&quot; align="center">{overallResults.total}</Typography>
          <Typography variant="body2&quot; align="center">Total Tests</Typography>
        </Card>
        <Card sx={{ p: 2, flex: 1, mx: 1, bgcolor: 'success.light' }}>
          <Typography variant="h6&quot; align="center">{overallResults.success || 0}</Typography>
          <Typography variant="body2&quot; align="center">Success</Typography>
        </Card>
        <Card sx={{ p: 2, flex: 1, mx: 1, bgcolor: 'warning.light' }}>
          <Typography variant="h6&quot; align="center">{overallResults.warning || 0}</Typography>
          <Typography variant="body2&quot; align="center">Warning</Typography>
        </Card>
        <Card sx={{ p: 2, flex: 1, mx: 1, bgcolor: 'error.light' }}>
          <Typography variant="h6&quot; align="center">{overallResults.error || 0}</Typography>
          <Typography variant="body2&quot; align="center">Error</Typography>
        </Card>
      </MuiBox>
      
      {Object.keys(testResults).length > 0 ? (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Test Name</TableCell>
                <TableCell>Result</TableCell>
                <TableCell>Message</TableCell>
                <TableCell>Timestamp</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Object.entries(testResults).map(([testId, result]) => {
                const test = TEST_SCENARIOS.find(t => t.id === testId);
                return (
                  <TableRow key={testId}>
                    <TableCell>{test ? test.name : testId}</TableCell>
                    <TableCell>
                      <ResultChip type={result.type} />
                    </TableCell>
                    <TableCell>{result.message}</TableCell>
                    <TableCell>{new Date(result.timestamp).toLocaleString()}</TableCell>
                    <TableCell>
                      <IconButton
                        color="info&quot;
                        onClick={() => viewResultDetails(testId)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <MuiBox sx={{ p: 3, textAlign: "center' }}>
          <Typography variant="body1&quot;>No test results available. Run tests to see results.</Typography>
        </MuiBox>
      )}
    </div>
  );

  return (
    <div>
      <Card sx={{ mb: 3 }}>
        <MuiBox sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Application-Dataset Workflow Tester
          </Typography>
          <Typography variant="body1&quot; color="text.secondary">
            This component provides comprehensive testing for application-dataset workflows,
            validating the integration between applications and datasets in various scenarios.
          </Typography>
          <MuiBox sx={{ display: 'flex', mt: 2 }}>
            <Chip 
              icon={<CodeIcon />} 
              label="8 Test Scenarios&quot; 
              sx={{ mr: 1 }} 
            />
            <Chip 
              icon={<SchemaIcon />} 
              label="4 Applications" 
              sx={{ mr: 1 }} 
            />
            <Chip 
              label="4 Datasets&quot; 
            />
          </MuiBox>
        </MuiBox>
        
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: "divider' }}>
          <MuiTab label="Applications&quot; />
          <MuiTab label="Datasets" />
          <MuiTab label="Test Scenarios&quot; />
          <MuiTab label="Results Summary" />
        </Tabs>
        
        <MuiBox sx={{ p: 2 }}>
          {activeTab === 0 && renderApplicationsTab()}
          {activeTab === 1 && renderDatasetsTab()}
          {activeTab === 2 && renderTestScenariosTab()}
          {activeTab === 3 && renderResultsSummaryTab()}
        </MuiBox>
      </Card>
    </div>
  );
};

export default ApplicationDatasetWorkflowTester;