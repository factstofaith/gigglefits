import React, { useState, useEffect, useCallback } from 'react';
import {Typography, Card, Button, Tabs, Tab, MuiBox as MuiBox, Chip, CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Divider, TextField, IconButton, FormControl, InputLabel, MenuItem, Select, Switch, FormControlLabel, Grid, Tooltip} from '../../design-system/legacy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LineChartIcon from '@mui/icons-material/ShowChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import JsonIcon from '@mui/icons-material/Code';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import RefreshIcon from '@mui/icons-material/Refresh';
import SettingsIcon from '@mui/icons-material/Settings';
import FilterListIcon from '@mui/icons-material/FilterList';
import { getRandomInt } from '../../utils/helpers';
import { MuiBox } from '../../design-system';
;

// Mock data formats for testing
const DATA_FORMATS = {
  CSV: 'csv',
  JSON: 'json',
  XML: 'xml',
  EXCEL: 'excel',
  AVRO: 'avro',
  PARQUET: 'parquet',
};

// Mock transformation types
const TRANSFORMATION_TYPES = {
  MAP: 'map',
  FILTER: 'filter',
  AGGREGATE: 'aggregate',
  JOIN: 'join',
  SPLIT: 'split',
  ENRICH: 'enrich',
  NORMALIZE: 'normalize',
  VALIDATE: 'validate',
};

// Mock data sources
const MOCK_DATA_SOURCES = [
  { 
    id: 1, 
    name: 'Employee Dataset', 
    format: DATA_FORMATS.CSV,
    previewAvailable: true,
    sampleData: [
      { id: 1, first_name: 'John', last_name: 'Doe', department: 'Engineering', salary: 85000 },
      { id: 2, first_name: 'Jane', last_name: 'Smith', department: 'Marketing', salary: 72000 },
      { id: 3, first_name: 'Robert', last_name: 'Johnson', department: 'Finance', salary: 90000 },
      { id: 4, first_name: 'Emily', last_name: 'Williams', department: 'Engineering', salary: 88000 },
      { id: 5, first_name: 'Michael', last_name: 'Brown', department: 'HR', salary: 65000 },
    ]
  },
  { 
    id: 2, 
    name: 'Customer Records', 
    format: DATA_FORMATS.JSON,
    previewAvailable: true,
    sampleData: [
      { id: 'C001', company: 'Acme Corp', contact: 'Alice Cooper', email: 'alice@acme.com', tier: 'Gold' },
      { id: 'C002', company: 'TechStart', contact: 'Bob Builder', email: 'bob@techstart.io', tier: 'Silver' },
      { id: 'C003', company: 'Innovate Inc', contact: 'Charlie Chen', email: 'charlie@innovate.co', tier: 'Platinum' },
      { id: 'C004', company: 'DataFlow', contact: 'Diana Davis', email: 'diana@dataflow.net', tier: 'Gold' },
      { id: 'C005', company: 'CloudSoft', contact: 'Edward Evans', email: 'edward@cloudsoft.com', tier: 'Bronze' },
    ]
  },
  { 
    id: 3, 
    name: 'Product Inventory', 
    format: DATA_FORMATS.EXCEL,
    previewAvailable: true,
    sampleData: [
      { sku: 'P100', name: 'Ergonomic Chair', category: 'Office', price: 299.99, stock: 45 },
      { sku: 'P101', name: 'Standing Desk', category: 'Office', price: 499.99, stock: 32 },
      { sku: 'P102', name: 'Wireless Keyboard', category: 'Electronics', price: 89.99, stock: 120 },
      { sku: 'P103', name: 'Wireless Mouse', category: 'Electronics', price: 49.99, stock: 150 },
      { sku: 'P104', name: 'Monitor Stand', category: 'Accessories', price: 79.99, stock: 65 },
    ]
  },
  { 
    id: 4, 
    name: 'Sales Transactions', 
    format: DATA_FORMATS.JSON,
    previewAvailable: true,
    sampleData: [
      { id: 'T1001', customer_id: 'C001', product_sku: 'P100', quantity: 2, price: 599.98, date: '2023-01-15' },
      { id: 'T1002', customer_id: 'C003', product_sku: 'P102', quantity: 3, price: 269.97, date: '2023-01-18' },
      { id: 'T1003', customer_id: 'C002', product_sku: 'P101', quantity: 1, price: 499.99, date: '2023-01-20' },
      { id: 'T1004', customer_id: 'C001', product_sku: 'P103', quantity: 2, price: 99.98, date: '2023-01-25' },
      { id: 'T1005', customer_id: 'C004', product_sku: 'P104', quantity: 5, price: 399.95, date: '2023-01-27' },
    ]
  },
  { 
    id: 5, 
    name: 'Weather Data', 
    format: DATA_FORMATS.XML,
    previewAvailable: true,
    sampleData: [
      { station_id: 'S001', city: 'New York', temperature: 28.5, humidity: 65, wind_speed: 12, date: '2023-01-15' },
      { station_id: 'S002', city: 'Los Angeles', temperature: 75.2, humidity: 45, wind_speed: 8, date: '2023-01-15' },
      { station_id: 'S003', city: 'Chicago', temperature: 20.1, humidity: 70, wind_speed: 15, date: '2023-01-15' },
      { station_id: 'S004', city: 'Miami', temperature: 82.4, humidity: 78, wind_speed: 10, date: '2023-01-15' },
      { station_id: 'S005', city: 'Denver', temperature: 45.6, humidity: 35, wind_speed: 14, date: '2023-01-15' },
    ]
  },
];

