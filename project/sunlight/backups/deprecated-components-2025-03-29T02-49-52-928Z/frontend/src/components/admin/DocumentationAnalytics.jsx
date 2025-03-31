// DocumentationAnalytics.jsx
// -----------------------------------------------------------------------------
// Component for displaying and analyzing documentation usage statistics

import React, { useState, useEffect } from 'react';
// Import design system components through the adapter layer
import { 
  Box, 
  Typography, 
  Button, 
  Select, 
  CircularProgress, 
  Alert, 
  Card, 
  Table,
  useTheme as useDesignTheme 
} from '../../design-system/adapter';

// Still using Material UI components until fully migrated
import { CardContent, CardHeader, Divider, FormControl, FormControlLabel, Grid, InputLabel, MenuItem, Paper, Tab, Tabs, useTheme } from '../../design-system';

// Material UI icons for now
import {
  Refresh as RefreshIcon,
  Description as DocumentIcon,
  Search as SearchIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Feedback as FeedbackIcon,
} from '@mui/icons-material';

// Import chart library (React-ChartJS-2)
import { Bar, Pie, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, ArcElement, Title, Tooltip, Legend);

// Import documentation analytics service
import documentationAnalyticsService from '@services/documentationAnalyticsService';
import { useNotification } from '@hooks/useNotification';
// Design system import already exists;
// Removed duplicate import
// Removed duplicate import
// TabPanel component
const TabPanel = ({ children, value, index, ...other }) => {
  // Added display name
  TabPanel.displayName = 'TabPanel';

  // Added display name
  TabPanel.displayName = 'TabPanel';

  // Added display name
  TabPanel.displayName = 'TabPanel';

  // Added display name
  TabPanel.displayName = 'TabPanel';

  // Added display name
  TabPanel.displayName = 'TabPanel';


  return (
    <Box
      role="tabpanel&quot;
      hidden={value !== index}
      id={`analytics-tabpanel-${index}`}
      aria-labelledby={`analytics-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box paddingTop="lg">
          {children}
        </Box>
      )}
    </Box>
  );
};

const DocumentationAnalytics = () => {
  // Added display name
  DocumentationAnalytics.displayName = 'DocumentationAnalytics';

  // Added display name
  DocumentationAnalytics.displayName = 'DocumentationAnalytics';

  // Added display name
  DocumentationAnalytics.displayName = 'DocumentationAnalytics';

  // Added display name
  DocumentationAnalytics.displayName = 'DocumentationAnalytics';

  // Added display name
  DocumentationAnalytics.displayName = 'DocumentationAnalytics';


  // State variables
  const [activeTab, setActiveTab] = useState(0);
  const [timePeriod, setTimePeriod] = useState('week');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const [searchTerms, setSearchTerms] = useState([]);
  const [categoryUsage, setCategoryUsage] = useState([]);
  const [engagementMetrics, setEngagementMetrics] = useState(null);
  
  // Get notification context
  const { showToast } = useNotification();
  
  // Get theme
  const theme = useTheme();

  // Load data on component mount and when time period changes
  useEffect(() => {
    fetchData();
  }, [timePeriod]);

  // Main function to fetch all data
  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Use the new refreshAnalytics method to get all data in one call
      // This invalidates cache and fetches fresh data
      const analyticsData = await documentationAnalyticsService.refreshAnalytics(timePeriod);
      
      // Update state with the returned data
      setStats(analyticsData.stats);
      setSearchTerms(analyticsData.searchTerms);
      setCategoryUsage(analyticsData.categoryData);
      setEngagementMetrics(analyticsData.engagementData);
      
      // Show success toast for better UX
      showToast('Analytics data refreshed successfully', 'success', {
        title: 'Success',
        duration: 3000,
      });
    } catch (err) {
      console.error('Error fetching documentation analytics:', err);
      setError('Failed to load documentation analytics data. Please try again later.');
      showToast('Failed to load documentation analytics', 'error', {
        title: 'Error',
        duration: 5000,
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle time period change
  const handleTimePeriodChange = (event) => {
  // Added display name
  handleTimePeriodChange.displayName = 'handleTimePeriodChange';

  // Added display name
  handleTimePeriodChange.displayName = 'handleTimePeriodChange';

  // Added display name
  handleTimePeriodChange.displayName = 'handleTimePeriodChange';

  // Added display name
  handleTimePeriodChange.displayName = 'handleTimePeriodChange';

  // Added display name
  handleTimePeriodChange.displayName = 'handleTimePeriodChange';


    setTimePeriod(event.target.value);
  };

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

  // Format date for display
  const formatDate = (dateString) => {
  // Added display name
  formatDate.displayName = 'formatDate';

  // Added display name
  formatDate.displayName = 'formatDate';

  // Added display name
  formatDate.displayName = 'formatDate';

  // Added display name
  formatDate.displayName = 'formatDate';

  // Added display name
  formatDate.displayName = 'formatDate';


    if (!dateString) return 'N/A';
    
    const options = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Create colors for charts based on theme
  const getChartColors = () => {
  // Added display name
  getChartColors.displayName = 'getChartColors';

  // Added display name
  getChartColors.displayName = 'getChartColors';

  // Added display name
  getChartColors.displayName = 'getChartColors';

  // Added display name
  getChartColors.displayName = 'getChartColors';

  // Added display name
  getChartColors.displayName = 'getChartColors';


    // Use theme colors where available, otherwise fall back to default colors
    return {
      primary: theme.colors?.primary?.main || theme.palette.primary.main || '#1976d2',
      secondary: theme.colors?.secondary?.main || theme.palette.secondary.main || '#dc004e',
      error: theme.colors?.error?.main || theme.palette.error.main || '#f44336',
      warning: theme.colors?.warning?.main || theme.palette.warning.main || '#ff9800',
      info: theme.colors?.info?.main || theme.palette.info.main || '#2196f3',
      success: theme.colors?.success?.main || theme.palette.success.main || '#4caf50',
      background: theme.colors?.background?.paper || theme.palette.background.paper || '#ffffff',
      text: theme.colors?.text?.primary || theme.palette.text.primary || '#000000',
    };
  };
  
  const chartColors = getChartColors();
  
  // Prepare chart data for top documents
  const getTopDocumentsChartData = () => {
  // Added display name
  getTopDocumentsChartData.displayName = 'getTopDocumentsChartData';

  // Added display name
  getTopDocumentsChartData.displayName = 'getTopDocumentsChartData';

  // Added display name
  getTopDocumentsChartData.displayName = 'getTopDocumentsChartData';

  // Added display name
  getTopDocumentsChartData.displayName = 'getTopDocumentsChartData';

  // Added display name
  getTopDocumentsChartData.displayName = 'getTopDocumentsChartData';


    if (!stats || !stats.top_documents || stats.top_documents.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: chartColors.primary,
          },
        ],
      };
    }
    
    return {
      labels: stats.top_documents.map(doc => doc.title || doc.document_id),
      datasets: [
        {
          label: 'Views',
          data: stats.top_documents.map(doc => doc.views),
          backgroundColor: chartColors.primary,
          borderColor: chartColors.primary,
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Prepare chart data for top search terms
  const getSearchTermsChartData = () => {
  // Added display name
  getSearchTermsChartData.displayName = 'getSearchTermsChartData';

  // Added display name
  getSearchTermsChartData.displayName = 'getSearchTermsChartData';

  // Added display name
  getSearchTermsChartData.displayName = 'getSearchTermsChartData';

  // Added display name
  getSearchTermsChartData.displayName = 'getSearchTermsChartData';

  // Added display name
  getSearchTermsChartData.displayName = 'getSearchTermsChartData';


    if (!searchTerms || searchTerms.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: chartColors.secondary,
          },
        ],
      };
    }
    
    return {
      labels: searchTerms.map(term => term.term),
      datasets: [
        {
          label: 'Searches',
          data: searchTerms.map(term => term.count),
          backgroundColor: chartColors.secondary,
          borderColor: chartColors.secondary,
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Prepare chart data for feedback
  const getFeedbackChartData = () => {
  // Added display name
  getFeedbackChartData.displayName = 'getFeedbackChartData';

  // Added display name
  getFeedbackChartData.displayName = 'getFeedbackChartData';

  // Added display name
  getFeedbackChartData.displayName = 'getFeedbackChartData';

  // Added display name
  getFeedbackChartData.displayName = 'getFeedbackChartData';

  // Added display name
  getFeedbackChartData.displayName = 'getFeedbackChartData';


    if (!stats || !stats.feedback) {
      return {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
          },
        ],
      };
    }
    
    return {
      labels: ['Positive', 'Negative'],
      datasets: [
        {
          data: [stats.feedback.positive, stats.feedback.negative],
          backgroundColor: [chartColors.success, chartColors.error],
          borderColor: [chartColors.success, chartColors.error],
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Prepare chart data for category usage
  const getCategoryUsageChartData = () => {
  // Added display name
  getCategoryUsageChartData.displayName = 'getCategoryUsageChartData';

  // Added display name
  getCategoryUsageChartData.displayName = 'getCategoryUsageChartData';

  // Added display name
  getCategoryUsageChartData.displayName = 'getCategoryUsageChartData';

  // Added display name
  getCategoryUsageChartData.displayName = 'getCategoryUsageChartData';

  // Added display name
  getCategoryUsageChartData.displayName = 'getCategoryUsageChartData';


    if (!categoryUsage || categoryUsage.length === 0) {
      return {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: [],
          },
        ],
      };
    }
    
    // Create a color palette based on the number of categories
    const colorPalette = [
      chartColors.primary,
      chartColors.secondary,
      chartColors.error,
      chartColors.warning,
      chartColors.info,
      chartColors.success,
      '#8884d8',
      '#82ca9d',
      '#ffc658',
      '#ff8042',
    ];
    
    return {
      labels: categoryUsage.map(category => category.category),
      datasets: [
        {
          data: categoryUsage.map(category => category.views),
          backgroundColor: categoryUsage.map((_, index) => 
            colorPalette[index % colorPalette.length]
          ),
          borderWidth: 1,
        },
      ],
    };
  };
  
  // Create bar chart options with responsive design
  const getBarChartOptions = (title) => {
  // Added display name
  getBarChartOptions.displayName = 'getBarChartOptions';

  // Added display name
  getBarChartOptions.displayName = 'getBarChartOptions';

  // Added display name
  getBarChartOptions.displayName = 'getBarChartOptions';

  // Added display name
  getBarChartOptions.displayName = 'getBarChartOptions';

  // Added display name
  getBarChartOptions.displayName = 'getBarChartOptions';


    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: title,
          color: chartColors.text,
          font: {
            size: 16,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            color: chartColors.text,
          },
          grid: {
            display: true,
            color: 'rgba(0, 0, 0, 0.05)',
          },
        },
        x: {
          ticks: {
            color: chartColors.text,
            maxRotation: 45,
            minRotation: 45,
          },
          grid: {
            display: false,
          },
        },
      },
    };
  };
  
  // Create pie chart options with responsive design
  const getPieChartOptions = (title) => {
  // Added display name
  getPieChartOptions.displayName = 'getPieChartOptions';

  // Added display name
  getPieChartOptions.displayName = 'getPieChartOptions';

  // Added display name
  getPieChartOptions.displayName = 'getPieChartOptions';

  // Added display name
  getPieChartOptions.displayName = 'getPieChartOptions';

  // Added display name
  getPieChartOptions.displayName = 'getPieChartOptions';


    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: chartColors.text,
          },
        },
        title: {
          display: true,
          text: title,
          color: chartColors.text,
          font: {
            size: 16,
          },
        },
      },
    };
  };
  
  return (
    <Card>
      <CardHeader
        title="Documentation Analytics&quot;
        subheader={loading ? "Loading analytics data...' : stats ? `Data from ${formatDate(stats.start_date)} to ${formatDate(stats.end_date)}` : ''}
        action={
          <Box style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <FormControl style={{ minWidth: '120px' }}>
              <InputLabel id="time-period-label&quot;>Time Period</InputLabel>
              <Select
                labelId="time-period-label"
                id="time-period-select&quot;
                value={timePeriod}
                onChange={handleTimePeriodChange}
                label="Time Period"
              >
                <MenuItem value="day&quot;>Last 24 Hours</MenuItem>
                <MenuItem value="week">Last 7 Days</MenuItem>
                <MenuItem value="month&quot;>Last 30 Days</MenuItem>
                <MenuItem value="year">Last Year</MenuItem>
                <MenuItem value="all&quot;>All Time</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="outlined"
              startIcon={<RefreshIcon />}
              onClick={fetchData}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>
        }
      />
      
      <Divider />
      
      {/* Error Alert */}
      {error && (
        <Box padding="lg&quot;>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}
      
      {/* Loading Indicator */}
      {loading && (
        <Box
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '64px 0',
          }}
        >
          <CircularProgress />
        </Box>
      )}
      
      {/* Analytics Content */}
      {!loading && !error && stats && (
        <>
          {/* Overview Cards */}
          <Box padding="md&quot;>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  style={{
                    padding: "16px',
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h5&quot; color="primary">{stats.total_views}</Typography>
                  <Typography variant="body2&quot;>Total Views</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  style={{
                    padding: "16px',
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h5&quot; color="primary">{stats.unique_documents}</Typography>
                  <Typography variant="body2&quot;>Unique Documents</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  style={{
                    padding: "16px',
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h5&quot; color="primary">{stats.unique_users}</Typography>
                  <Typography variant="body2&quot;>Unique Users</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Paper
                  style={{
                    padding: "16px',
                    textAlign: 'center',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Typography variant="h5&quot; color="primary">
                    {stats.feedback.positive + stats.feedback.negative > 0
                      ? `${Math.round((stats.feedback.positive / (stats.feedback.positive + stats.feedback.negative)) * 100)}%`
                      : 'N/A'}
                  </Typography>
                  <Typography variant="body2&quot;>Positive Feedback</Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
          
          {/* Tabs for different analytics views */}
          <Box>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="documentation analytics tabs"
              centered
            >
              <Tab 
                label="Popular Documents&quot; 
                icon={<DocumentIcon />} 
                id="analytics-tab-0"
                aria-controls="analytics-tabpanel-0"
              />
              <Tab 
                label="Search Terms&quot; 
                icon={<SearchIcon />}
                id="analytics-tab-1"
                aria-controls="analytics-tabpanel-1"
              />
              <Tab 
                label="User Engagement&quot; 
                icon={<PeopleIcon />}
                id="analytics-tab-2"
                aria-controls="analytics-tabpanel-2"
              />
              <Tab 
                label="Categories&quot; 
                icon={<CategoryIcon />}
                id="analytics-tab-3"
                aria-controls="analytics-tabpanel-3"
              />
              <Tab 
                label="Feedback&quot; 
                icon={<FeedbackIcon />}
                id="analytics-tab-4"
                aria-controls="analytics-tabpanel-4"
              />
            </Tabs>
            
            {/* Popular Documents Tab */}
            <TabPanel value={activeTab} index={0}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <Paper style={{ padding: '16px', height: '400px' }}>
                    <Bar 
                      data={getTopDocumentsChartData()} 
                      options={getBarChartOptions('Top 10 Most Viewed Documents')}
                      height={360}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Paper style={{ padding: '16px', height: '400px', overflowY: 'auto' }}>
                    <Typography variant="h6&quot; gutterBottom>
                      Most Viewed Documents
                    </Typography>
                    <Table>
                      <Table.Head>
                        <Table.Row>
                          <Table.Cell>Document</Table.Cell>
                          <Table.Cell align="right">Views</Table.Cell>
                        </Table.Row>
                      </Table.Head>
                      <Table.Body>
                        {stats.top_documents.map((doc) => (
                          <Table.Row key={doc.document_id}>
                            <Table.Cell>{doc.title || doc.document_id}</Table.Cell>
                            <Table.Cell align="right&quot;>{doc.views}</Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Search Terms Tab */}
            <TabPanel value={activeTab} index={1}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <Paper style={{ padding: "16px', height: '400px' }}>
                    <Bar 
                      data={getSearchTermsChartData()} 
                      options={getBarChartOptions('Top Search Terms')}
                      height={360}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Paper style={{ padding: '16px', height: '400px', overflowY: 'auto' }}>
                    <Typography variant="h6&quot; gutterBottom>
                      Popular Search Terms
                    </Typography>
                    <Table>
                      <Table.Head>
                        <Table.Row>
                          <Table.Cell>Term</Table.Cell>
                          <Table.Cell align="right">Searches</Table.Cell>
                        </Table.Row>
                      </Table.Head>
                      <Table.Body>
                        {searchTerms.map((term) => (
                          <Table.Row key={term.term}>
                            <Table.Cell>{term.term}</Table.Cell>
                            <Table.Cell align="right&quot;>{term.count}</Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* User Engagement Tab */}
            <TabPanel value={activeTab} index={2}>
              {engagementMetrics && (
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6} lg={4}>
                    <Paper style={{ padding: "16px' }}>
                      <Typography variant="h6&quot; gutterBottom>
                        User Engagement
                      </Typography>
                      <Typography variant="body2">
                        Average Session Duration: {Math.floor(engagementMetrics.average_session_duration / 60)}m {engagementMetrics.average_session_duration % 60}s
                      </Typography>
                      <Typography variant="body2&quot;>
                        Average Pages Per Session: {engagementMetrics.average_pages_per_session.toFixed(1)}
                      </Typography>
                      <Typography variant="body2">
                        Bounce Rate: {(engagementMetrics.bounce_rate * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="body2&quot;>
                        Returning Users: {engagementMetrics.returning_users}
                      </Typography>
                      <Typography variant="body2">
                        New Users: {engagementMetrics.new_users}
                      </Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6} lg={4}>
                    <Paper style={{ padding: '16px', height: '300px' }}>
                      <Typography variant="h6&quot; gutterBottom>
                        Device Breakdown
                      </Typography>
                      <Pie 
                        data={{
                          labels: Object.keys(engagementMetrics.device_breakdown),
                          datasets: [{
                            data: Object.values(engagementMetrics.device_breakdown),
                            backgroundColor: [
                              chartColors.primary,
                              chartColors.secondary,
                              chartColors.error,
                            ],
                          }]
                        }} 
                        options={getPieChartOptions("')}
                        height={240}
                      />
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6} lg={4}>
                    <Paper style={{ padding: '16px', height: '300px' }}>
                      <Typography variant="h6&quot; gutterBottom>
                        Browser Breakdown
                      </Typography>
                      <Pie 
                        data={{
                          labels: Object.keys(engagementMetrics.browser_breakdown),
                          datasets: [{
                            data: Object.values(engagementMetrics.browser_breakdown),
                            backgroundColor: [
                              chartColors.primary,
                              chartColors.secondary,
                              chartColors.warning,
                              chartColors.info,
                              chartColors.error,
                            ],
                          }]
                        }} 
                        options={getPieChartOptions("')}
                        height={240}
                      />
                    </Paper>
                  </Grid>
                </Grid>
              )}
            </TabPanel>
            
            {/* Categories Tab */}
            <TabPanel value={activeTab} index={3}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={7}>
                  <Paper style={{ padding: '16px', height: '400px' }}>
                    <Pie 
                      data={getCategoryUsageChartData()} 
                      options={getPieChartOptions('Documentation Views by Category')}
                      height={360}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={5}>
                  <Paper style={{ padding: '16px', height: '400px', overflowY: 'auto' }}>
                    <Typography variant="h6&quot; gutterBottom>
                      Category Engagement
                    </Typography>
                    <Table>
                      <Table.Head>
                        <Table.Row>
                          <Table.Cell>Category</Table.Cell>
                          <Table.Cell align="right">Views</Table.Cell>
                          <Table.Cell align="right&quot;>Documents</Table.Cell>
                        </Table.Row>
                      </Table.Head>
                      <Table.Body>
                        {categoryUsage.map((category) => (
                          <Table.Row key={category.category}>
                            <Table.Cell>{category.category}</Table.Cell>
                            <Table.Cell align="right">{category.views}</Table.Cell>
                            <Table.Cell align="right&quot;>{category.documents}</Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>
            
            {/* Feedback Tab */}
            <TabPanel value={activeTab} index={4}>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper style={{ padding: "16px', height: '400px' }}>
                    <Pie 
                      data={getFeedbackChartData()} 
                      options={getPieChartOptions('Documentation Feedback')}
                      height={360}
                    />
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper style={{ padding: '16px', height: '400px' }}>
                    <Typography variant="h6&quot; gutterBottom>
                      Feedback Summary
                    </Typography>
                    <Box marginBottom="16px">
                      <Typography variant="body1&quot;>
                        Total Feedback Responses: {stats.feedback.positive + stats.feedback.negative}
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Paper 
                          elevation={0}
                          style={{ 
                            padding: "16px', 
                            textAlign: 'center', 
                            backgroundColor: chartColors.success,
                            color: 'white'
                          }}
                        >
                          <Typography variant="h4&quot;>{stats.feedback.positive}</Typography>
                          <Typography variant="body2">Positive Feedback</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6}>
                        <Paper 
                          elevation={0}
                          style={{ 
                            padding: '16px', 
                            textAlign: 'center', 
                            backgroundColor: chartColors.error,
                            color: 'white'
                          }}
                        >
                          <Typography variant="h4&quot;>{stats.feedback.negative}</Typography>
                          <Typography variant="body2">Negative Feedback</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                    <Box marginTop="24px&quot;>
                      <Typography variant="body1">
                        Satisfaction Rate: {stats.feedback.positive + stats.feedback.negative > 0
                          ? `${Math.round((stats.feedback.positive / (stats.feedback.positive + stats.feedback.negative)) * 100)}%`
                          : 'N/A'}
                      </Typography>
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </TabPanel>
          </Box>
        </>
      )}
    </Card>
  );
};

export default DocumentationAnalytics;