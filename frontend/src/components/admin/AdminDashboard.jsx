/**
 * Admin Dashboard
 *
 * A comprehensive dashboard for administrators with metrics, status indicators,
 * and quick access to common administrative functions.
 * 
 * @component
 */

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Divider,
  Card,
  CardContent,
  CardHeader,
  CardActions,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  Avatar,
  Chip,
  IconButton,
  LinearProgress,
  CircularProgress,
  Tab,
  Tabs,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  useTheme,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  BarChart as BarChartIcon,
  PieChart as PieChartIcon,
  Timeline as TimelineIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  CheckCircle as CheckCircleIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  AccessTime as AccessTimeIcon,
  Refresh as RefreshIcon,
  Storage as StorageIcon,
  Apps as AppsIcon,
  Person as PersonIcon,
  Group as GroupIcon,
  Business as BusinessIcon,
  Sync as SyncIcon,
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Mock data visualization components (in a real app, you'd use a charting library)
const BarChart = ({ data, height = 200, ...props }) => (
  <Box {...props} sx={{ height }}>
    <svg width="100%" height="100%" viewBox="0 0 400 200">
      {data.map((value, index) => {
        const barHeight = (value / 100) * 150;
        return (
          <g key={index} transform={`translate(${50 + index * 70}, 0)`}>
            <rect
              y={170 - barHeight}
              width="40"
              height={barHeight}
              fill="#3f51b5"
              rx="4"
              opacity="0.7"
            />
            <text
              x="20"
              y="190"
              textAnchor="middle"
              fill="#666"
              fontSize="12"
            >
              {index + 1}
            </text>
          </g>
        );
      })}
    </svg>
  </Box>
);

BarChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
  height: PropTypes.number,
};

const PieChart = ({ data, height = 200, ...props }) => {
  const theme = useTheme();
  const colors = [
    theme.palette.primary.main,
    theme.palette.secondary.main,
    theme.palette.error.main,
    theme.palette.warning.main,
    theme.palette.success.main,
  ];
  
  // Calculate total for percentages
  const total = data.reduce((sum, value) => sum + value, 0);
  
  // Calculate segments
  let startAngle = 0;
  const segments = data.map((value, i) => {
    const percentage = value / total;
    const angle = percentage * 360;
    const segment = {
      startAngle,
      endAngle: startAngle + angle,
      color: colors[i % colors.length],
      value,
      percentage,
    };
    startAngle += angle;
    return segment;
  });
  
  return (
    <Box {...props} sx={{ height }}>
      <svg width="100%" height="100%" viewBox="0 0 200 200">
        <g transform="translate(100, 100)">
          {segments.map((segment, i) => {
            const startAngleRad = (segment.startAngle - 90) * (Math.PI / 180);
            const endAngleRad = (segment.endAngle - 90) * (Math.PI / 180);
            
            const x1 = Math.cos(startAngleRad) * 80;
            const y1 = Math.sin(startAngleRad) * 80;
            const x2 = Math.cos(endAngleRad) * 80;
            const y2 = Math.sin(endAngleRad) * 80;
            
            const largeArcFlag = segment.endAngle - segment.startAngle <= 180 ? "0" : "1";
            
            const d = [
              "M", 0, 0,
              "L", x1, y1,
              "A", 80, 80, 0, largeArcFlag, 1, x2, y2,
              "Z"
            ].join(" ");
            
            return (
              <path
                key={i}
                d={d}
                fill={segment.color}
                opacity="0.8"
              />
            );
          })}
        </g>
      </svg>
    </Box>
  );
};

PieChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
  height: PropTypes.number,
};

const LineChart = ({ data, height = 200, ...props }) => (
  <Box {...props} sx={{ height }}>
    <svg width="100%" height="100%" viewBox="0 0 400 200">
      <polyline
        points={data.map((value, index) => 
          `${50 + index * (300 / (data.length - 1))},${170 - (value / 100) * 150}`
        ).join(' ')}
        fill="none"
        stroke="#3f51b5"
        strokeWidth="3"
      />
      {data.map((value, index) => (
        <circle
          key={index}
          cx={50 + index * (300 / (data.length - 1))}
          cy={170 - (value / 100) * 150}
          r="4"
          fill="#3f51b5"
        />
      ))}
    </svg>
  </Box>
);

LineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number).isRequired,
  height: PropTypes.number,
};

/**
 * Admin Dashboard component
 *
 * @param {Object} props - Component props
 * @param {Object} props.user - Current user object
 * @param {Array} props.metrics - System metrics data
 * @param {Array} props.recentActivity - Recent system activity
 * @param {Function} props.onRefresh - Function to refresh dashboard data
 * @returns {JSX.Element} The AdminDashboard component
 */