// Mock transformation configurations
const MOCK_TRANSFORMATIONS = [
  {
    id: 1,
    name: 'Employee Salary Calculation',
    type: TRANSFORMATION_TYPES.MAP,
    description: 'Calculates adjusted salaries with bonuses based on department',
    sourceId: 1,
    configuration: {
      mappings: [
        { source: 'id', target: 'employee_id', transform: null },
        { source: 'first_name', target: 'first_name', transform: null },
        { source: 'last_name', target: 'last_name', transform: null },
        { source: 'department', target: 'department', transform: null },
        { source: 'salary', target: 'base_salary', transform: null },
        { 
          source: 'salary', 
          target: 'adjusted_salary', 
          transform: "row.salary * (row.department === 'Engineering' ? 1.1 : row.department === 'Finance' ? 1.08 : 1.05)"
        },
      ]
    }
  },
  {
    id: 2,
    name: 'High-Value Customer Filter',
    type: TRANSFORMATION_TYPES.FILTER,
    description: 'Filters customers based on their tier to identify high-value clients',
    sourceId: 2,
    configuration: {
      conditions: [
        { field: 'tier', operator: 'in', value: ['Gold', 'Platinum'] }
      ]
    }
  },
  {
    id: 3,
    name: 'Product Inventory Analysis',
    type: TRANSFORMATION_TYPES.AGGREGATE,
    description: 'Aggregates product data to calculate inventory value by category',
    sourceId: 3,
    configuration: {
      groupBy: ['category'],
      aggregations: [
        { field: 'price', function: 'avg', alias: 'average_price' },
        { field: 'stock', function: 'sum', alias: 'total_stock' },
        { expression: 'sum(price * stock)', alias: 'inventory_value' }
      ]
    }
  },
  {
    id: 4,
    name: 'Sales Enrichment',
    type: TRANSFORMATION_TYPES.JOIN,
    description: 'Joins sales transactions with customer data for a complete sales view',
    sourceId: 4,
    secondarySourceId: 2,
    configuration: {
      joinType: 'inner',
      joinConditions: [
        { leftField: 'customer_id', rightField: 'id' }
      ],
      outputFields: [
        { source: 'left', field: 'id', alias: 'transaction_id' },
        { source: 'left', field: 'product_sku', alias: 'product_sku' },
        { source: 'left', field: 'quantity', alias: 'quantity' },
        { source: 'left', field: 'price', alias: 'price' },
        { source: 'left', field: 'date', alias: 'date' },
        { source: 'right', field: 'company', alias: 'company' },
        { source: 'right', field: 'contact', alias: 'contact' },
        { source: 'right', field: 'tier', alias: 'customer_tier' }
      ]
    }
  },
  {
    id: 5,
    name: 'Weather Data Normalization',
    type: TRANSFORMATION_TYPES.NORMALIZE,
    description: 'Normalizes temperature values to a standard scale',
    sourceId: 5,
    configuration: {
      normalizationFields: [
        { 
          field: 'temperature', 
          method: 'min-max', 
          newField: 'normalized_temperature',
          parameters: { min: 0, max: 1 }
        }
      ],
      preserveOriginal: true
    }
  }
];

