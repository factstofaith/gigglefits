// DatabaseMetrics.jsx
// -----------------------------------------------------------------------------
// Component for displaying Azure PostgreSQL Database metrics

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {MuiBox as MuiBox, Typography, Grid} from '@design-system/';
import MetricChart from '@components/common/MetricChart';
import { getDatabaseMetrics } from '@services/azureMonitorService';
import MuiBox from '@mui/material/Box';

/**
 * Component for visualizing Azure PostgreSQL Database metrics
 * 
 * Displays CPU usage, memory usage, storage usage, connection count,
 * and query performance metrics with filtering by time range
 */
const DatabaseMetrics = ({ 
  databaseId, 
  databaseName = '', 
  initialTimeRange = '24h' 
}) => {
  // Added display name
  DatabaseMetrics.displayName = 'DatabaseMetrics';

  // Added display name
  DatabaseMetrics.displayName = 'DatabaseMetrics';

  // Added display name
  DatabaseMetrics.displayName = 'DatabaseMetrics';


  // State hooks
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    cpu: null,
    memory: null,
    storage: null,
    connections: null,
    queryPerformance: null,
    iops: null
  });

  // Load metrics on component mount and when timeRange changes
  useEffect(() => {
    fetchMetrics(timeRange);
  }, [databaseId, timeRange]);

  // Function to fetch metrics from the API
  const fetchMetrics = async (selectedTimeRange) => {
    if (!databaseId) {
      setError('No Database ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all metrics in parallel for efficiency
      const [cpuData, memoryData, storageData, connectionsData, queryPerformanceData, iopsData] = await Promise.all([
        getDatabaseMetrics(databaseId, 'cpu', selectedTimeRange),
        getDatabaseMetrics(databaseId, 'memory', selectedTimeRange),
        getDatabaseMetrics(databaseId, 'storage', selectedTimeRange),
        getDatabaseMetrics(databaseId, 'connections', selectedTimeRange),
        getDatabaseMetrics(databaseId, 'queryPerformance', selectedTimeRange),
        getDatabaseMetrics(databaseId, 'iops', selectedTimeRange)
      ]);

      // Update state with fetched metrics
      setMetrics({
        cpu: cpuData,
        memory: memoryData,
        storage: storageData,
        connections: connectionsData,
        queryPerformance: queryPerformanceData,
        iops: iopsData
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching Database metrics:', err);
      setError('Failed to load Database metrics. Please try again later.');
      setLoading(false);
    }
  };

  // Refresh metrics with selected time range
  const refreshMetrics = (selectedTimeRange) => {
  // Added display name
  refreshMetrics.displayName = 'refreshMetrics';

  // Added display name
  refreshMetrics.displayName = 'refreshMetrics';

  // Added display name
  refreshMetrics.displayName = 'refreshMetrics';


    setTimeRange(selectedTimeRange);
    fetchMetrics(selectedTimeRange);
  };

  // Handle metric download
  const handleDownload = (format, data, title) => {
  // Added display name
  handleDownload.displayName = 'handleDownload';

  // Added display name
  handleDownload.displayName = 'handleDownload';

  // Added display name
  handleDownload.displayName = 'handleDownload';


    // Only PNG can be directly downloaded from the chart
    if (format === 'PNG') {
      // Let the chart's internal download handler work
      return;
    }

    // For CSV and JSON, implement custom download logic
    if (format === 'CSV') {
      // Convert data to CSV format
      const headers = ['Timestamp', ...data.datasets.map(ds => ds.label || 'Value')].join(',');
      const rows = data.labels.map((label, i) => {
        const values = data.datasets.map(ds => ds.data[i]);
        return [label, ...values].join(',');
      });
      const csvContent = [headers, ...rows].join('\n');
      
      // Create and trigger download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } else if (format === 'JSON') {
      // Create JSON representation
      const jsonData = {
        title,
        timeRange,
        timestamp: new Date().toISOString(),
        data
      };
      
      // Create and trigger download
      const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  return (
    <MuiBox>
      <MuiBox marginBottom="md">
        <Typography variant="h5">
          {databaseName ? `${databaseName} Metrics` : 'Database Metrics'}
        </Typography>
        <Typography variant="body2" color="textSecondary">
          Azure PostgreSQL Database performance metrics and resource utilization
        </Typography>
      </MuiBox>

      <Grid container spacing={3}>
        {/* CPU Usage Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="CPU Usage"
            description="Percentage of allocated vCores used by the database"
            type="line"
            data={metrics.cpu}
            loading={loading && !metrics.cpu}
            error={error}
            height={250}
            refreshCallback={refreshMetrics}
            timeRanges={['1h', '6h', '24h', '7d', '30d']}
            initialTimeRange={timeRange}
            downloadOptions={['PNG', 'CSV', 'JSON']}
            onDownload={handleDownload}
            allowTypeChange={true}
          />
        </Grid>

        {/* Memory Usage Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Memory Usage"
            description="Percentage of allocated memory used by the database server"
            type="line"
            data={metrics.memory}
            loading={loading && !metrics.memory}
            error={error}
            height={250}
            refreshCallback={refreshMetrics}
            timeRanges={['1h', '6h', '24h', '7d', '30d']}
            initialTimeRange={timeRange}
            downloadOptions={['PNG', 'CSV', 'JSON']}
            onDownload={handleDownload}
            allowTypeChange={true}
          />
        </Grid>

        {/* Storage Usage Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Storage Usage"
            description="Percentage of allocated storage used by the database"
            type="line"
            data={metrics.storage}
            loading={loading && !metrics.storage}
            error={error}
            height={250}
            refreshCallback={refreshMetrics}
            timeRanges={['1h', '6h', '24h', '7d', '30d']}
            initialTimeRange={timeRange}
            downloadOptions={['PNG', 'CSV', 'JSON']}
            onDownload={handleDownload}
            allowTypeChange={true}
          />
        </Grid>

        {/* Connection Count Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Active Connections"
            description="Number of active database connections"
            type="line"
            data={metrics.connections}
            loading={loading && !metrics.connections}
            error={error}
            height={250}
            refreshCallback={refreshMetrics}
            timeRanges={['1h', '6h', '24h', '7d', '30d']}
            initialTimeRange={timeRange}
            downloadOptions={['PNG', 'CSV', 'JSON']}
            onDownload={handleDownload}
            allowTypeChange={true}
          />
        </Grid>

        {/* Query Performance Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Query Performance"
            description="Average query execution time in milliseconds"
            type="line"
            data={metrics.queryPerformance}
            loading={loading && !metrics.queryPerformance}
            error={error}
            height={250}
            refreshCallback={refreshMetrics}
            timeRanges={['1h', '6h', '24h', '7d', '30d']}
            initialTimeRange={timeRange}
            downloadOptions={['PNG', 'CSV', 'JSON']}
            onDownload={handleDownload}
            allowTypeChange={true}
          />
        </Grid>

        {/* IOPS Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="IOPS (I/O Operations)"
            description="Input/output operations per second"
            type="line"
            data={metrics.iops}
            loading={loading && !metrics.iops}
            error={error}
            height={250}
            refreshCallback={refreshMetrics}
            timeRanges={['1h', '6h', '24h', '7d', '30d']}
            initialTimeRange={timeRange}
            downloadOptions={['PNG', 'CSV', 'JSON']}
            onDownload={handleDownload}
            allowTypeChange={true}
          />
        </Grid>
      </Grid>
    </MuiBox>
  );
};

DatabaseMetrics.propTypes = {
  /** Azure Database resource ID */
  databaseId: PropTypes.string.isRequired,
  /** Optional display name for the Database */
  databaseName: PropTypes.string,
  /** Initial time range for metrics display */
  initialTimeRange: PropTypes.string
};

export default DatabaseMetrics;