const AdminDashboard = ({
  user,
  metrics = {
    applications: { total: 45, active: 32, draft: 13 },
    integrations: { total: 128, running: 98, failed: 5, stopped: 25 },
    users: { total: 87, active: 75, invited: 12 },
    tenants: { total: 12, active: 10, suspended: 2 },
    storage: { used: 128, total: 500, unit: 'GB' },
    performance: { cpu: 35, memory: 42, responseTime: 250 },
    activity: [60, 45, 70, 85, 65, 75, 90],
    errorRates: [5, 4, 3, 7, 2, 1, 3],
    applicationUsage: [30, 25, 15, 10, 20],
    integrationsHealth: { healthy: 75, warning: 18, error: 7 },
  },
  recentActivity = [
    {
      id: 'act1',
      type: 'user_login',
      user: 'John Doe',
      timestamp: '2025-03-30T09:45:32Z',
      details: 'Logged in from 192.168.1.1',
    },
    {
      id: 'act2',
      type: 'application_published',
      user: 'Jane Smith',
      timestamp: '2025-03-30T08:30:15Z',
      details: 'Published "Customer Data Integration" application',
    },
    {
      id: 'act3',
      type: 'integration_created',
      user: 'Mike Johnson',
      timestamp: '2025-03-30T07:15:42Z',
      details: 'Created "Sales Data Pipeline" integration',
    },
    {
      id: 'act4',
      type: 'dataset_created',
      user: 'Sarah Williams',
      timestamp: '2025-03-29T16:20:05Z',
      details: 'Created "Customer Analytics" dataset',
    },
    {
      id: 'act5',
      type: 'error_occurred',
      user: 'System',
      timestamp: '2025-03-29T14:35:18Z',
      details: 'Error in "Inventory Sync" integration: Connection timeout',
    },
  ],
  onRefresh,
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('7d');
  const [activeTab, setActiveTab] = useState(0);
  
  // Handle refresh button click
  const handleRefresh = () => {
    setIsLoading(true);
    
    // In a real app, this would call the onRefresh prop
    // For the mock, we'll just simulate a delay
    setTimeout(() => {
      if (onRefresh) {
        onRefresh();
      }
      setIsLoading(false);
    }, 1000);
  };
  
  // Format statistic with trend
  const StatWithTrend = ({ value, label, trend, unit = '' }) => (
    <Box sx={{ textAlign: 'center' }}>
      <Typography variant="h4" component="div" sx={{ fontWeight: 'medium' }}>
        {value}{unit}
      </Typography>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      {trend !== 0 && (
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {trend > 0 ? (
            <ArrowUpwardIcon
              fontSize="small"
              color="success"
              sx={{ fontSize: '0.8rem' }}
            />
          ) : (
            <ArrowDownwardIcon
              fontSize="small"
              color="error"
              sx={{ fontSize: '0.8rem' }}
            />
          )}
          <Typography
            variant="caption"
            color={trend > 0 ? 'success.main' : 'error.main'}
            sx={{ ml: 0.5 }}
          >
            {Math.abs(trend)}%
          </Typography>
        </Box>
      )}
    </Box>
  );

  StatWithTrend.propTypes = {
    value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    label: PropTypes.string.isRequired,
    trend: PropTypes.number.isRequired,
    unit: PropTypes.string,
  };

  // Status indicator component
  const StatusIndicator = ({ status, count }) => {
    let icon;
    let color;
    
    switch (status) {
      case 'healthy':
      case 'active':
      case 'running':
        icon = <CheckCircleIcon />;
        color = 'success';
        break;
      case 'warning':
        icon = <WarningIcon />;
        color = 'warning';
        break;
      case 'error':
      case 'failed':
        icon = <ErrorIcon />;
        color = 'error';
        break;
      default:
        icon = <AccessTimeIcon />;
        color = 'default';
    }
    
    return (
      <Chip
        icon={icon}
        label={`${status}: ${count}`}
        color={color}
        variant="outlined"
        size="small"
        sx={{ m: 0.5 }}
      />
    );
  };
  
  StatusIndicator.propTypes = {
    status: PropTypes.string.isRequired,
    count: PropTypes.number.isRequired,
  };

  // Format timestamp for recent activity
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Handle time range change
  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  // Get icon for activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case 'user_login':
        return <PersonIcon color="primary" />;
      case 'application_published':
        return <AppsIcon color="secondary" />;
      case 'integration_created':
        return <SyncIcon color="info" />;
      case 'dataset_created':
        return <StorageIcon color="success" />;
      case 'error_occurred':
        return <ErrorIcon color="error" />;
      default:
        return <AccessTimeIcon />;
    }
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      {/* Dashboard header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Admin Dashboard
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FormControl variant="outlined" size="small" sx={{ minWidth: 120, mr: 2 }}>
            <InputLabel id="time-range-label">Time Range</InputLabel>
            <Select
              labelId="time-range-label"
              id="time-range"
              value={timeRange}
              onChange={handleTimeRangeChange}
              label="Time Range"
            >
              <MenuItem value="24h">Last 24 Hours</MenuItem>
              <MenuItem value="7d">Last 7 Days</MenuItem>
              <MenuItem value="30d">Last 30 Days</MenuItem>
              <MenuItem value="90d">Last 90 Days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? 'Refreshing...' : 'Refresh'}
          </Button>
        </Box>
      </Box>

      {isLoading && (
        <LinearProgress sx={{ mb: 3 }} />
      )}

      {/* Quick stats row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <StatWithTrend 
              value={metrics.applications.total} 
              label="Total Applications" 
              trend={5} 
            />
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              <StatusIndicator status="active" count={metrics.applications.active} />
              <StatusIndicator status="draft" count={metrics.applications.draft} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <StatWithTrend 
              value={metrics.integrations.total} 
              label="Total Integrations" 
              trend={12} 
            />
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              <StatusIndicator status="running" count={metrics.integrations.running} />
              <StatusIndicator status="failed" count={metrics.integrations.failed} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <StatWithTrend 
              value={metrics.users.total} 
              label="Total Users" 
              trend={8} 
            />
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              <StatusIndicator status="active" count={metrics.users.active} />
              <StatusIndicator status="invited" count={metrics.users.invited} />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={{ p: 2, height: '100%' }}>
            <StatWithTrend 
              value={metrics.tenants.total} 
              label="Total Tenants" 
              trend={0} 
            />
            <Divider sx={{ my: 1.5 }} />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              <StatusIndicator status="active" count={metrics.tenants.active} />
              <StatusIndicator status="suspended" count={metrics.tenants.suspended} />
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Charts row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Integration Activity"
              subheader="Daily executions"
              action={
                <Tooltip title="More options">
                  <IconButton aria-label="settings">
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent>
              <LineChart data={metrics.activity} />
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button size="small" onClick={() => navigate('/admin/integrations')}>
                View Integrations
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Error Rates"
              subheader="Daily errors"
              action={
                <Tooltip title="More options">
                  <IconButton aria-label="settings">
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent>
              <BarChart data={metrics.errorRates} />
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button 
                size="small" 
                onClick={() => navigate('/admin/monitoring/errors')}
                color="error"
              >
                View Error Logs
              </Button>
            </CardActions>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardHeader
              title="Application Usage"
              subheader="By user count"
              action={
                <Tooltip title="More options">
                  <IconButton aria-label="settings">
                    <MoreVertIcon />
                  </IconButton>
                </Tooltip>
              }
            />
            <CardContent>
              <PieChart data={metrics.applicationUsage} />
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button 
                size="small" 
                onClick={() => navigate('/admin/applications')}
              >
                View Applications
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* System health row */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="System Health" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      CPU Usage
                    </Typography>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress
                        variant="determinate"
                        value={metrics.performance.cpu}
                        size={80}
                        thickness={4}
                        color={metrics.performance.cpu > 80 ? 'error' : metrics.performance.cpu > 60 ? 'warning' : 'success'}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          variant="caption"
                          component="div"
                          color="text.secondary"
                        >{`${Math.round(metrics.performance.cpu)}%`}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Memory Usage
                    </Typography>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress
                        variant="determinate"
                        value={metrics.performance.memory}
                        size={80}
                        thickness={4}
                        color={metrics.performance.memory > 80 ? 'error' : metrics.performance.memory > 60 ? 'warning' : 'success'}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          variant="caption"
                          component="div"
                          color="text.secondary"
                        >{`${Math.round(metrics.performance.memory)}%`}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Storage Usage
                    </Typography>
                    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
                      <CircularProgress
                        variant="determinate"
                        value={(metrics.storage.used / metrics.storage.total) * 100}
                        size={80}
                        thickness={4}
                        color={(metrics.storage.used / metrics.storage.total) > 0.8 ? 'error' : (metrics.storage.used / metrics.storage.total) > 0.6 ? 'warning' : 'success'}
                      />
                      <Box
                        sx={{
                          top: 0,
                          left: 0,
                          bottom: 0,
                          right: 0,
                          position: 'absolute',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Typography
                          variant="caption"
                          component="div"
                          color="text.secondary"
                        >{`${Math.round((metrics.storage.used / metrics.storage.total) * 100)}%`}</Typography>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              
              <Divider sx={{ my: 2 }} />
              
              <Typography variant="subtitle2" gutterBottom>
                Integration Status
              </Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', mb: 2 }}>
                <StatusIndicator status="healthy" count={metrics.integrationsHealth.healthy} />
                <StatusIndicator status="warning" count={metrics.integrationsHealth.warning} />
                <StatusIndicator status="error" count={metrics.integrationsHealth.error} />
              </Box>
              
              <Typography variant="subtitle2" gutterBottom>
                Response Time: <Chip label={`${metrics.performance.responseTime} ms`} size="small" />
              </Typography>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button size="small" onClick={() => navigate('/admin/monitoring/health')}>
                View System Health
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardHeader title="Recent Activity" />
            <CardContent sx={{ maxHeight: 350, overflow: 'auto' }}>
              <List disablePadding>
                {recentActivity.map((activity) => (
                  <ListItem key={activity.id} divider>
                    <ListItemAvatar>
                      <Avatar>{getActivityIcon(activity.type)}</Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={activity.details}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {activity.user}
                          </Typography>
                          {` - ${formatTimestamp(activity.timestamp)}`}
                        </>
                      }
                    />
                  </ListItem>
                ))}
              </List>
            </CardContent>
            <CardActions sx={{ justifyContent: 'flex-end' }}>
              <Button size="small" onClick={() => navigate('/admin/monitoring/audit')}>
                View Audit Logs
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Quick actions */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<AppsIcon />}
              onClick={() => navigate('/admin/applications/create')}
              sx={{ p: 1 }}
            >
              New App
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<StorageIcon />}
              onClick={() => navigate('/admin/datasets/create')}
              sx={{ p: 1 }}
            >
              New Dataset
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<PersonIcon />}
              onClick={() => navigate('/admin/users/invite')}
              sx={{ p: 1 }}
            >
              Invite User
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<BusinessIcon />}
              onClick={() => navigate('/admin/tenants/create')}
              sx={{ p: 1 }}
            >
              New Tenant
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<BarChartIcon />}
              onClick={() => navigate('/admin/monitoring/performance')}
              sx={{ p: 1 }}
            >
              View Reports
            </Button>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<ErrorIcon />}
              onClick={() => navigate('/admin/monitoring/errors')}
              sx={{ p: 1 }}
              color="error"
            >
              View Errors
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Alerts and notifications */}
      <Alert
        severity="warning"
        sx={{ mb: 3 }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => navigate('/admin/monitoring/errors')}
          >
            View
          </Button>
        }
      >
        5 integrations failed in the last 24 hours. Click to view details.
      </Alert>

      <Alert
        severity="info"
        sx={{ mb: 3 }}
        action={
          <Button
            color="inherit"
            size="small"
            onClick={() => navigate('/admin/users/invited')}
          >
            View
          </Button>
        }
      >
        12 user invitations are pending. Click to manage invitations.
      </Alert>
    </Box>
  );
};

