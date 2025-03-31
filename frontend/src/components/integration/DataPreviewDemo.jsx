/**
 * DataPreviewDemo Component
 * 
 * A demo component to showcase the DataPreview functionality
 * including schema inference and data quality indicators.
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Alert
} from '@mui/material';

// Import components
import DataPreview from './DataPreview';

// Import sample data sets
const SAMPLE_DATASETS = {
  customers: [
    { id: 1, firstName: 'John', lastName: 'Doe', email: 'john.doe@example.com', age: 32, isActive: true, registeredDate: '2023-01-15', lastLogin: '2023-05-20T14:30:45Z', accountBalance: 125.50 },
    { id: 2, firstName: 'Jane', lastName: 'Smith', email: 'jane.smith@example.com', age: 28, isActive: true, registeredDate: '2023-02-28', lastLogin: '2023-05-18T09:15:30Z', accountBalance: 250.75 },
    { id: 3, firstName: 'Bob', lastName: 'Johnson', email: 'bob.johnson@example.com', age: 45, isActive: false, registeredDate: '2022-11-05', lastLogin: '2023-03-10T11:45:20Z', accountBalance: 0 },
    { id: 4, firstName: 'Alice', lastName: 'Williams', email: 'alice.williams@example.com', age: 38, isActive: true, registeredDate: '2023-03-10', lastLogin: '2023-05-21T16:20:15Z', accountBalance: 540.25 },
    { id: 5, firstName: 'Charlie', lastName: 'Brown', email: 'charlie.brown@example.com', age: 22, isActive: true, registeredDate: '2023-04-05', lastLogin: '2023-05-19T13:10:05Z', accountBalance: 75.80 }
  ],
  orders: [
    { orderId: 'ORD-001', customerId: 1, orderDate: '2023-05-01', status: 'delivered', total: 125.50, items: 3, shippingAddress: '123 Main St, Anytown, USA', paymentMethod: 'credit_card' },
    { orderId: 'ORD-002', customerId: 2, orderDate: '2023-05-05', status: 'shipped', total: 85.25, items: 2, shippingAddress: '456 Elm St, Somewhere, USA', paymentMethod: 'paypal' },
    { orderId: 'ORD-003', customerId: 1, orderDate: '2023-05-10', status: 'processing', total: 45.00, items: 1, shippingAddress: '123 Main St, Anytown, USA', paymentMethod: 'credit_card' },
    { orderId: 'ORD-004', customerId: 4, orderDate: '2023-05-12', status: 'delivered', total: 210.75, items: 4, shippingAddress: '789 Oak St, Nowhere, USA', paymentMethod: 'bank_transfer' },
    { orderId: 'ORD-005', customerId: 5, orderDate: '2023-05-15', status: 'shipped', total: 75.80, items: 2, shippingAddress: '101 Pine St, Elsewhere, USA', paymentMethod: 'paypal' }
  ],
  products: [
    { productId: 'P-001', name: 'Smartphone', category: 'Electronics', price: 699.99, inStock: true, rating: 4.5, description: 'Latest model smartphone with advanced features', tags: ['electronics', 'smartphone', 'gadget'] },
    { productId: 'P-002', name: 'Laptop', category: 'Electronics', price: 1299.99, inStock: true, rating: 4.8, description: 'High-performance laptop for professionals', tags: ['electronics', 'computer', 'laptop'] },
    { productId: 'P-003', name: 'Headphones', category: 'Electronics', price: 149.99, inStock: false, rating: 4.3, description: 'Wireless noise-cancelling headphones', tags: ['electronics', 'audio', 'headphones'] },
    { productId: 'P-004', name: 'Coffee Maker', category: 'Kitchen', price: 89.99, inStock: true, rating: 4.0, description: 'Automatic drip coffee maker with timer', tags: ['kitchen', 'appliance', 'coffee'] },
    { productId: 'P-005', name: 'Blender', category: 'Kitchen', price: 59.99, inStock: true, rating: 3.9, description: 'High-speed blender for smoothies and more', tags: ['kitchen', 'appliance', 'blender'] }
  ],
  events: [
    { eventId: 'E-001', type: 'login', userId: 1, timestamp: '2023-05-20T14:30:45Z', ipAddress: '192.168.1.1', userAgent: 'Mozilla/5.0', status: 'success' },
    { eventId: 'E-002', type: 'purchase', userId: 2, timestamp: '2023-05-19T10:15:30Z', ipAddress: '192.168.1.2', userAgent: 'Chrome/90.0', status: 'success', amount: 85.25 },
    { eventId: 'E-003', type: 'login', userId: 3, timestamp: '2023-03-10T11:45:20Z', ipAddress: '192.168.1.3', userAgent: 'Safari/14.0', status: 'failure' },
    { eventId: 'E-004', type: 'login', userId: 4, timestamp: '2023-05-21T16:20:15Z', ipAddress: '192.168.1.4', userAgent: 'Firefox/88.0', status: 'success' },
    { eventId: 'E-005', type: 'purchase', userId: 5, timestamp: '2023-05-18T13:10:05Z', ipAddress: '192.168.1.5', userAgent: 'Chrome/91.0', status: 'success', amount: 75.80 }
  ]
};

/**
 * DataPreviewDemo Component
 */
