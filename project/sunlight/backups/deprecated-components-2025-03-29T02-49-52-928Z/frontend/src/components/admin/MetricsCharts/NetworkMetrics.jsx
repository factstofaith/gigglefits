// NetworkMetrics.jsx
// -----------------------------------------------------------------------------
// Component for displaying Azure Network metrics

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {MuiBox as MuiBox, Typography, Grid} from '@design-system/';
import MetricChart from '@components/common/MetricChart';
import { getNetworkMetrics } from '@services/azureMonitorService';
// Removed duplicate import

/**
 * Component for visualizing Azure Network metrics
 * 
 * Displays throughput, latency, packet loss, connection metrics,
 * and security events for network resources
 */
const NetworkMetrics = ({ 
  networkId, 
  networkName = '', 
  initialTimeRange = '24h' 
}) => {
  // Added display name
  NetworkMetrics.displayName = 'NetworkMetrics';

  // Added display name
  NetworkMetrics.displayName = 'NetworkMetrics';

  // Added display name
  NetworkMetrics.displayName = 'NetworkMetrics';

  // Added display name
  NetworkMetrics.displayName = 'NetworkMetrics';

  // Added display name
  NetworkMetrics.displayName = 'NetworkMetrics';


  // State hooks
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    throughput: null,
    latency: null,
    packetLoss: null,
    connections: null,
    securityEvents: null,
    dataTransfer: null
  });

  // Load metrics on component mount and when timeRange changes
  useEffect(() => {
    fetchMetrics(timeRange);
  }, [networkId, timeRange]);

  // Function to fetch metrics from the API
  const fetchMetrics = async (selectedTimeRange) => {
    if (!networkId) {
      setError('No Network resource ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch all metrics in parallel for efficiency
      const [throughputData, latencyData, packetLossData, connectionsData, securityEventsData, dataTransferData] = await Promise.all([
        getNetworkMetrics(networkId, 'throughput', selectedTimeRange),
        getNetworkMetrics(networkId, 'latency', selectedTimeRange),
        getNetworkMetrics(networkId, 'packetLoss', selectedTimeRange),
        getNetworkMetrics(networkId, 'connections', selectedTimeRange),
        getNetworkMetrics(networkId, 'securityEvents', selectedTimeRange),
        getNetworkMetrics(networkId, 'dataTransfer', selectedTimeRange)
      ]);

      // Update state with fetched metrics
      setMetrics({
        throughput: throughputData,
        latency: latencyData,
        packetLoss: packetLossData,
        connections: connectionsData,
        securityEvents: securityEventsData,
        dataTransfer: dataTransferData
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching Network metrics:', err);
      setError('Failed to load Network metrics. Please try again later.');
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
          {networkName ? `${networkName} Metrics` : 'Network Metrics'}
        </Typography>
        <Typography variant="body2&quot; color="textSecondary">
          Azure Network performance metrics and security statistics
        </Typography>
      </MuiBox>

      <Grid container spacing={3}>
        {/* Throughput Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Throughput&quot;
            description="Network throughput in Mbps"
            type="line&quot;
            data={metrics.throughput}
            loading={loading && !metrics.throughput}
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
            description="Network latency in milliseconds"
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

        {/* Packet Loss Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Packet Loss&quot;
            description="Percentage of packets lost during transmission"
            type="line&quot;
            data={metrics.packetLoss}
            loading={loading && !metrics.packetLoss}
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

        {/* Connections Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Active Connections&quot;
            description="Number of active network connections"
            type="line&quot;
            data={metrics.connections}
            loading={loading && !metrics.connections}
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

        {/* Security Events Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Security Events&quot;
            description="Network security events by category"
            type="bar&quot;
            data={metrics.securityEvents}
            loading={loading && !metrics.securityEvents}
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

        {/* Data Transfer Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Data Transfer&quot;
            description="Inbound and outbound data transfer in GB"
            type="bar&quot;
            data={metrics.dataTransfer}
            loading={loading && !metrics.dataTransfer}
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

NetworkMetrics.propTypes = {
  /** Azure Network resource ID */
  networkId: PropTypes.string.isRequired,
  /** Optional display name for the Network resource */
  networkName: PropTypes.string,
  /** Initial time range for metrics display */
  initialTimeRange: PropTypes.string
};

export default NetworkMetrics;