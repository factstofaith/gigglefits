/**
 * Mock data for testing the Integration Monitoring Dashboard
 */

export const MOCK_INTEGRATIONS = [
  {
    id: 1,
    name: 'Customer CRM Sync',
    description: 'Syncs customer data from CRM to data warehouse',
    status: 'running',
    type: 'Scheduled Sync',
    source: 'Salesforce CRM',
    destination: 'Snowflake',
    schedule: 'Every 30 minutes',
    lastRun: {
      timestamp: '2025-03-24T10:30:00Z',
      status: 'completed',
      duration: 75000, // 1m 15s
      recordCount: 1450,
      errorCount: 0
    },
    runCount: 145,
    errorCount: 2,
    successRate: 98.6,
    avgDuration: 82000, // 1m 22s
    createdAt: '2025-01-15T08:00:00Z',
    updatedAt: '2025-03-20T14:22:00Z',
    tags: ['production', 'crm', 'snowflake'],
    history: [
      {
        timestamp: '2025-03-24T10:30:00Z',
        status: 'completed',
        duration: 75000,
        recordCount: 1450,
        errorCount: 0
      },
      {
        timestamp: '2025-03-24T10:00:00Z',
        status: 'completed',
        duration: 82000,
        recordCount: 1438,
        errorCount: 0
      },
      {
        timestamp: '2025-03-24T09:30:00Z',
        status: 'completed',
        duration: 79000,
        recordCount: 1445,
        errorCount: 0
      },
      {
        timestamp: '2025-03-24T09:00:00Z',
        status: 'completed',
        duration: 85000,
        recordCount: 1460,
        errorCount: 0
      },
      {
        timestamp: '2025-03-24T08:30:00Z',
        status: 'completed',
        duration: 78000,
        recordCount: 1440,
        errorCount: 0
      }
    ]
  },
  {
    id: 2,
    name: 'Product Catalog ETL',
    description: 'Extracts and transforms product catalog data',
    status: 'failed',
    type: 'Batch ETL',
    source: 'Product Database',
    destination: 'E-commerce Platform',
    schedule: 'Daily at 2:00 AM',
    lastRun: {
      timestamp: '2025-03-24T02:00:00Z',
      status: 'failed',
      duration: 320000, // 5m 20s
      recordCount: 8500,
      errorCount: 12
    },
    runCount: 84,
    errorCount: 7,
    successRate: 91.7,
    avgDuration: 310000, // 5m 10s
    createdAt: '2025-01-25T14:30:00Z',
    updatedAt: '2025-03-23T22:15:00Z',
    tags: ['production', 'catalog', 'etl'],
    history: [
      {
        timestamp: '2025-03-24T02:00:00Z',
        status: 'failed',
        duration: 320000,
        recordCount: 8500,
        errorCount: 12
      },
      {
        timestamp: '2025-03-23T02:00:00Z',
        status: 'completed',
        duration: 305000,
        recordCount: 8450,
        errorCount: 0
      },
      {
        timestamp: '2025-03-22T02:00:00Z',
        status: 'completed',
        duration: 298000,
        recordCount: 8420,
        errorCount: 0
      },
      {
        timestamp: '2025-03-21T02:00:00Z',
        status: 'failed',
        duration: 340000,
        recordCount: 8500,
        errorCount: 8
      },
      {
        timestamp: '2025-03-20T02:00:00Z',
        status: 'completed',
        duration: 310000,
        recordCount: 8380,
        errorCount: 0
      }
    ]
  },
  {
    id: 3,
    name: 'Marketing Campaign Data',
    description: 'Syncs marketing campaign metrics from multiple sources',
    status: 'paused',
    type: 'Data Integration',
    source: 'Marketing Platforms',
    destination: 'Marketing Analytics',
    schedule: 'Every 2 hours',
    lastRun: {
      timestamp: '2025-03-23T22:00:00Z',
      status: 'completed',
      duration: 180000, // 3m
      recordCount: 2200,
      errorCount: 0
    },
    runCount: 256,
    errorCount: 15,
    successRate: 94.1,
    avgDuration: 175000, // 2m 55s
    createdAt: '2025-02-10T09:45:00Z',
    updatedAt: '2025-03-24T08:30:00Z',
    tags: ['production', 'marketing', 'analytics'],
    history: [
      {
        timestamp: '2025-03-23T22:00:00Z',
        status: 'completed',
        duration: 180000,
        recordCount: 2200,
        errorCount: 0
      },
      {
        timestamp: '2025-03-23T20:00:00Z',
        status: 'completed',
        duration: 172000,
        recordCount: 2180,
        errorCount: 0
      },
      {
        timestamp: '2025-03-23T18:00:00Z',
        status: 'completed',
        duration: 178000,
        recordCount: 2190,
        errorCount: 0
      },
      {
        timestamp: '2025-03-23T16:00:00Z',
        status: 'completed',
        duration: 175000,
        recordCount: 2185,
        errorCount: 0
      },
      {
        timestamp: '2025-03-23T14:00:00Z',
        status: 'completed',
        duration: 169000,
        recordCount: 2150,
        errorCount: 0
      }
    ]
  },
  {
    id: 4,
    name: 'HR Employee Data Sync',
    description: 'Syncs employee data between HR systems',
    status: 'completed',
    type: 'Bidirectional Sync',
    source: 'HRIS',
    destination: 'Payroll System',
    schedule: 'Daily at 1:00 AM',
    lastRun: {
      timestamp: '2025-03-24T01:00:00Z',
      status: 'completed',
      duration: 450000, // 7m 30s
      recordCount: 3200,
      errorCount: 0
    },
    runCount: 78,
    errorCount: 3,
    successRate: 96.2,
    avgDuration: 460000, // 7m 40s
    createdAt: '2025-01-05T10:20:00Z',
    updatedAt: '2025-03-20T16:45:00Z',
    tags: ['production', 'hr', 'bidirectional'],
    history: [
      {
        timestamp: '2025-03-24T01:00:00Z',
        status: 'completed',
        duration: 450000,
        recordCount: 3200,
        errorCount: 0
      },
      {
        timestamp: '2025-03-23T01:00:00Z',
        status: 'completed',
        duration: 455000,
        recordCount: 3190,
        errorCount: 0
      },
      {
        timestamp: '2025-03-22T01:00:00Z',
        status: 'completed',
        duration: 462000,
        recordCount: 3195,
        errorCount: 0
      },
      {
        timestamp: '2025-03-21T01:00:00Z',
        status: 'completed',
        duration: 458000,
        recordCount: 3205,
        errorCount: 0
      },
      {
        timestamp: '2025-03-20T01:00:00Z',
        status: 'failed',
        duration: 480000,
        recordCount: 3210,
        errorCount: 5
      }
    ]
  },
  {
    id: 5,
    name: 'Inventory Sync',
    description: 'Real-time inventory synchronization',
    status: 'running',
    type: 'Real-time Sync',
    source: 'Inventory System',
    destination: 'E-commerce Platform',
    schedule: 'Continuous',
    lastRun: {
      timestamp: '2025-03-24T11:15:00Z',
      status: 'running',
      duration: 7200000, // 2h running
      recordCount: 42500,
      errorCount: 0
    },
    runCount: 365,
    errorCount: 18,
    successRate: 95.1,
    avgDuration: 86400000, // 24h (continuous)
    createdAt: '2025-01-10T08:30:00Z',
    updatedAt: '2025-03-22T09:15:00Z',
    tags: ['production', 'inventory', 'real-time'],
    history: [
      {
        timestamp: '2025-03-23T00:00:00Z',
        status: 'completed',
        duration: 86400000,
        recordCount: 145000,
        errorCount: 0
      },
      {
        timestamp: '2025-03-22T00:00:00Z',
        status: 'completed',
        duration: 86400000,
        recordCount: 142000,
        errorCount: 0
      },
      {
        timestamp: '2025-03-21T00:00:00Z',
        status: 'completed',
        duration: 86400000,
        recordCount: 138000,
        errorCount: 0
      },
      {
        timestamp: '2025-03-20T00:00:00Z',
        status: 'completed',
        duration: 86400000,
        recordCount: 140000,
        errorCount: 8
      },
      {
        timestamp: '2025-03-19T00:00:00Z',
        status: 'completed',
        duration: 86400000,
        recordCount: 135000,
        errorCount: 0
      }
    ]
  },
  {
    id: 6,
    name: 'Financial Data ETL',
    description: 'ETL pipeline for financial reporting data',
    status: 'inactive',
    type: 'Batch ETL',
    source: 'Financial Systems',
    destination: 'Data Warehouse',
    schedule: 'Weekly on Sunday',
    lastRun: {
      timestamp: '2025-03-17T02:00:00Z',
      status: 'completed',
      duration: 5400000, // 1h 30m
      recordCount: 18500,
      errorCount: 0
    },
    runCount: 12,
    errorCount: 1,
    successRate: 91.7,
    avgDuration: 5500000, // 1h 31m 40s
    createdAt: '2025-01-02T09:00:00Z',
    updatedAt: '2025-03-18T14:20:00Z',
    tags: ['finance', 'reporting', 'weekly'],
    history: [
      {
        timestamp: '2025-03-17T02:00:00Z',
        status: 'completed',
        duration: 5400000,
        recordCount: 18500,
        errorCount: 0
      },
      {
        timestamp: '2025-03-10T02:00:00Z',
        status: 'completed',
        duration: 5450000,
        recordCount: 18600,
        errorCount: 0
      },
      {
        timestamp: '2025-03-03T02:00:00Z',
        status: 'completed',
        duration: 5520000,
        recordCount: 18700,
        errorCount: 0
      },
      {
        timestamp: '2025-02-24T02:00:00Z',
        status: 'failed',
        duration: 5800000,
        recordCount: 18800,
        errorCount: 35
      },
      {
        timestamp: '2025-02-17T02:00:00Z',
        status: 'completed',
        duration: 5380000,
        recordCount: 18400,
        errorCount: 0
      }
    ]
  },
  {
    id: 7,
    name: 'Customer Feedback Analysis',
    description: 'Processes and analyzes customer feedback from multiple sources',
    status: 'running',
    type: 'Data Processing',
    source: 'Feedback Platforms',
    destination: 'Analytics Dashboard',
    schedule: 'Every 4 hours',
    lastRun: {
      timestamp: '2025-03-24T08:00:00Z',
      status: 'completed',
      duration: 840000, // 14m
      recordCount: 5200,
      errorCount: 0
    },
    runCount: 132,
    errorCount: 8,
    successRate: 93.9,
    avgDuration: 850000, // 14m 10s
    createdAt: '2025-02-15T11:30:00Z',
    updatedAt: '2025-03-22T16:40:00Z',
    tags: ['production', 'feedback', 'analytics'],
    history: [
      {
        timestamp: '2025-03-24T08:00:00Z',
        status: 'completed',
        duration: 840000,
        recordCount: 5200,
        errorCount: 0
      },
      {
        timestamp: '2025-03-24T04:00:00Z',
        status: 'completed',
        duration: 835000,
        recordCount: 5150,
        errorCount: 0
      },
      {
        timestamp: '2025-03-24T00:00:00Z',
        status: 'completed',
        duration: 845000,
        recordCount: 5180,
        errorCount: 0
      },
      {
        timestamp: '2025-03-23T20:00:00Z',
        status: 'completed',
        duration: 855000,
        recordCount: 5220,
        errorCount: 0
      },
      {
        timestamp: '2025-03-23T16:00:00Z',
        status: 'completed',
        duration: 830000,
        recordCount: 5100,
        errorCount: 0
      }
    ]
  },
  {
    id: 8,
    name: 'Log Data Processing',
    description: 'Processes and aggregates application logs',
    status: 'paused',
    type: 'Stream Processing',
    source: 'Application Logs',
    destination: 'Monitoring System',
    schedule: 'Continuous',
    lastRun: {
      timestamp: '2025-03-24T06:30:00Z',
      status: 'paused',
      duration: 14400000, // 4h
      recordCount: 2500000,
      errorCount: 15
    },
    runCount: 90,
    errorCount: 42,
    successRate: 87.8,
    avgDuration: 86400000, // 24h (continuous)
    createdAt: '2025-02-01T10:00:00Z',
    updatedAt: '2025-03-24T06:30:00Z',
    tags: ['production', 'logs', 'monitoring'],
    history: [
      {
        timestamp: '2025-03-24T06:30:00Z',
        status: 'paused',
        duration: 14400000,
        recordCount: 2500000,
        errorCount: 15
      },
      {
        timestamp: '2025-03-23T00:00:00Z',
        status: 'completed',
        duration: 86400000,
        recordCount: 8500000,
        errorCount: 8
      },
      {
        timestamp: '2025-03-22T00:00:00Z',
        status: 'completed',
        duration: 86400000,
        recordCount: 8300000,
        errorCount: 12
      },
      {
        timestamp: '2025-03-21T00:00:00Z',
        status: 'failed',
        duration: 65000000,
        recordCount: 6200000,
        errorCount: 156
      },
      {
        timestamp: '2025-03-20T00:00:00Z',
        status: 'completed',
        duration: 86400000,
        recordCount: 8400000,
        errorCount: 5
      }
    ]
  }
];

export default MOCK_INTEGRATIONS;