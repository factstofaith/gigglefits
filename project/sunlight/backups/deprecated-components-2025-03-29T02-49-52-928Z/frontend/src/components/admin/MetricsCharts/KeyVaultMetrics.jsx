// KeyVaultMetrics.jsx
// -----------------------------------------------------------------------------
// Component for displaying Azure Key Vault metrics

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {MuiBox as MuiBox, Typography, Grid} from '@design-system/';
import MetricChart from '@components/common/MetricChart';
import { getKeyVaultMetrics } from '@services/azureMonitorService';
// Removed duplicate import

/**
 * Component for visualizing Azure Key Vault metrics
 * 
 * Displays API transactions, availability, saturation metrics,
 * and operation counts by type and result
 */
const KeyVaultMetrics = ({ 
  keyVaultId, 
  keyVaultName = '', 
  initialTimeRange = '24h' 
}) => {
  // Added display name
  KeyVaultMetrics.displayName = 'KeyVaultMetrics';

  // Added display name
  KeyVaultMetrics.displayName = 'KeyVaultMetrics';

  // Added display name
  KeyVaultMetrics.displayName = 'KeyVaultMetrics';

  // Added display name
  KeyVaultMetrics.displayName = 'KeyVaultMetrics';

  // Added display name
  KeyVaultMetrics.displayName = 'KeyVaultMetrics';


  // State hooks
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    apiRequests: null,
    availability: null,
    latency: null,
    operationTypes: null,
    operationResults: null,
    saturation: null
  });

  // Load metrics on component mount and when timeRange changes
  useEffect(() => {
    fetchMetrics(timeRange);
  }, [keyVaultId, timeRange]);

  // Function to fetch metrics from the API
  const fetchMetrics = async (selectedTimeRange) => {
    if (!keyVaultId) {
      setError('No Key Vault ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all metrics in parallel for efficiency
      const [apiRequestsData, availabilityData, latencyData, operationTypesData, operationResultsData, saturationData] = await Promise.all([
        getKeyVaultMetrics(keyVaultId, 'apiRequests', selectedTimeRange),
        getKeyVaultMetrics(keyVaultId, 'availability', selectedTimeRange),
        getKeyVaultMetrics(keyVaultId, 'latency', selectedTimeRange),
        getKeyVaultMetrics(keyVaultId, 'operationTypes', selectedTimeRange),
        getKeyVaultMetrics(keyVaultId, 'operationResults', selectedTimeRange),
        getKeyVaultMetrics(keyVaultId, 'saturation', selectedTimeRange)
      ]);

      // Update state with fetched metrics
      setMetrics({
        apiRequests: apiRequestsData,
        availability: availabilityData,
        latency: latencyData,
        operationTypes: operationTypesData,
        operationResults: operationResultsData,
        saturation: saturationData
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching Key Vault metrics:', err);
      setError('Failed to load Key Vault metrics. Please try again later.');
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
          {keyVaultName ? `${keyVaultName} Metrics` : 'Key Vault Metrics'}
        </Typography>
        <Typography variant="body2&quot; color="textSecondary">
          Azure Key Vault performance metrics and usage statistics
        </Typography>
      </MuiBox>

      <Grid container spacing={3}>
        {/* API Requests Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="API Requests&quot;
            description="Number of API requests made to the Key Vault"
            type="bar&quot;
            data={metrics.apiRequests}
            loading={loading && !metrics.apiRequests}
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

        {/* Availability Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Availability&quot;
            description="Percentage of successful requests to the Key Vault"
            type="line&quot;
            data={metrics.availability}
            loading={loading && !metrics.availability}
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

        {/* Latency Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Latency&quot;
            description="Average response time in milliseconds"
            type="line&quot;
            data={metrics.latency}
            loading={loading && !metrics.latency}
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

        {/* Saturation Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Service Saturation&quot;
            description="Vault capacity utilization percentage"
            type="line&quot;
            data={metrics.saturation}
            loading={loading && !metrics.saturation}
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

        {/* Operation Types Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Operation Types&quot;
            description="API calls by operation type (secrets, keys, certificates)"
            type="pie&quot;
            data={metrics.operationTypes}
            loading={loading && !metrics.operationTypes}
            error={error}
            height={325}
            refreshCallback={refreshMetrics}
            timeRanges={["1h', '6h', '24h', '7d', '30d']}
            initialTimeRange={timeRange}
            downloadOptions={['PNG', 'CSV', 'JSON']}
            onDownload={handleDownload}
            allowTypeChange={true}
          />
        </Grid>

        {/* Operation Results Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Operation Results&quot;
            description="API calls by result status (success, permission denied, etc.)"
            type="pie&quot;
            data={metrics.operationResults}
            loading={loading && !metrics.operationResults}
            error={error}
            height={325}
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

KeyVaultMetrics.propTypes = {
  /** Azure Key Vault resource ID */
  keyVaultId: PropTypes.string.isRequired,
  /** Optional display name for the Key Vault */
  keyVaultName: PropTypes.string,
  /** Initial time range for metrics display */
  initialTimeRange: PropTypes.string
};

export default KeyVaultMetrics;