AdminDashboard.propTypes = {
  user: PropTypes.object,
  metrics: PropTypes.shape({
    applications: PropTypes.shape({
      total: PropTypes.number.isRequired,
      active: PropTypes.number.isRequired,
      draft: PropTypes.number.isRequired,
    }),
    integrations: PropTypes.shape({
      total: PropTypes.number.isRequired,
      running: PropTypes.number.isRequired,
      failed: PropTypes.number.isRequired,
      stopped: PropTypes.number.isRequired,
    }),
    users: PropTypes.shape({
      total: PropTypes.number.isRequired,
      active: PropTypes.number.isRequired,
      invited: PropTypes.number.isRequired,
    }),
    tenants: PropTypes.shape({
      total: PropTypes.number.isRequired,
      active: PropTypes.number.isRequired,
      suspended: PropTypes.number.isRequired,
    }),
    storage: PropTypes.shape({
      used: PropTypes.number.isRequired,
      total: PropTypes.number.isRequired,
      unit: PropTypes.string.isRequired,
    }),
    performance: PropTypes.shape({
      cpu: PropTypes.number.isRequired,
      memory: PropTypes.number.isRequired,
      responseTime: PropTypes.number.isRequired,
    }),
    activity: PropTypes.arrayOf(PropTypes.number).isRequired,
    errorRates: PropTypes.arrayOf(PropTypes.number).isRequired,
    applicationUsage: PropTypes.arrayOf(PropTypes.number).isRequired,
    integrationsHealth: PropTypes.shape({
      healthy: PropTypes.number.isRequired,
      warning: PropTypes.number.isRequired,
      error: PropTypes.number.isRequired,
    }),
  }),
  recentActivity: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      user: PropTypes.string.isRequired,
      timestamp: PropTypes.string.isRequired,
      details: PropTypes.string.isRequired,
    })
  ),
  onRefresh: PropTypes.func,
};

export default AdminDashboard;