// DocumentationMetrics.jsx
// -----------------------------------------------------------------------------
// Component for displaying documentation usage metrics

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Box, Typography, Grid } from '@design-system/';
import MetricChart from '@components/common/MetricChart';
import { 
import { Box } from '../../design-system';
// Design system import already exists;
;
  getDocumentationStats, 
  getTopSearchTerms, 
  getUserEngagementMetrics,
  getUsageByCategory
} from '@services/documentationAnalyticsService';

/**
 * Component for visualizing documentation usage metrics
 * 
 * Displays page views, unique visitors, popular documents,
 * search terms, and user engagement metrics
 */
const DocumentationMetrics = ({ 
  initialTimeRange = 'week'
}) => {
  // Added display name
  DocumentationMetrics.displayName = 'DocumentationMetrics';

  // Added display name
  DocumentationMetrics.displayName = 'DocumentationMetrics';

  // Added display name
  DocumentationMetrics.displayName = 'DocumentationMetrics';

  // Added display name
  DocumentationMetrics.displayName = 'DocumentationMetrics';

  // Added display name
  DocumentationMetrics.displayName = 'DocumentationMetrics';


  // State hooks
  const [timeRange, setTimeRange] = useState(initialTimeRange);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState({
    stats: null,
    searchTerms: null,
    engagementMetrics: null,
    categoryUsage: null
  });

  // Load metrics on component mount and when timeRange changes
  useEffect(() => {
    fetchMetrics(timeRange);
  }, [timeRange]);

  // Function to fetch metrics from the API
  const fetchMetrics = async (selectedTimeRange) => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all metrics in parallel for efficiency
      const [stats, searchTerms, engagementMetrics, categoryUsage] = await Promise.all([
        getDocumentationStats(selectedTimeRange),
        getTopSearchTerms(selectedTimeRange),
        getUserEngagementMetrics(selectedTimeRange),
        getUsageByCategory(selectedTimeRange)
      ]);

      // Update state with fetched metrics
      setMetrics({
        stats,
        searchTerms,
        engagementMetrics,
        categoryUsage
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching Documentation metrics:', err);
      setError('Failed to load Documentation metrics. Please try again later.');
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
      a.download = '${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv';
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
      a.download = '${title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  // Prepare chart data for document views
  const prepareDocumentViewsData = () => {
  // Added display name
  prepareDocumentViewsData.displayName = 'prepareDocumentViewsData';

  // Added display name
  prepareDocumentViewsData.displayName = 'prepareDocumentViewsData';

  // Added display name
  prepareDocumentViewsData.displayName = 'prepareDocumentViewsData';

  // Added display name
  prepareDocumentViewsData.displayName = 'prepareDocumentViewsData';

  // Added display name
  prepareDocumentViewsData.displayName = 'prepareDocumentViewsData';


    if (!metrics.stats || !metrics.stats.top_documents) {
      return null;
    }
    
    return {
      labels: metrics.stats.top_documents.map(doc => doc.title || doc.document_id),
      datasets: [
        {
          label: 'Views',
          data: metrics.stats.top_documents.map(doc => doc.views),
          backgroundColor: '#1976d2',
          borderColor: '#1976d2',
        }
      ]
    };
  };

  // Prepare chart data for search terms
  const prepareSearchTermsData = () => {
  // Added display name
  prepareSearchTermsData.displayName = 'prepareSearchTermsData';

  // Added display name
  prepareSearchTermsData.displayName = 'prepareSearchTermsData';

  // Added display name
  prepareSearchTermsData.displayName = 'prepareSearchTermsData';

  // Added display name
  prepareSearchTermsData.displayName = 'prepareSearchTermsData';

  // Added display name
  prepareSearchTermsData.displayName = 'prepareSearchTermsData';


    if (!metrics.searchTerms) {
      return null;
    }
    
    return {
      labels: metrics.searchTerms.map(term => term.term),
      datasets: [
        {
          label: 'Search Count',
          data: metrics.searchTerms.map(term => term.count),
          backgroundColor: '#ff9800',
          borderColor: '#ff9800',
        }
      ]
    };
  };

  // Prepare chart data for feedback
  const prepareFeedbackData = () => {
  // Added display name
  prepareFeedbackData.displayName = 'prepareFeedbackData';

  // Added display name
  prepareFeedbackData.displayName = 'prepareFeedbackData';

  // Added display name
  prepareFeedbackData.displayName = 'prepareFeedbackData';

  // Added display name
  prepareFeedbackData.displayName = 'prepareFeedbackData';

  // Added display name
  prepareFeedbackData.displayName = 'prepareFeedbackData';


    if (!metrics.stats || !metrics.stats.feedback) {
      return null;
    }
    
    return {
      labels: ['Positive', 'Negative'],
      datasets: [
        {
          data: [
            metrics.stats.feedback.positive,
            metrics.stats.feedback.negative
          ],
          backgroundColor: ['#4caf50', '#f44336'],
          borderColor: ['#4caf50', '#f44336'],
        }
      ]
    };
  };

  // Prepare chart data for category usage
  const prepareCategoryUsageData = () => {
  // Added display name
  prepareCategoryUsageData.displayName = 'prepareCategoryUsageData';

  // Added display name
  prepareCategoryUsageData.displayName = 'prepareCategoryUsageData';

  // Added display name
  prepareCategoryUsageData.displayName = 'prepareCategoryUsageData';

  // Added display name
  prepareCategoryUsageData.displayName = 'prepareCategoryUsageData';

  // Added display name
  prepareCategoryUsageData.displayName = 'prepareCategoryUsageData';


    if (!metrics.categoryUsage) {
      return null;
    }
    
    return {
      labels: metrics.categoryUsage.map(category => category.category),
      datasets: [
        {
          label: 'Views',
          data: metrics.categoryUsage.map(category => category.views),
          backgroundColor: [
            '#1976d2',
            '#dc004e',
            '#ff9800',
            '#4caf50',
            '#9c27b0',
            '#00bcd4',
            '#f44336',
            '#ff5722'
          ],
        }
      ]
    };
  };

  // Prepare chart data for device breakdown
  const prepareDeviceBreakdownData = () => {
  // Added display name
  prepareDeviceBreakdownData.displayName = 'prepareDeviceBreakdownData';

  // Added display name
  prepareDeviceBreakdownData.displayName = 'prepareDeviceBreakdownData';

  // Added display name
  prepareDeviceBreakdownData.displayName = 'prepareDeviceBreakdownData';

  // Added display name
  prepareDeviceBreakdownData.displayName = 'prepareDeviceBreakdownData';

  // Added display name
  prepareDeviceBreakdownData.displayName = 'prepareDeviceBreakdownData';


    if (!metrics.engagementMetrics || !metrics.engagementMetrics.device_breakdown) {
      return null;
    }
    
    const devices = metrics.engagementMetrics.device_breakdown;
    
    return {
      labels: Object.keys(devices).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
      datasets: [
        {
          data: Object.values(devices),
          backgroundColor: ['#1976d2', '#ff9800', '#4caf50'],
          borderColor: ['#1976d2', '#ff9800', '#4caf50'],
        }
      ]
    };
  };

  // Prepare chart data for browser breakdown
  const prepareBrowserBreakdownData = () => {
  // Added display name
  prepareBrowserBreakdownData.displayName = 'prepareBrowserBreakdownData';

  // Added display name
  prepareBrowserBreakdownData.displayName = 'prepareBrowserBreakdownData';

  // Added display name
  prepareBrowserBreakdownData.displayName = 'prepareBrowserBreakdownData';

  // Added display name
  prepareBrowserBreakdownData.displayName = 'prepareBrowserBreakdownData';

  // Added display name
  prepareBrowserBreakdownData.displayName = 'prepareBrowserBreakdownData';


    if (!metrics.engagementMetrics || !metrics.engagementMetrics.browser_breakdown) {
      return null;
    }
    
    const browsers = metrics.engagementMetrics.browser_breakdown;
    
    return {
      labels: Object.keys(browsers).map(key => key.charAt(0).toUpperCase() + key.slice(1)),
      datasets: [
        {
          data: Object.values(browsers),
          backgroundColor: ['#1976d2', '#ff9800', '#4caf50', '#dc004e', '#9c27b0'],
          borderColor: ['#1976d2', '#ff9800', '#4caf50', '#dc004e', '#9c27b0'],
        }
      ]
    };
  };

  return (
    <Box>
      <Box marginBottom="md&quot;>
        <Typography variant="h5">
          Documentation Usage Analytics
        </Typography>
        <Typography variant="body2&quot; color="textSecondary">
          Documentation usage statistics and engagement metrics
        </Typography>
      </Box>

      {/* Stats Summary */}
      {metrics.stats && !loading && !error && (
        <Box marginBottom="lg&quot;>
          <Grid container spacing={3}>
            <Grid item xs={6} sm={3}>
              <Box 
                padding="md" 
                borderRadius="sm&quot; 
                boxShadow="0 1px 3px rgba(0,0,0,0.1)"
                bgcolor="white&quot;
                textAlign="center"
              >
                <Typography variant="h3&quot; color="primary">
                  {metrics.stats.total_views}
                </Typography>
                <Typography variant="body2&quot; color="textSecondary">
                  Total Views
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box 
                padding="md&quot; 
                borderRadius="sm" 
                boxShadow="0 1px 3px rgba(0,0,0,0.1)&quot;
                bgcolor="white"
                textAlign="center&quot;
              >
                <Typography variant="h3" color="primary&quot;>
                  {metrics.stats.unique_documents}
                </Typography>
                <Typography variant="body2" color="textSecondary&quot;>
                  Unique Documents
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box 
                padding="md" 
                borderRadius="sm&quot; 
                boxShadow="0 1px 3px rgba(0,0,0,0.1)"
                bgcolor="white&quot;
                textAlign="center"
              >
                <Typography variant="h3&quot; color="primary">
                  {metrics.stats.unique_users}
                </Typography>
                <Typography variant="body2&quot; color="textSecondary">
                  Unique Users
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box 
                padding="md&quot; 
                borderRadius="sm" 
                boxShadow="0 1px 3px rgba(0,0,0,0.1)&quot;
                bgcolor="white"
                textAlign="center&quot;
              >
                <Typography variant="h3" color="primary&quot;>
                  {metrics.stats.anonymous_views}
                </Typography>
                <Typography variant="body2" color="textSecondary&quot;>
                  Anonymous Views
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Box>
      )}

      <Grid container spacing={3}>
        {/* Popular Documents Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Popular Documents"
            description="Most viewed documentation pages&quot;
            type="bar"
            data={prepareDocumentViewsData()}
            loading={loading && !metrics.stats}
            error={error}
            height={300}
            refreshCallback={refreshMetrics}
            timeRanges={['day', 'week', 'month', 'year', 'all']}
            initialTimeRange={timeRange}
            downloadOptions={['PNG', 'CSV', 'JSON']}
            onDownload={handleDownload}
            allowTypeChange={true}
          />
        </Grid>

        {/* Search Terms Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Top Search Terms&quot;
            description="Most frequently used search terms"
            type="bar&quot;
            data={prepareSearchTermsData()}
            loading={loading && !metrics.searchTerms}
            error={error}
            height={300}
            refreshCallback={refreshMetrics}
            timeRanges={["day', 'week', 'month', 'year', 'all']}
            initialTimeRange={timeRange}
            downloadOptions={['PNG', 'CSV', 'JSON']}
            onDownload={handleDownload}
            allowTypeChange={true}
          />
        </Grid>

        {/* Category Usage Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Documentation by Category&quot;
            description="Views distribution across documentation categories"
            type="pie&quot;
            data={prepareCategoryUsageData()}
            loading={loading && !metrics.categoryUsage}
            error={error}
            height={300}
            refreshCallback={refreshMetrics}
            timeRanges={["day', 'week', 'month', 'year', 'all']}
            initialTimeRange={timeRange}
            downloadOptions={['PNG', 'CSV', 'JSON']}
            onDownload={handleDownload}
            allowTypeChange={true}
          />
        </Grid>

        {/* Feedback Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Documentation Feedback&quot;
            description="User feedback on documentation helpfulness"
            type="pie&quot;
            data={prepareFeedbackData()}
            loading={loading && !metrics.stats}
            error={error}
            height={300}
            refreshCallback={refreshMetrics}
            timeRanges={["day', 'week', 'month', 'year', 'all']}
            initialTimeRange={timeRange}
            downloadOptions={['PNG', 'CSV', 'JSON']}
            onDownload={handleDownload}
            allowTypeChange={true}
          />
        </Grid>

        {/* Device Breakdown Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Device Breakdown&quot;
            description="Documentation access by device type"
            type="doughnut&quot;
            data={prepareDeviceBreakdownData()}
            loading={loading && !metrics.engagementMetrics}
            error={error}
            height={300}
            refreshCallback={refreshMetrics}
            timeRanges={["day', 'week', 'month', 'year', 'all']}
            initialTimeRange={timeRange}
            downloadOptions={['PNG', 'CSV', 'JSON']}
            onDownload={handleDownload}
            allowTypeChange={true}
          />
        </Grid>

        {/* Browser Breakdown Chart */}
        <Grid item xs={12} md={6}>
          <MetricChart
            title="Browser Breakdown&quot;
            description="Documentation access by browser type"
            type="doughnut&quot;
            data={prepareBrowserBreakdownData()}
            loading={loading && !metrics.engagementMetrics}
            error={error}
            height={300}
            refreshCallback={refreshMetrics}
            timeRanges={["day', 'week', 'month', 'year', 'all']}
            initialTimeRange={timeRange}
            downloadOptions={['PNG', 'CSV', 'JSON']}
            onDownload={handleDownload}
            allowTypeChange={true}
          />
        </Grid>
      </Grid>
    </Box>
  );
};

DocumentationMetrics.propTypes = {
  /** Initial time range for metrics display */
  initialTimeRange: PropTypes.string
};

export default DocumentationMetrics;