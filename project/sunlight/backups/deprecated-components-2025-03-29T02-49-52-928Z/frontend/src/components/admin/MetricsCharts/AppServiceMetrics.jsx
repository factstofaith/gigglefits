// AppServiceMetrics.jsx
// -----------------------------------------------------------------------------
// Component for displaying Azure App Service metrics

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {MuiBox as MuiBox, Typography, Grid} from '@design-system/';
import MetricChart from '@components/common/MetricChart';
import { getAppServiceMetrics } from '@services/azureMonitorService';
// Removed duplicate import

/**
 * Component for visualizing Azure App Service metrics
 * 
 * Displays CPU usage, memory usage, HTTP response times, and request counts
 * with filtering by time range
 */
const AppServiceMetrics = ({ 
  appServiceId, 
  appServiceName = '', 
  initialTimeRange = '24h' 
}) => {
  // Added display name
  AppServiceMetrics.displayName = 'AppServiceMetrics';

  // Added display name
  AppServiceMetrics.displayName = 'AppServiceMetrics';

  // Added display name
  AppServiceMetrics.displayName = 'AppServiceMetrics';

  // Added display name
  AppServiceMetrics.displayName = 'AppServiceMetrics';

  // Added display name
  AppServiceMetrics.displayName = 'AppServiceMetrics';


  // State hooks
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    cpu: null,
    memory: null,
    responseTime: null,
    requests: null,
    errors: null
  });

  // Load metrics on component mount and when timeRange changes
  useEffect(() => {
    fetchMetrics(timeRange);
  }, [appServiceId, timeRange]);

  // Function to fetch metrics from the API
  const fetchMetrics = async (selectedTimeRange) => {
    if (!appServiceId) {
      setError('No App Service ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all metrics in parallel for efficiency
      const [cpuData, memoryData, responseTimeData, requestsData, errorsData] = await Promise.all([
        getAppServiceMetrics(appServiceId, 'cpu', selectedTimeRange),
        getAppServiceMetrics(appServiceId, 'memory', selectedTimeRange),
        getAppServiceMetrics(appServiceId, 'responseTime', selectedTimeRange),
        getAppServiceMetrics(appServiceId, 'requests', selectedTimeRange),
        getAppServiceMetrics(appServiceId, 'errors', selectedTimeRange)
      ]);

      // Update state with fetched metrics
      setMetrics({
        cpu: cpuData,
        memory: memoryData,
        responseTime: responseTimeData,
        requests: requestsData,
        errors: errorsData
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching App Service metrics:', err);
      setError('Failed to load App Service metrics. Please try again later.');
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
      <MuiBox marginBottom="md&quot;>
        <Typography variant="h5">
          {appServiceName ? `${appServiceName} Metrics` : 'App Service Metrics'}
        </Typography>
        <Typography variant="body2&quot; color="textSecondary">
          Azure App Service performance metrics and resource utilization
        </Typography>
      </MuiBox>

      <Grid container spacing={3}>
        {/* CPU Usage Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="CPU Usage&quot;
            description="Percentage of allocated CPU used by the app service"
            type="line&quot;
            data={metrics.cpu}
            loading={loading && !metrics.cpu}
            error={error}
            height={250}
            refreshCallback={refreshMetrics}
            timeRanges={["1h', '6h', '24h', '7d', '30d']}
            initialTimeRange={timeRange}
            downloadOptions={['PNG', 'CSV', 'JSON']}
            onDownload={handleDownload}
            allowTypeChange={true}
          />
        </Grid>

        {/* Memory Usage Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Memory Usage&quot;
            description="Percentage of allocated memory used by the app service"
            type="line&quot;
            data={metrics.memory}
            loading={loading && !metrics.memory}
            error={error}
            height={250}
            refreshCallback={refreshMetrics}
            timeRanges={["1h', '6h', '24h', '7d', '30d']}
            initialTimeRange={timeRange}
            downloadOptions={['PNG', 'CSV', 'JSON']}
            onDownload={handleDownload}
            allowTypeChange={true}
          />
        </Grid>

        {/* HTTP Response Time Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="HTTP Response Time&quot;
            description="Average response time in milliseconds"
            type="line&quot;
            data={metrics.responseTime}
            loading={loading && !metrics.responseTime}
            error={error}
            height={250}
            refreshCallback={refreshMetrics}
            timeRanges={["1h', '6h', '24h', '7d', '30d']}
            initialTimeRange={timeRange}
            downloadOptions={['PNG', 'CSV', 'JSON']}
            onDownload={handleDownload}
            allowTypeChange={true}
          />
        </Grid>

        {/* Request Count Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Request Count&quot;
            description="Number of HTTP requests processed"
            type="bar&quot;
            data={metrics.requests}
            loading={loading && !metrics.requests}
            error={error}
            height={250}
            refreshCallback={refreshMetrics}
            timeRanges={["1h', '6h', '24h', '7d', '30d']}
            initialTimeRange={timeRange}
            downloadOptions={['PNG', 'CSV', 'JSON']}
            onDownload={handleDownload}
            allowTypeChange={true}
          />
        </Grid>

        {/* Error Count Chart */}
        <Grid item xs={12}>
          <MetricChart
            title="HTTP Errors&quot;
            description="Count of HTTP server errors (5xx) and client errors (4xx)"
            type="bar&quot;
            data={metrics.errors}
            loading={loading && !metrics.errors}
            error={error}
            height={250}
            refreshCallback={refreshMetrics}
            timeRanges={["1h', '6h', '24h', '7d', '30d']}
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

AppServiceMetrics.propTypes = {
  /** Azure App Service resource ID */
  appServiceId: PropTypes.string.isRequired,
  /** Optional display name for the App Service */
  appServiceName: PropTypes.string,
  /** Initial time range for metrics display */
  initialTimeRange: PropTypes.string
};

export default AppServiceMetrics;