// StorageMetrics.jsx
// -----------------------------------------------------------------------------
// Component for displaying Azure Storage Account metrics

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {MuiBox as MuiBox, Typography, Grid} from '@design-system/';
import MetricChart from '@components/common/MetricChart';
import { getStorageMetrics } from '@services/azureMonitorService';
// Removed duplicate import

/**
 * Component for visualizing Azure Storage Account metrics
 * 
 * Displays availability, transaction counts, latency, capacity,
 * and ingress/egress data with filtering by time range
 */
const StorageMetrics = ({ 
  storageId, 
  storageName = '', 
  initialTimeRange = '24h' 
}) => {
  // Added display name
  StorageMetrics.displayName = 'StorageMetrics';

  // Added display name
  StorageMetrics.displayName = 'StorageMetrics';

  // Added display name
  StorageMetrics.displayName = 'StorageMetrics';

  // Added display name
  StorageMetrics.displayName = 'StorageMetrics';

  // Added display name
  StorageMetrics.displayName = 'StorageMetrics';


  // State hooks
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    availability: null,
    transactions: null,
    latency: null,
    capacity: null,
    ingress: null,
    egress: null
  });

  // Load metrics on component mount and when timeRange changes
  useEffect(() => {
    fetchMetrics(timeRange);
  }, [storageId, timeRange]);

  // Function to fetch metrics from the API
  const fetchMetrics = async (selectedTimeRange) => {
    if (!storageId) {
      setError('No Storage Account ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all metrics in parallel for efficiency
      const [availabilityData, transactionsData, latencyData, capacityData, ingressData, egressData] = await Promise.all([
        getStorageMetrics(storageId, 'availability', selectedTimeRange),
        getStorageMetrics(storageId, 'transactions', selectedTimeRange),
        getStorageMetrics(storageId, 'latency', selectedTimeRange),
        getStorageMetrics(storageId, 'capacity', selectedTimeRange),
        getStorageMetrics(storageId, 'ingress', selectedTimeRange),
        getStorageMetrics(storageId, 'egress', selectedTimeRange)
      ]);

      // Update state with fetched metrics
      setMetrics({
        availability: availabilityData,
        transactions: transactionsData,
        latency: latencyData,
        capacity: capacityData,
        ingress: ingressData,
        egress: egressData
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching Storage metrics:', err);
      setError('Failed to load Storage metrics. Please try again later.');
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
          {storageName ? `${storageName} Metrics` : 'Storage Account Metrics'}
        </Typography>
        <Typography variant="body2&quot; color="textSecondary">
          Azure Storage Account performance metrics and usage statistics
        </Typography>
      </MuiBox>

      <Grid container spacing={3}>
        {/* Availability Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Availability&quot;
            description="Percentage of successful requests to the storage account"
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

        {/* Transaction Count Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Transactions&quot;
            description="Number of requests made to the storage account"
            type="bar&quot;
            data={metrics.transactions}
            loading={loading && !metrics.transactions}
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

        {/* Capacity Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Capacity Usage&quot;
            description="Total storage capacity used in GB"
            type="line&quot;
            data={metrics.capacity}
            loading={loading && !metrics.capacity}
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

        {/* Ingress Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Ingress (Data In)&quot;
            description="Incoming data transfer in MB"
            type="line&quot;
            data={metrics.ingress}
            loading={loading && !metrics.ingress}
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

        {/* Egress Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Egress (Data Out)&quot;
            description="Outgoing data transfer in MB"
            type="line&quot;
            data={metrics.egress}
            loading={loading && !metrics.egress}
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

StorageMetrics.propTypes = {
  /** Azure Storage Account resource ID */
  storageId: PropTypes.string.isRequired,
  /** Optional display name for the Storage Account */
  storageName: PropTypes.string,
  /** Initial time range for metrics display */
  initialTimeRange: PropTypes.string
};

export default StorageMetrics;