// Mock test validation scenarios
const VALIDATION_SCENARIOS = [
  {
    id: 'preview-render',
    name: 'Data Preview Rendering',
    description: 'Validates that data preview components correctly render different data formats',
    implementation: 'validatePreviewRendering'
  },
  {
    id: 'transformation-execution',
    name: 'Transformation Execution',
    description: 'Tests the execution of various transformation types',
    implementation: 'validateTransformationExecution'
  },
  {
    id: 'ui-controls',
    name: 'UI Control Functionality',
    description: 'Verifies that preview and transformation UI controls work correctly',
    implementation: 'validateUIControls'
  },
  {
    id: 'error-handling',
    name: 'Error Handling',
    description: 'Tests the error handling capabilities of preview and transformation components',
    implementation: 'validateErrorHandling'
  },
  {
    id: 'data-synchronization',
    name: 'Data Synchronization',
    description: 'Validates that changes in data sources are correctly reflected in previews',
    implementation: 'validateDataSynchronization'
  },
  {
    id: 'large-dataset',
    name: 'Large Dataset Handling',
    description: 'Tests performance with large datasets and verifies pagination controls',
    implementation: 'validateLargeDatasetHandling'
  },
  {
    id: 'schema-discovery',
    name: 'Schema Discovery',
    description: 'Verifies automatic schema discovery from data previews',
    implementation: 'validateSchemaDiscovery'
  },
  {
    id: 'transformation-persistence',
    name: 'Transformation Configuration Persistence',
    description: 'Tests that transformation configurations can be saved and retrieved correctly',
    implementation: 'validateTransformationPersistence'
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

// Mock test implementations
const testImplementations = {
  validatePreviewRendering: () => {
    const formats = [DATA_FORMATS.CSV, DATA_FORMATS.JSON, DATA_FORMATS.XML, DATA_FORMATS.EXCEL];
    const results = formats.map(format => {
      const success = Math.random() > 0.2; // 80% success rate
      return {
        format,
        success,
        message: success ? `${format.toUpperCase()} preview rendered correctly` : `${format.toUpperCase()} preview rendering failed`,
        details: success ? 
          { renderTimeMs: getRandomInt(10, 200), rowsRendered: getRandomInt(5, 100) } : 
          { error: 'Format parser error', errorCode: `ERR-${format.toUpperCase()}-001` }
      };
    });
    
    const allSuccess = results.every(r => r.success);
    const allFailed = results.every(r => !r.success);
    
    if (allSuccess) {
      return createTestResult(
        RESULT_TYPE.SUCCESS,
        'All data formats rendered correctly',
        { formats: results }
      );
    } else if (allFailed) {
      return createTestResult(
        RESULT_TYPE.ERROR,
        'All data format previews failed',
        { formats: results }
      );
    } else {
      return createTestResult(
        RESULT_TYPE.WARNING,
        'Some data format previews failed',
        { formats: results }
      );
    }
  },
  
  validateTransformationExecution: () => {
    const transformationTypes = Object.values(TRANSFORMATION_TYPES);
    const results = transformationTypes.map(type => {
      const success = Math.random() > 0.2; // 80% success rate
      return {
        type,
        success,
        message: success ? `${type} transformation executed successfully` : `${type} transformation execution failed`,
        details: success ? 
          { executionTimeMs: getRandomInt(50, 500), rowsProcessed: getRandomInt(5, 100), rowsOutput: getRandomInt(1, 50) } : 
          { error: 'Transformation execution error', errorCode: `ERR-TRANSFORM-${type.toUpperCase()}` }
      };
    });
    
    const successCount = results.filter(r => r.success).length;
    const successRate = successCount / transformationTypes.length;
    
    if (successRate === 1) {
      return createTestResult(
        RESULT_TYPE.SUCCESS,
        'All transformation types executed successfully',
        { transformations: results }
      );
    } else if (successRate >= 0.7) {
      return createTestResult(
        RESULT_TYPE.WARNING,
        'Most transformation types executed successfully',
        { transformations: results, successRate }
      );
    } else {
      return createTestResult(
        RESULT_TYPE.ERROR,
        'Multiple transformation executions failed',
        { transformations: results, successRate }
      );
    }
  },
  
  validateUIControls: () => {
    const controls = [
      { name: 'refresh', success: Math.random() > 0.1 },
      { name: 'filter', success: Math.random() > 0.1 },
      { name: 'pagination', success: Math.random() > 0.1 },
      { name: 'viewMode', success: Math.random() > 0.1 },
      { name: 'export', success: Math.random() > 0.1 },
      { name: 'sortColumn', success: Math.random() > 0.1 },
      { name: 'resize', success: Math.random() > 0.2 },
      { name: 'configPanel', success: Math.random() > 0.1 }
    ];
    
    const failedControls = controls.filter(c => !c.success);
    
    if (failedControls.length === 0) {
      return createTestResult(
        RESULT_TYPE.SUCCESS,
        'All UI controls functioning correctly',
        { controls }
      );
    } else if (failedControls.length <= 2) {
      return createTestResult(
        RESULT_TYPE.WARNING,
        'Some UI controls not functioning correctly',
        { controls, failedControls }
      );
    } else {
      return createTestResult(
        RESULT_TYPE.ERROR,
        'Multiple UI controls failed',
        { controls, failedControls }
      );
    }
  },
  
  validateErrorHandling: () => {
    const errorScenarios = [
      { scenario: 'missingData', handled: Math.random() > 0.1 },
      { scenario: 'invalidFormat', handled: Math.random() > 0.1 },
      { scenario: 'transformationError', handled: Math.random() > 0.1 },
      { scenario: 'networkTimeout', handled: Math.random() > 0.2 },
      { scenario: 'invalidSchema', handled: Math.random() > 0.1 },
      { scenario: 'authorizationError', handled: Math.random() > 0.2 }
    ];
    
    const unhandledErrors = errorScenarios.filter(e => !e.handled);
    
    if (unhandledErrors.length === 0) {
      return createTestResult(
        RESULT_TYPE.SUCCESS,
        'All error scenarios handled correctly',
        { errorScenarios }
      );
    } else if (unhandledErrors.length <= 2) {
      return createTestResult(
        RESULT_TYPE.WARNING,
        'Some error scenarios not handled correctly',
        { errorScenarios, unhandledErrors }
      );
    } else {
      return createTestResult(
        RESULT_TYPE.ERROR,
        'Multiple error handling failures',
        { errorScenarios, unhandledErrors }
      );
    }
  },
  
  validateDataSynchronization: () => {
    const syncScenarios = [
      { scenario: 'manualRefresh', synced: Math.random() > 0.1 },
      { scenario: 'autoRefresh', synced: Math.random() > 0.2 },
      { scenario: 'sourceChange', synced: Math.random() > 0.1 },
      { scenario: 'filterChange', synced: Math.random() > 0.1 },
      { scenario: 'transformationUpdate', synced: Math.random() > 0.2 }
    ];
    
    const syncIssues = syncScenarios.filter(s => !s.synced);
    
    if (syncIssues.length === 0) {
      return createTestResult(
        RESULT_TYPE.SUCCESS,
        'Data synchronization working correctly in all scenarios',
        { syncScenarios }
      );
    } else if (syncIssues.length <= 1) {
      return createTestResult(
        RESULT_TYPE.WARNING,
        'Data synchronization issues in some scenarios',
        { syncScenarios, syncIssues }
      );
    } else {
      return createTestResult(
        RESULT_TYPE.ERROR,
        'Multiple data synchronization failures',
        { syncScenarios, syncIssues }
      );
    }
  },
  
  validateLargeDatasetHandling: () => {
    const datasetSizes = [
      { size: '1,000 rows', handled: Math.random() > 0.05 },
      { size: '10,000 rows', handled: Math.random() > 0.1 },
      { size: '100,000 rows', handled: Math.random() > 0.2 },
      { size: '1,000,000 rows', handled: Math.random() > 0.4 }
    ];
    
    const performanceMetrics = datasetSizes.map(ds => ({
      size: ds.size,
      initialLoadTimeMs: ds.handled ? getRandomInt(100, 10000) : null,
      paginationTimeMs: ds.handled ? getRandomInt(50, 1000) : null,
      memoryUsageMB: ds.handled ? getRandomInt(10, 1000) : null,
      handled: ds.handled
    }));
    
    const handlingIssues = performanceMetrics.filter(pm => !pm.handled);
    
    if (handlingIssues.length === 0) {
      return createTestResult(
        RESULT_TYPE.SUCCESS,
        'All dataset sizes handled efficiently',
        { performanceMetrics }
      );
    } else if (handlingIssues.length === 1 && handlingIssues[0].size === '1,000,000 rows') {
      return createTestResult(
        RESULT_TYPE.WARNING,
        'Largest dataset size handled with some performance issues',
        { performanceMetrics, handlingIssues }
      );
    } else {
      return createTestResult(
        RESULT_TYPE.ERROR,
        'Performance issues with multiple dataset sizes',
        { performanceMetrics, handlingIssues }
      );
    }
  },
  
  validateSchemaDiscovery: () => {
    const results = MOCK_DATA_SOURCES.map(source => {
      const success = Math.random() > 0.2; // 80% success rate
      return {
        sourceId: source.id,
        sourceName: source.name,
        format: source.format,
        success,
        fieldsDetected: success ? getRandomInt(3, 15) : 0,
        typesAccuracy: success ? getRandomInt(75, 100) : 0
      };
    });
    
    const successRate = results.filter(r => r.success).length / results.length;
    
    if (successRate === 1) {
      return createTestResult(
        RESULT_TYPE.SUCCESS,
        'Schema discovery successful for all data sources',
        { results }
      );
    } else if (successRate >= 0.8) {
      return createTestResult(
        RESULT_TYPE.WARNING,
        'Schema discovery partially successful',
        { results, successRate }
      );
    } else {
      return createTestResult(
        RESULT_TYPE.ERROR,
        'Schema discovery failed for multiple data sources',
        { results, successRate }
      );
    }
  },
  
  validateTransformationPersistence: () => {
    const persistenceTests = [
      { operation: 'save', success: Math.random() > 0.1 },
      { operation: 'load', success: Math.random() > 0.1 },
      { operation: 'update', success: Math.random() > 0.1 },
      { operation: 'delete', success: Math.random() > 0.1 },
      { operation: 'export', success: Math.random() > 0.1 },
      { operation: 'import', success: Math.random() > 0.2 }
    ];
    
    const persistenceIssues = persistenceTests.filter(pt => !pt.success);
    
    if (persistenceIssues.length === 0) {
      return createTestResult(
        RESULT_TYPE.SUCCESS,
        'Transformation persistence working correctly for all operations',
        { persistenceTests }
      );
    } else if (persistenceIssues.length <= 1) {
      return createTestResult(
        RESULT_TYPE.WARNING,
        'Transformation persistence issues with some operations',
        { persistenceTests, persistenceIssues }
      );
    } else {
      return createTestResult(
        RESULT_TYPE.ERROR,
        'Multiple transformation persistence failures',
        { persistenceTests, persistenceIssues }
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


  const test = VALIDATION_SCENARIOS.find(t => t.id === testId);
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

// Simple Data Preview Component
const DataPreviewComponent = ({ data, format }) => {
  // Added display name
  DataPreviewComponent.displayName = "DataPreviewComponent';

  // Added display name
  DataPreviewComponent.displayName = 'DataPreviewComponent';

  // Added display name
  DataPreviewComponent.displayName = 'DataPreviewComponent';

  // Added display name
  DataPreviewComponent.displayName = 'DataPreviewComponent';

  // Added display name
  DataPreviewComponent.displayName = 'DataPreviewComponent';


  const [viewMode, setViewMode] = useState('table');
  
  if (!data || data.length === 0) {
    return (
      <MuiBox sx={{ p: 2, textAlign: 'center' }}>
        <Typography>No data available</Typography>
      </MuiBox>
    );
  }
  
  // Extract column headers from the first item
  const columns = Object.keys(data[0]);
  
  const renderTableView = () => (
    <TableContainer sx={{ maxHeight: 300 }}>
      <Table stickyHeader size="small&quot;>
        <TableHead>
          <TableRow>
            {columns.map(column => (
              <TableCell key={column}>{column}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map(column => (
                <TableCell key={`${rowIndex}-${column}`}>
                  {typeof row[column] === "object' ? JSON.stringify(row[column]) : row[column]?.toString()}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
  
  const renderJsonView = () => (
    <MuiBox sx={{ maxHeight: 300, overflow: 'auto', p: 2, bgcolor: 'background.paper' }}>
      <pre style={{ margin: 0 }}>{JSON.stringify(data, null, 2)}</pre>
    </MuiBox>
  );
  
  return (
    <div>
      <MuiBox sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
        <Typography variant="subtitle2&quot; gutterBottom>
          Format: <Chip label={format.toUpperCase()} size="small" />
        </Typography>
        <MuiBox>
          <IconButton 
            size="small&quot; 
            onClick={() => setViewMode("table')}
            color={viewMode === 'table' ? 'primary' : 'default'}
          >
            <TableChartIcon />
          </IconButton>
          <IconButton 
            size="small&quot; 
            onClick={() => setViewMode("json')}
            color={viewMode === 'json' ? 'primary' : 'default'}
          >
            <JsonIcon />
          </IconButton>
        </MuiBox>
      </MuiBox>
      
      {viewMode === 'table' ? renderTableView() : renderJsonView()}
    </div>
  );
};

// Simple Transformation Preview Component
const TransformationPreviewComponent = ({ transformation, sourceData }) => {
  // Added display name
  TransformationPreviewComponent.displayName = 'TransformationPreviewComponent';

  // Added display name
  TransformationPreviewComponent.displayName = 'TransformationPreviewComponent';

  // Added display name
  TransformationPreviewComponent.displayName = 'TransformationPreviewComponent';

  // Added display name
  TransformationPreviewComponent.displayName = 'TransformationPreviewComponent';

  // Added display name
  TransformationPreviewComponent.displayName = 'TransformationPreviewComponent';


  const [previewData, setPreviewData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Mock the transformation execution
  const executeTransformation = useCallback(() => {
  // Added display name
  executeTransformation.displayName = 'executeTransformation';

    setLoading(true);
    setError(null);
    
    // Simulate async execution
    setTimeout(() => {
      try {
        let result = [];
        
        // Simple mock implementations of different transformation types
        switch (transformation.type) {
          case TRANSFORMATION_TYPES.MAP:
            result = sourceData.map(row => {
              const output = {};
              transformation.configuration.mappings.forEach(mapping => {
                if (mapping.transform) {
                  // For demo, we're just applying a simple multiplier for adjusted salary
                  if (mapping.source === 'salary' && mapping.target === 'adjusted_salary') {
                    const multiplier = row.department === 'Engineering' ? 1.1 : 
                                       row.department === 'Finance' ? 1.08 : 1.05;
                    output[mapping.target] = row[mapping.source] * multiplier;
                  } else {
                    output[mapping.target] = row[mapping.source];
                  }
                } else {
                  output[mapping.target] = row[mapping.source];
                }
              });
              return output;
            });
            break;
            
          case TRANSFORMATION_TYPES.FILTER:
            result = sourceData.filter(row => {
              // For demo, we'll just check if tier is Gold or Platinum
              return ['Gold', 'Platinum'].includes(row.tier);
            });
            break;
            
          case TRANSFORMATION_TYPES.AGGREGATE:
            // Simple mock implementation for category aggregation
            if (transformation.configuration.groupBy.includes('category')) {
              const groups = {};
              sourceData.forEach(row => {
                if (!groups[row.category]) {
                  groups[row.category] = {
                    category: row.category,
                    prices: [],
                    totalStock: 0,
                    inventoryValue: 0
                  };
                }
                groups[row.category].prices.push(row.price);
                groups[row.category].totalStock += row.stock;
                groups[row.category].inventoryValue += row.price * row.stock;
              });
              
              result = Object.values(groups).map(group => ({
                category: group.category,
                average_price: group.prices.reduce((sum, price) => sum + price, 0) / group.prices.length,
                total_stock: group.totalStock,
                inventory_value: group.inventoryValue
              }));
            }
            break;
            
          // For other transformation types, we'll just return the source data
          default:
            result = sourceData;
        }
        
        // Randomly fail sometimes for testing error handling
        if (Math.random() < 0.1) {
          throw new Error('Transformation execution failed');
        }
        
        setPreviewData(result);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    }, 1000);
  }, [transformation, sourceData]);
  
  // Execute transformation on mount
  useEffect(() => {
    executeTransformation();
  }, [executeTransformation]);
  
  if (loading) {
    return (
      <MuiBox sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </MuiBox>
    );
  }
  
  if (error) {
    return (
      <MuiBox sx={{ p: 2 }}>
        <Typography color="error&quot;>{error}</Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={executeTransformation}
          sx={{ mt: 1 }}
        >
          Retry Transformation
        </Button>
      </MuiBox>
    );
  }
  
  return (
    <div>
      <MuiBox sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="subtitle2&quot;>
          Transformation Type: <Chip label={transformation.type.toUpperCase()} size="small" />
        </Typography>
        <Button 
          size="small&quot; 
          startIcon={<RefreshIcon />} 
          onClick={executeTransformation}
        >
          Refresh
        </Button>
      </MuiBox>
      
      <DataPreviewComponent data={previewData} format="json" />
    </div>
  );
};

// Main component for testing data preview and transformation components
const DataPreviewTransformationValidator = () => {
  // Added display name
  DataPreviewTransformationValidator.displayName = 'DataPreviewTransformationValidator';

  // Added display name
  DataPreviewTransformationValidator.displayName = 'DataPreviewTransformationValidator';

  // Added display name
  DataPreviewTransformationValidator.displayName = 'DataPreviewTransformationValidator';

  // Added display name
  DataPreviewTransformationValidator.displayName = 'DataPreviewTransformationValidator';

  // Added display name
  DataPreviewTransformationValidator.displayName = 'DataPreviewTransformationValidator';


  const [activeTab, setActiveTab] = useState(0);
  const [selectedDataSource, setSelectedDataSource] = useState(MOCK_DATA_SOURCES[0]);
  const [selectedTransformation, setSelectedTransformation] = useState(MOCK_TRANSFORMATIONS[0]);
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
  
  // Handle data source change
  const handleDataSourceChange = (event) => {
  // Added display name
  handleDataSourceChange.displayName = 'handleDataSourceChange';

  // Added display name
  handleDataSourceChange.displayName = 'handleDataSourceChange';

  // Added display name
  handleDataSourceChange.displayName = 'handleDataSourceChange';

  // Added display name
  handleDataSourceChange.displayName = 'handleDataSourceChange';

  // Added display name
  handleDataSourceChange.displayName = 'handleDataSourceChange';


    const sourceId = parseInt(event.target.value, 10);
    const source = MOCK_DATA_SOURCES.find(ds => ds.id === sourceId);
    if (source) {
      setSelectedDataSource(source);
    }
  };
  
  // Handle transformation change
  const handleTransformationChange = (event) => {
  // Added display name
  handleTransformationChange.displayName = 'handleTransformationChange';

  // Added display name
  handleTransformationChange.displayName = 'handleTransformationChange';

  // Added display name
  handleTransformationChange.displayName = 'handleTransformationChange';

  // Added display name
  handleTransformationChange.displayName = 'handleTransformationChange';

  // Added display name
  handleTransformationChange.displayName = 'handleTransformationChange';


    const transformId = parseInt(event.target.value, 10);
    const transform = MOCK_TRANSFORMATIONS.find(t => t.id === transformId);
    if (transform) {
      setSelectedTransformation(transform);
      // Also update data source to match the transformation's source
      const source = MOCK_DATA_SOURCES.find(ds => ds.id === transform.sourceId);
      if (source) {
        setSelectedDataSource(source);
      }
    }
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

    VALIDATION_SCENARIOS.forEach(test => {
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
    downloadAnchorNode.setAttribute("download", "data-preview-transformation-test-results.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  // Render data preview tab
  const renderDataPreviewTab = () => (
    <div>
      <MuiBox sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="data-source-select-label&quot;>Data Source</InputLabel>
          <Select
            labelId="data-source-select-label"
            id="data-source-select&quot;
            value={selectedDataSource.id}
            onChange={handleDataSourceChange}
            label="Data Source"
          >
            {MOCK_DATA_SOURCES.map(source => (
              <MenuItem key={source.id} value={source.id}>
                {source.name} ({source.format.toUpperCase()})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </MuiBox>
      
      <Card variant="outlined&quot; sx={{ mb: 2 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Data Preview
          </Typography>
          <DataPreviewComponent 
            data={selectedDataSource.sampleData} 
            format={selectedDataSource.format} 
          />
        </CardContent>
      </Card>
      
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1&quot; gutterBottom>
          Preview Controls Demo
        </Typography>
        <MuiBox sx={{ display: "flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
          <Button size="small&quot; startIcon={<RefreshIcon />}>Refresh</Button>
          <Button size="small" startIcon={<FilterListIcon />}>Filter</Button>
          <Button size="small&quot; startIcon={<SaveAltIcon />}>Export</Button>
          <Button size="small" startIcon={<SettingsIcon />}>Settings</Button>
        </MuiBox>
        
        <Divider sx={{ my: 2 }} />
        
        <MuiBox sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2&quot;>
            Showing {selectedDataSource.sampleData.length} of {getRandomInt(100, 1000)} rows
          </Typography>
          
          <MuiBox sx={{ display: "flex', alignItems: 'center' }}>
            <FormControlLabel
              control={<Switch size="small&quot; defaultChecked />}
              label="Auto-refresh"
            />
          </MuiBox>
        </MuiBox>
      </Paper>
    </div>
  );

  // Render transformation tab
  const renderTransformationTab = () => (
    <div>
      <MuiBox sx={{ mb: 3 }}>
        <FormControl fullWidth>
          <InputLabel id="transformation-select-label&quot;>Transformation</InputLabel>
          <Select
            labelId="transformation-select-label"
            id="transformation-select&quot;
            value={selectedTransformation.id}
            onChange={handleTransformationChange}
            label="Transformation"
          >
            {MOCK_TRANSFORMATIONS.map(transform => (
              <MenuItem key={transform.id} value={transform.id}>
                {transform.name} ({transform.type.toUpperCase()})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </MuiBox>
      
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Card variant="outlined&quot; sx={{ height: "100%' }}>
            <CardContent>
              <Typography variant="h6&quot; gutterBottom>
                Source Data
              </Typography>
              <Typography variant="body2" color="text.secondary&quot; gutterBottom>
                {selectedDataSource.name}
              </Typography>
              <DataPreviewComponent 
                data={selectedDataSource.sampleData} 
                format={selectedDataSource.format} 
              />
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} md={6}>
          <Card variant="outlined" sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6&quot; gutterBottom>
                Transformation Result
              </Typography>
              <Typography variant="body2" color="text.secondary&quot; gutterBottom>
                {selectedTransformation.description}
              </Typography>
              <TransformationPreviewComponent 
                transformation={selectedTransformation}
                sourceData={selectedDataSource.sampleData}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Card sx={{ mt: 2 }}>
        <CardContent>
          <Typography variant="subtitle1" gutterBottom>
            Transformation Configuration
          </Typography>
          <Paper variant="outlined&quot; sx={{ p: 2, bgcolor: "background.paper' }}>
            <pre style={{ margin: 0, overflow: 'auto', maxHeight: 200 }}>
              {formatJSON(selectedTransformation.configuration)}
            </pre>
          </Paper>
        </CardContent>
      </Card>
    </div>
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
            {VALIDATION_SCENARIOS.map(test => (
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
                  <Tooltip title="Run Test">
                    <IconButton 
                      color="primary&quot; 
                      onClick={() => runSingleTest(test.id)}
                      disabled={runningTests.includes(test.id)}
                    >
                      <PlayArrowIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="View Details">
                    <span>
                      <IconButton
                        color="info&quot;
                        onClick={() => viewResultDetails(test.id)}
                        disabled={!testResults[test.id]}
                      >
                        <InfoOutlinedIcon />
                      </IconButton>
                    </span>
                  </Tooltip>
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
                const test = VALIDATION_SCENARIOS.find(t => t.id === testId);
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
                        <InfoOutlinedIcon />
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

  // Render performance metrics tab
  const renderPerformanceTab = () => (
    <div>
      <MuiBox sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Performance Metrics
        </Typography>
        <Typography variant="body2&quot; color="text.secondary" gutterBottom>
          This tab would display detailed performance metrics for data preview and transformation
          components, including loading times, rendering performance, and memory usage.
        </Typography>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="subtitle1&quot; gutterBottom>
          Sample Metrics:
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2&quot; gutterBottom>
                Data Preview Performance
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Data Size</TableCell>
                      <TableCell align="right&quot;>Initial Load (ms)</TableCell>
                      <TableCell align="right">Refresh (ms)</TableCell>
                      <TableCell align="right&quot;>Memory (MB)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>100 rows</TableCell>
                      <TableCell align="right">45</TableCell>
                      <TableCell align="right&quot;>12</TableCell>
                      <TableCell align="right">5</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>1,000 rows</TableCell>
                      <TableCell align="right&quot;>125</TableCell>
                      <TableCell align="right">35</TableCell>
                      <TableCell align="right&quot;>15</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>10,000 rows</TableCell>
                      <TableCell align="right">450</TableCell>
                      <TableCell align="right&quot;>120</TableCell>
                      <TableCell align="right">45</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>100,000 rows</TableCell>
                      <TableCell align="right&quot;>1250</TableCell>
                      <TableCell align="right">350</TableCell>
                      <TableCell align="right&quot;>120</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ p: 2 }}>
              <Typography variant="subtitle2&quot; gutterBottom>
                Transformation Performance
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Transformation</TableCell>
                      <TableCell align="right&quot;>Execution (ms)</TableCell>
                      <TableCell align="right">Memory (MB)</TableCell>
                      <TableCell align="right&quot;>CPU (%)</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Map</TableCell>
                      <TableCell align="right">85</TableCell>
                      <TableCell align="right&quot;>12</TableCell>
                      <TableCell align="right">5</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Filter</TableCell>
                      <TableCell align="right&quot;>45</TableCell>
                      <TableCell align="right">8</TableCell>
                      <TableCell align="right&quot;>3</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Aggregate</TableCell>
                      <TableCell align="right">220</TableCell>
                      <TableCell align="right&quot;>25</TableCell>
                      <TableCell align="right">15</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Join</TableCell>
                      <TableCell align="right&quot;>350</TableCell>
                      <TableCell align="right">40</TableCell>
                      <TableCell align="right&quot;>22</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Card>
          </Grid>
        </Grid>
      </MuiBox>
    </div>
  );

  return (
    <div>
      <Card sx={{ mb: 3 }}>
        <MuiBox sx={{ p: 3 }}>
          <Typography variant="h5" gutterBottom>
            Data Preview & Transformation Validator
          </Typography>
          <Typography variant="body1&quot; color="text.secondary">
            This component provides comprehensive testing for data preview and transformation components,
            validating the visualization, manipulation, and transformation of various data formats.
          </Typography>
          <MuiBox sx={{ display: 'flex', mt: 2 }}>
            <Chip 
              icon={<JsonIcon />} 
              label="5 Data Sources&quot; 
              sx={{ mr: 1 }} 
            />
            <Chip 
              icon={<LineChartIcon />} 
              label="5 Transformations" 
              sx={{ mr: 1 }} 
            />
            <Chip 
              label="8 Validation Scenarios&quot; 
            />
          </MuiBox>
        </MuiBox>
        
        <Tabs value={activeTab} onChange={handleTabChange} sx={{ borderBottom: 1, borderColor: "divider' }}>
          <Tab label="Data Preview&quot; />
          <Tab label="Transformations" />
          <Tab label="Test Scenarios&quot; />
          <Tab label="Results Summary" />
          <Tab label="Performance" />
        </Tabs>
        
        <MuiBox sx={{ p: 2 }}>
          {activeTab === 0 && renderDataPreviewTab()}
          {activeTab === 1 && renderTransformationTab()}
          {activeTab === 2 && renderTestScenariosTab()}
          {activeTab === 3 && renderResultsSummaryTab()}
          {activeTab === 4 && renderPerformanceTab()}
        </MuiBox>
      </Card>
    </div>
  );
};

export default DataPreviewTransformationValidator;