const DataPreviewDemo = () => {
  const [selectedDataset, setSelectedDataset] = useState('customers');
  const [data, setData] = useState([]);
  const [inferredSchema, setInferredSchema] = useState(null);
  const [qualityResults, setQualityResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Load the selected dataset
  useEffect(() => {
    setIsLoading(true);
    // Simulate API loading with setTimeout
    setTimeout(() => {
      setData(SAMPLE_DATASETS[selectedDataset] || []);
      setInferredSchema(null);
      setIsLoading(false);
    }, 500);
  }, [selectedDataset]);

  // Handle dataset selection change
  const handleDatasetChange = (event) => {
    setSelectedDataset(event.target.value);
  };

  // Handle schema inference event
  const handleSchemaInferred = (schema) => {
    setInferredSchema(schema);
    console.log('Inferred schema:', schema);
  };
  
  // Handle quality analysis event
  const handleQualityAnalyzed = (quality) => {
    setQualityResults(quality);
    console.log('Quality results:', quality);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Data Preview & Quality Demo
      </Typography>
      
      <Typography variant="body1" paragraph>
        This demo showcases the dataset preview functionality, including schema inference and data quality analysis.
        Select a sample dataset to see all features in action.
      </Typography>
      
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="dataset-select-label">Sample Dataset</InputLabel>
              <Select
                labelId="dataset-select-label"
                value={selectedDataset}
                label="Sample Dataset"
                onChange={handleDatasetChange}
              >
                <MenuItem value="customers">Customer Records</MenuItem>
                <MenuItem value="orders">Order Data</MenuItem>
                <MenuItem value="products">Product Catalog</MenuItem>
                <MenuItem value="events">Event Logs</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={8}>
            <Alert severity="info">
              Explore different views: Table view, JSON view, Schema inference, and Data quality analysis.
            </Alert>
          </Grid>
        </Grid>
      </Paper>
      
      <Box sx={{ height: 600 }}>
        <DataPreview
          data={data}
          isLoading={isLoading}
          dataSource={`Sample ${selectedDataset} dataset`}
          maxHeight={600}
          showDownload={true}
          showFilters={true}
          showValidation={true}
          showSchemaInference={true}
          initialViewMode="table"
          onSchemaInferred={handleSchemaInferred}
          onQualityAnalyzed={handleQualityAnalyzed}
        />
      </Box>
      
      <Box sx={{ mt: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              About Schema Inference
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" paragraph>
              Schema inference examines data to automatically identify field types, constraints, and structure.
              This enables systems to understand and validate data without manual configuration.
            </Typography>
            <Typography variant="body2" paragraph>
              Key features of our schema inference include:
            </Typography>
            <ul>
              <li>
                <Typography variant="body2">
                  Automatic detection of basic types (string, number, boolean) and specialized types (email, URL, date, etc.)
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Confidence scoring for type inference, with alternative type suggestions
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Statistical analysis of field values (min/max, averages, distributions)
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Identification of required fields and primary key candidates
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Export to standard schema formats like JSON Schema
                </Typography>
              </li>
            </ul>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Typography variant="h6" gutterBottom>
              About Data Quality Analysis
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="body2" paragraph>
              Data quality analysis evaluates your data against multiple dimensions to identify issues,
              provide actionable insights, and help ensure your data is fit for use.
            </Typography>
            <Typography variant="body2" paragraph>
              Key features of our data quality analysis include:
            </Typography>
            <ul>
              <li>
                <Typography variant="body2">
                  Comprehensive quality scoring across multiple dimensions (completeness, validity, consistency, etc.)
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Detailed field-level metrics to pinpoint problem areas
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Issue detection and categorization by severity
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Automatic detection of statistical outliers and anomalies
                </Typography>
              </li>
              <li>
                <Typography variant="body2">
                  Actionable recommendations to improve data quality
                </Typography>
              </li>
            </ul>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};

export default DataPreviewDemo;